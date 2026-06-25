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

function storedCoords(): { lat?: number; lng?: number } {
  try {
    const raw = sessionStorage.getItem('_lugabiz_last_pos')
    if (!raw) return {}
    const { lat, lng } = JSON.parse(raw)
    return { lat, lng }
  } catch { return {} }
}

interface ChosenLocation { label: string; lat?: number; lng?: number; city?: string }

const SCORE = (s: number) => (s >= 66 ? '#a855f7' : s >= 40 ? '#f59e0b' : '#ef4444')

const VERDICT_LABEL: Record<string, string> = {
  alta: 'Alta viabilidad', media: 'Viabilidad media', baja: 'Baja viabilidad',
}

const LEVEL_TONE: Record<string, string> = {
  baja:     'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
  media:    'text-amber-400   bg-amber-400/10   border-amber-400/20',
  alta:     'text-orange-400  bg-orange-400/10  border-orange-400/20',
  saturado: 'text-red-400     bg-red-400/10     border-red-400/20',
}

const DEMAND_TONE: Record<string, string> = {
  alta:  'text-primary-400 bg-primary-400/10 border-primary-400/20',
  media: 'text-amber-400   bg-amber-400/10   border-amber-400/20',
  baja:  'text-red-400     bg-red-400/10     border-red-400/20',
}

// ── Score dial ───────────────────────────────────────────────────────────────
function ScoreDial({ score }: { score: number }) {
  const color = SCORE(score), r = 34, c = 2 * Math.PI * r
  return (
    <div className="relative w-[88px] h-[88px] shrink-0">
      <svg className="w-[88px] h-[88px] -rotate-90" viewBox="0 0 80 80">
        <circle cx="40" cy="40" r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="7" />
        <motion.circle cx="40" cy="40" r={r} fill="none" stroke={color} strokeWidth="7" strokeLinecap="round"
          strokeDasharray={c} initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: c - (c * score) / 100 }} transition={{ duration: 0.9, ease: 'easeOut' }} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold tracking-tight" style={{ color }}>{score}</span>
        <span className="text-[9px] text-white/25 uppercase tracking-wide">/100</span>
      </div>
    </div>
  )
}

// ── Section header ───────────────────────────────────────────────────────────
const Section = ({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) => (
  <div>
    <div className="flex items-center gap-2 mb-3">
      <span className="text-white/30">{icon}</span>
      <h3 className="text-[13px] font-semibold text-white/50">{title}</h3>
    </div>
    {children}
  </div>
)

// ── KPI chip ─────────────────────────────────────────────────────────────────
const Kpi = ({ icon, label, value, tone }: { icon: React.ReactNode; label: string; value: string; tone: string }) => (
  <div className={`flex items-center gap-2.5 rounded-xl border px-3 py-2.5 ${tone}`}>
    <span className="opacity-70 shrink-0">{icon}</span>
    <div className="leading-tight min-w-0">
      <p className="text-[10px] uppercase tracking-wide opacity-60">{label}</p>
      <p className="text-[13px] font-semibold capitalize truncate">{value}</p>
    </div>
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
    <div className="min-h-screen bg-feed-bg pb-24 md:pb-12">
      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-white/6"
        style={{ background: 'rgba(13,6,32,0.90)', backdropFilter: 'blur(20px)' }}>
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center gap-3">
          <button onClick={goBack} className="p-2 -ml-2 rounded-xl hover:bg-white/8 transition-colors">
            <ArrowLeft className="w-5 h-5 text-white/60" />
          </button>
          <div className="leading-tight">
            <h1 className="text-[15px] font-semibold text-white">Asesor de oportunidades</h1>
            <p className="text-[11px] text-white/35">Análisis de mercado por ubicación</p>
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
          <div className="flex items-center justify-between gap-3 rounded-2xl border border-white/8 bg-white/5 px-4 py-3">
            <div className="min-w-0">
              <p className="text-[13px] font-semibold text-white/85 truncate">
                {report.idea ? report.idea : 'Mejores oportunidades'}
                <span className="font-normal text-white/40"> · {report.location.area || report.location.city}</span>
              </p>
              <p className="text-[11px] text-white/30 truncate mt-0.5">{report.location.full}</p>
            </div>
            <button onClick={() => { setReport(null); setError(null) }}
              className="shrink-0 inline-flex items-center gap-1.5 text-[13px] font-medium text-white/50 hover:text-white px-2.5 py-1.5 rounded-xl hover:bg-white/8 transition-colors">
              <Pencil className="w-3.5 h-3.5" /> Nuevo
            </button>
          </div>
        )}

        <AnimatePresence>
          {error && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="flex items-center gap-2 rounded-xl bg-red-500/10 border border-red-500/25 px-4 py-3 text-[13px] text-red-400">
              <AlertTriangle className="w-4 h-4 shrink-0" /> {error}
            </motion.div>
          )}
        </AnimatePresence>

        {loading && !report && (
          <div className="rounded-2xl border border-white/8 bg-white/5 p-10 flex flex-col items-center gap-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-primary-500/15 flex items-center justify-center">
              <Loader2 className="w-6 h-6 text-primary-400 animate-spin" />
            </div>
            <p className="text-[13px] text-white/40 max-w-xs leading-relaxed">
              Cruzando el mapa, los negocios de la zona y las tendencias de consumo…
            </p>
          </div>
        )}

        {report && <ReportView report={report} tab={tab} setTab={setTab} />}
      </main>
    </div>
  )
}

// ── Panel del formulario ─────────────────────────────────────────────────────
function FormPanel(p: any) {
  return (
    <>
      <div className="rounded-2xl border border-white/8 bg-white/5 overflow-hidden">
        <div className="px-5 pt-5 pb-4 border-b border-white/6">
          <p className="text-[13px] text-white/45 leading-relaxed">
            Dime <span className="font-medium text-white/75">qué deseas abrir</span> y <span className="font-medium text-white/75">dónde</span>. Analizo competencia,
            saturación, demanda y tendencias reales de la zona.
          </p>
        </div>

        <div className="p-5 space-y-5">
          {/* Idea */}
          <div>
            <label className="block text-[13px] font-medium text-white/60 mb-2">
              Idea de negocio <span className="text-white/30 font-normal">· opcional</span>
            </label>
            <input value={p.idea} onChange={(e: any) => p.setIdea(e.target.value)} maxLength={160}
              placeholder="Ej: pollería, cafetería de especialidad, parrillada dominical…"
              className="w-full px-4 py-3 rounded-xl bg-white/6 border border-white/10 text-[14px] text-white placeholder:text-white/25 focus:outline-none focus:border-primary-400/50 focus:bg-white/8 transition-all" />
            <p className="text-[11px] text-white/25 mt-2">
              Si lo dejás vacío, te recomiendo los negocios con mayor potencial para esa ubicación.
            </p>
          </div>

          {/* Ubicación */}
          <div>
            <label className="block text-[13px] font-medium text-white/60 mb-2">Ubicación</label>
            {p.location ? (
              <div className="flex items-center justify-between gap-2 px-4 py-3 rounded-xl bg-white/6 border border-white/10">
                <span className="flex items-center gap-2 text-[13px] text-white/80 font-medium truncate">
                  <MapPin className="w-4 h-4 text-primary-400 shrink-0" /> {p.location.label}
                </span>
                <button onClick={() => { p.setLocation(null); p.setZoneQuery('') }}
                  className="text-[12px] text-primary-400 hover:text-primary-300 shrink-0 transition-colors">
                  Cambiar
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <button onClick={p.useMyLocation} disabled={p.locating}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-primary-500 text-white text-[13px] font-medium hover:bg-primary-600 transition-colors disabled:opacity-60">
                  {p.locating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Crosshair className="w-4 h-4" />}
                  Usar mi ubicación actual
                </button>
                <div className="flex items-center gap-2 text-[11px] text-white/25">
                  <div className="flex-1 h-px bg-white/8" /> o escribí una zona <div className="flex-1 h-px bg-white/8" />
                </div>
                <div className="flex gap-2">
                  <input value={p.zoneQuery} onChange={(e: any) => p.setZoneQuery(e.target.value)}
                    onKeyDown={(e: any) => e.key === 'Enter' && p.runZoneSearch()}
                    placeholder="Ej: Zona Norte, Cochabamba"
                    className="flex-1 px-4 py-3 rounded-xl bg-white/6 border border-white/10 text-[14px] text-white placeholder:text-white/25 focus:outline-none focus:border-primary-400/50 focus:bg-white/8 transition-all" />
                  <button onClick={p.runZoneSearch} disabled={p.searchingZone || p.zoneQuery.trim().length < 3}
                    className="px-4 rounded-xl bg-white/8 text-white/50 hover:bg-white/12 hover:text-white transition-colors disabled:opacity-40">
                    {p.searchingZone ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                  </button>
                </div>
                <AnimatePresence>
                  {p.geoResults.length > 0 && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                      className="rounded-xl border border-white/8 bg-white/5 overflow-hidden divide-y divide-white/5">
                      {p.geoResults.map((g: GeoResult, i: number) => (
                        <button key={i} onClick={() => p.pickZone(g)}
                          className="w-full text-left px-4 py-3 text-[13px] text-white/70 hover:bg-white/6 hover:text-white transition-colors flex items-start gap-2">
                          <MapPin className="w-3.5 h-3.5 mt-0.5 text-white/25 shrink-0" />
                          <span className="truncate">{g.displayName}</span>
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
        className="w-full flex items-center justify-center gap-2 px-4 py-3.5 rounded-2xl bg-primary-500 text-white font-semibold text-[14px] hover:bg-primary-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-primary-500/20">
        {p.loading
          ? <><Loader2 className="w-4 h-4 animate-spin" /> Analizando…</>
          : <>Analizar oportunidad <ChevronRight className="w-4 h-4" /></>}
      </button>
    </>
  )
}

// ── Informe (pestañas) ───────────────────────────────────────────────────────
function ReportView({ report, tab, setTab }: { report: BusinessAdvisorReport; tab: Tab; setTab: (t: Tab) => void }) {
  const hasAlt = report.alternatives.length > 0
  const tabs: { id: Tab; label: string; show: boolean }[] = [
    { id: 'veredicto',    label: 'Veredicto',    show: true },
    { id: 'oferta',       label: 'Qué ofrecer',  show: report.products.length > 0 || report.differentiators.length > 0 },
    { id: 'competencia',  label: 'Competencia',  show: true },
    { id: 'alternativas', label: 'Alternativas', show: hasAlt },
    { id: 'encuesta',     label: 'Encuesta INE', show: true },
    { id: 'plan',         label: 'Plan',         show: report.actionPlan.length > 0 || !!report.investment.note },
  ].filter(t => t.show)

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-white/8 bg-white/5 overflow-hidden">

      {/* Tab bar */}
      <div className="flex gap-0.5 px-2 pt-2 overflow-x-auto border-b border-white/6 scrollbar-hide">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`relative px-3.5 py-2.5 text-[13px] font-medium whitespace-nowrap transition-colors ${
              tab === t.id ? 'text-white' : 'text-white/35 hover:text-white/60'
            }`}>
            {t.label}
            {tab === t.id && (
              <motion.div layoutId="advisor-tab"
                className="absolute left-2 right-2 -bottom-px h-[2px] bg-primary-400 rounded-full" />
            )}
          </button>
        ))}
      </div>

      <div className="p-5">
        <AnimatePresence mode="wait">
          <motion.div key={tab} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }}>
            {tab === 'veredicto'    && <TabVerdict r={report} />}
            {tab === 'oferta'       && <TabOffer r={report} />}
            {tab === 'competencia'  && <TabCompetition r={report} />}
            {tab === 'alternativas' && <TabAlternatives r={report} />}
            {tab === 'encuesta'     && <TabSurvey r={report} />}
            {tab === 'plan'         && <TabPlan r={report} />}
          </motion.div>
        </AnimatePresence>
      </div>

      <DisclaimerFooter report={report} />
    </motion.div>
  )
}

function DisclaimerFooter({ report }: { report: BusinessAdvisorReport }) {
  return (
    <div className="border-t border-white/6 bg-white/3 px-5 py-4">
      <p className="flex items-start gap-2 text-[11.5px] text-white/30 leading-relaxed">
        <Info className="w-3.5 h-3.5 mt-0.5 shrink-0 text-white/20" />
        Este informe es un <span className="font-medium text-white/45">pronóstico</span> elaborado con datos de fuentes públicas y puede no ser exacto. Tomalo como una guía antes de invertir.
      </p>
      {report.sources.length > 0 && (
        <div className="mt-3">
          <p className="text-[10px] uppercase tracking-widest text-white/20 mb-2">Fuentes consultadas</p>
          <div className="flex flex-col gap-1">
            {report.sources.map((src, i) => (
              <a key={i} href={src.url} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-[11.5px] text-primary-400/70 hover:text-primary-300 transition-colors">
                <ExternalLink className="w-3 h-3 shrink-0" />
                <span className="truncate">{src.title}</span>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ── Tabs ─────────────────────────────────────────────────────────────────────
function TabVerdict({ r }: { r: BusinessAdvisorReport }) {
  return (
    <div className="space-y-5">
      <div className="flex items-start gap-4">
        <ScoreDial score={r.verdict.score} />
        <div className="min-w-0 pt-1">
          <span className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: SCORE(r.verdict.score) }}>
            {VERDICT_LABEL[r.verdict.label]}
          </span>
          {r.verdict.headline && (
            <p className="text-[16px] font-semibold text-white leading-snug mt-1">{r.verdict.headline}</p>
          )}
          <p className="text-[13.5px] text-white/55 leading-relaxed mt-1.5">{r.verdict.summary}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
        <Kpi icon={<Store className="w-4 h-4" />}    label="Competencia" value={r.competition.level} tone={LEVEL_TONE[r.competition.level] ?? LEVEL_TONE.media} />
        <Kpi icon={<TrendingUp className="w-4 h-4" />} label="Demanda"   value={r.demand.level}      tone={DEMAND_TONE[r.demand.level]    ?? DEMAND_TONE.media} />
        <Kpi icon={<Wallet className="w-4 h-4" />}   label="Inversión"  value={r.investment.level}  tone="text-white/60 bg-white/5 border-white/10" />
      </div>

      {r.demand.note && (
        <Section icon={<TrendingUp className="w-4 h-4" />} title="Demanda local">
          <p className="text-[13.5px] text-white/60 leading-relaxed">{r.demand.note}</p>
          {r.demand.peakTimes && (
            <p className="text-[12px] text-white/30 mt-2">⏱ Picos: {r.demand.peakTimes}</p>
          )}
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
              <div key={i} className="rounded-xl border border-white/8 bg-white/4 p-4">
                <div className="flex items-baseline justify-between gap-2">
                  <h4 className="text-[14px] font-semibold text-white/90">{pr.name}</h4>
                  {pr.priceRange && <span className="text-[12px] font-medium text-primary-400 shrink-0">{pr.priceRange}</span>}
                </div>
                {pr.description && <p className="text-[13px] text-white/55 leading-relaxed mt-1">{pr.description}</p>}
                {pr.rationale && <p className="text-[12px] text-white/30 mt-2">↳ {pr.rationale}</p>}
              </div>
            ))}
          </div>
        </Section>
      )}
      {r.differentiators.length > 0 && (
        <Section icon={<Lightbulb className="w-4 h-4" />} title="Cómo diferenciarte">
          <ul className="space-y-2.5">
            {r.differentiators.map((d, i) => (
              <li key={i} className="flex items-start gap-2.5 text-[13.5px] text-white/60">
                <CheckCircle2 className="w-4 h-4 text-primary-400 mt-0.5 shrink-0" /> {d}
              </li>
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
        <div className="flex items-center gap-2 mb-3">
          <span className={`inline-block px-2.5 py-1 rounded-full text-[12px] font-semibold border ${LEVEL_TONE[r.competition.level] ?? LEVEL_TONE.media}`}>
            {r.competition.level}
          </span>
          <span className="text-[12px] text-white/35">{r.competition.nearbyCount} locales similares detectados</span>
        </div>
        {r.competition.note && <p className="text-[13.5px] text-white/55 leading-relaxed">{r.competition.note}</p>}
      </Section>

      {r.competition.knownPlayers.length > 0 && (
        <Section icon={<Target className="w-4 h-4" />} title="Competidores reconocidos">
          <div className="space-y-2">
            {r.competition.knownPlayers.map((k, i) => (
              <div key={i} className="rounded-xl border border-white/8 bg-white/4 p-3.5">
                <p className="text-[13.5px] font-semibold text-white/85">{k.name}</p>
                {k.note && <p className="text-[12.5px] text-white/40 mt-0.5">{k.note}</p>}
              </div>
            ))}
          </div>
        </Section>
      )}

      {r.marketGaps.length > 0 && (
        <Section icon={<Lightbulb className="w-4 h-4" />} title="Necesidades no cubiertas">
          <ul className="space-y-2">
            {r.marketGaps.map((g, i) => (
              <li key={i} className="flex items-start gap-2.5 text-[13.5px] text-white/55">
                <span className="w-1.5 h-1.5 rounded-full bg-primary-400 mt-2 shrink-0" /> {g}
              </li>
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
          <div key={i} className="rounded-xl border border-white/8 bg-white/4 p-4">
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <span className="text-[14px] font-semibold text-white/90">{a.business}</span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                a.potential === 'alta'
                  ? 'bg-primary-500/20 text-primary-300 border border-primary-500/25'
                  : 'bg-amber-500/15 text-amber-300 border border-amber-500/20'
              }`}>
                Potencial {a.potential}
              </span>
            </div>
            {a.reason && <p className="text-[13px] text-white/55 leading-relaxed">{a.reason}</p>}
            {a.sampleProducts.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2.5">
                {a.sampleProducts.map((s, j) => (
                  <span key={j} className="px-2.5 py-0.5 rounded-lg bg-white/6 border border-white/8 text-[11px] text-white/45">{s}</span>
                ))}
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
      <div className="flex items-center gap-4 rounded-xl border border-white/8 bg-white/4 p-4">
        <div className="text-center px-2 shrink-0">
          <p className="text-3xl font-bold text-white leading-none">{s.recommendedSampleSize}</p>
          <p className="text-[10px] uppercase tracking-widest text-white/30 mt-1">personas</p>
        </div>
        <p className="text-[12.5px] text-white/50 leading-relaxed">
          {s.rationale || 'Muestra recomendada para resultados estadísticamente representativos.'}
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-x-5 gap-y-5">
        {s.ageRanges.length > 0 && (
          <Section icon={<Users className="w-4 h-4" />} title="Rangos de edad">
            <div className="flex flex-wrap gap-1.5">
              {s.ageRanges.map((a, i) => (
                <span key={i} className="px-2.5 py-1 rounded-lg bg-primary-500/15 text-primary-300 border border-primary-400/20 text-[12px] font-medium">{a}</span>
              ))}
            </div>
          </Section>
        )}
        {s.targetSegments.length > 0 && (
          <Section icon={<Target className="w-4 h-4" />} title="Segmentos">
            <div className="flex flex-wrap gap-1.5">
              {s.targetSegments.map((a, i) => (
                <span key={i} className="px-2.5 py-1 rounded-lg bg-white/6 border border-white/8 text-white/50 text-[12px]">{a}</span>
              ))}
            </div>
          </Section>
        )}
      </div>

      {s.keyQuestions.length > 0 && (
        <Section icon={<ClipboardList className="w-4 h-4" />} title="Preguntas clave">
          <ol className="space-y-2 list-decimal list-inside marker:text-white/20">
            {s.keyQuestions.map((q, i) => (
              <li key={i} className="text-[13.5px] text-white/55 leading-relaxed">{q}</li>
            ))}
          </ol>
        </Section>
      )}

      {s.channels.length > 0 && (
        <Section icon={<MapPin className="w-4 h-4" />} title="Dónde encuestar">
          <ul className="space-y-1.5">
            {s.channels.map((c, i) => (
              <li key={i} className="flex items-start gap-2.5 text-[13.5px] text-white/55">
                <span className="w-1.5 h-1.5 rounded-full bg-white/20 mt-2 shrink-0" /> {c}
              </li>
            ))}
          </ul>
        </Section>
      )}

      {s.ineContext.length > 0 && (
        <Section icon={<BarChart3 className="w-4 h-4" />} title="Datos del INE Bolivia">
          <ul className="space-y-2">
            {s.ineContext.map((c, i) => (
              <li key={i} className="flex items-start gap-2 text-[13px] text-white/50 leading-relaxed">
                <BarChart3 className="w-3.5 h-3.5 text-white/20 mt-0.5 shrink-0" /> {c}
              </li>
            ))}
          </ul>
        </Section>
      )}

      {/* CTA encuesta real */}
      <div className="rounded-xl border border-primary-500/20 bg-primary-500/10 p-4">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary-500 flex items-center justify-center shrink-0">
            <Megaphone className="w-[18px] h-[18px] text-white" />
          </div>
          <div className="min-w-0">
            <h4 className="text-[13.5px] font-semibold text-white">Lanzá esta encuesta en Lugabiz</h4>
            <p className="text-[12.5px] text-white/45 leading-relaxed mt-0.5">
              {s.lugabizTip || 'Publicá encuestas de mercado a usuarios reales de tu zona y validá tu idea con datos en vivo antes de invertir.'}
            </p>
            <Link to="/profile?verify=1"
              className="inline-flex items-center gap-1.5 mt-3 px-3.5 py-1.5 rounded-xl bg-primary-500 text-white text-[12.5px] font-medium hover:bg-primary-600 transition-colors">
              Verificar mi negocio <ChevronRight className="w-3.5 h-3.5" />
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
          <ol className="space-y-4">
            {r.actionPlan.map((a, i) => (
              <li key={i} className="flex gap-3.5">
                <span className="shrink-0 w-6 h-6 rounded-full bg-primary-500 text-white text-[12px] font-bold flex items-center justify-center mt-0.5">
                  {i + 1}
                </span>
                <div>
                  <p className="text-[13.5px] font-semibold text-white/85">{a.step}</p>
                  {a.detail && <p className="text-[13px] text-white/50 leading-relaxed mt-0.5">{a.detail}</p>}
                </div>
              </li>
            ))}
          </ol>
        </Section>
      )}
      {(r.investment.note || r.investment.recoveryEstimate || r.investment.range || r.investment.startLean) && (
        <Section icon={<Wallet className="w-4 h-4" />} title="Inversión y recuperación">
          <div className="rounded-xl border border-white/8 bg-white/4 p-4 space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] uppercase tracking-widest text-white/25">Nivel</span>
              <span className="text-[13px] font-semibold text-white/70 capitalize">{r.investment.level}</span>
              {r.investment.range && (
                <span className="text-[13px] font-semibold text-primary-300 bg-primary-500/15 border border-primary-500/20 rounded-lg px-2 py-0.5">
                  {r.investment.range}
                </span>
              )}
            </div>
            {r.investment.startLean && (
              <p className="text-[13px] text-emerald-300/80 leading-relaxed">
                <span className="font-semibold">Empezar ya: </span>{r.investment.startLean}
              </p>
            )}
            {r.investment.note && <p className="text-[13.5px] text-white/55 leading-relaxed">{r.investment.note}</p>}
            {r.investment.recoveryEstimate && (
              <p className="text-[12.5px] text-white/35">↳ Recuperación estimada: {r.investment.recoveryEstimate}</p>
            )}
          </div>
        </Section>
      )}
    </div>
  )
}

function DataFooter({ r }: { r: BusinessAdvisorReport }) {
  return (
    <div className="flex items-center gap-4 flex-wrap pt-4 border-t border-white/6 text-[11px] text-white/25">
      <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {r.dataSources.mapCount} en el mapa</span>
      <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {r.dataSources.platformCount} en Lugabiz</span>
      <span className="flex items-center gap-1"><TrendingUp className="w-3 h-3" /> {r.dataSources.webSignals} señales web</span>
      {r.cached && <span className="ml-auto italic text-white/20">análisis en caché</span>}
    </div>
  )
}
