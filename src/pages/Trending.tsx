import { AppShell } from "@/components/AppShell";
import { PostCard } from "@/components/PostCard";
import { usePostFeed } from "@/hooks/usePostFeed";
import { Flame } from "lucide-react";

const Trending = () => {
  const { posts, loading, reload } = usePostFeed("trending");
  return (
    <AppShell>
      <div className="flex items-center gap-2 mb-2 lg:mb-4">
        <Flame className="h-5 w-5 text-primary" />
        <h1 className="text-xl lg:text-2xl font-bold">Trending</h1>
      </div>
      {loading && <p className="text-center text-muted-foreground py-10">Loading…</p>}
      {posts.map((p) => <PostCard key={p.id} post={p} onChange={reload} />)}
    </AppShell>
  );
};

export default Trending;
