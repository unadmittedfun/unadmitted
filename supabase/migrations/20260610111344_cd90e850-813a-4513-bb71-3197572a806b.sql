
-- 1. communities: restrict direct table reads to authenticated users
DROP POLICY IF EXISTS "Communities are public read" ON public.communities;
CREATE POLICY "Authenticated read communities"
  ON public.communities FOR SELECT TO authenticated
  USING (true);

REVOKE SELECT ON public.communities FROM anon;

-- public view (no email_domain) for anon + authenticated
CREATE OR REPLACE VIEW public.communities_public
WITH (security_invoker = false) AS
SELECT id, slug, name, short_name, tagline, accent_hsl, primary_hsl, hashtag, is_active, created_at
FROM public.communities
WHERE is_active = true;

GRANT SELECT ON public.communities_public TO anon, authenticated;

-- RPC for email-domain lookup (signup flow, anon)
CREATE OR REPLACE FUNCTION public.community_for_email_domain(_domain text)
RETURNS TABLE (id uuid, slug text, name text, short_name text, tagline text, accent_hsl text, primary_hsl text, hashtag text, is_active boolean)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id, slug, name, short_name, tagline, accent_hsl, primary_hsl, hashtag, is_active
  FROM public.communities
  WHERE email_domain = lower(_domain) AND is_active = true
  LIMIT 1
$$;

REVOKE ALL ON FUNCTION public.community_for_email_domain(text) FROM public;
GRANT EXECUTE ON FUNCTION public.community_for_email_domain(text) TO anon, authenticated;

-- 2. Lock down SECURITY DEFINER helpers; keep only what RLS / triggers need
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.my_community_id() FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.community_member_count() FROM PUBLIC, anon;

-- Trigger / internal functions: not user-callable
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.auto_hide_on_reports() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.ensure_marketing_bot_conversation() FROM PUBLIC, anon, authenticated;

-- Email queue helpers: service_role only
REVOKE EXECUTE ON FUNCTION public.enqueue_email(text, jsonb) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.read_email_batch(text, integer, integer) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.delete_email(text, bigint) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.move_to_dlq(text, text, bigint, jsonb) FROM PUBLIC, anon, authenticated;

-- 3. Pin search_path on email queue helpers
ALTER FUNCTION public.enqueue_email(text, jsonb) SET search_path = public, pgmq;
ALTER FUNCTION public.read_email_batch(text, integer, integer) SET search_path = public, pgmq;
ALTER FUNCTION public.delete_email(text, bigint) SET search_path = public, pgmq;
ALTER FUNCTION public.move_to_dlq(text, text, bigint, jsonb) SET search_path = public, pgmq;

-- 4. Storage: remove broad listing on public buckets; files still served via public URLs
DROP POLICY IF EXISTS "Avatars are publicly readable" ON storage.objects;
DROP POLICY IF EXISTS "Post media publicly readable" ON storage.objects;

-- 5. Add missing UPDATE policy on post-media
CREATE POLICY "Users update own post media"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'post-media' AND (auth.uid())::text = (storage.foldername(name))[1])
  WITH CHECK (bucket_id = 'post-media' AND (auth.uid())::text = (storage.foldername(name))[1]);
