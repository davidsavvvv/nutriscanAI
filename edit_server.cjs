const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// 1. In checkout-session, add affiliate_ref support
code = code.replace(
  'let { priceId, userId, customer_email } = req.body;',
  'let { priceId, userId, customer_email, affiliate_ref } = req.body;'
);

const stripePayloadFind = 'subscription_data: {\n          trial_period_days: 7,\n        },\n        payment_method_collection: "always",\n      };';
const stripePayloadReplace = `subscription_data: {
          trial_period_days: 7,
        },
        payment_method_collection: "always",
        metadata: {
          affiliate_ref: affiliate_ref || "",
        },
      };`;
if (code.includes(stripePayloadFind)) {
  code = code.replace(stripePayloadFind, stripePayloadReplace);
}

// 2. In webhook processing (checkout.session.completed), read the affiliate metadata
const webhookFind = `            await supabaseAdmin
                .from("subscriptions")
                .upsert({
                    user_id: userId,
                    stripe_customer_id: session.customer as string,
                    stripe_subscription_id: subscriptionId,
                    plan: plan,
                    status: subscription.status,
                });`;
const webhookReplace = `            await supabaseAdmin
                .from("subscriptions")
                .upsert({
                    user_id: userId,
                    stripe_customer_id: session.customer as string,
                    stripe_subscription_id: subscriptionId,
                    plan: plan,
                    status: subscription.status,
                });

            // Process Affiliate Conversion
            const affiliate_ref = session.metadata?.affiliate_ref;
            if (affiliate_ref && (plan === "pro" || plan === "expert" || plan === "starter")) {
               const priceAmount = subscription.items.data[0].price.unit_amount; // amount in cents
               if (priceAmount) {
                  const revShareCents = Math.floor(priceAmount * 0.3);
                  const revShareEuros = revShareCents / 100;

                  // Get affiliate
                  const { data: affiliate } = await supabaseAdmin
                    .from("affiliates")
                    .select("*")
                    .eq("code", affiliate_ref)
                    .single();
                  
                  if (affiliate) {
                     await supabaseAdmin
                        .from("affiliates")
                        .update({
                           conversions: affiliate.conversions + 1,
                           earnings_pending: parseFloat(affiliate.earnings_pending) + revShareEuros
                        })
                        .eq("id", affiliate.id);
                  }
               }
            }`;
if (code.includes(webhookFind)) {
  code = code.replace(webhookFind, webhookReplace);
}

// 3. Add affiliate API routes
const apiRoutesAdd = `

  // AFFILIATE SYSTEM ROUTES
  app.post("/api/affiliate/track", async (req, res) => {
     try {
        const { ref } = req.body;
        if (!ref) return res.status(400).json({ error: "No ref provided" });
        const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || "unknown";
        
        const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
        if (!supabaseUrl || !supabaseServiceKey) return res.status(500).json({ error: "Config missing" });

        const { createClient } = await import('@supabase/supabase-js');
        const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

        const { data: affiliate } = await supabaseAdmin.from("affiliates").select("*").eq("code", ref).single();
        if (affiliate) {
           await supabaseAdmin.from("affiliates").update({ clicks: affiliate.clicks + 1 }).eq("id", affiliate.id);
           await supabaseAdmin.from("affiliate_clicks").insert({ affiliate_code: ref, ip_hash: String(ip) });
           return res.json({ success: true });
        }
        res.json({ success: false, message: "Affiliate not found" });
     } catch(e) {
        res.status(500).json({ error: String(e) });
     }
  });

  app.get("/api/affiliates/stats", async (req, res) => {
     try {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) return res.status(401).json({ error: "Unauthorized" });

        const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
        const { createClient } = await import('@supabase/supabase-js');
        const supabaseAdmin = createClient(supabaseUrl!, supabaseServiceKey!);
        
        const { data: { user } } = await supabaseAdmin.auth.getUser(token);
        if (!user) return res.status(401).json({ error: "Invalid token" });

        const { data: affiliate } = await supabaseAdmin.from("affiliates").select("*").eq("user_id", user.id).single();
        
        return res.json({ affiliate });
     } catch (e) {
        res.status(500).json({ error: String(e) });
     }
  });

  app.post("/api/admin/affiliates", async (req, res) => {
     try {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) return res.status(401).json({ error: "Unauthorized" });

        const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
        const { createClient } = await import('@supabase/supabase-js');
        const supabaseAdmin = createClient(supabaseUrl!, supabaseServiceKey!);
        
        const { data: { user } } = await supabaseAdmin.auth.getUser(token);
        if (!user || user.email !== "davidsauvaget69@gmail.com") {
           return res.status(403).json({ error: "Forbidden. Admin only." });
        }

        const { code, name, email, userId } = req.body;
        const { data, error } = await supabaseAdmin.from("affiliates").insert({
           code, name, email, user_id: userId || null
        }).select().single();

        if (error) throw error;
        res.json({ affiliate: data });
     } catch (e: any) {
        res.status(500).json({ error: e.message });
     }
  });

  app.get("/api/admin/affiliates", async (req, res) => {
     try {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) return res.status(401).json({ error: "Unauthorized" });

        const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
        const { createClient } = await import('@supabase/supabase-js');
        const supabaseAdmin = createClient(supabaseUrl!, supabaseServiceKey!);
        
        const { data: { user } } = await supabaseAdmin.auth.getUser(token);
        if (!user || user.email !== "davidsauvaget69@gmail.com") {
           return res.status(403).json({ error: "Forbidden. Admin only." });
        }

        const { data } = await supabaseAdmin.from("affiliates").select("*").order("created_at", { ascending: false });
        res.json({ affiliates: data || [] });
     } catch (e: any) {
        res.status(500).json({ error: e.message });
     }
  });

  app.post("/api/admin/affiliates/:id/pay", async (req, res) => {
      try {
        const token = req.headers.authorization?.split(" ")[1];
        const { id } = req.params;
        if (!token) return res.status(401).json({ error: "Unauthorized" });

        const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
        const { createClient } = await import('@supabase/supabase-js');
        const supabaseAdmin = createClient(supabaseUrl!, supabaseServiceKey!);
        
        const { data: { user } } = await supabaseAdmin.auth.getUser(token);
        if (!user || user.email !== "davidsauvaget69@gmail.com") {
           return res.status(403).json({ error: "Forbidden. Admin only." });
        }

        const { data: affiliate } = await supabaseAdmin.from("affiliates").select("*").eq("id", id).single();
        if(!affiliate) return res.status(404).json({error: "Not found"});
        
        const pending = parseFloat(affiliate.earnings_pending);
        const total = parseFloat(affiliate.earnings_total);
        
        await supabaseAdmin.from("affiliates").update({
           earnings_pending: 0,
           earnings_total: total + pending
        }).eq("id", id);
        res.json({ success: true });
     } catch (e: any) {
        res.status(500).json({ error: e.message });
     }
  });
`;

code = code.replace(
  '// API Route for nutrition scanning',
  apiRoutesAdd + '\n\n  // API Route for nutrition scanning'
);

fs.writeFileSync('server.ts', code, 'utf8');
console.log("Updated server.ts successfully");
