
-- Enums
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');
CREATE TYPE public.vote_value AS ENUM ('up', 'down');
CREATE TYPE public.target_type AS ENUM ('post', 'comment');
CREATE TYPE public.ad_status AS ENUM ('pending', 'approved', 'rejected', 'live', 'completed');

-- Profiles
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  handle TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL,
  accepted_amendments BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiles are viewable by authenticated users"
ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can insert own profile"
ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile"
ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

-- Roles
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  UNIQUE(user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT EXISTS(SELECT 1 FROM public.user_roles WHERE user_id=_user_id AND role=_role) $$;

CREATE POLICY "Users can view own roles"
ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all roles"
ON public.user_roles FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));

-- Validate @acg.edu and create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  new_handle TEXT;
BEGIN
  IF NEW.email !~* '@acg\.edu$' THEN
    RAISE EXCEPTION 'Only @acg.edu email addresses are allowed';
  END IF;
  new_handle := 'anon_' || substr(replace(NEW.id::text,'-',''),1,8);
  INSERT INTO public.profiles (id, handle, email) VALUES (NEW.id, new_handle, NEW.email);
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user');
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Posts
CREATE TABLE public.posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  body TEXT NOT NULL CHECK (char_length(body) BETWEEN 1 AND 2000),
  is_promoted BOOLEAN NOT NULL DEFAULT false,
  promoted_until TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Posts viewable by authenticated" ON public.posts FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users insert own posts" ON public.posts FOR INSERT TO authenticated WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Users update own posts" ON public.posts FOR UPDATE TO authenticated USING (auth.uid() = author_id);
CREATE POLICY "Users delete own posts" ON public.posts FOR DELETE TO authenticated USING (auth.uid() = author_id);

-- Comments
CREATE TABLE public.comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  body TEXT NOT NULL CHECK (char_length(body) BETWEEN 1 AND 1000),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Comments viewable by authenticated" ON public.comments FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users insert own comments" ON public.comments FOR INSERT TO authenticated WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Users update own comments" ON public.comments FOR UPDATE TO authenticated USING (auth.uid() = author_id);
CREATE POLICY "Users delete own comments" ON public.comments FOR DELETE TO authenticated USING (auth.uid() = author_id);

-- Votes
CREATE TABLE public.votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  target_type target_type NOT NULL,
  target_id UUID NOT NULL,
  value vote_value NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, target_type, target_id)
);
ALTER TABLE public.votes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Votes viewable by authenticated" ON public.votes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users insert own votes" ON public.votes FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own votes" ON public.votes FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users delete own votes" ON public.votes FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Reposts
CREATE TABLE public.reposts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, post_id)
);
ALTER TABLE public.reposts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Reposts viewable by authenticated" ON public.reposts FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users insert own reposts" ON public.reposts FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own reposts" ON public.reposts FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Conversations & messages (DMs)
CREATE TABLE public.conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_a UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_b UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  is_marketing_bot BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (user_a < user_b OR is_marketing_bot),
  UNIQUE(user_a, user_b)
);
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Participants view conversations" ON public.conversations FOR SELECT TO authenticated USING (auth.uid() = user_a OR auth.uid() = user_b);
CREATE POLICY "Users create conversations they are in" ON public.conversations FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_a OR auth.uid() = user_b);

CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  is_bot BOOLEAN NOT NULL DEFAULT false,
  body TEXT NOT NULL CHECK (char_length(body) BETWEEN 1 AND 4000),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Participants view messages" ON public.messages FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.conversations c WHERE c.id = conversation_id AND (c.user_a = auth.uid() OR c.user_b = auth.uid()))
);
CREATE POLICY "Participants send messages" ON public.messages FOR INSERT TO authenticated WITH CHECK (
  sender_id = auth.uid() AND EXISTS (
    SELECT 1 FROM public.conversations c WHERE c.id = conversation_id AND (c.user_a = auth.uid() OR c.user_b = auth.uid())
  )
);

-- Ad requests
CREATE TABLE public.ad_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  conversation_id UUID REFERENCES public.conversations(id) ON DELETE SET NULL,
  package_label TEXT NOT NULL,
  price_eur NUMERIC(10,2) NOT NULL,
  status ad_status NOT NULL DEFAULT 'pending',
  details JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.ad_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owner views own ad requests" ON public.ad_requests FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "Owner creates ad requests" ON public.ad_requests FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins update ad requests" ON public.ad_requests FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'admin'));

-- Helpful indexes
CREATE INDEX idx_posts_created ON public.posts(created_at DESC);
CREATE INDEX idx_comments_post ON public.comments(post_id, created_at);
CREATE INDEX idx_votes_target ON public.votes(target_type, target_id);
CREATE INDEX idx_messages_conv ON public.messages(conversation_id, created_at);
