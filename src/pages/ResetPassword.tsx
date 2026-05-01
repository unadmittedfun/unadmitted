import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { GraduationCap } from "lucide-react";
import { passwordSchema } from "@/lib/validation";

const ResetPassword = () => {
  const nav = useNavigate();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Supabase auto-handles the recovery hash and triggers PASSWORD_RECOVERY
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") setReady(true);
    });
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setReady(true);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = passwordSchema.safeParse(password);
    if (!parsed.success) return toast.error(parsed.error.errors[0].message);
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password: parsed.data });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Password updated");
    nav("/");
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background">
      <Card className="w-full max-w-md p-8 shadow-card">
        <div className="flex items-center gap-2 font-semibold mb-6">
          <GraduationCap className="h-6 w-6 text-primary" />
          <span>ACG Unadmitted</span>
        </div>
        <h2 className="text-2xl font-bold mb-1">Set a new password</h2>
        <p className="text-muted-foreground text-sm mb-6">
          {ready ? "Enter your new password below." : "Verifying reset link…"}
        </p>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <Label htmlFor="password">New password</Label>
            <Input
              id="password" type="password" minLength={8}
              value={password} onChange={(e) => setPassword(e.target.value)}
              required disabled={!ready}
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading || !ready}>
            {loading ? "..." : "Update password"}
          </Button>
        </form>
      </Card>
    </div>
  );
};

export default ResetPassword;
