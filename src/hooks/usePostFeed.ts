import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PostRow } from "@/components/PostCard";
import { useAuth } from "@/contexts/AuthContext";

export const usePostFeed = (mode: "new" | "trending") => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<PostRow[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user) return;
    const { data: rawPosts } = await supabase
      .from("posts")
      .select("id, body, created_at, author_id, is_promoted, media_url, media_type, community_id")
      .order("created_at", { ascending: false })
      .limit(100);
    if (!rawPosts) { setPosts([]); setLoading(false); return; }

    const ids = rawPosts.map((p) => p.id);
    const authorIds = [...new Set(rawPosts.map((p) => p.author_id))];

    const [profilesRes, votesRes, commentsRes, repostsRes, myVotesRes, myRepostsRes] = await Promise.all([
      supabase.from("profiles").select("id, handle, avatar_url").in("id", authorIds),
      supabase.from("votes").select("target_id, value").eq("target_type", "post").in("target_id", ids),
      supabase.from("comments").select("post_id").in("post_id", ids),
      supabase.from("reposts").select("post_id").in("post_id", ids),
      supabase.from("votes").select("target_id, value").eq("target_type", "post").in("target_id", ids).eq("user_id", user.id),
      supabase.from("reposts").select("post_id").in("post_id", ids).eq("user_id", user.id),
    ]);

    const profMap = new Map((profilesRes.data ?? []).map((p: any) => [p.id, p]));
    const upMap: Record<string, number> = {};
    const downMap: Record<string, number> = {};
    (votesRes.data ?? []).forEach((v: any) => {
      if (v.value === "up") upMap[v.target_id] = (upMap[v.target_id] ?? 0) + 1;
      else downMap[v.target_id] = (downMap[v.target_id] ?? 0) + 1;
    });
    const cMap: Record<string, number> = {};
    (commentsRes.data ?? []).forEach((c: any) => { cMap[c.post_id] = (cMap[c.post_id] ?? 0) + 1; });
    const rMap: Record<string, number> = {};
    (repostsRes.data ?? []).forEach((r: any) => { rMap[r.post_id] = (rMap[r.post_id] ?? 0) + 1; });
    const myVoteMap = new Map((myVotesRes.data ?? []).map((v: any) => [v.target_id, v.value]));
    const myRepostSet = new Set((myRepostsRes.data ?? []).map((r: any) => r.post_id));

    let assembled: PostRow[] = rawPosts.map((p: any) => ({
      id: p.id, body: p.body, created_at: p.created_at, author_id: p.author_id,
      community_id: p.community_id,
      is_promoted: p.is_promoted,
      media_url: p.media_url ?? null,
      media_type: (p.media_type as "image" | "video" | null) ?? null,
      author_handle: profMap.get(p.author_id)?.handle ?? "anon",
      author_avatar: profMap.get(p.author_id)?.avatar_url ?? null,
      upvotes: upMap[p.id] ?? 0,
      downvotes: downMap[p.id] ?? 0,
      comment_count: cMap[p.id] ?? 0,
      repost_count: rMap[p.id] ?? 0,
      my_vote: (myVoteMap.get(p.id) as any) ?? null,
      my_repost: myRepostSet.has(p.id),
    }));

    if (mode === "trending") {
      const now = Date.now();
      assembled.sort((a, b) => {
        const sa = (a.upvotes - a.downvotes) + a.comment_count * 0.5 + (a.is_promoted ? 1000 : 0);
        const sb = (b.upvotes - b.downvotes) + b.comment_count * 0.5 + (b.is_promoted ? 1000 : 0);
        const da = (now - new Date(a.created_at).getTime()) / 3.6e6;
        const db = (now - new Date(b.created_at).getTime()) / 3.6e6;
        return (sb / Math.pow(db + 2, 1.5)) - (sa / Math.pow(da + 2, 1.5));
      });
    }

    setPosts(assembled);
    setLoading(false);
  }, [user, mode]);

  useEffect(() => { load(); }, [load]);

  return { posts, loading, reload: load };
};
