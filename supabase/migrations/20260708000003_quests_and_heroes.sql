-- ══════════════════════════════════════════════
--  MeyCult — Quests, Heroes, Markets, Wagers
--  Tables for Temple + Quest Detail pages
-- ══════════════════════════════════════════════

-- 1. Heroes — templates
CREATE TABLE heroes (
  hero_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  handle TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  title TEXT,
  bio TEXT,
  cult TEXT NOT NULL,
  avatar_url TEXT,
  virtues JSONB NOT NULL DEFAULT '{"wisdom":8,"courage":8,"prudence":8,"skill":8,"temperance":8,"justice":8}',
  mp INTEGER DEFAULT 100,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Player heroes — player's instances
CREATE TABLE player_heroes (
  player_hero_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  hero_id UUID NOT NULL REFERENCES heroes(hero_id) ON DELETE CASCADE,
  level INTEGER DEFAULT 1,
  xp INTEGER DEFAULT 0,
  virtues JSONB NOT NULL DEFAULT '{"wisdom":8,"courage":8,"prudence":8,"skill":8,"temperance":8,"justice":8}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(player_id, hero_id)
);

-- 3. Items — includes relics (slot_type = 'relic')
CREATE TABLE items (
  item_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  flavor_text TEXT,
  item_class TEXT NOT NULL,
  slot_type TEXT NOT NULL,
  rarity TEXT NOT NULL,
  stat_bonuses JSONB DEFAULT '{}',
  passive_cost INTEGER DEFAULT 0,
  unique_effect JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Hero items — equipped gear, nullable player_id for hero defaults
CREATE TABLE hero_items (
  hero_item_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hero_id UUID NOT NULL REFERENCES heroes(hero_id) ON DELETE CASCADE,
  item_id UUID NOT NULL REFERENCES items(item_id) ON DELETE CASCADE,
  slot_type TEXT NOT NULL,
  player_id UUID REFERENCES players(id),
  UNIQUE NULLS NOT DISTINCT(player_id, hero_id, slot_type)
);

-- 5. Quests — prediction market definitions
CREATE TABLE quests (
  quest_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  status TEXT DEFAULT 'OPEN' CHECK (status IN ('OPEN','LOCKED','RESOLVED_YES','RESOLVED_NO','SETTLED')),
  volume BIGINT DEFAULT 0,
  engagement INTEGER DEFAULT 0,
  closes_in TIMESTAMPTZ,
  rarity_density INTEGER DEFAULT 50,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ
);

-- 6. Quest-Hero links
CREATE TABLE quest_heroes (
  quest_id UUID NOT NULL REFERENCES quests(quest_id) ON DELETE CASCADE,
  hero_id UUID NOT NULL REFERENCES heroes(hero_id) ON DELETE CASCADE,
  PRIMARY KEY (quest_id, hero_id)
);

-- 7. Quest markets — odds + volume
CREATE TABLE quest_markets (
  market_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quest_id UUID UNIQUE NOT NULL REFERENCES quests(quest_id) ON DELETE CASCADE,
  yes_probability NUMERIC DEFAULT 50,
  no_probability NUMERIC DEFAULT 50,
  yes_volume BIGINT DEFAULT 0,
  no_volume BIGINT DEFAULT 0,
  last_updated TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Loot table entries
CREATE TABLE loot_table_entries (
  loot_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quest_id UUID NOT NULL REFERENCES quests(quest_id) ON DELETE CASCADE,
  item_id UUID REFERENCES items(item_id),
  item_name TEXT,
  item_rarity TEXT,
  chance NUMERIC NOT NULL
);

-- 9. Quest wagers — player bets
CREATE TABLE quest_wagers (
  wager_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quest_id UUID NOT NULL REFERENCES quests(quest_id) ON DELETE CASCADE,
  player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  player_hero_id UUID REFERENCES player_heroes(player_hero_id),
  outcome TEXT NOT NULL CHECK (outcome IN ('YES','NO')),
  amount INTEGER NOT NULL,
  entry_probability NUMERIC,
  result TEXT DEFAULT 'PENDING' CHECK (result IN ('PENDING','WON','LOST')),
  payout INTEGER DEFAULT 0,
  net_profit INTEGER DEFAULT 0,
  placed_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ
);

-- 10. Quest comments
CREATE TABLE quest_comments (
  comment_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quest_id UUID NOT NULL REFERENCES quests(quest_id) ON DELETE CASCADE,
  player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES quest_comments(comment_id),
  text TEXT NOT NULL,
  upvotes INTEGER DEFAULT 0,
  downvotes INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. Quest activities
CREATE TABLE quest_activities (
  activity_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quest_id UUID NOT NULL REFERENCES quests(quest_id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  text TEXT,
  player_id UUID REFERENCES players(id),
  amount NUMERIC,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. Tier vote options
CREATE TABLE tier_vote_options (
  option_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quest_id UUID NOT NULL REFERENCES quests(quest_id) ON DELETE CASCADE,
  tier TEXT NOT NULL,
  label TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'active',
  vote_count INTEGER DEFAULT 0
);

-- ══════════════════════════════════════════════
--  RLS Policies
-- ══════════════════════════════════════════════

ALTER TABLE heroes ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_heroes ENABLE ROW LEVEL SECURITY;
ALTER TABLE items ENABLE ROW LEVEL SECURITY;
ALTER TABLE hero_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE quests ENABLE ROW LEVEL SECURITY;
ALTER TABLE quest_heroes ENABLE ROW LEVEL SECURITY;
ALTER TABLE quest_markets ENABLE ROW LEVEL SECURITY;
ALTER TABLE loot_table_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE quest_wagers ENABLE ROW LEVEL SECURITY;
ALTER TABLE quest_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE quest_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE tier_vote_options ENABLE ROW LEVEL SECURITY;

-- Public read for reference data
CREATE POLICY "heroes_read_public" ON heroes FOR SELECT USING (TRUE);
CREATE POLICY "items_read_public" ON items FOR SELECT USING (TRUE);
CREATE POLICY "hero_items_read_public" ON hero_items FOR SELECT USING (TRUE);
CREATE POLICY "quests_read_public" ON quests FOR SELECT USING (TRUE);
CREATE POLICY "quest_heroes_read_public" ON quest_heroes FOR SELECT USING (TRUE);
CREATE POLICY "quest_markets_read_public" ON quest_markets FOR SELECT USING (TRUE);
CREATE POLICY "loot_table_read_public" ON loot_table_entries FOR SELECT USING (TRUE);
CREATE POLICY "quest_comments_read_public" ON quest_comments FOR SELECT USING (TRUE);
CREATE POLICY "quest_activities_read_public" ON quest_activities FOR SELECT USING (TRUE);
CREATE POLICY "tier_vote_options_read_public" ON tier_vote_options FOR SELECT USING (TRUE);

-- Owner-only for player-specific data
CREATE POLICY "player_heroes_self" ON player_heroes FOR ALL USING (player_id = auth.uid());
CREATE POLICY "hero_items_self" ON hero_items FOR ALL USING (player_id = auth.uid() OR player_id IS NULL);
CREATE POLICY "quest_wagers_self" ON quest_wagers FOR ALL USING (player_id = auth.uid());
CREATE POLICY "quest_comments_self" ON quest_comments FOR ALL USING (player_id = auth.uid());
CREATE POLICY "quest_wagers_read_public" ON quest_wagers FOR SELECT USING (TRUE);
