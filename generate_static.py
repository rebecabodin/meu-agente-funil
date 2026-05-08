"""
generate_static.py
──────────────────
Lê os dados do Google Sheets usando gspread, processa as métricas do funil e
exporta docs/data.json para o dashboard estático no GitHub Pages.

ESTE SCRIPT FOI EXPANDIDO PARA INCLUIR INTELIGÊNCIA ESTRATÉGICA (v2).
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

# ── Autenticação Google Sheets ────────────────────────────────────────────────

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
        print(f"Erro ao acessar aba '{tab_name}': {e}")
        return pd.DataFrame()


# ── Normalização ──────────────────────────────────────────────────────────────

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


# ── Pipeline de Métricas ──────────────────────────────────────────────────────

def calcular_metricas():
    client = get_gspread_client()
    sheet_id = os.getenv("GOOGLE_SHEET_ID")
    spreadsheet = client.open_by_key(sheet_id)

    print("📥 Carregando dados do Google Sheets...")
    df_compra = fetch_df(spreadsheet, "📈 Compra Aprovada")
    df_grupos = fetch_df(spreadsheet, " 📈 Grupos 10- Imersão Prática Mundo dos Elétricos ")
    df_recup  = fetch_df(spreadsheet, "📈 Recuperação de Vendas")

    # ── Normalização ──────────────────────────────────────────────────────────
    df_compra['TEL_NORM'] = df_compra['TELEFONE'].apply(normalize_phone) if 'TELEFONE' in df_compra.columns else ""
    df_grupos['TEL_NORM'] = df_grupos['TELEFONE'].apply(normalize_phone) if 'TELEFONE' in df_grupos.columns else ""
    df_recup['TEL_NORM']  = df_recup['TELEFONE'].apply(normalize_phone) if 'TELEFONE' in df_recup.columns else ""

    df_recup_raw = df_recup.copy()
    
    # Desduplicação
    df_compra_dedup = df_compra.drop_duplicates(subset=['TEL_NORM', 'NOME'], keep='first')
    df_recup_dedup  = df_recup.drop_duplicates(subset=['TEL_NORM', 'NOME'], keep='first')
    df_grupos_dedup = df_grupos.drop_duplicates(subset=['TEL_NORM'], keep='first')

    # ── Métricas Básicas ──────────────────────────────────────────────────────
    col_valor = 'Valor oferta' if 'Valor oferta' in df_compra.columns else 'GROSS PRICE'
    faturamento = df_compra_dedup[col_valor].apply(parse_currency).sum() if col_valor in df_compra_dedup.columns else 0.0
    
    entered_phones = set(df_grupos_dedup['TEL_NORM'].unique())
    vendas_no_grupo = df_compra_dedup[df_compra_dedup['TEL_NORM'].isin(entered_phones)]
    gap_onboarding = len(df_compra_dedup) - len(vendas_no_grupo)
    
    # Cruzamento de recuperação
    bought_phones = set(df_compra_dedup[df_compra_dedup['TEL_NORM'] != '']['TEL_NORM'])
    mask_recup = df_recup_dedup['TEL_NORM'].isin(bought_phones)
    vendas_recuperadas = int(mask_recup.sum())

    # ── INTELIGÊNCIA ESTRATÉGICA (DNA DO COMPRADOR) ──────────────────────────
    
    # Mix de Pagamento
    mix_pagamento = []
    if 'FORMA_PAGAMENTO' in df_compra_dedup.columns:
        counts = df_compra_dedup['FORMA_PAGAMENTO'].value_counts()
        mix_pagamento = [{"name": n, "value": int(v)} for n, v in counts.items()]

    # Top Estados
    top_estados = []
    if 'ESTADO' in df_compra_dedup.columns:
        counts = df_compra_dedup['ESTADO'].replace('', 'Não Informado').value_counts().head(5)
        top_estados = [{"name": n, "value": int(v)} for n, v in counts.items()]

    # Parcelamento Médio
    parcelamento_medio = 0
    if 'PARCELAMENTO' in df_compra_dedup.columns:
        parcelamento_medio = round(pd.to_numeric(df_compra_dedup['PARCELAMENTO'], errors='coerce').mean(), 1)

    # ── JANELA DE OPORTUNIDADE (SÉRIES TEMPORAIS) ────────────────────────────
    series_hora = []
    series_acumulado = []
    ranking_momentos = []
    
    d_col = next((c for c in df_compra_dedup.columns if 'DATA' in c.upper()), None)
    if d_col:
        df_compra_dedup['DT'] = pd.to_datetime(df_compra_dedup[d_col], dayfirst=True, errors='coerce')
        df_temp = df_compra_dedup.dropna(subset=['DT']).sort_values('DT')
        
        # Volume por Hora
        h_counts = df_temp['DT'].dt.hour.value_counts().reindex(range(0, 24), fill_value=0).sort_index()
        series_hora = [{"hora": f"{h:02d}h", "vendas": int(v)} for h, v in h_counts.items()]
        
        # Acumulado
        df_acum = df_temp.groupby('DT').size().reset_index(name='v')
        df_acum['acum'] = df_acum['v'].cumsum()
        series_acumulado = [{"date": r['DT'].strftime('%d/%m %H:%M'), "value": int(r['acum'])} for _, r in df_acum.iterrows()]
        
        # Ranking de Momentos (Data + Hora)
        df_temp['Momento'] = df_temp['DT'].dt.strftime('%d/%m %Hh')
        rank_counts = df_temp['Momento'].value_counts().head(5)
        ranking_momentos = [{"name": n, "value": int(v)} for n, v in rank_counts.items()]

    # ── LISTAS DE RESGATE ────────────────────────────────────────────────────
    rec_pending = df_recup_dedup[~mask_recup].copy()
    recuperacao_lista = rec_pending[['NOME', 'TELEFONE']].head(10).to_dict('records')
    onboarding_lista = df_compra_dedup[~df_compra_dedup['TEL_NORM'].isin(entered_phones)][['NOME', 'TELEFONE']].head(10).to_dict('records')

    return {
        "updated_at": datetime.now(timezone.utc).strftime("%d/%m/%Y %H:%M UTC"),
        "faturamento": round(faturamento, 2),
        "vendas_aprovadas": len(df_compra_dedup),
        "vendas_recuperadas": vendas_recuperadas,
        "gap_onboarding": gap_onboarding,
        "taxa_onboarding": round(((len(df_compra_dedup) - gap_onboarding) / len(df_compra_dedup) * 100), 1) if len(df_compra_dedup) > 0 else 0,
        "oportunidades": len(rec_pending),
        "potencial_estimado": round(len(rec_pending) * 19.0, 2), # Assumindo ticket de 19
        "mix_pagamento": mix_pagamento,
        "top_estados": top_estados,
        "parcelamento_medio": parcelamento_medio,
        "series_hora": series_hora,
        "series_acumulado": series_acumulado,
        "ranking_momentos": ranking_momentos,
        "recuperacao_lista": recuperacao_lista,
        "onboarding_lista": onboarding_lista
    }


if __name__ == "__main__":
    os.makedirs("docs", exist_ok=True)
    metricas = calcular_metricas()
    
    # Salva nos dois locais
    for path in [os.path.join("docs", "data.json"), os.path.join("v2", "public", "data.json")]:
        try:
            with open(path, "w", encoding="utf-8") as f:
                json.dump(metricas, f, ensure_ascii=False, indent=2)
        except: pass
        
    print(f"✅ data.json atualizado com Inteligência Estratégica!")
