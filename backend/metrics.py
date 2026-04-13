"""
metrics.py — Cálculo de métricas financieras del portafolio
"""
from datetime import date


def calc_return(value_now: float, value_before: float) -> float:
    """Retorna el rendimiento porcentual como decimal."""
    if value_before == 0:
        return 0.0
    return (value_now - value_before) / value_before


def calc_validation_overall(validaciones: dict) -> str:
    """Determina el status global de validaciones: ok | warning | error."""
    statuses = [v.get("status", "ok") for v in validaciones.values() if isinstance(v, dict)]
    if "error" in statuses:
        return "error"
    if "warning" in statuses:
        return "warning"
    return "ok"


def calc_portfolio_metrics(portfolio: dict) -> dict:
    """
    Calcula WTD, MTD, YTD, alpha vs benchmark y métricas por activo.
    Retorna dict con todas las métricas.
    """
    hist = portfolio.get("valor_historico", {})
    patrimonio = portfolio["patrimonio"]

    wtd = calc_return(patrimonio, hist.get("inicio_semana", patrimonio))
    mtd = calc_return(patrimonio, hist.get("inicio_mes", patrimonio))
    ytd = calc_return(patrimonio, hist.get("inicio_anio", patrimonio))

    # Alpha vs benchmark
    bmark = portfolio.get("benchmark_data", {})
    alpha_wtd = round(wtd * 100 - bmark.get("wtd", 0), 2) if bmark else None
    alpha_mtd = round(mtd * 100 - bmark.get("mtd", 0), 2) if bmark else None
    alpha_ytd = round(ytd * 100 - bmark.get("ytd", 0), 2) if bmark else None

    # Métricas por activo
    activos_con_metricas = []
    duracion_ponderada = 0.0
    cash_tickers = {"CASH_PEN", "CASH_USD", "CASH_USD_G"}

    for a in portfolio.get("activos", []):
        rendimiento_activo = calc_return(a["precio_actual"], a["precio_compra"])
        contribucion = a["peso"] * rendimiento_activo
        if a["ticker"] in cash_tickers:
            valor_posicion = a["precio_actual"]
        else:
            valor_posicion = a["cantidad"] * a["precio_actual"]

        activos_con_metricas.append({
            **a,
            "rendimiento_activo": round(rendimiento_activo * 100, 2),
            "contribucion_portfolio": round(contribucion * 100, 3),
            "valor_posicion": round(valor_posicion, 0),
        })

        if a.get("duracion") and a["duracion"] > 0:
            duracion_ponderada += a["peso"] * a["duracion"]

    # Distribución por clase de activo
    clases: dict[str, float] = {}
    for a in portfolio.get("activos", []):
        clase = a["clase"]
        clases[clase] = clases.get(clase, 0) + a["peso"]

    # Fuentes de datos utilizadas
    fuentes_usadas: set[str] = set()
    for a in portfolio.get("activos", []):
        fuente = a.get("fuente_precio")
        if fuente:
            fuentes_usadas.add(fuente)

    # Activo con mayor contribución absoluta
    if activos_con_metricas:
        top_activo = max(activos_con_metricas, key=lambda x: abs(x["contribucion_portfolio"]))
    else:
        top_activo = None

    # Validación overall
    validaciones = portfolio.get("validaciones", {})
    validacion_overall = calc_validation_overall(validaciones)

    return {
        "wtd": round(wtd * 100, 2),
        "mtd": round(mtd * 100, 2),
        "ytd": round(ytd * 100, 2),
        "alpha_wtd": alpha_wtd,
        "alpha_mtd": alpha_mtd,
        "alpha_ytd": alpha_ytd,
        "benchmark_data": bmark,
        "patrimonio": patrimonio,
        "variacion_diaria_aprox": round(patrimonio * 0.0018, 0),
        "duracion_ponderada": round(duracion_ponderada, 2),
        "activos": activos_con_metricas,
        "distribucion_clases": {k: round(v * 100, 1) for k, v in clases.items()},
        "top_activo": top_activo,
        "fuentes_datos": sorted(list(fuentes_usadas)),
        "validacion_overall": validacion_overall,
        "fecha_reporte": date.today().isoformat(),
    }
