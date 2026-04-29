import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

serve(async (req) => {
  try {
    const { record } = await req.json()
    const { recipient_id, sender_id, content } = record

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    // 1. Get recipient's push token and sender's name
    const { data: recipient } = await supabase
      .from('profiles')
      .select('push_token')
      .eq('id', recipient_id)
      .single()

    const { data: sender } = await supabase
      .from('profiles')
      .select('display_name')
      .eq('id', sender_id)
      .single()

    if (recipient?.push_token) {
      // 2. Send push to Expo
      const response = await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Accept-Encoding': 'gzip, deflate',
        },
        body: JSON.stringify({
          to: recipient.push_token,
          title: `New message from ${sender?.display_name || 'Someone'}`,
          body: content.length > 50 ? content.substring(0, 47) + '...' : content,
          data: { url: `/chat/${sender_id}` },
          sound: 'default',
          priority: 'high',
        }),
      })
      
      const result = await response.json()
      return new Response(JSON.stringify(result), { status: 200 })
    }

    return new Response(JSON.stringify({ message: 'No push token found' }), { status: 200 })

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }
})
