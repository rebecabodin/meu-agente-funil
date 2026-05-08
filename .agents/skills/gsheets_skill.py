import os
import pandas as pd
import re
from googleapiclient.discovery import build
from google.oauth2.service_account import Credentials
from dotenv import load_dotenv
import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))
from data_utils import calcular_metricas_grupo

load_dotenv()

def get_sheets_service():
    """Autentica e retorna o serviço da API do Google Sheets."""
    scopes = ['https://www.googleapis.com/auth/spreadsheets.readonly']
    creds = Credentials.from_service_account_file('credentials.json', scopes=scopes)
    return build('sheets', 'v4', credentials=creds)

def fetch_df(range_name):
    """Busca dados de uma aba e retorna como DataFrame."""
    try:
        service = get_sheets_service()
        sheet_id = os.getenv("GOOGLE_SHEET_ID")
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
    except Exception as e:
        print(f"Erro ao acessar aba {range_name}: {e}")
        return pd.DataFrame()

def normalize_phone(phone):
    if pd.isna(phone) or str(phone).strip() == "": return ""
    digits = re.sub(r'\D', '', str(phone))
    if digits.startswith('55') and len(digits) >= 12: return digits[2:4] + digits[-8:]
    elif len(digits) >= 10: return digits[:2] + digits[-8:]
    return digits

from datetime import date, timedelta, datetime

def _parse_period(period: str) -> tuple[date, date]:
    """Converte string de período em objetos date."""
    today = date.today()
    p = (period or "ontem").strip().lower()

    if p == "ontem":
        d = today - timedelta(days=1)
        return d, d
    if p == "hoje":
        return today, today
    if p == "semana":
        return today - timedelta(days=7), today
    if p == "mes":
        return today - timedelta(days=30), today
    
    # Caso seja uma data específica YYYY-MM-DD
    try:
        d = date.fromisoformat(p)
        return d, d
    except:
        return None, None

def get_sheets_analytics(period: str = "ontem"):
    """Realiza o cruzamento de dados filtrado por período e análise de picos."""
    df_compra = fetch_df("'📈 Compra Aprovada'!A:Z")
    df_grupos = fetch_df("' 📈 Grupos 10- Imersão Prática Mundo dos Elétricos '!A:Z")
    df_recup = fetch_df("'📈 Recuperação de Vendas'!A:Z")

    if df_compra.empty:
        return {"erro": "Não foi possível carregar os dados das planilhas."}

    # Identificar coluna de data
    date_col = next((c for c in df_compra.columns if 'DATA' in c.upper()), None)
    
    if date_col:
        df_compra['DT_OBJ'] = pd.to_datetime(df_compra[date_col], dayfirst=True, errors='coerce')
        
        # Filtragem por período
        start_date, end_date = _parse_period(period)
        if start_date:
            mask = (df_compra['DT_OBJ'].dt.date >= start_date) & (df_compra['DT_OBJ'].dt.date <= end_date)
            df_compra_periodo = df_compra[mask].copy()
        else:
            df_compra_periodo = df_compra.copy()
    else:
        df_compra_periodo = df_compra.copy()

    # Normalização
    df_compra_periodo['TEL_NORM'] = df_compra_periodo['TELEFONE'].apply(normalize_phone) if 'TELEFONE' in df_compra_periodo.columns else ""
    df_grupos['TEL_NORM'] = df_grupos['TELEFONE'].apply(normalize_phone) if 'TELEFONE' in df_grupos.columns else ""
    df_recup['TEL_NORM'] = df_recup['TELEFONE'].apply(normalize_phone) if 'TELEFONE' in df_recup.columns else ""

    # Utiliza o motor central de cruzamento (DRY)
    entered_phones, df_valid_compra, df_in_group, _ = calcular_metricas_grupo(df_compra_periodo, df_grupos)
    
    total_compras = len(df_compra_periodo)
    no_grupo = len(df_in_group)
    taxa_onboarding = (no_grupo / total_compras) if total_compras > 0 else 0

    # Análise de Picos (Horário)
    pico_str = "N/A"
    if not df_compra_periodo.empty and 'DT_OBJ' in df_compra_periodo.columns:
        df_compra_periodo['Hora'] = df_compra_periodo['DT_OBJ'].dt.hour
        vendas_por_hora = df_compra_periodo['Hora'].value_counts()
        if not vendas_por_hora.empty:
            hora_pico = vendas_por_hora.idxmax()
            qtd_pico = vendas_por_hora.max()
            pico_str = f"{int(hora_pico):02d}:00h ({qtd_pico} vendas)"

    # Recuperação (Filtro de data na recuperação se houver coluna)
    date_col_rec = next((c for c in df_recup.columns if 'DATA' in c.upper()), None)
    df_recup_periodo = df_recup
    if date_col_rec and start_date:
        df_recup['DT_OBJ'] = pd.to_datetime(df_recup[date_col_rec], dayfirst=True, errors='coerce')
        mask_rec = (df_recup['DT_OBJ'].dt.date >= start_date) & (df_recup['DT_OBJ'].dt.date <= end_date)
        df_recup_periodo = df_recup[mask_rec]

    col_rec_status = 'STATUS PÓS AUTOMAÇÃO'
    vendas_recuperadas = 0
    if col_rec_status in df_recup_periodo.columns:
        vendas_recuperadas = len(df_recup_periodo[df_recup_periodo[col_rec_status].str.lower().str.strip() == 'comprou'])

    return {
        "periodo_desc": period,
        "total_compras": total_compras,
        "membros_grupo": no_grupo,
        "taxa_onboarding": round(taxa_onboarding * 100, 2),
        "vendas_recuperadas": vendas_recuperadas,
        "pendentes_grupo": total_compras - no_grupo,
        "pico_horario": pico_str
    }

def format_sheets_summary(analytics: dict) -> str:
    """Formata os dados do Sheets para o agente com tom analítico."""
    if "erro" in analytics:
        return f"❌ Erro nas Planilhas: {analytics['erro']}"
    
    lines = [
        f"📊 Insights das Planilhas (Google Sheets) — {analytics['periodo_desc']}",
        f"  • Vendas Aprovadas:   {analytics['total_compras']} confirmações",
        f"  • Membros no Grupo:   {analytics['membros_grupo']} ({analytics['taxa_onboarding']}%)",
        f"  • Pendentes de Grupo: {analytics['pendentes_grupo']} alunos ⚠️"
    ]
    
    if analytics['vendas_recuperadas'] > 0:
        lines.append(f"  • Vendas Recuperadas: {analytics['vendas_recuperadas']} conversões 💰")
        
    if analytics['pico_horario'] != "N/A":
        lines.append(f"  • Pico de Conversão:  {analytics['pico_horario']} 🔥")
        
    return "\n".join(lines)
