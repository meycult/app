-- ══════════════════════════════════════════════
--  MeyCult — Migration #4: Heroes + Oracle Follows
--  Run in Supabase SQL Editor
-- ══════════════════════════════════════════════

-- 1. Fix oracle_follows PK naming (drop + recreate)
DROP TABLE IF EXISTS public.oracle_follows CASCADE;

-- 2. Create heroes table
CREATE TABLE public.heroes (
  hero_id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  handle          text UNIQUE NOT NULL,
  name            text NOT NULL,
  title           text,
  hero_type       text NOT NULL DEFAULT 'person',
  alignment       text,
  cult            text NOT NULL,
  bio             text,
  slot_type       text NOT NULL,
  avatar_url      text,
  primary_virtue  text,
  secondary_virtue text,
  created_at      timestamptz DEFAULT now()
);

-- 3. Recreate oracle_follows with follow_id PK
CREATE TABLE public.oracle_follows (
  follow_id    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  oracle_id    uuid NOT NULL REFERENCES public.oracles(oracle_id) ON DELETE CASCADE,
  hero_id      uuid NOT NULL REFERENCES public.heroes(hero_id) ON DELETE CASCADE,
  followed_at  timestamptz DEFAULT now(),
  UNIQUE(oracle_id, hero_id)
);

CREATE INDEX idx_follows_oracle ON public.oracle_follows(oracle_id);
CREATE INDEX idx_follows_hero ON public.oracle_follows(hero_id);

-- 4. hero_items junction (display only — hero's pre-equipped items)
CREATE TABLE public.hero_items (
  hero_items_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hero_id       uuid NOT NULL REFERENCES public.heroes(hero_id) ON DELETE CASCADE,
  item_id       uuid NOT NULL REFERENCES public.items(item_id) ON DELETE CASCADE,
  UNIQUE(hero_id, item_id)
);

-- 5. Seed heroes — 10 person + 5 crypto + 3 nation
INSERT INTO public.heroes (handle, name, title, hero_type, alignment, cult, bio, slot_type, primary_virtue, secondary_virtue) VALUES
('@elonmusk', 'Elon Musk', 'The Technoking', 'person', 'CN', 'legion', 'CEO of Tesla and SpaceX. X owner. Crypto influencer. Mars colonist aspirant.', 'vision', 'wisdom', 'courage'),
('@realdonaldtrump', 'Donald Trump', 'The Deal Maker', 'person', 'LE', 'legion', '45th & 47th US President. Real estate mogul. Master of the deal.', 'narrative', 'courage', 'justice'),
('@gretathunberg', 'Greta Thunberg', 'Climate Crusader', 'person', 'NG', 'wardens', 'Environmental activist. Fridays for Future founder. UN speech icon.', 'anomaly', 'justice', 'temperance'),
('@sama', 'Sam Altman', 'The AI Oracle', 'person', 'LN', 'architects', 'OpenAI CEO. ChatGPT creator. AGI prophet. Nuclear fusion investor.', 'algorithm', 'wisdom', 'skill'),
('@putin', 'Vladimir Putin', 'The Strongman', 'person', 'LE', 'tribunal', 'Russian President. Ex-KGB. Judo black belt. Geopolitical chessmaster.', 'conduit', 'courage', 'prudence'),
('@taylorswift13', 'Taylor Swift', 'The Pop Sovereign', 'person', 'CG', 'operatives', '14x Grammy winner. Eras Tour billionaire. Economy-mover.', 'network', 'skill', 'justice'),
('@warrenbuffett', 'Warren Buffett', 'The Oracle of Omaha', 'person', 'LG', 'architects', 'Berkshire Hathaway CEO. Value investing legend. $147B net worth.', 'capital', 'prudence', 'wisdom'),
('@satoshi', 'Satoshi Nakamoto', 'The Phantom', 'person', 'TN', 'operatives', 'Bitcoin creator. Unknown identity. ~1M BTC untouched.', 'data', 'wisdom', 'skill'),
('@zuck', 'Mark Zuckerberg', 'The Metarchitect', 'person', 'LN', 'architects', 'Meta CEO. Facebook founder. Metaverse builder. Threads launcher.', 'cascade', 'wisdom', 'temperance'),
('@beyonce', 'Beyonce', 'Queen Bey', 'person', 'NG', 'monastics', '32x Grammy winner. Renaissance architect. Cultural icon.', 'resonance', 'justice', 'skill'),

-- Crypto Heroes
('@bitcoin', 'Bitcoin', 'Digital Gold', 'crypto', 'TN', 'operatives', 'The original cryptocurrency. Decentralized, scarce, and unstoppable. The benchmark for all digital value.', 'capital', 'wisdom', 'courage'),
('@ethereum', 'Ethereum', 'The World Computer', 'crypto', 'TN', 'architects', 'Programmable money and smart contracts. The foundation of DeFi, NFTs, and Web3.', 'algorithm', 'wisdom', 'skill'),
('@solana', 'Solana', 'Speed Demon', 'crypto', 'TN', 'operatives', 'High-performance L1 blockchain. Proof of History. The chain that never sleeps.', 'network', 'skill', 'courage'),
('@dogecoin', 'Dogecoin', 'The Meme Coin', 'crypto', 'CN', 'legion', 'Started as a joke. Became a movement. Much wow. Very market cap.', 'anomaly', 'courage', 'temperance'),
('@ripple', 'XRP', 'The Banker Coin', 'crypto', 'LN', 'tribunal', 'Cross-border payments and institutional settlement. The bridge between fiat worlds.', 'conduit', 'prudence', 'justice'),

-- Nation Heroes
('@usa', 'United States', 'The Superpower', 'nation', 'LG', 'legion', 'World largest economy. Military superpower. Tech innovation engine. Dollar hegemony.', 'narrative', 'courage', 'wisdom'),
('@china', 'China', 'The Dragon', 'nation', 'LN', 'architects', 'Manufacturing titan. Belt and Road architect. Rising technological superpower.', 'cascade', 'wisdom', 'prudence'),
('@russia', 'Russia', 'The Bear', 'nation', 'LE', 'legion', 'Energy giant. Nuclear arsenal. Geopolitical wildcard. Largest country by land mass.', 'conduit', 'courage', 'temperance');

-- 6. Seed hero virtues (18 heroes × 6 virtues = 108 rows)
INSERT INTO public.virtues (entity_type, entity_id, name, value)
SELECT 'hero', h.hero_id, v.name, v.value
FROM public.heroes h
CROSS JOIN (VALUES
  ('wisdom', 10), ('courage', 10), ('prudence', 10),
  ('skill', 10), ('temperance', 10), ('justice', 10)
) v(name, value)
ON CONFLICT (entity_type, entity_id, name) DO NOTHING;

-- 7. RLS
ALTER TABLE public.heroes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Heroes are viewable by everyone"
  ON public.heroes FOR SELECT
  TO anon, authenticated
  USING (true);

ALTER TABLE public.oracle_follows ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owners manage their follows"
  ON public.oracle_follows FOR ALL
  TO authenticated
  USING (oracle_id = auth.uid())
  WITH CHECK (oracle_id = auth.uid());

CREATE POLICY "Follows are viewable by everyone"
  ON public.oracle_follows FOR SELECT
  TO anon, authenticated
  USING (true);

ALTER TABLE public.hero_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Hero items are viewable by everyone"
  ON public.hero_items FOR SELECT
  TO anon, authenticated
  USING (true);

-- 8. Verify
SELECT 'migration #4 complete' as status;
SELECT hero_type, count(*) FROM public.heroes GROUP BY hero_type ORDER BY hero_type;
SELECT count(*) as hero_virtue_rows FROM public.virtues WHERE entity_type = 'hero';
