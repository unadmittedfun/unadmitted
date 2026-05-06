CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  new_suffix TEXT;
  new_handle TEXT;
  domain     TEXT;
  comm_id    UUID;
BEGIN
  domain := lower(split_part(NEW.email, '@', 2));
  SELECT id INTO comm_id FROM public.communities WHERE email_domain = domain AND is_active = true;
  IF comm_id IS NULL THEN
    RAISE EXCEPTION 'Email domain % is not part of any active Unadmitted community', domain;
  END IF;
  new_suffix := substr(replace(NEW.id::text,'-',''),1,8);
  new_handle := 'anon_' || new_suffix;
  INSERT INTO public.profiles (id, handle, email, community_id, handle_suffix)
    VALUES (NEW.id, new_handle, NEW.email, comm_id, new_suffix);
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user');
  RETURN NEW;
END;
$function$;