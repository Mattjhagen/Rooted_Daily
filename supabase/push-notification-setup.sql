-- Migration: Add push_token to profiles and setup DM notification trigger

-- 1. Add push_token column if it doesn't exist
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS push_token TEXT;

-- 2. Create the function that will be called by the trigger
-- This function will invoke the Supabase Edge Function we'll create next
CREATE OR REPLACE FUNCTION public.handle_new_message_notification()
RETURNS TRIGGER AS $$
BEGIN
  -- We use net.http_post to call our Edge Function
  -- Ensure the 'pg_net' extension is enabled in Supabase
  PERFORM
    net.http_post(
      url := 'https://xphxtkdsshqsddajzlkj.supabase.co/functions/v1/send-dm-notification',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('request.headers')::json->>'authorization'
      ),
      body := jsonb_build_object(
        'record', row_to_json(NEW)
      )
    );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Create the trigger on the messages table
DROP TRIGGER IF EXISTS on_message_inserted ON public.messages;
CREATE TRIGGER on_message_inserted
  AFTER INSERT ON public.messages
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_message_notification();
