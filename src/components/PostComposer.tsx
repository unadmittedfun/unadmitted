import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { postSchema, containsSurname, looksLikeAd } from "@/lib/validation";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { AlertTriangle } from "lucide-react";

export const PostComposer = ({ onPosted }: { onPosted: () => void }) => {
  const { user, profile } = useAuth();
  const [body, setBody] = useState("");
  const [posting, setPosting] = useState(false);

  const submit = async () => {
    const parsed = postSchema.safeParse({ body });
    if (!parsed.success) return toast.error(parsed.error.errors[0].message);
    if (containsSurname(parsed.data.body)) {
      return toast.error("1st Amendment: no name drops with surnames.", {
        description: "Remove the full name and try again.",
      });
    }
    if (looksLikeAd(parsed.data.body)) {
      return toast.error("2nd Amendment: chat with the Marketing Bot to promote.", {
        description: "Real-store promotions need a paid Promote slot.",
      });
    }
    if (!user) return;
    setPosting(true);
    const { error } = await supabase.from("posts").insert({
      author_id: user.id,
      body: parsed.data.body,
    });
    setPosting(false);
    if (error) return toast.error(error.message);
    setBody("");
    onPosted();
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
      <div className="flex items-center justify-between pt-2 border-t border-border mt-2">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <AlertTriangle className="h-3.5 w-3.5" />
          <span>No surnames. No store ads.</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground">{body.length}/2000</span>
          <Button onClick={submit} disabled={posting || !body.trim()} size="sm">
            Post
          </Button>
        </div>
      </div>
    </Card>
  );
};
