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

  const { notificationId, action } = await req.json()

  if (!notificationId || !['like', 'unlike'].includes(action)) {
    return new Response(JSON.stringify({ error: 'Invalid request' }), { status: 400 })
  }

  if (action === 'like') {
    const { error: insertError } = await supabaseClient
      .from('notification_likes')
      .upsert(
        { user_id: user.id, notification_id: notificationId },
        { onConflict: 'user_id,notification_id' }
      )

    if (insertError) {
      return new Response(JSON.stringify({ error: insertError.message }), { status: 500 })
    }
  } else {
    const { error: deleteError } = await supabaseClient
      .from('notification_likes')
      .delete()
      .eq('user_id', user.id)
      .eq('notification_id', notificationId)

    if (deleteError) {
      return new Response(JSON.stringify({ error: deleteError.message }), { status: 500 })
    }
  }

  const { count } = await supabaseClient
    .from('notification_likes')
    .select('id', { count: 'exact', head: true })
    .eq('notification_id', notificationId)

  return new Response(JSON.stringify({
    success: true,
    liked: action === 'like',
    likesCount: count || 0,
  }), {
    headers: { 'Content-Type': 'application/json' },
  })
})
