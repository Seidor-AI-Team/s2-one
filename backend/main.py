"""
S2-ONE: Generador de One Pagers de Portafolio
Backend FastAPI — v2.0
"""
import os
import json
import datetime
from pathlib import Path
from fastapi import FastAPI, HTTPException, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

from metrics import calc_portfolio_metrics, calc_validation_overall
from generator import generate_narrative
from security import (
    verify_token,
    limiter,
    rate_limit_exceeded_handler,
    SecurityHeadersMiddleware,
    AuditLogMiddleware,
    mask_portfolio_data,
)

load_dotenv()

app = FastAPI(
    title="S2-ONE — Generador de One Pagers",
    description="POC SEIDOR IA Lab — MWM",
    version="2.1.0",
    dependencies=[Depends(verify_token)],
)

# ── Rate Limiter ──
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, rate_limit_exceeded_handler)

# ── Security Headers ──
app.add_middleware(SecurityHeadersMiddleware)

# ── Audit Logging ──
app.add_middleware(AuditLogMiddleware)

# ── CORS — only allow known frontend origins ──
ALLOWED_ORIGINS = os.getenv(
    "CORS_ORIGINS",
    "http://localhost:5173,http://localhost:5176"
).split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in ALLOWED_ORIGINS],
    allow_methods=["GET", "POST"],
    allow_headers=["Authorization", "Content-Type"],
)

DATA_PATH = Path(__file__).parent / "data" / "portfolios.json"


def load_portfolios() -> list:
    with open(DATA_PATH, encoding="utf-8") as f:
        return json.load(f)["portfolios"]


def find_portfolio(portfolio_id: str) -> dict:
    for p in load_portfolios():
        if p["id"] == portfolio_id:
            return p
    raise HTTPException(status_code=404, detail=f"Portafolio '{portfolio_id}' no encontrado")


@app.get("/")
def root():
    return {"message": "S2-ONE API v2.1 funcionando", "security": "Bearer token required", "endpoints": [
        "GET /api/portfolios",
        "GET /api/portfolios/{id}",
        "POST /api/portfolios/{id}/narrative",
        "POST /api/portfolios/{id}/generate",
        "GET /api/portfolios/{id}/validations",
        "GET /api/portfolios/{id}/history",
        "GET /api/admin/config (admin token)",
        "GET /api/admin/config/status (admin token)",
    ]}


@app.get("/api/portfolios")
@limiter.limit("60/minute")
def list_portfolios(request: Request):
    portfolios = load_portfolios()
    result = []
    for p in portfolios:
        m = calc_portfolio_metrics(p)
        validaciones = p.get("validaciones", {})
        result.append({
            "id": p["id"],
            "nombre": p["nombre"],
            "descripcion": p["descripcion"],
            "patrimonio": p["patrimonio"],
            "moneda": p["moneda"],
            "cliente": p["cliente"],
            "gestor": p["gestor"],
            "benchmark": p.get("benchmark"),
            "wtd": m["wtd"],
            "mtd": m["mtd"],
            "ytd": m["ytd"],
            "alpha_wtd": m.get("alpha_wtd"),
            "alpha_mtd": m.get("alpha_mtd"),
            "alpha_ytd": m.get("alpha_ytd"),
            "ultima_generacion": p.get("ultima_generacion"),
            "validacion_status": calc_validation_overall(validaciones),
        })
    return {"portfolios": result}


@app.get("/api/portfolios/{portfolio_id}")
@limiter.limit("60/minute")
def get_portfolio(portfolio_id: str, request: Request):
    portfolio = find_portfolio(portfolio_id)
    metrics = calc_portfolio_metrics(portfolio)
    return {
        "portfolio": mask_portfolio_data(portfolio),
        "metrics": metrics,
    }


@app.post("/api/portfolios/{portfolio_id}/narrative")
@limiter.limit("10/minute")
async def get_narrative(portfolio_id: str, request: Request):
    if not os.getenv("OPENAI_API_KEY"):
        raise HTTPException(status_code=500, detail="OPENAI_API_KEY no configurada")

    portfolio = find_portfolio(portfolio_id)
    metrics = calc_portfolio_metrics(portfolio)
    result = await generate_narrative(portfolio=portfolio, metrics=metrics)
    return result


@app.post("/api/portfolios/{portfolio_id}/generate")
@limiter.limit("10/minute")
async def generate_one_pager(portfolio_id: str, request: Request):
    """
    Simula el pipeline completo de generación del One Pager:
    Bloomberg → SBS/iShares → Métricas → Validación → Narrativa IA → Listo
    """
    portfolio = find_portfolio(portfolio_id)
    metrics = calc_portfolio_metrics(portfolio)
    validaciones = portfolio.get("validaciones", {})
    validacion_overall = calc_validation_overall(validaciones)

    steps = [
        {
            "id": 1,
            "label": "Conectando con Bloomberg",
            "status": "done",
            "ms": 820,
            "detail": f"{sum(1 for a in portfolio.get('activos', []) if a.get('fuente_precio') == 'bloomberg')} activos con precios Bloomberg"
        },
        {
            "id": 2,
            "label": "Descargando precios SBS / iShares",
            "status": "done",
            "ms": 450,
            "detail": f"{sum(1 for a in portfolio.get('activos', []) if a.get('fuente_precio') in ('sbs', 'ishares'))} activos desde fuentes regulatorias"
        },
        {
            "id": 3,
            "label": "Calculando métricas del portafolio",
            "status": "done",
            "ms": 110,
            "detail": f"WTD {metrics['wtd']:+.2f}% | MTD {metrics['mtd']:+.2f}% | YTD {metrics['ytd']:+.2f}%"
        },
        {
            "id": 4,
            "label": "Validando consistencia de datos",
            "status": validacion_overall,
            "ms": 340,
            "detail": _validation_summary(validaciones)
        },
    ]

    narrative_result = None
    if os.getenv("OPENAI_API_KEY"):
        narrative_result = await generate_narrative(portfolio=portfolio, metrics=metrics)
        narrative_status = "done"
        narrative_detail = f"Driver principal: {narrative_result.get('key_driver', 'N/A')}"
    else:
        narrative_result = {
            "narrative": "Narrativa IA no disponible — configure OPENAI_API_KEY.",
            "key_driver": "N/A",
            "generated_at": datetime.datetime.now().isoformat(),
        }
        narrative_status = "skipped"
        narrative_detail = "OPENAI_API_KEY no configurada"

    steps.extend([
        {
            "id": 5,
            "label": "Generando narrativa con IA (GPT-4o)",
            "status": narrative_status,
            "ms": 2100,
            "detail": narrative_detail
        },
        {
            "id": 6,
            "label": "One Pager listo",
            "status": "done",
            "ms": 50,
            "detail": f"Versión {(portfolio.get('ultima_generacion') or {}).get('version', 0) + 1}"
        },
    ])

    return {
        "steps": steps,
        "metrics": metrics,
        "narrative": narrative_result.get("narrative"),
        "key_driver": narrative_result.get("key_driver"),
        "generated_at": datetime.datetime.now().isoformat(),
    }


@app.get("/api/portfolios/{portfolio_id}/validations")
@limiter.limit("60/minute")
def get_validations(portfolio_id: str, request: Request):
    """Retorna el detalle de validaciones cruzadas del portafolio."""
    portfolio = find_portfolio(portfolio_id)
    validaciones = portfolio.get("validaciones", {})
    checks = []

    label_map = {
        "stock_vs_eecc": "Stock vs EECC bancarios",
        "patrimonio_vs_cuotas": "Patrimonio vs Valor Cuota × N° Cuotas",
        "precios_input_vs_output": "Precios input vs output",
    }

    for key, val in validaciones.items():
        if isinstance(val, dict):
            checks.append({
                "nombre": label_map.get(key, key),
                "status": val.get("status", "ok"),
                "detalle": val.get("detalle", ""),
                **{k: v for k, v in val.items() if k not in ("status", "detalle")},
            })

    return {
        "portfolio_id": portfolio_id,
        "fecha": datetime.date.today().isoformat(),
        "checks": checks,
        "overall": calc_validation_overall(validaciones),
    }


@app.get("/api/portfolios/{portfolio_id}/history")
@limiter.limit("60/minute")
def get_history(portfolio_id: str, request: Request):
    """Retorna historial de las últimas generaciones del One Pager (mock)."""
    portfolio = find_portfolio(portfolio_id)
    ultima = portfolio.get("ultima_generacion", {})
    version = ultima.get("version", 1)
    generado_por = ultima.get("generado_por", "Sistema")

    history = []
    if ultima:
        history.append({**ultima})

    if version >= 2:
        history.append({
            "fecha": "2026-04-03T16:15:00",
            "generado_por": generado_por,
            "version": version - 1,
            "estado": "enviado",
        })
    if version >= 3:
        history.append({
            "fecha": "2026-03-28T17:00:00",
            "generado_por": "L. Rosillo",
            "version": version - 2,
            "estado": "revisado",
        })

    return {"portfolio_id": portfolio_id, "history": history}


def _validation_summary(validaciones: dict) -> str:
    warnings = [v.get("detalle", "") for v in validaciones.values()
                if isinstance(v, dict) and v.get("status") in ("warning", "error")]
    if warnings:
        return f"{len(warnings)} alerta(s): {warnings[0]}"
    return "Todas las validaciones pasaron correctamente"


# ═══════════════════════════════════════════════════════════════════════════════
# CONFIGURACIÓN DE INTEGRACIONES
# ═══════════════════════════════════════════════════════════════════════════════

CONFIG_PATH = Path(__file__).parent / "data" / "config.json"


def load_config() -> dict:
    """Carga la configuración de integraciones desde config.json"""
    if not CONFIG_PATH.exists():
        return {"error": "Archivo de configuración no encontrado"}
    with open(CONFIG_PATH, encoding="utf-8") as f:
        return json.load(f)


def save_config(config: dict) -> None:
    """Guarda la configuración en config.json"""
    config["ultima_actualizacion"] = datetime.datetime.now().isoformat()
    with open(CONFIG_PATH, "w", encoding="utf-8") as f:
        json.dump(config, f, indent=2, ensure_ascii=False)


@app.get("/api/admin/config")
@limiter.limit("30/minute")
def get_config(request: Request):
    """
    Retorna la configuración completa de integraciones y fuentes de datos.
    Incluye estado de conexión de Bloomberg, SBS, iShares, bancos y OpenAI.
    """
    return load_config()


@app.get("/api/admin/config/status")
@limiter.limit("30/minute")
def get_config_status(request: Request):
    """
    Retorna un resumen rápido del estado de todas las integraciones.
    Útil para el dashboard de status.
    """
    config = load_config()
    integraciones = config.get("integraciones", {})

    status_summary = {}
    for key, integ in integraciones.items():
        if key == "bancos_custodia":
            bancos = integ.get("bancos_configurados", [])
            conectados = sum(1 for b in bancos if b.get("estado") == "conectado")
            status_summary[key] = {
                "nombre": integ.get("nombre"),
                "estado": integ.get("estado_global", "desconocido"),
                "habilitado": integ.get("habilitado", False),
                "detalle": f"{conectados}/{len(bancos)} bancos conectados",
                "ultimo_sync": max(
                    (b.get("ultimo_sync") for b in bancos if b.get("ultimo_sync")),
                    default=None
                ) if bancos else None
            }
        else:
            status_summary[key] = {
                "nombre": integ.get("nombre"),
                "estado": integ.get("estado", "desconocido"),
                "habilitado": integ.get("habilitado", False),
                "requests_hoy": integ.get("usado_hoy") or integ.get("requests_hoy", 0),
                "limite": integ.get("limite_requests") or integ.get("limite_diario"),
                "ultimo_check": integ.get("ultimo_check") or integ.get("ultimo_uso"),
                "latency_ms": integ.get("latency_ms")
            }

    return {
        "version": config.get("version"),
        "ultima_actualizacion": config.get("ultima_actualizacion"),
        "integraciones": status_summary,
        "total_integraciones": len(integraciones),
        "conectadas": sum(1 for s in status_summary.values() if s.get("estado") in ("conectado", "parcial")),
        "habilitadas": sum(1 for s in status_summary.values() if s.get("habilitado"))
    }


@app.post("/api/admin/config/integracion/{nombre}")
@limiter.limit("10/minute")
def update_integracion(nombre: str, updates: dict, request: Request):
    """
    Actualiza la configuración de una integración específica.
    Ejemplo: habilitar/deshabilitar, cambiar API key, etc.
    """
    config = load_config()
    integraciones = config.get("integraciones", {})

    if nombre not in integraciones:
        raise HTTPException(status_code=404, detail=f"Integración '{nombre}' no encontrada")

    # Aplicar actualizaciones
    for key, value in updates.items():
        if key in integraciones[nombre]:
            integraciones[nombre][key] = value

    save_config(config)
    return {"message": f"Integración '{nombre}' actualizada", "integracion": integraciones[nombre]}


@app.post("/api/admin/config/banco/{banco_id}")
@limiter.limit("10/minute")
def update_banco(banco_id: str, updates: dict, request: Request):
    """
    Actualiza la configuración de un banco específico en la integración de custodia.
    """
    config = load_config()
    bancos_config = config.get("integraciones", {}).get("bancos_custodia", {})
    bancos = bancos_config.get("bancos_configurados", [])

    banco = next((b for b in bancos if b["banco"].lower() == banco_id.lower()), None)
    if not banco:
        raise HTTPException(status_code=404, detail=f"Banco '{banco_id}' no encontrado")

    for key, value in updates.items():
        if key in banco:
            banco[key] = value

    # Recalcular estado global
    conectados = sum(1 for b in bancos if b.get("estado") == "conectado")
    bancos_config["estado_global"] = "conectado" if conectados == len(bancos) else "parcial" if conectados > 0 else "desconectado"
    bancos_config["total_saldos_sync"] = conectados

    save_config(config)
    return {"message": f"Banco '{banco_id}' actualizado", "banco": banco}


@app.post("/api/admin/config/test-connection/{integracion}")
@limiter.limit("10/minute")
def test_connection(integracion: str, request: Request):
    """
    Simula un test de conexión a una integración.
    Retorna latencia simulada y estado.
    """
    import random
    import time

    latencia = random.randint(80, 1200)
    time.sleep(0.1)  # Simular pequeña demora

    estados_posibles = ["conectado", "conectado", "conectado", "lento", "timeout"]
    estado = random.choice(estados_posibles)

    return {
        "integracion": integracion,
        "estado": estado,
        "latency_ms": latencia,
        "timestamp": datetime.datetime.now().isoformat(),
        "mensaje": "Conexión exitosa" if estado == "conectado" else f"Advertencia: latencia alta ({latencia}ms)" if estado == "lento" else "Error: timeout de conexión"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8002, reload=True)
