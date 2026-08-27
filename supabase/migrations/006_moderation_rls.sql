-- supabase/migrations/006_moderation_rls.sql

-- First, ensure user_moderation table exists (iOS branch might have created it without a migration or we need to ensure it's here)
CREATE TABLE IF NOT EXISTS user_moderation (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  actor_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  target_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('block', 'report')),
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(actor_id, target_id, type)
);

-- Enable RLS
ALTER TABLE user_moderation ENABLE ROW LEVEL SECURITY;

-- Users can read their own moderations
CREATE POLICY "Users can view their own moderations"
  ON user_moderation FOR SELECT
  USING (auth.uid() = actor_id);

-- Users can insert their own moderations
CREATE POLICY "Users can insert their own moderations"
  ON user_moderation FOR INSERT
  WITH CHECK (auth.uid() = actor_id);

-- Prevent inserting messages if a block exists between the two users
CREATE POLICY "Prevent messages between blocked users" ON messages
  FOR INSERT
  WITH CHECK (
    NOT EXISTS (
      SELECT 1 FROM user_moderation
      JOIN conversations c ON c.id = messages.conversation_id
      WHERE user_moderation.type = 'block'
      AND (
        (user_moderation.actor_id = auth.uid() AND user_moderation.target_id = (CASE WHEN c.user1_id = auth.uid() THEN c.user2_id ELSE c.user1_id END))
        OR
        (user_moderation.target_id = auth.uid() AND user_moderation.actor_id = (CASE WHEN c.user1_id = auth.uid() THEN c.user2_id ELSE c.user1_id END))
      )
    )
  );
