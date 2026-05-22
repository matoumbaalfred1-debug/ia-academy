export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { title, description, level } = req.body;
  if (!title) return res.status(400).json({ error: 'title requis' });

  const SUPABASE_URL = 'https://pfbijoyguskdpdseunfh.supabase.co';
  const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBmYmlqb3lndXNrZHBkc2V1bmZoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgyMTczMjcsImV4cCI6MjA5Mzc5MzMyN30.UNk-OJuZBdXIgDMvtp7ZLvpxQfs9Qrzu1aAcQwHhdyQ';

  const prompt = `Professional e-learning course thumbnail for an online AI academy.
Course: "${title}". ${description ? 'Topic: ' + description : ''}
Style: modern, clean, dark background with purple and blue gradients,
glowing tech elements, abstract geometric shapes, no text, no letters,
cinematic lighting, 4K quality.`;

  try {
    // 1. Générer l'image avec DALL-E
    const dalleRes = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'dall-e-3',
        prompt,
        n: 1,
        size: '1792x1024',
        quality: 'standard'
      })
    });

    const dalleData = await dalleRes.json();
    if (!dalleRes.ok) return res.status(dalleRes.status).json({ error: dalleData });

    const tempUrl = dalleData.data[0].url;

    // 2. Télécharger l'image (URL temporaire DALL-E expire en ~1h)
    const imgRes = await fetch(tempUrl);
    const imgBuffer = await imgRes.arrayBuffer();

    // 3. Upload dans Supabase Storage
    const fileName = `course-${Date.now()}.png`;
    const uploadRes = await fetch(
      `${SUPABASE_URL}/storage/v1/object/course-images/${fileName}`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'image/png',
          'x-upsert': 'true'
        },
        body: imgBuffer
      }
    );

    if (!uploadRes.ok) {
      // Si l'upload échoue, on retourne quand même l'URL temporaire
      console.warn('Upload Supabase échoué, URL temporaire utilisée');
      return res.status(200).json({ url: tempUrl });
    }

    // 4. Construire l'URL publique permanente
    const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/course-images/${fileName}`;
    return res.status(200).json({ url: publicUrl });

  } catch (err) {
    return res.status(500).json({ error: String(err) });
  }
}
