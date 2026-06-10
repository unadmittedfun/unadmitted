import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { MessageSquare, Send, ArrowLeft, ShieldCheck } from "lucide-react";
import { ensureLocalKeyPair, encryptFor, decryptFrom } from "@/lib/crypto";

type Conv = {
  id: string;
  user_a: string;
  user_b: string;
  is_marketing_bot: boolean;
  other_handle: string;
  other_avatar: string | null;
  other_public_key: string | null;
  last_message?: string;
  last_timestamp?: string;
};

type Msg = {
  id: string;
  body: string;
  sender_id: string | null;
  is_bot: boolean;
  created_at: string;
  is_encrypted: boolean;
  nonce: string | null;
};

const DMs = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [convs, setConvs] = useState<Conv[]>([]);
  const [active, setActive] = useState<Conv | null>(null);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [body, setBody] = useState("");
  const [isSending, setIsSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Plaintext view of decrypted messages, keyed by message id.
  const [plainById, setPlainById] = useState<Record<string, string>>({});

  // Local NaCl keypair for this device (created lazily; AuthContext also seeds it).
  const myKeys = user ? ensureLocalKeyPair(user.id) : null;


  const loadConvs = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("conversations")
      .select("*")
      .or(`user_a.eq.${user.id},user_b.eq.${user.id}`)
      .eq("is_marketing_bot", false);

    if (!data) return;

    const mapped: Conv[] = [];
    for (const c of data) {
      const otherId = c.user_a === user.id ? c.user_b : c.user_a;
      const { data: otherProfile } = await supabase
        .from("profiles")
        .select("handle, avatar_url, public_key")
        .eq("id", otherId)
        .maybeSingle();
      const { data: lastMsg } = await supabase
        .from("messages")
        .select("body, created_at, is_encrypted, nonce, sender_id")
        .eq("conversation_id", c.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      // Best-effort preview of the last message (decrypt if it was for us).
      let preview = lastMsg?.body;
      if (lastMsg?.is_encrypted && lastMsg?.nonce && otherProfile?.public_key && myKeys) {
        const senderPub =
          lastMsg.sender_id === user.id ? myKeys.publicKey : otherProfile.public_key;
        const plain = decryptFrom(
          lastMsg.body,
          lastMsg.nonce,
          senderPub,
          myKeys.secretKey,
        );
        preview = plain ?? "🔒 encrypted";
      }

      mapped.push({
        id: c.id,
        user_a: c.user_a,
        user_b: c.user_b,
        is_marketing_bot: c.is_marketing_bot,
        other_handle: otherProfile?.handle ?? "anonymous",
        other_avatar: otherProfile?.avatar_url ?? null,
        other_public_key: (otherProfile as any)?.public_key ?? null,
        last_message: preview,
        last_timestamp: lastMsg?.created_at,
      });
    }


    mapped.sort(
      (a, b) =>
        new Date(b.last_timestamp ?? 0).getTime() -
        new Date(a.last_timestamp ?? 0).getTime()
    );
    setConvs(mapped);

    const cid = searchParams.get("c");
    if (cid && !active) {
      const found = mapped.find((c) => c.id === cid);
      if (found) setActive(found);
    }
  };

  // Decrypt a single message and cache the plaintext.
  const decryptInto = (msgs: Msg[], conv: Conv | null) => {
    if (!user || !myKeys || !conv) return;
    setPlainById((prev) => {
      const next = { ...prev };
      for (const m of msgs) {
        if (!m.is_encrypted || !m.nonce || next[m.id] != null) continue;
        // For messages I sent, the recipient pub key is the other user.
        // For messages I received, the sender pub key is the other user.
        const otherPub = conv.other_public_key;
        if (!otherPub) {
          next[m.id] = "🔒 encrypted (other user has no key yet)";
          continue;
        }
        const plain = decryptFrom(m.body, m.nonce, otherPub, myKeys.secretKey);
        next[m.id] = plain ?? "🔒 cannot decrypt on this device";
      }
      return next;
    });
  };

  const loadMessages = async (cid: string, conv: Conv | null) => {
    const { data } = await supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", cid)
      .order("created_at");
    const msgs = (data ?? []) as Msg[];
    setMessages(msgs);
    decryptInto(msgs, conv);
  };

  useEffect(() => {
    loadConvs();
    if (!user) return;
    const ch = supabase
      .channel(`convs-${user.id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "conversations" },
        () => loadConvs()
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        () => loadConvs()
      )
      .subscribe();
    return () => { supabase.removeChannel(ch); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, searchParams]);

  useEffect(() => {
    if (!active) return;
    loadMessages(active.id, active);
    const ch = supabase
      .channel(`msg-${active.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${active.id}`,
        },
        (payload) => {
          const m = payload.new as Msg;
          setMessages((cur) => [...cur, m]);
          decryptInto([m], active);
        }
      )
      .subscribe();
    return () => { supabase.removeChannel(ch); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async () => {
    if (!active || !user || !body.trim() || isSending) return;
    setIsSending(true);
    const text = body.trim();
    setBody("");
    const { data: conv } = await supabase
      .from("conversations")
      .select("community_id")
      .eq("id", active.id)
      .maybeSingle();

    let payload: { body: string; is_encrypted: boolean; nonce: string | null } = {
      body: text,
      is_encrypted: false,
      nonce: null,
    };

    if (active.other_public_key && myKeys) {
      const sealed = encryptFor(text, active.other_public_key, myKeys.secretKey);
      payload = { body: sealed.body, is_encrypted: true, nonce: sealed.nonce };
    }

    const { error } = await supabase.from("messages").insert({
      conversation_id: active.id,
      sender_id: user.id,
      is_bot: false,
      community_id: conv?.community_id ?? "",
      ...payload,
    } as any);
    if (error) {
      toast.error(error.message);
      setBody(text);
    } else if (payload.is_encrypted) {
      // We already know the plaintext locally — cache it so it renders immediately.
      // The realtime insert will arrive shortly with a real id; we cache by a temp key
      // only if we don't already have the new row — simplest is to rely on decryptInto
      // when the row arrives (we can also decrypt our own ciphertext via the same pair).
    }
    setIsSending(false);
  };


  return (
    <AppShell>
      <div className="grid md:grid-cols-[280px_1fr] gap-4 h-[calc(100vh-8rem)]">
        {/* conversation list */}
        <Card className={`p-2 overflow-y-auto ${active ? "hidden md:block" : ""}`}>
          {convs.length === 0 ? (
            <div className="p-6 text-center text-sm text-muted-foreground">
              <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
              no messages yet. tap "message" on a post to start a chat.
            </div>
          ) : (
            convs.map((c) => (
              <button
                key={c.id}
                onClick={() => setActive(c)}
                className={`w-full text-left p-3 rounded-md hover:bg-secondary transition-colors flex items-center gap-3 ${
                  active?.id === c.id ? "bg-secondary" : ""
                }`}
              >
                <Avatar className="h-9 w-9">
                  <AvatarImage src={c.other_avatar ?? undefined} />
                  <AvatarFallback className="font-mono text-xs">
                    {c.other_handle.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-mono text-sm truncate">{c.other_handle}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {c.last_message ?? "no messages yet"}
                  </p>
                </div>
              </button>
            ))
          )}
        </Card>

        {/* thread */}
        <Card className={`flex flex-col ${!active ? "hidden md:flex" : ""}`}>
          {!active ? (
            <div className="m-auto text-center text-muted-foreground p-6">
              <MessageSquare className="h-10 w-10 mx-auto mb-2 opacity-50" />
              select a conversation
            </div>
          ) : (
            <>
              <div className="p-3 border-b border-border flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden"
                  onClick={() => setActive(null)}
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <Avatar className="h-8 w-8">
                  <AvatarImage src={active.other_avatar ?? undefined} />
                  <AvatarFallback className="font-mono text-xs">
                    {active.other_handle.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="font-mono text-sm">{active.other_handle}</span>
                {active.other_public_key ? (
                  <span
                    className="ml-auto inline-flex items-center gap-1 text-[10px] text-green-500 font-medium"
                    title="end-to-end encrypted on this device"
                  >
                    <ShieldCheck className="h-3 w-3" /> e2e
                  </span>
                ) : (
                  <span
                    className="ml-auto text-[10px] text-muted-foreground"
                    title="other user hasn't set up encryption yet"
                  >
                    not encrypted
                  </span>
                )}
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map((m) => {
                  const mine = m.sender_id === user?.id;
                  const text = m.is_encrypted
                    ? (mine ? "🔒 sent (only your recipient can read)" : (plainById[m.id] ?? "🔒 decrypting…"))
                    : m.body;
                  return (
                    <div
                      key={m.id}
                      className={`flex ${mine ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[75%] px-3 py-2 rounded-2xl text-sm break-words ${
                          mine
                            ? "bg-primary text-primary-foreground rounded-br-sm"
                            : "bg-secondary rounded-bl-sm"
                        }`}
                      >
                        <p className="whitespace-pre-wrap">{text}</p>
                        <p className="text-[10px] mt-1 opacity-70 flex items-center gap-1">
                          {m.is_encrypted && <ShieldCheck className="h-3 w-3" />}
                          {formatDistanceToNow(new Date(m.created_at), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  );
                })}
                <div ref={bottomRef} />
              </div>


              <form
                onSubmit={(e) => { e.preventDefault(); send(); }}
                className="p-3 border-t border-border flex gap-2"
              >
                <Input
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="type a message…"
                  maxLength={2000}
                  disabled={isSending}
                />
                <Button type="submit" size="icon" disabled={!body.trim() || isSending}>
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </>
          )}
        </Card>
      </div>
    </AppShell>
  );
};

export default DMs;
