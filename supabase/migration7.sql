-- ══════════════════════════════════════════════
--  MeyCult — Migration #7: Rename tag→handle, display_name→alias
--  Run in Supabase SQL Editor
-- ══════════════════════════════════════════════

ALTER TABLE public.oracles RENAME COLUMN tag TO handle;
ALTER TABLE public.oracles RENAME COLUMN display_name TO alias;

ALTER TABLE public.oracle_onboardings RENAME COLUMN chosen_tag TO chosen_handle;
ALTER TABLE public.oracle_onboardings RENAME COLUMN chosen_display_name TO chosen_alias;

-- Update trigger
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
    oracle_id, email, full_name, avatar_url, handle
  ) VALUES (
    new.id, new.email,
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'avatar_url',
    split_part(new.email, '@', 1)
  );

  FOREACH v_name IN ARRAY v_virtues LOOP
    INSERT INTO public.virtues (entity_type, entity_id, name, value)
    VALUES ('oracle', new.id, v_name, 8);
  END LOOP;

  RETURN new;
END;
$$;

SELECT 'migration #7 complete' as status;
