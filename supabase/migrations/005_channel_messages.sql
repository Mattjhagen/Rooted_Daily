-- 1. Create channel_messages table
CREATE TABLE IF NOT EXISTS public.channel_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  channel_id TEXT NOT NULL,
  sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Enable Row Level Security
ALTER TABLE public.channel_messages ENABLE ROW LEVEL SECURITY;

-- Any authenticated user can SELECT (public channels are open-read)
CREATE POLICY "Public channels are viewable by authenticated users"
  ON public.channel_messages FOR SELECT
  USING ( auth.role() = 'authenticated' );

-- Any authenticated user can INSERT where sender_id = auth.uid()
CREATE POLICY "Users can insert own channel messages"
  ON public.channel_messages FOR INSERT
  WITH CHECK ( auth.uid() = sender_id );

-- 3. Add channel_messages to the supabase_realtime publication
-- Use DO block to avoid errors if the publication already contains the table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'channel_messages'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.channel_messages;
  END IF;
END $$;
