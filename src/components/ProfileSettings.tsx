import { useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera } from "lucide-react";
import { SecurityDashboard } from "@/components/SecurityDashboard";
import { toast } from "sonner";

export const ProfileSettings = ({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) => {
  const { user, profile, refreshProfile } = useAuth();
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    if (!file.type.startsWith("image/")) return toast.error("Please choose an image");
    if (file.size > 3 * 1024 * 1024) return toast.error("Max 3 MB");

    setUploading(true);
    const ext = file.name.split(".").pop() ?? "jpg";
    const path = `${user.id}/avatar-${Date.now()}.${ext}`;
    const { error: upErr } = await supabase.storage
      .from("avatars")
      .upload(path, file, { upsert: true });
    if (upErr) { setUploading(false); return toast.error(upErr.message); }

    const { data: pub } = supabase.storage.from("avatars").getPublicUrl(path);
    const { error: profErr } = await supabase
      .from("profiles")
      .update({ avatar_url: pub.publicUrl })
      .eq("id", user.id);
    setUploading(false);
    if (profErr) return toast.error(profErr.message);

    toast.success("Profile picture updated");
    await refreshProfile();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6 pt-2">
            <div className="flex items-center gap-4">
              <button
                onClick={() => fileRef.current?.click()}
                className="relative group"
                disabled={uploading}
              >
                <Avatar className="h-20 w-20">
                  <AvatarImage key={profile?.avatar_url} src={profile?.avatar_url ?? undefined} />
                  <AvatarFallback className="font-mono">AN</AvatarFallback>
                </Avatar>
                <div className="absolute inset-0 bg-foreground/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Camera className="h-5 w-5 text-background" />
                </div>
              </button>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onFile} />
              <div>
                <p className="font-mono font-semibold">anonymous</p>
                <p className="text-xs text-muted-foreground">
                  {uploading ? "uploading…" : "tap photo to change"}
                </p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="security" className="pt-2">
            <SecurityDashboard />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
