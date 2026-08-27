-- supabase/migrations/001_devotionals.sql

-- Organizations table
CREATE TABLE IF NOT EXISTS organizations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  contact_email TEXT NOT NULL UNIQUE,
  website_url TEXT,
  logo_url TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Devotionals table
CREATE TABLE IF NOT EXISTS devotionals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID REFERENCES organizations(id),
  title TEXT NOT NULL,
  body TEXT NOT NULL,                    -- full devotional text (markdown allowed)
  verse_ref TEXT NOT NULL,               -- e.g. "John 3:16"
  verse_text TEXT,                       -- pulled from WEB at approval time
  author_name TEXT NOT NULL,
  author_title TEXT,                     -- e.g. "Senior Pastor"
  theme TEXT,                            -- e.g. "Grace", "Courage"
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending' | 'approved' | 'rejected'
  rejection_reason TEXT,
  scheduled_for DATE,                    -- null = show immediately after approval
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security
ALTER TABLE devotionals ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

-- Public can read approved devotionals only
CREATE POLICY "Public read approved devotionals"
  ON devotionals FOR SELECT
  USING (status = 'approved');

-- Submissions are insert-only for anonymous users
CREATE POLICY "Anyone can submit devotionals"
  ON devotionals FOR INSERT
  WITH CHECK (status = 'pending');

-- Service role (your backend/admin) can do anything
-- (handled via service_role key, no policy needed)
