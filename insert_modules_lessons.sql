-- ============================================================
-- Modules et leçons pour "IA Générative & LLMs"
-- ============================================================

DO $$
DECLARE
  course_id UUID;
  m1_id UUID; m2_id UUID; m3_id UUID; m4_id UUID;
BEGIN
  -- Récupère le course_id
  SELECT id INTO course_id FROM public.courses WHERE slug = 'ia-generative-llms';

  -- MODULE 1
  INSERT INTO public.modules (course_id, title, position)
  VALUES (course_id, 'Introduction aux LLMs', 1)
  RETURNING id INTO m1_id;

  INSERT INTO public.lessons (module_id, title, type, duration_min, position, is_free)
  VALUES
    (m1_id, 'Qu''est-ce qu''un LLM ?',   'video', 8,  1, true),
    (m1_id, 'Histoire des transformers',  'text',  12, 2, true),
    (m1_id, 'Quiz : Les bases',           'quiz',  5,  3, false);

  -- MODULE 2
  INSERT INTO public.modules (course_id, title, position)
  VALUES (course_id, 'Prompt Engineering', 2)
  RETURNING id INTO m2_id;

  INSERT INTO public.lessons (module_id, title, type, duration_min, position, is_free)
  VALUES
    (m2_id, 'Anatomie d''un bon prompt',           'video', 11, 1, false),
    (m2_id, 'Techniques avancées',                 'text',  15, 2, false),
    (m2_id, 'Few-shot & chain-of-thought',          'video', 9,  3, false),
    (m2_id, 'Quiz : Prompting',                    'quiz',  6,  4, false);

  -- MODULE 3
  INSERT INTO public.modules (course_id, title, position)
  VALUES (course_id, 'RAG & Agents', 3)
  RETURNING id INTO m3_id;

  INSERT INTO public.lessons (module_id, title, type, duration_min, position, is_free)
  VALUES
    (m3_id, 'Comprendre le RAG',          'video', 13, 1, false),
    (m3_id, 'Construire un pipeline RAG', 'text',  18, 2, false),
    (m3_id, 'Introduction aux agents IA', 'video', 14, 3, false);

  -- MODULE 4
  INSERT INTO public.modules (course_id, title, position)
  VALUES (course_id, 'Déploiement & Production', 4)
  RETURNING id INTO m4_id;

  INSERT INTO public.lessons (module_id, title, type, duration_min, position, is_free)
  VALUES
    (m4_id, 'APIs et intégrations',         'text',  10, 1, false),
    (m4_id, 'Projet final : Build your AI', 'video', 22, 2, false);

END $$;
