import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { ShieldCheck, Lock, EyeOff, Database, UserX, GraduationCap, ArrowLeft, Scale } from "lucide-react";

export const PRIVACY_VERSION = "2026-05-06";

const pillars = [
  {
    icon: EyeOff,
    title: "We never read your content.",
    body: "No human reads your posts, comments, DMs, or marketing-bot chats for profiling or analytics. There is no internal dashboard to spy on you.",
  },
  {
    icon: UserX,
    title: "We never sell or share your data.",
    body: "Your data is not a product. We do not sell, rent, or share your information with advertisers, brokers, schools, or third parties — except as legally required (see &ldquo;Legal disclosure&rdquo; below).",
  },
  {
    icon: Database,
    title: "We store the bare minimum.",
    body: "Only what is technically required to run the app: your university email (for login), your anonymous handle, your posts, votes, and messages.",
  },
  {
    icon: Lock,
    title: "Anonymous by design.",
    body: "Your real name is never displayed, never asked, never linked to your posts. Other users cannot see your email — only the operator and admins can, for moderation and legal compliance.",
  },
  {
    icon: ShieldCheck,
    title: "Your rights, always.",
    body: "Under GDPR you can access, correct, export, restrict, or delete your data at any time. See &ldquo;Your rights&rdquo; below.",
  },
];

const Block = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <Card className="p-6 shadow-card">
    <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
      <Scale className="h-5 w-5 text-primary" /> {title}
    </h2>
    <div className="text-muted-foreground leading-relaxed text-sm space-y-2">{children}</div>
  </Card>
);

const Privacy = () => (
  <div className="min-h-screen bg-background py-12 px-4">
    <div className="max-w-2xl mx-auto">
      <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="h-4 w-4" /> Back
      </Link>
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 mb-4 text-primary">
          <GraduationCap className="h-6 w-6" />
          <span className="font-semibold">Unadmitted</span>
        </div>
        <h1 className="text-5xl font-black mb-3">Your Privacy. Period.</h1>
        <p className="text-muted-foreground max-w-md mx-auto">
          Version {PRIVACY_VERSION}. Written plainly, with no fine print.
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
                <p className="text-muted-foreground leading-relaxed" dangerouslySetInnerHTML={{ __html: p.body }} />
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="space-y-4">
        <Block title="Data controller">
          <p>
            The data controller for this service is the operator, reachable at{" "}
            <a className="text-primary hover:underline" href="mailto:unadmittedfun@gmail.com">
              unadmittedfun@gmail.com
            </a>
            . The platform is independent and not operated by any university.
          </p>
        </Block>

        <Block title="What we collect & why (lawful basis)">
          <ul className="list-disc pl-5 space-y-1">
            <li><strong className="text-foreground">University email</strong> — to verify you belong to the community. Lawful basis: contract performance (Art. 6(1)(b) GDPR).</li>
            <li><strong className="text-foreground">Password (hashed)</strong> — to authenticate you. Lawful basis: contract.</li>
            <li><strong className="text-foreground">Anonymous handle, posts, comments, votes, DMs</strong> — to provide the service you signed up for. Lawful basis: contract.</li>
            <li><strong className="text-foreground">Avatar (optional)</strong> — only if you upload one. Lawful basis: consent, withdrawable any time.</li>
            <li><strong className="text-foreground">Email send/suppression logs</strong> — to deliver verification & notification emails and respect unsubscribes. Lawful basis: legitimate interest in reliable delivery.</li>
            <li><strong className="text-foreground">Payment metadata</strong> (if you buy a promotion) — handled by Stripe. We never see your card. Lawful basis: contract.</li>
          </ul>
          <p>We do <strong className="text-foreground">not</strong> use cookies for tracking or advertising. No third-party analytics, no ad pixels.</p>
        </Block>

        <Block title="Who can see what">
          <ul className="list-disc pl-5 space-y-1">
            <li><strong className="text-foreground">Other users</strong> see only your anonymous handle, avatar, and content you publish.</li>
            <li><strong className="text-foreground">The operator (sole admin)</strong> can see emails for moderation, abuse response, and legal compliance.</li>
            <li><strong className="text-foreground">Sub-processors</strong>: Supabase (hosting/database, EU region), Stripe (payments), and Mailgun (transactional email via Lovable). They process data on our behalf under DPAs.</li>
          </ul>
        </Block>

        <Block title="Retention">
          <ul className="list-disc pl-5 space-y-1">
            <li>Account data: kept while your account exists.</li>
            <li>Deleted posts/comments: removed within 30 days from backups.</li>
            <li>Email send logs: 12 months for deliverability/audit.</li>
            <li>Suppression list (unsubscribes/bounces): kept indefinitely to honor your opt-out (legal requirement).</li>
            <li>Payment records: kept as long as required by Greek tax law (typically 5 years).</li>
          </ul>
        </Block>

        <Block title="Your rights (GDPR)">
          <p>You have the right to:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Access a copy of your data.</li>
            <li>Correct inaccurate data.</li>
            <li>Delete your account and data (&ldquo;right to be forgotten&rdquo;).</li>
            <li>Export your data in a portable format.</li>
            <li>Restrict or object to processing.</li>
            <li>Withdraw consent at any time.</li>
            <li>Lodge a complaint with the Hellenic Data Protection Authority (
              <a href="https://www.dpa.gr" target="_blank" rel="noreferrer" className="text-primary hover:underline">www.dpa.gr</a>
              ).</li>
          </ul>
          <p>
            To exercise any right, email{" "}
            <a className="text-primary hover:underline" href="mailto:unadmittedfun@gmail.com">
              unadmittedfun@gmail.com
            </a>
            . We respond within 30 days.
          </p>
        </Block>

        <Block title="Legal disclosure">
          <p>
            We will only disclose user data when compelled by a valid legal order under Greek/EU law,
            or when necessary to prevent imminent harm to life. Such requests are reviewed individually.
          </p>
        </Block>

        <Block title="Security">
          <p>
            Data is encrypted in transit (TLS) and at rest. Passwords are hashed. Access is restricted
            via Row-Level Security policies; the database is hosted in the EU.
          </p>
        </Block>

        <Block title="International transfers">
          <p>
            Data is stored in the EU. Some sub-processors (e.g. Stripe) may transfer data outside the
            EU under Standard Contractual Clauses approved by the European Commission.
          </p>
        </Block>

        <Block title="Children">
          <p>
            The service is not intended for users under 16. If you become aware of an underage user,
            contact us and we will delete the account.
          </p>
        </Block>

        <Block title="Changes">
          <p>
            We may update this policy. Material changes will be announced in-app. The version date at
            the top of this page is the current effective version.
          </p>
        </Block>
      </div>

      <Card className="p-6 shadow-card bg-secondary/40 mt-6">
        <h3 className="font-bold mb-2">The promise, in one line:</h3>
        <p className="text-lg font-semibold">
          We would <span className="text-primary">never</span> read, store, or use your data beyond
          what is strictly necessary to run the app.
        </p>
      </Card>

      <p className="text-xs text-muted-foreground text-center mt-6">
        Questions? Email{" "}
        <a className="text-primary hover:underline" href="mailto:unadmittedfun@gmail.com">
          unadmittedfun@gmail.com
        </a>
        .
      </p>
    </div>
  </div>
);

export default Privacy;
