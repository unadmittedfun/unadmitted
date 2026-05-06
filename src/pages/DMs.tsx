import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { containsSurname } from "@/lib/validation";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { MessageSquare, Send, ArrowLeft } from "lucide-react";

type Conv = { id: string; user_a: string; user_b: string; is_marketing_bot: boolean; other_handle: string; last?: string };
type Msg = { id: string; body: string; sender_id: string | null; is_bot: boolean; created_at: string };

const DMs = () => {
  const { user, profile } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [convs, setConvs] = useState<Conv[]>([]);
  const [active, setActive] = useState<Conv | null>(null);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [body, setBody] = useState("");

  const loadConvs = async () => {
    if (!user) return;
    const { data } = await supabase.from("conversations").select("*").or(`user_a.eq.${user.id},user_b.eq.${user.id}`).eq("is_marketing_bot", false);
    if (!data) return;
    const mapped: Conv[] = data.map((c) => ({
      id: c.id, user_a: c.user_a, user_b: c.user_b, is_marketing_bot: c.is_marketing_bot,
      other_handle: c.is_marketing_bot ? "marketing bot 🤖" : "anonymous",
    }));
    setConvs(mapped);
    const cid = searchParams.get("c");
    if (cid && !active) {
      const found = mapped.find((c) => c.id === cid);
      if (found) setActive(found);
    }
  };

  const loadMessages = async (cid: string) => {
    const { data } = await supabase.from("messages").select("*").eq("conversation_id", cid).order("created_at");
    setMessages((data ?? []) as Msg[]);
  };

  useEffect(() => { loadConvs(); }, [user, searchParams]);
  useEffect(() => {
    if (!active) return;
    loadMessages(active.id);
    const ch = supabase.channel(`msg-${active.id}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages", filter: `conversation_id=eq.${active.id}` },
        (payload) => setMessages((m) => [...m, payload.new as Msg]))
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [active]);

  const send = async () => {
    if (!user || !profile || !active || !body.trim()) return;
    if (containsSurname(body)) return toast.error("1st amendment: no surnames.");
    const { error } = await supabase.from("messages").insert({
      conversation_id: active.id, sender_id: user.id, body: body.trim(), community_id: profile.community_id,
    });
    if (error) return toast.error(error.message);
    setBody("");
  };

  if (active) {
    return (
      <AppShell>
        <button onClick={() => setActive(null)} className="inline-flex items-center gap-1 text-sm text-muted-foreground mb-3 hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> all chats
        </button>
        <Card className="p-3 mb-3 shadow-card">
          <p className="font-semibold">{active.other_handle}</p>
        </Card>
        <div className="space-y-2 mb-4 min-h-[40vh]">
          {messages.map((m) => {
            const mine = m.sender_id === user?.id;
            return (
              <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[75%] px-3 py-2 rounded-2xl text-sm ${mine ? "bg-primary text-primary-foreground" : "bg-secondary"}`}>
                  <p className="whitespace-pre-wrap">{m.body}</p>
                  <p className={`text-[10px] mt-1 ${mine ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                    {formatDistanceToNow(new Date(m.created_at), { addSuffix: true })}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
        <div className="sticky bottom-2 flex gap-2">
          <Input value={body} onChange={(e) => setBody(e.target.value)} placeholder="message…" onKeyDown={(e) => e.key === "Enter" && send()} />
          <Button onClick={send} size="icon"><Send className="h-4 w-4" /></Button>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="flex items-center gap-2 mb-2 lg:mb-4">
        <MessageSquare className="h-5 w-5 text-primary" />
        <h1 className="text-xl lg:text-2xl font-bold">direct messages</h1>
      </div>
      <div className="space-y-2">
        {convs.length === 0 && <p className="text-center text-muted-foreground py-10 text-sm">no conversations yet.</p>}
        {convs.map((c) => (
          <Card key={c.id} className="p-3 shadow-card cursor-pointer hover:border-primary/40" onClick={() => setActive(c)}>
            <p className="font-semibold">{c.other_handle}</p>
          </Card>
        ))}
      </div>
    </AppShell>
  );
};

export default DMs;
