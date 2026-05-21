import Stripe from 'https://esm.sh/stripe@14?target=deno';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
  apiVersion: '2024-04-10',
});

const PRICE_IDS: Record<string, string> = {
  starter: 'price_1TWCQNPNfVdp6YBxzr7E7stt',
  pro:     'price_1TWCRMPNfVdp6YBxz3BnVxyJ',
  expert:  'price_1TWCSQPNfVdp6YBxk20GLFOC',
};

const corsHeaders = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { plan, userId, email } = await req.json();

    const priceId = PRICE_IDS[plan];
    if (!priceId) {
      return new Response(JSON.stringify({ error: 'Plan invalide' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Crée la session Stripe Checkout
    const session = await stripe.checkout.sessions.create({
      mode:                 'subscription',
      payment_method_types: ['card'],
      customer_email:       email,
      line_items: [{
        price:    priceId,
        quantity: 1,
      }],
      success_url: `${req.headers.get('origin') || 'http://127.0.0.1:5500'}/ia_academy.html?payment=success&plan=${plan}`,
      cancel_url:  `${req.headers.get('origin') || 'http://127.0.0.1:5500'}/ia_academy.html?payment=cancelled`,
      metadata: {
        user_id: userId,
        plan:    plan,
      },
    });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});