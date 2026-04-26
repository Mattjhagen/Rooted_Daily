-- supabase/migrations/002_annotations_legacy.sql

-- Add is_public and attribution fields to annotations table
ALTER TABLE IF EXISTS public.annotations 
ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS legacy_handle TEXT,
ADD COLUMN IF NOT EXISTS year INTEGER DEFAULT 2026;

-- Create an index for public notes to optimize community feed
CREATE INDEX IF NOT EXISTS idx_annotations_public ON public.annotations(is_public) WHERE is_public = true;

-- Enable Realtime for the annotations table if not already enabled
-- Note: This depends on your project's publication settings
-- ALTER PUBLICATION supabase_realtime ADD TABLE public.annotations;

-- RLS Update: Allow anyone to read public annotations
CREATE POLICY "Allow public read access to shared notes"
  ON public.annotations
  FOR SELECT
  USING (is_public = true);
