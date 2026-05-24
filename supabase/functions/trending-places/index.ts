import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  const supabaseClient = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  const { data: places, error } = await supabaseClient
    .from('places')
    .select(`
      *,
      category:categories(*),
      author:users(name, avatar),
      place_social_groups(social_group:social_groups(*)),
      reviews(*, user:users(name, avatar))
    `)
    .order('saved_count', { ascending: false })
    .limit(12)

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
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
        (place.saved_count || 0) * 3 +
        (place.review_count || 0) * 2 +
        (place.views_count || 0) * 1,
    }
  })

  trending.sort((a: any, b: any) => b.trending_score - a.trending_score)

  return new Response(JSON.stringify(trending), {
    headers: { 'Content-Type': 'application/json' },
  })
})
