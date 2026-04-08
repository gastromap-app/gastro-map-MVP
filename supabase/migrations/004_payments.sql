-- ── Stripe Customers ─────────────────────────────────────────────────────────
CREATE TABLE stripe_customers (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id            UUID UNIQUE NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  stripe_customer_id TEXT UNIQUE NOT NULL,
  created_at         TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE stripe_customers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own_customer" ON stripe_customers FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "admin_customers" ON stripe_customers FOR ALL USING (get_my_role() = 'admin');

-- ── Donations (MVP active) ────────────────────────────────────────────────────
CREATE TABLE donations (
  id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                  UUID REFERENCES profiles(id),
  stripe_payment_intent_id TEXT UNIQUE,
  amount                   INTEGER NOT NULL,
  currency                 TEXT DEFAULT 'eur',
  status                   TEXT DEFAULT 'pending' CHECK (status IN ('pending','succeeded','failed')),
  is_anonymous             BOOLEAN DEFAULT false,
  stripe_metadata          JSONB,
  created_at               TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE donations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own_donations"   ON donations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "admin_donations" ON donations FOR ALL    USING (get_my_role() = 'admin');

-- ── User Badges ───────────────────────────────────────────────────────────────
CREATE TABLE user_badges (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  badge_type   TEXT NOT NULL CHECK (badge_type IN ('supporter','top_contributor','early_adopter')),
  badge_metadata JSONB,
  granted_at   TIMESTAMPTZ DEFAULT now(),
  expires_at   TIMESTAMPTZ,
  UNIQUE(user_id, badge_type)
);
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_badges" ON user_badges FOR SELECT USING (true);
CREATE POLICY "admin_badges"  ON user_badges FOR ALL    USING (get_my_role() = 'admin');

-- ── STUB: Subscription Plans (V1.1) ─────────────────────────────────────────
-- Tables created but empty. Activate per §16.7 checklist in GASTROMAP_MVP_PLAN.md
CREATE TABLE subscription_plans (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            TEXT NOT NULL,
  slug            TEXT UNIQUE,
  stripe_price_id TEXT,
  amount          INTEGER,
  currency        TEXT DEFAULT 'eur',
  interval        TEXT CHECK (interval IN ('month','year')),
  features        JSONB DEFAULT '{}',
  is_active       BOOLEAN DEFAULT false,   -- false until subscriptions are launched
  created_at      TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE subscriptions (
  id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  plan_id                UUID REFERENCES subscription_plans(id),
  stripe_subscription_id TEXT UNIQUE,
  stripe_customer_id     TEXT,
  status                 TEXT DEFAULT 'inactive',
  current_period_start   TIMESTAMPTZ,
  current_period_end     TIMESTAMPTZ,
  cancel_at_period_end   BOOLEAN DEFAULT false,
  cancelled_at           TIMESTAMPTZ,
  created_at             TIMESTAMPTZ DEFAULT now(),
  updated_at             TIMESTAMPTZ DEFAULT now()
);

-- Stripe webhook event log
CREATE TABLE stripe_webhook_events (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_event_id TEXT UNIQUE,
  event_type      TEXT,
  payload         JSONB,
  processed       BOOLEAN DEFAULT false,
  processed_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT now()
);
