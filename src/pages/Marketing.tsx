import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Check, ChevronDown, Megaphone, Send } from "lucide-react";
import { toast } from "sonner";

const PACKAGES = [
  { id: "front_day", label: "Front of Trending — 1 day", price: 9 },
  { id: "front_3day", label: "Front of Trending — 3 days", price: 22 },
  { id: "pinned_week", label: "Pinned post — 1 week", price: 35 },
  { id: "story_blast", label: "Top-of-feed blast — 1 hour", price: 7 },
  { id: "weekly_digest", label: "Featured in weekly digest email", price: 15 },
  { id: "login_banner", label: "Banner on login/signup screen — 1 day", price: 25 },
  { id: "campus_bundle", label: "Campus bundle (all placements, 3 days)", price: 49 },
  { id: "monthly_sponsor", label: "Recurring monthly sponsor slot", price: 79 },
];

const Marketing = () => {
  const { user, profile } = useAuth();
  const [selectedPackage, setSelectedPackage] = useState(PACKAGES[0]);
  const [input, setInput] = useState("");
  const [sent, setSent] = useState(false);
  const [agreed, setAgreed] = useState(false);

  const send = async () => {
    if (!user || !profile || !input.trim()) return;
    if (!agreed) return toast.error("Please agree to the ad content policy first");
    const text = input.trim();
    const requestId = crypto.randomUUID();
    const { error } = await supabase.from("ad_requests").insert({
      id: requestId,
      user_id: user.id,
      package_label: selectedPackage.label,
      price_eur: selectedPackage.price,
      details: { package_id: selectedPackage.id, request_text: text },
      community_id: profile.community_id,
    });
    if (error) return toast.error(error.message);

    supabase.functions.invoke("send-transactional-email", {
      body: {
        templateName: "ad-request-notification",
        recipientEmail: "unadmittedfun@gmail.com",
        idempotencyKey: `ad-request-${requestId}`,
        templateData: {
          handle: profile.handle,
          packageLabel: selectedPackage.label,
          priceEur: selectedPackage.price,
          details: text,
          community: "ACG Unadmitted",
          requestId,
        },
      },
    }).catch((e) => console.error("admin notify failed", e));

    setInput("");
    setSent(true);
    toast.success("Sent for review");
  };

  return (
    <AppShell>
      <div className="flex items-center gap-2 mb-3 lg:mb-4">
        <Megaphone className="h-5 w-5 text-primary" />
        <h1 className="text-xl lg:text-2xl font-bold">Promote</h1>
      </div>

      <Card className="p-4 mb-4 shadow-card">
        <p className="text-sm font-semibold mb-3">Paid promotion packages</p>
        <div className="grid sm:grid-cols-2 gap-2">
          {PACKAGES.map((p) => (
            <Button key={p.id} variant={selectedPackage.id === p.id ? "default" : "outline"} className="justify-between h-auto py-3" onClick={() => setSelectedPackage(p)}>
              <span className="text-left text-xs">{p.label}</span>
              <span className="font-bold">€{p.price}</span>
            </Button>
          ))}
        </div>
        <p className="text-[11px] text-muted-foreground mt-3 flex items-start gap-1">
          <Check className="h-3 w-3 mt-0.5 flex-shrink-0" />
          All ads must comply with our community guidelines.
        </p>
      </Card>

      <Card className="p-4 mb-4 shadow-card space-y-3">
        <p className="text-sm font-semibold">Ad content policy</p>
        <ul className="text-xs text-muted-foreground list-disc pl-4 space-y-1">
          <li>Every promoted post displays a visible "Sponsored" label.</li>
          <li>No hate speech.</li>
          <li>No misleading claims.</li>
          <li>No targeting individuals by name.</li>
          <li>No adult content.</li>
          <li>We reserve the right to reject any ad.</li>
        </ul>
        <div>
          <p className="text-sm font-semibold mb-1">Refund policy</p>
          <p className="text-xs text-muted-foreground">
            If an ad is rejected after payment, a full refund is issued within 5 business days.
          </p>
        </div>
      </Card>

      <Card className="p-4 shadow-card">
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Do you have anything unadmitted in mind?"
          className="min-h-28 resize-none mb-3"
        />
        <div className="flex items-start gap-2 mb-3">
          <Checkbox id="agree-policy" checked={agreed} onCheckedChange={(v) => setAgreed(v === true)} className="mt-0.5" />
          <label htmlFor="agree-policy" className="text-xs text-muted-foreground leading-snug cursor-pointer">
            I agree to the ad content policy and community guidelines.
          </label>
        </div>
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">Selected: {selectedPackage.label} · €{selectedPackage.price}</p>
          <Button onClick={send} disabled={!input.trim() || !agreed}><Send className="h-4 w-4" /> Send</Button>
        </div>
        {sent && (
          <p className="text-sm font-medium text-primary mt-3">
            Sent to unadmitted.fun for checking. It normally takes around 30 minutes to 1 hour to get back to you.
          </p>
        )}
      </Card>
    </AppShell>
  );
};

export default Marketing;
