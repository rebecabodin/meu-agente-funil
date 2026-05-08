import os
import json
import re
import pandas as pd
import gspread
from google.oauth2.service_account import Credentials
from datetime import datetime, timezone
from dotenv import load_dotenv

load_dotenv()

# Configurações
SCOPES = ['https://www.googleapis.com/auth/spreadsheets.readonly']
SHEET_ID = os.getenv("GOOGLE_SHEET_ID")
CREDS_FILE = os.getenv("GOOGLE_CREDENTIALS_FILE", "credentials.json")

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

def fetch_data():
    creds = Credentials.from_service_account_file(CREDS_FILE, scopes=SCOPES)
    client = gspread.authorize(creds)
    spreadsheet = client.open_by_key(SHEET_ID)

    def get_df(tab_name):
        try:
            ws = spreadsheet.worksheet(tab_name)
            data = ws.get_all_values()
            if not data: return pd.DataFrame()
            header = data[0]
            return pd.DataFrame(data[1:], columns=header)
        except:
            return pd.DataFrame()

    df_compra = get_df('📈 Compra Aprovada')
    df_grupos = get_df(' 📈 Grupos 10- Imersão Prática Mundo dos Elétricos ')
    df_recup = get_df('📈 Recuperação de Vendas')

    # Normalização
    for df in [df_compra, df_grupos, df_recup]:
        if not df.empty and 'TELEFONE' in df.columns:
            df['TEL_NORM'] = df['TELEFONE'].apply(normalize_phone)
        else:
            df['TEL_NORM'] = ""

    # Deduplicação
    df_compra = df_compra.drop_duplicates(subset=['TEL_NORM', 'NOME'], keep='first') if not df_compra.empty else df_compra
    df_recup = df_recup.drop_duplicates(subset=['TEL_NORM', 'NOME'], keep='first') if not df_recup.empty else df_recup
    df_grupos = df_grupos.drop_duplicates(subset=['TEL_NORM'], keep='first') if not df_grupos.empty else df_grupos

    return df_compra, df_grupos, df_recup

def process_metrics(df_compra, df_grupos, df_recup):
    # 1. KPIs Básicos
    total_sales = len(df_compra)
    vendas_recuperadas = 0
    
    # 2. Onboarding
    entered_phones = set(df_grupos[df_grupos['TEL_NORM'] != '']['TEL_NORM'])
    df_in_group = df_compra[df_compra['TEL_NORM'].isin(entered_phones)]
    in_group_real = len(df_in_group)
    taxa_onboarding = round((in_group_real / total_sales * 100), 2) if total_sales > 0 else 0
    onboarding_gap = total_sales - in_group_real

    # 3. Faturamento
    faturamento = 0.0
    if 'GROSS PRICE' in df_compra.columns:
        faturamento = df_compra['GROSS PRICE'].apply(parse_currency).sum()

    # 4. Status de Envios
    def get_status_counts(df, status_col):
        if df.empty or status_col not in df.columns:
            return {"total": len(df), "enviados": 0, "sem_tel": 0, "pendentes": len(df)}
        
        stats = df[status_col].fillna('').str.lower().str.strip()
        sem_tel = len(df[df['TELEFONE'].str.strip() == ""])
        enviados = len(df[stats.str.contains('enviado|ok|sucesso|entregue', na=False)])
        
        return {
            "total": len(df),
            "enviados": enviados,
            "sem_tel": sem_tel,
            "pendentes": len(df) - enviados - sem_tel
        }

    status_compra = get_status_counts(df_compra, 'Status Mensagem')
    status_recup = get_status_counts(df_recup, 'STATUS PÓS AUTOMAÇÃO')
    
    # Vendas Recuperadas Real
    if 'STATUS PÓS AUTOMAÇÃO' in df_recup.columns:
        vendas_recuperadas = len(df_recup[df_recup['STATUS PÓS AUTOMAÇÃO'].str.lower().str.strip() == 'comprou'])

    # 5. DNA do Comprador
    mix_pagamento = []
    parcelamento_medio = 1.0
    if 'FORMA_PAGAMENTO' in df_compra.columns:
        counts = df_compra['FORMA_PAGAMENTO'].value_counts()
        total = counts.sum()
        mix_pagamento = [{"name": k, "value": round(v/total*100, 1)} for k, v in counts.items()]

    if 'PARCELAMENTO' in df_compra.columns:
        parc_series = pd.to_numeric(df_compra['PARCELAMENTO'], errors='coerce').dropna()
        if not parc_series.empty:
            parcelamento_medio = round(parc_series.mean(), 1)

    top_estados = []
    if 'ESTADO' in df_compra.columns:
        counts = df_compra['ESTADO'].replace('', 'N/I').value_counts().head(5)
        top_estados = [{"name": k, "value": int(v)} for k, v in counts.items()]

    # 6. Janela de Oportunidade
    series_hora = []
    dia_de_ouro = "N/A"
    hora_do_rush = "N/A"
    
    d_col = next((c for c in df_compra.columns if 'DATA' in c.upper()), None)
    if d_col:
        df_compra['DT'] = pd.to_datetime(df_compra[d_col], dayfirst=True, errors='coerce')
        df_compra_dt = df_compra.dropna(subset=['DT'])
        if not df_compra_dt.empty:
            h_counts = df_compra_dt['DT'].dt.hour.value_counts().reindex(range(24), fill_value=0)
            series_hora = [{"hora": f"{h:02d}h", "vendas": int(v)} for h, v in h_counts.items()]
            
            dia_pico = df_compra_dt['DT'].dt.strftime('%d/%m').value_counts().idxmax()
            hora_pico = h_counts.idxmax()
            dia_de_ouro = dia_pico
            hora_do_rush = f"{hora_pico:02d}:00h"

    # 7. Listas de Ação
    recuperacao_lista = df_recup[df_recup['TELEFONE'].str.strip() != ""].head(10)[['NOME', 'TELEFONE']].to_dict('records')
    onboarding_lista = df_compra[~df_compra['TEL_NORM'].isin(entered_phones)].head(10)[['NOME', 'TELEFONE']].to_dict('records')

    return {
        "updated_at": datetime.now(timezone.utc).strftime("%d/%m/%Y %H:%M UTC"),
        "faturamento": faturamento,
        "vendas_aprovadas": total_sales,
        "vendas_recuperadas": vendas_recuperadas,
        "taxa_onboarding": taxa_onboarding,
        "oportunidades": len(df_recup),
        "leads_whatsapp": len(df_recup[df_recup['TELEFONE'].str.strip() != ""]),
        "leads_email": len(df_recup[df_recup['TELEFONE'].str.strip() == ""]),
        "potencial_estimado": len(df_recup) * 19.0,
        "membros_no_grupo": in_group_real,
        "onboarding_gap": onboarding_gap,
        "status_compra": status_compra,
        "status_recup": status_recup,
        "mix_pagamento": mix_pagamento,
        "top_estados": top_estados,
        "parcelamento_medio": parcelamento_medio,
        "dia_de_ouro": dia_de_ouro,
        "hora_do_rush": hora_do_rush,
        "series_hora": series_hora,
        "recuperacao_lista": recuperacao_lista,
        "onboarding_lista": onboarding_lista,
        "gargalos": {
            "ghost_leads": len(df_recup),
            "only_email": len(df_recup[df_recup['TELEFONE'].str.strip() == ""]),
            "onboarding_gap": onboarding_gap
        }
    }

if __name__ == "__main__":
    try:
        df_c, df_g, df_r = fetch_data()
        metricas = process_metrics(df_c, df_g, df_r)
        
        os.makedirs("docs", exist_ok=True)
        with open("docs/data.json", "w", encoding="utf-8") as f:
            json.dump(metricas, f, ensure_ascii=False, indent=2)
        with open("v2/public/data.json", "w", encoding="utf-8") as f:
            json.dump(metricas, f, ensure_ascii=False, indent=2)
            
        print(f"🚀 Sincronização REAL concluída! Faturamento: R$ {metricas['faturamento']:.2f}")
    except Exception as e:
        print(f"❌ Erro na sincronização: {e}")
