import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollText, ShieldCheck, Megaphone, GraduationCap } from "lucide-react";
import { toast } from "sonner";

const amendments = [
  {
    n: "I",
    icon: ScrollText,
    title: "Speak freely — but no surnames.",
    body: "You can write anything in this app. Anything. EXCEPT name drops with surnames. We protect each other's identities. Violators are removed.",
  },
  {
    n: "II",
    icon: Megaphone,
    title: "No real-store ads without the bot.",
    body: "You may not advertise anything happening at a real store, business or event without first chatting with the Marketing Bot. Packages start at €1 for a full day on Trending.",
  },
  {
    n: "III",
    icon: ShieldCheck,
    title: "@acg.edu only. No exceptions.",
    body: "Membership is restricted to verified @acg.edu email holders. There are no workarounds. There are no guests.",
  },
];

const Amendments = () => {
  const { user, refreshProfile } = useAuth();
  const nav = useNavigate();
  const [agreed, setAgreed] = useState(false);
  const [saving, setSaving] = useState(false);

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

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 mb-4 text-primary">
            <GraduationCap className="h-6 w-6" />
            <span className="font-semibold">ACG Unadmitted</span>
          </div>
          <h1 className="text-5xl font-black mb-3">The Three Amendments</h1>
          <p className="text-muted-foreground">Read carefully. These are the only rules.</p>
        </div>

        <div className="space-y-4 mb-8">
          {amendments.map((a) => (
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

        <Card className="p-6 shadow-card">
          <label className="flex items-start gap-3 cursor-pointer">
            <Checkbox checked={agreed} onCheckedChange={(v) => setAgreed(!!v)} className="mt-1" />
            <span className="text-sm">
              I have read and accept all three Amendments. I understand that breaking them
              results in removal from the community.
            </span>
          </label>
          <Button onClick={accept} disabled={!agreed || saving} className="w-full mt-4" size="lg">
            {saving ? "..." : "Enter ACG Unadmitted"}
          </Button>
        </Card>
      </div>
    </div>
  );
};

export default Amendments;
