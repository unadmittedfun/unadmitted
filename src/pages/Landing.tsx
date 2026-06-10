import { useMemo } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { GraduationCap, Lock, MessageSquare, ShieldCheck, Sparkles, ArrowRight } from "lucide-react";

const TAGLINES = [
  "anonymous. verified. campus-only.",
  "campusweb needs an update ASAP.",
  "the registrar's office closes at 4pm. the line starts at 3:45.",
  "campuswifi drops every time it rains.",
  "the dining hall pizza is a war crime.",
  "professors who read off slides for 50 minutes. why.",
  "the parking situation is a human rights violation.",
  "your tuition pays for the fountain. the fountain is broken.",
  "the library elevator has been 'under maintenance' since 2019.",
  "the syllabus says 'participation 10%'. no one knows what that means.",
  "the campus app crashes more than your gpa.",
  "group projects: one person works, four people get credit.",
];

const MOCK_POSTS = [
  { h: "anonymous", t: "the library 3rd floor is the only honest place on this campus." },
  { h: "anonymous", t: "professor finally admitted the midterm was unfair. small wins." },
  { h: "anonymous", t: "anyone else feel like office hours are just performance art?" },
  { h: "anonymous", t: "the campus gym has been 'renovating' the pool for three years." },
  { h: "anonymous", t: "just saw a squirrel steal an entire bagel from the quad. respect." },
  { h: "anonymous", t: "the coffee in the student center tastes like it was brewed during the civil war." },
  { h: "anonymous", t: "i've been in this lecture hall for fifteen minutes and the ac is still broken." },
  { h: "anonymous", t: "the 'freshman fifteen' is just the dining hall being open 24/7. no regrets." },
  { h: "anonymous", t: "found a textbook for $5 in the free bin. beat the bookstore by $200." },
  { h: "anonymous", t: "the campus alert system sends more spam than my ex." },
  { h: "anonymous", t: "who decided 8am chemistry was a good idea? i just want to talk." },
  { h: "anonymous", t: "the study rooms are always booked by people watching netflix. we see you." },
];

function RotatingTagline() {
  const tagline = useMemo(() => TAGLINES[Math.floor(Math.random() * TAGLINES.length)], []);
  return (
    <div className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground mb-5">
      <Sparkles className="h-3.5 w-3.5 text-primary" />
      {tagline}
    </div>
  );
}

function MockPosts() {
  const posts = useMemo(() => {
    const pool = [...MOCK_POSTS];
    const out = [];
    for (let i = 0; i < 3; i++) {
      const idx = Math.floor(Math.random() * pool.length);
      out.push(pool[idx]);
      pool.splice(idx, 1);
    }
    return out;
  }, []);
  return (
    <div className="space-y-3">
      {posts.map((p, i) => (
        <div key={i} className="rounded-2xl border border-border bg-card p-3">
          <div className="font-mono text-[11px] text-muted-foreground mb-1">{p.h}</div>
          <p className="text-sm leading-snug">{p.t}</p>
        </div>
      ))}
    </div>
  );
}

const Landing = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* nav */}
      <header className="border-b border-border/60">
        <div className="max-w-6xl mx-auto px-5 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <span className="h-8 w-8 rounded-xl bg-gradient-hero grid place-items-center">
              <GraduationCap className="h-4 w-4 text-primary-foreground" />
            </span>
            <span className="font-serif text-lg tracking-tight">unadmitted</span>
          </Link>
          <nav className="hidden sm:flex items-center gap-6 text-sm text-muted-foreground">
            <Link to="/about" className="hover:text-foreground">about</Link>
            <Link to="/privacy" className="hover:text-foreground">privacy</Link>
            <Link to="/terms" className="hover:text-foreground">terms</Link>
          </nav>
          <Link to="/auth">
            <Button size="sm">sign in</Button>
          </Link>
        </div>
      </header>

      {/* hero */}
      <section className="max-w-6xl mx-auto px-5 pt-16 pb-20 lg:pt-24 lg:pb-28">
        <div className="grid lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-7">
            <RotatingTagline />
            <h1 className="text-5xl lg:text-7xl font-serif leading-[1.02] tracking-tight text-balance">
              the things your campus is thinking,
              <span className="block text-primary">said out loud.</span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground max-w-xl text-pretty">
              unadmitted is a private discourse layer for universities. real students,
              verified by their .edu email, posting under anonymous handles. no scraping,
              no selling, no algorithm chasing rage.
            </p>
            <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-3.5 py-1.5 text-xs font-semibold text-primary">
              <Lock className="h-3.5 w-3.5" />
              encryption end-to-end · your data stays yours
            </div>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link to="/auth">
                <Button size="lg" className="gap-2">
                  join your campus <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link to="/about">
                <Button size="lg" variant="outline">how it works</Button>
              </Link>
            </div>
            <p className="mt-4 text-xs text-muted-foreground">
              sign-up requires a verified university email — we send a 6-digit code to confirm.
            </p>
          </div>

          {/* mock card */}
          <div className="lg:col-span-5">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-hero blur-3xl opacity-20 rounded-[3rem]" />
              <Card className="relative shadow-card p-5 space-y-4">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="h-2 w-2 rounded-full bg-primary" />
                  trending · your campus
                </div>
                <MockPosts />
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* values */}
      <section className="border-t border-border/60 bg-secondary/40">
        <div className="max-w-6xl mx-auto px-5 py-16 grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { icon: GraduationCap, title: "verified students only", body: "we check your university email at sign-up. no bots, no outsiders, no recruiters." },
            { icon: Lock, title: "encryption, end to end", body: "your password, session, and direct messages are encrypted in transit and at rest. nobody — not even us — can read your dms." },
            { icon: ShieldCheck, title: "anonymous by default", body: "you pick a handle. your real identity never appears on a post, ever." },
            { icon: Sparkles, title: "privacy is the product", body: "no ad targeting. your data is not for sale. ever." },
          ].map((f, i) => (
            <Card key={i} className="p-6 shadow-card">
              <f.icon className="h-5 w-5 text-primary mb-3" />
              <h3 className="text-lg mb-1">{f.title}</h3>
              <p className="text-sm text-muted-foreground">{f.body}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* cta */}
      <section className="max-w-6xl mx-auto px-5 py-20 text-center">
        <h2 className="text-3xl lg:text-5xl font-serif tracking-tight text-balance">
          your campus deserves a better town square.
        </h2>
        <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
          built by students, for students. opinions, confessions, debates, jokes — without
          the surveillance.
        </p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <Link to="/auth">
            <Button size="lg" className="gap-2">
              create your account <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link to="/about">
            <Button size="lg" variant="ghost">read the manifesto</Button>
          </Link>
        </div>
      </section>

      {/* footer */}
      <footer className="border-t border-border/60">
        <div className="max-w-6xl mx-auto px-5 py-8 flex flex-wrap items-center justify-between gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-3.5 w-3.5" />
            <span>unadmitted — campus discourse, kept private.</span>
          </div>
          <div className="flex items-center gap-5">
            <Link to="/about" className="hover:text-foreground">about</Link>
            <Link to="/privacy" className="hover:text-foreground">privacy</Link>
            <Link to="/terms" className="hover:text-foreground">terms</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
