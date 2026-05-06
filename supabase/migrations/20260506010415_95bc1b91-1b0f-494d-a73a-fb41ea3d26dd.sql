CREATE OR REPLACE FUNCTION public.ensure_marketing_bot_conversation()
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid uuid := auth.uid();
  cid uuid;
  comm uuid;
BEGIN
  IF uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT id INTO cid
  FROM public.conversations
  WHERE is_marketing_bot = true AND user_a = uid
  LIMIT 1;
  IF cid IS NOT NULL THEN
    RETURN cid;
  END IF;

  SELECT community_id INTO comm FROM public.profiles WHERE id = uid;
  IF comm IS NULL THEN
    RAISE EXCEPTION 'Profile/community not found';
  END IF;

  INSERT INTO public.conversations (user_a, user_b, is_marketing_bot, community_id)
  VALUES (uid, uid, true, comm)
  RETURNING id INTO cid;

  RETURN cid;
END;
$$;

GRANT EXECUTE ON FUNCTION public.ensure_marketing_bot_conversation() TO authenticated;