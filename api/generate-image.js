export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { title, description, level } = req.body;
  if (!title) return res.status(400).json({ error: 'title requis' });

  const prompt = `Professional e-learning course thumbnail for an online AI academy. 
Course: "${title}". ${description ? 'Topic: ' + description : ''}
Style: modern, clean, dark background with purple and blue gradients, 
glowing tech elements, abstract geometric shapes, no text, no letters, 
cinematic lighting, 4K quality.`;

  try {
    const response = await fetch('https://api.openai.com/v1/images/generations', {
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

    const data = await response.json();
    if (!response.ok) return res.status(response.status).json({ error: data });

    const imageUrl = data.data[0].url;
    return res.status(200).json({ url: imageUrl });

  } catch (err) {
    return res.status(500).json({ error: String(err) });
  }
}
