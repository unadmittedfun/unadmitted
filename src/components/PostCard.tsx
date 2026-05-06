import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowBigUp, ArrowBigDown, MessageCircle, Mail, Share2, Flame, Trash2, MoreHorizontal, Flag } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ReportDialog } from "@/components/ReportDialog";
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
  my_vote: "up" | "down" | null;
};

export const PostCard = ({ post, onChange }: { post: PostRow; onChange: () => void }) => {
  const { user, profile } = useAuth();
  const [busy, setBusy] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const navigate = useNavigate();
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

  const messageAuthor = async () => {
    if (!user || !profile || busy) return;
    if (post.author_id === user.id) return toast.error("that's you.");
    setBusy(true);
    const [a, b] = [user.id, post.author_id].sort();
    const { data: existing } = await supabase
      .from("conversations").select("id").eq("user_a", a).eq("user_b", b).maybeSingle();
    let cid = existing?.id;
    if (!cid) {
      const { data: created, error } = await supabase
        .from("conversations").insert({ user_a: a, user_b: b, community_id: profile.community_id }).select("id").single();
      if (error) { setBusy(false); return toast.error(error.message); }
      cid = created.id;
    }
    setBusy(false);
    navigate(`/dms?c=${cid}`);
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
        <div className={cn(!post.is_promoted && "ml-auto")}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground">
                <MoreHorizontal className="h-3.5 w-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              {!isOwner && (
                <DropdownMenuItem onClick={() => setReportOpen(true)} className="text-sm">
                  <Flag className="h-3.5 w-3.5 mr-2" /> Report post
                </DropdownMenuItem>
              )}
              {isOwner && (
                <DropdownMenuItem onClick={remove} className="text-sm text-destructive focus:text-destructive">
                  <Trash2 className="h-3.5 w-3.5 mr-2" /> Delete post
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <ReportDialog
        open={reportOpen}
        onOpenChange={setReportOpen}
        targetType="post"
        targetId={post.id}
        onReported={onChange}
      />
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
          className="rounded-full text-muted-foreground gap-1.5"
          onClick={messageAuthor}
          disabled={busy}
        >
          <Mail className="h-4 w-4" />
          <span className="text-xs font-semibold">message</span>
        </Button>
      </div>
    </Card>
  );
};
