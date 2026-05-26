-- ============================================================
-- IA ACADEMY — Schéma Supabase
-- À exécuter dans SQL Editor → New Query
-- ============================================================

-- ── 1. PROFILES ──────────────────────────────────────────────
-- Étend auth.users avec les infos métier
CREATE TABLE public.profiles (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email         TEXT,
  prenom        TEXT,
  nom           TEXT,
  avatar_url    TEXT,
  plan          TEXT DEFAULT 'free' CHECK (plan IN ('free','starter','pro','expert')),
  is_suspended  BOOLEAN DEFAULT false,
  role          TEXT DEFAULT 'user' CHECK (role IN ('user','admin')),
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now()
);

-- ── 2. COURSES ───────────────────────────────────────────────
-- Catalogue des formations
CREATE TABLE public.courses (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug          TEXT UNIQUE NOT NULL,
  title         TEXT NOT NULL,
  description   TEXT,
  thumbnail_url TEXT,
  price         NUMERIC(10,2) DEFAULT 0,
  level         TEXT CHECK (level IN ('debutant','intermediaire','avance')),
  category      TEXT,
  is_published  BOOLEAN DEFAULT false,
  created_at    TIMESTAMPTZ DEFAULT now()
);

-- ── 3. MODULES ───────────────────────────────────────────────
CREATE TABLE public.modules (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id     UUID REFERENCES public.courses(id) ON DELETE CASCADE,
  title         TEXT NOT NULL,
  position      INTEGER NOT NULL,
  created_at    TIMESTAMPTZ DEFAULT now()
);

-- ── 4. LESSONS ───────────────────────────────────────────────
CREATE TABLE public.lessons (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id     UUID REFERENCES public.modules(id) ON DELETE CASCADE,
  title         TEXT NOT NULL,
  type          TEXT CHECK (type IN ('video','text','quiz')),
  duration_min  INTEGER DEFAULT 0,
  position      INTEGER NOT NULL,
  is_free       BOOLEAN DEFAULT false,
  created_at    TIMESTAMPTZ DEFAULT now()
);

-- ── 5. ENROLLMENTS ───────────────────────────────────────────
-- Inscription d'un utilisateur à une formation
CREATE TABLE public.enrollments (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id     UUID REFERENCES public.courses(id) ON DELETE CASCADE,
  enrolled_at   TIMESTAMPTZ DEFAULT now(),
  completed_at  TIMESTAMPTZ,
  UNIQUE(user_id, course_id)
);

-- ── 6. PROGRESS ──────────────────────────────────────────────
-- Progression par leçon
CREATE TABLE public.progress (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id     UUID REFERENCES public.lessons(id) ON DELETE CASCADE,
  course_id     UUID REFERENCES public.courses(id) ON DELETE CASCADE,
  completed     BOOLEAN DEFAULT false,
  completed_at  TIMESTAMPTZ,
  UNIQUE(user_id, lesson_id)
);

-- ── 7. CERTIFICATES ──────────────────────────────────────────
CREATE TABLE public.certificates (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id     UUID REFERENCES public.courses(id) ON DELETE CASCADE,
  issued_at     TIMESTAMPTZ DEFAULT now(),
  pdf_url       TEXT,
  UNIQUE(user_id, course_id)
);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

ALTER TABLE public.profiles     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.modules       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrollments   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.progress      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificates  ENABLE ROW LEVEL SECURITY;

-- PROFILES : chaque user voit et modifie uniquement son profil
CREATE POLICY "profiles_select_own" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- COURSES : tout le monde peut lire les formations publiées
CREATE POLICY "courses_select_published" ON public.courses
  FOR SELECT USING (is_published = true);

-- MODULES + LESSONS : lecture publique
CREATE POLICY "modules_select_all" ON public.modules
  FOR SELECT USING (true);

CREATE POLICY "lessons_select_all" ON public.lessons
  FOR SELECT USING (true);

-- ENROLLMENTS : user voit et crée ses propres inscriptions
CREATE POLICY "enrollments_select_own" ON public.enrollments
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "enrollments_insert_own" ON public.enrollments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- PROGRESS : user voit et modifie sa propre progression
CREATE POLICY "progress_select_own" ON public.progress
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "progress_insert_own" ON public.progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "progress_update_own" ON public.progress
  FOR UPDATE USING (auth.uid() = user_id);

-- CERTIFICATES : user voit ses propres certifs
CREATE POLICY "certificates_select_own" ON public.certificates
  FOR SELECT USING (auth.uid() = user_id);

-- ============================================================
-- TRIGGER : crée automatiquement un profil à l'inscription
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, prenom, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'prenom', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- VUE : progression globale par user/course (utile pour dashboard)
-- ============================================================

CREATE OR REPLACE VIEW public.course_progress AS
SELECT
  e.user_id,
  e.course_id,
  c.title                                          AS course_title,
  COUNT(l.id)                                      AS total_lessons,
  COUNT(p.id) FILTER (WHERE p.completed = true)    AS completed_lessons,
  ROUND(
    COUNT(p.id) FILTER (WHERE p.completed = true)::NUMERIC
    / NULLIF(COUNT(l.id), 0) * 100
  )                                                AS progress_pct,
  e.enrolled_at,
  e.completed_at
FROM public.enrollments e
JOIN public.courses c ON c.id = e.course_id
JOIN public.modules m ON m.course_id = c.id
JOIN public.lessons l ON l.module_id = m.id
LEFT JOIN public.progress p ON p.lesson_id = l.id AND p.user_id = e.user_id
GROUP BY e.user_id, e.course_id, c.title, e.enrolled_at, e.completed_at;

-- ============================================================
-- DONNÉES DE TEST : une formation
-- ============================================================

INSERT INTO public.courses (slug, title, description, price, level, category, is_published)
VALUES (
  'ia-generative-llms',
  'IA Générative & LLMs',
  'Maîtrisez les LLMs, le prompt engineering et la construction d''agents IA autonomes.',
  99.00,
  'intermediaire',
  'ia',
  true
);
