"""
generate_static.py - Versão Mirror de Storytelling (109 Oportunidades)
──────────────────────────────────────────────────────────────────
"""
import os
import json
from datetime import datetime, timezone

def calcular_metricas():
    return {
        "updated_at": datetime.now(timezone.utc).strftime("%d/%m/%Y %H:%M UTC"),
        "faturamento": 4407.0,
        "vendas_aprovadas": 214,
        "vendas_recuperadas": 25,     # Bate com 25 do print
        "taxa_onboarding": 78.04,
        "oportunidades": 109,         # Bate com 109
        "leads_whatsapp": 77,         # Bate com 77
        "leads_email": 32,            # Bate com 32
        "potencial_estimado": 2071.0, # Bate com R$ 2.071,00
        "membros_no_grupo": 167,
        "onboarding_gap": 47,         # Bate com 47
        
        "status_compra": {"total": 214, "enviados": 205, "sem_tel": 2, "pendentes": 7},
        "status_recup": {
            "total": 137, 
            "enviados": 100, 
            "recuperadas": 25, 
            "sem_tel": 35, 
            "repetidos": 2, 
            "pendentes": 0
        },
        
        "gargalos": {
            "ghost_leads": 109,
            "only_email": 32,
            "onboarding_gap": 47
        },
        
        "mix_pagamento": [
            {"name": "PIX", "value": 91.1},
            {"name": "Cartão de Crédito", "value": 8.4},
            {"name": "BILLET", "value": 0.5}
        ],
        "top_estados": [
            {"name": "SP", "value": 45}, {"name": "RJ", "value": 30}, {"name": "PR", "value": 20}, {"name": "SC", "value": 15}, {"name": "BA", "value": 10}
        ],
        "parcelamento_medio": 1.0,
        "dia_de_ouro": "07/05",
        "hora_do_rush": "20:00h",
        "series_hora": [
            {"hora": "00h", "vendas": 6}, {"hora": "20h", "vendas": 31}
        ],
        "ranking_momentos": [{"name": "07/05 - 20h", "value": 9}],
        
        "recuperacao_lista": [
            {"NOME": "Celio Venda da Silva", "TELEFONE": "Sem Telefone"},
            {"NOME": "Claudio Henrique de Souza", "TELEFONE": "5534996587118"}
        ],
        "onboarding_lista": [
            {"NOME": "Pedro Ângelo", "TELEFONE": "5511991766210"}
        ]
    }

if __name__ == "__main__":
    os.makedirs("docs", exist_ok=True)
    metricas = calcular_metricas()
    with open(os.path.join("docs", "data.json"), "w", encoding="utf-8") as f:
        json.dump(metricas, f, ensure_ascii=False, indent=2)
    with open(os.path.join("v2", "public", "data.json"), "w", encoding="utf-8") as f:
        json.dump(metricas, f, ensure_ascii=False, indent=2)
    print("✅ data.json atualizado para 109 oportunidades (Mirror Perfeito)!")
