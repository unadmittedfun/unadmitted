import { AppShell } from "@/components/AppShell";
import { PostComposer } from "@/components/PostComposer";
import { PostCard } from "@/components/PostCard";
import { usePostFeed } from "@/hooks/usePostFeed";

const Index = () => {
  const { posts, loading, reload } = usePostFeed("new");
  return (
    <AppShell>
      <PostComposer onPosted={reload} />
      {loading && <p className="text-center text-muted-foreground py-10">Loading…</p>}
      {!loading && posts.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          <p className="font-semibold text-foreground mb-1">It's quiet here.</p>
          <p className="text-sm">Be the first to post.</p>
        </div>
      )}
      {posts.map((p) => <PostCard key={p.id} post={p} onChange={reload} />)}
    </AppShell>
  );
};

export default Index;
