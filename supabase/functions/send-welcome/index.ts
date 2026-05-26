import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") || "";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  try {
    const { email, prenom } = await req.json();
    if (!email) {
      return new Response(JSON.stringify({ error: "Email requis" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "IA Academy <onboarding@resend.dev>",
        to: [email],
        subject: "Bienvenue sur IA Academy !",
        html: `<div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:32px 24px"><div style="background:linear-gradient(135deg,#5B21F5,#00C8FF);border-radius:16px;padding:32px;text-align:center;margin-bottom:24px"><h1 style="color:#fff;font-size:28px;margin:0 0 8px">Bienvenue sur IA Academy !</h1><p style="color:rgba(255,255,255,0.85);margin:0">Votre compte a ete active avec succes.</p></div><p style="font-size:16px;color:#333">Bonjour <strong>${prenom || "cher apprenant"}</strong>,</p><p style="color:#555;line-height:1.7">Votre compte IA Academy est maintenant actif.</p><div style="text-align:center;margin:32px 0"><a href="https://ia-academy-lilac.vercel.app" style="background:linear-gradient(135deg,#5B21F5,#7B2FFF);color:#fff;padding:14px 32px;border-radius:50px;text-decoration:none;font-weight:700;font-size:16px">Acces a mes formations</a></div><p style="color:#999;font-size:13px;text-align:center">IA Academy</p></div>`,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      return new Response(JSON.stringify({ error: data }), {
        status: res.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    return new Response(JSON.stringify({ success: true, id: data.id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});