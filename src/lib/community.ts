import { supabase } from "@/integrations/supabase/client";

export type Community = {
  id: string;
  slug: string;
  name: string;
  short_name: string;
  email_domain: string;
  hashtag: string;
  primary_hsl: string;
  accent_hsl: string;
  tagline: string | null;
  is_active: boolean;
};

/** Subdomain (acg, uoa, ...). Falls back to ?c= for local dev. */
export const getCommunitySlugFromHost = (): string | null => {
  if (typeof window === "undefined") return null;
  const url = new URL(window.location.href);
  const override = url.searchParams.get("c");
  if (override) return override.toLowerCase();
  const host = window.location.hostname;
  // strip port
  const parts = host.split(".");
  // local dev: localhost, 127.0.0.1
  if (host === "localhost" || /^\d+\.\d+\.\d+\.\d+$/.test(host)) return null;
  // need at least 3 parts for a subdomain (sub.domain.tld)
  if (parts.length < 3) return null;
  const sub = parts[0].toLowerCase();
  // ignore non-community subdomains
  if (["www", "id-preview--6a0357f4-a292-49c8-8c39-30db1d8a9fd1", "preview"].includes(sub)) return null;
  if (sub.startsWith("id-preview")) return null;
  return sub;
};

export const fetchCommunityBySlug = async (slug: string): Promise<Community | null> => {
  const { data } = await supabase
    .from("communities").select("*").eq("slug", slug).eq("is_active", true).maybeSingle();
  return (data as Community | null) ?? null;
};

export const fetchCommunityById = async (id: string): Promise<Community | null> => {
  const { data } = await supabase
    .from("communities").select("*").eq("id", id).maybeSingle();
  return (data as Community | null) ?? null;
};

export const fetchAllCommunities = async (): Promise<Community[]> => {
  const { data } = await supabase
    .from("communities").select("*").eq("is_active", true).order("name");
  return (data ?? []) as Community[];
};

/** Look up community by the email's domain (the part after @). */
export const fetchCommunityByEmailDomain = async (
  domain: string
): Promise<Community | null> => {
  const { data } = await supabase
    .from("communities")
    .select("*")
    .eq("email_domain", domain.toLowerCase())
    .eq("is_active", true)
    .maybeSingle();
  return (data as Community | null) ?? null;
};

/** Apply community theme to :root CSS variables. */
export const applyCommunityTheme = (c: Community | null) => {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  if (!c) {
    root.style.removeProperty("--primary");
    root.style.removeProperty("--accent");
    root.style.removeProperty("--ring");
    return;
  }
  root.style.setProperty("--primary", c.primary_hsl);
  root.style.setProperty("--ring", c.primary_hsl);
  // Note: we intentionally ignore c.accent_hsl — the design system uses a
  // single purple accent (no per-community orange override).
};
