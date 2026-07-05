-- ══════════════════════════════════════════════
--  MeyCult — Migration #6: Tag + Display Name
--  Run in Supabase SQL Editor
-- ══════════════════════════════════════════════

-- 1. Add tag column, drop username
ALTER TABLE public.oracles ADD COLUMN IF NOT EXISTS tag text;
ALTER TABLE public.oracles DROP COLUMN IF EXISTS username;
ALTER TABLE public.oracles ADD UNIQUE (tag);

-- 2. Update oracle_onboardings
ALTER TABLE public.oracle_onboardings DROP COLUMN IF EXISTS chosen_username;
ALTER TABLE public.oracle_onboardings ADD COLUMN IF NOT EXISTS chosen_tag text;

-- 3. Update trigger function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
  v_name text;
  v_virtues text[] := ARRAY['wisdom','courage','prudence','skill','temperance','justice'];
  v_tag text;
BEGIN
  v_tag := split_part(new.email, '@', 1);

  INSERT INTO public.oracles (
    oracle_id, email, full_name, avatar_url, tag
  ) VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'avatar_url',
    v_tag
  );

  FOREACH v_name IN ARRAY v_virtues LOOP
    INSERT INTO public.virtues (entity_type, entity_id, name, value)
    VALUES ('oracle', new.id, v_name, 8);
  END LOOP;

  RETURN new;
END;
$$;

-- 4. Update existing oracle row with tag
UPDATE public.oracles SET tag = split_part(email, '@', 1) WHERE tag IS NULL;

SELECT 'migration #6 complete' as status;
