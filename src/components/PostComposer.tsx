import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { postSchema, containsSurname, looksLikeAd } from "@/lib/validation";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { AlertTriangle, ImagePlus, X } from "lucide-react";

const MAX_BYTES = 10 * 1024 * 1024;
const ALLOWED = ["image/jpeg","image/png","image/webp","image/gif","video/mp4","video/webm","video/quicktime"];

export const PostComposer = ({ onPosted }: { onPosted: () => void }) => {
  const { user, profile } = useAuth();
  const [body, setBody] = useState("");
  const [posting, setPosting] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  // Pre-fill from a "spark" prompt picked on the welcome screen.
  useEffect(() => {
    const draft = sessionStorage.getItem("unadmitted:draft");
    if (draft) {
      setBody(draft);
      sessionStorage.removeItem("unadmitted:draft");
    }
  }, []);


  const pickFile = (f: File | null) => {
    if (!f) return;
    if (!ALLOWED.includes(f.type)) return toast.error("Only images, GIFs and videos are supported");
    if (f.size > MAX_BYTES) return toast.error("File too large — 10 MB max");
    setFile(f);
    setPreviewUrl(URL.createObjectURL(f));
  };

  const clearFile = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFile(null);
    setPreviewUrl(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  const submit = async () => {
    const parsed = postSchema.safeParse({ body: body || (file ? "📎" : "") });
    if (!parsed.success) return toast.error(parsed.error.errors[0].message);
    // anon_vvv is exempt from amendment checks (admin/free-speech account).
    const isExempt = profile?.handle === "anon_vvv";
    if (!isExempt && containsSurname(parsed.data.body)) {
      return toast.error("1st Amendment: no name drops with surnames.");
    }
    if (!isExempt && looksLikeAd(parsed.data.body)) {
      return toast.error("2nd Amendment: chat with the Marketing Bot to promote.");
    }
    if (!user || !profile) return;
    setPosting(true);
    try {
      let media_url: string | null = null;
      let media_type: "image" | "video" | null = null;
      if (file) {
        const ext = file.name.split(".").pop() ?? "bin";
        const path = `${user.id}/${crypto.randomUUID()}.${ext}`;
        const { error: upErr } = await supabase.storage
          .from("post-media").upload(path, file, { contentType: file.type, upsert: false });
        if (upErr) throw upErr;
        media_url = supabase.storage.from("post-media").getPublicUrl(path).data.publicUrl;
        media_type = file.type.startsWith("video/") ? "video" : "image";
      }
      const { error } = await supabase.from("posts").insert({
        author_id: user.id,
        body: parsed.data.body,
        media_url: media_url ?? undefined,
        media_type: media_type ?? undefined,
        community_id: profile.community_id,
      });
      if (error) throw error;
      setBody("");
      clearFile();
      onPosted();
    } catch (e: any) {
      toast.error(e.message ?? "Failed to post");
    } finally {
      setPosting(false);
    }
  };

  return (
    <Card className="p-4 mb-4 shadow-card">
      <div className="text-xs text-muted-foreground mb-2">
        Posting as <span className="font-mono text-foreground">{profile?.handle}</span> · anonymous
      </div>
      <Textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="What's on your mind, unadmitted one?"
        className="min-h-[90px] resize-none border-0 focus-visible:ring-0 px-0 text-base"
        maxLength={2000}
      />
      {previewUrl && file && (
        <div className="relative inline-block rounded-lg overflow-hidden border border-border mt-2">
          {file.type.startsWith("video/") ? (
            <video src={previewUrl} className="max-h-64" controls />
          ) : (
            <img src={previewUrl} alt="preview" className="max-h-64" />
          )}
          <button
            onClick={clearFile}
            className="absolute top-1.5 right-1.5 h-7 w-7 rounded-full bg-foreground/70 text-background flex items-center justify-center hover:bg-foreground"
            aria-label="Remove media"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
      <input
        ref={fileRef}
        type="file"
        accept={ALLOWED.join(",")}
        className="hidden"
        onChange={(e) => pickFile(e.target.files?.[0] ?? null)}
      />
      <div className="flex items-center justify-between pt-2 border-t border-border mt-3">
        <div className="flex items-center gap-2">
          <Button
            type="button" variant="ghost" size="sm"
            className="text-primary gap-1.5"
            onClick={() => fileRef.current?.click()}
          >
            <ImagePlus className="h-4 w-4" />
            <span className="text-xs font-semibold">Media</span>
          </Button>
          <span className="hidden sm:inline-flex items-center gap-1 text-[11px] text-muted-foreground">
            <AlertTriangle className="h-3 w-3" /> No surnames · No store ads · Max 10 MB
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground">{body.length}/2000</span>
          <Button onClick={submit} disabled={posting || (!body.trim() && !file)} size="sm">
            {posting ? "…" : "Post"}
          </Button>
        </div>
      </div>
    </Card>
  );
};
