import { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowBigUp, ArrowBigDown, MessageCircle, Repeat2, Share2, Flame, Trash2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

export type PostRow = {
  id: string;
  body: string;
  created_at: string;
  author_id: string;
  community_id: string;
  is_promoted: boolean;
  author_handle: string;
  author_avatar: string | null;
  media_url: string | null;
  media_type: "image" | "video" | null;
  upvotes: number;
  downvotes: number;
  comment_count: number;
  repost_count: number;
  my_vote: "up" | "down" | null;
  my_repost: boolean;
};

export const PostCard = ({ post, onChange }: { post: PostRow; onChange: () => void }) => {
  const { user, profile } = useAuth();
  const [busy, setBusy] = useState(false);
  const score = post.upvotes - post.downvotes;

  const vote = async (value: "up" | "down") => {
    if (!user || !profile || busy) return;
    setBusy(true);
    if (post.my_vote === value) {
      await supabase.from("votes").delete().match({ user_id: user.id, target_type: "post", target_id: post.id });
    } else {
      await supabase.from("votes").upsert(
        { user_id: user.id, target_type: "post", target_id: post.id, value, community_id: profile.community_id },
        { onConflict: "user_id,target_type,target_id" }
      );
    }
    setBusy(false);
    onChange();
  };

  const repost = async () => {
    if (!user || !profile || busy) return;
    setBusy(true);
    if (post.my_repost) {
      await supabase.from("reposts").delete().match({ user_id: user.id, post_id: post.id });
    } else {
      await supabase.from("reposts").insert({ user_id: user.id, post_id: post.id, community_id: profile.community_id });
    }
    setBusy(false);
    onChange();
  };

  const share = async () => {
    const url = `${window.location.origin}/post/${post.id}`;
    try {
      if (navigator.share) await navigator.share({ url, title: "ACG Unadmitted" });
      else {
        await navigator.clipboard.writeText(url);
        toast.success("Link copied");
      }
    } catch {/* canceled */}
  };

  const remove = async () => {
    if (!user || busy) return;
    if (!confirm("Delete this post? This cannot be undone.")) return;
    setBusy(true);
    const { error } = await supabase.from("posts").delete().eq("id", post.id).eq("author_id", user.id);
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Post deleted");
    onChange();
  };

  const isOwner = user?.id === post.author_id;

  return (
    <Card className="p-5 mb-3 shadow-card hover:shadow-glow hover:border-primary/40 transition-all duration-200">
      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
        <Avatar className="h-6 w-6">
          <AvatarImage src={post.author_avatar ?? undefined} />
          <AvatarFallback className="text-[9px] font-mono">{post.author_handle.slice(5, 7).toUpperCase()}</AvatarFallback>
        </Avatar>
        <span className="font-mono">{post.author_handle}</span>
        <span>·</span>
        <span>{formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}</span>
        {post.is_promoted && (
          <span className="ml-auto inline-flex items-center gap-1 text-accent-foreground bg-accent px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide">
            <Flame className="h-3 w-3" /> Promoted
          </span>
        )}
        {isOwner && (
          <Button
            variant="ghost" size="sm"
            className={cn("h-6 w-6 p-0 text-muted-foreground hover:text-destructive", !post.is_promoted && "ml-auto")}
            onClick={remove}
            title="Delete post"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>
      <Link to={`/post/${post.id}`} className="block">
        {post.body && post.body !== "📎" && (
          <p className="whitespace-pre-wrap text-foreground leading-relaxed">{post.body}</p>
        )}
      </Link>
      {post.media_url && (
        <div className="mt-2 rounded-lg overflow-hidden border border-border bg-secondary">
          {post.media_type === "video" ? (
            <video
              src={post.media_url}
              controls
              playsInline
              className="w-full max-h-[520px] bg-black"
            />
          ) : (
            <img
              src={post.media_url}
              alt="post media"
              loading="lazy"
              className="w-full max-h-[520px] object-contain"
            />
          )}
        </div>
      )}
      <div className="flex items-center gap-1 mt-3 -ml-2">
        <div className="flex items-center bg-secondary rounded-full">
          <Button
            variant="ghost" size="sm"
            className={cn("rounded-full h-8 px-2", post.my_vote === "up" && "text-upvote")}
            onClick={() => vote("up")}
          >
            <ArrowBigUp className={cn("h-5 w-5", post.my_vote === "up" && "fill-current")} />
          </Button>
          <span className={cn(
            "text-sm font-bold tabular-nums px-1 min-w-[1.5rem] text-center",
            post.my_vote === "up" && "text-upvote",
            post.my_vote === "down" && "text-downvote"
          )}>
            {score}
          </span>
          <Button
            variant="ghost" size="sm"
            className={cn("rounded-full h-8 px-2", post.my_vote === "down" && "text-downvote")}
            onClick={() => vote("down")}
          >
            <ArrowBigDown className={cn("h-5 w-5", post.my_vote === "down" && "fill-current")} />
          </Button>
        </div>
        <Button asChild variant="ghost" size="sm" className="rounded-full text-muted-foreground gap-1.5">
          <Link to={`/post/${post.id}`}>
            <MessageCircle className="h-4 w-4" />
            <span className="text-xs font-semibold">{post.comment_count}</span>
          </Link>
        </Button>
        <Button
          variant="ghost" size="sm"
          className={cn("rounded-full text-muted-foreground gap-1.5", post.my_repost && "text-primary")}
          onClick={repost}
        >
          <Repeat2 className="h-4 w-4" />
          <span className="text-xs font-semibold">{post.repost_count}</span>
        </Button>
        <Button variant="ghost" size="sm" className="rounded-full text-muted-foreground" onClick={share}>
          <Share2 className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  );
};
