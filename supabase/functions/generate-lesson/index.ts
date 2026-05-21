import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
);

const ANTHROPIC_KEY = Deno.env.get('ANTHROPIC_API_KEY') ?? '';

const corsHeaders = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Génère le prompt selon le type de leçon
function buildPrompt(lesson: { title: string; type: string; module_title: string; course_title: string }) {
  const base = `Tu es un expert en IA et formateur pédagogique. Tu crées du contenu de formation en français, clair, structuré et engageant.

Formation : "${lesson.course_title}"
Module : "${lesson.module_title}"
Leçon : "${lesson.title}"
Type : ${lesson.type}`;

  if (lesson.type === 'text') {
    return base + `

Génère le contenu complet de cette leçon en HTML (sans balises html/head/body).
Structure requise :
- Un paragraphe d'introduction accrocheur
- 2-3 sections avec titres <h2>
- Des paragraphes explicatifs avec des exemples concrets
- Un encadré <div class="pcr-callout"> avec le point clé
- Une liste de tags <div class="pcr-tags-row"> avec les concepts abordés
- Un paragraphe de conclusion

Utilise les classes CSS existantes : pcr-callout, pcr-tags-row, pcr-tag-pill, pcr-img-block.
Réponds UNIQUEMENT avec le HTML, sans markdown ni backticks.`;
  }

  if (lesson.type === 'quiz') {
    return base + `

Génère un quiz de 3 questions en JSON uniquement (sans markdown ni backticks).
Format exact :
[
  {
    "q": "Question 1 ?",
    "opts": ["Option A", "Option B", "Option C", "Option D"],
    "correct": 1
  },
  {
    "q": "Question 2 ?",
    "opts": ["Option A", "Option B", "Option C", "Option D"],
    "correct": 0
  },
  {
    "q": "Question 3 ?",
    "opts": ["Option A", "Option B", "Option C", "Option D"],
    "correct": 2
  }
]
correct = index de la bonne réponse (0-3).
Réponds UNIQUEMENT avec le JSON.`;
  }

  // video
  return base + `

Génère un résumé et des notes de cours pour cette leçon vidéo en HTML (sans balises html/head/body).
Structure :
- Résumé en 2-3 phrases
- Section "Points clés" avec 4-5 bullet points importants
- Un encadré <div class="pcr-callout"> avec l'insight principal
- Section "Pour aller plus loin" avec 3 ressources suggérées
- Tags des concepts

Utilise les classes CSS : pcr-callout, pcr-tags-row, pcr-tag-pill.
Réponds UNIQUEMENT avec le HTML.`;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { lessonId, lessonTitle, lessonType, moduleTitle, courseTitle } = await req.json();

    // Vérifie si le contenu existe déjà en base
    const { data: existingLesson } = await supabase
      .from('lessons')
      .select('content, content_generated_at')
      .eq('id', lessonId)
      .single();

    if (existingLesson?.content) {
      // Contenu déjà généré — retourne depuis la base
      return new Response(JSON.stringify({
        content: existingLesson.content,
        cached: true
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Génère avec Claude
    const prompt = buildPrompt({
      title:        lessonTitle,
      type:         lessonType,
      module_title: moduleTitle,
      course_title: courseTitle
    });

    const claudeResponse = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type':      'application/json',
        'x-api-key':         ANTHROPIC_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model:      'claude-sonnet-4-20250514',
        max_tokens: 2000,
        messages: [{
          role:    'user',
          content: prompt
        }]
      })
    });

    const claudeData = await claudeResponse.json();
    const content = claudeData.content?.[0]?.text ?? '';

    if (!content) {
      throw new Error('Claude n\'a pas généré de contenu');
    }

    // Sauvegarde dans Supabase
    await supabase
      .from('lessons')
      .update({
        content:               content,
        content_generated_at:  new Date().toISOString()
      })
      .eq('id', lessonId);

    return new Response(JSON.stringify({ content, cached: false }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (err) {
    console.error('Error:', err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
