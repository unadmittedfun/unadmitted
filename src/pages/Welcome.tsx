import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useUniversity } from "@/hooks/useUniversity";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { GraduationCap, Sparkles, ArrowRight } from "lucide-react";

const onboardedKey = (uid: string) => `unadmitted:onboarded:${uid}`;
export const markOnboarded = (uid: string) => localStorage.setItem(onboardedKey(uid), "1");
export const isOnboarded = (uid: string) => localStorage.getItem(onboardedKey(uid)) === "1";

const Welcome = () => {
  const nav = useNavigate();
  const { user, profile } = useAuth();
  const uni = useUniversity();
  const brand = uni?.short_name ?? "your campus";
  const rules = uni?.welcome.rules ?? [];
  const chips = uni?.welcome.feature_chips ?? [];
  const sparks = uni?.welcome.sparks ?? [];

  const finish = (to: string) => {
    if (user) markOnboarded(user.id);
    nav(to);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-5 py-10 sm:py-16">
        {/* Hero */}
        <div className="flex items-center gap-2 mb-8">
          <span className="h-8 w-8 rounded-lg bg-gradient-hero grid place-items-center shadow-card">
            <GraduationCap className="h-4 w-4 text-primary-foreground" />
          </span>
          <span className="font-mono text-xs text-muted-foreground tracking-wide uppercase">
            {profile?.handle ?? "you're in"}
          </span>
        </div>

        <p className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-primary mb-3">
          <Sparkles className="h-3.5 w-3.5" /> Welcome
        </p>
        <h1 className="text-4xl sm:text-5xl font-semibold leading-[1.05] mb-4 text-balance">
          {uni ? uni.welcome.headline(brand) : `The unfiltered ${brand} group chat.`}
        </h1>
        <p className="text-base sm:text-lg text-muted-foreground text-pretty max-w-xl mb-10">
          {uni?.welcome.subhead ??
            "Anonymous, university-only, and built for honest takes on campus life."}
        </p>

        {/* What you get */}
        <div className="grid sm:grid-cols-3 gap-3 mb-10">
          {chips.map((f) => (
            <div
              key={f.label}
              className="rounded-xl border border-border bg-card px-4 py-3 flex items-center gap-2.5"
            >
              <f.icon className="h-4 w-4 text-primary shrink-0" />
              <span className="text-sm font-medium">{f.label}</span>
            </div>
          ))}
        </div>

        {/* House rules */}
        <Card className="p-5 sm:p-6 mb-8 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">House rules</h2>
            <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
              {rules.length} / {rules.length}
            </span>
          </div>
          <ul className="space-y-4">
            {rules.map((r, i) => (
              <li key={r.title} className="flex gap-3">
                <span className="h-8 w-8 shrink-0 rounded-lg bg-secondary grid place-items-center">
                  <r.icon className="h-4 w-4 text-foreground" />
                </span>
                <div>
                  <p className="font-semibold text-sm leading-tight">
                    <span className="text-muted-foreground font-mono mr-2">0{i + 1}</span>
                    {r.title}
                  </p>
                  <p className="text-sm text-muted-foreground mt-0.5">{r.body}</p>
                </div>
              </li>
            ))}
          </ul>
        </Card>

        {/* Spark prompts */}
        <div className="mb-8">
          <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-3">
            Need a spark? Try one of these
          </p>
          <div className="flex flex-wrap gap-2">
            {[
              "Hot take: the worst policy on campus is…",
              "What's a rule everyone secretly ignores?",
              "Best unknown spot to study?",
              "Confession: I actually like…",
            ].map((p) => (
              <button
                key={p}
                onClick={() => {
                  if (user) markOnboarded(user.id);
                  sessionStorage.setItem("unadmitted:draft", p);
                  nav("/");
                }}
                className="text-sm rounded-full border border-border bg-card hover:bg-secondary hover:border-primary/40 px-3.5 py-1.5 transition-colors"
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button size="lg" className="flex-1 group" onClick={() => finish("/")}>
            Make my first post
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Button>
          <Button size="lg" variant="outline" className="flex-1" onClick={() => finish("/trending")}>
            Just look around
          </Button>
        </div>

        <p className="text-xs text-muted-foreground mt-6 text-center">
          You can change your handle anytime in settings. We never read, store, or sell your data.
        </p>
      </div>
    </div>
  );
};

export default Welcome;
