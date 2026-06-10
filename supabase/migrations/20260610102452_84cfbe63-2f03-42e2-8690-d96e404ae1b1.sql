ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS public_key TEXT;
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS is_encrypted BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS nonce TEXT;
ALTER TABLE public.messages DROP CONSTRAINT IF EXISTS messages_body_check;
ALTER TABLE public.messages ADD CONSTRAINT messages_body_check CHECK (char_length(body) >= 1 AND char_length(body) <= 16000);