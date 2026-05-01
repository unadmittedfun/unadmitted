import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { AppShell } from "@/components/AppShell";
import { PostCard, PostRow } from "@/components/PostCard";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { commentSchema, containsSurname } from "@/lib/validation";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { ArrowLeft } from "lucide-react";

type Comment = { id: string; body: string; created_at: string; author_id: string; handle: string };

const PostDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [post, setPost] = useState<PostRow | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    if (!id || !user) return;
    const { data: p } = await supabase.from("posts").select("*").eq("id", id).maybeSingle();
    if (!p) { setLoading(false); return; }
    const [profileRes, votesRes, commentsRes, repostsRes, myVoteRes, myRepostRes] = await Promise.all([
      supabase.from("profiles").select("handle, avatar_url").eq("id", p.author_id).maybeSingle(),
      supabase.from("votes").select("value").eq("target_type","post").eq("target_id", id),
      supabase.from("comments").select("id, body, created_at, author_id").eq("post_id", id).order("created_at", { ascending: true }),
      supabase.from("reposts").select("id").eq("post_id", id),
      supabase.from("votes").select("value").eq("target_type","post").eq("target_id", id).eq("user_id", user.id).maybeSingle(),
      supabase.from("reposts").select("id").eq("post_id", id).eq("user_id", user.id).maybeSingle(),
    ]);
    const up = (votesRes.data ?? []).filter((v: any) => v.value === "up").length;
    const down = (votesRes.data ?? []).filter((v: any) => v.value === "down").length;
    const cAuthors = [...new Set((commentsRes.data ?? []).map((c: any) => c.author_id))];
    const profMap = new Map<string,string>();
    if (cAuthors.length) {
      const { data } = await supabase.from("profiles").select("id, handle").in("id", cAuthors);
      (data ?? []).forEach((d: any) => profMap.set(d.id, d.handle));
    }
    setPost({
      id: p.id, body: p.body, created_at: p.created_at, author_id: p.author_id,
      is_promoted: p.is_promoted,
      media_url: p.media_url ?? null,
      media_type: (p.media_type as "image" | "video" | null) ?? null,
      author_handle: profileRes.data?.handle ?? "anon",
      author_avatar: profileRes.data?.avatar_url ?? null,
      upvotes: up, downvotes: down,
      comment_count: commentsRes.data?.length ?? 0,
      repost_count: repostsRes.data?.length ?? 0,
      my_vote: (myVoteRes.data?.value as any) ?? null,
      my_repost: !!myRepostRes.data,
    });
    setComments((commentsRes.data ?? []).map((c: any) => ({
      ...c, handle: profMap.get(c.author_id) ?? "anon",
    })));
    setLoading(false);
  };

  useEffect(() => { load(); }, [id, user]);

  const submitComment = async () => {
    const parsed = commentSchema.safeParse({ body });
    if (!parsed.success) return toast.error(parsed.error.errors[0].message);
    if (containsSurname(parsed.data.body)) return toast.error("1st Amendment: no surnames.");
    if (!user || !id || !post) return;
    const { error } = await supabase.from("comments").insert({
      post_id: id, author_id: user.id, body: parsed.data.body, community_id: post.community_id,
    });
    if (error) return toast.error(error.message);
    setBody("");
    load();
  };

  return (
    <AppShell>
      <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground mb-3 hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back
      </Link>
      {loading && <p className="text-center text-muted-foreground py-10">Loading…</p>}
      {!loading && !post && <p className="text-center py-10">Post not found.</p>}
      {post && <PostCard post={post} onChange={load} />}
      <Card className="p-3 my-4 shadow-card">
        <Textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder="Add a comment…" className="min-h-[70px] border-0 focus-visible:ring-0 resize-none" maxLength={1000} />
        <div className="flex justify-end pt-2">
          <Button size="sm" onClick={submitComment} disabled={!body.trim()}>Comment</Button>
        </div>
      </Card>
      <div className="space-y-2">
        {comments.map((c) => (
          <Card key={c.id} className="p-3 shadow-card">
            <div className="text-xs text-muted-foreground mb-1">
              <span className="font-mono">{c.handle}</span> · {formatDistanceToNow(new Date(c.created_at), { addSuffix: true })}
            </div>
            <p className="whitespace-pre-wrap text-sm">{c.body}</p>
          </Card>
        ))}
      </div>
    </AppShell>
  );
};

export default PostDetail;
