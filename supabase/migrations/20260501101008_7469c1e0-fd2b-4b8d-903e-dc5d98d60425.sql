CREATE OR REPLACE FUNCTION public.community_member_count()
RETURNS integer
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COUNT(*)::int FROM public.profiles
  WHERE community_id = public.my_community_id();
$$;

REVOKE EXECUTE ON FUNCTION public.community_member_count() FROM anon;
GRANT EXECUTE ON FUNCTION public.community_member_count() TO authenticated;