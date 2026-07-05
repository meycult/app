-- ══════════════════════════════════════════════
--  MeyCult — Migration #3: Rename attributes → virtues
--  Run in Supabase SQL Editor
-- ══════════════════════════════════════════════

-- 1. Drop old trigger (depends on attributes)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- 2. Drop old function
DROP FUNCTION IF EXISTS public.handle_new_user();

-- 3. Drop old attributes table
DROP TABLE IF EXISTS public.attributes CASCADE;

-- 4. Create virtues table
CREATE TABLE public.virtues (
  virtue_id    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type  text NOT NULL,
  entity_id    uuid NOT NULL,
  name         text NOT NULL,
  value        int NOT NULL DEFAULT 8,
  UNIQUE(entity_type, entity_id, name)
);

CREATE INDEX idx_virtues_entity ON public.virtues(entity_type, entity_id);

-- 5. Recreate trigger function
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

-- 6. Recreate trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 7. RLS
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

-- 8. Backfill virtues for existing oracle
INSERT INTO public.virtues (entity_type, entity_id, name, value)
SELECT 'oracle', 'd4edd7d1-6795-40ee-a13e-720c8f9eee62', v.name, 8
FROM (VALUES
  ('wisdom'),('courage'),('prudence'),('skill'),('temperance'),('justice')
) v(name)
ON CONFLICT (entity_type, entity_id, name) DO NOTHING;

-- 9. Verify
SELECT 'migration #3 complete — attributes renamed to virtues' as status;
SELECT count(*) as virtue_count FROM public.virtues;
