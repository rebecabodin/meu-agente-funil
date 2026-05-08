import streamlit as st
import pandas as pd
import altair as alt
import plotly.express as px
from data_utils import load_data, normalize_phone, parse_currency, calcular_metricas_grupo

# Page Configuration
st.set_page_config(
    page_title="Inteligência Estratégica | Mundo dos Elétricos",
    page_icon="🧠",
    layout="wide"
)

# Dark Mode Styling
st.markdown("""
    <style>
        .main { background-color: #000000; }
        h1, h2, h3 { color: #FFD700 !important; }
        .stMetric { background-color: #111111; padding: 15px; border-radius: 10px; border: 1px solid #333; }
        .card-insight { background-color: #111111; padding: 20px; border-radius: 10px; border-left: 5px solid #FFD700; margin-bottom: 20px; }
        .leak-box { background-color: #1a1a1a; padding: 15px; border-radius: 8px; border: 1px dashed #FFD700; color: #eee; margin-bottom: 10px; }
        .copy-box { background-color: #0e1117; padding: 20px; border-radius: 10px; border: 1px solid #333; margin-bottom: 20px; }
        .copy-tag { background-color: #FFD700; color: #000; padding: 2px 8px; border-radius: 4px; font-weight: bold; font-size: 12px; }
        .peak-card { background-color: #0a0a0a; border: 1px solid #FFD700; border-radius: 10px; padding: 20px; text-align: center; }
        .peak-value { color: #FFD700; font-size: 28px; font-weight: bold; }
        .peak-label { color: #888; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; }
    </style>
""", unsafe_allow_html=True)

def main():
    # Header Section
    col_title, col_btn = st.columns([4, 1])
    with col_title:
        st.title("🕵️‍♂️ Sala de Guerra: Inteligência & Insights")
    with col_btn:
        st.markdown("<div style='height: 22px;'></div>", unsafe_allow_html=True)
        if st.button("🔄 Atualizar Dados agora", use_container_width=True):
            st.cache_data.clear()
            st.rerun()
            
    st.markdown("---")
    
    with st.spinner("Sincronizando dados estratégicos..."):
        df_compra, df_grupos, df_recup = load_data()
        
    # Garantir normalização de telefones para cruzamento
    df_compra['TEL_NORM'] = df_compra['TELEFONE'].apply(normalize_phone)
    df_recup['TEL_NORM'] = df_recup['TELEFONE'].apply(normalize_phone)
    df_grupos['TEL_NORM'] = df_grupos['TELEFONE'].apply(normalize_phone)
        
    # Regra de Ouro: Desconsiderar duplicados
    df_compra = df_compra.drop_duplicates(subset=['TEL_NORM', 'NOME'], keep='first')
    df_recup = df_recup.drop_duplicates(subset=['TEL_NORM', 'NOME'], keep='first')
    df_grupos = df_grupos.drop_duplicates(subset=['TEL_NORM'], keep='first')

    if df_compra.empty:
        st.error("Dados não encontrados para análise.")
        return

    # --- LÓGICA CORE (DATA_UTILS) ---
    entered_phones, df_valid_compra, df_in_group, _ = calcular_metricas_grupo(df_compra, df_grupos)
    
    in_group_real = len(df_in_group)
    total_sales = len(df_compra)
    taxa_onboarding = (in_group_real / total_sales) if total_sales > 0 else 0

    # 1. KPIs ESTRATÉGICOS
    st.subheader("🏁 Performance de Entrega (Onboarding)")
    c1, c2, c3, c4 = st.columns(4)
    c1.metric("Vendas Totais", total_sales)
    c2.metric("Membros no Grupo", in_group_real)
    c3.metric("Taxa de Onboarding", f"{taxa_onboarding:.1%}")
    c4.metric("Gap de Entrega", total_sales - in_group_real)

    st.markdown("---")

    # 2. DIAGNÓSTICO DE FUGAS
    st.subheader("🚩 Mapeamento de Gargalos (Funnel Leaks)")
    no_phone_leads = len(df_recup[df_recup['TELEFONE'].str.strip() == ""])
    col1, col2, col3 = st.columns(3)
    with col1:
        st.markdown("""<div class="leak-box"><b>👻 Leads Fantasmas</b><br>Loss no Checkout.<br><span style='color:#FFD700'><b>Solução:</b> Ads Retargeting.</span></div>""", unsafe_allow_html=True)
    with col2:
        st.markdown(f"""<div class="leak-box"><b>📵 Só E-mail (Mudos)</b><br><b>{no_phone_leads}</b> leads sem WhatsApp.<br><span style='color:#FFD700'><b>Solução:</b> Hotmart Send.</span></div>""", unsafe_allow_html=True)
    with col3:
        st.markdown(f"""<div class="leak-box"><b>🤝 Onboarding Gap</b><br><b>{total_sales - in_group_real}</b> alunos fora do grupo.<br><span style='color:#FFD700'><b>Solução:</b> Script Humano.</span></div>""", unsafe_allow_html=True)

    st.markdown("---")

    # --- 2.1 DNA DO COMPRADOR ---
    st.subheader("🧬 DNA do Comprador (Perfil)")
    c_dna1, c_dna2, c_dna3 = st.columns([1, 1, 1])
    
    with c_dna1:
        st.write("**💳 Mix de Pagamento**")
        if 'FORMA_PAGAMENTO' in df_compra.columns:
            pay_data = df_compra['FORMA_PAGAMENTO'].value_counts().reset_index()
            pay_data.columns = ['Forma', 'Vendas']
            fig_pay = px.pie(pay_data, values='Vendas', names='Forma', hole=.4, color_discrete_sequence=['#FFD700', '#FFFFFF', '#333333'])
            fig_pay.update_layout(showlegend=True, paper_bgcolor='rgba(0,0,0,0)', plot_bgcolor='rgba(0,0,0,0)', font_color="white", margin=dict(l=0, r=0, t=0, b=0))
            st.plotly_chart(fig_pay, use_container_width=True)
            
    with c_dna2:
        st.write("**🗺️ Top Estados (Faturamento)**")
        if 'ESTADO' in df_compra.columns:
            est_data = df_compra['ESTADO'].replace('', 'Não Informado').value_counts().head(5).reset_index()
            est_data.columns = ['Estado', 'Vendas']
            fig_est = px.bar(est_data, x='Vendas', y='Estado', orientation='h', color_discrete_sequence=['#FFD700'])
            fig_est.update_layout(paper_bgcolor='rgba(0,0,0,0)', plot_bgcolor='rgba(0,0,0,0)', font_color="white", xaxis_visible=False, yaxis=dict(autorange="reversed", title=None), margin=dict(l=0, r=0, t=0, b=0))
            st.plotly_chart(fig_est, use_container_width=True)

    with c_dna3:
        st.write("**📈 Comportamento Financeiro**")
        if 'PARCELAMENTO' in df_compra.columns:
            try:
                avg_parc = pd.to_numeric(df_compra['PARCELAMENTO'], errors='coerce').mean()
                st.markdown(f"""
                <div class="peak-card" style="margin-top:20px;">
                    <div class="peak-label">Parcelamento Médio</div>
                    <div class="peak-value">{avg_parc:.1f}x</div>
                    <div style="color:#888; font-size:12px; margin-top:5px;">Maioria prefere parcelar em poucas vezes.</div>
                </div>
                """, unsafe_allow_html=True)
            except: st.write("Dados de parcelamento indisponíveis.")

    st.markdown("---")

    # --- 3. JANELA DE OPORTUNIDADE ---
    st.subheader("🕰️ Janela de Oportunidade (Comportamento de Compra)")
    
    try:
        d_col = None
        for c in df_compra.columns:
            if 'DATA' in c.upper(): d_col = c; break
        
        if d_col:
            df_compra['DT'] = pd.to_datetime(df_compra[d_col], dayfirst=True, errors='coerce')
            df_compra = df_compra.dropna(subset=['DT']).sort_values('DT')
            df_compra['Hora'] = df_compra['DT'].dt.hour
            df_compra['Data_Formatada'] = df_compra['DT'].dt.strftime('%d/%m')
            
            c_left, c_right = st.columns(2)
            
            with c_left:
                st.write("**📊 Volume de Vendas por Hora (Aprovadas)**")
                h_data = df_compra['Hora'].value_counts().reindex(range(0, 24), fill_value=0).reset_index()
                h_data.columns = ['Hora', 'Vendas']
                max_vendas = h_data['Vendas'].max()
                bars = alt.Chart(h_data).mark_bar(size=20, cornerRadiusTopLeft=5, cornerRadiusTopRight=5).encode(
                    x=alt.X('Hora:O', title='Hora do Dia', axis=alt.Axis(labelAngle=0, titleAnchor='middle', grid=False)),
                    y=alt.Y('Vendas:Q', title=None, scale=alt.Scale(domain=[0, max_vendas * 1.4])),
                    color=alt.condition(alt.datum.Vendas == max_vendas, alt.value('#FFEA00'), alt.value('#FFD700')),
                    tooltip=['Hora', 'Vendas']
                )
                text = bars.mark_text(align='center', baseline='bottom', dy=-8, color='white', fontWeight='bold').encode(text='Vendas:Q')
                st.altair_chart((bars + text), use_container_width=True)
                
            with c_right:
                st.write("**📈 Crescimento Acumulado das Vendas**")
                # Agrupa por timestamp para evitar picos de agregação visual
                df_acum = df_compra.groupby('DT').size().reset_index(name='vendas_no_instante')
                df_acum = df_acum.sort_values('DT')
                df_acum['Acumulado'] = df_acum['vendas_no_instante'].cumsum()
                
                area = alt.Chart(df_acum).mark_area(
                    line={'color': '#FFD700'},
                    color=alt.Gradient(gradient='linear', stops=[alt.GradientStop(color='#FFD700', offset=0), alt.GradientStop(color='transparent', offset=1)], x1=1, x2=1, y1=1, y2=0),
                    opacity=0.3
                ).encode(
                    x=alt.X('DT:T', title='Data da Venda', axis=alt.Axis(format='%d/%m', tickCount='day', labelAngle=0, grid=False)), 
                    y=alt.Y('Acumulado:Q', title=None),
                    tooltip=[alt.Tooltip('DT:T', title='Momento', format='%d/%m %H:%M'), alt.Tooltip('Acumulado:Q', title='Total Acumulado')]
                )
                st.altair_chart(area, use_container_width=True)
            
            # --- RANKING DE ELITE ---
            st.markdown("### 🏆 Top 5 Momentos de Ouro")
            ranking = df_compra.groupby(['Data_Formatada', 'Hora']).size().reset_index(name='Vendas')
            ranking = ranking.sort_values('Vendas', ascending=False).head(5)
            ranking['Momento'] = ranking.apply(lambda r: f"{r['Data_Formatada']} - {r['Hora']:02d}h", axis=1)
            
            fig_rank = px.bar(ranking, x='Vendas', y='Momento', orientation='h', text='Vendas', color_discrete_sequence=['#FFD700'])
            fig_rank.update_layout(paper_bgcolor='rgba(0,0,0,0)', plot_bgcolor='rgba(0,0,0,0)', font_color="white", xaxis_visible=False, yaxis=dict(autorange="reversed", title=None), margin=dict(l=0, r=0, t=30, b=0))
            fig_rank.update_traces(textposition='outside', textfont_size=14, textfont_color="white")
            st.plotly_chart(fig_rank, use_container_width=True)
            st.caption("Nota: Este ranking considera apenas vendas com pagamento confirmado, filtrando duplicatas.")

            # --- LÓGICA DE EMPATE ---
            dia_counts = df_compra['Data_Formatada'].value_counts()
            max_dia_vendas = dia_counts.max()
            dias_pico = dia_counts[dia_counts == max_dia_vendas].index.tolist()
            dias_pico_label = "Dias de Ouro" if len(dias_pico) > 1 else "Dia de Ouro"
            dias_pico_val = " & ".join(dias_pico)

            # Horas do Rush
            max_momento_vendas = ranking['Vendas'].max()
            horas_pico = ranking[ranking['Vendas'] == max_momento_vendas]['Hora'].apply(lambda h: f"{h:02d}:00h").unique().tolist()
            horas_pico_label = "Horas do Rush" if len(horas_pico) > 1 else "Hora do Rush"
            horas_pico_val = " & ".join(horas_pico)
            
            with st.container():
                st.markdown(f"""
                <div style="border: 1px solid #FFD700; border-radius: 10px; padding: 20px; background-color: #0a0a0a; margin-top: 10px;">
                    <div style="display: flex; justify-content: space-around; text-align: center; margin-bottom: 15px;">
                        <div><div class="peak-label">📅 {dias_pico_label}</div><div class="peak-value">{dias_pico_val}</div></div>
                        <div><div class="peak-label">⏰ {horas_pico_label}</div><div class="peak-value">{horas_pico_val}</div></div>
                    </div>
                </div>
                """, unsafe_allow_html=True)
                st.info(f"💡 **Dica Estratégica**: O seu lançamento possui picos idênticos de tração. Agende suas comunicações para as janelas de **{horas_pico_val}**.")

    except Exception as e:
        st.warning(f"Erro ao processar inteligência comportamental: {e}")

    st.markdown("---")

    # 4. MATRIZ DE AÇÃO (Bate o Olho)
    st.subheader("🛠️ Plano de Ação Imediata")
    
    # Limpeza: Considerar apenas quem NÃO comprou ainda (pelo Tel, Nome ou Email)
    col_rec_status = 'STATUS PÓS AUTOMAÇÃO' 
    bought_phones = set(df_compra[df_compra['TEL_NORM'] != '']['TEL_NORM'])
    bought_names = set(df_compra['NOME'].str.lower().str.strip().unique())
    bought_emails = set(df_compra['EMAIL'].str.lower().str.strip().unique()) if 'EMAIL' in df_compra.columns else set()
    
    if col_rec_status in df_recup.columns:
        stats_r_raw = df_recup[col_rec_status].fillna('').str.lower().str.strip()
    else:
        stats_r_raw = pd.Series([''] * len(df_recup), index=df_recup.index)
    
    # Filtro: Pessoas que não compraram por nenhum critério e não têm status de 'comprou'
    mask_already_bought = (df_recup['TEL_NORM'].isin(bought_phones)) | \
                          (df_recup['NOME'].str.lower().str.strip().isin(bought_names)) | \
                          (df_recup['EMAIL'].str.lower().str.strip().isin(bought_emails) if 'EMAIL' in df_recup.columns else False)
    
    mask_real_pending = (~mask_already_bought) & (stats_r_raw != 'comprou')
    df_recup_real = df_recup[mask_real_pending].copy()

    # Cálculo de Volumes Reais (Filtrados)
    vol_wpp = len(df_recup_real[df_recup_real['TELEFONE'].str.strip() != ""])
    vol_email = len(df_recup_real[df_recup_real['TELEFONE'].str.strip() == ""])
    
    # Usar a lógica oficial (entered_phones já filtrado pelo data_utils)
    vol_onboarding = len(df_compra[~df_compra['TEL_NORM'].isin(entered_phones)])

    col_a, col_b, col_c = st.columns(3)
    
    with col_a:
        st.markdown(f"""
        <div class="card-insight">
            <div style="font-size:14px; color:#888;">🚀 RESGATE URGENTE</div>
            <div style="font-size:32px; font-weight:bold; color:#FFD700;">{vol_wpp} leads</div>
            <div style="font-size:14px; margin-top:10px;"><b>Ação:</b> Chamar no WhatsApp agora.<br><b>Canal:</b> ManyChat.</div>
        </div>
        """, unsafe_allow_html=True)
        
    with col_b:
        st.markdown(f"""
        <div class="card-insight" style="border-left-color: #ffffff;">
            <div style="font-size:14px; color:#888;">📧 RECAPTURAR (SEM ZAP)</div>
            <div style="font-size:32px; font-weight:bold; color:#ffffff;">{vol_email} leads</div>
            <div style="font-size:14px; margin-top:10px;"><b>Ação:</b> E-mail + Anúncios de Remarketing.<br><b>Canal:</b> Hotmart Send / Ads.</div>
        </div>
        """, unsafe_allow_html=True)
        
    with col_c:
        st.markdown(f"""
        <div class="card-insight" style="border-left-color: #00FF00;">
            <div style="font-size:14px; color:#888;">🤝 BOAS-VINDAS (GRUPO)</div>
            <div style="font-size:32px; font-weight:bold; color:#00FF00;">{vol_onboarding} alunos</div>
            <div style="font-size:14px; margin-top:10px;"><b>Ação:</b> Colocar no grupo de suporte.<br><b>Canal:</b> Humano (1-a-1).</div>
        </div>
        """, unsafe_allow_html=True)

    st.markdown("---")
    st.subheader("✍️ Copy Factory (Scripts Rápidos)")
    
    # Dica Dinâmica baseada na Forma de Pagamento
    if 'FORMA_PAGAMENTO' in df_compra.columns:
        pref_pay = df_compra['FORMA_PAGAMENTO'].value_counts().idxmax()
        st.info(f"💡 **Dica de Estrategista**: Seu público prefere pagar via **{pref_pay}**. No primeiro contato, mencione que você aceita esse método para facilitar a venda.")

    tabs = st.tabs(["🛒 Recuperação (Whats) + Plano A/B", "🎓 Onboarding (Alunos)", "🔥 E-mail & Ads"])
    
    with tabs[0]:
        st.markdown("### Canal: ManyChat / WhatsApp API")
        st.caption(f"Foco: Seus {vol_wpp} leads que possuem telefone e NÃO compraram.")
        
        c1, c2 = st.columns(2)
        with c1:
            st.info("**Versão A: Racional / Vídeo**")
            st.markdown("""<div class="copy-box"><span class="copy-tag">Abordagem A: Vídeo (Meta)</span><br><br>"Oi {{First Name}}, vi que o checkout não concluiu. Te mandei esse vídeo rápido mostrando o que tem lá dentro da Imersão!"</div>""", unsafe_allow_html=True)
            st.markdown("""<div class="copy-box"><span class="copy-tag">Abordagem B: Ajuda (Anterior)</span><br><br>"Oi {{First Name}}! Teve algum problema com o link ou prefere o código do PIX para facilitar?"</div>""", unsafe_allow_html=True)
        with c2:
            st.success("**Versão B: Consultiva / Curiosa**")
            st.markdown("""<div class="copy-box"><span class="copy-tag">Abordagem C: Curiosidade</span><br><br>"Oi {{First Name}}, tudo bem? Notei que sua vaga ficou pendente. Alguma dúvida técnica ou o site deu erro?"</div>""", unsafe_allow_html=True)
            st.info("🎤 Dica: Use áudios apenas na resposta do lead.")
        
        st.markdown("---")
        st.markdown(f"""
        **🧪 Estratégia de Teste A/B:** Divida sua lista de {vol_wpp} leads ao meio. Envie a Versão A para um lado e a Versão B para o outro.
        
        **📊 Como medir o vencedor?**
        1. **Taxa de Resposta:** Qual grupo interagiu mais com você?
        2. **Taxa de Conversão:** Qual grupo gerou mais vendas aprovadas no final do dia?
        """)

    with tabs[1]:
        st.markdown("### Canal: ManyChat / Suporte Humano")
        st.caption(f"Foco: Seus {vol_onboarding} alunos fora do grupo.")
        c1, c2 = st.columns(2)
        with c1:
            st.markdown("""<div class="copy-box"><span class="copy-tag">Acesso Imediato</span><br><br>"Parabéns pela compra, {{Nome}}! Notei que você ainda não entrou no grupo oficial. Segue o link: [LINK]"</div>""", unsafe_allow_html=True)
        with c2:
            st.markdown("""<div class="copy-box"><span class="copy-tag">Boas-vindas (Vídeo)</span><br><br>"Fala {{Nome}}, André aqui! Que bom ter você com a gente. Veja esse vídeo de 1 min com os primeiros passos!"</div>""", unsafe_allow_html=True)
        
        st.markdown("---")
        st.markdown("""
        **📊 Como medir o vencedor?**
        1. **Taxa de Adesão:** Qual mensagem faz o aluno clicar no link do grupo mais rápido?
        2. **Engajamento:** Quantos alunos responderam ao vídeo de boas-vindas?
        """)

    with tabs[2]:
        st.markdown("### Canal: Hotmart Send / Meta Ads")
        st.caption(f"Foco: Seus {vol_email} leads sem WhatsApp.")
        c1, c2 = st.columns(2)
        with c1:
            st.markdown("""<div class="copy-box"><span class="copy-tag">E-mail: Storytelling</span><br><br><b>Assunto:</b> Preciso te contar uma coisa...<br>"Notei que você se interessou mas não finalizou. Não queria que ficasse de fora..."</div>""", unsafe_allow_html=True)
        with c2:
            st.markdown("""<div class="copy-box"><span class="copy-tag">Ads: Remarketing</span><br><br><b>Legenda Ads:</b> "Vi que você visitou nossa página. Ficou alguma dúvida? Clique aqui para falar com nosso suporte."</div>""", unsafe_allow_html=True)
        
        st.markdown("---")
        st.markdown("""
        **📊 Como medir o vencedor?**
        1. **CTR (Taxa de Clique):** Qual assunto de e-mail ou criativo de Ads teve mais cliques?
        2. **Recuperação Passiva:** Quantas dessas 33 pessoas compraram após verem o e-mail/ads?
        """)

if __name__ == "__main__":
    main()
