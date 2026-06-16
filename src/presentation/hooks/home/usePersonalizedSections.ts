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

interface Blueprint {
  id: string;
  reason: string;
  categoryName: string | null;
  socialGroupName: string | null;
  sortBy: 'rating' | 'recent' | 'views' | 'date';
  type: 'places' | 'events' | 'mixed';
  score?: number;
}

const CATEGORY_RELATED: Record<string, string[]> = {
  Restaurantes: ['Cafeterias', 'Bares'],
  Cafeterias: ['Restaurantes', 'Librerias'],
  Bares: ['Restaurantes'],
  Hoteles: ['Restaurantes', 'Centros Comerciales'],
  Parques: ['Naturaleza'],
  Museos: ['Librerias'],
  Tiendas: ['Centros Comerciales'],
  Gimnasios: ['Naturaleza', 'Parques'],
  Cines: ['Restaurantes', 'Centros Comerciales'],
  Librerias: ['Cafeterias', 'Museos'],
  'Centros Comerciales': ['Tiendas', 'Cines', 'Restaurantes'],
  Naturaleza: ['Parques'],
}

function localTitle(bp: Blueprint): { title: string; subtitle: string } {
  const base = bp.reason.split(':')[0]
  const place = bp.reason.split(':')[2] ?? ''

  const TITLES: Record<string, string> = {
    recent_interaction: place ? `Porque visitaste ${place}` : `Más ${bp.categoryName ?? 'lugares'} para ti`,
    favorite_category: `Porque te encanta ${bp.categoryName ?? 'esto'}`,
    second_category: `${bp.categoryName ?? 'Algo'} que también disfrutas`,
    third_category: `Más de ${bp.categoryName ?? 'lo tuyo'}`,
    related_category: `También te gustará ${bp.categoryName ?? ''}`,
    social_group: `Para ${bp.socialGroupName ?? 'salir'}`,
    new_arrivals: 'Recién publicados',
    upcoming_events: 'Próximos eventos',
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

function hasPlacesForCategory(places: Place[], catName: string): boolean {
  return places.some(p => p.category?.name?.toLowerCase() === catName.toLowerCase())
}

function hasPlacesForSocialGroup(places: Place[], sgName: string): boolean {
  return places.some(p => p.socialGroups?.some((sg: any) => sg.name?.toLowerCase() === sgName.toLowerCase()))
}

function buildScoredBlueprints(
  places: Place[],
  events: Event[],
  userTopCategories: string[],
  userTopSocialGroup: string | null,
  recentCategory: string | null,
  recentPlaceName: string | null,
  isWeekend: boolean,
  hour: number,
): Blueprint[] {
  const MAX = 6
  const result: Blueprint[] = []
  const usedCats = new Set<string>()
  const usedSGs = new Set<string>()

  function push(bp: Blueprint) {
    if (result.length >= MAX) return
    if (bp.categoryName) {
      const lower = bp.categoryName.toLowerCase()
      if (usedCats.has(lower)) return
      usedCats.add(lower)
    }
    if (bp.socialGroupName) {
      const lower = bp.socialGroupName.toLowerCase()
      if (usedSGs.has(lower)) return
      usedSGs.add(lower)
    }
    result.push(bp)
  }

  // ── Score ALL categories by relevance to THIS user ──
  interface CategoryScore {
    name: string
    score: number
    source: 'explicit' | 'implicit' | 'related'
  }
  const catScores = new Map<string, CategoryScore>()

  // 1. Explicit preferences: +4
  userTopCategories.forEach(cat => {
    const existing = catScores.get(cat.toLowerCase()) ?? { name: cat, score: 0, source: 'explicit' as const }
    existing.score += 4
    catScores.set(cat.toLowerCase(), existing)
  })

  // 2. Related to explicit prefs: +1.5 (content-based filtering)
  userTopCategories.forEach(cat => {
    const related = CATEGORY_RELATED[cat] ?? []
    related.forEach(rel => {
      if (rel.toLowerCase() === cat.toLowerCase()) return
      if (!hasPlacesForCategory(places, rel)) return
      const existing = catScores.get(rel.toLowerCase()) ?? { name: rel, score: 0, source: 'related' as const }
      existing.score += 1.5
      existing.source = 'related'
      catScores.set(rel.toLowerCase(), existing)
    })
  })

  // 3. Recent interaction category: +3 if different from top
  if (recentCategory && userTopCategories.length > 0 &&
    recentCategory.toLowerCase() !== userTopCategories[0].toLowerCase()) {
    const existing = catScores.get(recentCategory.toLowerCase()) ??
      { name: recentCategory, score: 0, source: 'implicit' as const }
    existing.score += 3
    existing.source = 'implicit'
    catScores.set(recentCategory.toLowerCase(), existing)
  }

  // 4. Popular categories in city (fallback for users with no prefs): +0.5
  const cityCatCounts = new Map<string, number>()
  places.forEach(p => {
    const n = p.category?.name
    if (n) cityCatCounts.set(n, (cityCatCounts.get(n) ?? 0) + 1)
  })
  const sortedCityCats = [...cityCatCounts.entries()].sort((a, b) => b[1] - a[1])
  if (userTopCategories.length === 0) {
    sortedCityCats.slice(0, 3).forEach(([cat]) => {
      const existing = catScores.get(cat.toLowerCase()) ?? { name: cat, score: 0, source: 'implicit' as const }
      existing.score += 0.5
      catScores.set(cat.toLowerCase(), existing)
    })
  }

  // ── P1. "Porque visitaste X" (recent interaction) ──
  if (recentPlaceName && recentCategory && catScores.get(recentCategory.toLowerCase())?.score >= 2) {
    push({
      id: 'recent-interaction', categoryName: recentCategory, socialGroupName: null,
      sortBy: 'rating', type: 'places', score: 10,
      reason: `recent_interaction:${recentCategory}:${recentPlaceName}`,
    })
  }

  // ── P2-P4. Top scored categories ──
  const scored = [...catScores.entries()]
    .sort((a, b) => b[1].score - a[1].score)
    .slice(0, 5)

  const REASONS = ['favorite_category', 'second_category', 'third_category'] as const
  const SORTS: Array<'rating' | 'views' | 'recent'> = ['rating', 'views', 'recent']
  let catIndex = 0
  for (const [, cs] of scored) {
    if (catIndex >= 3) break
    if (!hasPlacesForCategory(places, cs.name)) continue
    if (cs.name.toLowerCase() === recentCategory?.toLowerCase() && recentPlaceName) continue
    push({
      id: `cat-${cs.source}-${catIndex}`, categoryName: cs.name, socialGroupName: null,
      sortBy: SORTS[catIndex] ?? 'rating', type: 'places', score: cs.score,
      reason: `${REASONS[catIndex] ?? 'favorite_category'}:${cs.name}`,
    })
    catIndex++
  }

  // ── P5. Solo el grupo social EXPLÍCITO del usuario ──
  if (userTopSocialGroup && hasPlacesForSocialGroup(places, userTopSocialGroup)) {
    push({
      id: 'user-sg', categoryName: null, socialGroupName: userTopSocialGroup,
      sortBy: 'rating', type: 'places', score: 3,
      reason: `social_group:${userTopSocialGroup}`,
    })
  }

  // ── P6. Events ──
  if (events.length > 0 && (isWeekend || hour >= 14)) {
    push({
      id: 'events-upcoming', categoryName: null, socialGroupName: null,
      sortBy: 'date', type: 'events', score: 2,
      reason: 'upcoming_events',
    })
  }

  // ── P7. New arrivals (siempre al final) ──
  push({
    id: 'new-arrivals', categoryName: null, socialGroupName: null,
    sortBy: 'recent', type: 'places', score: 1,
    reason: 'new_arrivals',
  })

  return result
}

async function fetchPersonalizedContent(
  blueprints: Blueprint[],
  city: string,
  userCategories: string[],
  userSocialGroup: string | null,
  recentCategory: string | null,
  recentPlaceName: string | null,
  activityHistoryCats: string[],
): Promise<{
  titles: { title: string; subtitle: string }[] | null
  aiBlueprints: Blueprint[] | null
}> {
  try {
    const hour = new Date().getHours()
    const isWeekend = [0, 6].includes(new Date().getDay())
    const { data, error } = await supabase.functions.invoke('personalized-content', {
      body: {
        blueprints, city, hour, isWeekend, userCategories, userSocialGroup,
        recentCategory, recentPlaceName, activityHistoryCats,
      },
    })
    if (error) { console.error('[PersonalizedSections] edge function error:', error); return { titles: null, aiBlueprints: null }; }
    if (!Array.isArray(data?.titles)) { console.warn('[PersonalizedSections] respuesta inesperada:', data); return { titles: null, aiBlueprints: null }; }
    return {
      titles: data.titles as { title: string; subtitle: string }[],
      aiBlueprints: (data.blueprints ?? null) as Blueprint[] | null,
    }
  } catch (e) {
    console.error('[PersonalizedSections] excepción:', e)
    return { titles: null, aiBlueprints: null }
  }
}

function sortPlaces(places: Place[], sortBy?: string): Place[] {
  const arr = [...places]
  if (sortBy === 'rating') arr.sort((a, b) => (b.rating || 0) - (a.rating || 0))
  else if (sortBy === 'views') arr.sort((a, b) => ((b as any).viewsCount || 0) - ((a as any).viewsCount || 0))
  else if (sortBy === 'recent') arr.sort((a, b) => new Date((b as any).createdAt || 0).getTime() - new Date((a as any).createdAt || 0).getTime())
  return arr
}

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

        let userTopCategories: string[] = []
        let userTopSocialGroup: string | null = null
        let recentCategory: string | null = null
        let recentPlaceName: string | null = null
        let activityHistoryCats: string[] = []
        let activityHistorySGs: string[] = []

        if (userId) {
          try {
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

            const { data: activity } = await supabase
              .from('user_activity')
              .select('data')
              .eq('user_id', userId)
              .eq('action', 'view_place')
              .order('created_at', { ascending: false })
              .limit(30)

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
            activityHistoryCats = Object.entries(catCounts).sort((a, b) => b[1] - a[1]).map(([c]) => c)
            activityHistorySGs = Object.entries(sgCounts).sort((a, b) => b[1] - a[1]).map(([sg]) => sg)

            userTopCategories = [...new Set([...userTopCategories, ...activityHistoryCats])].slice(0, 5)
            const activityTopSGs = activityHistorySGs
            userTopSocialGroup = [...new Set([...prefSocialGroups, ...activityTopSGs])][0] ?? null
          } catch (e) {
            console.warn('[PersonalizedSections] error reading user prefs:', e)
          }
        }

        const localBlueprints = buildScoredBlueprints(
          places, events, userTopCategories, userTopSocialGroup,
          recentCategory, recentPlaceName, isWeekend, hour,
        )

        if (cancelled) return

        const { titles: aiTitles, aiBlueprints } = await fetchPersonalizedContent(
          localBlueprints, city || '', userTopCategories, userTopSocialGroup,
          recentCategory, recentPlaceName, activityHistoryCats,
        )

        if (cancelled) return

        // Use AI-ranked blueprints from edge function if available, fall back to local
        const finalBlueprints = aiBlueprints && aiBlueprints.length > 0 ? aiBlueprints : localBlueprints

        const upcomingEvents = events.filter(e => new Date(e.dateStart) >= new Date())

        const built: HomeSection[] = finalBlueprints
          .map((bp, i) => {
            const { title, subtitle } = aiTitles?.[i] ?? localTitle(bp)
            const isEventSection = bp.type === 'events'

            let filteredPlaces: Place[] = []
            let filteredEvents: Event[] = []

            if (!isEventSection) {
              let fp = [...places]
              if (bp.categoryName) {
                const lower = bp.categoryName.toLowerCase()
                fp = fp.filter(p => p.category?.name?.toLowerCase() === lower)
              }
              if (bp.socialGroupName) {
                const sgLower = bp.socialGroupName.toLowerCase()
                const withSG = fp.filter(p =>
                  p.socialGroups?.some((sg: any) => sg.name?.toLowerCase() === sgLower)
                )
                if (withSG.length >= 1) fp = withSG
              }
              filteredPlaces = sortPlaces(fp, bp.sortBy).slice(0, 10)
            }

            if (isEventSection) {
              let fe = [...upcomingEvents]
              if (bp.categoryName) {
                const lower = bp.categoryName.toLowerCase()
                fe = fe.filter(e => e.category?.name?.toLowerCase() === lower)
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
