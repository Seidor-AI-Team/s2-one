import { useState, useEffect, type CSSProperties } from 'react'
import toast, { Toaster } from 'react-hot-toast'

// ── Types ──────────────────────────────────────────────
interface UltimaGeneracion {
  fecha: string; estado: string; version: number; generado_por: string
}

interface PortfolioSummary {
  id: string; nombre: string; descripcion: string
  patrimonio: number; moneda: string; cliente: string; gestor: string
  benchmark?: string
  wtd: number; mtd: number; ytd: number
  alpha_wtd?: number; alpha_mtd?: number; alpha_ytd?: number
  ultima_generacion?: UltimaGeneracion
  validacion_status?: string
}

interface Asset {
  ticker: string; nombre: string; clase: string; isin?: string
  peso: number; precio_compra: number; precio_actual: number
  rendimiento_activo: number; contribucion_portfolio: number; valor_posicion: number
  duracion?: number; fuente_precio?: string; moneda?: string
}

interface SaldoCaja { banco: string; cuenta: string; moneda: string; saldo: number; fecha: string }
interface ValidacionItem { status: string; detalle?: string; [key: string]: any }
interface Validaciones {
  stock_vs_eecc?: ValidacionItem
  patrimonio_vs_cuotas?: ValidacionItem
  precios_input_vs_output?: ValidacionItem
}

interface PortfolioDetail {
  portfolio: {
    nombre: string; descripcion: string; cliente: string; gestor: string
    moneda: string; benchmark: string
    benchmark_data?: { nombre: string; wtd: number; mtd: number; ytd: number; fuente: string }
    movimientos_mes: any[]
    saldos_caja?: SaldoCaja[]
    total_caja?: number
    validaciones?: Validaciones
    ultima_generacion?: UltimaGeneracion
    flujos_periodo?: any[]
  }
  metrics: {
    wtd: number; mtd: number; ytd: number
    alpha_wtd?: number; alpha_mtd?: number; alpha_ytd?: number
    benchmark_data?: any
    patrimonio: number; duracion_ponderada: number
    activos: Asset[]
    distribucion_clases: Record<string, number>
    fecha_reporte: string
    fuentes_datos?: string[]
    validacion_overall?: string
  }
}

// ── Helpers ────────────────────────────────────────────
const fmt = (n: number) => new Intl.NumberFormat('es-PE', { maximumFractionDigits: 0 }).format(n)
const fmtCompact = (n: number) => new Intl.NumberFormat('es-PE', { notation: 'compact', maximumFractionDigits: 1 }).format(n)
const retCol = (v: number) => v >= 0 ? 'var(--green)' : 'var(--red)'
const retSign = (v: number) => v >= 0 ? `+${v}` : `${v}`

const CLASS_COLORS: Record<string, string> = {
  'Bono Soberano': '#4A9AFF',
  'Bono Corporativo': '#818CF8',
  'Instrumento Monetario': '#67E8F9',
  'Renta Variable': '#2EAD63',
  'Renta Variable LatAm': '#34D399',
  'Renta Variable Emergente': '#6EE7B7',
  'Renta Fija': '#60A5FA',
  'Efectivo': '#E8B960',
  renta_fija: '#4A9AFF',
  renta_variable: '#2EAD63',
  alternativos: '#A855F7',
  efectivo: '#E8B960',
  commodities: '#F59E0B',
}
const classColor = (c: string) => CLASS_COLORS[c] || '#8A8C98'

const FUENTE_COLORS: Record<string, string> = {
  bloomberg: '#E8B960',
  sbs: '#4A9AFF',
  ishares: '#2EAD63',
  manual: '#8A8C98',
}
const fuenteLabel = (f?: string) => ({ bloomberg: 'BBG', sbs: 'SBS', ishares: 'iSh', manual: 'MNL' })[f || ''] || ''
const fuenteColor = (f?: string) => FUENTE_COLORS[f || ''] || '#8A8C98'

const VALID_COLORS: Record<string, string> = { ok: 'var(--green)', warning: 'var(--yellow)', error: 'var(--red)' }
const validColor = (s?: string) => VALID_COLORS[s || 'ok'] || 'var(--text-muted)'

// ── Secure API helper ────────────────────────────────
const API_TOKEN = import.meta.env.VITE_API_TOKEN || ''
const ADMIN_TOKEN = import.meta.env.VITE_ADMIN_TOKEN || API_TOKEN

function apiFetch(url: string, opts: RequestInit = {}, admin = false): Promise<Response> {
  const token = admin ? ADMIN_TOKEN : API_TOKEN
  const headers: Record<string, string> = {
    ...(opts.headers as Record<string, string> || {}),
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }
  if (opts.body && typeof opts.body === 'string') {
    headers['Content-Type'] = headers['Content-Type'] || 'application/json'
  }
  return fetch(url, { ...opts, headers })
}

// ── Shared styles ──────────────────────────────────────
const S: Record<string, CSSProperties> = {
  label: { fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.09em' },
  sectionTitle: { fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.09em', marginBottom: '14px' },
  th: { padding: '10px 14px', textAlign: 'left', fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', fontWeight: 500, background: 'var(--bg-elevated)' },
  thR: { padding: '10px 14px', textAlign: 'right', fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', fontWeight: 500, background: 'var(--bg-elevated)' },
  td: { padding: '12px 14px', fontSize: '13px', borderBottom: '1px solid var(--border)' },
  tdR: { padding: '12px 14px', fontSize: '13px', borderBottom: '1px solid var(--border)', textAlign: 'right', fontFamily: 'var(--font-mono)' },
}

// ── Grupo Macro Logo ───────────────────────────────────
function GrupoMacroLogo({ height = 30 }: { height?: number }) {
  const w = Math.round(height * (180 / 48))
  return (
    <svg width={w} height={height} viewBox="0 0 180 48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Grupo Macro">
      <rect x="0" y="2" width="9" height="44" rx="1.5" fill="#2EAD63"/>
      <rect x="13" y="2" width="9" height="44" rx="1.5" fill="#2EAD63"/>
      <rect x="26" y="2" width="9" height="44" rx="1.5" fill="#2EAD63"/>
      <text x="44" y="21" fontFamily="Plus Jakarta Sans, Arial, sans-serif" fontWeight="800" fontSize="17" fill="#2EAD63" letterSpacing="2">GRUPO</text>
      <text x="44" y="42" fontFamily="Plus Jakarta Sans, Arial, sans-serif" fontWeight="800" fontSize="17" fill="#2EAD63" letterSpacing="2">MACRO</text>
    </svg>
  )
}

// ── Return pill ────────────────────────────────────────
function ReturnPill({ value, label }: { value: number; label: string }) {
  const col = retCol(value)
  const isPositive = value >= 0
  return (
    <div style={{
      background: 'var(--bg-card)', borderRadius: '14px',
      border: '1px solid var(--border)', padding: '22px 24px',
      textAlign: 'center', position: 'relative', overflow: 'hidden',
      transition: 'all 0.25s ease',
    }}>
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: '2px',
        background: `linear-gradient(90deg, transparent, ${isPositive ? 'var(--green)' : 'var(--red)'}, transparent)`,
        opacity: 0.6,
      }} />
      <p style={{ ...S.label, marginBottom: '10px' }}>{label}</p>
      <p style={{ fontFamily: 'var(--font-display)', fontSize: '30px', fontWeight: 800, color: col, lineHeight: 1 }}>
        {retSign(value)}%
      </p>
    </div>
  )
}

// ── Composition bar ────────────────────────────────────
function CompositionBar({ dist }: { dist: Record<string, number> }) {
  return (
    <div>
      <div style={{
        display: 'flex', height: '8px', borderRadius: '4px', overflow: 'hidden',
        marginBottom: '14px', background: 'var(--bg-elevated)', border: '1px solid var(--border)',
      }}>
        {Object.entries(dist).map(([clase, pct]) => (
          <div key={clase} style={{
            width: `${pct}%`, background: classColor(clase),
            transition: 'width 0.8s cubic-bezier(0.22,1,0.36,1)',
            animation: 'barGrow 0.8s ease both',
          }} />
        ))}
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px 18px' }}>
        {Object.entries(dist).map(([clase, pct]) => (
          <span key={clase} style={{
            display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--text-sub)',
            padding: '4px 0', cursor: 'default',
          }}>
            <span style={{
              width: '12px', height: '12px', borderRadius: '3px',
              background: classColor(clase), flexShrink: 0,
              boxShadow: `0 0 8px ${classColor(clase)}30`,
            }} />
            <span style={{ fontFamily: 'var(--font-body)' }}>{clase.replace('_', ' ')}</span>
            <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', fontSize: '11px', fontWeight: 500 }}>{pct}%</span>
          </span>
        ))}
      </div>
    </div>
  )
}

// ── Generation Step Definition ────────────────────────
interface GenStep {
  id: string
  label: string
  sublabel: string
  status: 'pending' | 'running' | 'done' | 'warning' | 'error'
  duration?: number
  detail?: string
}

const STEP_DEFS = [
  { id: 'bloomberg',   label: 'Conectando a fuentes de mercado',     sublabel: 'Autenticando con Bloomberg Terminal...' },
  { id: 'prices',     label: 'Obteniendo precios actualizados',     sublabel: 'Bloomberg · SBS Perú · iShares · Bancos...' },
  { id: 'metrics',    label: 'Calculando rendimientos',             sublabel: 'Semana · Mes · Año · Alpha vs Benchmark...' },
  { id: 'validation', label: 'Verificando calidad de los datos',    sublabel: 'Control cruzado con estados de cuenta...' },
  { id: 'narrative',  label: 'Escribiendo el análisis con IA',      sublabel: 'GPT-4o analizando factores clave...' },
  { id: 'done',       label: 'Reporte listo',                       sublabel: 'El One Pager está preparado' },
]

// ── Generation Wizard Component ────────────────────────
function GenerationWizard({
  portfolioName, steps, onClose
}: {
  portfolioName: string
  steps: GenStep[]
  onClose: () => void
}) {
  const runningIdx = steps.findIndex(s => s.status === 'running')
  const doneCount = steps.filter(s => s.status === 'done' || s.status === 'warning').length
  const progress = (doneCount / steps.length) * 100
  const allDone = steps.every(s => s.status === 'done' || s.status === 'warning' || s.status === 'error')

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(11,13,20,0.88)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 50, backdropFilter: 'blur(6px)',
    }}>
      <div className="anim-fade-up" style={{
        background: 'var(--bg-card)', border: '1px solid var(--border)',
        borderRadius: '22px', padding: '40px 44px', width: '540px', maxWidth: '92vw',
        boxShadow: '0 24px 80px rgba(0,0,0,0.5), 0 0 0 1px var(--border)',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Top accent line */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: 'linear-gradient(90deg, var(--seidor-blue), var(--accent), var(--green))' }} />
        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--accent)', letterSpacing: '0.02em', marginBottom: '8px', fontWeight: 600 }}>
            Generando tu reporte
          </p>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: 800, letterSpacing: '-0.02em' }}>
            {portfolioName}
          </h2>
        </div>

        {/* Progress bar */}
        <div style={{ marginBottom: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-body)', fontWeight: 500 }}>
              {allDone ? 'Completado' : `Paso ${doneCount + 1} de ${steps.length}`}
            </span>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
              {Math.round(progress)}%
            </span>
          </div>
          <div style={{ height: '4px', background: 'var(--border)', borderRadius: '2px', overflow: 'hidden' }}>
            <div style={{
              height: '100%', borderRadius: '2px',
              width: `${progress}%`,
              background: allDone ? 'var(--green)' : 'linear-gradient(90deg, var(--seidor-blue), var(--accent))',
              transition: 'width 0.5s ease, background 0.3s',
            }} />
          </div>
        </div>

        {/* Steps */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '32px' }}>
          {steps.map((step, i) => {
            const isDone    = step.status === 'done'
            const isRunning = step.status === 'running'
            const isPending = step.status === 'pending'
            return (
              <div key={step.id} style={{
                display: 'flex', alignItems: 'center', gap: '16px',
                padding: '12px 16px', borderRadius: '10px',
                background: isRunning ? 'var(--accent-dim)'
                  : isDone ? 'var(--green-dim)'
                  : step.status === 'warning' ? 'rgba(245,158,11,0.1)'
                  : step.status === 'error' ? 'rgba(240,101,101,0.1)' : 'transparent',
                border: `1px solid ${isRunning ? 'rgba(232,185,96,0.2)'
                  : isDone ? 'rgba(46,173,99,0.2)'
                  : step.status === 'warning' ? 'rgba(245,158,11,0.25)'
                  : step.status === 'error' ? 'rgba(240,101,101,0.25)' : 'transparent'}`,
                transition: 'all 0.3s ease',
                opacity: isPending ? 0.35 : 1,
              }}>
                {/* Icon */}
                <div style={{ width: '28px', height: '28px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {isDone && (
                    <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'var(--green)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ color: '#fff', fontSize: '10px', fontWeight: 700 }}>✓</span>
                    </div>
                  )}
                  {step.status === 'warning' && (
                    <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'var(--yellow)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ color: '#000', fontSize: '10px', fontWeight: 700 }}>!</span>
                    </div>
                  )}
                  {step.status === 'error' && (
                    <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'var(--red)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ color: '#fff', fontSize: '10px', fontWeight: 700 }}>✗</span>
                    </div>
                  )}
                  {isRunning && (
                    <div className="anim-spin" style={{ width: '18px', height: '18px', border: '2px solid var(--accent-dim)', borderTopColor: 'var(--accent)', borderRadius: '50%' }} />
                  )}
                  {isPending && (
                    <div style={{ width: '18px', height: '18px', border: '2px solid var(--border)', borderRadius: '50%' }} />
                  )}
                </div>
                {/* Text */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{
                    fontSize: '13px', fontWeight: isRunning ? 600 : (isDone || step.status === 'warning') ? 500 : 400,
                    color: isRunning ? 'var(--accent)'
                      : isDone ? 'var(--green)'
                      : step.status === 'warning' ? 'var(--yellow)'
                      : step.status === 'error' ? 'var(--red)' : 'var(--text-muted)',
                    fontFamily: 'var(--font-body)', marginBottom: '2px',
                  }}>{step.label}</p>
                  {(isRunning || isDone || step.status === 'warning' || step.status === 'error') && (
                    <p style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                      {isRunning ? step.sublabel
                        : step.detail ?? (isDone ? `Completado${step.duration ? ` · ${step.duration}ms` : ''}` : '')}
                    </p>
                  )}
                </div>
                {/* Duration badge */}
                {isDone && step.duration && (
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-muted)', flexShrink: 0 }}>
                    {step.duration < 1000 ? `${step.duration}ms` : `${(step.duration/1000).toFixed(1)}s`}
                  </span>
                )}
              </div>
            )
          })}
        </div>

        {/* CTA */}
        {allDone ? (
          <button
            onClick={onClose}
            className="btn-primary"
            style={{
              width: '100%', padding: '14px', fontSize: '14px', borderRadius: '12px',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            }}
          >
            Ver el One Pager
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </button>
        ) : (
          <div style={{ textAlign: 'center', padding: '8px 0' }}>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}>
              Esto toma unos segundos...
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Main App ───────────────────────────────────────────
export default function App() {
  const [portfolios, setPortfolios] = useState<PortfolioSummary[]>([])
  const [selected, setSelected] = useState<PortfolioDetail | null>(null)
  const [detailSummary, setDetailSummary] = useState<PortfolioSummary | null>(null)
  const [detailPortfolio, setDetailPortfolio] = useState<PortfolioDetail | null>(null)
  const [narrative, setNarrative] = useState('')
  const [loadingNarrative, setLoadingNarrative] = useState(false)
  const [view, setView] = useState<'dashboard' | 'detail' | 'onepager' | 'generating' | 'config'>('dashboard')
  const [config, setConfig] = useState<any>(null)
  const [configStatus, setConfigStatus] = useState<any>(null)
  const [loadingConfig, setLoadingConfig] = useState(false)
  const [genSteps, setGenSteps] = useState<GenStep[]>([])
  const [pendingPortfolioId, setPendingPortfolioId] = useState<string | null>(null)
  const [theme, setTheme] = useState<'dark' | 'light'>(() => (localStorage.getItem('one-theme') as 'dark' | 'light') || 'dark')
  const [loadingPortfolios, setLoadingPortfolios] = useState(true)
  const [portfoliosError, setPortfoliosError] = useState<string | null>(null)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('one-theme', theme)
  }, [theme])

  useEffect(() => {
    setLoadingPortfolios(true)
    setPortfoliosError(null)
    apiFetch('/api/portfolios')
      .then(r => {
        if (!r.ok) throw new Error(`Error ${r.status}: ${r.statusText}`)
        return r.json()
      })
      .then(d => {
        setPortfolios(d.portfolios || [])
        setLoadingPortfolios(false)
      })
      .catch(e => {
        setPortfoliosError(e.message || 'Error cargando portafolios')
        setLoadingPortfolios(false)
        toast.error('No se pudieron cargar los portafolios')
      })
  }, [])

  useEffect(() => {
    if (view === 'config') {
      loadConfig()
    }
  }, [view])

  const loadConfig = async () => {
    setLoadingConfig(true)
    try {
      const [cfgRes, statusRes] = await Promise.all([
        apiFetch('/api/admin/config', {}, true),
        apiFetch('/api/admin/config/status', {}, true)
      ])
      const cfg = await cfgRes.json()
      const status = await statusRes.json()
      setConfig(cfg)
      setConfigStatus(status)
    } catch (e) {
      toast.error('Error cargando configuración')
    } finally {
      setLoadingConfig(false)
    }
  }

  const toggleIntegracion = async (nombre: string, habilitado: boolean) => {
    try {
      const res = await apiFetch(`/api/admin/config/integracion/${nombre}`, {
        method: 'POST',
        body: JSON.stringify({ habilitado })
      }, true)
      if (res.ok) {
        toast.success(`${nombre} ${habilitado ? 'habilitado' : 'deshabilitado'}`)
        loadConfig()
      }
    } catch {
      toast.error('Error actualizando integración')
    }
  }

  const testConnection = async (integracion: string) => {
    toast.loading(`Testeando ${integracion}...`, { id: `test-${integracion}` })
    try {
      const res = await apiFetch(`/api/admin/config/test-connection/${integracion}`, { method: 'POST' }, true)
      const data = await res.json()
      if (data.estado === 'conectado') {
        toast.success(`${integracion}: Conectado (${data.latency_ms}ms)`, { id: `test-${integracion}` })
      } else {
        toast.error(`${integracion}: ${data.mensaje}`, { id: `test-${integracion}` })
      }
    } catch {
      toast.error(`Error testeando ${integracion}`, { id: `test-${integracion}` })
    }
  }

  const sleep = (ms: number) => new Promise(res => setTimeout(res, ms))

  const setStepStatus = (id: string, status: GenStep['status'], duration?: number, detail?: string) =>
    setGenSteps(prev => prev.map(s => s.id === id ? { ...s, status, duration, detail } : s))

  const startGeneration = async (id: string) => {
    const initialSteps: GenStep[] = STEP_DEFS.map(d => ({ ...d, status: 'pending' as const }))
    setGenSteps(initialSteps)
    setPendingPortfolioId(id)
    setView('generating')
    setNarrative('')

    const t0 = Date.now()

    // Step 1: Bloomberg connect
    setStepStatus('bloomberg', 'running')
    await sleep(900)
    setStepStatus('bloomberg', 'done', Date.now() - t0)

    // Step 2: Download prices + portfolio data
    setStepStatus('prices', 'running')
    const t2 = Date.now()
    const res = await apiFetch(`/api/portfolios/${id}`)
    const data = await res.json()
    setSelected(data)
    await sleep(300)
    const fuentes = (data.metrics?.fuentes_datos || []).map((f: string) => f.toUpperCase()).join(', ')
    setStepStatus('prices', 'done', Date.now() - t2, fuentes ? `Fuentes: ${fuentes}` : undefined)

    // Step 3: Calculate metrics
    setStepStatus('metrics', 'running')
    const t3 = Date.now()
    await sleep(600)
    const m = data.metrics
    setStepStatus('metrics', 'done', Date.now() - t3,
      `WTD ${m.wtd > 0 ? '+' : ''}${m.wtd}% · MTD ${m.mtd > 0 ? '+' : ''}${m.mtd}% · YTD ${m.ytd > 0 ? '+' : ''}${m.ytd}%`)

    // Step 4: Validate data (real call)
    setStepStatus('validation', 'running')
    const t4 = Date.now()
    let validOverall = 'ok'
    let validDetail: string | undefined
    try {
      const vRes = await apiFetch(`/api/portfolios/${id}/validations`)
      const vData = await vRes.json()
      validOverall = vData.overall || 'ok'
      const warnings = vData.checks?.filter((c: any) => c.status === 'warning' || c.status === 'error')
      validDetail = warnings?.length
        ? `${warnings.length} alerta(s): ${warnings[0]?.detalle}`
        : 'Todas las validaciones pasaron correctamente'
    } catch { validDetail = 'No se pudo verificar validaciones' }
    await sleep(350)
    setStepStatus('validation', validOverall as GenStep['status'], Date.now() - t4, validDetail)

    // Step 5: AI narrative
    setStepStatus('narrative', 'running')
    const t5 = Date.now()
    try {
      const nRes = await apiFetch(`/api/portfolios/${id}/narrative`, { method: 'POST' })
      if (!nRes.ok) throw new Error(await nRes.text())
      const nData = await nRes.json()
      setNarrative(nData.narrative)
      setStepStatus('narrative', 'done', Date.now() - t5, `Driver: ${nData.key_driver}`)
    } catch {
      setStepStatus('narrative', 'error', Date.now() - t5, 'Configure OPENAI_API_KEY para narrativa')
    }

    // Step 6: Done
    setStepStatus('done', 'running')
    await sleep(350)
    setStepStatus('done', 'done', Date.now() - t0)
  }

  const openPortfolio = async (p: PortfolioSummary) => {
    setDetailSummary(p)
    setDetailPortfolio(null)
    setView('detail')
    try {
      const res = await apiFetch(`/api/portfolios/${p.id}`)
      const data = await res.json()
      setDetailPortfolio(data)
    } catch {}
  }

  const generateNarrative = async () => {
    if (!selected) return
    setLoadingNarrative(true)
    try {
      const id = portfolios.find(p => p.nombre === selected.portfolio.nombre)?.id
      const res = await apiFetch(`/api/portfolios/${id}/narrative`, { method: 'POST' })
      if (!res.ok) throw new Error(await res.text())
      const data = await res.json()
      setNarrative(data.narrative)
      toast.success('Narrativa regenerada')
    } catch (e: any) {
      toast.error(e.message)
    } finally {
      setLoadingNarrative(false)
    }
  }

  // ── Header (shared) ──
  const Header = () => (
    <header style={{ position: 'relative', flexShrink: 0 }}>
      <div style={{ height: '64px', display: 'flex', alignItems: 'center', padding: '0 32px' }}>
        <div style={{ maxWidth: '1100px', width: '100%', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <GrupoMacroLogo height={28} />
            <div style={{ width: '1px', height: '24px', background: 'var(--border)' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '14px', letterSpacing: '0.04em', color: 'var(--text-sub)' }}>SEIDOR</span>
              <span style={{ color: 'var(--border-hi)', fontSize: '14px' }}>/</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--accent)', fontWeight: 500 }}>S2-ONE</span>
            </div>
            <span style={{
              fontFamily: 'var(--font-mono)', fontSize: '9px', letterSpacing: '0.12em', textTransform: 'uppercase',
              padding: '3px 10px', borderRadius: '4px',
              background: 'var(--accent-dim)', border: '1px solid rgba(200,152,64,0.2)', color: 'var(--accent)',
            }}>Hackathon 2026</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              onClick={() => setView('config')}
              title="Integraciones y fuentes de datos"
              className="no-print btn-ghost"
              style={{ padding: '6px 14px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="3"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>
              Integraciones
            </button>
            <button
              onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}
              title={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
              className="no-print btn-ghost"
              style={{ width: '34px', height: '34px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '15px' }}
            >{theme === 'dark' ? '☀️' : '🌙'}</button>
          </div>
        </div>
      </div>
      {/* Accent gradient line */}
      <div style={{ height: '1px', background: 'linear-gradient(90deg, transparent, var(--seidor-blue), var(--green), var(--accent), transparent)' }} />
    </header>
  )

  // ── POC Disclaimer Banner ──
  const DisclaimerBanner = () => (
    <div className="no-print" style={{
      background: 'rgba(245,158,11,0.08)', borderBottom: '1px solid rgba(245,158,11,0.2)',
      padding: '6px 32px', textAlign: 'center',
    }}>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--yellow)', letterSpacing: '0.05em' }}>
        POC — Datos de prueba — No usar para decisiones de inversión
      </span>
    </div>
  )

  // ── Footer (shared) ──
  const Footer = () => (
    <footer className="no-print" style={{ flexShrink: 0 }}>
      <div style={{ height: '1px', background: 'linear-gradient(90deg, transparent, var(--border-hi), transparent)' }} />
      <div style={{ padding: '16px 32px' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)' }}>SEIDOR IA Lab · Grupo Macro Perú 2026</span>
          <div style={{ display: 'flex', gap: '20px' }}>
            {['mauro.hernandez@seidor.com', 'arvinder.ludhiarich@seidor.com'].map(e => (
              <a key={e} href={`mailto:${e}`} style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)', textDecoration: 'none' }}>{e}</a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )

  // ══════════════════════════════════════════════════════
  // ── DETAIL VIEW ─────────────────────────────────────────
  // ══════════════════════════════════════════════════════
  if (view === 'detail' && detailSummary) {
    const p = detailSummary
    const dp = detailPortfolio?.portfolio
    const dm = detailPortfolio?.metrics
    const validaciones = dp?.validaciones
    const validOverall = dm?.validacion_overall
    const VALID_LABELS: Record<string, string> = {
      stock_vs_eecc: 'Stock vs EECC bancarios',
      patrimonio_vs_cuotas: 'Patrimonio vs Valor Cuota',
      precios_input_vs_output: 'Precios input vs output',
    }
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Toaster position="top-right" toastOptions={{ style: { background: 'var(--bg-card)', color: 'var(--text)', border: '1px solid var(--border-hi)', fontFamily: 'var(--font-body)', fontSize: '13px' } }} />
        <Header />
        <DisclaimerBanner />
        <main style={{ flex: 1, maxWidth: '1100px', width: '100%', margin: '0 auto', padding: '32px 32px 64px' }}>
          {/* Nav */}
          <button onClick={() => setView('dashboard')} className="btn-ghost" style={{ marginBottom: '28px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
            Mis Portafolios
          </button>

          {/* Header */}
          <div className="anim-fade-up" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px', gap: '24px' }}>
            <div>
              <p style={{ ...S.label, color: 'var(--accent)', marginBottom: '8px' }}>DETALLE DEL PORTAFOLIO</p>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '8px' }}>{p.nombre}</h2>
              <p style={{ fontSize: '14px', color: 'var(--text-sub)', marginBottom: '6px', lineHeight: 1.5 }}>{p.descripcion}</p>
              <div style={{ display: 'flex', gap: '20px', marginTop: '10px', flexWrap: 'wrap' }}>
                {[['Cliente', p.cliente], ['Gestor', p.gestor], ['Benchmark', p.benchmark || '']].map(([l, v]) => v ? (
                  <span key={l} style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>{l}: <span style={{ color: 'var(--text-sub)', fontWeight: 500 }}>{v}</span></span>
                ) : null)}
              </div>
            </div>
            <div style={{ textAlign: 'right', flexShrink: 0, padding: '16px 20px', background: 'var(--bg-card)', borderRadius: '14px', border: '1px solid var(--border)' }}>
              <p style={{ fontFamily: 'var(--font-display)', fontSize: '32px', fontWeight: 800, color: 'var(--accent)', lineHeight: 1 }}>{fmtCompact(p.patrimonio)}</p>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)', marginTop: '6px' }}>{p.moneda} · Patrimonio Total</p>
              {p.ultima_generacion && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'flex-end', marginTop: '8px' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: validColor(p.validacion_status) }} />
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-muted)' }}>
                    v{p.ultima_generacion.version} · {p.ultima_generacion.estado}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Metrics pills */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '16px', marginBottom: '32px' }}>
            {[['Rendimiento Semanal', p.wtd], ['Rendimiento Mensual', p.mtd], ['Rendimiento Anual', p.ytd]].map(([l, v]) => (
              <div key={l as string} style={{
                background: 'var(--bg-card)', borderRadius: '14px', border: '1px solid var(--border)',
                padding: '18px 22px', textAlign: 'center', position: 'relative', overflow: 'hidden',
              }}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: `linear-gradient(90deg, transparent, ${retCol(v as number)}, transparent)`, opacity: 0.5 }} />
                <p style={{ fontSize: '11px', fontFamily: 'var(--font-body)', color: 'var(--text-muted)', marginBottom: '8px', fontWeight: 500 }}>{l as string}</p>
                <p style={{ fontFamily: 'var(--font-display)', fontSize: '26px', fontWeight: 800, color: retCol(v as number), lineHeight: 1 }}>{retSign(v as number)}%</p>
              </div>
            ))}
          </div>

          {/* Two columns */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '32px' }}>
            {/* Saldos de caja */}
            <div style={{ background: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--border)', padding: '24px 26px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
                <p style={{ fontFamily: 'var(--font-display)', fontSize: '13px', fontWeight: 700, color: 'var(--text-sub)', letterSpacing: '0.02em' }}>Saldos de Caja</p>
              </div>
              {!detailPortfolio ? (
                <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Cargando...</p>
              ) : dp?.saldos_caja?.length ? (
                <>
                  {dp.saldos_caja.map(s => (
                    <div key={s.banco} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                      <span style={{ fontSize: '13px', color: 'var(--text-sub)' }}>{s.banco}</span>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', fontWeight: 600 }}>{fmt(s.saldo)} <span style={{ color: 'var(--text-muted)', fontSize: '11px' }}>{s.moneda}</span></span>
                    </div>
                  ))}
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '10px' }}>
                    <span style={{ ...S.label }}>Total</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '14px', fontWeight: 700, color: 'var(--accent)' }}>{fmt(dp.total_caja || 0)} {dp?.moneda}</span>
                  </div>
                </>
              ) : <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Sin saldos registrados</p>}
            </div>

            {/* Validaciones */}
            <div style={{ background: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--border)', padding: '24px 26px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2" strokeLinecap="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>
                <p style={{ fontFamily: 'var(--font-display)', fontSize: '13px', fontWeight: 700, color: 'var(--text-sub)', letterSpacing: '0.02em' }}>Control de Calidad</p>
              </div>
              {!detailPortfolio ? (
                <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Cargando...</p>
              ) : validaciones ? (
                <>
                  {Object.entries(validaciones).map(([key, val]: [string, any]) => (
                    <div key={key} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: validColor(val.status), flexShrink: 0, marginTop: '4px' }} />
                      <div>
                        <p style={{ fontSize: '12px', color: 'var(--text-sub)', fontWeight: 500 }}>{VALID_LABELS[key] || key}</p>
                        {val.detalle && <p style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginTop: '2px' }}>{val.detalle}</p>}
                      </div>
                    </div>
                  ))}
                  <div style={{ paddingTop: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>ESTADO GLOBAL:</span>
                    <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: validColor(validOverall) }}>{(validOverall || 'ok').toUpperCase()}</span>
                  </div>
                </>
              ) : <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Sin validaciones registradas</p>}
            </div>
          </div>

          {/* Ultimos movimientos */}
          {dp?.movimientos_mes && dp.movimientos_mes.length > 0 && (
            <div style={{ background: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--border)', padding: '24px 26px', marginBottom: '32px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--seidor-blue)" strokeWidth="2" strokeLinecap="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
                <p style={{ fontFamily: 'var(--font-display)', fontSize: '13px', fontWeight: 700, color: 'var(--text-sub)', letterSpacing: '0.02em' }}>Operaciones Recientes</p>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {dp.movimientos_mes.slice(0, 5).map((m: any, i: number) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 0', borderBottom: i < 4 ? '1px solid var(--border)' : 'none' }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)', flexShrink: 0 }}>{m.fecha}</span>
                    <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', padding: '2px 8px', borderRadius: '4px', fontWeight: 500, flexShrink: 0,
                      background: m.tipo === 'Compra' ? 'var(--green-dim)' : m.tipo === 'Venta' ? 'var(--red-dim)' : 'var(--accent-dim)',
                      color: m.tipo === 'Compra' ? 'var(--green)' : m.tipo === 'Venta' ? 'var(--red)' : 'var(--accent)' }}>{m.tipo}</span>
                    <span style={{ fontSize: '12px', color: 'var(--text-sub)', flex: 1 }}>{m.ticker || '—'}</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', fontWeight: 600 }}>{fmt(m.monto)} {dp.moneda}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="no-print" style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
            <button
              onClick={() => startGeneration(p.id)}
              className="btn-primary"
              style={{ padding: '14px 32px', fontSize: '14px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
              Generar One Pager
            </button>
            {p.ultima_generacion && detailPortfolio && (
              <button
                onClick={() => { setSelected(detailPortfolio); setNarrative(''); setView('onepager') }}
                className="btn-ghost"
                style={{ padding: '13px 24px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
                Ver reporte anterior (v{p.ultima_generacion.version})
              </button>
            )}
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  // ══════════════════════════════════════════════════════
  // ── ONE PAGER VIEW ───────────────────────────────────
  // ══════════════════════════════════════════════════════
  if (view === 'generating') {
    const portfolio = portfolios.find(p => p.id === pendingPortfolioId)
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>
        <GenerationWizard
          portfolioName={portfolio?.nombre ?? '...'}
          steps={genSteps}
          onClose={() => setView('onepager')}
        />
      </div>
    )
  }

  if (view === 'onepager' && selected) {
    const { portfolio, metrics } = selected

    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Toaster position="top-right" toastOptions={{ style: { background: 'var(--bg-card)', color: 'var(--text)', border: '1px solid var(--border-hi)', fontFamily: 'var(--font-body)', fontSize: '13px' } }} />
        <Header />
        <DisclaimerBanner />

        {/* Actions bar */}
        <div className="no-print" style={{ maxWidth: '1100px', width: '100%', margin: '0 auto', padding: '20px 32px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={() => detailSummary ? setView('detail') : setView('dashboard')}
            className="btn-ghost"
            style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
            {detailSummary ? 'Volver al detalle' : 'Portafolios'}
          </button>
          <div style={{ flex: 1 }} />
          <button
            onClick={generateNarrative}
            disabled={loadingNarrative}
            className="btn-primary"
            style={{
              padding: '9px 20px', fontSize: '12px', borderRadius: '10px',
              display: 'flex', alignItems: 'center', gap: '8px',
              opacity: loadingNarrative ? 0.6 : 1, cursor: loadingNarrative ? 'wait' : 'pointer',
            }}
          >
            {loadingNarrative
              ? <><div className="anim-spin" style={{ width: '13px', height: '13px', border: '2px solid rgba(5,8,15,0.3)', borderTopColor: 'var(--bg)', borderRadius: '50%' }} /> Generando...</>
              : <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg> Regenerar narrativa IA</>
            }
          </button>
          <button
            onClick={() => window.print()}
            className="btn-ghost"
            style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
            Imprimir
          </button>
        </div>

        {/* One Pager Card */}
        <main style={{ flex: 1, maxWidth: '1100px', width: '100%', margin: '0 auto', padding: '20px 32px 64px' }}>
          <div className="anim-fade-up print-card" style={{ background: 'var(--bg-card)', borderRadius: '20px', border: '1px solid var(--border)', overflow: 'hidden', boxShadow: '0 8px 40px rgba(0,0,0,0.15)' }}>

            {/* ── Report Header ── */}
            <div style={{
              padding: '40px 40px 30px',
              background: 'linear-gradient(135deg, rgba(30,114,217,0.06) 0%, rgba(46,173,99,0.06) 50%, rgba(232,185,96,0.05) 100%)',
              borderBottom: '1px solid var(--border)', position: 'relative',
            }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: 'linear-gradient(90deg, var(--seidor-blue), var(--green), var(--accent))' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <p style={{ ...S.label, marginBottom: '8px', color: 'var(--accent)' }}>One Pager Mensual</p>
                  <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '4px' }}>
                    {portfolio.nombre}
                  </h1>
                  <p style={{ fontSize: '14px', color: 'var(--text-sub)' }}>{portfolio.descripcion}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '6px' }}>{metrics.fecha_reporte}</p>
                  <p style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 800, color: 'var(--accent)', lineHeight: 1 }}>
                    {fmt(metrics.patrimonio)}
                  </p>
                  <p style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>{portfolio.moneda} · Patrimonio Total</p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '28px', marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
                {[
                  { icon: '◆', label: 'Cliente', val: portfolio.cliente },
                  { icon: '◆', label: 'Benchmark', val: portfolio.benchmark },
                  { icon: '◆', label: 'Gestor', val: portfolio.gestor },
                ].map(({ icon, label, val }) => (
                  <span key={label} style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ color: 'var(--accent)', fontSize: '6px' }}>{icon}</span>
                    {label}: <span style={{ color: 'var(--text)', fontWeight: 500 }}>{val}</span>
                  </span>
                ))}
              </div>
            </div>

            <div style={{ padding: '36px 40px', display: 'flex', flexDirection: 'column', gap: '36px' }}>

              {/* ── Metrics ── */}
              <section>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round"><line x1="12" y1="20" x2="12" y2="10"/><line x1="18" y1="20" x2="18" y2="4"/><line x1="6" y1="20" x2="6" y2="16"/></svg>
                  <p style={{ fontFamily: 'var(--font-display)', fontSize: '13px', fontWeight: 700, color: 'var(--text-sub)', letterSpacing: '0.02em' }}>Rendimiento del Período</p>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '16px' }}>
                  <ReturnPill value={metrics.wtd} label="Semana" />
                  <ReturnPill value={metrics.mtd} label="Mes" />
                  <ReturnPill value={metrics.ytd} label="Año" />
                </div>
                {/* Benchmark comparison */}
                {(metrics.alpha_mtd !== undefined || metrics.alpha_ytd !== undefined) && (
                  <div style={{ marginTop: '14px', background: 'var(--bg-elevated)', borderRadius: '10px', padding: '14px 18px', border: '1px solid var(--border)' }}>
                    <p style={{ ...S.label, marginBottom: '10px' }}>vs. Benchmark ({portfolio.benchmark_data?.nombre || portfolio.benchmark})</p>
                    <div style={{ display: 'flex', gap: '24px' }}>
                      {[['WTD', metrics.alpha_wtd, portfolio.benchmark_data?.wtd], ['MTD', metrics.alpha_mtd, portfolio.benchmark_data?.mtd], ['YTD', metrics.alpha_ytd, portfolio.benchmark_data?.ytd]]
                        .map(([l, alpha, bval]) => alpha !== undefined && (
                          <div key={l as string} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-muted)' }}>{l as string}</span>
                            <div style={{ display: 'flex', gap: '10px', alignItems: 'baseline' }}>
                              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--text-muted)' }}>Bmark: {retSign(bval as number)}%</span>
                              <span style={{
                                fontFamily: 'var(--font-mono)', fontSize: '13px', fontWeight: 700,
                                color: (alpha as number) >= 0 ? 'var(--green)' : 'var(--red)'
                              }}>Alpha: {retSign(alpha as number)}%</span>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
                {metrics.duracion_ponderada > 0 && (
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '12px', fontFamily: 'var(--font-mono)' }}>
                    Duracion ponderada: <span style={{ color: 'var(--text-sub)', fontWeight: 500 }}>{metrics.duracion_ponderada} anos</span>
                  </p>
                )}
              </section>

              {/* ── Composition ── */}
              <section>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--seidor-blue)" strokeWidth="2" strokeLinecap="round"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"/><path d="M22 12A10 10 0 0 0 12 2v10z"/></svg>
                  <p style={{ fontFamily: 'var(--font-display)', fontSize: '13px', fontWeight: 700, color: 'var(--text-sub)', letterSpacing: '0.02em' }}>Composición del Portafolio</p>
                </div>
                <CompositionBar dist={metrics.distribucion_clases} />

                <div style={{ marginTop: '20px', borderRadius: '12px', border: '1px solid var(--border)', overflow: 'hidden' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr>
                        <th style={S.th}>Activo</th>
                        <th style={S.thR}>Peso</th>
                        <th style={S.thR}>P. Compra</th>
                        <th style={S.thR}>P. Actual</th>
                        <th style={S.thR}>Rend.</th>
                        <th style={S.thR}>Contrib.</th>
                      </tr>
                    </thead>
                    <tbody>
                      {metrics.activos.map((a, i) => (
                        <tr key={i} style={{ transition: 'background 0.15s' }}
                          onMouseEnter={e => { (e.currentTarget as HTMLTableRowElement).style.background = 'var(--bg-elevated)' }}
                          onMouseLeave={e => { (e.currentTarget as HTMLTableRowElement).style.background = 'transparent' }}
                        >
                          <td style={S.td}>
                            <p style={{ fontWeight: 500, fontSize: '13px', marginBottom: '2px' }}>{a.nombre}</p>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <span style={{ color: classColor(a.clase), fontSize: '9px' }}>●</span>
                              <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{a.ticker} · {a.clase}</span>
                              {a.fuente_precio && (
                                <span style={{ fontSize: '9px', fontFamily: 'var(--font-mono)', fontWeight: 700, padding: '1px 5px', borderRadius: '3px', border: `1px solid ${fuenteColor(a.fuente_precio)}40`, color: fuenteColor(a.fuente_precio), background: `${fuenteColor(a.fuente_precio)}12` }}>
                                  {fuenteLabel(a.fuente_precio)}
                                </span>
                              )}
                            </div>
                          </td>
                          <td style={S.tdR}>{(a.peso * 100).toFixed(1)}%</td>
                          <td style={{ ...S.tdR, color: 'var(--text-muted)' }}>{a.precio_compra.toFixed(2)}</td>
                          <td style={{ ...S.tdR, fontWeight: 500 }}>{a.precio_actual.toFixed(2)}</td>
                          <td style={{ ...S.tdR, fontWeight: 600, color: retCol(a.rendimiento_activo) }}>
                            {retSign(a.rendimiento_activo)}%
                          </td>
                          <td style={{ ...S.tdR, color: retCol(a.contribucion_portfolio) }}>
                            {retSign(a.contribucion_portfolio)}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>

              {/* ── AI Narrative ── */}
              {narrative && (
                <section className="anim-fade-up">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
                    <p style={{ fontFamily: 'var(--font-display)', fontSize: '13px', fontWeight: 700, color: 'var(--text-sub)', letterSpacing: '0.02em' }}>Análisis Narrativo — Generado por IA</p>
                  </div>
                  <div style={{
                    padding: '24px 28px', borderRadius: '14px',
                    border: '1px solid rgba(232,185,96,0.15)',
                    background: 'linear-gradient(135deg, var(--accent-dim), rgba(232,185,96,0.03))',
                    position: 'relative', overflow: 'hidden',
                  }}>
                    <div style={{ position: 'absolute', top: 0, left: 0, width: '3px', height: '100%', background: 'linear-gradient(180deg, var(--accent), transparent)', borderRadius: '3px' }} />
                    <p style={{ fontSize: '13.5px', lineHeight: 1.85, color: 'var(--text-sub)', whiteSpace: 'pre-wrap', paddingLeft: '12px' }}>{narrative}</p>
                  </div>
                </section>
              )}

              {/* ── Movements ── */}
              {portfolio.movimientos_mes.length > 0 && (
                <section>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2" strokeLinecap="round"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>
                    <p style={{ fontFamily: 'var(--font-display)', fontSize: '13px', fontWeight: 700, color: 'var(--text-sub)', letterSpacing: '0.02em' }}>Operaciones del Mes</p>
                  </div>
                  <div style={{ borderRadius: '12px', border: '1px solid var(--border)', overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr>
                          <th style={S.th}>Fecha</th>
                          <th style={S.th}>Tipo</th>
                          <th style={S.th}>Activo</th>
                          <th style={S.thR}>Monto</th>
                        </tr>
                      </thead>
                      <tbody>
                        {portfolio.movimientos_mes.map((m: any, i: number) => (
                          <tr key={i}>
                            <td style={{ ...S.td, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', fontSize: '12px' }}>{m.fecha}</td>
                            <td style={S.td}>
                              <span style={{
                                fontSize: '11px', fontFamily: 'var(--font-mono)', padding: '3px 10px', borderRadius: '4px', fontWeight: 500,
                                background: m.tipo === 'Compra' ? 'var(--green-dim)' : m.tipo === 'Venta' ? 'var(--red-dim)' : 'var(--accent-dim)',
                                color: m.tipo === 'Compra' ? 'var(--green)' : m.tipo === 'Venta' ? 'var(--red)' : 'var(--accent)',
                              }}>{m.tipo}</span>
                            </td>
                            <td style={{ ...S.td, fontWeight: 500 }}>{m.ticker}</td>
                            <td style={{ ...S.tdR, fontWeight: 500 }}>{fmt(m.monto)} {portfolio.moneda}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>
              )}

              {/* ── Doc footer ── */}
              <div style={{ paddingTop: '20px' }}>
                <div style={{ height: '1px', background: 'linear-gradient(90deg, transparent, var(--border-hi), transparent)', marginBottom: '18px' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <p style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', lineHeight: 1.8 }}>
                      Documento confidencial · Generado por S2-ONE · SEIDOR IA Lab · {metrics.fecha_reporte}
                    </p>
                    <p style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', lineHeight: 1.8, marginTop: '2px' }}>
                      La información proviene de fuentes consideradas confiables. El rendimiento pasado no garantiza resultados futuros.
                    </p>
                  </div>
                  <GrupoMacroLogo height={20} />
                </div>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  // ══════════════════════════════════════════════════════
  // ── CONFIG VIEW ─────────────────────────────────────────
  // ══════════════════════════════════════════════════════
  if (view === 'config') {
    const integraciones = configStatus?.integraciones || {}
    const bancosCustodia = config?.integraciones?.bancos_custodia?.bancos_configurados || []
    const fuentesPorClase = config?.fuentes_por_clase || {}

    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Toaster position="top-right" toastOptions={{ style: { background: 'var(--bg-card)', color: 'var(--text)', border: '1px solid var(--border-hi)', fontFamily: 'var(--font-body)', fontSize: '13px' } }} />
        <Header />
        <DisclaimerBanner />
        <main style={{ flex: 1, maxWidth: '1100px', width: '100%', margin: '0 auto', padding: '32px 32px 64px' }}>
          {/* Nav */}
          <button onClick={() => setView('dashboard')} className="btn-ghost" style={{ marginBottom: '28px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
            Mis Portafolios
          </button>

          {/* Header */}
          <div className="anim-fade-up" style={{ marginBottom: '36px' }}>
            <p style={{ ...S.label, color: 'var(--accent)', marginBottom: '10px' }}>CONFIGURACIÓN</p>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 800, letterSpacing: '-0.02em' }}>
              Conexiones y Fuentes de Datos
            </h2>
            <p style={{ fontSize: '14px', color: 'var(--text-sub)', marginTop: '10px', lineHeight: 1.6, maxWidth: '560px' }}>
              Aquí puedes revisar el estado de las conexiones con Bloomberg, SBS, bancos de custodia y el motor de IA que genera las narrativas.
            </p>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)', marginTop: '8px' }}>
              v{config?.version || '—'} · Actualizado: {config?.ultima_actualizacion ? new Date(config.ultima_actualizacion).toLocaleString('es-PE') : '—'}
            </p>
          </div>

          {loadingConfig ? (
            <div style={{ textAlign: 'center', padding: '60px' }}>
              <div className="anim-spin" style={{ width: '32px', height: '32px', border: '3px solid var(--accent-dim)', borderTopColor: 'var(--accent)', borderRadius: '50%', margin: '0 auto 16px' }} />
              <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Cargando configuración...</p>
            </div>
          ) : (
            <>
              {/* Status Overview */}
              <div className="anim-fade-up" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '36px' }}>
                {[
                  { label: 'Fuentes Totales', val: configStatus?.total_integraciones, color: 'var(--text)', icon: '🔗' },
                  { label: 'Conectadas', val: configStatus?.conectadas, color: 'var(--green)', icon: '✓' },
                  { label: 'Activas', val: configStatus?.habilitadas, color: 'var(--accent)', icon: '⚡' },
                  { label: 'Sin Conexión', val: (configStatus?.total_integraciones || 0) - (configStatus?.conectadas || 0), color: 'var(--red)', icon: '—' },
                ].map(({ label, val, color, icon }) => (
                  <div key={label} style={{
                    background: 'var(--bg-card)', borderRadius: '14px', border: '1px solid var(--border)',
                    padding: '22px 24px', textAlign: 'center', position: 'relative', overflow: 'hidden',
                  }}>
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: `linear-gradient(90deg, transparent, ${color}, transparent)`, opacity: 0.4 }} />
                    <p style={{ fontSize: '12px', marginBottom: '8px' }}>{icon}</p>
                    <p style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 800, color, lineHeight: 1 }}>{val || 0}</p>
                    <p style={{ fontSize: '11px', fontFamily: 'var(--font-body)', color: 'var(--text-muted)', marginTop: '8px', fontWeight: 500 }}>{label}</p>
                  </div>
                ))}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                {/* Integraciones API */}
                <div className="anim-fade-up" style={{ background: 'var(--bg-card)', borderRadius: '18px', border: '1px solid var(--border)', padding: '28px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
                    <p style={{ fontFamily: 'var(--font-display)', fontSize: '14px', fontWeight: 700, color: 'var(--text-sub)' }}>Fuentes de Precios</p>
                  </div>

                  {Object.entries(integraciones).filter(([k]) => k !== 'bancos_custodia').map(([key, integ]: [string, any]) => (
                    <div key={key} style={{ padding: '16px 0', borderBottom: '1px solid var(--border)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span style={{
                              width: '8px', height: '8px', borderRadius: '50%', flexShrink: 0,
                              background: integ.habilitado ? (integ.estado === 'conectado' ? 'var(--green)' : 'var(--red)') : 'var(--text-muted)',
                              boxShadow: integ.habilitado && integ.estado === 'conectado' ? '0 0 6px var(--green)' : 'none',
                            }} />
                            <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>{integ.nombre}</span>
                          </div>
                          <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '5px', lineHeight: 1.4 }}>
                            {integ.estado === 'conectado' ? '✓ Conectado' : '✕ Desconectado'} · {integ.requests_hoy || 0} consultas hoy
                          </p>
                        </div>
                        <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                          <button
                            onClick={() => testConnection(key)}
                            className="btn-ghost"
                            style={{ fontSize: '11px', padding: '5px 12px' }}
                          >Probar</button>
                          <button
                            onClick={() => toggleIntegracion(key, !integ.habilitado)}
                            style={{
                              fontSize: '11px', padding: '5px 12px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                              background: integ.habilitado ? 'var(--red-dim)' : 'var(--green-dim)',
                              color: integ.habilitado ? 'var(--red)' : 'var(--green)',
                              fontWeight: 600, transition: 'all 0.2s',
                            }}
                          >{integ.habilitado ? 'Desactivar' : 'Activar'}</button>
                        </div>
                      </div>
                      {integ.latency_ms && (
                        <div style={{ display: 'flex', gap: '16px', fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                          <span>Latencia: {integ.latency_ms}ms</span>
                          <span>Último check: {integ.ultimo_check ? new Date(integ.ultimo_check).toLocaleTimeString('es-PE') : '—'}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Bancos Custodia */}
                <div className="anim-fade-up" style={{ background: 'var(--bg-card)', borderRadius: '18px', border: '1px solid var(--border)', padding: '28px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--seidor-blue)" strokeWidth="2" strokeLinecap="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
                    <p style={{ fontFamily: 'var(--font-display)', fontSize: '14px', fontWeight: 700, color: 'var(--text-sub)' }}>Bancos de Custodia</p>
                  </div>

                  {bancosCustodia.map((banco: any) => (
                    <div key={banco.banco} style={{ padding: '14px 0', borderBottom: '1px solid var(--border)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span style={{
                            width: '8px', height: '8px', borderRadius: '50%', flexShrink: 0,
                            background: banco.estado === 'conectado' ? 'var(--green)' : banco.habilitado ? 'var(--red)' : 'var(--text-muted)',
                            boxShadow: banco.estado === 'conectado' ? '0 0 6px var(--green)' : 'none',
                          }} />
                          <div>
                            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)' }}>{banco.banco}</span>
                            <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>{banco.tipo_conexion} · {banco.cuentas?.length || 0} cuentas</p>
                          </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          {banco.estado === 'conectado' ? (
                            <span style={{ fontSize: '11px', color: 'var(--green)', fontFamily: 'var(--font-mono)', fontWeight: 500 }}>
                              ✓ Sincronizado
                            </span>
                          ) : (
                            <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>Sin conexión</span>
                          )}
                          {banco.ultimo_sync && (
                            <p style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginTop: '2px' }}>
                              {new Date(banco.ultimo_sync).toLocaleTimeString('es-PE')}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}

                  <button
                    onClick={() => testConnection('bancos_custodia')}
                    className="btn-ghost"
                    style={{ marginTop: '18px', width: '100%', padding: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
                    Sincronizar todos los saldos
                  </button>
                </div>
              </div>

              {/* Fuentes por clase de activo */}
              <div className="anim-fade-up" style={{ background: 'var(--bg-card)', borderRadius: '18px', border: '1px solid var(--border)', padding: '28px', marginTop: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
                  <p style={{ fontFamily: 'var(--font-display)', fontSize: '14px', fontWeight: 700, color: 'var(--text-sub)' }}>De dónde vienen los datos</p>
                </div>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '18px', lineHeight: 1.5 }}>
                  Cada tipo de activo se alimenta de fuentes específicas para asegurar la precisión de los precios.
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px' }}>
                  {Object.entries(fuentesPorClase).map(([clase, fuentes]: [string, any]) => (
                    <div key={clase} style={{
                      padding: '16px', borderRadius: '12px', background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                      transition: 'border-color 0.2s',
                    }}>
                      <p style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-sub)', marginBottom: '10px', lineHeight: 1.3 }}>{clase}</p>
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        {fuentes.map((f: string) => (
                          <span key={f} style={{
                            fontSize: '10px', fontFamily: 'var(--font-mono)', padding: '3px 9px', borderRadius: '5px',
                            background: `${fuenteColor(f)}15`, color: fuenteColor(f), border: `1px solid ${fuenteColor(f)}30`,
                            fontWeight: 500,
                          }}>
                            {fuenteLabel(f) || f.toUpperCase()}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* OpenAI Config */}
              {integraciones.openai && (
                <div className="anim-fade-up" style={{ background: 'var(--bg-card)', borderRadius: '18px', border: '1px solid var(--border)', padding: '28px', marginTop: '24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
                    <p style={{ fontFamily: 'var(--font-display)', fontSize: '14px', fontWeight: 700, color: 'var(--text-sub)' }}>Motor de Inteligencia Artificial</p>
                  </div>
                  <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '20px', lineHeight: 1.5 }}>
                    La narrativa de cada One Pager se genera con GPT-4o de OpenAI, analizando métricas, validaciones y contexto de mercado.
                  </p>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
                    {[
                      ['Modelo', integraciones.openai.modelo],
                      ['Creatividad', `${(integraciones.openai.temperature * 100).toFixed(0)}%`],
                      ['Palabras máx.', integraciones.openai.max_tokens],
                      ['Uso hoy', `${integraciones.openai.requests_hoy} de ${integraciones.openai.limite_diario}`],
                    ].map(([l, v]) => (
                      <div key={l as string}>
                        <p style={{ fontSize: '11px', fontFamily: 'var(--font-body)', color: 'var(--text-muted)', marginBottom: '6px', fontWeight: 500 }}>{l as string}</p>
                        <p style={{ fontSize: '15px', color: 'var(--text-sub)', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{v as string}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </main>
        <Footer />
      </div>
    )
  }

  // ══════════════════════════════════════════════════════
  // ── DASHBOARD VIEW ───────────────────────────────────
  // ══════════════════════════════════════════════════════
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Toaster position="top-right" toastOptions={{ style: { background: 'var(--bg-card)', color: 'var(--text)', border: '1px solid var(--border-hi)', fontFamily: 'var(--font-body)', fontSize: '13px', borderRadius: '10px' } }} />
      <Header />
      <DisclaimerBanner />

      <main style={{ flex: 1, maxWidth: '1100px', width: '100%', margin: '0 auto', padding: '48px 32px 64px' }}>

        {/* Hero section */}
        <div className="anim-fade-up" style={{ marginBottom: '44px' }}>
          <p style={{ ...S.label, color: 'var(--accent)', marginBottom: '12px', fontSize: '11px' }}>MACRO WEALTH MANAGEMENT</p>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '30px', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '10px', lineHeight: 1.2 }}>
            Tus Portafolios
          </h2>
          <p style={{ fontSize: '15px', color: 'var(--text-sub)', lineHeight: 1.6, maxWidth: '520px' }}>
            Selecciona un portafolio para revisar su estado y generar el reporte One Pager con narrativa IA.
          </p>
        </div>

        {/* Loading state */}
        {loadingPortfolios && (
          <div className="anim-fade-up" style={{ textAlign: 'center', padding: '80px 0' }}>
            <div className="anim-spin" style={{
              width: '40px', height: '40px', border: '3px solid var(--accent-dim)',
              borderTopColor: 'var(--accent)', borderRadius: '50%', margin: '0 auto 20px'
            }} />
            <p style={{ fontSize: '14px', color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}>
              Cargando portafolios...
            </p>
          </div>
        )}

        {/* Error state */}
        {portfoliosError && !loadingPortfolios && (
          <div className="anim-fade-up" style={{
            background: 'var(--red-dim)', border: '1px solid var(--red)', borderRadius: '12px',
            padding: '24px 28px', textAlign: 'center', maxWidth: '500px', margin: '0 auto 40px',
          }}>
            <p style={{ fontSize: '14px', color: 'var(--red)', fontWeight: 600, marginBottom: '8px' }}>
              No se pudieron cargar los portafolios
            </p>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px' }}>
              {portfoliosError}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="btn-ghost"
              style={{ fontSize: '12px' }}
            >
              Intentar de nuevo
            </button>
          </div>
        )}

        {/* Empty state */}
        {!loadingPortfolios && !portfoliosError && portfolios.length === 0 && (
          <div className="anim-fade-up" style={{ textAlign: 'center', padding: '80px 0' }}>
            <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
              No hay portafolios disponibles
            </p>
          </div>
        )}

        {/* Cards grid */}
        {!loadingPortfolios && portfolios.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '22px' }}>
          {portfolios.map((p, idx) => (
            <div
              key={p.id}
              className="anim-fade-up glass-card"
              style={{
                overflow: 'hidden', animationDelay: `${idx * 0.1}s`,
                cursor: 'pointer', position: 'relative',
              }}
              onClick={() => openPortfolio(p)}
            >
              {/* Top accent line per card */}
              <div style={{
                position: 'absolute', top: 0, left: 0, right: 0, height: '2px',
                background: `linear-gradient(90deg, transparent, ${retCol(p.ytd)}, transparent)`,
                opacity: 0.5,
              }} />

              {/* Card header */}
              <div style={{ padding: '26px 26px 22px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '18px' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '17px', marginBottom: '5px' }}>{p.nombre}</h3>
                    <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.4 }}>{p.descripcion}</p>
                  </div>
                  <span style={{
                    fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: 600,
                    padding: '5px 10px', borderRadius: '6px', flexShrink: 0, marginLeft: '12px',
                    background: p.ytd >= 0 ? 'var(--green-dim)' : 'var(--red-dim)',
                    color: retCol(p.ytd),
                  }}>YTD {retSign(p.ytd)}%</span>
                </div>

                <p style={{ fontFamily: 'var(--font-display)', fontSize: '32px', fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1, color: 'var(--text)' }}>
                  {fmtCompact(p.patrimonio)}
                </p>
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)', marginTop: '5px' }}>
                  {p.moneda} · {p.cliente}
                </p>
              </div>

              {/* Divider */}
              <div style={{ height: '1px', background: 'linear-gradient(90deg, transparent, var(--border), transparent)', margin: '0 26px' }} />

              {/* Metrics row */}
              <div style={{ padding: '16px 26px 0', display: 'flex' }}>
                {[
                  { label: 'Semana', val: p.wtd },
                  { label: 'Mes', val: p.mtd },
                  { label: 'Año', val: p.ytd },
                ].map(({ label, val }, i) => (
                  <div key={label} style={{
                    flex: 1, textAlign: 'center', padding: '8px 0',
                    borderRight: i < 2 ? '1px solid var(--border)' : 'none',
                  }}>
                    <p style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-body)', marginBottom: '4px', fontWeight: 500 }}>{label}</p>
                    <p style={{ fontFamily: 'var(--font-display)', fontSize: '16px', fontWeight: 700, color: retCol(val) }}>
                      {retSign(val)}%
                    </p>
                  </div>
                ))}
              </div>

              {/* Status row */}
              <div style={{ padding: '14px 26px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: validColor(p.validacion_status), flexShrink: 0, boxShadow: `0 0 6px ${validColor(p.validacion_status)}` }} />
                  {p.ultima_generacion ? (
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-muted)' }}>
                      v{p.ultima_generacion.version} · {p.ultima_generacion.estado}
                    </span>
                  ) : (
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-muted)' }}>Sin reportes</span>
                  )}
                </div>
                <span style={{
                  fontFamily: 'var(--font-display)', fontSize: '12px', fontWeight: 600, color: 'var(--accent)',
                  display: 'flex', alignItems: 'center', gap: '4px', transition: 'gap 0.2s',
                }}>
                  Ver detalle
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </span>
              </div>
            </div>
          ))}
        </div>
        )}
      </main>
      <Footer />
    </div>
  )
}
