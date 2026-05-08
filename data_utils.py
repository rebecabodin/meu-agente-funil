import os
import re
import pandas as pd
import streamlit as st
import gspread
from google.oauth2.service_account import Credentials

try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

SCOPES = ['https://www.googleapis.com/auth/spreadsheets.readonly']

# ── Autenticação via gspread (compatível com Streamlit Cloud e local) ─────────

@st.cache_resource
def get_gspread_client():
    try:
        # ✅ Streamlit Cloud: lê credenciais do st.secrets
        creds = Credentials.from_service_account_info(
            st.secrets["gcp_service_account"], scopes=SCOPES)
    except (KeyError, FileNotFoundError):
        # ✅ Local: lê do arquivo credentials.json
        creds_file = os.getenv("GOOGLE_CREDENTIALS_FILE", "credentials.json")
        creds = Credentials.from_service_account_file(creds_file, scopes=SCOPES)
    return gspread.authorize(creds)


@st.cache_data(ttl=300)
def load_data():
    client   = get_gspread_client()
    sheet_id = os.getenv("GOOGLE_SHEET_ID") or st.secrets.get("GOOGLE_SHEET_ID", "")
    spreadsheet = client.open_by_key(sheet_id)

    def fetch_df(tab_name):
        try:
            ws   = spreadsheet.worksheet(tab_name)
            data = ws.get_all_values()
            if not data:
                return pd.DataFrame()
            header = data[0]
            rows   = []
            for row in data[1:]:
                padded = row + [''] * (len(header) - len(row))
                rows.append(padded[:len(header)])
            return pd.DataFrame(rows, columns=header)
        except Exception as e:
            st.warning(f"⚠️ Aba '{tab_name}' não encontrada: {e}")
            return pd.DataFrame()

    df_compra = fetch_df('📈 Compra Aprovada')
    df_grupos = fetch_df(' 📈 Grupos 10- Imersão Prática Mundo dos Elétricos ')
    df_recup  = fetch_df('📈 Recuperação de Vendas')

    return df_compra, df_grupos, df_recup


# ── Utilitários ───────────────────────────────────────────────────────────────

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


def calcular_metricas_grupo(df_compra: pd.DataFrame, df_grupos: pd.DataFrame):
    """
    Cruza a aba de Compras com a aba de Grupos para identificar quem entrou no grupo.
    Retorna (entered_phones, df_valid_compra, df_in_group, df_pendentes).
    """
    if df_compra.empty or df_grupos.empty:
        return set(), pd.DataFrame(), pd.DataFrame(), pd.DataFrame()

    if 'TEL_NORM' not in df_compra.columns:
        df_compra['TEL_NORM'] = df_compra['TELEFONE'].apply(normalize_phone) \
            if 'TELEFONE' in df_compra.columns else ""
    if 'TEL_NORM' not in df_grupos.columns:
        df_grupos['TEL_NORM'] = df_grupos['TELEFONE'].apply(normalize_phone) \
            if 'TELEFONE' in df_grupos.columns else ""

    entered_phones = set(df_grupos[df_grupos['TEL_NORM'] != '']['TEL_NORM'])

    df_valid_compra = df_compra[df_compra['TEL_NORM'] != ""]
    df_in_group     = df_valid_compra[df_valid_compra['TEL_NORM'].isin(entered_phones)]
    df_pendentes    = df_compra[~df_compra['TEL_NORM'].isin(entered_phones)]

    return entered_phones, df_valid_compra, df_in_group, df_pendentes
