import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { ShieldCheck, Lock, EyeOff, Database, UserX, GraduationCap, ArrowLeft } from "lucide-react";

const pillars = [
  {
    icon: EyeOff,
    title: "We never read your content.",
    body: "No human at ACG Unadmitted reads your posts, comments, DMs, or marketing-bot chats. Ever. There is no internal dashboard to spy on you. There is no analytics team mining your words.",
  },
  {
    icon: UserX,
    title: "We never sell or share your data.",
    body: "Your data is not a product. We do not sell, rent, share, or hand off your information to advertisers, brokers, schools, or any third party. Not now. Not later.",
  },
  {
    icon: Database,
    title: "We store the bare minimum.",
    body: "Only what is technically required to make the app work: your @acg.edu email (for login), your anonymous handle, your posts, votes, and messages. Nothing more. No tracking pixels. No behavioral profiling.",
  },
  {
    icon: Lock,
    title: "Anonymous by design.",
    body: "Your real name is never displayed, never asked, never linked to your posts. Your handle is anonymous and fully editable. Other users cannot see your email.",
  },
  {
    icon: ShieldCheck,
    title: "Your rights, always.",
    body: "You can change your handle, your avatar, delete your posts, delete your messages, and delete your account at any time. When you delete it, it is gone.",
  },
];

const Privacy = () => (
  <div className="min-h-screen bg-background py-12 px-4">
    <div className="max-w-2xl mx-auto">
      <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="h-4 w-4" /> Back
      </Link>
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 mb-4 text-primary">
          <GraduationCap className="h-6 w-6" />
          <span className="font-semibold">ACG Unadmitted</span>
        </div>
        <h1 className="text-5xl font-black mb-3">Your Privacy. Period.</h1>
        <p className="text-muted-foreground max-w-md mx-auto">
          A community is only as safe as the promises behind it. Here are ours — written plainly, with no fine print.
        </p>
      </div>

      <div className="space-y-4 mb-8">
        {pillars.map((p) => (
          <Card key={p.title} className="p-6 shadow-card border-l-4 border-l-primary">
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                  <p.icon className="h-5 w-5" />
                </div>
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold mb-1">{p.title}</h2>
                <p className="text-muted-foreground leading-relaxed">{p.body}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Card className="p-6 shadow-card bg-secondary/40">
        <h3 className="font-bold mb-2">The promise, in one line:</h3>
        <p className="text-lg font-semibold">
          We would <span className="text-primary">never</span> read, store, or use your data beyond what is strictly necessary to run the app.
        </p>
      </Card>

      <p className="text-xs text-muted-foreground text-center mt-6">
        Questions? DM the team handle inside the app. We answer.
      </p>
    </div>
  </div>
);

export default Privacy;
