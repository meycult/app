-- ══════════════════════════════════════════════
--  MeyCult — Database Migration
--  Creates clean schema: players, oracles, player_onboarding
--  Drops old tables: oracle_onboardings, heroes, virtues
--  ══════════════════════════════════════════════

-- Drop old tables
DROP TABLE IF EXISTS oracle_onboardings CASCADE;
DROP TABLE IF EXISTS heroes CASCADE;
DROP TABLE IF EXISTS virtues CASCADE;

-- Drop old oracles table (replaced by players + oracles)
DROP TABLE IF EXISTS oracles CASCADE;

-- Players — core identity table (auth.users linked)
CREATE TABLE players (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  handle TEXT UNIQUE NOT NULL,
  alias TEXT,
  avatar_url TEXT,
  onboarding_complete BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Oracles — game profile extension (linked to player)
CREATE TABLE oracles (
  player_id UUID PRIMARY KEY REFERENCES players(id) ON DELETE CASCADE,
  cult TEXT NOT NULL,
  level INTEGER DEFAULT 1,
  xp INTEGER DEFAULT 0
);

-- Player onboarding — wizard progress
CREATE TABLE player_onboarding (
  player_id UUID PRIMARY KEY REFERENCES players(id) ON DELETE CASCADE,
  step INTEGER DEFAULT 0,
  chosen_handle TEXT,
  chosen_alias TEXT,
  chosen_cult TEXT
);

-- Row-Level Security
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE oracles ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_onboarding ENABLE ROW LEVEL SECURITY;

-- Players: read/write own row only
CREATE POLICY "players_self" ON players
  FOR ALL USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Oracles: owner can read/write; anyone can read (public profile)
CREATE POLICY "oracles_self" ON oracles
  FOR ALL USING (player_id = auth.uid())
  WITH CHECK (player_id = auth.uid());

CREATE POLICY "oracles_read_public" ON oracles
  FOR SELECT USING (TRUE);

-- Player onboarding: owner only
CREATE POLICY "player_onboarding_self" ON player_onboarding
  FOR ALL USING (player_id = auth.uid())
  WITH CHECK (player_id = auth.uid());
