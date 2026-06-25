import { supabase } from '@lib/supabase/client'

export interface AdvisorVerdict {
  score: number
  label: 'alta' | 'media' | 'baja'
  headline: string
  summary: string
}

export interface KnownPlayer { name: string; note: string }

export interface AdvisorCompetition {
  level: 'baja' | 'media' | 'alta' | 'saturado'
  nearbyCount: number
  note: string
  knownPlayers: KnownPlayer[]
}

export interface AdvisorDemand {
  level: 'baja' | 'media' | 'alta'
  note: string
  peakTimes: string
}

export interface AdvisorProduct {
  name: string
  description: string
  priceRange: string
  rationale: string
}

export interface AdvisorAlternative {
  business: string
  potential: 'alta' | 'media'
  reason: string
  sampleProducts: string[]
}

export interface AdvisorSurvey {
  recommendedSampleSize: number
  rationale: string
  ageRanges: string[]
  targetSegments: string[]
  channels: string[]
  keyQuestions: string[]
  ineContext: string[]
  lugabizTip: string
}

export interface AdvisorSource { title: string; url: string }

export interface AdvisorInvestment {
  level: 'baja' | 'media' | 'alta'
  range?: string
  startLean?: string
  note: string
  recoveryEstimate: string
}

export interface AdvisorActionStep { step: string; detail: string }

export interface BusinessAdvisorReport {
  location: { city: string; area: string; road: string; full: string; lat: number | null; lng: number | null }
  idea: string | null
  rubro: string | null
  verdict: AdvisorVerdict
  competition: AdvisorCompetition
  demand: AdvisorDemand
  products: AdvisorProduct[]
  differentiators: string[]
  marketGaps: string[]
  alternatives: AdvisorAlternative[]
  survey: AdvisorSurvey
  investment: AdvisorInvestment
  actionPlan: AdvisorActionStep[]
  dataSources: { mapCount: number; platformCount: number; webSignals: number }
  sources: AdvisorSource[]
  cached?: boolean
}

export interface AnalyzeParams {
  idea?: string
  lat?: number
  lng?: number
  city?: string
}

const FUNCTION_NAME = 'business-advisor'

export const businessAdvisorService = {
  async analyze(params: AnalyzeParams): Promise<BusinessAdvisorReport> {
    const { data, error } = await supabase.functions.invoke(FUNCTION_NAME, { body: params })
    if (error) throw new Error(error.message ?? 'No se pudo conectar con el asesor.')
    if (!data || (data as any).error) throw new Error((data as any)?.error ?? 'No se pudo analizar la oportunidad.')
    return data as BusinessAdvisorReport
  },
}
