import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, stripe-signature",
};

const logStep = (step: string, details?: unknown) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[STRIPE-WEBHOOK] ${step}${detailsStr}`);
};

// Mapping from Stripe product_id to plan_key
const PRODUCT_TO_PLAN: Record<string, string> = {
  'prod_TrGnGXJjteXpy6': 'patient_essential',
  'prod_TrGoJXZ6Fgac8G': 'therapist_starter',
  'prod_TrGst1UgwisJ68': 'therapist_growth',
  'prod_TrGwCV4yfk3XYE': 'therapist_scale',
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    
    if (!stripeKey || !webhookSecret) {
      throw new Error("Missing Stripe configuration");
    }

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    const signature = req.headers.get("stripe-signature");
    
    if (!signature) {
      throw new Error("Missing stripe-signature header");
    }

    const body = await req.text();
    const event = await stripe.webhooks.constructEventAsync(
      body,
      signature,
      webhookSecret
    );

    logStep("Event received", { type: event.type, id: event.id });

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Handle subscription events
    if (event.type.startsWith("customer.subscription.")) {
      const subscription = event.data.object as Stripe.Subscription;
      await handleSubscriptionEvent(supabaseClient, stripe, subscription, event.type);
    }

    // Handle invoice events (payment success/failure)
    if (event.type.startsWith("invoice.")) {
      const invoice = event.data.object as Stripe.Invoice;
      await handleInvoiceEvent(supabaseClient, stripe, invoice, event.type);
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});

async function handleSubscriptionEvent(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: SupabaseClient<any>,
  stripe: Stripe,
  subscription: Stripe.Subscription,
  eventType: string
) {
  const customerId = subscription.customer as string;
  
  // Get customer email to find user
  const customer = await stripe.customers.retrieve(customerId);
  if (customer.deleted || !('email' in customer) || !customer.email) {
    logStep("Customer not found or no email", { customerId });
    return;
  }

  // Find user by email in profiles
  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('email', customer.email)
    .maybeSingle();

  if (!profile) {
    logStep("No user found for email", { email: customer.email });
    return;
  }

  const userId = profile.id;
  let status = 'inactive';
  let planKey = 'none';
  let subscriptionEnd: string | null = null;

  if (eventType === 'customer.subscription.deleted') {
    status = 'canceled';
    planKey = 'none';
  } else {
    // Map Stripe status to our status
    switch (subscription.status) {
      case 'active':
        status = 'active';
        break;
      case 'past_due':
        status = 'past_due';
        break;
      case 'canceled':
        status = 'canceled';
        break;
      case 'unpaid':
        status = 'unpaid';
        break;
      case 'trialing':
        status = 'trialing';
        break;
      default:
        status = 'inactive';
    }

    if (subscription.status === 'active' || subscription.status === 'trialing') {
      const periodEnd = subscription.current_period_end;
      if (periodEnd && typeof periodEnd === 'number') {
        subscriptionEnd = new Date(periodEnd * 1000).toISOString();
      }
      const productId = subscription.items.data[0]?.price?.product as string;
      planKey = PRODUCT_TO_PLAN[productId] ?? 'unknown';
    }
  }

  logStep("Updating subscription", { 
    userId, 
    status, 
    planKey, 
    eventType,
    subscriptionId: subscription.id 
  });

  const { error } = await supabase
    .from('subscriptions')
    .update({
      plan: planKey,
      status,
      stripe_customer_id: customerId,
      stripe_subscription_id: subscription.id,
      current_period_end: subscriptionEnd,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', userId);

  if (error) {
    logStep("Error updating subscription", { error: error.message });
  } else {
    logStep("Subscription updated successfully");
  }
}

async function handleInvoiceEvent(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: SupabaseClient<any>,
  stripe: Stripe,
  invoice: Stripe.Invoice,
  eventType: string
) {
  // Only handle invoice events related to subscriptions
  if (!invoice.subscription) return;

  const customerId = invoice.customer as string;
  const customer = await stripe.customers.retrieve(customerId);
  
  if (customer.deleted || !('email' in customer) || !customer.email) return;

  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('email', customer.email)
    .maybeSingle();

  if (!profile) return;

  if (eventType === 'invoice.payment_failed') {
    logStep("Payment failed", { userId: profile.id, invoiceId: invoice.id });
    
    await supabase
      .from('subscriptions')
      .update({
        status: 'past_due',
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', profile.id);
  }
  
  // invoice.payment_succeeded is typically followed by subscription.updated
  // so we let the subscription event handle the status update
}
