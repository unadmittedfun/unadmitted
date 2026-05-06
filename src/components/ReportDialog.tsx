import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

type Reason = "harassment" | "spam" | "inappropriate" | "hate" | "self_harm" | "other";

const REASONS: { value: Reason; label: string; hint: string }[] = [
  { value: "harassment",    label: "Harassment or bullying", hint: "Targeting a specific person" },
  { value: "spam",          label: "Spam or scam",            hint: "Promo, repeated content, scam" },
  { value: "inappropriate", label: "Inappropriate / NSFW",    hint: "Sexual, gore, or shock content" },
  { value: "hate",          label: "Hate speech",             hint: "Slurs or attacks on a group" },
  { value: "self_harm",     label: "Self-harm or suicide",    hint: "Someone may be in danger" },
  { value: "other",         label: "Something else",          hint: "Tell us in the notes below" },
];

export const ReportDialog = ({
  open, onOpenChange, targetType, targetId, onReported,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  targetType: "post" | "comment";
  targetId: string;
  onReported?: () => void;
}) => {
  const { user, profile } = useAuth();
  const [reason, setReason] = useState<Reason>("harassment");
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!user || !profile) return;
    if (notes.length > 500) return toast.error("Notes must be under 500 characters");
    setBusy(true);
    const { error } = await supabase.from("reports").insert({
      reporter_id: user.id,
      community_id: profile.community_id,
      target_type: targetType,
      target_id: targetId,
      reason,
      notes: notes.trim() || null,
    });
    setBusy(false);
    if (error) {
      if (error.code === "23505") toast.error("You've already reported this.");
      else toast.error(error.message);
      return;
    }
    toast.success("Thanks — our mods will review this within 24h.");
    onOpenChange(false);
    setNotes("");
    setReason("harassment");
    onReported?.();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Report this {targetType}</DialogTitle>
          <DialogDescription>
            Reports are anonymous to other users. Repeated reports auto-hide content pending review.
          </DialogDescription>
        </DialogHeader>
        <RadioGroup value={reason} onValueChange={(v) => setReason(v as Reason)} className="space-y-1.5">
          {REASONS.map((r) => (
            <label
              key={r.value}
              htmlFor={`r-${r.value}`}
              className="flex items-start gap-3 rounded-lg border border-border p-3 cursor-pointer hover:bg-secondary has-[:checked]:border-primary has-[:checked]:bg-primary/5"
            >
              <RadioGroupItem id={`r-${r.value}`} value={r.value} className="mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-semibold leading-none">{r.label}</p>
                <p className="text-xs text-muted-foreground mt-1">{r.hint}</p>
              </div>
            </label>
          ))}
        </RadioGroup>
        <div>
          <Label htmlFor="notes" className="text-xs">Additional context (optional)</Label>
          <Textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            maxLength={500}
            placeholder="What should our mods know?"
            className="mt-1 min-h-[70px]"
          />
          <p className="text-[10px] text-muted-foreground text-right mt-1">{notes.length}/500</p>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={submit} disabled={busy}>{busy ? "…" : "Send report"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
