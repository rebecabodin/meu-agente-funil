"""
agent.py — Agente Analista de Funil
Ponto de entrada principal do agente.

Uso:
  python agent.py
  python agent.py --pergunta "Quanto gastei no disparo de ontem?"
  python agent.py --periodo semana --flow <FLOW_ID>
"""

import sys
import os
import argparse
import re
from datetime import date
from dotenv import load_dotenv

load_dotenv()

# Configuração de path para acessar o diretório oculto .agents
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
AGENTS_PATH = os.path.join(BASE_DIR, ".agents")
if AGENTS_PATH not in sys.path:
    sys.path.append(AGENTS_PATH)

from skills.meta_skill import get_whatsapp_analytics, format_summary as meta_summary
from skills.manychat_skill import list_flows, get_funnel_breakdown, format_funnel_summary
from skills.gsheets_skill import get_sheets_analytics, format_sheets_summary


SEPARATOR = "─" * 60


def analisar_funil(period: str = None, flow_id: str = None) -> str:
    """
    Consolida dados da Meta, ManyChat e Sheets e retorna um relatório analítico limpo.
    """
    period = period or os.getenv("AGENTE_PERIODO_PADRAO", "ontem")
    secoes = []

    # ── Meta Analytics ────────────────────────────────────────────────────
    try:
        analytics = get_whatsapp_analytics(period)
        secoes.append(meta_summary(analytics))
    except Exception:
        # Omite erro técnico da Meta para manter o dash limpo
        pass

    # ── ManyChat Funil ────────────────────────────────────────────────────
    try:
        if not flow_id:
            flows = list_flows()
            if flows:
                flow_id = flows[0].get("ns") or flows[0].get("id")

        if flow_id:
            breakdown = get_funnel_breakdown(flow_id, period)
            # Só adiciona se houver dados reais de funil
            if breakdown.get("funil"):
                secoes.append(format_funnel_summary(breakdown))
    except Exception:
        pass

    # ── Google Sheets Insights ───────────────────────────────────────────
    try:
        sheets_data = get_sheets_analytics(period=period)
        if "erro" not in sheets_data:
            secoes.append(format_sheets_summary(sheets_data))
        else:
            secoes.append(f"❌ DEBUG: Erro interno Sheets: {sheets_data['erro']}")
    except Exception as e:
        secoes.append(f"❌ DEBUG: Erro no Sheets: {str(e)} | Tipo: {type(e).__name__}")

    if not secoes:
        return "⚠️ Não foi possível recuperar dados das APIs no momento. Por favor, verifique as configurações no arquivo .env."

    # Montagem final do relatório
    relatorio = [
        SEPARATOR,
        f"📊 Relatório do Agente Analista — período: {period}",
        SEPARATOR,
        ""
    ]
    relatorio.extend(secoes)
    relatorio.append(SEPARATOR)
    
    return "\n\n".join(relatorio)


def extrair_periodo(pergunta: str) -> str:
    """Extrai o período a partir de uma pergunta em linguagem natural."""
    if not pergunta:
        return None
    
    p = pergunta.lower()
    if "ontem" in p: return "ontem"
    if "hoje" in p: return "hoje"
    if "semana" in p: return "semana"
    if "mês" in p or "mes" in p: return "mes"
    
    # Extração de dia específico (ex: "dia 29" ou "do dia 29")
    match = re.search(r'(?:dia|data)\s+(\d{1,2})', p)
    if not match:
        match = re.search(r'\b(\d{1,2})\b', p)
        
    if match:
        dia = int(match.group(1))
        hoje = date.today()
        # Assume o mês e ano atual
        return f"{hoje.year}-{hoje.month:02d}-{dia:02d}"

    return None


def main():
    parser = argparse.ArgumentParser(
        description="Agente Analista de Funil — Meta + ManyChat"
    )
    parser.add_argument(
        "--pergunta",
        type=str,
        default=None,
        help="Pergunta em linguagem natural (ex: 'Quanto gastei ontem?')",
    )
    parser.add_argument(
        "--periodo",
        type=str,
        default=None,
        help="Período: ontem, hoje, semana, mes, YYYY-MM-DD ou YYYY-MM-DD:YYYY-MM-DD",
    )
    parser.add_argument(
        "--flow",
        type=str,
        default=None,
        help="ID do flow ManyChat a analisar (padrão: primeiro flow disponível)",
    )
    args = parser.parse_args()

    # Extração simples do período
    period = args.periodo or extrair_periodo(args.pergunta)

    relatorio = analisar_funil(period=period, flow_id=args.flow)
    print(relatorio)


if __name__ == "__main__":
    main()
