import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";
import { Readable } from 'stream';

export const config = {
  api: {
    bodyParser: false,
  },
};

let stripeClient: Stripe | null = null;
function getStripe(): Stripe {
  if (!stripeClient) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) {
      throw new Error("STRIPE_SECRET_KEY environment variable is missing.");
    }
    stripeClient = new Stripe(key);
  }
  return stripeClient;
}

// Helper to read raw body from Next.js / Vercel req stream
async function buffer(readable: Readable) {
  const chunks = [];
  for await (const chunk of readable) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const signature = req.headers["stripe-signature"] as string;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  
  if (!webhookSecret) {
    console.warn("No STRIPE_WEBHOOK_SECRET found, ignoring webhook");
    return res.status(400).send("Webhook secret missing");
  }

  let event: Stripe.Event;
  try {
    const reqBuffer = await buffer(req);
    event = getStripe().webhooks.constructEvent(
      reqBuffer.toString(),
      signature,
      webhookSecret
    );
  } catch (err: any) {
    console.error("Webhook signature verification failed.", err.message);
    return res.status(400).send("Webhook Error: " + err.message);
  }

  try {
    const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
        console.error("Supabase config missing for webhook processing");
        return res.status(500).send("Supabase config missing");
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
            persistSession: false,
            autoRefreshToken: false,
            detectSessionInUrl: false
        }
    });

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      
      const userId = session.client_reference_id;
      const subscriptionId = session.subscription as string;
      
      if (userId && subscriptionId) {
          const subscription = await getStripe().subscriptions.retrieve(subscriptionId);
          const priceId = subscription.items.data[0].price.id;
          
          let plan = "free";
          if (priceId === "price_1TcVGlIcQouyQI6K6uttG2JD") plan = "pro";
          if (priceId === "price_1TcVHFIcQouyQI6KSdytzdTQ") plan = "expert";
          
          await supabaseAdmin
              .from("subscriptions")
              .upsert({
                  user_id: userId,
                  stripe_customer_id: session.customer as string,
                  stripe_subscription_id: subscriptionId,
                  plan: plan,
                  status: subscription.status,
              });
      }
    } else if (event.type === "customer.subscription.updated" || event.type === "customer.subscription.deleted") {
      const subscription = event.data.object as Stripe.Subscription;
      
      const priceId = subscription.items.data[0].price.id;
      let plan = "free";
      if (priceId === "price_1TcVGlIcQouyQI6K6uttG2JD") plan = "pro";
      if (priceId === "price_1TcVHFIcQouyQI6KSdytzdTQ") plan = "expert";

      await supabaseAdmin
          .from("subscriptions")
          .update({
              plan: plan,
              status: subscription.status,
          })
          .eq("stripe_subscription_id", subscription.id);
    }
  } catch (err: any) {
      console.error("Error processing webhook:", err);
  }

  res.json({ received: true });
}
