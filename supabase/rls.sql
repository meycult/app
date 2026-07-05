-- ══════════════════════════════════════════════
--  MeyCult — RLS Policies
--  Run AFTER migration.sql in Supabase SQL Editor
-- ══════════════════════════════════════════════

-- ── oracles ──

ALTER TABLE public.oracles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.oracles;
CREATE POLICY "Public profiles are viewable by everyone"
  ON public.oracles FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.oracles;
CREATE POLICY "Users can insert their own profile"
  ON public.oracles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = oracle_id);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.oracles;
CREATE POLICY "Users can update their own profile"
  ON public.oracles FOR UPDATE
  TO authenticated
  USING (auth.uid() = oracle_id)
  WITH CHECK (auth.uid() = oracle_id);

-- ── virtues ──

ALTER TABLE public.virtues ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Virtues are viewable by everyone" ON public.virtues;
CREATE POLICY "Virtues are viewable by everyone"
  ON public.virtues FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "Users can manage their own virtues" ON public.virtues;
CREATE POLICY "Users can manage their own virtues"
  ON public.virtues FOR ALL
  TO authenticated
  USING (entity_type = 'oracle' AND entity_id = auth.uid())
  WITH CHECK (entity_type = 'oracle' AND entity_id = auth.uid());

-- ── items ──

ALTER TABLE public.items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Items are viewable by everyone" ON public.items;
CREATE POLICY "Items are viewable by everyone"
  ON public.items FOR SELECT
  TO anon, authenticated
  USING (true);

-- ── oracle_inventory ──

ALTER TABLE public.oracle_inventory ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Owners can manage their inventory" ON public.oracle_inventory;
CREATE POLICY "Owners can manage their inventory"
  ON public.oracle_inventory FOR ALL
  TO authenticated
  USING (oracle_id = auth.uid())
  WITH CHECK (oracle_id = auth.uid());

-- ── oracle_equipped ──

ALTER TABLE public.oracle_equipped ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Owners can manage their equipment" ON public.oracle_equipped;
CREATE POLICY "Owners can manage their equipment"
  ON public.oracle_equipped FOR ALL
  TO authenticated
  USING (oracle_id = auth.uid())
  WITH CHECK (oracle_id = auth.uid());

DROP POLICY IF EXISTS "Equipment is viewable by everyone" ON public.oracle_equipped;
CREATE POLICY "Equipment is viewable by everyone"
  ON public.oracle_equipped FOR SELECT
  TO anon, authenticated
  USING (true);

-- ── quests ──

ALTER TABLE public.quests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Quests are viewable by everyone" ON public.quests;
CREATE POLICY "Quests are viewable by everyone"
  ON public.quests FOR SELECT
  TO anon, authenticated
  USING (true);

-- ── wagers ──

ALTER TABLE public.wagers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Owners can view their own wagers" ON public.wagers;
CREATE POLICY "Owners can view their own wagers"
  ON public.wagers FOR SELECT
  TO authenticated
  USING (oracle_id = auth.uid());

DROP POLICY IF EXISTS "Owners can place wagers" ON public.wagers;
CREATE POLICY "Owners can place wagers"
  ON public.wagers FOR INSERT
  TO authenticated
  WITH CHECK (oracle_id = auth.uid());

DROP POLICY IF EXISTS "Owners can update their wagers" ON public.wagers;
CREATE POLICY "Owners can update their wagers"
  ON public.wagers FOR UPDATE
  TO authenticated
  USING (oracle_id = auth.uid())
  WITH CHECK (oracle_id = auth.uid());

-- ── badges ──

ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Badges are viewable by everyone" ON public.badges;
CREATE POLICY "Badges are viewable by everyone"
  ON public.badges FOR SELECT
  TO anon, authenticated
  USING (true);

-- ── oracle_badges ──

ALTER TABLE public.oracle_badges ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Owners can manage their badge progress" ON public.oracle_badges;
CREATE POLICY "Owners can manage their badge progress"
  ON public.oracle_badges FOR ALL
  TO authenticated
  USING (oracle_id = auth.uid())
  WITH CHECK (oracle_id = auth.uid());

DROP POLICY IF EXISTS "Badge progress is viewable by everyone" ON public.oracle_badges;
CREATE POLICY "Badge progress is viewable by everyone"
  ON public.oracle_badges FOR SELECT
  TO anon, authenticated
  USING (true);

-- ── Verify ──

SELECT 'RLS policies applied' as status;
SELECT tablename, policyname, permissive, cmd
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, cmd;
