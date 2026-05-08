"""
manychat_skill.py — ManyChat Flow Analytics
Agente: Analista de Funil

Busca métricas de conversão por etapa dos Flows do ManyChat via API REST.

Variáveis de ambiente:
  MANYCHAT_API_TOKEN - Token da API do ManyChat
  MANYCHAT_PAGE_ID   - ID da página/bot no ManyChat

Referência: https://api.manychat.com
Endpoint correto: GET /fb/page/getFlows  (retorna: ns, name, folder_id)
"""

import os
import logging
from datetime import date, timedelta
from typing import Optional

import requests
from dotenv import load_dotenv

load_dotenv()

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [MANYCHAT] %(levelname)s %(message)s"
)
logger = logging.getLogger(__name__)

MANYCHAT_BASE = "https://api.manychat.com"


def _get_credentials() -> dict:
    creds = {
        "api_token": os.getenv("MANYCHAT_API_TOKEN"),
        "page_id": os.getenv("MANYCHAT_PAGE_ID"),
    }
    missing = [k for k, v in creds.items() if not v]
    if missing:
        raise EnvironmentError(
            f"Variáveis ausentes para ManyChat: {', '.join(missing)}. Verifique o .env"
        )
    return creds


def _auth_headers(api_token: str, page_id: str = "") -> dict:
    """
    Monta o header de autenticação do ManyChat.
    O formato exigido é: Bearer <pageId>:<apiKey>
    Ex: Bearer 2998788:ebe9835496475f0176bc5bf98bec3fcc

    Remove o prefixo 'fb' do page_id caso esteja presente.
    """
    clean_page_id = page_id.lstrip("fb") if page_id else ""
    token = f"{clean_page_id}:{api_token}" if clean_page_id else api_token
    return {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json",
    }


def _parse_period(period: str) -> tuple[str, str]:
    """Mesmo parser do meta_skill para consistência."""
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


# ── Funções principais ─────────────────────────────────────────────────────

def list_flows() -> list[dict]:
    """
    Lista todos os Flows do bot ManyChat.

    Endpoint oficial: GET /fb/page/getFlows
    Retorna flows com: ns (namespace = ID único), name, folder_id.

    Returns:
        Lista de dicts com {ns, name, folder_id} de cada flow.
    """
    creds = _get_credentials()
    url = f"{MANYCHAT_BASE}/fb/page/getFlows"
    headers = _auth_headers(creds["api_token"], creds["page_id"])

    resp = requests.get(url, headers=headers, timeout=30)
    if not resp.ok:
        logger.error(f"Erro ao listar flows: {resp.status_code} — {resp.text}")
        resp.raise_for_status()

    data = resp.json()
    # Resposta: { status: "success", data: { flows: [...], folders: [...] } }
    flows = data.get("data", {}).get("flows", [])
    folders = data.get("data", {}).get("folders", [])
    logger.info(f"{len(flows)} flow(s) e {len(folders)} pasta(s) encontrados")
    return flows


def get_flow_content(flow_ns: str) -> dict:
    """
    Busca o conteúdo detalhado (steps, mensagens, botões) de um Flow.
    
    Endpoint: GET /fb/page/getFlow?ns=<flow_ns>
    """
    creds = _get_credentials()
    url = f"{MANYCHAT_BASE}/fb/page/getFlow"
    headers = _auth_headers(creds["api_token"], creds["page_id"])
    params = {"ns": flow_ns}

    resp = requests.get(url, headers=headers, params=params, timeout=30)
    if not resp.ok:
        logger.error(f"Erro ao buscar conteúdo do flow {flow_ns}: {resp.status_code}")
        resp.raise_for_status()

    return resp.json().get("data", {})


def get_flow_stats(flow_ns: str, period: str = "ontem") -> dict:
    """
    Busca metadados de um Flow pelo seu namespace (ns).

    Nota: A API pública do ManyChat não expõe métricas por step via REST.
    Para análise de funil detalhada, configure Bot Fields como contadores.

    Args:
        flow_ns: Campo 'ns' retornado por list_flows().
        period:  Período informativo.
    """
    start_date, end_date = _parse_period(period)
    flows = list_flows()
    flow_data = next((f for f in flows if f.get("ns") == flow_ns), None)

    if not flow_data:
        raise ValueError(f"Flow ns='{flow_ns}' não encontrado. Use list_flows() para listar.")

    return {
        "flow_ns": flow_ns,
        "flow_name": flow_data.get("name", flow_ns),
        "folder_id": flow_data.get("folder_id"),
        "periodo": {"inicio": start_date, "fim": end_date},
        "raw": flow_data,
    }


def get_funnel_breakdown(flow_ns: str, period: str = "ontem") -> dict:
    """
    Retorna breakdown do funil para um Flow usando Bot Fields como contadores.

    A API pública do ManyChat não expõe métricas por step diretamente.
    Configure Bot Fields (tipo number) nomeados 'etapa_1', 'etapa_2', etc.
    e incremente-os via ação 'Set Bot Field' em cada step do flow.

    Args:
        flow_ns: Namespace do flow (campo 'ns' de list_flows()).
        period: Período de análise.
    """
    creds = _get_credentials()
    start_date, end_date = _parse_period(period)

    flows = list_flows()
    flow_data = next((f for f in flows if f.get("ns") == flow_ns), None)
    flow_name = flow_data.get("name", flow_ns) if flow_data else flow_ns

    # Busca Bot Fields para encontrar contadores de etapa
    url = f"{MANYCHAT_BASE}/fb/page/getBotFields"
    headers = _auth_headers(creds["api_token"], creds["page_id"])
    resp = requests.get(url, headers=headers, timeout=30)

    contadores = []
    if resp.ok:
        bot_fields = resp.json().get("data", [])
        contadores = sorted(
            [f for f in bot_fields if f.get("name", "").lower().startswith("etapa_")],
            key=lambda x: x.get("name", "")
        )
        logger.info(f"{len(contadores)} contador(es) de etapa encontrado(s)")

    if contadores:
        funil = []
        entrada = int(contadores[0].get("value") or 1) or 1
        for i, campo in enumerate(contadores):
            usuarios = int(campo.get("value") or 0)
            pct = round(usuarios / entrada * 100, 2)
            queda = 0.0
            if i > 0 and funil:
                prev = funil[-1]["usuarios"]
                queda = round((prev - usuarios) / prev * 100, 2) if prev > 0 else 0.0
            funil.append({
                "etapa": campo.get("name"),
                "usuarios": usuarios,
                "pct_inicial": pct,
                "queda_pct": queda,
            })

        mq_item = max(funil[1:], key=lambda x: x["queda_pct"], default=None) if len(funil) > 1 else None
        mq_idx = funil.index(mq_item) if mq_item else -1

        return {
            "flow_name": flow_name,
            "periodo": {"inicio": start_date, "fim": end_date},
            "funil": funil,
            "maior_queda": {
                "de": funil[mq_idx - 1]["etapa"],
                "para": mq_item["etapa"],
                "queda_pct": mq_item["queda_pct"],
            } if mq_item else None,
            "taxa_conversao_total": funil[-1]["pct_inicial"] if funil else 0.0,
        }

    return {
        "flow_name": flow_name,
        "periodo": {"inicio": start_date, "fim": end_date},
        "funil": [],
        "maior_queda": None,
        "taxa_conversao_total": 0.0,
        "aviso": (
            f"Nenhum Bot Field contador encontrado para '{flow_name}'. "
            "Crie Bot Fields (tipo number) nomeados 'etapa_1', 'etapa_2', etc. "
            "e incremente-os em cada step do flow via ação 'Set Bot Field'."
        ),
    }


def format_funnel_summary(breakdown: dict) -> str:
    """Formata o funil em texto legível para o agente."""
    funil = breakdown["funil"]
    p = breakdown.get("periodo", {})
    periodo_str = (
        p.get("inicio", "") if p.get("inicio") == p.get("fim")
        else f'{p.get("inicio", "")} a {p.get("fim", "")}'
    )

    lines = [f"🟩 ManyChat — Flow: {breakdown['flow_name']} — {periodo_str}"]

    if not funil:
        aviso = breakdown.get("aviso", "Sem dados de etapas disponíveis.")
        lines.append(f"  ⚠️  {aviso}")
        return "\n".join(lines)

    for i, etapa in enumerate(funil):
        queda_str = f"  ⬇️ -{etapa['queda_pct']}%" if i > 0 and etapa["queda_pct"] > 0 else ""
        lines.append(
            f"  Etapa {i+1} → {etapa['etapa']}: "
            f"{etapa['usuarios']:,} usuários ({etapa['pct_inicial']}%){queda_str}"
        )

    lines.append(f"\n  📈 Taxa de conversão total: {breakdown['taxa_conversao_total']}%")

    if breakdown.get("maior_queda"):
        mq = breakdown["maior_queda"]
        lines.append(
            f"  ⚠️  Maior queda: entre '{mq['de']}' → '{mq['para']}' (-{mq['queda_pct']}%)"
        )

    return "\n".join(lines)


if __name__ == "__main__":
    import sys

    try:
        flows = list_flows()
        if not flows:
            print("Nenhum flow encontrado.")
            sys.exit(0)

        print(f"✅ Conectado! {len(flows)} flow(s) encontrado(s):")
        for f in flows[:10]:
            print(f"  • [ns={f.get('ns','?')}] {f.get('name','sem nome')}")

    except EnvironmentError as e:
        print(f"❌ {e}")
    except requests.HTTPError as e:
        print(f"❌ Erro ManyChat API: {e}")
