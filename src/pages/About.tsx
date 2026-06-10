import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Lock, ShieldCheck, GraduationCap, Users, Code2, Mail } from "lucide-react";

const About = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border/60">
        <div className="max-w-3xl mx-auto px-5 py-4 flex items-center justify-between">
          <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> back
          </Link>
          <Link to="/auth"><Button size="sm" variant="outline">sign in</Button></Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-5 py-12 lg:py-16 space-y-12">
        <section>
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">about</p>
          <h1 className="text-4xl lg:text-6xl font-serif tracking-tight leading-[1.05] text-balance">
            a town square for the people who actually live there.
          </h1>
          <p className="mt-6 text-lg text-muted-foreground text-pretty">
            unadmitted is a private discourse layer for university communities. every account is
            tied to a verified .edu address, every post is anonymous, and nothing is sold to
            advertisers. the goal is simple: give students one place to speak honestly without
            handing their identity to a corporation.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-serif">the problem</h2>
          <p className="text-muted-foreground">
            public social media collapsed the audience. when a freshman posts a complaint about
            a midterm, the algorithm shows it to the professor, the dean, future employers, and
            strangers in another country. predictably, students stopped saying anything real.
            campus discourse moved to closed group chats — fragmented, ephemeral, exclusionary.
          </p>
          <p className="text-muted-foreground">
            the result is a campus that looks quiet from the outside and is loud everywhere
            else. we lost the shared space.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-serif">how unadmitted works</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { icon: GraduationCap, title: "verified at the door", body: "sign-up checks your university email domain. if you aren't a student, you don't get in." },
              { icon: Users, title: "anonymous handles", body: "each account picks a handle. your legal name and email are never shown on posts." },
              { icon: Lock, title: "end-to-end encrypted dms", body: "direct messages are encrypted on your device. we cannot read them. neither can anyone else." },
              { icon: ShieldCheck, title: "no ad targeting", body: "no third-party trackers, no selling data, no behavioral profiling. ads, if any, are flat sponsorships." },
            ].map((f, i) => (
              <Card key={i} className="p-5 shadow-card">
                <f.icon className="h-5 w-5 text-primary mb-2" />
                <h3 className="text-base mb-1">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.body}</p>
              </Card>
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-serif">privacy, plainly</h2>
          <ul className="space-y-2 text-muted-foreground text-sm list-disc pl-5">
            <li>your email is stored only to verify you belong to a community. it is never shown to other users.</li>
            <li>direct messages use end-to-end encryption. the server stores ciphertext only.</li>
            <li>we do not run google analytics, facebook pixel, or any third-party behavioral tracker.</li>
            <li>posts can be deleted by their author at any time, and the database row is removed.</li>
            <li>account deletion wipes your profile, posts, votes, and message keys.</li>
          </ul>
          <p className="text-xs text-muted-foreground">
            the full policy lives in <Link to="/privacy" className="underline">privacy</Link> and{" "}
            <Link to="/terms" className="underline">terms</Link>.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-serif">community rules</h2>
          <p className="text-muted-foreground">
            anonymity is a tool, not a shield. we enforce a short, public set of rules — no
            harassment, no doxxing, no hate speech, no targeting individuals by name. moderation
            is community-led with clear appeals. the full ruleset is part of sign-up.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-serif">who is building this</h2>
          <p className="text-muted-foreground">
            unadmitted is an independent student project. it is being shown to faculty, peers,
            and student-life offices for feedback before broader rollout. the codebase is small,
            the team is smaller, and the design choices are intentional.
          </p>
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <Code2 className="h-3.5 w-3.5" /> react · typescript · tailwind · postgres · row-level security
          </div>
        </section>

        <section className="border-t border-border/60 pt-10">
          <h2 className="text-2xl font-serif mb-3">get in touch</h2>
          <p className="text-muted-foreground mb-5">
            faculty, student leaders, or anyone curious — we'd love your feedback before the
            next campus goes live.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <a href="mailto:unadmittedfun@gmail.com">
              <Button className="gap-2"><Mail className="h-4 w-4" /> unadmittedfun@gmail.com</Button>
            </a>
            <Link to="/auth">
              <Button variant="outline">create an account</Button>
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-border/60 mt-12">
        <div className="max-w-3xl mx-auto px-5 py-6 text-xs text-muted-foreground flex items-center justify-between">
          <span>unadmitted</span>
          <div className="flex items-center gap-4">
            <Link to="/privacy" className="hover:text-foreground">privacy</Link>
            <Link to="/terms" className="hover:text-foreground">terms</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default About;
