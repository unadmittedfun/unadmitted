ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_handle_key;

DROP FUNCTION IF EXISTS public.update_my_handle_suffix(text);

UPDATE public.profiles
SET handle = 'anonymous',
    handle_suffix = 'anonymous'
WHERE handle <> 'anonymous'
   OR handle_suffix <> 'anonymous';

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  domain  TEXT;
  comm_id UUID;
BEGIN
  domain := lower(split_part(NEW.email, '@', 2));
  SELECT id INTO comm_id FROM public.communities WHERE email_domain = domain AND is_active = true;
  IF comm_id IS NULL THEN
    RAISE EXCEPTION 'Email domain % is not part of any active Unadmitted community', domain;
  END IF;

  INSERT INTO public.profiles (id, handle, email, community_id, handle_suffix)
    VALUES (NEW.id, 'anonymous', NEW.email, comm_id, 'anonymous');
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user');
  RETURN NEW;
END;
$function$;