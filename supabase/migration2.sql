-- ══════════════════════════════════════════════
--  MeyCult — Migration #2: Onboarding + Backfill
--  Run in Supabase SQL Editor
-- ══════════════════════════════════════════════

-- ── 1. Backfill oracle row for existing user ──

INSERT INTO public.oracles (oracle_id, email, username)
VALUES (
  'd4edd7d1-6795-40ee-a13e-720c8f9eee62',
  'willmeyburgh@gmail.com',
  'GodEmperor'
)
ON CONFLICT (oracle_id) DO NOTHING;

INSERT INTO public.virtues (entity_type, entity_id, name, value)
SELECT 'oracle', 'd4edd7d1-6795-40ee-a13e-720c8f9eee62', v.name, 8
FROM (VALUES
  ('wisdom'),('courage'),('prudence'),('skill'),('temperance'),('justice')
) v(name)
ON CONFLICT (entity_type, entity_id, name) DO NOTHING;

-- ── 2. oracle_onboardings — Temp multi-step onboarding ──

CREATE TABLE public.oracle_onboardings (
  onboarding_id   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  oracle_id       uuid NOT NULL REFERENCES public.oracles(oracle_id) ON DELETE CASCADE,
  step            int NOT NULL DEFAULT 0,
  chosen_username text,
  chosen_cult     text,
  completed       boolean DEFAULT false,
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now(),
  UNIQUE(oracle_id)
);

ALTER TABLE public.oracle_onboardings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Owners manage their onboarding" ON public.oracle_onboardings;
CREATE POLICY "Owners manage their onboarding"
  ON public.oracle_onboardings FOR ALL
  TO authenticated
  USING (oracle_id = auth.uid())
  WITH CHECK (oracle_id = auth.uid());

-- ── Verify ──

SELECT 'migration #2 complete' as status;
SELECT count(*) as oracle_count FROM public.oracles;
SELECT count(*) as attr_count FROM public.virtues;
