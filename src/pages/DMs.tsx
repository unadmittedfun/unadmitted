import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useEncryption } from "@/contexts/EncryptionContext";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { containsSurname } from "@/lib/validation";
import { securityMiddleware } from "@/lib/security";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { MessageSquare, Send, ArrowLeft, ShieldCheck } from "lucide-react";

type Conv = {
  id: string;
  user_a: string;
  user_b: string;
  is_marketing_bot: boolean;
  other_handle: string;
  other_avatar: string | null;
  last_message?: string;
  last_timestamp?: string;
};
type Msg = {
  id: string;
  body: string;
  sender_id: string | null;
  is_bot: boolean;
  created_at: string;
  is_encrypted?: boolean;
};

const DMs = () => {
  const { user, profile } = useAuth();
  const { encryptMessage, decryptMessage, isLoading: encryptionLoading } = useEncryption();
  const [searchParams, setSearchParams] = useSearchParams();
  const [convs, setConvs] = useState<Conv[]>([]);
  const [active, setActive] = useState<Conv | null>(null);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [decryptedMessages, setDecryptedMessages] = useState<Map<string, string>>(new Map());
  const [body, setBody] = useState("");
  const [isSending, setIsSending] = useState(false);

  const loadConvs = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from("conversations")
      .select("*")
      .or(`user_a.eq.${user.id},user_b.eq.${user.id}`)
      .eq("is_marketing_bot", false);

    if (!data || error) return;

    const mapped: Conv[] = [];
    for (const c of data) {
      const otherId = c.user_a === user.id ? c.user_b : c.user_a;
      const { data: otherProfile } = await supabase
        .from("profiles")
        .select("handle, avatar_url")
        .eq("id", otherId)
        .maybeSingle();
      const { data: lastMsg } = await supabase
        .from("messages")
        .select("body, created_at")
        .eq("conversation_id", c.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      mapped.push({
        id: c.id,
        user_a: c.user_a,
        user_b: c.user_b,
        is_marketing_bot: c.is_marketing_bot,
        other_handle: otherProfile?.handle ?? "anonymous",
        other_avatar: otherProfile?.avatar_url ?? null,
        last_message: lastMsg?.body,
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

  const loadMessages = async (cid: string) => {
    const { data } = await supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", cid)
      .order("created_at");
    const msgs = (data ?? []) as Msg[];

    const newDecrypted = new Map(decryptedMessages);
    await Promise.all(
      msgs
        .filter((m) => m.is_encrypted && m.sender_id && m.sender_id !== user?.id)
        .map(async (m) => {
          try {
            const plain = await decryptMessage(m.body, m.sender_id!);
            newDecrypted.set(m.id, plain);
          } catch {
            newDecrypted.set(m.id, "[Encrypted message — decryption failed]");
          }
        })
    );
    setDecryptedMessages(newDecrypted);
    setMessages(msgs);
  };

  useEffect(() => {
    loadConvs();
  }, [user, searchParams]);

  useEffect(() => {
    if (!active) return;
    loadMessages(active.id);
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
        (payload) => setMessages((m) => [...m, payload.new as Msg])
      )
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [active]);

  const
