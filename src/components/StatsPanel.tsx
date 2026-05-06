import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Users, FileText, Activity, Trophy } from "lucide-react";

type LeaderEntry = { id: string; handle: string; avatar_url: string | null; score: number };

export const StatsPanel = () => {
  const [members, setMembers] = useState(0);
  const [posts, setPosts] = useState(0);
  const [active, setActive] = useState(0);
  const [leaders, setLeaders] = useState<LeaderEntry[]>([]);

  const load = async () => {
    const since = new Date();
    since.setDate(since.getDate() - 7);
    const sinceIso = since.toISOString();

    const [memberCountRes, { count: p }, recentPosts, recentComments, weekPostsRes] = await Promise.all([
      supabase.rpc("community_member_count"),
      supabase.from("posts").select("*", { count: "exact", head: true }),
      supabase.from("posts").select("author_id").gte("created_at", sinceIso),
      supabase.from("comments").select("author_id").gte("created_at", sinceIso),
      supabase.from("posts").select("id, author_id").gte("created_at", sinceIso),
    ]);
    setMembers(Number(memberCountRes.data ?? 0));
    setPosts(p ?? 0);
    const activeSet = new Set<string>();
    (recentPosts.data ?? []).forEach((r: any) => activeSet.add(r.author_id));
    (recentComments.data ?? []).forEach((r: any) => activeSet.add(r.author_id));
    setActive(activeSet.size);

    // Power ranking: sum of votes on this week's posts per author
    const weekPosts = weekPostsRes.data ?? [];
    if (weekPosts.length === 0) { setLeaders([]); return; }
    const ids = weekPosts.map((p: any) => p.id);
    const { data: votes } = await supabase
      .from("votes").select("target_id, value")
      .eq("target_type", "post").in("target_id", ids);
    const postScore: Record<string, number> = {};
    (votes ?? []).forEach((v: any) => {
      postScore[v.target_id] = (postScore[v.target_id] ?? 0) + (v.value === "up" ? 1 : -1);
    });
    const authorScore: Record<string, number> = {};
    weekPosts.forEach((p: any) => {
      authorScore[p.author_id] = (authorScore[p.author_id] ?? 0) + (postScore[p.id] ?? 0);
    });
    const top = Object.entries(authorScore)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);
    if (top.length === 0) { setLeaders([]); return; }
    const { data: profs } = await supabase
      .from("public_profiles").select("id, handle, avatar_url")
      .in("id", top.map(([id]) => id));
    const profMap = new Map((profs ?? []).map((p: any) => [p.id, p]));
    setLeaders(top.map(([id, score]) => {
      const p = profMap.get(id);
      return { id, handle: p?.handle ?? "anon", avatar_url: p?.avatar_url ?? null, score };
    }));
  };

  useEffect(() => {
    load();
    const t = setInterval(load, 30000);
    return () => clearInterval(t);
  }, []);

  return (
    <aside className="grid grid-cols-1 gap-2 lg:gap-3">
      <Card className="p-2.5 lg:p-4 shadow-card">
        <h3 className="text-[10px] lg:text-xs uppercase tracking-wider text-muted-foreground font-bold mb-2 lg:mb-3">live stats</h3>
        <div className="space-y-1 lg:space-y-2">
          <Stat icon={<Activity className="h-3.5 w-3.5 lg:h-4 lg:w-4 text-upvote" />} label="active this week" value={active} />
          <Stat icon={<Users className="h-3.5 w-3.5 lg:h-4 lg:w-4 text-primary" />} label="total members" value={members} />
          <Stat icon={<FileText className="h-3.5 w-3.5 lg:h-4 lg:w-4 text-accent" />} label="total posts" value={posts} />
        </div>
      </Card>

      <Card className="p-2.5 lg:p-4 shadow-card">
        <div className="flex items-center gap-1.5 lg:gap-2 mb-2 lg:mb-3">
          <Trophy className="h-3.5 w-3.5 lg:h-4 lg:w-4 text-accent" />
          <h3 className="text-[10px] lg:text-xs uppercase tracking-wider text-muted-foreground font-bold">top 3 this week</h3>
        </div>
        {leaders.length === 0 && (
          <p className="text-[11px] lg:text-xs text-muted-foreground py-1">No power moves yet.</p>
        )}
        <ol className="space-y-1.5 lg:space-y-2">
          {leaders.map((l, i) => (
            <li key={l.id} className="flex items-center gap-1.5 lg:gap-2.5">
              <span className={`h-5 w-5 lg:h-6 lg:w-6 rounded-full flex items-center justify-center text-[10px] lg:text-xs font-black ${
                i === 0 ? "bg-accent text-accent-foreground" :
                i === 1 ? "bg-secondary text-foreground" :
                "bg-muted text-muted-foreground"
              }`}>{i + 1}</span>
              <Avatar className="h-5 w-5 lg:h-7 lg:w-7 hidden sm:block">
                <AvatarImage src={l.avatar_url ?? undefined} />
                <AvatarFallback className="text-[9px] font-mono">{l.handle.slice(5, 7).toUpperCase()}</AvatarFallback>
              </Avatar>
              <span className="font-mono text-[11px] lg:text-xs flex-1 truncate">{l.handle}</span>
              <span className={`text-[11px] lg:text-xs font-bold tabular-nums ${l.score >= 0 ? "text-upvote" : "text-downvote"}`}>
                {l.score > 0 ? "+" : ""}{l.score}
              </span>
            </li>
          ))}
        </ol>
      </Card>
    </aside>
  );
};

const Stat = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) => (
  <div className="flex items-center justify-between gap-2">
    <div className="flex items-center gap-1.5 lg:gap-2 text-[11px] lg:text-sm text-muted-foreground min-w-0">
      {icon}<span className="truncate">{label}</span>
    </div>
    <span className="font-bold tabular-nums text-[11px] lg:text-sm">{value.toLocaleString()}</span>
  </div>
);
