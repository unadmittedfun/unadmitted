/**
 * Per-university config. Adding a new school = add an entry here keyed by
 * email domain. Branding (name, hashtag, tagline, short_name) can be
 * overridden by the matching row in the `communities` DB table; welcome copy
 * and house rules are code-only.
 */
import type { LucideIcon } from "lucide-react";
import { EyeOff, Heart, AlertTriangle, ShieldCheck, MessageSquare, Coffee } from "lucide-react";

export type UniversityRule = { icon: LucideIcon; title: string; body: string };

export type UniversityConfig = {
  /** Email domain (after @), lowercase. The lookup key. */
  domain: string;
  /** Display brand */
  name: string;
  short_name: string;
  hashtag: string;
  tagline: string;
  /** Welcome screen */
  welcome: {
    headline: (shortName: string) => string;
    subhead: string;
    feature_chips: { icon: LucideIcon; label: string }[];
    rules: UniversityRule[];
    sparks: string[];
  };
};

const DEFAULT_RULES: UniversityRule[] = [
  { icon: EyeOff, title: "Stay anonymous, stay kind",
    body: "No real names, no doxxing, no targeting individuals — staff or students." },
  { icon: Heart, title: "Punch up, never down",
    body: "Critique policies, vibes, and systems. Not classmates." },
  { icon: AlertTriangle, title: "Keep it legal & safe",
    body: "No threats, no hate speech, no NSFW. Reports are reviewed within 24h." },
];

const DEFAULT_CHIPS = [
  { icon: EyeOff, label: "Anonymous handle" },
  { icon: ShieldCheck, label: "Verified students only" },
  { icon: MessageSquare, label: "Posts, DMs, polls" },
];

const DEFAULTS: Omit<UniversityConfig, "domain" | "name" | "short_name" | "hashtag" | "tagline"> = {
  welcome: {
    headline: (s) => `The unfiltered ${s} group chat.`,
    subhead:
      "Anonymous, university-only, and built for honest takes on campus life — the rules, the rumors, the rants. No followers, no clout, no main characters. Just your community.",
    feature_chips: DEFAULT_CHIPS,
    rules: DEFAULT_RULES,
    sparks: [
      "Hot take: the worst policy on campus is…",
      "What's a rule everyone secretly ignores?",
      "Best unknown spot to study?",
      "Confession: I actually like…",
    ],
  },
};

/**
 * Add a new school by adding an entry below — that's the only code change.
 */
export const UNIVERSITIES: Record<string, UniversityConfig> = {
  "acg.edu": {
    domain: "acg.edu",
    name: "ACG Unadmitted",
    short_name: "ACG",
    hashtag: "#gogriffins",
    tagline: "The American College of Greece — off the record.",
    ...DEFAULTS,
    welcome: {
      ...DEFAULTS.welcome,
      sparks: [
        "Hot take: the worst thing about Aghia Paraskevi is…",
        "Best Deree professor nobody talks about?",
        "Confession: the cafeteria food is actually…",
        "Library 3rd floor or 4th floor — fight.",
      ],
      rules: [
        ...DEFAULT_RULES,
        { icon: Coffee, title: "Keep the Griffin energy",
          body: "Roast the bureaucracy, not your classmates." },
      ],
    },
  },
};

/** Strict: signups must use a .edu email. */
export const isAcceptedEduEmail = (email: string) => {
  const domain = email.trim().toLowerCase().split("@")[1] ?? "";
  return /\.edu$/i.test(domain);
};

export const getUniversityConfig = (domain: string): UniversityConfig | null => {
  return UNIVERSITIES[domain.toLowerCase()] ?? null;
};
