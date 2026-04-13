"""
security.py — Middleware de seguridad para S2-ONE
Auth, rate limiting, security headers, audit logging, data masking.
"""
import os
import re
import json
import copy
import datetime
import logging
from pathlib import Path
from typing import Callable

from fastapi import Request, HTTPException, Depends
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
from slowapi import Limiter
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

# ═══════════════════════════════════════════════════════════════
# TOKENS
# ═══════════════════════════════════════════════════════════════

API_TOKEN = os.getenv("API_TOKEN", "")
ADMIN_TOKEN = os.getenv("ADMIN_TOKEN", "")

# ═══════════════════════════════════════════════════════════════
# RATE LIMITER
# ═══════════════════════════════════════════════════════════════

limiter = Limiter(key_func=get_remote_address)


def rate_limit_exceeded_handler(request: Request, exc: RateLimitExceeded):
    return JSONResponse(
        status_code=429,
        content={"detail": "Demasiadas solicitudes. Intente de nuevo en un momento."},
    )


# ═══════════════════════════════════════════════════════════════
# AUTH DEPENDENCY
# ═══════════════════════════════════════════════════════════════

PUBLIC_PATHS = {"/", "/docs", "/openapi.json", "/redoc"}


async def verify_token(request: Request):
    """
    Valida el header Authorization: Bearer <token>.
    Los endpoints /api/admin/* requieren ADMIN_TOKEN.
    Los demás /api/* requieren API_TOKEN.
    """
    path = request.url.path

    # Skip auth for public paths
    if path in PUBLIC_PATHS:
        return

    # Skip non-API paths
    if not path.startswith("/api"):
        return

    # If no tokens configured, allow all (development mode)
    if not API_TOKEN and not ADMIN_TOKEN:
        return

    auth_header = request.headers.get("Authorization", "")
    if not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Token de autenticación requerido")

    token = auth_header[7:]

    if path.startswith("/api/admin"):
        expected = ADMIN_TOKEN or API_TOKEN
        if token != expected:
            raise HTTPException(status_code=403, detail="Token de administrador inválido")
    else:
        if token != API_TOKEN and token != ADMIN_TOKEN:
            raise HTTPException(status_code=401, detail="Token inválido")


# ═══════════════════════════════════════════════════════════════
# SECURITY HEADERS MIDDLEWARE
# ═══════════════════════════════════════════════════════════════

SECURITY_HEADERS = {
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "X-XSS-Protection": "1; mode=block",
    "Cache-Control": "no-store, no-cache, must-revalidate",
    "Pragma": "no-cache",
    "Referrer-Policy": "strict-origin-when-cross-origin",
}


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next: Callable):
        response = await call_next(request)
        for key, value in SECURITY_HEADERS.items():
            response.headers[key] = value
        return response


# ═══════════════════════════════════════════════════════════════
# AUDIT LOGGING
# ═══════════════════════════════════════════════════════════════

AUDIT_LOG_PATH = Path(__file__).parent / "data" / "audit_log.jsonl"

audit_logger = logging.getLogger("s2one.audit")
audit_logger.setLevel(logging.INFO)

# File handler for audit log (JSON Lines format)
_handler = logging.FileHandler(AUDIT_LOG_PATH, encoding="utf-8")
_handler.setFormatter(logging.Formatter("%(message)s"))
audit_logger.addHandler(_handler)


class AuditLogMiddleware(BaseHTTPMiddleware):
    """Logs every /api/ request with timestamp, IP, method, path, status."""

    async def dispatch(self, request: Request, call_next: Callable):
        response = await call_next(request)

        path = request.url.path
        if not path.startswith("/api"):
            return response

        entry = {
            "ts": datetime.datetime.now().isoformat(),
            "ip": get_remote_address(request),
            "method": request.method,
            "path": path,
            "status": response.status_code,
            "user_agent": request.headers.get("user-agent", "")[:100],
        }
        audit_logger.info(json.dumps(entry, ensure_ascii=False))

        return response


# ═══════════════════════════════════════════════════════════════
# DATA MASKING
# ═══════════════════════════════════════════════════════════════

ACCOUNT_PATTERN = re.compile(r"[\dX]{3,}")


def mask_account(cuenta: str) -> str:
    """Enmascara un número de cuenta mostrando solo los últimos 4 caracteres."""
    clean = cuenta.replace("-", "").replace(" ", "")
    if len(clean) <= 4:
        return cuenta
    visible = clean[-4:]
    masked = "X" * (len(clean) - 4) + visible
    # Restore original format (dashes at same positions)
    result = []
    mi = 0
    for ch in cuenta:
        if ch in ("-", " "):
            result.append(ch)
        else:
            result.append(masked[mi] if mi < len(masked) else "X")
            mi += 1
    return "".join(result)


def mask_portfolio_data(portfolio: dict) -> dict:
    """
    Devuelve una copia del portafolio con datos sensibles enmascarados:
    - Cuentas bancarias: solo últimos 4 dígitos
    """
    p = copy.deepcopy(portfolio)

    # Mask bank account numbers
    for saldo in p.get("saldos_caja", []):
        if "cuenta" in saldo:
            saldo["cuenta"] = mask_account(saldo["cuenta"])

    return p
