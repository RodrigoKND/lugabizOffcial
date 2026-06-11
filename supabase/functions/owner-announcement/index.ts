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

  const authHeader = req.headers.get('Authorization')!
  const token = authHeader.replace('Bearer ', '')

  const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token)
  if (authError || !user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  const { data: role } = await supabaseClient
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .single()

  if (!role || (role.role !== 'owner' && role.role !== 'admin')) {
    return new Response(JSON.stringify({ error: 'Only owners can create announcements' }), {
      status: 403,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  // Rate limiting: máximo 1 anuncio cada 5 minutos por usuario
  const RATE_LIMIT_MS = 5 * 60 * 1000
  const { data: lastAnnouncement } = await supabaseClient
    .from('notifications')
    .select('created_at')
    .eq('data->>owner_id', user.id)
    .eq('type', 'owner_announcement')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (lastAnnouncement) {
    const msSinceLastAnnouncement = Date.now() - new Date(lastAnnouncement.created_at).getTime()
    if (msSinceLastAnnouncement < RATE_LIMIT_MS) {
      const remaining = Math.ceil((RATE_LIMIT_MS - msSinceLastAnnouncement) / 60000)
      return new Response(JSON.stringify({
        error: `Espera ${remaining} minuto${remaining !== 1 ? 's' : ''} antes de enviar otro anuncio`,
      }), {
        status: 429,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }
  }

  const { title, body, data: notifData, targetUsers, categoryIds } = await req.json()

  if (!title || !body) {
    return new Response(JSON.stringify({ error: 'Title and body are required' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  let users: { id: string }[]
  if (targetUsers && targetUsers.length > 0) {
    users = targetUsers.map((id: string) => ({ id }))
  } else if (categoryIds && categoryIds.length > 0) {
    await supabaseClient.rpc('get_users_interacted_with_category', {
      p_category_id: categoryIds[0],
    })
    const userIdSet = new Set<string>()
    for (const catId of categoryIds) {
      const { data } = await supabaseClient.rpc('get_users_interacted_with_category', { p_category_id: catId })
      if (data) data.forEach((u: any) => userIdSet.add(u.user_id))
    }
    users = Array.from(userIdSet).map((id: string) => ({ id }))
  } else {
    const { data: allUsers } = await supabaseClient
      .from('users')
      .select('id')
    users = allUsers || []
  }

  const notifications = users.map((u: { id: string }) => ({
    user_id: u.id,
    type: 'owner_announcement',
    title,
    body,
    data: { ...notifData, owner_id: user.id },
    read: false,
  }))

  const { error: insertError } = await supabaseClient
    .from('notifications')
    .insert(notifications)

  if (insertError) {
    return new Response(JSON.stringify({ error: insertError.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  return new Response(JSON.stringify({ success: true, sentTo: users.length }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
})
