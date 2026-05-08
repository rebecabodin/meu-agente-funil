import streamlit as st
import os
import pandas as pd
import re
import altair as alt
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass
from data_utils import load_data, normalize_phone, parse_currency, calcular_metricas_grupo
from agent import analisar_funil, extrair_periodo

# Page Configuration
st.set_page_config(
    page_title="Dashboard Estrategista | Mundo dos Elétricos",
    page_icon="⚡",
    layout="wide"
)

# Hide Sidebar (RESTORING ORIGINAL UI)
st.markdown("""
    <style>
        [data-testid="stSidebar"] { display: none; }
        .main { background-color: #000000; }
        h1, h2, h3 { margin-bottom: 10px !important; }
        hr { margin-top: 20px !important; margin-bottom: 20px !important; }
    </style>
""", unsafe_allow_html=True)





def main():
    # Header Section
    col_title, col_btn = st.columns([4, 1])
    with col_title:
        st.title("⚡ IMERSÃO PRÁTICA MUNDO DOS ELÉTRICOS")
    with col_btn:
        st.markdown("<div style='height: 22px;'></div>", unsafe_allow_html=True)
        if st.button("🔄 Atualizar Dados agora", use_container_width=True):
            st.cache_data.clear()
            st.rerun()
    
    st.markdown("---")
    st.markdown("<div style='height: 40px;'></div>", unsafe_allow_html=True)

    with st.spinner("Sincronizando dados..."):
        df_compra, df_grupos, df_recup = load_data()
        
    if df_compra.empty:
        st.error("Erro ao carregar dados.")
        return

    # --- DATA PROCESSING & DEDUPLICATION ---
    df_compra['TEL_NORM'] = df_compra['TELEFONE'].apply(normalize_phone)
    df_grupos['TEL_NORM'] = df_grupos['TELEFONE'].apply(normalize_phone)
    df_recup['TEL_NORM'] = df_recup['TELEFONE'].apply(normalize_phone)
    
    # Guardar versão RAW da recuperação (espelho fiel do Excel, 132 linhas)
    # Usada no Acompanhamento de Envios para refletir os status da coluna H
    df_recup_raw = df_recup.copy()
    
    # Regra de Ouro: Desconsiderar duplicados para CÁLCULOS e CRUZAMENTOS
    df_compra = df_compra.drop_duplicates(subset=['TEL_NORM', 'NOME'], keep='first')
    df_recup = df_recup.drop_duplicates(subset=['TEL_NORM', 'NOME'], keep='first')
    df_grupos = df_grupos.drop_duplicates(subset=['TEL_NORM'], keep='first')
    
    total_vendas = len(df_compra)
    col_valor = 'Valor oferta' if 'Valor oferta' in df_compra.columns else 'GROSS PRICE'
    faturamento = df_compra[col_valor].apply(parse_currency).sum() if col_valor in df_compra.columns else 0.0
    
    # Identificar quem já comprou para cruzamento (Telefone, Nome e Email)
    bought_phones = set(df_compra[df_compra['TEL_NORM'] != '']['TEL_NORM'])
    bought_names = set(df_compra['NOME'].str.lower().str.strip().unique())
    bought_emails = set(df_compra['EMAIL'].str.lower().str.strip().unique()) if 'EMAIL' in df_compra.columns else set()
    
    # Venda Recuperada: Alunos que estão na aba de Recuperação E na aba de Compras
    mask_rec_is_bought = (df_recup['TEL_NORM'].isin(bought_phones)) | \
                         (df_recup['NOME'].str.lower().str.strip().isin(bought_names)) | \
                         (df_recup['EMAIL'].str.lower().str.strip().isin(bought_emails) if 'EMAIL' in df_recup.columns else False)
    
    vendas_recuperadas_count = len(df_recup[mask_rec_is_bought])
    
    # Oportunidades: Quem está na recuperação mas NÃO comprou ainda por nenhum critério
    recuperacao_pendentes = df_recup[~mask_rec_is_bought].copy()
    
    X_sales = len(recuperacao_pendentes)
    Y_sales = len(recuperacao_pendentes[recuperacao_pendentes['TELEFONE'].str.strip() != ""])
    Z_sales = X_sales - Y_sales

    # Delegação da Lógica de Cruzamento Core para data_utils
    entered_phones, df_valid_compra, df_in_group, onboarding_pendentes = calcular_metricas_grupo(df_compra, df_grupos)
    
    # 1. KPIs Section
    c1, c2, c3, c4 = st.columns(4)
    c1.metric("💵 Faturamento Total", f"R$ {faturamento:,.2f}".replace(",", "X").replace(".", ",").replace("X", "."))
    c2.metric("✅ Vendas Aprovadas", f"{total_vendas}")
    with c3:
        st.metric("🎯 Oportunidades de Venda", f"{X_sales}")
        st.caption(f"Dos {X_sales} leads, {Y_sales} via WhatsApp | {Z_sales} via E-mail")
    c4.metric("💰 Vendas Recuperadas", f"{vendas_recuperadas_count}")
    
    st.markdown("""
        <style>
        [data-testid="stMetric"]:nth-child(4) label { color: #00FF00 !important; }
        [data-testid="stMetric"]:nth-child(4) [data-testid="stMetricValue"] { color: #00FF00 !important; }
        </style>
    """, unsafe_allow_html=True)

    st.markdown("---")

    # 2. Shipping Tracking Section
    st.subheader("💬 Acompanhamento de Envios")
    l_log, r_log = st.columns(2)
    
    with l_log:
        st.markdown("**📈 Compra Aprovada**")
        if 'Status Mensagem' in df_compra.columns:
            stats_c = df_compra['Status Mensagem'].str.lower().str.strip()
            # ✅ Enviados: Status exato 'enviado'
            enviados = len(df_compra[stats_c == 'enviado'])
            # 🚫 Sem Tel: Telefone vazio OU erro de telefone incorreto
            mask_sem_tel = (df_compra['TELEFONE'].str.strip().replace('', pd.NA).isna()) | (stats_c.str.contains('telefone incorreto', na=False))
            sem_tel_compra = len(df_compra[mask_sem_tel])
            # ⏳ Pendentes: Apenas quando o status está vazio
            pendentes_compra = len(df_compra[stats_c == ''])
            
            st.write(f"Total: **{total_vendas}** | ✅ Enviados: <span style='color:#FFD700'>{enviados}</span> | 🚫 Sem Tel/Inválido: <span style='color:#FFD700'>{sem_tel_compra}</span> | ⏳ Pendentes: <span style='color:#FFD700'>{pendentes_compra}</span>", unsafe_allow_html=True)
            
    with r_log:
        st.markdown("**📈 Recuperação de Vendas**")
        
        col_status_rec = 'STATUS PÓS AUTOMAÇÃO'
        # Usar df_recup_raw (132 linhas) = espelho fiel do Excel
        total_rec = len(df_recup_raw)
        
        if col_status_rec in df_recup_raw.columns:
            status_col = df_recup_raw[col_status_rec].fillna('').str.strip()
            
            # ✅ Enviados: 'Mensagem Enviada' + 'Comprou' (com/sem espaço)
            env_rec = len(df_recup_raw[
                status_col.str.lower().str.strip().isin(['mensagem enviada', 'comprou'])
            ])
            
            # 🚫 Sem Tel: Status 'Sem telefone para contato'
            sem_tel = len(df_recup_raw[status_col.str.lower() == 'sem telefone para contato'])
            
            # 🔄 Repetidos/Duplicados: 'Número Repetido' ou 'Duplicado'
            repetidos = len(df_recup_raw[
                status_col.str.lower().str.strip().isin(['número repetido', 'duplicado'])
            ])
            
            # ⏳ Pendentes: STATUS VAZIO = ainda não enviamos mensagem
            pendentes_rec = len(df_recup_raw[status_col == ''])
        else:
            env_rec = sem_tel = repetidos = pendentes_rec = 0
        
        # 💰 Recuperadas: via cruzamento (Nome, Email ou Tel) — usa versão deduplicada
        recuperadas = vendas_recuperadas_count
        
        st.write(f"Total: **{total_rec}** | ✅ Enviados: <span style='color:#FFD700'>{env_rec}</span> | 💰 Recuperadas: <span style='color:#00FF00'>{recuperadas}</span> | 🚫 Sem Tel: <span style='color:#FFD700'>{sem_tel}</span> | 🔄 Repetidos/Duplicados: <span style='color:#aaaaaa'>{repetidos}</span> | ⏳ Pendentes: <span style='color:#FFD700'>{pendentes_rec}</span>", unsafe_allow_html=True)

    st.markdown("---")

    # 3. Bottleneck Section
    st.subheader("O Gargalo do Funil: Conversão p/ Grupo")
    membros_grupo = len(df_compra[df_compra['TEL_NORM'].isin(entered_phones)])
    taxa_onboarding = (membros_grupo / total_vendas) if total_vendas > 0 else 0.0
    
    chart_data = pd.DataFrame({'Etapa': ['Compraram', 'Entraram no Grupo'], 'Quantidade': [total_vendas, membros_grupo]})
    bar_color = '#FFD700' if taxa_onboarding < 0.9 else '#FFFFFF'
    chart = alt.Chart(chart_data).mark_bar(color=bar_color).encode(
        x='Quantidade:Q', y=alt.Y('Etapa:N', sort='-x'), tooltip=['Etapa', 'Quantidade']
    ).properties(height=150)
    st.altair_chart(chart, use_container_width=True)
    st.markdown(f"**Taxa de Onboarding:** {taxa_onboarding:.2%}")

    st.markdown("---")

    # 4. Action Plan Section
    st.subheader("📋 Plano de Ação (Resgates)")
    col_left, col_right = st.columns(2)
    
    with col_left:
        st.markdown(f"**📉 Lista de Resgate: Checkout Abandonado**", unsafe_allow_html=True)
        st.write(f"Total: <span style='color:#FFD700; font-weight:bold'>{X_sales}</span> Oportunidades (<span style='color:#FFD700'>{Y_sales}</span> WhatsApp | <span style='color:#FFD700'>{Z_sales}</span> E-mail)", unsafe_allow_html=True)
        st.caption("Leads que iniciaram a compra mas ainda não pagaram.")
        
        # 💸 Potencial estimado com ticket mínimo ($ escapado para não virar LaTeX)
        col_valor = 'Valor oferta' if 'Valor oferta' in df_compra.columns else 'GROSS PRICE'
        ticket_minimo = df_compra[col_valor].apply(parse_currency).min()
        potencial = X_sales * ticket_minimo
        fmt_brl = lambda v: f"R\\$ {v:,.2f}".replace(",", "X").replace(".", ",").replace("X", ".")
        st.markdown(f"💸 **Potencial estimado: {fmt_brl(potencial)}** *(ticket mínimo {fmt_brl(ticket_minimo)})*")
        
        if not recuperacao_pendentes.empty:
            df_l = recuperacao_pendentes[['NOME', 'TELEFONE']].copy()
            df_l['TELEFONE'] = df_l['TELEFONE'].apply(lambda x: "❌ Sem Telefone" if str(x).strip() == "" else x)
            df_l.insert(0, 'Nº', range(1, len(df_l) + 1))
            st.dataframe(df_l, use_container_width=True, hide_index=True)
        else: st.success("Tudo recuperado!")
            
    with col_right:
        st.markdown(f"**🤝 Resgate de Onboarding (Entrada no Grupo)**", unsafe_allow_html=True)
        st.write(f"Total: <span style='color:#FFD700; font-weight:bold'>{len(onboarding_pendentes)}</span> Clientes Pendentes", unsafe_allow_html=True)
        st.caption("Clientes que já pagaram mas não entraram no grupo.")
        st.write("‎")  # Espaçador para alinhar com a linha do Potencial da coluna esquerda
        
        if not onboarding_pendentes.empty:
            def add_alert(row):
                s = str(row.get('Status Mensagem', '')).lower().strip()
                return f"⚠️ {row['NOME']}" if s != 'enviado' and s != '' else row['NOME']
            df_r = onboarding_pendentes.copy()
            df_r['NOME'] = df_r.apply(add_alert, axis=1)
            df_r = df_r[['NOME', 'TELEFONE']]
            df_r.insert(0, 'Nº', range(1, len(df_r) + 1))
            st.dataframe(df_r, use_container_width=True, hide_index=True)
        else: st.success("Onboarding 100%!")


if __name__ == "__main__":
    main()
