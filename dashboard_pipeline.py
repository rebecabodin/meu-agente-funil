import os
import pandas as pd
from dotenv import load_dotenv
import re
from googleapiclient.discovery import build
from google.oauth2.service_account import Credentials

load_dotenv()

# Setup Google Sheets API using the existing credentials structure
def get_sheets_service():
    scopes = ['https://www.googleapis.com/auth/spreadsheets']
    creds = Credentials.from_service_account_file('credentials.json', scopes=scopes)
    return build('sheets', 'v4', credentials=creds)

def get_sheet_data_df(service, sheet_id, range_name):
    result = service.spreadsheets().values().get(
        spreadsheetId=sheet_id, range=range_name).execute()
    values = result.get('values', [])
    if not values:
        return pd.DataFrame()
    
    # Fill empty rows to have the same number of columns as the header
    header = values[0]
    max_cols = len(header)
    
    data = []
    for row in values[1:]:
        padded_row = row + [''] * (max_cols - len(row))
        data.append(padded_row)
        
    return pd.DataFrame(data, columns=header)

def normalize_phone(phone):
    if pd.isna(phone):
        return ""
    # Remove spaces, parentheses and dashes
    return re.sub(r'[\s\(\)\-]', '', str(phone))

def main():
    service = get_sheets_service()
    sheet_id = os.getenv("GOOGLE_SHEET_ID")
    if not sheet_id:
        print("Erro: GOOGLE_SHEET_ID não definido no .env")
        return

    print("Baixando dados do Google Sheets...")
    # Fetching Data
    df_compra = get_sheet_data_df(service, sheet_id, "'📈 Compra Aprovada'!A:Z")
    df_grupos = get_sheet_data_df(service, sheet_id, "' 📈 Grupos 10- Imersão Prática Mundo dos Elétricos '!A:Z")
    df_recup = get_sheet_data_df(service, sheet_id, "'📈 Recuperação de Vendas'!A:Z")

    # Normalization
    print("Normalizando telefones...")
    if 'TELEFONE' in df_compra.columns:
        df_compra['TELEFONE_NORM'] = df_compra['TELEFONE'].apply(normalize_phone)
    else:
        print("Aviso: Coluna TELEFONE não encontrada em 'Compra Aprovada'")
        df_compra['TELEFONE_NORM'] = ""

    if 'TELEFONE' in df_grupos.columns:
        df_grupos['TELEFONE_NORM'] = df_grupos['TELEFONE'].apply(normalize_phone)
    else:
        print("Aviso: Coluna TELEFONE não encontrada em 'Grupos 10'")
        df_grupos['TELEFONE_NORM'] = ""

    if 'TELEFONE' in df_recup.columns:
        df_recup['TELEFONE_NORM'] = df_recup['TELEFONE'].apply(normalize_phone)
    else:
        print("Aviso: Coluna TELEFONE não encontrada em 'Recuperação de Vendas'")
        df_recup['TELEFONE_NORM'] = ""

    # Cruzamento 1: Compradores fora do Grupo (sem ENTROU na aba de grupos)
    print("Executando Cruzamento 1...")
    # Get those who 'ENTROU' in groups
    # Assuming there's a column or record indicating 'ENTROU'. The prompt says "não possui registro de 'ENTROU' na aba de Grupos"
    # Will check if any column contains 'ENTROU' or if there's a specific 'Status' column. 
    # Let's assume there's a 'Status' or similar column. If we just look for 'ENTROU' anywhere in the row for that phone:
    entered_phones = set()
    for _, row in df_grupos.iterrows():
        if row.astype(str).str.contains('ENTROU', case=False, na=False).any():
            entered_phones.add(row['TELEFONE_NORM'])
    
    df_cruzamento_1 = df_compra[~df_compra['TELEFONE_NORM'].isin(entered_phones)][['NOME', 'TELEFONE']]
    
    # Cruzamento 2: Falha de Onboarding (Status Mensagem != 'enviado')
    print("Executando Cruzamento 2...")
    # 'Status Mensagem' is Coluna P in 'Compra Aprovada'.
    # In pandas, if we just look for 'Status Mensagem' header, or use the 16th column (index 15).
    # Let's try looking for the column 'Status Mensagem' first.
    col_status = 'Status Mensagem'
    if col_status not in df_compra.columns:
        # Try to get the 16th column if it exists
        if len(df_compra.columns) >= 16:
            col_status = df_compra.columns[15]

    if col_status in df_compra.columns:
        # Filter where != 'enviado'
        df_cruzamento_2 = df_compra[df_compra[col_status].str.lower().str.strip() != 'enviado'][['NOME', 'TELEFONE']]
    else:
        print("Aviso: Coluna P ('Status Mensagem') não encontrada.")
        df_cruzamento_2 = pd.DataFrame(columns=['NOME', 'TELEFONE'])

    # Cruzamento 3: Leads de Recuperação Perdidos (Na recuperação, mas não na Compra Aprovada)
    print("Executando Cruzamento 3...")
    bought_phones = set(df_compra['TELEFONE_NORM'])
    df_cruzamento_3 = df_recup[~df_recup['TELEFONE_NORM'].isin(bought_phones)][['NOME', 'TELEFONE']]

    # Relatório Visual (Branding) - Dashboard Tafarel
    print("Criando/Atualizando DASHBOARD_TAFAREL...")
    # Captação (Total from somewhere, maybe we don't have exactly, we can use 0 or count of 'Recuperação'), Compra (Total Compra Aprovada), Grupo (Total 'ENTROU')
    total_compra = len(df_compra)
    total_grupo = len(entered_phones)
    total_captacao = total_compra + len(df_recup)

    perc_compra = (total_compra / total_captacao) if total_captacao > 0 else 0
    perc_grupo = (total_grupo / total_compra) if total_compra > 0 else 0

    dashboard_data = [
        ["Métrica", "Valor", "Conversão (%)", "Status"],
        ["Captação Total", total_captacao, "-", "⚪️"],
        ["Compras Aprovadas", total_compra, perc_compra, "🟡 (Upsell)" if perc_compra > 1.0 else ""],
        ["Membros no Grupo", total_grupo, perc_grupo, "🔴 Atenção" if perc_grupo < 0.9 else "🟢 OK"]
    ]
    
    # Updates to Sheets API
    try:
        # Try to create the sheet if it doesn't exist
        requests = [
            {
                "addSheet": {
                    "properties": {
                        "title": "📊 DASHBOARD_TAFAREL"
                    }
                }
            }
        ]
        service.spreadsheets().batchUpdate(spreadsheetId=sheet_id, body={"requests": requests}).execute()
        print("Aba DASHBOARD_TAFAREL criada.")
    except Exception as e:
        # If it exists, it will throw an exception
        print("Aba DASHBOARD_TAFAREL já existe ou ocorreu um erro:", e)

    # Now write the data and format it
    body = {
        "values": dashboard_data
    }
    service.spreadsheets().values().update(
        spreadsheetId=sheet_id, range="'📊 DASHBOARD_TAFAREL'!A1:D4",
        valueInputOption="USER_ENTERED", body=body).execute()

    # Get the sheetId of DASHBOARD_TAFAREL for formatting
    spreadsheet = service.spreadsheets().get(spreadsheetId=sheet_id).execute()
    dashboard_sheet_id = None
    for sheet in spreadsheet.get('sheets', []):
        if sheet.get('properties', {}).get('title') == '📊 DASHBOARD_TAFAREL':
            dashboard_sheet_id = sheet.get('properties', {}).get('sheetId')
            break

    if dashboard_sheet_id is not None:
        # Formatting requests
        format_requests = [
            {
                "repeatCell": {
                    "range": {
                        "sheetId": dashboard_sheet_id,
                        "startRowIndex": 0,
                        "endRowIndex": 1,
                        "startColumnIndex": 0,
                        "endColumnIndex": 4
                    },
                    "cell": {
                        "userEnteredFormat": {
                            "backgroundColor": {
                                "red": 0.0,
                                "green": 0.0,
                                "blue": 0.0
                            },
                            "textFormat": {
                                "foregroundColor": {
                                    "red": 1.0,
                                    "green": 0.843, # 215 / 255 for Gold #FFD700
                                    "blue": 0.0
                                },
                                "bold": True
                            }
                        }
                    },
                    "fields": "userEnteredFormat(backgroundColor,textFormat)"
                }
            },
            {
                "repeatCell": {
                    "range": {
                        "sheetId": dashboard_sheet_id,
                        "startRowIndex": 1,
                        "endRowIndex": 4,
                        "startColumnIndex": 2,
                        "endColumnIndex": 3
                    },
                    "cell": {
                        "userEnteredFormat": {
                            "numberFormat": {
                                "type": "PERCENT",
                                "pattern": "0.00%"
                            }
                        }
                    },
                    "fields": "userEnteredFormat.numberFormat"
                }
            }
        ]
        service.spreadsheets().batchUpdate(spreadsheetId=sheet_id, body={"requests": format_requests}).execute()
        print("Formatação do Dashboard aplicada.")

        # Conditional Formatting: < 90% Amarelo Dourado
        cf_requests = [
            {
                "addConditionalFormatRule": {
                    "rule": {
                        "ranges": [
                            {
                                "sheetId": dashboard_sheet_id,
                                "startRowIndex": 3,
                                "endRowIndex": 4,
                                "startColumnIndex": 2,
                                "endColumnIndex": 3
                            }
                        ],
                        "booleanRule": {
                            "condition": {
                                "type": "NUMBER_LESS",
                                "values": [{"userEnteredValue": "0,9"}]
                            },
                            "format": {
                                "backgroundColor": {
                                    "red": 1.0,
                                    "green": 0.843,
                                    "blue": 0.0
                                },
                                "textFormat": {
                                    "foregroundColor": {
                                        "red": 0.0,
                                        "green": 0.0,
                                        "blue": 0.0
                                    },
                                    "bold": True
                                }
                            }
                        }
                    },
                    "index": 0
                }
            }
        ]
        service.spreadsheets().batchUpdate(spreadsheetId=sheet_id, body={"requests": cf_requests}).execute()
        print("Regra de Formatação Condicional (Alerta < 90%) aplicada.")

    # Write the results of the cruzamentos to CSV or display them
    print("\n--- Resultados dos Cruzamentos ---")
    print("\nCruzamento 1: Compradores fora do Grupo")
    print(df_cruzamento_1.head())
    
    print("\nCruzamento 2: Falha de Onboarding (Status da Mensagem != 'enviado')")
    print(df_cruzamento_2.head())
    
    print("\nCruzamento 3: Leads de Recuperação Perdidos")
    print(df_cruzamento_3.head())

    # Optionally, we could save these DataFrames back to new tabs in the Sheet or to local CSVs
    df_cruzamento_1.to_csv("cruzamento_1_compradores_fora_do_grupo.csv", index=False)
    df_cruzamento_2.to_csv("cruzamento_2_falha_onboarding.csv", index=False)
    df_cruzamento_3.to_csv("cruzamento_3_recuperacao_perdidos.csv", index=False)
    print("\nOs relatórios dos cruzamentos foram salvos localmente como CSV para referência.")

if __name__ == "__main__":
    main()
