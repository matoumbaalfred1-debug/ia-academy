import Stripe from 'https://esm.sh/stripe@14?target=deno';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
  apiVersion: '2024-04-10',
});

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
);

const corsHeaders = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const signature  = req.headers.get('stripe-signature') ?? '';
  const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET') ?? '';
  const body = await req.text();

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }

  // Paiement réussi → met à jour le plan dans profiles
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const userId  = session.metadata?.user_id;
    const plan    = session.metadata?.plan;

    if (userId && plan) {
      const { error } = await supabase
        .from('profiles')
        .update({
          plan:       plan,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId);

      if (error) {
        console.error('Supabase update error:', error);
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
      }

      console.log(`Plan "${plan}" activé pour user ${userId}`);
    }
  }

  // Abonnement annulé → repasse en free
  if (event.type === 'customer.subscription.deleted') {
    const subscription = event.data.object as Stripe.Subscription;
    const customerId   = subscription.customer as string;

    // Retrouve l'utilisateur via son customer_id Stripe
    // (à améliorer en stockant stripe_customer_id dans profiles)
    console.log(`Abonnement annulé pour customer ${customerId}`);
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
});