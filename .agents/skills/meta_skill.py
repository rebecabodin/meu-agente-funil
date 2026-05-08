"""
meta_skill.py — Meta WhatsApp Business Analytics
Agente: Analista de Funil

Busca métricas de 'sent', 'delivered' e 'read' do WhatsApp Business
via Meta Graph API v19.0.

Variáveis de ambiente:
  META_ACCESS_TOKEN    - Token da Meta Graph API
  META_WABA_ID         - WhatsApp Business Account ID
  META_PHONE_NUMBER_ID - ID do número remetente

Referência: https://developers.facebook.com/docs/whatsapp/business-management-api/analytics
"""

import os
import logging
from datetime import date, timedelta, datetime
from typing import Optional

import requests
from dotenv import load_dotenv

load_dotenv()

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [META] %(levelname)s %(message)s"
)
logger = logging.getLogger(__name__)

META_GRAPH_BASE = "https://graph.facebook.com/v19.0"
# Custo por conversa tier Brasil 2024 (ajuste conforme seu tier)
CUSTO_POR_CONVERSA_BRL = 0.30


def _get_credentials() -> dict:
    creds = {
        "access_token": os.getenv("META_ACCESS_TOKEN"),
        "waba_id": os.getenv("META_WABA_ID"),
        "phone_number_id": os.getenv("META_PHONE_NUMBER_ID"),
    }
    missing = [k for k, v in creds.items() if not v]
    if missing:
        raise EnvironmentError(
            f"Variáveis ausentes para Meta: {', '.join(missing)}. Verifique o .env"
        )
    return creds


def _parse_period(period: str) -> tuple[str, str]:
    """
    Converte período em datas (YYYY-MM-DD).
    Aceita: 'ontem', 'hoje', 'semana', 'mes', 'YYYY-MM-DD', 'YYYY-MM-DD:YYYY-MM-DD'
    """
    today = date.today()
    p = period.strip().lower()

    if p == "ontem":
        d = today - timedelta(days=1)
        return d.isoformat(), d.isoformat()
    if p == "hoje":
        return today.isoformat(), today.isoformat()
    if p == "semana":
        return (today - timedelta(days=7)).isoformat(), today.isoformat()
    if p == "mes":
        return (today - timedelta(days=30)).isoformat(), today.isoformat()
    if ":" in p:
        start, end = p.split(":", 1)
        return start.strip(), end.strip()
    return p, p


def _unix_ts(date_str: str, end_of_day: bool = False) -> int:
    dt = datetime.fromisoformat(date_str)
    if end_of_day:
        dt = dt.replace(hour=23, minute=59, second=59)
    return int(dt.timestamp())


def get_whatsapp_analytics(period: str = "ontem") -> dict:
    """
    Busca métricas de envio/entrega/leitura do WhatsApp Business.

    Returns:
        {
          "periodo": {"inicio": str, "fim": str},
          "metricas": {"sent": int, "delivered": int, "read": int},
          "taxas": {"entrega_pct": float, "leitura_pct": float, "leitura_sobre_enviados_pct": float},
          "custo_estimado": {"conversas": int, "valor_brl": float, "custo_por_conversa_brl": float},
          "raw": dict
        }
    """
    creds = _get_credentials()
    start_date, end_date = _parse_period(period)
    logger.info(f"Buscando analytics | {start_date} → {end_date}")

    url = f"{META_GRAPH_BASE}/{creds['waba_id']}/analytics"
    params = {
        "access_token": creds["access_token"],
        "start": _unix_ts(start_date),
        "end": _unix_ts(end_date, end_of_day=True),
        "granularity": "DAY",
        "phone_numbers": [creds["phone_number_id"]],
        "product_types": ["MESSAGES"],
    }

    resp = requests.get(url, params=params, timeout=30)
    if not resp.ok:
        logger.error(f"Erro Meta API: {resp.status_code} — {resp.text}")
        resp.raise_for_status()

    raw = resp.json()

    sent = delivered = read = 0
    for point in raw.get("data", {}).get("data_points", []):
        sent += point.get("sent", 0)
        delivered += point.get("delivered", 0)
        read += point.get("read", 0)

    entrega_pct = round(delivered / sent * 100, 2) if sent else 0.0
    leitura_pct = round(read / delivered * 100, 2) if delivered else 0.0
    leitura_sobre_env = round(read / sent * 100, 2) if sent else 0.0
    custo_brl = round(delivered * CUSTO_POR_CONVERSA_BRL, 2)

    result = {
        "periodo": {"inicio": start_date, "fim": end_date},
        "metricas": {"sent": sent, "delivered": delivered, "read": read},
        "taxas": {
            "entrega_pct": entrega_pct,
            "leitura_pct": leitura_pct,
            "leitura_sobre_enviados_pct": leitura_sobre_env,
        },
        "custo_estimado": {
            "conversas": delivered,
            "valor_brl": custo_brl,
            "custo_por_conversa_brl": CUSTO_POR_CONVERSA_BRL,
        },
        "raw": raw,
    }
    logger.info(
        f"Enviados: {sent} | Entregues: {delivered} ({entrega_pct}%) "
        f"| Lidos: {read} ({leitura_sobre_env}%) | Custo: R$ {custo_brl}"
    )
    return result


def get_template_metrics(template_name: Optional[str] = None, period: str = "ontem") -> dict:
    """
    Busca métricas por template de mensagem.

    Args:
        template_name: Nome do template (None = todos).
        period: Período de análise.
    """
    creds = _get_credentials()
    start_date, end_date = _parse_period(period)

    url = f"{META_GRAPH_BASE}/{creds['waba_id']}/template_analytics"
    params = {
        "access_token": creds["access_token"],
        "start": _unix_ts(start_date),
        "end": _unix_ts(end_date, end_of_day=True),
        "granularity": "DAY",
    }
    if template_name:
        params["template_ids"] = template_name

    resp = requests.get(url, params=params, timeout=30)
    if not resp.ok:
        logger.error(f"Erro template metrics: {resp.status_code} — {resp.text}")
        resp.raise_for_status()

    return resp.json()


def format_summary(analytics: dict) -> str:
    """Formata métricas da Meta em texto legível para o agente."""
    p = analytics["periodo"]
    m = analytics["metricas"]
    t = analytics["taxas"]
    c = analytics["custo_estimado"]

    periodo_str = p["inicio"] if p["inicio"] == p["fim"] else f'{p["inicio"]} a {p["fim"]}'

    return "\n".join([
        f"🟦 Meta WhatsApp Business — {periodo_str}",
        f"  • Enviados:   {m['sent']:,} mensagens",
        f"  • Entregues:  {m['delivered']:,} ({t['entrega_pct']}%)",
        f"  • Lidos:      {m['read']:,} ({t['leitura_sobre_enviados_pct']}% dos enviados | {t['leitura_pct']}% dos entregues)",
        f"  • Custo est.: R$ {c['valor_brl']:.2f} (~{c['conversas']:,} conversas × R$ {c['custo_por_conversa_brl']:.2f})",
    ])


if __name__ == "__main__":
    try:
        data = get_whatsapp_analytics("ontem")
        print(format_summary(data))
    except EnvironmentError as e:
        print(f"❌ {e}")
    except requests.HTTPError as e:
        print(f"❌ Erro Meta API: {e}")
