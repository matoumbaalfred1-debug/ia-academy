export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { email, prenom } = req.body;
  if (!email) return res.status(400).json({ error: 'Email requis' });

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'IA Academy <onboarding@resend.dev>',
        to: [email],
        subject: 'Bienvenue sur IA Academy !',
        html: `
          <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:32px 24px">
            <div style="background:linear-gradient(135deg,#5B21F5,#00C8FF);border-radius:16px;padding:32px;text-align:center;margin-bottom:24px">
              <h1 style="color:#fff;font-size:28px;margin:0 0 8px">Bienvenue sur IA Academy !</h1>
              <p style="color:rgba(255,255,255,0.85);margin:0">Votre compte a été activé avec succès.</p>
            </div>
            <p style="font-size:16px;color:#333">Bonjour <strong>${prenom || 'cher apprenant'}</strong>,</p>
            <p style="color:#555;line-height:1.7">Votre compte IA Academy est maintenant actif. Accédez à des centaines de formations en intelligence artificielle, suivez votre progression et obtenez des certificats reconnus.</p>
            <div style="text-align:center;margin:32px 0">
              <a href="https://ia-academy-lilac.vercel.app" style="background:linear-gradient(135deg,#5B21F5,#7B2FFF);color:#fff;padding:14px 32px;border-radius:50px;text-decoration:none;font-weight:700;font-size:16px">
                Accéder à mes formations →
              </a>
            </div>
            <p style="color:#999;font-size:13px;text-align:center">IA Academy · La plateforme IA en français</p>
          </div>
        `,
      }),
    });

    const data = await response.json();
    if (!response.ok) return res.status(response.status).json({ error: data });
    return res.status(200).json({ success: true, id: data.id });

  } catch (err) {
    return res.status(500).json({ error: String(err) });
  }
}