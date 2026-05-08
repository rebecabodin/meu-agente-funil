import os
import re
import pandas as pd
import streamlit as st
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass
from googleapiclient.discovery import build
from google.oauth2.service_account import Credentials


@st.cache_resource
def get_sheets_service():
    scopes = ['https://www.googleapis.com/auth/spreadsheets.readonly']
    try:
        # ✅ Streamlit Cloud: lê credenciais do st.secrets
        creds = Credentials.from_service_account_info(
            st.secrets["gcp_service_account"], scopes=scopes)
    except (KeyError, FileNotFoundError):
        # ✅ Local: lê do arquivo credentials.json
        creds_file = os.getenv("GOOGLE_CREDENTIALS_FILE", "credentials.json")
        creds = Credentials.from_service_account_file(creds_file, scopes=scopes)
    return build('sheets', 'v4', credentials=creds)

@st.cache_data(ttl=5)
def load_data():
    service = get_sheets_service()
    sheet_id = os.getenv("GOOGLE_SHEET_ID")
    
    def fetch_df(range_name):
        result = service.spreadsheets().values().get(
            spreadsheetId=sheet_id, range=range_name).execute()
        values = result.get('values', [])
        if not values: return pd.DataFrame()
        header = values[0]
        data = []
        max_cols = len(header)
        for row in values[1:]:
            padded = row + [''] * (max_cols - len(row))
            data.append(padded)
        return pd.DataFrame(data, columns=header)
    
    df_compra = fetch_df("'📈 Compra Aprovada'!A:Z")
    df_grupos = fetch_df("' 📈 Grupos 10- Imersão Prática Mundo dos Elétricos '!A:Z")
    df_recup = fetch_df("'📈 Recuperação de Vendas'!A:Z")
    
    return df_compra, df_grupos, df_recup

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

def calcular_metricas_grupo(df_compra: pd.DataFrame, df_grupos: pd.DataFrame):
    """
    Cruza a aba de Compras com a aba de Grupos para identificar quem entrou no grupo.
    Retorna (entered_phones, df_valid_compra, df_in_group, df_pendentes).
    """
    if df_compra.empty or df_grupos.empty:
        return set(), pd.DataFrame(), pd.DataFrame(), pd.DataFrame()

    # Garante a existência da coluna normalizada
    if 'TEL_NORM' not in df_compra.columns:
        df_compra['TEL_NORM'] = df_compra['TELEFONE'].apply(normalize_phone) if 'TELEFONE' in df_compra.columns else ""
    if 'TEL_NORM' not in df_grupos.columns:
        df_grupos['TEL_NORM'] = df_grupos['TELEFONE'].apply(normalize_phone) if 'TELEFONE' in df_grupos.columns else ""

    entered_phones = set()
    for _, row in df_grupos.iterrows():
        phone = row.get('TEL_NORM', '')
        if phone:
            entered_phones.add(phone)
                
    df_valid_compra = df_compra[df_compra['TEL_NORM'] != ""]
    df_in_group = df_valid_compra[df_valid_compra['TEL_NORM'].isin(entered_phones)]
    df_pendentes = df_compra[~df_compra['TEL_NORM'].isin(entered_phones)]
    
    return entered_phones, df_valid_compra, df_in_group, df_pendentes
