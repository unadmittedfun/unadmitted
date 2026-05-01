
REVOKE EXECUTE ON FUNCTION public.my_community_id() FROM anon, authenticated, public;
GRANT  EXECUTE ON FUNCTION public.my_community_id() TO authenticated;

REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM anon, public;
GRANT  EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.update_my_handle_suffix(text) FROM anon, public;
GRANT  EXECUTE ON FUNCTION public.update_my_handle_suffix(text) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated, public;
