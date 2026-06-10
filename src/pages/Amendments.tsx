import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollText, ShieldCheck, Megaphone, GraduationCap, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";

const buildAmendments = (handle: string) => [
  {
    n: "I",
    icon: ScrollText,
    title: "speak freely — but no surnames.",
    body: "you can write anything in this app. anything. EXCEPT name drops with surnames. we protect each other's identities. violators are removed.",
  },
  {
    n: "II",
    icon: Megaphone,
    title: "no real-store ads without the bot.",
    body: "you may not advertise anything happening at a real store, business or event without first chatting with the marketing bot. packages start at €1 for a full day on trending.",
  },
  {
    n: "III",
    icon: ShieldCheck,
    title: `@${handle} only. no exceptions.`,
    body: `membership is restricted to verified @${handle} email holders. there are no workarounds. there are no guests.`,
  },
];

const Amendments = () => {
  const { user, profile, community, refreshProfile } = useAuth();
  const nav = useNavigate();
  const [agreed, setAgreed] = useState(false);
  const [saving, setSaving] = useState(false);

  const handle = community?.email_domain ?? "acg.edu";
  const name = community?.name ?? "Unadmitted";
  const items = buildAmendments(handle);
  const alreadyAccepted = !!profile?.accepted_amendments;

  const accept = async () => {
    if (!user || !agreed) return;
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({ accepted_amendments: true })
      .eq("id", user.id);
    if (error) {
      toast.error(error.message);
      setSaving(false);
      return;
    }
    await refreshProfile();
    nav("/");
  };

  const Body = (
    <div className="max-w-2xl mx-auto py-8 px-1">
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 mb-4 text-primary">
          <GraduationCap className="h-6 w-6" />
          <span className="font-semibold">{name}</span>
        </div>
        <h1 className="text-5xl font-black mb-3">the three amendments</h1>
        <p className="text-muted-foreground">
          {alreadyAccepted
            ? "you've accepted these. they are the only rules of this community."
            : "read carefully. these are the only rules."}
        </p>
      </div>

      <Card className="p-5 mb-6 shadow-card bg-primary/5 border-primary/20">
        <div className="flex gap-3">
          <ShieldCheck className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-semibold mb-1">before we begin — our promise to you.</p>
            <p className="text-muted-foreground">
              we will <span className="font-semibold text-foreground">never read, store, or use your data</span> beyond what is strictly required to run the app. no tracking. no selling. no spying. anonymous by design.{" "}
              <a href="/privacy" className="text-primary hover:underline" target="_blank" rel="noreferrer">full privacy promise →</a>
            </p>
          </div>
        </div>
      </Card>

      <div className="space-y-4 mb-8">
        {items.map((a) => (
          <Card key={a.n} className="p-6 shadow-card border-l-4 border-l-primary">
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-lg">
                  {a.n}
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <a.icon className="h-4 w-4 text-primary" />
                  <h2 className="text-xl font-bold">{a.title}</h2>
                </div>
                <p className="text-muted-foreground leading-relaxed">{a.body}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {alreadyAccepted ? (
        <Card className="p-6 shadow-card flex items-center gap-3">
          <CheckCircle2 className="h-5 w-5 text-primary" />
          <p className="text-sm text-muted-foreground">
            you accepted these when you joined. break one and you leave the community.
          </p>
        </Card>
      ) : (
        <Card className="p-6 shadow-card">
          <label className="flex items-start gap-3 cursor-pointer">
            <Checkbox checked={agreed} onCheckedChange={(v) => setAgreed(!!v)} className="mt-1" />
            <span className="text-sm">
              i have read and accept all three amendments. i understand that breaking them
              results in removal from the community.
            </span>
          </label>
          <Button onClick={accept} disabled={!agreed || saving} className="w-full mt-4" size="lg">
            {saving ? "..." : `enter ${name}`}
          </Button>
        </Card>
      )}
    </div>
  );

  // First-time onboarding: bare full-screen layout (no AppShell, since the
  // user hasn't accepted yet and ProtectedRoute keeps them here).
  if (!alreadyAccepted) {
    return (
      <div className="min-h-screen bg-background py-12 px-4">
        {Body}
      </div>
    );
  }

  // Returning visit from the nav tab: show inside the standard AppShell.
  return <AppShell>{Body}</AppShell>;
};

export default Amendments;
