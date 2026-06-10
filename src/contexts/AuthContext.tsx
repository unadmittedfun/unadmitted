import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";
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
  welcome_email_sent_at: string | null;
};

type AuthCtx = {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  community: Community | null;
  hostCommunity: Community | null;
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

  const loadProfile = useCallback(async (uid: string) => {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", uid)
      .maybeSingle();
    const p = (data as Profile | null) ?? null;
    setProfile(p);
    if (p?.community_id) {
      const c = await fetchCommunityById(p.community_id);
      setCommunity(c);
      applyCommunityTheme(c);
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    if (user) await loadProfile(user.id);
  }, [user, loadProfile]);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setProfile(null);
    setCommunity(null);
  }, []);

  // Resolve host-based community (for branded subdomains on the /auth page).
  useEffect(() => {
    const slug = getCommunitySlugFromHost();
    if (!slug) return;
    fetchCommunityBySlug(slug).then((c) => {
      setHostCommunity(c);
      if (c) applyCommunityTheme(c);
    });
  }, []);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, sess) => {
      setSession(sess);
      setUser(sess?.user ?? null);
      if (sess?.user) {
        setTimeout(() => loadProfile(sess.user.id), 0);
      } else {
        setProfile(null);
        setCommunity(null);
      }
    });

    supabase.auth.getSession().then(({ data: { session: sess } }) => {
      setSession(sess);
      setUser(sess?.user ?? null);
      if (sess?.user) {
        loadProfile(sess.user.id).finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [loadProfile]);

  return (
    <Ctx.Provider
      value={{ user, session, profile, community, hostCommunity, loading, refreshProfile, signOut }}
    >
      {children}
    </Ctx.Provider>
  );
};

export const useAuth = () => {
  const v = useContext(Ctx);
  if (!v) throw new Error("useAuth must be used inside AuthProvider");
  return v;
};
