import Stripe from "stripe";

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

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { priceId, userId, customer_email } = req.body;
    const stripe = getStripe();
    
    // In Vercel, req.headers.referer might not always be perfect, fallback to a hardcoded URL or origin
    const referer = req.headers.referer || "https://scanmymacros.com/";
    const successUrl = new URL("/scanner?welcome=true", referer).toString();
    const cancelUrl = new URL("/#pricing", referer).toString();

    const payload: any = {
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: successUrl,
      cancel_url: cancelUrl,
      client_reference_id: userId,
      subscription_data: {
        trial_period_days: 7,
      },
      payment_method_collection: "always",
    };
    
    if (customer_email) {
      payload.customer_email = customer_email;
    }
    
    const session = await stripe.checkout.sessions.create(payload);

    return res.json({ url: session.url });
  } catch (err: any) {
    console.error("Stripe Error:", err);
    return res.status(500).json({ error: err.message });
  }
}
