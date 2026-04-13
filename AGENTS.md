# AGENTS.md — S2-ONE: Generador de One Pagers de Portafolio

**POC SEIDOR IA Lab · MWM (Macro Wealth Management)**
Versión: 2.0 — Actualizado 2026-04-11

---

## Contexto del Proyecto

Estás trabajando en el MVP de la POC **S2-ONE** para **MWM (Macro Wealth Management)**, empresa gestora de inversiones del Grupo Macro Perú.

### El dolor que resuelves

Generar un One Pager de portafolio toma **9 horas manuales** ejecutadas por Carlos Quispe (analista) y Luciano Rosillo (saldos de caja). El paso más doloroso es elaborar los saldos de caja revisando la web de cada banco (BCP, BBVA, Scotiabank) — **solo eso toma 4 horas**. Un error de datos puede costar la pérdida de un cliente: hasta **US$100K**.

El sistema que construyes reemplaza ese proceso con:
```
1 clic → extracción automática de fuentes → cálculo → validación → One Pager + narrativa IA
```

**Hoy (AS-IS):** 13 pasos, 9 horas, 2 personas, frecuencia 4x/mes
**Con el sistema:** ~5 minutos, 1 persona, puede ser diario

---

## Lo que ya está construido

```
S2-ONE/
├── AGENTS.md                    ← Este archivo
├── README.md                    ← Setup rápido
├── docs/spec.md                 ← Especificación completa (LEE ESTO PRIMERO)
├── backend/
│   ├── main.py                  ← FastAPI — endpoints de la API
│   ├── metrics.py               ← Cálculo WTD/MTD/YTD, alpha, duración
│   ├── generator.py             ← Narrativa con OpenAI GPT-4o
│   └── requirements.txt
├── frontend/
│   └── src/
│       ├── App.tsx              ← UI completa: Dashboard + Detalle + Wizard + One Pager
│       └── index.css            ← Design system
└── data/
    └── portfolios.json          ← Mock realista de portafolios (Bloomberg simulado)
```

---

## Stack Técnico

| Capa | Tecnología | Versión |
|------|-----------|---------|
| Backend | Python + FastAPI | 3.11 / 0.115 |
| IA | OpenAI GPT-4o | API |
| Frontend | React + TypeScript + Vite | 18 / 5.x |
| Estilos | TailwindCSS v4 + CSS variables | 4.x |
| Datos | JSON estático mock | — |

### Design System (colores y fuentes)
```css
--bg:         #0B0D14   /* fondo base */
--bg-card:    #1C1F2B   /* cards */
--border:     #272B3A   /* bordes */
--accent:     #E8B960   /* gold — color principal de acento */
--seidor-blue:#1E72D9   /* botones secundarios */
--green:      #2EAD63   /* retornos positivos, status ok */
--red:        #F06565   /* retornos negativos, status error */
--yellow:     #F59E0B   /* warnings */
--text:       #ECEDF2   /* texto principal */
--text-muted: #525460   /* labels secundarios */
--font-display: "Plus Jakarta Sans"  /* headings, labels */
--font-body:    "DM Sans"            /* párrafos */
--font-mono:    "DM Mono"            /* números, tickers */
```

---

## Flujo UX Correcto

**IMPORTANTE:** El clic en una card del dashboard NO debe lanzar el wizard de generación. Debe ir al detalle del portafolio.

```
Dashboard → [clic card] → Detalle Portafolio → [botón "Generar One Pager"] → Wizard → One Pager
                                              → [botón "Ver último One Pager"] → One Pager (directo)
```

### Pantallas

1. **Dashboard** — 3 cards con métricas resumen + estado de última generación + semáforo de validación
2. **Detalle Portafolio** (nueva) — saldos de caja, validaciones, movimientos recientes, botón generar
3. **Wizard Generación** — 6 pasos: Bloomberg → Precios SBS/iShares → Métricas → Validación → Narrativa IA → Listo
4. **One Pager** — reporte completo con benchmark comparison, saldos, validaciones, narrativa IA

---

## Modelo de Datos (portfolios.json)

Cada portafolio tiene los siguientes bloques. **Lee `docs/spec.md` para el detalle completo.**

| Bloque | Campos clave | Descripción |
|--------|-------------|-------------|
| Básico | `id`, `nombre`, `patrimonio`, `moneda`, `cliente`, `gestor` | Identidad |
| Histórico | `valor_historico.inicio_anio/mes/semana` | Para calcular WTD/MTD/YTD |
| Benchmark | `benchmark_data.wtd/mtd/ytd` | Para calcular alpha (portfolio − benchmark) |
| **Saldos caja** | `saldos_caja[]` + `total_caja` | Bancos: BCP, BBVA, Scotiabank (el paso de 4h) |
| Flujos | `flujos_periodo[]` | Aportes/retiros del período (para TWR correcto) |
| **Validaciones** | `validaciones.stock_vs_eecc`, `patrimonio_vs_cuotas`, `precios_input_vs_output` | Cruces automáticos |
| **Última gen** | `ultima_generacion.fecha/estado/version` | Metadata del One Pager más reciente |
| Activos | `activos[].fuente_precio`, `activos[].isin` | Con trazabilidad de fuente (bloomberg/sbs/ishares/manual) |
| Movimientos | `movimientos_mes[]` | Compras, ventas, cupones, aportes, retiros |

---

## API Endpoints

| Método | Endpoint | Qué hace |
|--------|----------|---------|
| GET | `/api/portfolios` | Lista todos con métricas resumen + estado validación |
| GET | `/api/portfolios/{id}` | Detalle completo + métricas calculadas + alpha |
| POST | `/api/portfolios/{id}/narrative` | Genera narrativa con GPT-4o |
| POST | `/api/portfolios/{id}/generate` | Pipeline completo: simula extracción → validación → narrativa |
| GET | `/api/portfolios/{id}/validations` | Detalle de validaciones cruzadas |
| GET | `/api/portfolios/{id}/history` | Historial de últimas generaciones (mock) |

---

## Reglas para el Agente

1. **NO cambies el diseño visual** sin necesidad — el dark theme y colores están definidos en el design system de arriba.
2. **Los cálculos de métricas DEBEN ser correctos** — WTD, MTD, YTD, alpha. Si tienes dudas, revisa `metrics.py`.
3. **Los datos de mock DEBEN ser coherentes** — los montos, precios y pesos de activos deben sumar correctamente.
4. **El One Pager es el output más importante** — debe verse profesional, imprimible con Ctrl+P.
5. **No elimines funcionalidad existente** — solo agrega o mejora.
6. **Si algo falla, reporta el error exacto** — no asumas qué salió mal.
7. **El backend corre en puerto 8002**, el frontend en **5176** (configurado en vite.config.ts y nginx.conf).

---

## Variables de Entorno

```bash
# backend/.env
OPENAI_API_KEY=sk-...   # Requerido para narrativa IA
```

---

## Setup Local

```bash
# Terminal 1 — Backend
cd backend
pip install -r requirements.txt
cp .env.example .env   # y agrega tu OPENAI_API_KEY
python main.py          # API en http://localhost:8002

# Terminal 2 — Frontend
cd frontend
npm install
npm run dev             # App en http://localhost:5176
```

---

## Checklist para la Hackathon

Lo que el equipo puede iterar durante el evento:

- [ ] ¿Los datos mock reflejan los portafolios reales de MWM? (nombres, montos, activos)
- [ ] ¿El prompt de narrativa IA habla con el tono correcto para los clientes de MWM?
- [ ] ¿Faltan secciones en el One Pager que el cliente real necesita?
- [ ] ¿Las reglas de validación cruzada son correctas? (¿cuánta diferencia es aceptable?)
- [ ] ¿Los bancos en `saldos_caja` son los correctos para MWM?
- [ ] ¿El benchmark de cada portafolio es el correcto?
- [ ] ¿Hay algún KPI o métrica faltante que el equipo calcule actualmente?

---

## Contacto Técnico

- **Mauro Hernandez** — Tech Lead / Harness Engineering (mentor hackathon)
- **Spec completa:** `docs/spec.md`
- **Modelo de datos:** `data/portfolios.json`
