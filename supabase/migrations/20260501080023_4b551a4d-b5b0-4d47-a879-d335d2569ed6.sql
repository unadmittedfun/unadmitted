
ALTER TABLE public.posts
  ADD COLUMN IF NOT EXISTS media_url TEXT,
  ADD COLUMN IF NOT EXISTS media_type TEXT CHECK (media_type IN ('image','video'));

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'post-media', 'post-media', true, 10485760,
  ARRAY['image/jpeg','image/png','image/webp','image/gif','video/mp4','video/webm','video/quicktime']
)
ON CONFLICT (id) DO UPDATE SET
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types,
  public = true;

CREATE POLICY "Post media publicly readable"
ON storage.objects FOR SELECT
USING (bucket_id = 'post-media');

CREATE POLICY "Users upload own post media"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'post-media' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users delete own post media"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'post-media' AND auth.uid()::text = (storage.foldername(name))[1]);
