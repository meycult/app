-- ══════════════════════════════════════════════
--  MeyFate — Database Setup
--  Run in Supabase SQL Editor
-- ══════════════════════════════════════════════

-- 1. Create oracles table (extends auth.users)
CREATE TABLE IF NOT EXISTS public.oracles (
  id         uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email      text,
  full_name  text,
  avatar_url text,
  onboarding_complete boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 2. Enable RLS
ALTER TABLE public.oracles ENABLE ROW LEVEL SECURITY;

-- 3. RLS Policies

-- Everyone can view profiles
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.oracles;
CREATE POLICY "Public profiles are viewable by everyone"
  ON public.oracles FOR SELECT
  TO anon, authenticated
  USING (true);

-- Users can insert their own profile
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.oracles;
CREATE POLICY "Users can insert their own profile"
  ON public.oracles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Users can update their own profile
DROP POLICY IF EXISTS "Users can update their own profile" ON public.oracles;
CREATE POLICY "Users can update their own profile"
  ON public.oracles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- 4. Trigger: auto-create oracles row on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.oracles (id, email, full_name, avatar_url)
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'avatar_url'
  );
  RETURN new;
END;
$$;

-- 5. Attach trigger to auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 6. Verify
SELECT 'Setup complete! oracles table ready.' as status;
