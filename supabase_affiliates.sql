CREATE TABLE affiliates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  code text UNIQUE NOT NULL,
  name text NOT NULL,
  email text NOT NULL,
  clicks int DEFAULT 0,
  signups int DEFAULT 0,
  conversions int DEFAULT 0,
  earnings_total decimal DEFAULT 0.0,
  earnings_pending decimal DEFAULT 0.0,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

CREATE TABLE affiliate_clicks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_code text NOT NULL,
  ip_hash text,
  converted boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- RLS policies
ALTER TABLE affiliates ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliate_clicks ENABLE ROW LEVEL SECURITY;

-- Affiliates can read their own data
CREATE POLICY "Affiliates can view own data" 
ON affiliates FOR SELECT 
USING (auth.uid() = user_id);

-- Only admins (or service role) can modify affiliates
CREATE POLICY "Admins can manage affiliates" 
ON affiliates FOR ALL 
USING (auth.jwt() ->> 'email' = 'davidsauvaget69@gmail.com');

-- Clicks table is managed mostly by service role, no public RLS needed for inserts if done via API,
-- but we'll allow anon to insert clicks via Edge Functions/API proxy
CREATE POLICY "Service role manages clicks" 
ON affiliate_clicks FOR ALL 
USING (true) WITH CHECK (true);
