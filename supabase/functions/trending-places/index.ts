import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const ALLOWED_ORIGINS = [
  'http://localhost:5173',
  'http://localhost:4173',
  'https://lugabiz.vercel.app',
]

function getCorsHeaders(req: Request): Record<string, string> {
  const origin = req.headers.get('Origin') || ''
  const allowed = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[2]
  return {
    'Access-Control-Allow-Origin': allowed,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  }
}

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req)
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const supabaseClient = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()

  const { data: places, error } = await supabaseClient
    .from('places')
    .select(`
      *,
      category:categories(*),
      author:users(name, avatar),
      place_social_groups(social_group:social_groups(*)),
      reviews(*, user:users(name, avatar))
    `)
    .or(`review_count.gt.0,saved_count.gt.0,views_count.gt.10`)
    .limit(50)

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  const trending = (places || []).map((place: any) => {
    const socialGroups = (place.place_social_groups || []).map((psg: any) => ({
      id: psg.social_group.id,
      name: psg.social_group.name,
      icon: psg.social_group.icon,
      color: psg.social_group.color,
      description: psg.social_group.description,
    }))

    return {
      id: place.id,
      name: place.name,
      description: place.description,
      address: place.address,
      category: place.category ? {
        id: place.category.id,
        name: place.category.name,
        icon: place.category.icon,
        color: place.category.color,
        description: place.category.description,
      } : null,
      socialGroups,
      image: place.image,
      rating: place.rating,
      review_count: place.review_count,
      reviews: (place.reviews || []).map((r: any) => ({
        id: r.id,
        user_id: r.user_id,
        user_name: r.user?.name,
        user_avatar: r.user?.avatar,
        rating: r.rating,
        comment: r.comment,
        created_at: r.created_at,
      })),
      featured: place.featured,
      created_at: place.created_at,
      author_id: place.author_id,
      author_name: place.author?.name,
      author_avatar: place.author?.avatar,
      saved_count: place.saved_count,
      latitude: place.latitude,
      longitude: place.longitude,
      coords: place.coords,
      amenities: place.amenities,
      gallery: place.gallery,
      views_count: place.views_count,
      trending_score:
        ((place.review_count || 0) * 10) +
        ((place.saved_count || 0) * 5) +
        Math.min((place.views_count || 0), 100),
    }
  })

  trending.sort((a: any, b: any) => b.trending_score - a.trending_score)

  return new Response(JSON.stringify(trending), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
})
