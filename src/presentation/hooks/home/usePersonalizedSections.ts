import { useState, useEffect } from 'react';
import { Place, Event } from '@domain/entities';
import { supabase } from '@lib/supabase/client';

export interface HomeSection {
  id: string;
  title: string;
  subtitle: string;
  places: Place[];
  events: Event[];
  type: 'places' | 'events' | 'mixed';
}

// ── Blueprint: define qué contenido muestra cada sección ────────────────────
interface Blueprint {
  id: string;
  reason: string;           // para que la IA genere el título correcto
  categoryName: string | null;
  socialGroupName: string | null;
  sortBy: 'rating' | 'recent' | 'views' | 'date';
  type: 'places' | 'events' | 'mixed';
}

// ── Título local de fallback (cuando el edge function no responde) ──────────
function localTitle(bp: Blueprint): { title: string; subtitle: string } {
  const base = bp.reason.split(':')[0]
  const place = bp.reason.split(':')[2] ?? ''

  const TITLES: Record<string, string> = {
    recent_interaction: place ? `Porque visitaste ${place}` : `Más ${bp.categoryName ?? 'lugares'} para ti`,
    favorite_category:  `Porque te encanta ${bp.categoryName ?? 'esto'}`,
    second_category:    `${bp.categoryName ?? 'Algo'} que también disfrutas`,
    third_category:     `Más de ${bp.categoryName ?? 'lo tuyo'}`,
    social_group:       `Para ${bp.socialGroupName ?? 'salir'}`,
    discovery:          `Descubre ${bp.categoryName ?? 'algo nuevo'}`,
    new_arrivals:       'Recién publicados',
    upcoming_events:    'Próximos eventos',
  }

  const SUBTITLES: Record<string, string> = {
    rating: 'Mejor valorados', recent: 'Recién publicados',
    views: 'Los más visitados', date: 'No te los pierdas',
  }

  return {
    title: (TITLES[base] ?? `${bp.categoryName ?? bp.socialGroupName ?? 'Lugares'}`).slice(0, 40),
    subtitle: (SUBTITLES[bp.sortBy] ?? 'Para ti hoy').slice(0, 22),
  }
}

// ── Construye blueprints LOCALMENTE (sin edge function) ────────────────────
// Usa los datos que el frontend ya tiene: places, categories, socialGroups
function buildLocalBlueprints(
  places: Place[],
  events: Event[],
  userTopCategories: string[],
  userTopSocialGroup: string | null,
  recentCategory: string | null,
  recentPlaceName: string | null,
  isWeekend: boolean,
  hour: number,
): Blueprint[] {
  const MAX = 10
  const result: Blueprint[] = []
  const usedIds = new Set<string>()
  const usedCats = new Set<string>()
  const usedSGs = new Set<string>()

  function push(bp: Blueprint) {
    if (result.length >= MAX || usedIds.has(bp.id)) return
    result.push(bp)
    usedIds.add(bp.id)
    if (bp.categoryName) usedCats.add(bp.categoryName.toLowerCase())
    if (bp.socialGroupName) usedSGs.add(bp.socialGroupName.toLowerCase())
  }

  // ── P1. "Porque visitaste X" ────────────────────────────────────────────
  const recentDiffersFromTop = recentCategory &&
    recentCategory.toLowerCase() !== (userTopCategories[0] ?? '').toLowerCase()
  if (recentPlaceName && recentCategory && recentDiffersFromTop) {
    push({ id: 'recent-interaction', categoryName: recentCategory, socialGroupName: null,
           sortBy: 'rating', type: 'places', reason: `recent_interaction:${recentCategory}:${recentPlaceName}` })
  }

  // ── P2. Categorías favoritas del usuario ────────────────────────────────
  const USER_SORTS = ['rating', 'views', 'recent'] as const
  const USER_REASONS = ['favorite_category', 'second_category', 'third_category'] as const
  userTopCategories.slice(0, 3).forEach((cat, i) => {
    push({ id: `user-cat-${i}`, categoryName: cat, socialGroupName: null,
           sortBy: USER_SORTS[i], type: 'places', reason: `${USER_REASONS[i]}:${cat}` })
  })

  // ── P3. Grupo social del usuario ────────────────────────────────────────
  if (userTopSocialGroup) {
    push({ id: 'user-sg', categoryName: null, socialGroupName: userTopSocialGroup,
           sortBy: 'rating', type: 'places', reason: `social_group:${userTopSocialGroup}` })
  }

  // ── P4. Grupos sociales disponibles en los lugares ──────────────────────
  const allSGs = [...new Set(places.flatMap(p => p.socialGroups?.map((sg: any) => sg.name) ?? []))].filter(Boolean)
  const dayOffset = new Date().getDate()
  const rotatedSGs = [...allSGs.slice(dayOffset % Math.max(1, allSGs.length)),
                      ...allSGs.slice(0, dayOffset % Math.max(1, allSGs.length))]
  for (const sg of rotatedSGs) {
    if (result.length >= MAX - 3) break
    if (usedSGs.has(sg.toLowerCase())) continue
    push({ id: `sg-${sg.toLowerCase().replace(/\s+/g, '-').slice(0, 20)}`,
           categoryName: null, socialGroupName: sg, sortBy: 'rating', type: 'places',
           reason: `social_group:${sg}` })
  }

  // ── P5. Categorías disponibles en los lugares ───────────────────────────
  const allCats = [...new Set(places.map(p => p.category?.name).filter(Boolean))] as string[]
  const unusedCats = allCats.filter(c => !usedCats.has(c.toLowerCase()))
  const rotatedCats = [...unusedCats.slice(dayOffset % Math.max(1, unusedCats.length)),
                       ...unusedCats.slice(0, dayOffset % Math.max(1, unusedCats.length))]
  for (const cat of rotatedCats) {
    if (result.length >= MAX - 2) break
    push({ id: `cat-${cat.toLowerCase().replace(/\s+/g, '-').slice(0, 20)}`,
           categoryName: cat, socialGroupName: null, sortBy: 'rating', type: 'places',
           reason: `discovery:${cat}` })
  }

  // ── P6. Eventos ─────────────────────────────────────────────────────────
  if (events.length > 0 && (isWeekend || hour >= 14)) {
    push({ id: 'events-upcoming', categoryName: null, socialGroupName: null,
           sortBy: 'date', type: 'events', reason: 'upcoming_events' })
  }

  // ── P7. Recién llegados (único genérico) ─────────────────────────────────
  push({ id: 'new-arrivals', categoryName: null, socialGroupName: null,
         sortBy: 'recent', type: 'places', reason: 'new_arrivals' })

  return result
}

// ── Pide títulos AI al edge function ───────────────────────────────────────
async function fetchAITitles(
  blueprints: Blueprint[],
  city: string,
  userCategories: string[],
  userSocialGroup: string | null,
): Promise<{ title: string; subtitle: string }[] | null> {
  try {
    const hour = new Date().getHours()
    const isWeekend = [0, 6].includes(new Date().getDay())
    const { data, error } = await supabase.functions.invoke('personalized-content', {
      body: { blueprints, city, hour, isWeekend, userCategories, userSocialGroup },
    })
    if (error) { console.error('[PersonalizedSections] edge function error:', error); return null; }
    if (!Array.isArray(data?.titles)) { console.warn('[PersonalizedSections] respuesta inesperada:', data); return null; }
    return data.titles as { title: string; subtitle: string }[]
  } catch (e) {
    console.error('[PersonalizedSections] excepción:', e)
    return null
  }
}

// ── Ordena lugares ────────────────────────────────────────────────────────
function sortPlaces(places: Place[], sortBy?: string): Place[] {
  const arr = [...places]
  if (sortBy === 'rating') arr.sort((a, b) => (b.rating || 0) - (a.rating || 0))
  else if (sortBy === 'views') arr.sort((a, b) => ((b as any).viewsCount || 0) - ((a as any).viewsCount || 0))
  else if (sortBy === 'recent') arr.sort((a, b) => new Date((b as any).createdAt || 0).getTime() - new Date((a as any).createdAt || 0).getTime())
  return arr
}

// ── Hook principal ────────────────────────────────────────────────────────
export function usePersonalizedSections(
  places: Place[],
  events: Event[],
  userId: string | null | undefined,
  city?: string,
  lat?: number,
  lng?: number,
) {
  const [sections, setSections] = useState<HomeSection[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (places.length < 3) return;

    let cancelled = false;
    const run = async () => {
      setLoading(true);
      setSections([]);
      try {
        const hour = new Date().getHours()
        const isWeekend = [0, 6].includes(new Date().getDay())

        // Leer preferencias del usuario desde BD o sessionStorage
        let userTopCategories: string[] = []
        let userTopSocialGroup: string | null = null
        let recentCategory: string | null = null
        let recentPlaceName: string | null = null

        if (userId) {
          try {
            // Preferencias explícitas del usuario (categorías y grupos sociales del modal)
            const [{ data: prefs }, { data: sgPrefs }] = await Promise.all([
              supabase
                .from('user_category_preferences')
                .select('categories(name)')
                .eq('user_id', userId)
                .limit(6),
              supabase
                .from('user_social_group_preferences')
                .select('social_groups(name)')
                .eq('user_id', userId)
                .limit(6),
            ])
            userTopCategories = (prefs || []).map((p: any) => p.categories?.name).filter(Boolean)
            const prefSocialGroups: string[] = (sgPrefs || []).map((p: any) => p.social_groups?.name).filter(Boolean)

            // Historial de interacciones recientes
            const { data: activity } = await supabase
              .from('user_activity')
              .select('data')
              .eq('user_id', userId)
              .eq('action', 'view_place')
              .order('created_at', { ascending: false })
              .limit(20)

            const catCounts: Record<string, number> = {}
            const sgCounts: Record<string, number> = {}
            for (const a of (activity || [])) {
              const cat = a.data?.category as string | undefined
              const sgs = a.data?.socialGroups as string[] | undefined
              const pName = a.data?.placeName as string | undefined
              if (cat) { catCounts[cat] = (catCounts[cat] || 0) + 1; if (!recentCategory) recentCategory = cat }
              if (pName && !recentPlaceName) recentPlaceName = pName
              if (sgs) for (const sg of sgs) { sgCounts[sg] = (sgCounts[sg] || 0) + 1 }
            }
            // Fusionar categorías preferidas + historial
            const historyCats = Object.entries(catCounts).sort((a, b) => b[1] - a[1]).map(([c]) => c)
            userTopCategories = [...new Set([...userTopCategories, ...historyCats])].slice(0, 5)
            // Preferencias del modal tienen prioridad; la actividad complementa si no hay preferencias
            const activityTopSGs = Object.entries(sgCounts).sort((a, b) => b[1] - a[1]).map(([sg]) => sg)
            userTopSocialGroup = [...new Set([...prefSocialGroups, ...activityTopSGs])][0] ?? null
          } catch (e) {
            console.warn('[PersonalizedSections] error reading user prefs:', e)
          }
        }

        // Construir blueprints LOCALMENTE
        const blueprints = buildLocalBlueprints(
          places, events, userTopCategories, userTopSocialGroup,
          recentCategory, recentPlaceName, isWeekend, hour,
        )

        if (cancelled) return

        // Pedir títulos AI (edge function solo hace esto)
        const aiTitles = await fetchAITitles(blueprints, city || '', userTopCategories, userTopSocialGroup)

        if (cancelled) return

        const upcomingEvents = events.filter(e => new Date(e.dateStart) >= new Date())

        const built: HomeSection[] = blueprints
          .map((bp, i) => {
            const { title, subtitle } = aiTitles?.[i] ?? localTitle(bp)
            const isEventSection = bp.type === 'events'
            const isMixed = bp.type === 'mixed'

            let filteredPlaces: Place[] = []
            let filteredEvents: Event[] = []

            if (!isEventSection) {
              let fp = [...places]
              if (bp.categoryName) {
                const lower = bp.categoryName.toLowerCase()
                fp = fp.filter(p => p.category?.name?.toLowerCase().includes(lower))
              }
              if (bp.socialGroupName) {
                const sgLower = bp.socialGroupName.toLowerCase()
                const withSG = fp.filter(p =>
                  p.socialGroups?.some((sg: any) => sg.name?.toLowerCase().includes(sgLower))
                )
                if (withSG.length >= 1) fp = withSG
              }
              filteredPlaces = sortPlaces(fp, bp.sortBy).slice(0, 10)
            }

            if (isEventSection || isMixed) {
              let fe = [...upcomingEvents]
              if (bp.categoryName) {
                const lower = bp.categoryName.toLowerCase()
                fe = fe.filter(e => e.category?.name?.toLowerCase().includes(lower))
              }
              filteredEvents = fe.sort((a, b) => new Date(a.dateStart).getTime() - new Date(b.dateStart).getTime()).slice(0, 8)
            }

            const hasFilter = !!(bp.categoryName || bp.socialGroupName)
            const minRequired = hasFilter ? 1 : 2
            const hasContent = isEventSection ? filteredEvents.length >= 1 : filteredPlaces.length >= minRequired
            if (!hasContent) return null

            return { id: bp.id, title, subtitle, places: filteredPlaces, events: filteredEvents, type: bp.type } as HomeSection
          })
          .filter(Boolean) as HomeSection[]

        if (!cancelled) setSections(built)
      } catch (e) {
        console.error('[PersonalizedSections] error:', e)
      }
      if (!cancelled) setLoading(false)
    }

    run()
    return () => { cancelled = true }
  }, [places.length, events.length, userId, city, lat, lng])

  return { sections, loading }
}
