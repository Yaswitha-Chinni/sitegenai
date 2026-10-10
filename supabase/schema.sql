-- ==============================================================================
-- SiteGenAI Supabase PostgreSQL Schema & Security Policies
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------------------------------------------
-- 1. Profiles Table
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- ------------------------------------------------------------------------------
-- 2. Templates Catalog Table
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.templates (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  tagline TEXT,
  description TEXT,
  categories TEXT[] DEFAULT '{}',
  style TEXT,
  pages TEXT[] DEFAULT '{}',
  sections JSONB DEFAULT '[]'::jsonb,
  colors JSONB DEFAULT '{}'::jsonb,
  source TEXT DEFAULT 'built-in',
  featured BOOLEAN DEFAULT false,
  thumbnail TEXT,
  preview_path TEXT,
  details JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

ALTER TABLE public.templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read-only access for templates"
  ON public.templates FOR SELECT
  TO public
  USING (true);

-- ------------------------------------------------------------------------------
-- 3. Projects Table
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.projects (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  template_id TEXT,
  template_source TEXT DEFAULT 'built-in',
  category TEXT DEFAULT 'Landing Page',
  style TEXT DEFAULT 'Modern',
  theme JSONB NOT NULL DEFAULT '{"primaryColor":"#356DFF","secondaryColor":"#0F172A","backgroundColor":"#FFFFFF","fontFamily":"Outfit, sans-serif"}'::jsonb,
  pages TEXT[] DEFAULT ARRAY['Home'],
  active_page TEXT DEFAULT 'Home',
  sections JSONB NOT NULL DEFAULT '[]'::jsonb,
  local_port INTEGER DEFAULT 3000,
  is_favorite BOOLEAN DEFAULT false,
  is_live_ai_generated BOOLEAN DEFAULT false,
  ai_model_used TEXT,
  ai_summary TEXT,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_projects_user_id ON public.projects(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_updated_at ON public.projects(updated_at DESC);

ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own projects or anonymous session projects"
  ON public.projects FOR SELECT
  USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can insert projects"
  ON public.projects FOR INSERT
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can update own projects"
  ON public.projects FOR UPDATE
  USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can delete own projects"
  ON public.projects FOR DELETE
  USING (auth.uid() = user_id OR user_id IS NULL);

-- ------------------------------------------------------------------------------
-- 4. Assets Table
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.assets (
  id TEXT PRIMARY KEY,
  project_id TEXT REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  original_name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('logo', 'product', 'brand', 'video')),
  url TEXT NOT NULL,
  size BIGINT NOT NULL,
  mime_type TEXT NOT NULL,
  enhanced_url TEXT,
  enhancement_status TEXT DEFAULT 'none',
  analysis JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_assets_project_id ON public.assets(project_id);

ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view assets for accessible projects"
  ON public.assets FOR SELECT
  USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can insert assets"
  ON public.assets FOR INSERT
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can delete assets"
  ON public.assets FOR DELETE
  USING (auth.uid() = user_id OR user_id IS NULL);

-- ------------------------------------------------------------------------------
-- 5. Promotional Videos Table
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.promotional_videos (
  id TEXT PRIMARY KEY,
  project_id TEXT REFERENCES public.projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  concept TEXT NOT NULL,
  style TEXT NOT NULL,
  aspect_ratio TEXT DEFAULT '16:9',
  duration_seconds INTEGER DEFAULT 15,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'generating', 'ready', 'failed')),
  video_url TEXT,
  thumbnail_url TEXT,
  script TEXT,
  prompt_used TEXT,
  error TEXT,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_promo_videos_project_id ON public.promotional_videos(project_id);

ALTER TABLE public.promotional_videos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage promo videos for accessible projects"
  ON public.promotional_videos FOR ALL
  USING (true);

-- ------------------------------------------------------------------------------
-- 6. AI Generation Jobs Table
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.ai_jobs (
  id TEXT PRIMARY KEY,
  project_id TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  job_type TEXT NOT NULL,
  prompt TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'processing' CHECK (status IN ('processing', 'completed', 'failed')),
  result JSONB,
  error TEXT,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  completed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_ai_jobs_project_id ON public.ai_jobs(project_id);

ALTER TABLE public.ai_jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their AI jobs"
  ON public.ai_jobs FOR ALL
  USING (auth.uid() = user_id OR user_id IS NULL);

-- ------------------------------------------------------------------------------
-- 7. Seed W1 Official Template into Supabase
-- ------------------------------------------------------------------------------
INSERT INTO public.templates (id, name, tagline, description, categories, style, pages, colors, source, featured, thumbnail, preview_path, details)
VALUES (
  'w1',
  'COCO POUR — Naturally Good',
  'Pure coconut goodness. Made for every pour.',
  'A premium, highly animated product website for pure cold-pressed coconut milk. Features cinematic video loops, interactive barista pouring moments, ethical harvesting metrics, and culinary recipe sheets.',
  ARRAY['Restaurant', 'E-commerce', 'Landing Page'],
  'Editorial & Modern Coastal',
  ARRAY['Home', 'Our Story', 'Pouring Moments', 'Product Showcase', 'Culinary Recipes', 'Where to Buy'],
  '{"primary":"#087FE5","secondary":"#071B32","background":"#FFFFFF","accent":"#F8F5ED"}'::jsonb,
  'w1',
  true,
  '/templates/w1/coco-pour-logo.png',
  '/templates/w1/index.html',
  '{"technology":"HTML5, CSS3, GSAP 3.12.5, ScrollTrigger","animations":"Dynamic SVG connecting stroke, video observer, interactive sound pills","mediaCount":"4 HD Videos, High-res brand vector assets"}'::jsonb
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  tagline = EXCLUDED.tagline,
  description = EXCLUDED.description;
