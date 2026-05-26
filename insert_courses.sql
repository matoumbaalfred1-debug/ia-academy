-- Ajouter les formations manquantes
INSERT INTO public.courses (slug, title, description, price, level, category, is_published)
VALUES
  ('automatisation-n8n', 'Automatisation avec n8n', 'Automatisez vos workflows avec n8n.', 79.00, 'debutant', 'automatisation', true),
  ('fondamentaux-ia', 'Les fondamentaux de l''IA', 'Les bases de l''intelligence artificielle.', 49.00, 'debutant', 'ia', true),
  ('data-science-python', 'Data Science & Python', 'Analyse de données avec Python.', 89.00, 'intermediaire', 'data', true)
ON CONFLICT (slug) DO NOTHING;
