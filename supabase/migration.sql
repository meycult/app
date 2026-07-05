-- ══════════════════════════════════════════════
--  MeyCult — Profile Database Migration
--  Run in Supabase SQL Editor
-- ══════════════════════════════════════════════

-- ── STEP 0: Tear down old schema ──

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP TABLE IF EXISTS public.oracles CASCADE;

-- ── STEP 1: oracles — Core player table ──

CREATE TABLE public.oracles (
  oracle_id              uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username               text UNIQUE,
  email                  text,
  full_name              text,
  avatar_url             text,
  level                  int DEFAULT 1,
  xp                     int DEFAULT 0,
  cult                   text DEFAULT 'TODO: SET REAL CULT AFTER ONBOARDING',
  skill_points           int DEFAULT 0,
  glyph                  int DEFAULT 0,
  fate                   int DEFAULT 0,
  title                  text,
  frame                  text,
  name_color             text,
  profile_background     text,
  prediction_flair       text,
  avatar_decoration      text,
  badge_effect           text,
  starter_pack_purchased boolean DEFAULT false,
  onboarding_complete    boolean DEFAULT false,
  status                 text DEFAULT 'active',
  joined_at              timestamptz DEFAULT now(),
  created_at             timestamptz DEFAULT now(),
  updated_at             timestamptz DEFAULT now()
);

-- ── STEP 2: virtues — Reusable EAV table ──

CREATE TABLE public.virtues (
  virtue_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type  text NOT NULL,
  entity_id    uuid NOT NULL,
  name         text NOT NULL,
  value        int NOT NULL DEFAULT 8,
  UNIQUE(entity_type, entity_id, name)
);

CREATE INDEX idx_virtues_entity ON public.virtues(entity_type, entity_id);

-- ── STEP 3: items — Item catalog (empty for now) ──

CREATE TABLE public.items (
  item_id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name              text NOT NULL,
  description       text,
  icon              text,
  flavor_text       text,
  item_class        text NOT NULL,
  slot_type         text NOT NULL,
  rarity            text NOT NULL,
  stat_wisdom       int DEFAULT 0,
  stat_courage      int DEFAULT 0,
  stat_prudence     int DEFAULT 0,
  stat_skill        int DEFAULT 0,
  stat_temperance   int DEFAULT 0,
  stat_justice      int DEFAULT 0,
  passive_cost      int DEFAULT 0,
  unique_name       text,
  unique_desc       text,
  unique_mechanic   text,
  unique_value      float,
  unique_target     text,
  source            text DEFAULT 'quest_loot',
  created_at        timestamptz DEFAULT now()
);

-- ── STEP 4: oracle_inventory — Items owned ──

CREATE TABLE public.oracle_inventory (
  inventory_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  oracle_id    uuid NOT NULL REFERENCES public.oracles(oracle_id) ON DELETE CASCADE,
  item_id      uuid NOT NULL REFERENCES public.items(item_id) ON DELETE CASCADE,
  acquired_at  timestamptz DEFAULT now(),
  source       text DEFAULT 'quest_loot'
);

CREATE INDEX idx_inventory_oracle ON public.oracle_inventory(oracle_id);

-- ── STEP 5: oracle_equipped — Slotted items ──

CREATE TABLE public.oracle_equipped (
  equipped_id  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  oracle_id    uuid NOT NULL REFERENCES public.oracles(oracle_id) ON DELETE CASCADE,
  slot_type    text NOT NULL,
  inventory_id uuid REFERENCES public.oracle_inventory(inventory_id) ON DELETE SET NULL,
  equipped_at  timestamptz DEFAULT now(),
  UNIQUE(oracle_id, slot_type)
);

CREATE INDEX idx_equipped_oracle ON public.oracle_equipped(oracle_id);

-- ── STEP 6: quests — Quest definitions ──

CREATE TABLE public.quests (
  quest_id        uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question        text NOT NULL,
  description     text,
  category        text NOT NULL,
  yes_probability int DEFAULT 50,
  no_probability  int DEFAULT 50,
  volume          int DEFAULT 0,
  engagement      int DEFAULT 0,
  closes_in       text DEFAULT 'TODO',
  status          text DEFAULT 'OPEN',
  created_at      timestamptz DEFAULT now(),
  resolved_at     timestamptz
);

-- ── STEP 7: wagers — Oracle bets (was predictions) ──

CREATE TABLE public.wagers (
  wager_id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  oracle_id           uuid NOT NULL REFERENCES public.oracles(oracle_id) ON DELETE CASCADE,
  quest_id            uuid NOT NULL REFERENCES public.quests(quest_id),
  outcome             text NOT NULL,
  amount              int NOT NULL,
  entry_probability   int NOT NULL,
  yes_prob_at_entry   int,
  no_prob_at_entry    int,
  result              text DEFAULT 'PENDING',
  payout              int DEFAULT 0,
  net_profit          int DEFAULT 0,
  equipped_snapshot   jsonb DEFAULT '[]',
  virtue_snapshot     jsonb DEFAULT '[]',
  placed_at           timestamptz DEFAULT now(),
  resolved_at         timestamptz
);

CREATE INDEX idx_wagers_oracle ON public.wagers(oracle_id);
CREATE INDEX idx_wagers_quest ON public.wagers(quest_id);
CREATE INDEX idx_wagers_result ON public.wagers(result);
CREATE INDEX idx_wagers_placed ON public.wagers(placed_at DESC);

-- ── STEP 8: badges — Badge chain definitions ──

CREATE TABLE public.badges (
  badge_id    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text NOT NULL,
  category    text NOT NULL,
  description text,
  icon        text,
  tiers       jsonb NOT NULL DEFAULT '[]',
  created_at  timestamptz DEFAULT now()
);

-- ── STEP 9: oracle_badges — Player badge progress ──

CREATE TABLE public.oracle_badges (
  oracle_badge_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  oracle_id       uuid NOT NULL REFERENCES public.oracles(oracle_id) ON DELETE CASCADE,
  badge_id        uuid NOT NULL REFERENCES public.badges(badge_id) ON DELETE CASCADE,
  tier_index      int NOT NULL DEFAULT 0,
  unlocked        boolean DEFAULT false,
  progress        int DEFAULT 0,
  unlocked_at     timestamptz,
  UNIQUE(oracle_id, badge_id, tier_index)
);

CREATE INDEX idx_ob_oracle ON public.oracle_badges(oracle_id);

-- ── STEP 10: Trigger — auto-create oracle row + virtues on signup ──

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
  v_name text;
  v_virtues text[] := ARRAY['wisdom','courage','prudence','skill','temperance','justice'];
BEGIN
  INSERT INTO public.oracles (
    oracle_id, email, full_name, avatar_url, username
  ) VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'avatar_url',
    COALESCE(
      new.raw_user_meta_data ->> 'full_name',
      split_part(new.email, '@', 1)
    )
  );

  FOREACH v_name IN ARRAY v_virtues LOOP
    INSERT INTO public.virtues (entity_type, entity_id, name, value)
    VALUES ('oracle', new.id, v_name, 8);
  END LOOP;

  RETURN new;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ── STEP 11: Verify ──

SELECT 'migration complete — 9 tables created' as status;
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
ORDER BY table_name;
