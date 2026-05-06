import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Megaphone, Send, Bot, User as UserIcon } from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

type Msg = { id: string; body: string; sender_id: string | null; is_bot: boolean; created_at: string };

const Marketing = () => {
  const { user, profile } = useAuth();
  const [convId, setConvId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");

  const ensureConv = async () => {
    if (!user || !profile) return null;
    const { data, error } = await supabase.rpc("ensure_marketing_bot_conversation");
    if (error) { toast.error(error.message); return null; }
    return data as string;
  };

  useEffect(() => {
    (async () => {
      if (!profile) return;
      const cid = await ensureConv();
      if (!cid) return;
      setConvId(cid);
      const { data } = await supabase.from("messages").select("*").eq("conversation_id", cid).order("created_at");
      let msgs = (data ?? []) as Msg[];
      if (msgs.length === 0) {
        const intro = "Hey! I'm the Marketing Bot 🤖\n\nIf you want to promote anything happening at a real store, business, or event — you're in the right place. Tell me what you'd like to advertise and I'll show you packages.\n\nReminder: 1st Amendment still applies. No surnames in your ad copy.";
        const { data: ins } = await supabase.from("messages").insert({
          conversation_id: cid, sender_id: undefined, is_bot: true, body: intro, community_id: profile.community_id,
        }).select().single();
        if (ins) msgs = [ins as Msg];
      }
      setMessages(msgs);
    })();
  }, [user, profile]);

  const send = async () => {
    if (!user || !profile || !convId || !input.trim()) return;
    const text = input.trim();
    setInput("");
    const { data: u } = await supabase.from("messages").insert({
      conversation_id: convId, sender_id: user.id, is_bot: false, body: text, community_id: profile.community_id,
    }).select().single();
    if (u) setMessages((m) => [...m, u as Msg]);

    // Notify admin via email — fire-and-forget
    const requestId = crypto.randomUUID();
    supabase.functions.invoke("send-transactional-email", {
      body: {
        templateName: "ad-request-notification",
        recipientEmail: "unadmittedfun@gmail.com",
        idempotencyKey: `ad-request-${requestId}`,
        templateData: {
          handle: profile.handle,
          packageLabel: "Custom request",
          priceEur: 0,
          details: text,
          community: "ACG Unadmitted",
          requestId,
        },
      },
    }).catch((e) => console.error("admin notify failed", e));

    const reply = "✅ Sent to unadmitted.fun for checking. It normally takes around 30 minutes to 1 hour to get back to you.";
    const { data: b } = await supabase.from("messages").insert({
      conversation_id: convId, sender_id: undefined, is_bot: true, body: reply, community_id: profile.community_id,
    }).select().single();
    if (b) setMessages((m) => [...m, b as Msg]);
    toast.success("Sent for review");
  };

  return (
    <AppShell>
      <div className="flex items-center gap-2 mb-4">
        <Megaphone className="h-5 w-5 text-primary" />
        <h1 className="text-2xl font-bold">Promote with Marketing Bot</h1>
      </div>

      <div className="space-y-3 mb-4">
        {messages.map((m) => (
          <div key={m.id} className={`flex gap-2 ${m.is_bot ? "" : "flex-row-reverse"}`}>
            <div className={`h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 ${m.is_bot ? "bg-primary text-primary-foreground" : "bg-secondary"}`}>
              {m.is_bot ? <Bot className="h-4 w-4" /> : <UserIcon className="h-4 w-4" />}
            </div>
            <Card className={`p-3 shadow-card max-w-[80%] ${m.is_bot ? "" : "bg-primary text-primary-foreground"}`}>
              <p className="text-sm whitespace-pre-wrap">{m.body}</p>
              <p className={`text-[10px] mt-1 ${m.is_bot ? "text-muted-foreground" : "text-primary-foreground/70"}`}>
                {formatDistanceToNow(new Date(m.created_at), { addSuffix: true })}
              </p>
            </Card>
          </div>
        ))}
      </div>

      <Card className="p-4 mb-4 shadow-card">
        <p className="text-sm font-semibold mb-3">Quick packages</p>
        <div className="grid sm:grid-cols-2 gap-2">
          {PACKAGES.map((p) => (
            <Button key={p.id} variant="outline" className="justify-between h-auto py-3" onClick={() => choose(p)}>
              <span className="text-left text-xs">{p.label}</span>
              <span className="font-bold text-primary">€{p.price}</span>
            </Button>
          ))}
        </div>
        <p className="text-[11px] text-muted-foreground mt-3 flex items-start gap-1">
          <Check className="h-3 w-3 mt-0.5 flex-shrink-0" />
          All ads must comply with the 1st Amendment (no surnames).
        </p>
      </Card>

      <div className="flex gap-2">
        <Input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Tell the bot what you want to promote…" onKeyDown={(e) => e.key === "Enter" && send()} />
        <Button onClick={send} size="icon"><Send className="h-4 w-4" /></Button>
      </div>
    </AppShell>
  );
};

export default Marketing;
