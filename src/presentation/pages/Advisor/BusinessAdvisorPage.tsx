import { useState, useCallback, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft, MapPin, Crosshair, Search, Loader2, AlertTriangle, Pencil,
  Store, TrendingUp, Wallet, Target, CheckCircle2, ClipboardList, Lightbulb,
  Users, BarChart3, ChevronRight, Megaphone, Info, ExternalLink,
} from 'lucide-react'
import { useSmartBack } from '@presentation/hooks/useSmartBack'
import { businessAdvisorService, type BusinessAdvisorReport } from '@lib/supabase/services/ai/businessAdvisorService'
import { searchAddress, reverseGeocode, type GeoResult } from '@lib/geocoding/geocodingService'

// ── Coordenadas cacheadas por el tracking de la app ──────────────────────────────
function storedCoords(): { lat?: number; lng?: number } {
  try {
    const raw = sessionStorage.getItem('_lugabiz_last_pos')
    if (!raw) return {}
    const { lat, lng } = JSON.parse(raw)
    return { lat, lng }
  } catch { return {} }
}

interface ChosenLocation { label: string; lat?: number; lng?: number; city?: string }

// ── Paleta semántica (status, no decorativa) ─────────────────────────────────────
const SCORE = (s: number) => (s >= 66 ? '#7e22ce' : s >= 40 ? '#b45309' : '#b91c1c')
const VERDICT_LABEL: Record<string, string> = { alta: 'Alta viabilidad', media: 'Viabilidad media', baja: 'Baja viabilidad' }
const LEVEL_TONE: Record<string, string> = {
  baja: 'text-primary-700 bg-primary-50 border-primary-200',
  media: 'text-amber-700 bg-amber-50 border-amber-200',
  alta: 'text-orange-700 bg-orange-50 border-orange-200',
  saturado: 'text-red-700 bg-red-50 border-red-200',
}
const DEMAND_TONE: Record<string, string> = {
  alta: 'text-primary-700 bg-primary-50 border-primary-200',
  media: 'text-amber-700 bg-amber-50 border-amber-200',
  baja: 'text-red-700 bg-red-50 border-red-200',
}

function ScoreDial({ score }: { score: number }) {
  const color = SCORE(score), r = 34, c = 2 * Math.PI * r
  return (
    <div className="relative w-[88px] h-[88px] shrink-0">
      <svg className="w-[88px] h-[88px] -rotate-90" viewBox="0 0 80 80">
        <circle cx="40" cy="40" r={r} fill="none" stroke="#eef2f5" strokeWidth="7" />
        <motion.circle cx="40" cy="40" r={r} fill="none" stroke={color} strokeWidth="7" strokeLinecap="round"
          strokeDasharray={c} initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: c - (c * score) / 100 }} transition={{ duration: 0.9, ease: 'easeOut' }} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold tracking-tight" style={{ color }}>{score}</span>
        <span className="text-[9px] uppercase tracking-wide text-slate-400">/100</span>
      </div>
    </div>
  )
}

const Section = ({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) => (
  <div>
    <div className="flex items-center gap-2 mb-2.5">
      <span className="text-slate-400">{icon}</span>
      <h3 className="text-[13px] font-semibold uppercase tracking-wide text-slate-500">{title}</h3>
    </div>
    {children}
  </div>
)

type Tab = 'veredicto' | 'oferta' | 'competencia' | 'alternativas' | 'encuesta' | 'plan'

export default function BusinessAdvisorPage() {
  const goBack = useSmartBack('/')

  const [idea, setIdea] = useState('')
  const [location, setLocation] = useState<ChosenLocation | null>(null)
  const [zoneQuery, setZoneQuery] = useState('')
  const [geoResults, setGeoResults] = useState<GeoResult[]>([])
  const [searchingZone, setSearchingZone] = useState(false)
  const [locating, setLocating] = useState(false)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [report, setReport] = useState<BusinessAdvisorReport | null>(null)
  const [tab, setTab] = useState<Tab>('veredicto')

  const canAnalyze = useMemo(() => !!location && !loading, [location, loading])

  // Ubicación actual → reverse-geocode para mostrar la dirección REAL detectada
  const useMyLocation = useCallback(() => {
    setLocating(true); setError(null); setGeoResults([])
    const cached = storedCoords()
    const apply = async (lat: number, lng: number) => {
      setLocation({ label: 'Detectando dirección…', lat, lng })
      const addr = await reverseGeocode(lat, lng).catch(() => null)
      const short = addr ? addr.split(',').slice(0, 3).join(', ') : `${lat.toFixed(4)}, ${lng.toFixed(4)}`
      setLocation({ label: short, lat, lng })
      setLocating(false)
    }
    if (!navigator.geolocation) {
      if (cached.lat != null && cached.lng != null) { apply(cached.lat, cached.lng); return }
      setError('Tu navegador no soporta geolocalización.'); setLocating(false); return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => apply(pos.coords.latitude, pos.coords.longitude),
      () => {
        if (cached.lat != null && cached.lng != null) apply(cached.lat, cached.lng)
        else { setError('No pudimos obtener tu ubicación. Escribí una zona en su lugar.'); setLocating(false) }
      },
      { enableHighAccuracy: true, timeout: 9000, maximumAge: 30000 },
    )
  }, [])

  const runZoneSearch = useCallback(async () => {
    if (zoneQuery.trim().length < 3) return
    setSearchingZone(true)
    try { setGeoResults(await searchAddress(zoneQuery)) } finally { setSearchingZone(false) }
  }, [zoneQuery])

  const pickZone = (g: GeoResult) => {
    const short = g.displayName.split(',').slice(0, 3).join(', ')
    setLocation({ label: short, lat: g.lat, lng: g.lng, city: g.displayName.split(',').pop()?.trim() })
    setGeoResults([]); setZoneQuery(short)
  }

  const analyze = useCallback(async () => {
    if (!location) return
    setLoading(true); setError(null); setReport(null)
    try {
      const r = await businessAdvisorService.analyze({
        idea: idea.trim() || undefined, lat: location.lat, lng: location.lng, city: location.city,
      })
      setReport(r); setTab('veredicto')
    } catch (e: any) {
      setError(e?.message ?? 'No se pudo completar el análisis. Intentá de nuevo.')
    } finally { setLoading(false) }
  }, [idea, location])

  return (
    <div className="min-h-screen bg-[#fafaf9] pb-24 md:pb-12">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-white/95 backdrop-blur border-b border-slate-200">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center gap-3">
          <button onClick={goBack} className="p-2 -ml-2 rounded-lg hover:bg-slate-100 transition-colors">
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </button>
          <div className="leading-tight">
            <h1 className="text-[15px] font-semibold text-slate-900">Asesor de oportunidades</h1>
            <p className="text-[11px] text-slate-400">Análisis de mercado por ubicación</p>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 pt-5 space-y-4">
        {/* Formulario / barra compacta */}
        {!report ? (
          <FormPanel
            idea={idea} setIdea={setIdea}
            location={location} setLocation={setLocation}
            zoneQuery={zoneQuery} setZoneQuery={setZoneQuery}
            geoResults={geoResults} pickZone={pickZone}
            searchingZone={searchingZone} runZoneSearch={runZoneSearch}
            locating={locating} useMyLocation={useMyLocation}
            canAnalyze={canAnalyze} loading={loading} analyze={analyze}
          />
        ) : (
          <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3">
            <div className="min-w-0">
              <p className="text-[13px] font-semibold text-slate-800 truncate">
                {report.idea ? report.idea : 'Mejores oportunidades'} · <span className="font-normal text-slate-500">{report.location.area || report.location.city}</span>
              </p>
              <p className="text-[11px] text-slate-400 truncate">{report.location.full}</p>
            </div>
            <button onClick={() => { setReport(null); setError(null) }}
              className="shrink-0 inline-flex items-center gap-1.5 text-[13px] font-medium text-slate-600 hover:text-slate-900 px-2.5 py-1.5 rounded-lg hover:bg-slate-100 transition-colors">
              <Pencil className="w-3.5 h-3.5" /> Nuevo
            </button>
          </div>
        )}

        <AnimatePresence>
          {error && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="flex items-center gap-2 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-[13px] text-red-700">
              <AlertTriangle className="w-4 h-4 shrink-0" /> {error}
            </motion.div>
          )}
        </AnimatePresence>

        {loading && !report && (
          <div className="rounded-xl border border-slate-200 bg-white p-8 flex flex-col items-center gap-3 text-center">
            <Loader2 className="w-7 h-7 text-slate-400 animate-spin" />
            <p className="text-[13px] text-slate-500 max-w-xs">Cruzando el mapa, los negocios reconocidos de la zona y las tendencias de consumo…</p>
          </div>
        )}

        {report && <ReportView report={report} tab={tab} setTab={setTab} />}
      </main>
    </div>
  )
}

// ── Panel del formulario ─────────────────────────────────────────────────────────
function FormPanel(p: any) {
  return (
    <>
      <div className="rounded-xl border border-slate-200 bg-white p-1">
        <div className="px-4 pt-3.5 pb-3 border-b border-slate-100">
          <p className="text-[13px] text-slate-500 leading-relaxed">
            Dime <span className="font-medium text-slate-700">qué deseas abrir</span> y <span className="font-medium text-slate-700">dónde</span>. Analizo competencia,
            saturación, demanda y tendencias reales de la zona para decirte si conviene — o qué sería más rentable.
          </p>
        </div>

        <div className="p-4 space-y-4">
          {/* Idea */}
          <div>
            <label className="block text-[13px] font-medium text-slate-700 mb-1.5">Idea de negocio <span className="text-slate-400 font-normal">· opcional</span></label>
            <input value={p.idea} onChange={(e: any) => p.setIdea(e.target.value)} maxLength={160}
              placeholder="Ej: pollería, cafetería de especialidad, parrillada dominical…"
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-[14px] text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500" />
            <p className="text-[11px] text-slate-400 mt-1.5">Si lo dejás vacío, te recomiendo los negocios con mayor potencial para esa ubicación.</p>
          </div>

          {/* Ubicación */}
          <div>
            <label className="block text-[13px] font-medium text-slate-700 mb-1.5">Ubicación</label>
            {p.location ? (
              <div className="flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-lg bg-slate-50 border border-slate-200">
                <span className="flex items-center gap-2 text-[13px] text-slate-700 font-medium truncate">
                  <MapPin className="w-4 h-4 text-primary-600 shrink-0" /> {p.location.label}
                </span>
                <button onClick={() => { p.setLocation(null); p.setZoneQuery('') }} className="text-[12px] text-primary-700 hover:underline shrink-0">Cambiar</button>
              </div>
            ) : (
              <div className="space-y-2.5">
                <button onClick={p.useMyLocation} disabled={p.locating}
                  className="w-full flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-lg bg-primary-600 text-white text-[13px] font-medium hover:bg-primary-700 transition-colors disabled:opacity-60">
                  {p.locating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Crosshair className="w-4 h-4" />} Usar mi ubicación actual
                </button>
                <div className="flex items-center gap-2 text-[11px] text-slate-400">
                  <div className="flex-1 h-px bg-slate-200" /> o escribí una zona <div className="flex-1 h-px bg-slate-200" />
                </div>
                <div className="flex gap-2">
                  <input value={p.zoneQuery} onChange={(e: any) => p.setZoneQuery(e.target.value)}
                    onKeyDown={(e: any) => e.key === 'Enter' && p.runZoneSearch()}
                    placeholder="Ej: Zona Norte, Cochabamba"
                    className="flex-1 px-3.5 py-2.5 rounded-lg border border-slate-200 text-[14px] text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500" />
                  <button onClick={p.runZoneSearch} disabled={p.searchingZone || p.zoneQuery.trim().length < 3}
                    className="px-3.5 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors disabled:opacity-50">
                    {p.searchingZone ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                  </button>
                </div>
                <AnimatePresence>
                  {p.geoResults.length > 0 && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                      className="rounded-lg border border-slate-200 overflow-hidden divide-y divide-slate-100">
                      {p.geoResults.map((g: GeoResult, i: number) => (
                        <button key={i} onClick={() => p.pickZone(g)}
                          className="w-full text-left px-3.5 py-2.5 text-[13px] text-slate-700 hover:bg-slate-50 transition-colors flex items-start gap-2">
                          <MapPin className="w-3.5 h-3.5 mt-0.5 text-slate-400 shrink-0" /> <span className="truncate">{g.displayName}</span>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>
      </div>

      <button onClick={p.analyze} disabled={!p.canAnalyze}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-primary-700 text-white font-semibold text-[14px] hover:bg-primary-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
        {p.loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Analizando…</> : <>Analizar oportunidad <ChevronRight className="w-4 h-4" /></>}
      </button>
    </>
  )
}

// ── Informe (pestañas) ───────────────────────────────────────────────────────────
function ReportView({ report, tab, setTab }: { report: BusinessAdvisorReport; tab: Tab; setTab: (t: Tab) => void }) {
  const hasAlt = report.alternatives.length > 0
  const tabs: { id: Tab; label: string; show: boolean }[] = [
    { id: 'veredicto', label: 'Veredicto', show: true },
    { id: 'oferta', label: 'Qué ofrecer', show: report.products.length > 0 || report.differentiators.length > 0 },
    { id: 'competencia', label: 'Competencia', show: true },
    { id: 'alternativas', label: 'Alternativas', show: hasAlt },
    { id: 'encuesta', label: 'Encuesta INE', show: true },
    { id: 'plan', label: 'Plan', show: report.actionPlan.length > 0 || !!report.investment.note },
  ].filter(t => t.show)

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border border-slate-200 bg-white overflow-hidden">
      {/* Tab bar */}
      <div className="flex gap-1 px-2 pt-2 overflow-x-auto border-b border-slate-100 scrollbar-hide">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`relative px-3 py-2.5 text-[13px] font-medium whitespace-nowrap transition-colors ${tab === t.id ? 'text-primary-700' : 'text-slate-400 hover:text-slate-600'}`}>
            {t.label}
            {tab === t.id && <motion.div layoutId="advisor-tab" className="absolute left-2 right-2 -bottom-px h-0.5 bg-primary-700 rounded-full" />}
          </button>
        ))}
      </div>

      <div className="p-4 sm:p-5">
        <AnimatePresence mode="wait">
          <motion.div key={tab} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }}>
            {tab === 'veredicto' && <TabVerdict r={report} />}
            {tab === 'oferta' && <TabOffer r={report} />}
            {tab === 'competencia' && <TabCompetition r={report} />}
            {tab === 'alternativas' && <TabAlternatives r={report} />}
            {tab === 'encuesta' && <TabSurvey r={report} />}
            {tab === 'plan' && <TabPlan r={report} />}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Aviso de pronóstico + fuentes (siempre visible) */}
      <DisclaimerFooter report={report} />
    </motion.div>
  )
}

function DisclaimerFooter({ report }: { report: BusinessAdvisorReport }) {
  return (
    <div className="border-t border-slate-100 bg-slate-50/70 px-4 sm:px-5 py-4">
      <p className="flex items-start gap-2 text-[11.5px] text-slate-500 leading-relaxed">
        <Info className="w-3.5 h-3.5 mt-0.5 shrink-0 text-slate-400" />
        Este informe es un <span className="font-medium text-slate-600">pronóstico</span> elaborado con datos recopilados de fuentes públicas (mapa, web y la plataforma) y puede no ser exacto. Tomalo como una guía, no como una garantía, y validá en campo antes de invertir.
      </p>
      {report.sources.length > 0 && (
        <div className="mt-3">
          <p className="text-[10px] uppercase tracking-wide text-slate-400 mb-1.5">Fuentes consultadas</p>
          <div className="flex flex-col gap-1">
            {report.sources.map((src, i) => (
              <a key={i} href={src.url} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-[11.5px] text-primary-700 hover:underline">
                <ExternalLink className="w-3 h-3 shrink-0" /> <span className="truncate">{src.title}</span>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// KPI chip
const Kpi = ({ icon, label, value, tone }: { icon: React.ReactNode; label: string; value: string; tone: string }) => (
  <div className={`flex items-center gap-2.5 rounded-lg border px-3 py-2.5 ${tone}`}>
    <span className="opacity-70">{icon}</span>
    <div className="leading-tight">
      <p className="text-[10px] uppercase tracking-wide opacity-70">{label}</p>
      <p className="text-[13px] font-semibold capitalize">{value}</p>
    </div>
  </div>
)

function TabVerdict({ r }: { r: BusinessAdvisorReport }) {
  return (
    <div className="space-y-5">
      <div className="flex items-start gap-4">
        <ScoreDial score={r.verdict.score} />
        <div className="min-w-0 pt-0.5">
          <span className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: SCORE(r.verdict.score) }}>
            {VERDICT_LABEL[r.verdict.label]}
          </span>
          {r.verdict.headline && <p className="text-[16px] font-semibold text-slate-900 leading-snug mt-0.5">{r.verdict.headline}</p>}
          <p className="text-[13.5px] text-slate-600 leading-relaxed mt-1.5">{r.verdict.summary}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
        <Kpi icon={<Store className="w-4 h-4" />} label="Competencia" value={r.competition.level} tone={LEVEL_TONE[r.competition.level]} />
        <Kpi icon={<TrendingUp className="w-4 h-4" />} label="Demanda" value={r.demand.level} tone={DEMAND_TONE[r.demand.level]} />
        <Kpi icon={<Wallet className="w-4 h-4" />} label="Inversión" value={r.investment.level} tone="text-slate-600 bg-slate-50 border-slate-200" />
      </div>

      {r.demand.note && (
        <Section icon={<TrendingUp className="w-4 h-4" />} title="Demanda local">
          <p className="text-[13.5px] text-slate-600 leading-relaxed">{r.demand.note}</p>
          {r.demand.peakTimes && <p className="text-[12px] text-slate-400 mt-1.5">⏱ Picos de consumo: {r.demand.peakTimes}</p>}
        </Section>
      )}

      <DataFooter r={r} />
    </div>
  )
}

function TabOffer({ r }: { r: BusinessAdvisorReport }) {
  return (
    <div className="space-y-5">
      {r.products.length > 0 && (
        <Section icon={<ClipboardList className="w-4 h-4" />} title="Productos / servicios a ofrecer">
          <div className="space-y-2.5">
            {r.products.map((pr, i) => (
              <div key={i} className="rounded-lg border border-slate-200 p-3">
                <div className="flex items-baseline justify-between gap-2">
                  <h4 className="text-[14px] font-semibold text-slate-900">{pr.name}</h4>
                  {pr.priceRange && <span className="text-[12px] font-medium text-primary-700 shrink-0">{pr.priceRange}</span>}
                </div>
                {pr.description && <p className="text-[13px] text-slate-600 leading-relaxed mt-1">{pr.description}</p>}
                {pr.rationale && <p className="text-[12px] text-slate-400 mt-1.5">↳ {pr.rationale}</p>}
              </div>
            ))}
          </div>
        </Section>
      )}
      {r.differentiators.length > 0 && (
        <Section icon={<Lightbulb className="w-4 h-4" />} title="Cómo diferenciarte">
          <ul className="space-y-2">
            {r.differentiators.map((d, i) => (
              <li key={i} className="flex items-start gap-2 text-[13.5px] text-slate-600"><CheckCircle2 className="w-4 h-4 text-primary-600 mt-0.5 shrink-0" /> {d}</li>
            ))}
          </ul>
        </Section>
      )}
    </div>
  )
}

function TabCompetition({ r }: { r: BusinessAdvisorReport }) {
  return (
    <div className="space-y-5">
      <Section icon={<Store className="w-4 h-4" />} title="Competencia en la zona">
        <div className="flex items-center gap-2 mb-2">
          <span className={`inline-block px-2.5 py-1 rounded-full text-[12px] font-semibold border ${LEVEL_TONE[r.competition.level]}`}>{r.competition.level}</span>
          <span className="text-[12px] text-slate-400">{r.competition.nearbyCount} locales similares detectados</span>
        </div>
        {r.competition.note && <p className="text-[13.5px] text-slate-600 leading-relaxed">{r.competition.note}</p>}
      </Section>

      {r.competition.knownPlayers.length > 0 && (
        <Section icon={<Target className="w-4 h-4" />} title="Competidores reconocidos">
          <div className="space-y-2">
            {r.competition.knownPlayers.map((k, i) => (
              <div key={i} className="rounded-lg border border-slate-200 p-3">
                <p className="text-[13.5px] font-semibold text-slate-900">{k.name}</p>
                {k.note && <p className="text-[12.5px] text-slate-500 mt-0.5">{k.note}</p>}
              </div>
            ))}
          </div>
        </Section>
      )}

      {r.marketGaps.length > 0 && (
        <Section icon={<Lightbulb className="w-4 h-4" />} title="Necesidades no cubiertas">
          <ul className="space-y-2">
            {r.marketGaps.map((g, i) => (
              <li key={i} className="flex items-start gap-2 text-[13.5px] text-slate-600"><span className="w-1.5 h-1.5 rounded-full bg-primary-600 mt-1.5 shrink-0" /> {g}</li>
            ))}
          </ul>
        </Section>
      )}
    </div>
  )
}

function TabAlternatives({ r }: { r: BusinessAdvisorReport }) {
  return (
    <Section icon={<Lightbulb className="w-4 h-4" />} title="Oportunidades alternativas más rentables">
      <div className="space-y-2.5">
        {r.alternatives.map((a, i) => (
          <div key={i} className="rounded-lg border border-slate-200 p-3">
            <div className="flex items-center justify-between gap-2 mb-1">
              <span className="text-[14px] font-semibold text-slate-900">{a.business}</span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${a.potential === 'alta' ? 'bg-primary-100 text-primary-700' : 'bg-amber-100 text-amber-700'}`}>Potencial {a.potential}</span>
            </div>
            {a.reason && <p className="text-[13px] text-slate-600 leading-relaxed">{a.reason}</p>}
            {a.sampleProducts.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {a.sampleProducts.map((s, j) => <span key={j} className="px-2 py-0.5 rounded-md bg-slate-100 text-[11px] text-slate-500">{s}</span>)}
              </div>
            )}
          </div>
        ))}
      </div>
    </Section>
  )
}

function TabSurvey({ r }: { r: BusinessAdvisorReport }) {
  const s = r.survey
  return (
    <div className="space-y-5">
      <div className="flex items-center gap-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
        <div className="text-center px-2">
          <p className="text-3xl font-bold text-slate-900 leading-none">{s.recommendedSampleSize}</p>
          <p className="text-[10px] uppercase tracking-wide text-slate-400 mt-1">personas</p>
        </div>
        <p className="text-[12.5px] text-slate-600 leading-relaxed">{s.rationale || 'Muestra recomendada para resultados estadísticamente representativos.'}</p>
      </div>

      <div className="grid sm:grid-cols-2 gap-x-5 gap-y-5">
        {s.ageRanges.length > 0 && (
          <Section icon={<Users className="w-4 h-4" />} title="Rangos de edad">
            <div className="flex flex-wrap gap-1.5">{s.ageRanges.map((a, i) => <span key={i} className="px-2.5 py-1 rounded-md bg-primary-50 text-primary-700 border border-primary-200 text-[12px] font-medium">{a}</span>)}</div>
          </Section>
        )}
        {s.targetSegments.length > 0 && (
          <Section icon={<Target className="w-4 h-4" />} title="Segmentos">
            <div className="flex flex-wrap gap-1.5">{s.targetSegments.map((a, i) => <span key={i} className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-600 text-[12px]">{a}</span>)}</div>
          </Section>
        )}
      </div>

      {s.keyQuestions.length > 0 && (
        <Section icon={<ClipboardList className="w-4 h-4" />} title="Preguntas clave">
          <ol className="space-y-1.5 list-decimal list-inside marker:text-slate-300">
            {s.keyQuestions.map((q, i) => <li key={i} className="text-[13.5px] text-slate-600 leading-relaxed">{q}</li>)}
          </ol>
        </Section>
      )}

      {s.channels.length > 0 && (
        <Section icon={<MapPin className="w-4 h-4" />} title="Dónde encuestar">
          <ul className="space-y-1.5">{s.channels.map((c, i) => <li key={i} className="flex items-start gap-2 text-[13.5px] text-slate-600"><span className="w-1.5 h-1.5 rounded-full bg-slate-300 mt-1.5 shrink-0" /> {c}</li>)}</ul>
        </Section>
      )}

      {s.ineContext.length > 0 && (
        <Section icon={<BarChart3 className="w-4 h-4" />} title="Datos del INE Bolivia">
          <ul className="space-y-2">
            {s.ineContext.map((c, i) => <li key={i} className="flex items-start gap-2 text-[13px] text-slate-600 leading-relaxed"><BarChart3 className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" /> {c}</li>)}
          </ul>
        </Section>
      )}

      {/* CTA: lanzar la encuesta de verdad en Lugabiz */}
      <div className="rounded-xl border border-primary-200 bg-primary-50 p-4">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary-600 flex items-center justify-center shrink-0">
            <Megaphone className="w-[18px] h-[18px] text-white" />
          </div>
          <div className="min-w-0">
            <h4 className="text-[13.5px] font-semibold text-primary-900">Lanzá esta encuesta de verdad en Lugabiz</h4>
            <p className="text-[12.5px] text-primary-800/90 leading-relaxed mt-0.5">
              {s.lugabizTip || 'Activá tu perfil de dueño de negocio y publicá encuestas de mercado a usuarios reales de tu zona: validá tu idea con datos en vivo antes de invertir un solo boliviano.'}
            </p>
            <Link to="/profile"
              className="inline-flex items-center gap-1.5 mt-2.5 px-3 py-1.5 rounded-lg bg-primary-600 text-white text-[12.5px] font-medium hover:bg-primary-700 transition-colors">
              Convertirme en dueño de negocio <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

function TabPlan({ r }: { r: BusinessAdvisorReport }) {
  return (
    <div className="space-y-5">
      {r.actionPlan.length > 0 && (
        <Section icon={<CheckCircle2 className="w-4 h-4" />} title="Plan de acción">
          <ol className="space-y-3">
            {r.actionPlan.map((a, i) => (
              <li key={i} className="flex gap-3">
                <span className="shrink-0 w-6 h-6 rounded-full bg-primary-700 text-white text-[12px] font-bold flex items-center justify-center mt-0.5">{i + 1}</span>
                <div>
                  <p className="text-[13.5px] font-semibold text-slate-900">{a.step}</p>
                  {a.detail && <p className="text-[13px] text-slate-600 leading-relaxed mt-0.5">{a.detail}</p>}
                </div>
              </li>
            ))}
          </ol>
        </Section>
      )}
      {(r.investment.note || r.investment.recoveryEstimate) && (
        <Section icon={<Wallet className="w-4 h-4" />} title="Inversión y recuperación">
          <div className="rounded-lg border border-slate-200 p-3 space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-[11px] uppercase tracking-wide text-slate-400">Nivel</span>
              <span className="text-[13px] font-semibold text-slate-700 capitalize">{r.investment.level}</span>
            </div>
            {r.investment.note && <p className="text-[13.5px] text-slate-600 leading-relaxed">{r.investment.note}</p>}
            {r.investment.recoveryEstimate && <p className="text-[12.5px] text-slate-500">↳ Recuperación estimada: {r.investment.recoveryEstimate}</p>}
          </div>
        </Section>
      )}
    </div>
  )
}

function DataFooter({ r }: { r: BusinessAdvisorReport }) {
  return (
    <div className="flex items-center gap-3 flex-wrap pt-3 border-t border-slate-100 text-[11px] text-slate-400">
      <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {r.dataSources.mapCount} en el mapa</span>
      <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {r.dataSources.platformCount} en Lugabiz</span>
      <span className="flex items-center gap-1"><TrendingUp className="w-3 h-3" /> {r.dataSources.webSignals} señales web</span>
      {r.cached && <span className="ml-auto italic">análisis en caché</span>}
    </div>
  )
}
