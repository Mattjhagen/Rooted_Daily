-- Community Chat Tables

-- 1. Conversations
CREATE TABLE IF NOT EXISTS public.conversations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    user1_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    user2_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    last_message TEXT,
    CONSTRAINT different_users CHECK (user1_id <> user2_id)
);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_conversations_users ON public.conversations(user1_id, user2_id);

-- 2. Messages
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT now(),
    conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false
);

-- 3. Moderation Actions (Blocks/Reports)
CREATE TABLE IF NOT EXISTS public.user_moderation (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT now(),
    actor_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    target_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL, -- 'block' or 'report'
    reason TEXT,
    status TEXT DEFAULT 'active', -- 'active' for blocks, 'pending'/'resolved' for reports
    CONSTRAINT different_users_mod CHECK (actor_id <> target_id)
);

-- RLS POLICIES

-- Conversations: Users can only see conversations they are part of
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own conversations" ON public.conversations;
CREATE POLICY "Users can view their own conversations"
ON public.conversations FOR SELECT
USING (auth.uid() = user1_id OR auth.uid() = user2_id);

DROP POLICY IF EXISTS "Users can create conversations" ON public.conversations;
CREATE POLICY "Users can create conversations"
ON public.conversations FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user1_id OR auth.uid() = user2_id);

-- Messages: Users can only see messages in their conversations
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view messages in their conversations" ON public.messages;
CREATE POLICY "Users can view messages in their conversations"
ON public.messages FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.conversations 
        WHERE id = messages.conversation_id 
        AND (user1_id = auth.uid() OR user2_id = auth.uid())
    )
);

DROP POLICY IF EXISTS "Users can insert messages in their conversations" ON public.messages;
CREATE POLICY "Users can insert messages in their conversations"
ON public.messages FOR INSERT
TO authenticated
WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
        SELECT 1 FROM public.conversations 
        WHERE id = conversation_id 
        AND (user1_id = auth.uid() OR user2_id = auth.uid())
    )
);

-- User Moderation: Users can manage their own blocks/reports
ALTER TABLE public.user_moderation ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own moderation actions" ON public.user_moderation;
CREATE POLICY "Users can view their own moderation actions"
ON public.user_moderation FOR SELECT
USING (auth.uid() = actor_id);

DROP POLICY IF EXISTS "Users can create moderation actions" ON public.user_moderation;
CREATE POLICY "Users can create moderation actions"
ON public.user_moderation FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = actor_id);

-- Enable Realtime for Chat
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.conversations;
