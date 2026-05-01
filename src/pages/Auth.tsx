import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { signUpSchema } from "@/lib/validation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { GraduationCap } from "lucide-react";

const Auth = () => {
  const nav = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup" | "forgot">("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === "forgot") {
      const emailParsed = signUpSchema.shape.email.safeParse(email);
      if (!emailParsed.success) return toast.error(emailParsed.error.errors[0].message);
      setLoading(true);
      try {
        const { error } = await supabase.auth.resetPasswordForEmail(emailParsed.data, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) throw error;
        toast.success("Reset link sent — check your @acg.edu inbox");
        setMode("signin");
      } catch (err: any) {
        toast.error(err.message ?? "Something went wrong");
      } finally { setLoading(false); }
      return;
    }
    const parsed = signUpSchema.safeParse({ email, password });
    if (!parsed.success) {
      toast.error(parsed.error.errors[0].message);
      return;
    }
    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email: parsed.data.email,
          password: parsed.data.password,
          options: { emailRedirectTo: window.location.origin },
        });
        if (error) throw error;
        toast.success("Welcome to ACG Unadmitted");
        nav("/amendments");
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: parsed.data.email,
          password: parsed.data.password,
        });
        if (error) throw error;
        nav("/amendments");
      }
    } catch (err: any) {
      toast.error(err.message ?? "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div className="hidden lg:flex flex-col justify-between p-12 bg-primary text-primary-foreground relative overflow-hidden">
        <div className="flex items-center gap-2 font-semibold">
          <GraduationCap className="h-6 w-6" />
          <span>ACG Unadmitted</span>
        </div>
        <div>
          <h1 className="text-5xl font-black leading-[0.95] mb-4">
            The unfiltered<br/>ACG community.
          </h1>
          <p className="text-primary-foreground/80 max-w-sm">
            Anonymous. Honest. Strictly @acg.edu only — no exceptions.
          </p>
        </div>
        <div className="space-y-1 text-xs text-primary-foreground/70">
          <p className="font-semibold text-primary-foreground/90">🔒 We never read, store, or use your data.</p>
          <p className="text-primary-foreground/90">⚠️ Not affiliated with ACG. <span className="font-semibold">#gogriffins</span></p>
          <p className="text-primary-foreground/60">By DEREE students, for DEREE students.</p>
        </div>
      </div>
      <div className="flex items-center justify-center p-6">
        <Card className="w-full max-w-md p-8 shadow-card">
          <div className="lg:hidden flex items-center gap-2 font-semibold mb-6">
            <GraduationCap className="h-6 w-6 text-primary" />
            <span>ACG Unadmitted</span>
          </div>
          <div className="mb-4 px-3 py-2 rounded-md bg-secondary border border-border text-xs text-muted-foreground">
            <span className="font-semibold text-foreground">Not affiliated with The American College of Greece.</span> Independent, student-run. <span className="font-semibold">#gogriffins</span>
          </div>
          <h2 className="text-3xl font-bold mb-1">{mode === "signup" ? "Create account" : "Welcome back"}</h2>
          <p className="text-muted-foreground mb-6">Use your <span className="font-semibold text-foreground">@acg.edu</span> email.</p>
          <form onSubmit={submit} className="space-y-4">
            <div>
              <Label htmlFor="email">ACG email</Label>
              <Input id="email" type="email" placeholder="you@acg.edu" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "..." : mode === "signup" ? "Sign up" : "Sign in"}
            </Button>
          </form>
          <button
            type="button"
            onClick={() => setMode(mode === "signup" ? "signin" : "signup")}
            className="text-sm text-muted-foreground mt-4 hover:text-foreground block"
          >
            {mode === "signup" ? "Already have an account? Sign in" : "New here? Sign up"}
          </button>
          <p className="text-xs text-muted-foreground mt-6 pt-4 border-t">
            We will <span className="font-semibold text-foreground">never</span> read, store, or use your data beyond what's needed to run the app.{" "}
            <a href="/privacy" className="text-primary hover:underline">Read our privacy promise →</a>
          </p>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
