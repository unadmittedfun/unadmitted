
-- Drop the security-definer view; use column-level grants instead
DROP VIEW IF EXISTS public.communities_public;

-- Restore broad SELECT for both anon and authenticated, but exclude email_domain via column grants
DROP POLICY IF EXISTS "Authenticated read communities" ON public.communities;
CREATE POLICY "Communities are public read"
  ON public.communities FOR SELECT TO anon, authenticated
  USING (true);

-- Re-grant SELECT but only on non-sensitive columns
GRANT SELECT (id, slug, name, short_name, tagline, accent_hsl, primary_hsl, hashtag, is_active, created_at)
  ON public.communities TO anon, authenticated;
-- email_domain is intentionally excluded; only service_role can read it.

-- community_for_email_domain only needed for anon signup flow
REVOKE EXECUTE ON FUNCTION public.community_for_email_domain(text) FROM authenticated;
