CREATE TYPE public.report_reason AS ENUM ('harassment','spam','inappropriate','hate','self_harm','other');
CREATE TYPE public.report_status AS ENUM ('pending','reviewed','dismissed','actioned');
CREATE TYPE public.report_target AS ENUM ('post','comment');

ALTER TABLE public.posts    ADD COLUMN is_hidden BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE public.comments ADD COLUMN is_hidden BOOLEAN NOT NULL DEFAULT false;

CREATE TABLE public.reports (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id   UUID NOT NULL,
  community_id  UUID NOT NULL,
  target_type   public.report_target NOT NULL,
  target_id     UUID NOT NULL,
  reason        public.report_reason NOT NULL,
  notes         TEXT,
  status        public.report_status NOT NULL DEFAULT 'pending',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  reviewed_at   TIMESTAMPTZ,
  reviewed_by   UUID,
  UNIQUE (reporter_id, target_type, target_id)
);

CREATE INDEX idx_reports_target ON public.reports(target_type, target_id);
CREATE INDEX idx_reports_status ON public.reports(status);

ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users create reports in own community" ON public.reports FOR INSERT TO authenticated WITH CHECK (auth.uid() = reporter_id AND community_id = public.my_community_id());
CREATE POLICY "Users view own reports" ON public.reports FOR SELECT TO authenticated USING (auth.uid() = reporter_id);
CREATE POLICY "Admins view all reports" ON public.reports FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update reports" ON public.reports FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY "Posts viewable in own community" ON public.posts;
CREATE POLICY "Posts viewable in own community" ON public.posts FOR SELECT TO authenticated
  USING (community_id = public.my_community_id() AND (is_hidden = false OR auth.uid() = author_id OR public.has_role(auth.uid(), 'admin')));

DROP POLICY "Comments viewable in own community" ON public.comments;
CREATE POLICY "Comments viewable in own community" ON public.comments FOR SELECT TO authenticated
  USING (community_id = public.my_community_id() AND (is_hidden = false OR auth.uid() = author_id OR public.has_role(auth.uid(), 'admin')));

CREATE OR REPLACE FUNCTION public.auto_hide_on_reports()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $func$
DECLARE
  total INT;
BEGIN
  SELECT COUNT(*) INTO total FROM public.reports
   WHERE target_type = NEW.target_type AND target_id = NEW.target_id;
  IF total >= 5 THEN
    IF NEW.target_type = 'post' THEN
      UPDATE public.posts SET is_hidden = true WHERE id = NEW.target_id;
    ELSIF NEW.target_type = 'comment' THEN
      UPDATE public.comments SET is_hidden = true WHERE id = NEW.target_id;
    END IF;
  END IF;
  RETURN NEW;
END;
$func$;

CREATE TRIGGER trg_auto_hide_on_reports
AFTER INSERT ON public.reports
FOR EACH ROW EXECUTE FUNCTION public.auto_hide_on_reports();