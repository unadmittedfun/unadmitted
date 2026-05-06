/** Hook returning the active university config (DB community + code config merged). */
import { useAuth } from "@/contexts/AuthContext";
import { getUniversityConfig, type UniversityConfig } from "@/config/universities";

export const useUniversity = (): UniversityConfig | null => {
  const { community, hostCommunity } = useAuth();
  const c = community ?? hostCommunity;
  if (!c) return null;
  const code = getUniversityConfig(c.email_domain);
  if (!code) return null;
  // DB row overrides branding fields where present.
  return {
    ...code,
    name: c.name ?? code.name,
    short_name: c.short_name ?? code.short_name,
    hashtag: c.hashtag ?? code.hashtag,
    tagline: c.tagline ?? code.tagline,
  };
};
