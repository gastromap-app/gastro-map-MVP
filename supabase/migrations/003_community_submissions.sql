-- Community Submissions — user-suggested locations
CREATE TABLE user_submissions (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id            UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name               TEXT NOT NULL,
  address            TEXT,
  city               TEXT,
  country            TEXT DEFAULT 'Poland',
  lat                NUMERIC(10,7),
  lng                NUMERIC(10,7),
  category           TEXT,
  website_url        TEXT,
  description        TEXT,
  cuisine_types      TEXT[] DEFAULT '{}',
  tags               TEXT[] DEFAULT '{}',
  dietary_options    TEXT[] DEFAULT '{}',
  amenities          TEXT[] DEFAULT '{}',
  best_for           TEXT[] DEFAULT '{}',
  noise_level        TEXT,
  price_range        TEXT,
  outdoor_seating    BOOLEAN,
  pet_friendly       BOOLEAN,
  must_try           TEXT,     -- 🔒 user only
  insider_tip        TEXT,     -- 🔒 user only
  photos             TEXT[] DEFAULT '{}',
  ai_check_result    JSONB,
  status             TEXT DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  rejection_reason   TEXT,
  reviewed_by        UUID REFERENCES profiles(id),
  reviewed_at        TIMESTAMPTZ,
  location_id        UUID REFERENCES locations(id),
  submitter_confirmed BOOLEAN DEFAULT false,
  created_at         TIMESTAMPTZ DEFAULT now(),
  updated_at         TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE user_submissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own_submissions"    ON user_submissions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "create_submission"  ON user_submissions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "admin_submissions"  ON user_submissions FOR ALL    USING (get_my_role() = 'admin');
