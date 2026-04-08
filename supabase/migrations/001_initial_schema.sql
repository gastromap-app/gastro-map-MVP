-- GastroMap MVP — Initial Schema
-- Run in Supabase SQL Editor

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ── Profiles ─────────────────────────────────────────────────────────────────
CREATE TABLE profiles (
  id           UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email        TEXT,
  name         TEXT,
  avatar_url   TEXT,
  role         TEXT DEFAULT 'user' CHECK (role IN ('user','admin','moderator')),
  foodie_dna   JSONB DEFAULT '{"cuisines":[],"vibes":[],"price_range":"","dietary":[]}',
  bio_sync_enabled BOOLEAN DEFAULT false,
  created_at   TIMESTAMPTZ DEFAULT now(),
  updated_at   TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own_profile"        ON profiles FOR ALL    USING (auth.uid() = id);
CREATE POLICY "admin_all_profiles" ON profiles FOR SELECT USING (get_my_role() = 'admin');

-- ── Locations ────────────────────────────────────────────────────────────────
CREATE TABLE locations (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title               TEXT NOT NULL,
  slug                TEXT UNIQUE,
  description         TEXT,
  address             TEXT,
  city                TEXT,
  country             TEXT DEFAULT 'Poland',
  lat                 NUMERIC(10,7),
  lng                 NUMERIC(10,7),
  category            TEXT DEFAULT 'restaurant' CHECK (category IN ('restaurant','cafe','bar','bakery','other')),
  cuisine_types       TEXT[] DEFAULT '{}',
  price_range         TEXT  CHECK (price_range IN ('$','$$','$$$','$$$$')),
  google_rating       NUMERIC(3,1),
  google_reviews_count INTEGER DEFAULT 0,
  image               TEXT,
  photos              TEXT[] DEFAULT '{}',
  tags                TEXT[] DEFAULT '{}',
  dietary_options     TEXT[] DEFAULT '{}',
  amenities           TEXT[] DEFAULT '{}',
  best_for            TEXT[] DEFAULT '{}',
  noise_level         TEXT  CHECK (noise_level IN ('quiet','moderate','lively','loud')),
  outdoor_seating     BOOLEAN DEFAULT false,
  pet_friendly        BOOLEAN DEFAULT false,
  child_friendly      BOOLEAN DEFAULT false,
  michelin_stars      SMALLINT DEFAULT 0,
  michelin_bib        BOOLEAN DEFAULT false,
  insider_tip         TEXT,
  what_to_try         TEXT,
  ai_context          TEXT,
  ai_keywords         TEXT[] DEFAULT '{}',
  embedding           vector(768),
  fts                 tsvector GENERATED ALWAYS AS
                      (to_tsvector('english', coalesce(title,'') || ' ' || coalesce(description,''))) STORED,
  opening_hours       JSONB,
  status              TEXT DEFAULT 'active' CHECK (status IN ('active','hidden','coming_soon')),
  created_by          UUID REFERENCES profiles(id),
  created_at          TIMESTAMPTZ DEFAULT now(),
  updated_at          TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX idx_locations_city    ON locations(city);
CREATE INDEX idx_locations_status  ON locations(status);
CREATE INDEX idx_locations_fts     ON locations USING GIN(fts);
CREATE INDEX idx_locations_embed   ON locations USING ivfflat(embedding vector_cosine_ops) WITH (lists = 100);

ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_read_locations"  ON locations FOR SELECT USING (status = 'active');
CREATE POLICY "admin_all_locations"    ON locations FOR ALL    USING (get_my_role() = 'admin');

-- ── User Favorites ───────────────────────────────────────────────────────────
CREATE TABLE user_favorites (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  location_id UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, location_id)
);
ALTER TABLE user_favorites ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own_favorites" ON user_favorites FOR ALL USING (auth.uid() = user_id);

-- ── User Visits ──────────────────────────────────────────────────────────────
CREATE TABLE user_visits (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  location_id UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
  visited_at  TIMESTAMPTZ DEFAULT now(),
  rating      SMALLINT CHECK (rating BETWEEN 1 AND 5),
  review_text TEXT,
  UNIQUE(user_id, location_id)
);
ALTER TABLE user_visits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own_visits" ON user_visits FOR ALL USING (auth.uid() = user_id);

-- ── Reviews ──────────────────────────────────────────────────────────────────
CREATE TABLE reviews (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  location_id UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
  rating      SMALLINT CHECK (rating BETWEEN 1 AND 5),
  review_text TEXT,
  status      TEXT DEFAULT 'pending' CHECK (status IN ('pending','published','rejected')),
  created_at  TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "published_reviews" ON reviews FOR SELECT USING (status = 'published');
CREATE POLICY "own_reviews"       ON reviews FOR ALL    USING (auth.uid() = user_id);
CREATE POLICY "admin_reviews"     ON reviews FOR ALL    USING (get_my_role() = 'admin');

-- ── Auto-create profile on signup ────────────────────────────────────────────
CREATE OR REPLACE FUNCTION handle_new_user() RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles(id, email, name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'name')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ── Role helper ──────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION get_my_role() RETURNS TEXT AS $$
  SELECT role FROM profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- ── Leaderboard function ─────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION get_leaderboard(p_limit INT DEFAULT 50)
RETURNS TABLE(user_id UUID, name TEXT, avatar_url TEXT, total_points BIGINT) AS $$
  SELECT p.id, p.name, p.avatar_url,
    (COUNT(DISTINCT v.location_id) * 10 + COUNT(DISTINCT r.id) * 25 + COUNT(DISTINCT f.location_id) * 5) AS total_points
  FROM profiles p
  LEFT JOIN user_visits    v ON v.user_id = p.id
  LEFT JOIN reviews        r ON r.user_id = p.id AND r.status = 'published'
  LEFT JOIN user_favorites f ON f.user_id = p.id
  GROUP BY p.id, p.name, p.avatar_url
  ORDER BY total_points DESC
  LIMIT p_limit;
$$ LANGUAGE sql STABLE SECURITY DEFINER;
