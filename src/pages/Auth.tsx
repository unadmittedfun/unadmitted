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
import { Brand } from "@/components/Brand";
import { isAcceptedEduEmail } from "@/config/universities";
import { TERMS_VERSION } from "@/pages/Terms";

const Auth = () => {
  const nav = useNavigate();
  const { hostCommunity } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signup");
  const [email, setEmail] = useState(() => localStorage.getItem("unadmitted.rememberedEmail") ?? "");
  const [password, setPassword] = useState("");
  const [acceptedLegal, setAcceptedLegal] = useState(false);
  const [rememberMe, setRememberMe] = useState(() => !!localStorage.getItem("unadmitted.rememberedEmail"));
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

    const emailParsed = signUpSchema.shape.email.safeParse(email);
    if (!emailParsed.success) return toast.error(emailParsed.error.errors[0].message);
    if (password.length < 8) return toast.error("password must be at least 8 characters");

    const domain = emailParsed.data.split("@")[1]?.toLowerCase();
    if (!domain) return toast.error("enter a valid university email");
    if (!isAcceptedEduEmail(emailParsed.data)) {
      return toast.error("sorry — you are not an active student. use your official .edu email.");
    }

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
          toast.error("please accept the terms of service and privacy policy to continue.");
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
          `check your @${domain} inbox to verify your email before signing in.`,
          { duration: 8000 }
        );
        setMode("signin");
        setPassword("");
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: emailParsed.data, password,
        });
        if (error) throw error;
        if (rememberMe) {
          localStorage.setItem("unadmitted.rememberedEmail", emailParsed.data);
        } else {
          localStorage.removeItem("unadmitted.rememberedEmail");
        }
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
      toast.error(err.message ?? "something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const resendVerification = async () => {
    const emailParsed = signUpSchema.shape.email.safeParse(email);
    if (!emailParsed.success) return toast.error("enter your email above first");
    if (!isAcceptedEduEmail(emailParsed.data)) {
      return toast.error("use your official .edu email");
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email: emailParsed.data,
        options: { emailRedirectTo: window.location.origin },
      });
      if (error) throw error;
      toast.success(
        `verification email re-sent. check your inbox AND spam/junk folder.`,
        { duration: 8000 }
      );
    } catch (err: any) {
      toast.error(err.message ?? "couldn't resend — try again in a minute");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 overflow-hidden bg-[#0a0a0a]">
      <SnakeBackground className="absolute inset-0" interactive={!formOpen} />

      {/* Brand mark */}
      <div className="absolute top-4 right-4 z-10 flex items-center gap-2 font-semibold text-white/80 pointer-events-none">
        <GraduationCap className="h-5 w-5" />
        <Brand />
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
            <span className="text-sm font-semibold">open sign in</span>
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
            <Brand />
          </div>
          <div className="mb-4 px-3 py-2 rounded-md bg-secondary border border-border text-xs text-muted-foreground">
            <span className="font-semibold text-foreground">
              not affiliated with {shortName ? shortName : "any university"}.
            </span>{" "}
            independent, student-run. <span className="font-semibold">{hashtag}</span>
          </div>

          <h2 className="text-3xl font-bold mb-1">
            {mode === "signup" ? "create account" : "welcome back"}
          </h2>
          <p className="text-muted-foreground mb-6">
            {hostCommunity
              ? <>use your <span className="font-semibold text-foreground">@{handle}</span> email.</>
              : "use your official university email — your community is set automatically."}
          </p>
          <form onSubmit={submit} className="space-y-4">
            <div>
              <Label htmlFor="email">university email</Label>
              <Input id="email" type="email" placeholder={`you@${handle}`} value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div>
              <div className="flex items-center justify-between">
                <Label htmlFor="password">password</Label>
              </div>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} />
              <p className="text-xs text-destructive mt-1.5 font-medium">
                do not use your uni password — this is a separate student app.
              </p>
              {mode === "signup" && (
                <p className="text-xs text-emerald-400 mt-1.5 font-medium">
                  privacy matters — everything is end-to-end encrypted.
                </p>
              )}
            </div>
            {mode === "signin" && (
              <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer select-none">
                <Checkbox
                  checked={rememberMe}
                  onCheckedChange={(v) => setRememberMe(v === true)}
                />
                <span>remember me on this device</span>
              </label>
            )}
            {mode === "signup" && (
              <label className="flex items-start gap-2 text-xs text-muted-foreground cursor-pointer">
                <Checkbox
                  checked={acceptedLegal}
                  onCheckedChange={(v) => setAcceptedLegal(v === true)}
                  className="mt-0.5"
                />
                <span>
                  i am at least 16 years old and i agree to the{" "}
                  <a href="/terms" target="_blank" rel="noreferrer" className="text-primary hover:underline">terms of service</a>{" "}
                  and{" "}
                  <a href="/privacy" target="_blank" rel="noreferrer" className="text-primary hover:underline">privacy policy</a>.
                </span>
              </label>
            )}
            <Button type="submit" className="w-full" disabled={loading || (mode === "signup" && !acceptedLegal)}>
              {loading ? "..." : mode === "signup" ? "sign up" : "sign in"}
            </Button>
          </form>
          <div className="mt-4 space-y-1">
            <button
              type="button"
              onClick={() => setMode(mode === "signup" ? "signin" : "signup")}
              className="text-sm text-muted-foreground hover:text-foreground block"
            >
              {mode === "signup" ? "already have an account? sign in" : "new here? sign up"}
            </button>
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
