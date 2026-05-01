import { useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Camera } from "lucide-react";
import { toast } from "sonner";

export const ProfileSettings = ({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) => {
  const { user, profile, refreshProfile } = useAuth();
  const [suffix, setSuffix] = useState(profile?.handle_suffix ?? "");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const saveSuffix = async () => {
    if (!suffix.trim()) return;
    setSaving(true);
    const { error } = await supabase.rpc("update_my_handle_suffix", { _suffix: suffix });
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Handle updated");
    await refreshProfile();
  };

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    if (!file.type.startsWith("image/")) return toast.error("Please choose an image");
    if (file.size > 3 * 1024 * 1024) return toast.error("Max 3 MB");
    setUploading(true);
    const ext = file.name.split(".").pop() ?? "jpg";
    const path = `${user.id}/avatar-${Date.now()}.${ext}`;
    const { error: upErr } = await supabase.storage.from("avatars").upload(path, file, { upsert: true });
    if (upErr) { setUploading(false); return toast.error(upErr.message); }
    const { data: pub } = supabase.storage.from("avatars").getPublicUrl(path);
    const { error: profErr } = await supabase.from("profiles").update({ avatar_url: pub.publicUrl }).eq("id", user.id);
    setUploading(false);
    if (profErr) return toast.error(profErr.message);
    toast.success("Profile picture updated");
    await refreshProfile();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Profile</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <button onClick={() => fileRef.current?.click()} className="relative group" disabled={uploading}>
              <Avatar className="h-20 w-20">
                <AvatarImage src={profile?.avatar_url ?? undefined} />
                <AvatarFallback className="font-mono">{profile?.handle.slice(5, 7).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="absolute inset-0 bg-foreground/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Camera className="h-5 w-5 text-background" />
              </div>
            </button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onFile} />
            <div>
              <p className="font-mono font-semibold">{profile?.handle}</p>
              <p className="text-xs text-muted-foreground">{uploading ? "Uploading…" : "Tap photo to change"}</p>
            </div>
          </div>
          <div>
            <Label htmlFor="suffix">Custom handle (after <span className="font-mono">anon_</span>)</Label>
            <div className="flex gap-2 mt-1.5">
              <div className="flex items-center px-3 bg-muted rounded-md font-mono text-sm text-muted-foreground">anon_</div>
              <Input id="suffix" value={suffix} onChange={(e) => setSuffix(e.target.value)} placeholder="yourname" maxLength={20} />
              <Button onClick={saveSuffix} disabled={saving}>Save</Button>
            </div>
            <p className="text-[11px] text-muted-foreground mt-1.5">3–20 chars. Letters, numbers, underscore. No surnames (1st Amendment).</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
