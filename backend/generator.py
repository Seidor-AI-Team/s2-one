"""
generator.py — Generación de narrativa del One Pager con OpenAI
"""
import os
import json
import datetime
from dotenv import load_dotenv
from openai import AsyncOpenAI

load_dotenv()

client = AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"))


async def generate_narrative(portfolio: dict, metrics: dict) -> dict:
    """
    Genera la narrativa del One Pager usando GPT-4o.
    Incluye benchmark comparison, alpha, saldos de caja y alertas de validación.
    """
    top_activos = sorted(
        metrics["activos"],
        key=lambda x: abs(x["contribucion_portfolio"]),
        reverse=True
    )[:3]

    bmark = portfolio.get("benchmark_data", {})
    validacion_overall = metrics.get("validacion_overall", "ok")
    validaciones = portfolio.get("validaciones", {})
    alertas = [
        v.get("detalle", "")
        for v in validaciones.values()
        if isinstance(v, dict) and v.get("status") in ("warning", "error")
    ]

    context = {
        "nombre_portafolio": portfolio["nombre"],
        "descripcion": portfolio["descripcion"],
        "cliente": portfolio.get("cliente", ""),
        "patrimonio": portfolio["patrimonio"],
        "moneda": portfolio["moneda"],
        "gestor": portfolio.get("gestor", ""),
        "rendimiento": {
            "wtd": metrics["wtd"],
            "mtd": metrics["mtd"],
            "ytd": metrics["ytd"],
        },
        "benchmark": {
            "nombre": bmark.get("nombre", portfolio.get("benchmark", "")),
            "wtd": bmark.get("wtd"),
            "mtd": bmark.get("mtd"),
            "ytd": bmark.get("ytd"),
        },
        "alpha": {
            "wtd": metrics.get("alpha_wtd"),
            "mtd": metrics.get("alpha_mtd"),
            "ytd": metrics.get("alpha_ytd"),
        },
        "top_activos": [
            {
                "nombre": a["nombre"],
                "clase": a["clase"],
                "rendimiento_pct": a["rendimiento_activo"],
                "contribucion_pct": a["contribucion_portfolio"],
                "peso_pct": round(a["peso"] * 100, 1),
            }
            for a in top_activos
        ],
        "distribucion_clases": metrics["distribucion_clases"],
        "duracion_ponderada": metrics.get("duracion_ponderada"),
        "total_caja": portfolio.get("total_caja"),
        "movimientos_mes": [
            m for m in portfolio.get("movimientos_mes", [])
            if m.get("tipo") in ("Compra", "Venta", "Cupón", "Dividendo")
        ][:5],
        "alertas_validacion": alertas if alertas else None,
    }

    alerta_texto = ""
    if alertas:
        alerta_texto = f"\nNOTA: Existen alertas de validación de datos: {'; '.join(alertas)}. Mencionarlo brevemente al final si es relevante."

    prompt = f"""Eres un analista financiero senior de MWM (Macro Wealth Management), gestora de inversiones peruana.
Genera el análisis narrativo para el One Pager mensual del siguiente portafolio de inversión:{alerta_texto}

{json.dumps(context, ensure_ascii=False, indent=2)}

Escribe un análisis profesional y conciso (3-4 párrafos) que incluya:
1. Resumen del rendimiento del período (MTD y YTD) y comparación vs benchmark (menciona el alpha si es notable)
2. Principales drivers del rendimiento (identifica los 2-3 activos que más impactaron, positivos y negativos)
3. Contexto de mercado peruano/global relevante que explique el comportamiento (muy breve, 1-2 frases)
4. Perspectivas y posicionamiento para el próximo período

Reglas:
- Responde en español, tono profesional pero claro para el cliente final.
- No uses bullets — escribe párrafos fluidos y conectados.
- No menciones los porcentajes de alfa si son menores a 0.1%.
- Máximo 280 palabras."""

    response = await client.chat.completions.create(
        model="gpt-4o",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.4,
        max_tokens=450,
    )

    narrative = response.choices[0].message.content
    key_driver = top_activos[0]["nombre"] if top_activos else "N/A"

    return {
        "narrative": narrative,
        "key_driver": key_driver,
        "generated_at": datetime.datetime.now().isoformat(),
    }
