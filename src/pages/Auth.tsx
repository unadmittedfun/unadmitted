import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { signUpSchema } from "@/lib/validation";
import { useAuth } from "@/contexts/AuthContext";
import { fetchCommunityByEmailDomain } from "@/lib/community";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { GraduationCap, X, LogIn } from "lucide-react";
import { SnakeBackground } from "@/components/SnakeBackground";
import { TERMS_VERSION } from "@/pages/Terms";

const Auth = () => {
  const nav = useNavigate();
  const { hostCommunity } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup" | "forgot">("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [acceptedLegal, setAcceptedLegal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formOpen, setFormOpen] = useState(true);

  // Branding falls back to a generic look until the user is logged in or we
  // detect their university from the subdomain.
  const brand = hostCommunity?.name ?? "Unadmitted";
  const handle = hostCommunity?.email_domain ?? "your-uni.edu";
  const hashtag = hostCommunity?.hashtag ?? "#unadmitted";
  const shortName = hostCommunity?.short_name ?? "";

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
        toast.success("Reset link sent — check your inbox");
        setMode("signin");
      } catch (err: any) {
        toast.error(err.message ?? "Something went wrong");
      } finally { setLoading(false); }
      return;
    }

    const emailParsed = signUpSchema.shape.email.safeParse(email);
    if (!emailParsed.success) return toast.error(emailParsed.error.errors[0].message);
    if (password.length < 8) return toast.error("Password must be at least 8 characters");

    const domain = emailParsed.data.split("@")[1]?.toLowerCase();
    if (!domain) return toast.error("Enter a valid university email");

    setLoading(true);
    try {
      // Auto-detect the community from the email domain.
      const community = await fetchCommunityByEmailDomain(domain);
      if (!community) {
        toast.error(
          `@${domain} isn't part of Unadmitted yet. Use your official university email.`
        );
        setLoading(false);
        return;
      }

      if (mode === "signup") {
        if (!acceptedLegal) {
          toast.error("Please accept the Terms of Service and Privacy Policy to continue.");
          setLoading(false);
          return;
        }
        const { error } = await supabase.auth.signUp({
          email: emailParsed.data,
          password,
          options: {
            emailRedirectTo: window.location.origin,
            data: { accepted_terms_version: TERMS_VERSION },
          },
        });
        if (error) throw error;
        toast.success(
          `Check your @${domain} inbox to verify your email before signing in.`,
          { duration: 8000 }
        );
        setMode("signin");
        setPassword("");
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: emailParsed.data, password,
        });
        if (error) throw error;
        // Record consent on first sign-in if missing (covers users who signed up before).
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase
            .from("profiles")
            .update({
              accepted_terms_at: new Date().toISOString(),
              accepted_terms_version: TERMS_VERSION,
            })
            .eq("id", user.id)
            .is("accepted_terms_at", null);
        }
        nav("/amendments");
      }
    } catch (err: any) {
      toast.error(err.message ?? "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 overflow-hidden bg-[#0a0a0a]">
      <SnakeBackground className="absolute inset-0" />

      {/* Brand mark */}
      <div className="absolute top-4 right-4 z-10 flex items-center gap-2 font-semibold text-white/80 pointer-events-none">
        <GraduationCap className="h-5 w-5" />
        <span>{brand}</span>
      </div>

      {/* Sign in trigger / form, top-left */}
      <div className="absolute top-4 left-4 z-10 w-[calc(100%-2rem)] max-w-md">
        {!formOpen ? (
          <button
            type="button"
            onClick={() => setFormOpen(true)}
            className="group inline-flex items-center gap-2 rounded-full border border-border bg-card px-5 py-3 shadow-card hover:shadow-glow hover:border-primary/40 transition-all"
          >
            <LogIn className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold">Open sign in</span>
          </button>
        ) : (
        <Card className="relative w-full p-6 shadow-card max-h-[calc(100vh-2rem)] overflow-y-auto">
          <button
            type="button"
            onClick={() => setFormOpen(false)}
            aria-label="Close"
            className="absolute top-3 right-3 h-7 w-7 rounded-full text-muted-foreground hover:text-foreground hover:bg-secondary inline-flex items-center justify-center transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
          <div className="lg:hidden flex items-center gap-2 font-semibold mb-6">
            <GraduationCap className="h-6 w-6 text-primary" />
            <span>{brand}</span>
          </div>
          <div className="mb-4 px-3 py-2 rounded-md bg-secondary border border-border text-xs text-muted-foreground">
            <span className="font-semibold text-foreground">
              Not affiliated with {shortName ? shortName : "any university"}.
            </span>{" "}
            Independent, student-run. <span className="font-semibold">{hashtag}</span>
          </div>

          <h2 className="text-3xl font-bold mb-1">
            {mode === "signup" ? "Create account" : mode === "signin" ? "Welcome back" : "Reset password"}
          </h2>
          <p className="text-muted-foreground mb-6">
            {mode === "forgot"
              ? "We'll email a reset link to your university address."
              : hostCommunity
                ? <>Use your <span className="font-semibold text-foreground">@{handle}</span> email.</>
                : "Use your official university email — your community is set automatically."}
          </p>
          <form onSubmit={submit} className="space-y-4">
            <div>
              <Label htmlFor="email">University email</Label>
              <Input id="email" type="email" placeholder={`you@${handle}`} value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            {mode !== "forgot" && (
              <div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  {mode === "signin" && (
                    <button type="button" onClick={() => setMode("forgot")} className="text-xs text-primary hover:underline">
                      Forgot password?
                    </button>
                  )}
                </div>
                <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} />
              </div>
            )}
            {mode === "signup" && (
              <label className="flex items-start gap-2 text-xs text-muted-foreground cursor-pointer">
                <Checkbox
                  checked={acceptedLegal}
                  onCheckedChange={(v) => setAcceptedLegal(v === true)}
                  className="mt-0.5"
                />
                <span>
                  I am at least 16 years old and I agree to the{" "}
                  <a href="/terms" target="_blank" rel="noreferrer" className="text-primary hover:underline">Terms of Service</a>{" "}
                  and{" "}
                  <a href="/privacy" target="_blank" rel="noreferrer" className="text-primary hover:underline">Privacy Policy</a>.
                </span>
              </label>
            )}
            <Button type="submit" className="w-full" disabled={loading || (mode === "signup" && !acceptedLegal)}>
              {loading ? "..." : mode === "signup" ? "Sign up" : mode === "signin" ? "Sign in" : "Send reset link"}
            </Button>
          </form>
          <div className="mt-4 space-y-1">
            {mode === "forgot" ? (
              <button type="button" onClick={() => setMode("signin")} className="text-sm text-muted-foreground hover:text-foreground block">
                Back to sign in
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setMode(mode === "signup" ? "signin" : "signup")}
                className="text-sm text-muted-foreground hover:text-foreground block"
              >
                {mode === "signup" ? "Already have an account? Sign in" : "New here? Sign up"}
              </button>
            )}
          </div>
        </Card>
        )}
      </div>

      <p className="absolute bottom-4 left-0 right-0 px-6 text-center text-xs text-white/70 z-10 pointer-events-none">
        We will <span className="font-semibold text-white">never</span> read, store, or use your data beyond what's needed to run the app.{" "}
        <a href="/privacy" className="text-primary hover:underline pointer-events-auto">Read our privacy promise →</a>
      </p>
    </div>
  );
};

export default Auth;
