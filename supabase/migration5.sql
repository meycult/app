-- ══════════════════════════════════════════════
--  MeyCult — Migration #5: Display Name
--  Run in Supabase SQL Editor
-- ══════════════════════════════════════════════

ALTER TABLE public.oracles ADD COLUMN IF NOT EXISTS display_name text;
ALTER TABLE public.oracle_onboardings ADD COLUMN IF NOT EXISTS chosen_display_name text;

SELECT 'migration #5 complete' as status;
