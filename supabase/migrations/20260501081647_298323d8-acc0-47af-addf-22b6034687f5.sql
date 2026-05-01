
-- 1. communities table
CREATE TABLE public.communities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  short_name TEXT NOT NULL,
  email_domain TEXT NOT NULL UNIQUE,
  hashtag TEXT NOT NULL DEFAULT '#unadmitted',
  primary_hsl TEXT NOT NULL DEFAULT '0 0% 9%',
  accent_hsl TEXT NOT NULL DEFAULT '24 100% 50%',
  tagline TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.communities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Communities are public read" ON public.communities
  FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Admins manage communities" ON public.communities
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'))
  WITH CHECK (has_role(auth.uid(), 'admin'));

-- 2. add community_id to all content tables
ALTER TABLE public.profiles      ADD COLUMN community_id UUID REFERENCES public.communities(id);
ALTER TABLE public.posts         ADD COLUMN community_id UUID REFERENCES public.communities(id);
ALTER TABLE public.comments      ADD COLUMN community_id UUID REFERENCES public.communities(id);
ALTER TABLE public.votes         ADD COLUMN community_id UUID REFERENCES public.communities(id);
ALTER TABLE public.reposts       ADD COLUMN community_id UUID REFERENCES public.communities(id);
ALTER TABLE public.conversations ADD COLUMN community_id UUID REFERENCES public.communities(id);
ALTER TABLE public.messages      ADD COLUMN community_id UUID REFERENCES public.communities(id);
ALTER TABLE public.ad_requests   ADD COLUMN community_id UUID REFERENCES public.communities(id);

CREATE INDEX idx_posts_community    ON public.posts(community_id, created_at DESC);
CREATE INDEX idx_profiles_community ON public.profiles(community_id);
CREATE INDEX idx_comments_community ON public.comments(community_id);

-- 3. helper: my community id
CREATE OR REPLACE FUNCTION public.my_community_id()
RETURNS UUID
LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT community_id FROM public.profiles WHERE id = auth.uid() $$;

-- 4. seed two communities
INSERT INTO public.communities (slug, name, short_name, email_domain, hashtag, primary_hsl, accent_hsl, tagline) VALUES
  ('acg', 'ACG Unadmitted', 'ACG', 'acg.edu', '#gogriffins',  '24 100% 50%', '24 100% 95%', 'The unfiltered ACG community.'),
  ('uoa', 'UoA Unadmitted', 'UoA', 'uoa.gr',  '#uoaforever',  '212 92% 45%', '212 92% 95%', 'The unfiltered University of Athens community.')
ON CONFLICT (slug) DO NOTHING;

-- 5. backfill existing data to ACG
UPDATE public.profiles      SET community_id = (SELECT id FROM public.communities WHERE slug='acg') WHERE community_id IS NULL;
UPDATE public.posts         SET community_id = (SELECT id FROM public.communities WHERE slug='acg') WHERE community_id IS NULL;
UPDATE public.comments      SET community_id = (SELECT id FROM public.communities WHERE slug='acg') WHERE community_id IS NULL;
UPDATE public.votes         SET community_id = (SELECT id FROM public.communities WHERE slug='acg') WHERE community_id IS NULL;
UPDATE public.reposts       SET community_id = (SELECT id FROM public.communities WHERE slug='acg') WHERE community_id IS NULL;
UPDATE public.conversations SET community_id = (SELECT id FROM public.communities WHERE slug='acg') WHERE community_id IS NULL;
UPDATE public.messages      SET community_id = (SELECT id FROM public.communities WHERE slug='acg') WHERE community_id IS NULL;
UPDATE public.ad_requests   SET community_id = (SELECT id FROM public.communities WHERE slug='acg') WHERE community_id IS NULL;

-- 6. enforce non-null going forward
ALTER TABLE public.profiles      ALTER COLUMN community_id SET NOT NULL;
ALTER TABLE public.posts         ALTER COLUMN community_id SET NOT NULL;
ALTER TABLE public.comments      ALTER COLUMN community_id SET NOT NULL;
ALTER TABLE public.votes         ALTER COLUMN community_id SET NOT NULL;
ALTER TABLE public.reposts       ALTER COLUMN community_id SET NOT NULL;
ALTER TABLE public.conversations ALTER COLUMN community_id SET NOT NULL;
ALTER TABLE public.messages      ALTER COLUMN community_id SET NOT NULL;
ALTER TABLE public.ad_requests   ALTER COLUMN community_id SET NOT NULL;

-- 7. update handle_new_user to look up community by email domain
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_handle TEXT;
  domain     TEXT;
  comm_id    UUID;
BEGIN
  domain := lower(split_part(NEW.email, '@', 2));
  SELECT id INTO comm_id FROM public.communities WHERE email_domain = domain AND is_active = true;
  IF comm_id IS NULL THEN
    RAISE EXCEPTION 'Email domain % is not part of any active Unadmitted community', domain;
  END IF;
  new_handle := 'anon_' || substr(replace(NEW.id::text,'-',''),1,8);
  INSERT INTO public.profiles (id, handle, email, community_id)
    VALUES (NEW.id, new_handle, NEW.email, comm_id);
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user');
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 8. tighten RLS: same-community only
DROP POLICY IF EXISTS "Posts viewable by authenticated"           ON public.posts;
DROP POLICY IF EXISTS "Users insert own posts"                    ON public.posts;
CREATE POLICY "Posts viewable in own community" ON public.posts
  FOR SELECT TO authenticated USING (community_id = my_community_id());
CREATE POLICY "Users insert posts in own community" ON public.posts
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = author_id AND community_id = my_community_id());

DROP POLICY IF EXISTS "Comments viewable by authenticated" ON public.comments;
DROP POLICY IF EXISTS "Users insert own comments"          ON public.comments;
CREATE POLICY "Comments viewable in own community" ON public.comments
  FOR SELECT TO authenticated USING (community_id = my_community_id());
CREATE POLICY "Users insert comments in own community" ON public.comments
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = author_id AND community_id = my_community_id());

DROP POLICY IF EXISTS "Votes viewable by authenticated" ON public.votes;
DROP POLICY IF EXISTS "Users insert own votes"          ON public.votes;
CREATE POLICY "Votes viewable in own community" ON public.votes
  FOR SELECT TO authenticated USING (community_id = my_community_id());
CREATE POLICY "Users insert votes in own community" ON public.votes
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id AND community_id = my_community_id());

DROP POLICY IF EXISTS "Reposts viewable by authenticated" ON public.reposts;
DROP POLICY IF EXISTS "Users insert own reposts"          ON public.reposts;
CREATE POLICY "Reposts viewable in own community" ON public.reposts
  FOR SELECT TO authenticated USING (community_id = my_community_id());
CREATE POLICY "Users insert reposts in own community" ON public.reposts
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id AND community_id = my_community_id());

DROP POLICY IF EXISTS "Profiles are viewable by authenticated users" ON public.profiles;
CREATE POLICY "Profiles viewable in own community" ON public.profiles
  FOR SELECT TO authenticated USING (community_id = my_community_id());
