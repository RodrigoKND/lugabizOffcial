import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  const supabaseClient = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  const authHeader = req.headers.get('Authorization')!
  const token = authHeader.replace('Bearer ', '')

  const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token)
  if (authError || !user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
  }

  const { data: role } = await supabaseClient
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .single()

  if (!role || (role.role !== 'owner' && role.role !== 'admin')) {
    return new Response(JSON.stringify({ error: 'Only owners can create announcements' }), { status: 403 })
  }

  const { title, body, data: notifData, targetUsers } = await req.json()

  if (!title || !body) {
    return new Response(JSON.stringify({ error: 'Title and body are required' }), { status: 400 })
  }

  let users: { id: string }[]
  if (targetUsers && targetUsers.length > 0) {
    users = targetUsers.map((id: string) => ({ id }))
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
    return new Response(JSON.stringify({ error: insertError.message }), { status: 500 })
  }

  return new Response(JSON.stringify({ success: true, sentTo: users.length }), {
    headers: { 'Content-Type': 'application/json' },
  })
})
