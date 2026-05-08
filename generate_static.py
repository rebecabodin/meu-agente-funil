"""
generate_static.py
──────────────────
Lê os dados do Google Sheets usando gspread, processa as métricas do funil e
exporta docs/data.json para o dashboard estático no GitHub Pages.

Executado automaticamente pelo GitHub Actions a cada 30 minutos.
Credenciais lidas de variáveis de ambiente (GitHub Secrets).
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

    # Suporte a dois modos:
    # 1) GOOGLE_CREDENTIALS_JSON (string JSON) → usado no GitHub Actions
    # 2) GOOGLE_CREDENTIALS_FILE (caminho do arquivo) → usado localmente
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
        if not data:
            return pd.DataFrame()
        header = data[0]
        rows = []
        for row in data[1:]:
            padded = row + [''] * (len(header) - len(row))
            rows.append(padded[:len(header)])
        return pd.DataFrame(rows, columns=header)
    except Exception as e:
        print(f"Erro ao acessar aba '{tab_name}': {e}")
        return pd.DataFrame()


# ── Normalização ──────────────────────────────────────────────────────────────

def normalize_phone(phone):
    if pd.isna(phone) or str(phone).strip() == "":
        return ""
    digits = re.sub(r'\D', '', str(phone))
    if digits.startswith('55') and len(digits) >= 12:
        return digits[2:4] + digits[-8:]
    elif len(digits) >= 10:
        return digits[:2] + digits[-8:]
    return digits


def parse_currency(value_str):
    if pd.isna(value_str):
        return 0.0
    val = str(value_str).replace('R$', '').strip().replace('.', '').replace(',', '.')
    try:
        return float(val)
    except:
        return 0.0


# ── Pipeline de Métricas ──────────────────────────────────────────────────────

def calcular_metricas():
    client = get_gspread_client()
    sheet_id = os.getenv("GOOGLE_SHEET_ID")
    spreadsheet = client.open_by_key(sheet_id)

    print("📥 Carregando dados do Google Sheets...")
    df_compra = fetch_df(spreadsheet, "📈 Compra Aprovada")
    df_grupos = fetch_df(spreadsheet, " 📈 Grupos 10- Imersão Prática Mundo dos Elétricos ")
    df_recup  = fetch_df(spreadsheet, "📈 Recuperação de Vendas")

    # ── Normalização de telefones ─────────────────────────────────────────────
    df_compra['TEL_NORM'] = df_compra['TELEFONE'].apply(normalize_phone) if 'TELEFONE' in df_compra.columns else ""
    df_grupos['TEL_NORM'] = df_grupos['TELEFONE'].apply(normalize_phone) if 'TELEFONE' in df_grupos.columns else ""
    df_recup['TEL_NORM']  = df_recup['TELEFONE'].apply(normalize_phone) if 'TELEFONE' in df_recup.columns else ""

    # ── Versão RAW da recuperação (espelho do Excel, para Acompanhamento de Envios)
    df_recup_raw = df_recup.copy()

    # ── Desduplicação (para cálculos e cruzamentos) ───────────────────────────
    if not df_compra.empty:
        df_compra = df_compra.drop_duplicates(subset=['TEL_NORM', 'NOME'], keep='first')
    if not df_recup.empty:
        df_recup  = df_recup.drop_duplicates(subset=['TEL_NORM', 'NOME'], keep='first')
    if not df_grupos.empty:
        df_grupos = df_grupos.drop_duplicates(subset=['TEL_NORM'], keep='first')

    # ── Faturamento ───────────────────────────────────────────────────────────
    col_valor = 'Valor oferta' if 'Valor oferta' in df_compra.columns else 'GROSS PRICE'
    faturamento = df_compra[col_valor].apply(parse_currency).sum() if col_valor in df_compra.columns else 0.0
    ticket_minimo = df_compra[col_valor].apply(parse_currency).min() if col_valor in df_compra.columns else 19.0

    # ── Cruzamento: Vendas Recuperadas ────────────────────────────────────────
    bought_phones = set(df_compra[df_compra['TEL_NORM'] != '']['TEL_NORM']) if not df_compra.empty else set()
    bought_names  = set(df_compra['NOME'].str.lower().str.strip().unique()) if 'NOME' in df_compra.columns else set()
    bought_emails = set(df_compra['EMAIL'].str.lower().str.strip().unique()) \
                    if 'EMAIL' in df_compra.columns else set()

    vendas_recuperadas = 0
    mask_bought = pd.Series([False] * len(df_recup))
    if not df_recup.empty:
        mask_bought = (
            df_recup['TEL_NORM'].isin(bought_phones) |
            (df_recup['NOME'].str.lower().str.strip().isin(bought_names) if 'NOME' in df_recup.columns else False) |
            (df_recup['EMAIL'].str.lower().str.strip().isin(bought_emails) if 'EMAIL' in df_recup.columns else False)
        )
        vendas_recuperadas = int(mask_bought.sum())
    
    recuperacao_pendentes = df_recup[~mask_bought].copy() if not df_recup.empty else pd.DataFrame()

    # ── Oportunidades ─────────────────────────────────────────────────────────
    X_sales = len(recuperacao_pendentes)
    Y_sales = int((recuperacao_pendentes['TELEFONE'].str.strip() != '').sum()) if 'TELEFONE' in recuperacao_pendentes.columns else 0
    Z_sales = X_sales - Y_sales
    potencial = X_sales * ticket_minimo

    # ── Gap de Onboarding ─────────────────────────────────────────────────────
    grupo_phones = set(df_grupos['TEL_NORM'].unique()) if 'TEL_NORM' in df_grupos.columns else set()
    onboarding_pendentes = df_compra[~df_compra['TEL_NORM'].isin(grupo_phones)] if not df_compra.empty else pd.DataFrame()
    gap_onboarding = len(onboarding_pendentes)

    # ── Acompanhamento de Envios — Compra Aprovada ────────────────────────────
    col_status_compra = 'Status Mensagem'
    if col_status_compra in df_compra.columns:
        stats_c = df_compra[col_status_compra].str.lower().str.strip()
        env_compra = int((stats_c == 'enviado').sum())
        sem_tel_compra = int(
            (df_compra['TELEFONE'].str.strip().replace('', pd.NA).isna() |
             stats_c.str.contains('telefone incorreto', na=False)).sum()
        )
        pend_compra = int((stats_c == '').sum())
    else:
        env_compra = sem_tel_compra = pend_compra = 0

    # ── Acompanhamento de Envios — Recuperação de Vendas ─────────────────────
    col_status_rec = 'STATUS PÓS AUTOMAÇÃO'
    if col_status_rec in df_recup_raw.columns:
        status_r = df_recup_raw[col_status_rec].fillna('').str.strip()
        env_rec = int(status_r.str.lower().str.strip().isin(
            ['mensagem enviada', 'comprou']).sum())
        sem_tel_rec  = int((status_r.str.lower() == 'sem telefone para contato').sum())
        repetidos    = int(status_r.str.lower().str.strip().isin(
            ['número repetido', 'duplicado']).sum())
        pend_rec     = int((status_r == '').sum())
    else:
        env_rec = sem_tel_rec = repetidos = pend_rec = 0

    total_rec = len(df_recup_raw)

    # ── Resultado final ───────────────────────────────────────────────────────
    return {
        "updated_at": datetime.now(timezone.utc).strftime("%d/%m/%Y %H:%M UTC"),
        "faturamento": round(faturamento, 2),
        "ticket_minimo": round(ticket_minimo, 2),
        "vendas_aprovadas": len(df_compra),
        "vendas_recuperadas": vendas_recuperadas,
        "oportunidades": X_sales,
        "oportunidades_whatsapp": Y_sales,
        "oportunidades_email": Z_sales,
        "potencial_estimado": round(potencial, 2),
        "gap_onboarding": gap_onboarding,
        "compra_aprovada": {
            "total": len(df_compra),
            "enviados": env_compra,
            "sem_tel": sem_tel_compra,
            "pendentes": pend_compra
        },
        "recuperacao": {
            "total": total_rec,
            "enviados": env_rec,
            "recuperadas": vendas_recuperadas,
            "sem_tel": sem_tel_rec,
            "repetidos": repetidos,
            "pendentes": pend_rec
        }
    }


# ── Main ──────────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    os.makedirs("docs", exist_ok=True)
    metricas = calcular_metricas()
    out_path = os.path.join("docs", "data.json")
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(metricas, f, ensure_ascii=False, indent=2)
    print(f"✅ {out_path} gerado com sucesso!")
    print(json.dumps(metricas, ensure_ascii=False, indent=2))
