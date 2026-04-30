-- supabase/migrations/003_journal_sync.sql

-- Ensure the journal table exists with all necessary fields for cross-platform sync
CREATE TABLE IF NOT EXISTS public.journal (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    
    -- Bible Reference fields (used by the web app)
    book TEXT,
    chapter INTEGER,
    verse INTEGER,
    
    -- Content fields
    verse_ref TEXT, -- e.g., "Genesis 1:1" (used by the iOS app)
    verse_text TEXT,
    note TEXT NOT NULL,
    type TEXT DEFAULT 'reflection', -- 'reflection' or 'prayer'
    
    -- Metadata
    is_favorite BOOLEAN DEFAULT false,
    is_public BOOLEAN DEFAULT false,
    
    -- Sync helper
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.journal ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can manage their own journal entries"
    ON public.journal
    FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Anyone can read public journal entries"
    ON public.journal
    FOR SELECT
    USING (is_public = true);

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.journal;
