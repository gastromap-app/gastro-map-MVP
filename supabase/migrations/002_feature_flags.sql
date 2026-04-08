-- Feature Flags — toggle features without deploy
CREATE TABLE feature_flags (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key         TEXT UNIQUE NOT NULL,
  enabled     BOOLEAN DEFAULT false,
  description TEXT,
  updated_by  UUID REFERENCES profiles(id),
  updated_at  TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE feature_flags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_read_flags" ON feature_flags FOR SELECT USING (true);
CREATE POLICY "admin_write_flags" ON feature_flags FOR ALL USING (get_my_role() = 'admin');

-- Seed default flags
INSERT INTO feature_flags (key, enabled, description) VALUES
  ('community_submissions', true,  'Let users suggest new locations'),
  ('donations',             true,  'Show /donate page and Stripe donations'),
  ('subscription_plans',    false, 'STUB: Enable only after completing §16.7 checklist'),
  ('bio_sync',              false, 'STUB: Apple Health / Google Fit integration'),
  ('voice_search',          false, 'STUB: Microphone input in search'),
  ('dine_with_me',          false, 'STUB: Social dining radar'),
  ('maintenance_mode',      false, 'Block all app routes for users')
ON CONFLICT (key) DO NOTHING;
