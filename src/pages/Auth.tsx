import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { signUpSchema } from "@/lib/validation";
import { useAuth } from "@/contexts/AuthContext";
import { fetchCommunityByEmailDomain } from "@/lib/community";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { toast } from "sonner";
import { GraduationCap, X, LogIn, ArrowLeft, MailCheck } from "lucide-react";
import { SnakeBackground } from "@/components/SnakeBackground";
import { Brand } from "@/components/Brand";
import { isAcceptedEduEmail } from "@/config/universities";
import { TERMS_VERSION } from "@/pages/Terms";

type Step = "form" | "verify";

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
  const [step, setStep] = useState<Step>("form");
  const [code, setCode] = useState("");

  const containerRef = useRef<HTMLDivElement>(null);
  const dragOffsetRef = useRef({ x: 0, y: 0 });
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!isDraggingRef.current) return;
      const x = e.clientX - dragStartRef.current.x;
      const y = e.clientY - dragStartRef.current.y;
      dragOffsetRef.current = { x, y };
      if (containerRef.current) {
        containerRef.current.style.transform = `translate(${x}px, ${y}px)`;
      }
    };
    const onUp = () => { isDraggingRef.current = false; };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, []);

  const handleDragStart = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    isDraggingRef.current = true;
    dragStartRef.current = {
      x: e.clientX - dragOffsetRef.current.x,
      y: e.clientY - dragOffsetRef.current.y,
    };
    e.preventDefault();
  };

  const closeForm = () => {
    setFormOpen(false);
    dragOffsetRef.current = { x: 0, y: 0 };
    if (containerRef.current) containerRef.current.style.transform = "";
  };

  const brand = hostCommunity?.name ?? "Unadmitted";
  const handle = hostCommunity?.email_domain ?? "your-uni.edu";
  const hashtag = hostCommunity?.hashtag ?? "#unadmitted";
  const shortName = hostCommunity?.short_name ?? "";

  const switchToSignIn = (msg?: string) => {
    if (msg) toast.error(msg);
    setMode("signin");
    setPassword("");
    setStep("form");
  };

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
      const community = await fetchCommunityByEmailDomain(domain);
      if (!community) {
        toast.error(`@${domain} isn't part of Unadmitted yet. Use your official university email.`);
        setLoading(false);
        return;
      }

      if (mode === "signup") {
        if (!acceptedLegal) {
          toast.error("please accept the terms of service and privacy policy to continue.");
          setLoading(false);
          return;
        }
        const { data, error } = await supabase.auth.signUp({
          email: emailParsed.data,
          password,
          options: {
            // No emailRedirectTo on purpose — we want the 6-digit OTP code, not a magic link.
            data: { accepted_terms_version: TERMS_VERSION },
          },
        });
        if (error) {
          const m = error.message?.toLowerCase() ?? "";
          if (m.includes("already") || m.includes("registered") || m.includes("exists")) {
            switchToSignIn("please sign in — you are already a member.");
            return;
          }
          throw error;
        }
        // Supabase returns a user with empty identities[] when the address already exists
        // (to prevent enumeration). Treat that as "already a member".
        if (data.user && (data.user.identities?.length ?? 0) === 0) {
          switchToSignIn("please sign in — you are already a member.");
          return;
        }
        toast.success(`we sent a 6-digit code to @${domain}. enter it below to verify.`, {
          duration: 8000,
        });
        setStep("verify");
        setCode("");
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

  const verifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length !== 6) return toast.error("enter the 6-digit code");
    const emailParsed = signUpSchema.shape.email.safeParse(email);
    if (!emailParsed.success) return toast.error("missing email — start over");
    setLoading(true);
    try {
      const { error } = await supabase.auth.verifyOtp({
        email: emailParsed.data,
        token: code,
        type: "signup",
      });
      if (error) throw error;
      toast.success("email verified — welcome in.");
      nav("/amendments");
    } catch (err: any) {
      const m = err?.message?.toLowerCase() ?? "";
      if (m.includes("expired")) {
        toast.error("that code expired — resend a new one.");
      } else if (m.includes("invalid")) {
        toast.error("that code didn't match — check the email again.");
      } else {
        toast.error(err.message ?? "couldn't verify the code");
      }
    } finally {
      setLoading(false);
    }
  };

  const resendCode = async () => {
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
      });
      if (error) throw error;
      toast.success("new 6-digit code sent. check inbox AND spam.", { duration: 8000 });
    } catch (err: any) {
      toast.error(err.message ?? "couldn't resend — try again in a minute");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 overflow-hidden bg-[#0a0a0a]">
      <SnakeBackground className="absolute inset-0" interactive={!formOpen} />

      {/* Back to landing */}
      <Link
        to="/"
        className="absolute top-4 left-4 z-20 inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-black/40 px-3 py-1.5 text-xs text-white/80 hover:text-white hover:border-white/30 backdrop-blur"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        back to home
      </Link>

      {/* Brand mark */}
      <div className="absolute top-4 right-4 z-10 flex items-center gap-2 font-semibold text-white/80 pointer-events-none">
        <GraduationCap className="h-5 w-5" />
        <Brand />
      </div>

      {/* Sign in form / OTP step */}
      <div ref={containerRef} className="absolute top-16 left-4 z-10 w-[calc(100%-2rem)] max-w-md">
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
        <Card className="relative w-full p-6 shadow-card max-h-[calc(100vh-5rem)] overflow-y-auto">
          <div
            className="flex justify-center mb-2 cursor-grab active:cursor-grabbing select-none"
            onMouseDown={handleDragStart}
          >
            <div className="w-8 h-1 rounded-full bg-muted-foreground/20" />
          </div>
          <button
            type="button"
            onClick={closeForm}
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

          {step === "verify" ? (
            <>
              <div className="flex items-center gap-2 mb-1">
                <MailCheck className="h-5 w-5 text-primary" />
                <h2 className="text-2xl font-bold">check your inbox</h2>
              </div>
              <p className="text-muted-foreground mb-6 text-sm">
                we sent a 6-digit code to{" "}
                <span className="font-semibold text-foreground">{email}</span>. enter it below to finish sign-up.
              </p>
              <form onSubmit={verifyCode} className="space-y-4">
                <div className="flex justify-center">
                  <InputOTP maxLength={6} value={code} onChange={setCode}>
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                      <InputOTPSlot index={3} />
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                    </InputOTPGroup>
                  </InputOTP>
                </div>
                <Button type="submit" className="w-full" disabled={loading || code.length !== 6}>
                  {loading ? "..." : "verify and continue"}
                </Button>
              </form>
              <div className="mt-4 flex items-center justify-between text-sm">
                <button
                  type="button"
                  onClick={resendCode}
                  disabled={loading}
                  className="text-muted-foreground hover:text-foreground"
                >
                  resend code
                </button>
                <button
                  type="button"
                  onClick={() => { setStep("form"); setCode(""); }}
                  className="text-muted-foreground hover:text-foreground"
                >
                  use a different email
                </button>
              </div>
            </>
          ) : (
            <>
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
                  <p className="text-xs text-destructive mt-1.5 font-medium text-center">
                    do not use your uni password — this is a separate student app.
                  </p>
                  {mode === "signup" && (
                    <p className="text-xs text-emerald-400 mt-1.5 font-medium text-center">
                      privacy matters — everything is end-to-end encrypted.
                    </p>
                  )}
                </div>
                {mode === "signin" && (
                  <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer select-none">
                    <Checkbox checked={rememberMe} onCheckedChange={(v) => setRememberMe(v === true)} />
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
                  {loading ? "..." : mode === "signup" ? "send verification code" : "sign in"}
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
            </>
          )}
        </Card>
        )}
      </div>

      <p className="absolute bottom-4 left-0 right-0 px-6 text-center text-xs text-white/70 z-10 pointer-events-none">
        we will <span className="font-semibold text-white">never</span> read, store, or use your data beyond what's needed to run the app.{" "}
        <a href="/privacy" className="text-primary hover:underline pointer-events-auto">read our privacy promise →</a>
      </p>
    </div>
  );
};

export default Auth;
