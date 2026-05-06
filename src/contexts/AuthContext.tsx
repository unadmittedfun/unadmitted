import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import {
  Community,
  applyCommunityTheme,
  fetchCommunityById,
  fetchCommunityBySlug,
  getCommunitySlugFromHost,
} from "@/lib/community";

type Profile = {
  id: string;
  handle: string;
  email: string;
  accepted_amendments: boolean;
  avatar_url: string | null;
  handle_suffix: string;
  community_id: string;
};

type AuthCtx = {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  community: Community | null;
  hostCommunity: Community | null; // community implied by current subdomain (may be null)
  loading: boolean;
  refreshProfile: () => Promise<void>;
  signOut: () => Promise<void>;
};

const Ctx = createContext<AuthCtx | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [community, setCommunity] = useState<Community | null>(null);
  const [hostCommunity, setHostCommunity] = useState<Community | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = async (uid: string) => {
    const { data } = await supabase.from("profiles").select("*").eq("id", uid).maybeSingle();
    const p = data as (Profile & { welcome_email_sent_at?: string | null }) | null;
    setProfile(p);
    if (p?.community_id) {
      const c = await fetchCommunityById(p.community_id);
      setCommunity(c);
      applyCommunityTheme(c);
    }
    // fire-and-forget welcome email — only once per user
    if (p && !p.welcome_email_sent_at && p.email) {
      const { data: claimed } = await supabase
        .from("profiles")
        .update({ welcome_email_sent_at: new Date().toISOString() })
        .eq("id", uid)
        .is("welcome_email_sent_at", null)
        .select("id")
        .maybeSingle();
      if (claimed) {
        supabase.functions.invoke("send-transactional-email", {
          body: {
            templateName: "account-verified",
            recipientEmail: p.email,
            idempotencyKey: `account-verified-${uid}`,
            templateData: { handle: p.handle, appUrl: window.location.origin },
          },
        }).catch(() => {/* non-blocking */});
      }
    }
  };

  // Resolve community from the URL host on first mount (used for the auth/landing screens).
  useEffect(() => {
    const slug = getCommunitySlugFromHost();
    if (!slug) return;
    fetchCommunityBySlug(slug).then((c) => {
      setHostCommunity(c);
      // Only apply host theme if we don't yet have a logged-in community.
      if (!community) applyCommunityTheme(c);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s);
      setUser(s?.user ?? null);
      if (s?.user) {
        setTimeout(() => loadProfile(s.user.id), 0);
      } else {
        setProfile(null);
        setCommunity(null);
        applyCommunityTheme(hostCommunity);
      }
    });
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      setUser(s?.user ?? null);
      if (s?.user) loadProfile(s.user.id).finally(() => setLoading(false));
      else setLoading(false);
    });
    return () => sub.subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const refreshProfile = async () => {
    if (user) await loadProfile(user.id);
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <Ctx.Provider value={{ user, session, profile, community, hostCommunity, loading, refreshProfile, signOut }}>
      {children}
    </Ctx.Provider>
  );
};

export const useAuth = () => {
  const c = useContext(Ctx);
  if (!c) throw new Error("useAuth must be used inside AuthProvider");
  return c;
};
