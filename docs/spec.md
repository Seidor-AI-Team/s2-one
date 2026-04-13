# Spec — S2-ONE: Generador de One Pagers de Portafolio

**POC SEIDOR IA Lab · MWM (Macro Wealth Management)**
Versión: 2.0 — Actualizada 2026-04-11

---

## Problema

Generar un reporte One Pager de portafolio de inversión toma **9 horas por ejecución**.

- **Frecuencia actual:** 4 veces/mes | **Target:** diario
- **Costo de error:** Hasta US$100K (pérdida de cliente por inconsistencia de datos)
- **Ejecutores:** Carlos Quispe (proceso principal) + Luciano Rosillo (saldos de caja)

### Proceso AS-IS — 13 pasos, 9 horas

| # | Paso | Tiempo | Ejecutor | Fuente | Dolor |
|---|------|--------|----------|--------|-------|
| 1 | Revisar compras, ventas, cupones del día | 20 min | C. Quispe | Sistema interno | Manual |
| 2 | **Elaborar saldos de caja** (web de cada banco) | **4h** | L. Rosillo | BCP, BBVA, Scotiabank (web) | Múltiples portales, error humano |
| 3 | Revisar saldos de caja vs. cupones | 25 min | C. Quispe | Excel interno | Cruce manual |
| 4 | Extraer precios/retornos de Bloomberg, SBS, iShares | 15 min | C. Quispe | Bloomberg terminal, web SBS, web iShares | Disponibilidad de sistema |
| 5 | Incluir compras/ventas en generador OP | 50 min | C. Quispe | Excel generador | Manual |
| 6 | Correr macros OP naturales (10am) | 30 min | C. Quispe | Excel con macros | Macros frágiles |
| 7 | Extraer precios faltantes (1pm) | 10 min | C. Quispe | Bloomberg | Segundo ciclo |
| 8 | Correr macros OP naturales (1pm) | 10 min | C. Quispe | Excel con macros | Segundo ciclo |
| 9 | Revisar One Pager naturales generado | 1h 20min | C. Quispe | Excel output | Revisión manual intensiva |
| 10 | Correr macros OP institucional | 25 min | C. Quispe | Excel con macros | — |
| 11 | Revisar One Pager institucional | 15 min | C. Quispe | Excel output | — |
| 12 | Enviar correo a PM institucional (con duración, benchmark, retornos) | 10 min | C. Quispe | Outlook | Manual |
| 13 | Enviar correo resumen de retornos | 20 min | C. Quispe | Outlook | Manual |

### Fuentes de datos reales

| Fuente | Datos que provee | Acceso | Simulada en mock |
|--------|-----------------|--------|-----------------|
| **Bloomberg API/Terminal** | Precios de activos, retornos, benchmark returns, duración | Terminal o API | ✅ campo `fuente_precio: "bloomberg"` |
| **Web SBS** (Superintendencia de Banca) | Vector de precios de bonos soberanos PEN | Web pública | ✅ `fuente_precio: "sbs"` |
| **Web iShares (BlackRock)** | Duración de ETFs de renta fija | Web pública | ✅ `fuente_precio: "ishares"` |
| **Bancos (web)** | Saldos de caja diarios | Web cada banco | ✅ `saldos_caja[]` |
| **Sistema interno** | Operaciones: compras, ventas, cupones, aportes, retiros | Sistema propio | ✅ `movimientos_mes[]` + `flujos_periodo[]` |
| **EECC bancarios (PDF)** | Estados de cuenta para validación cruzada | PDF mensual | ✅ `validaciones.stock_vs_eecc` |

---

## Solución Target (TO-BE)

Sistema que reemplaza los 13 pasos con un pipeline automatizado:

```
Fuentes de datos ──> Extracción automática ──> Cálculo de métricas ──> Validación ──> One Pager + Narrativa IA
(Bloomberg, SBS,      (integración API          (WTD/MTD/YTD,          (cruce EECC,   (PDF, email)
 bancos, operaciones)  o mock en POC)             TWR, alpha,            precios,
                                                  duración ponderada)    consistencia)
```

**Reducción de tiempo esperada: ≥ 50% en POC (de 9h a < 4h) → target a futuro: < 30 min**

---

## Portafolios en el POC

| ID | Nombre | Tipo | Moneda | Patrimonio aprox. | Benchmark | Gestor |
|----|--------|------|--------|-------------------|-----------|--------|
| `alpha` | Portafolio Alpha | Renta Fija Conservador | PEN | S/ 45.2M | Bonos Soberanos Perú | Luciano Rosillo |
| `beta` | Portafolio Beta | Mixto 60/40 Moderado | USD | US$ 28.5M | 60% S&P500 / 40% UST | Carlos Quispe |
| `gamma` | Portafolio Gamma | Renta Variable Agresivo | USD | US$ 12.1M | MSCI Emerging Markets | Marcos Ruiz |

---

## Modelo de datos completo (`portfolios.json`)

### Portafolio (nivel raíz)

```jsonc
{
  "id": "alpha",                          // Identificador único
  "nombre": "Portafolio Alpha",
  "descripcion": "Renta Fija — Conservador",
  "patrimonio": 45200000,                 // Valor total actual
  "moneda": "PEN",                        // PEN | USD
  "cliente": "Empresa Constructora Inca S.A.",
  "gestor": "Luciano Rosillo",
  "fecha_inicio": "2021-01-15",
  "benchmark": "Bonos Soberanos Perú",   // Nombre del benchmark

  // Valores históricos para calcular WTD/MTD/YTD
  "valor_historico": {
    "inicio_anio": 43800000,
    "inicio_mes": 44900000,
    "inicio_semana": 45050000,
    "hoy": 45200000
  },

  // Benchmark con retornos para calcular alpha
  "benchmark_data": {
    "nombre": "Bonos Soberanos Perú",
    "wtd": 0.18,                          // % retorno WTD del benchmark
    "mtd": 0.52,
    "ytd": 2.10,
    "fuente": "bloomberg"
  },

  // Saldos de caja por banco (paso más doloroso del AS-IS: 4 horas)
  "saldos_caja": [
    {
      "banco": "BCP",
      "cuenta": "193-2XXXXXX-0-01",       // Enmascarado
      "moneda": "PEN",
      "saldo": 1250000,
      "fecha": "2026-04-11"
    }
    // ... más bancos
  ],
  "total_caja": 2140000,                  // Suma de saldos_caja

  // Aportes y retiros del período (necesarios para TWR correcto)
  "flujos_periodo": [
    { "fecha": "2026-04-03", "tipo": "aporte", "monto": 500000, "moneda": "PEN" },
    { "fecha": "2026-04-09", "tipo": "retiro", "monto": 200000, "moneda": "PEN" }
  ],

  // Validaciones cruzadas automáticas (simula la validación manual de pasos 3,9,11)
  "validaciones": {
    "stock_vs_eecc": {
      "status": "ok",                     // ok | warning | error
      "diferencias": 0,
      "fecha_eecc": "2026-03-31"
    },
    "patrimonio_vs_cuotas": {
      "status": "ok",
      "valor_cuota": 145.23,
      "num_cuotas": 311234
    },
    "precios_input_vs_output": {
      "status": "warning",
      "items_con_diferencia": 1,
      "detalle": "SBS_LETRAS: precio SBS 99.42 vs Bloomberg 99.45"
    }
  },

  // Metadata de la última generación del One Pager
  "ultima_generacion": {
    "fecha": "2026-04-10T16:30:00",
    "generado_por": "C. Quispe",
    "version": 3,
    "estado": "enviado"                   // borrador | revisado | enviado
  },

  // Lista de activos del portafolio
  "activos": [ /* ver estructura de activo abajo */ ],

  // Movimientos del mes
  "movimientos_mes": [ /* ver estructura de movimiento abajo */ ]
}
```

### Activo

```jsonc
{
  "ticker": "PGOV32",
  "nombre": "Bono Soberano Perú 2032",
  "clase": "Bono Soberano",              // Bono Soberano | Bono Corporativo | Renta Variable | ETF | Efectivo
  "isin": "PEP01000C2V9",               // Identificador internacional
  "cantidad": 200000,
  "precio_compra": 98.50,
  "precio_actual": 99.20,
  "rendimiento_ytd": 0.028,
  "peso": 0.28,                          // Proporción del portafolio (0-1)
  "duracion": 7.3,                       // Duration modificada en años (null para RV)
  "moneda": "PEN",
  "fuente_precio": "bloomberg",          // bloomberg | sbs | ishares | manual
  "ultima_actualizacion": "2026-04-11T10:00:00"
}
```

### Movimiento

```jsonc
{
  "fecha": "2026-04-02",
  "tipo": "Compra",                      // Compra | Venta | Cupón | Dividendo | Aporte | Retiro
  "ticker": "PGOV32",
  "cantidad": 20000,
  "precio": 98.90,
  "monto": 1978000
}
```

---

## Métricas a Calcular

| Métrica | Fórmula | Notas |
|---------|---------|-------|
| WTD | (Valor hoy − Valor lunes) / Valor lunes | Simple |
| MTD | (Valor hoy − Valor inicio mes) / Valor inicio mes | Simple en mock; TWR en producción |
| YTD | (Valor hoy − Valor inicio año) / Valor inicio año | Simple en mock; TWR en producción |
| Rendimiento por activo | (Precio actual − Precio compra) / Precio compra | |
| Contribución al portafolio | Peso × Rendimiento activo | |
| Alpha | Retorno portafolio − Retorno benchmark | Por período (WTD/MTD/YTD) |
| Duración ponderada | Σ (Peso × Duración activo) | Solo activos con duration > 0 |
| TWR (time-weighted return) | Ajusta por flujos de aportes/retiros | Implementar en producción |

---

## UX Flow (corregido)

```
┌──────────────────────────────────────────────────────────────────────────┐
│ DASHBOARD                                                                 │
│  3 cards de portafolios                                                   │
│  Cada card: nombre, patrimonio, WTD, MTD, YTD, última generación          │
│  Estado de validación (semáforo)                                          │
│  [clic en card] ──────────────────────────────────────────────────────>  │
└──────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌──────────────────────────────────────────────────────────────────────────┐
│ DETALLE PORTAFOLIO (NUEVA)                                                │
│  Resumen: patrimonio, benchmark, gestor, cliente                          │
│  Saldos de caja por banco                                                 │
│  Estado de validaciones (checks con semáforo)                             │
│  Últimos movimientos del mes                                              │
│  [Botón primario] "Generar One Pager" ──────────────────────────────>   │
│  [Botón secundario] "Ver último One Pager" ──────────────────────────>  │
└──────────────────────────────────────────────────────────────────────────┘
           │                                           │
           ▼                                           ▼
┌──────────────────────────┐              ┌──────────────────────────────┐
│ WIZARD GENERACIÓN         │              │ ONE PAGER (directo)           │
│ Paso 1: Bloomberg        │              │ (si ya existe generación)     │
│ Paso 2: Precios SBS/iSh  │              └──────────────────────────────┘
│ Paso 3: Calcular métricas│
│ Paso 4: Validar datos ✅  │  ← NUEVO
│ Paso 5: Narrativa IA     │
│ Paso 6: Listo            │
│         │                │
│         ▼                │
└──────────────────────────┘
           │
           ▼
┌──────────────────────────────────────────────────────────────────────────┐
│ ONE PAGER VIEW                                                            │
│  Header: nombre, fecha, patrimonio, variación                             │
│  Métricas: WTD/MTD/YTD + benchmark comparison + alpha                    │
│  Composición: tabla activos con fuente de precio + gráfico por clase     │
│  Saldos de caja (tabla por banco)                                         │
│  Validaciones (badges de status)                                          │
│  Análisis IA (narrativa GPT-4o enriquecida)                               │
│  Movimientos del mes                                                      │
│  Footer: fuentes + timestamps + disclaimer                                │
│  [Imprimir / Export PDF]                                                  │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## API Endpoints

### Existentes (refactorizados)

#### `GET /api/portfolios`
Lista todos los portafolios con métricas resumen.
```json
Response: {
  "portfolios": [{
    "id": "alpha",
    "nombre": "Portafolio Alpha",
    "patrimonio": 45200000,
    "moneda": "PEN",
    "cliente": "...",
    "gestor": "...",
    "wtd": 0.33,
    "mtd": 0.67,
    "ytd": 3.20,
    "ultima_generacion": { "fecha": "...", "estado": "enviado" },
    "validacion_status": "warning"
  }]
}
```

#### `GET /api/portfolios/{id}`
Detalle completo del portafolio con activos, métricas, validaciones, saldos.
```json
Response: {
  "portfolio": { /* datos completos */ },
  "metrics": {
    "wtd": 0.33, "mtd": 0.67, "ytd": 3.20,
    "alpha_mtd": 0.15, "alpha_ytd": 1.10,
    "duracion_ponderada": 5.8,
    "activos": [ /* con rendimiento y contribución calculados */ ],
    "distribucion_clases": { "Bono Soberano": 50.0, "Efectivo": 5.0 },
    "top_activo": { /* activo con mayor contribución */ }
  }
}
```

### Nuevos

#### `POST /api/portfolios/{id}/generate`
Simula el pipeline de generación (fuentes → cálculo → validación → narrativa).
Retorna los pasos de progreso y el resultado final.
```json
Response: {
  "steps": [
    { "id": 1, "label": "Conectando Bloomberg", "status": "done", "ms": 820 },
    { "id": 2, "label": "Descargando precios SBS/iShares", "status": "done", "ms": 450 },
    { "id": 3, "label": "Calculando métricas", "status": "done", "ms": 110 },
    { "id": 4, "label": "Validando consistencia de datos", "status": "warning", "ms": 340,
      "detail": "SBS_LETRAS: diferencia de 0.03 en precio" },
    { "id": 5, "label": "Generando narrativa con IA", "status": "done", "ms": 2100 },
    { "id": 6, "label": "One Pager listo", "status": "done", "ms": 50 }
  ],
  "narrative": "...",
  "key_driver": "...",
  "generated_at": "2026-04-11T14:30:00"
}
```

#### `POST /api/portfolios/{id}/narrative`
Genera solo la narrativa IA (ya existe, sin cambio de interfaz).
```json
Response: { "narrative": "...", "key_driver": "...", "generated_at": "..." }
```

#### `GET /api/portfolios/{id}/validations`
Retorna detalle de validaciones cruzadas del portafolio.
```json
Response: {
  "portfolio_id": "alpha",
  "fecha": "2026-04-11",
  "checks": [
    { "nombre": "Stock vs EECC bancarios", "status": "ok", "diferencias": 0 },
    { "nombre": "Patrimonio vs Valor Cuota × N° Cuotas", "status": "ok" },
    { "nombre": "Precios input vs output", "status": "warning",
      "detalle": "SBS_LETRAS: SBS 99.42 vs Bloomberg 99.45" }
  ],
  "overall": "warning"
}
```

#### `GET /api/portfolios/{id}/history`
Historial de las últimas 3 generaciones del One Pager (mock).
```json
Response: {
  "history": [
    { "version": 3, "fecha": "2026-04-10T16:30:00", "generado_por": "C. Quispe", "estado": "enviado" },
    { "version": 2, "fecha": "2026-04-03T16:15:00", "generado_por": "C. Quispe", "estado": "enviado" },
    { "version": 1, "fecha": "2026-03-28T17:00:00", "generado_por": "L. Rosillo", "estado": "revisado" }
  ]
}
```

---

## Criterios de Éxito (KPIs del POC)

| KPI | Baseline | Target Hackathon | Medición |
|-----|----------|-----------------|----------|
| Tiempo de generación | 9 horas | < 5 minutos (demo) | Cronómetro en vivo |
| Pasos eliminados | 13 pasos | 1 clic + revisión | Demostración |
| Errores de cálculo | Presente | 0 errores en métricas | Verificación manual |
| Narrativa útil | No existe | Analista la considera buena | Feedback en demo |
| Validaciones detectadas | Manual | Automático | Demo con warning visible |

### Decisión Go / No-Go

- **GO** → Sistema genera el One Pager en < 5 min, métricas correctas, narrativa aprobada por analista
- **PIVOT** → Sistema funciona pero narrativa o visualización necesita ajuste (continuar mejorando)
- **STOP** → Datos incorrectos o sistema inestable (rediseñar)

---

## Lo que los equipos pueden iterar en la hackathon

1. Validar que los datos mock reflejen su proceso real (portafolios, activos, montos)
2. Ajustar el prompt de narrativa IA (añadir contexto específico de MWM)
3. Agregar/quitar secciones del One Pager según el cliente real
4. Definir las reglas de validación cruzada reales (diferencias aceptables)
5. Probar con datos cercanos a los reales si los traen disponibles
