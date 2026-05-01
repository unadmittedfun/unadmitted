
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS avatar_url TEXT,
  ADD COLUMN IF NOT EXISTS handle_suffix TEXT;

UPDATE public.profiles SET handle_suffix = substring(handle from 6) WHERE handle_suffix IS NULL;

ALTER TABLE public.profiles ALTER COLUMN handle_suffix SET NOT NULL;

CREATE OR REPLACE FUNCTION public.update_my_handle_suffix(_suffix TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid UUID := auth.uid();
  clean TEXT;
  new_handle TEXT;
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  clean := lower(trim(_suffix));
  IF clean !~ '^[a-z0-9_]{3,20}$' THEN
    RAISE EXCEPTION 'Suffix must be 3-20 chars: letters, numbers, underscore';
  END IF;
  new_handle := 'anon_' || clean;
  IF EXISTS (SELECT 1 FROM public.profiles WHERE handle = new_handle AND id <> uid) THEN
    RAISE EXCEPTION 'That handle is already taken';
  END IF;
  UPDATE public.profiles SET handle = new_handle, handle_suffix = clean WHERE id = uid;
  RETURN new_handle;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.update_my_handle_suffix(TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.update_my_handle_suffix(TEXT) TO authenticated;

-- Avatars storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Avatars are publicly readable"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

CREATE POLICY "Users upload own avatar"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users update own avatar"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users delete own avatar"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
