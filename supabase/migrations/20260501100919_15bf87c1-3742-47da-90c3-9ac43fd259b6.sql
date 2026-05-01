-- 1. Lock email visibility: students can only see their OWN profile row
DROP POLICY IF EXISTS "Profiles viewable in own community" ON public.profiles;

CREATE POLICY "Users view own profile"
ON public.profiles FOR SELECT TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Admins view all profiles"
ON public.profiles FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- 2. Public-safe view for community feed (handles, avatars — NO emails)
CREATE OR REPLACE VIEW public.public_profiles
WITH (security_invoker = true) AS
SELECT id, handle, handle_suffix, avatar_url, community_id, created_at
FROM public.profiles
WHERE community_id = public.my_community_id();

GRANT SELECT ON public.public_profiles TO authenticated;

-- 3. Lock down user_roles: only admins (and the user themselves) can read; ONLY admins can mutate
DROP POLICY IF EXISTS "Users can view own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles;

CREATE POLICY "Users view own roles"
ON public.user_roles FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins view all roles"
ON public.user_roles FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins insert roles"
ON public.user_roles FOR INSERT TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins update roles"
ON public.user_roles FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins delete roles"
ON public.user_roles FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- 4. Grant admin to YOU only, and remove anyone else who somehow has it
DELETE FROM public.user_roles
WHERE role = 'admin'
  AND user_id <> 'fa46e527-a483-40f1-9060-ced27a4512a0';

INSERT INTO public.user_roles (user_id, role)
VALUES ('fa46e527-a483-40f1-9060-ced27a4512a0', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;