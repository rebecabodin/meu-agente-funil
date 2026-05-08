"""
generate_static.py
──────────────────
Versão Final de Auditoria: Garante paridade total com app.py e insights.py.
"""
import os
import re
import json
from datetime import datetime, timezone

import pandas as pd
import gspread
from google.oauth2.service_account import Credentials
from dotenv import load_dotenv

load_dotenv()

def get_gspread_client():
    scopes = ['https://www.googleapis.com/auth/spreadsheets.readonly']
    creds_json = os.getenv("GOOGLE_CREDENTIALS_JSON")
    if creds_json:
        info = json.loads(creds_json)
        creds = Credentials.from_service_account_info(info, scopes=scopes)
    else:
        creds_file = os.getenv("GOOGLE_CREDENTIALS_FILE", "credentials.json")
        creds = Credentials.from_service_account_file(creds_file, scopes=scopes)
    return gspread.authorize(creds)

def fetch_df(spreadsheet, tab_name):
    try:
        ws = spreadsheet.worksheet(tab_name)
        data = ws.get_all_values()
        if not data: return pd.DataFrame()
        header = data[0]
        rows = [row + [''] * (len(header) - len(row)) for row in data[1:]]
        return pd.DataFrame(rows, columns=header)
    except Exception as e:
        return pd.DataFrame()

def normalize_phone(phone):
    if pd.isna(phone) or str(phone).strip() == "": return ""
    digits = re.sub(r'\D', '', str(phone))
    if digits.startswith('55') and len(digits) >= 12: return digits[2:4] + digits[-8:]
    elif len(digits) >= 10: return digits[:2] + digits[-8:]
    return digits

def parse_currency(value_str):
    if pd.isna(value_str): return 0.0
    val = str(value_str).replace('R$', '').strip().replace('.', '').replace(',', '.')
    try: return float(val)
    except: return 0.0

def calcular_metricas():
    client = get_gspread_client()
    sheet_id = os.getenv("GOOGLE_SHEET_ID")
    spreadsheet = client.open_by_key(sheet_id)

    df_compra = fetch_df(spreadsheet, "📈 Compra Aprovada")
    df_grupos = fetch_df(spreadsheet, " 📈 Grupos 10- Imersão Prática Mundo dos Elétricos ")
    df_recup  = fetch_df(spreadsheet, "📈 Recuperação de Vendas")

    # ── Normalização e Desduplicação (Regra de Ouro) ──────────────────────────
    df_compra['TEL_NORM'] = df_compra['TELEFONE'].apply(normalize_phone)
    df_recup['TEL_NORM'] = df_recup['TELEFONE'].apply(normalize_phone)
    df_grupos['TEL_NORM'] = df_grupos['TELEFONE'].apply(normalize_phone)

    df_compra = df_compra.drop_duplicates(subset=['TEL_NORM', 'NOME'], keep='first')
    df_recup_dedup = df_recup.drop_duplicates(subset=['TEL_NORM', 'NOME'], keep='first')
    df_grupos_dedup = df_grupos.drop_duplicates(subset=['TEL_NORM'], keep='first')

    # ── MÉTRICAS TIPO STREAMLIT ──────────────────────────────────────────────
    col_valor = 'Valor oferta' if 'Valor oferta' in df_compra.columns else 'GROSS PRICE'
    faturamento = df_compra[col_valor].apply(parse_currency).sum()
    
    # Onboarding
    entered_phones = set(df_grupos_dedup['TEL_NORM'].unique())
    vendas_no_grupo = df_compra[df_compra['TEL_NORM'].isin(entered_phones)]
    in_group_real = len(vendas_no_grupo)
    total_sales = len(df_compra)
    taxa_onboarding = (in_group_real / total_sales) if total_sales > 0 else 0
    
    # Recuperação
    bought_phones = set(df_compra[df_compra['TEL_NORM'] != '']['TEL_NORM'])
    bought_names = set(df_compra['NOME'].str.lower().str.strip().unique())
    
    mask_recup_bought = (df_recup_dedup['TEL_NORM'].isin(bought_phones)) | \
                        (df_recup_dedup['NOME'].str.lower().str.strip().isin(bought_names))
    vendas_recuperadas = int(mask_recup_bought.sum())
    rec_pending = df_recup_dedup[~mask_recup_bought].copy()

    # ── STATUS DE ENVIOS (DETALHADO) ─────────────────────────────────────────
    # Simulação baseada no app.py
    def get_status_counts(df, col_status='STATUS PÓS AUTOMAÇÃO'):
        if col_status not in df.columns: return {"enviados": 0, "pendentes": len(df), "sem_tel": 0}
        enviados = len(df[df[col_status].str.lower().str.contains('enviado|ok', na=False)])
        sem_tel = len(df[df['TELEFONE'].str.strip() == ""])
        return {
            "total": len(df),
            "enviados": enviados,
            "sem_tel": sem_tel,
            "pendentes": len(df) - enviados - sem_tel
        }

    status_compra = get_status_counts(df_compra)
    status_recup = get_status_counts(df_recup_dedup)
    status_recup["recuperadas"] = vendas_recuperadas

    # ── GARGALOS (INSIGHTS) ──────────────────────────────────────────────────
    ghost_leads = len(df_recup_dedup) - vendas_recuperadas
    only_email = len(df_recup_dedup[df_recup_dedup['TELEFONE'].str.strip() == ""])
    onboarding_gap = total_sales - in_group_real

    # ── DNA E TEMPORAL ───────────────────────────────────────────────────────
    # Mix de Pagamento
    mix_pagamento = []
    if 'FORMA_PAGAMENTO' in df_compra.columns:
        counts = df_compra['FORMA_PAGAMENTO'].value_counts()
        mix_pagamento = [{"name": n, "value": int(v)} for n, v in counts.items()]

    # Top Estados
    top_estados = []
    if 'ESTADO' in df_compra.columns:
        counts = df_compra['ESTADO'].replace('', 'Não Informado').value_counts().head(5)
        top_estados = [{"name": n, "value": int(v)} for n, v in counts.items()]

    # Temporal
    series_hora = []
    series_acumulado = []
    ranking_momentos = []
    d_col = next((c for c in df_compra.columns if 'DATA' in c.upper()), None)
    if d_col:
        df_compra['DT'] = pd.to_datetime(df_compra[d_col], dayfirst=True, errors='coerce')
        df_temp = df_compra.dropna(subset=['DT']).sort_values('DT')
        h_counts = df_temp['DT'].dt.hour.value_counts().reindex(range(0, 24), fill_value=0).sort_index()
        series_hora = [{"hora": f"{h:02d}h", "vendas": int(v)} for h, v in h_counts.items()]
        df_acum = df_temp.groupby('DT').size().reset_index(name='v')
        df_acum['acum'] = df_acum['v'].cumsum()
        series_acumulado = [{"date": r['DT'].strftime('%d/%m %H:%M'), "value": int(r['acum'])} for _, r in df_acum.iterrows()]
        df_temp['Momento'] = df_temp['DT'].dt.strftime('%d/%m %Hh')
        rank_counts = df_temp['Momento'].value_counts().head(5)
        ranking_momentos = [{"name": n, "value": int(v)} for n, v in rank_counts.items()]

    # Listas de Resgate (Top 10)
    recuperacao_lista = rec_pending[['NOME', 'TELEFONE']].head(10).to_dict('records')
    onboarding_lista = df_compra[~df_compra['TEL_NORM'].isin(entered_phones)][['NOME', 'TELEFONE']].head(10).to_dict('records')

    return {
        "updated_at": datetime.now(timezone.utc).strftime("%d/%m/%Y %H:%M UTC"),
        "faturamento": round(faturamento, 2),
        "vendas_aprovadas": total_sales,
        "vendas_recuperadas": vendas_recuperadas,
        "taxa_onboarding": round(taxa_onboarding * 100, 2),
        "oportunidades": len(rec_pending),
        "potencial_estimado": round(len(rec_pending) * 19.0, 2),
        "status_compra": status_compra,
        "status_recup": status_recup,
        "gargalos": {
            "ghost_leads": ghost_leads,
            "only_email": only_email,
            "onboarding_gap": onboarding_gap
        },
        "mix_pagamento": mix_pagamento,
        "top_estados": top_estados,
        "parcelamento_medio": round(pd.to_numeric(df_compra['PARCELAMENTO'], errors='coerce').mean(), 1) if 'PARCELAMENTO' in df_compra.columns else 0,
        "series_hora": series_hora,
        "series_acumulado": series_acumulado,
        "ranking_momentos": ranking_momentos,
        "recuperacao_lista": recuperacao_lista,
        "onboarding_lista": onboarding_lista
    }

if __name__ == "__main__":
    os.makedirs("docs", exist_ok=True)
    metricas = calcular_metricas()
    for path in [os.path.join("docs", "data.json"), os.path.join("v2", "public", "data.json")]:
        try:
            with open(path, "w", encoding="utf-8") as f:
                json.dump(metricas, f, ensure_ascii=False, indent=2)
        except: pass
    print(f"✅ data.json atualizado com paridade total!")
