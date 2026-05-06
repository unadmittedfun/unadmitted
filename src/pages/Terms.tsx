import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { GraduationCap, ArrowLeft } from "lucide-react";

export const TERMS_VERSION = "2026-05-06";

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <Card className="p-6 shadow-card">
    <h2 className="text-xl font-bold mb-2">{title}</h2>
    <div className="text-muted-foreground leading-relaxed space-y-2 text-sm">{children}</div>
  </Card>
);

const Terms = () => (
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
        <h1 className="text-5xl font-black mb-3">Terms of Service</h1>
        <p className="text-muted-foreground">
          Version {TERMS_VERSION}. Plain English. Read it.
        </p>
      </div>

      <div className="space-y-4">
        <Section title="1. What this is">
          <p>
            Unadmitted is an independent, student-run anonymous community board. It is{" "}
            <strong className="text-foreground">not affiliated with, endorsed by, or operated by</strong>{" "}
            ACG, Deree, or any other university. Posts on the platform are user-generated and do not
            represent the views of the operator or any institution.
          </p>
        </Section>

        <Section title="2. Eligibility">
          <p>
            You must (a) be at least 16 years old, (b) hold a valid email address from a participating
            university domain, and (c) be a current student, alumnus, or affiliate of that institution.
            One account per person.
          </p>
        </Section>

        <Section title="3. Acceptable use">
          <p>You agree NOT to post, send, or upload:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Content that names, identifies, or targets a specific real person by surname (1st Amendment of the platform).</li>
            <li>Hate speech, harassment, threats, sexual content involving minors, or incitement to violence.</li>
            <li>Doxxing, private personal information, or sexual images of any identifiable person.</li>
            <li>Illegal content, malware, or content that infringes intellectual property rights.</li>
            <li>Commercial advertising outside of the official Marketing flow (2nd Amendment of the platform).</li>
            <li>Spam, scams, or coordinated manipulation.</li>
          </ul>
          <p>
            We may remove any content and suspend or terminate accounts that violate these rules,
            with or without notice.
          </p>
        </Section>

        <Section title="4. Anonymity is not a shield">
          <p>
            The platform is anonymous to other users, but your account is tied to your university email.
            If we receive a valid legal order (court subpoena, law-enforcement request under Greek/EU law),
            or if content endangers life, we may be required to disclose account information to the
            relevant authority. Don&apos;t commit crimes here.
          </p>
        </Section>

        <Section title="5. Reporting & moderation">
          <p>
            Every post and comment can be reported. The moderation team reviews reports and may remove
            content or accounts. Moderation decisions are final but you may appeal by contacting the
            operator (see &ldquo;Contact&rdquo; below).
          </p>
        </Section>

        <Section title="6. Paid promotions">
          <p>
            Marketing posts are paid placements purchased through Stripe Checkout. All sales are final
            once a promotion has been published. Refunds are at the operator&apos;s discretion and only
            available if the promotion has not yet been delivered.
          </p>
        </Section>

        <Section title="7. Your content, your responsibility">
          <p>
            You retain ownership of what you post. By posting, you grant the operator a non-exclusive,
            royalty-free license to host, display, and distribute your content within the platform for
            the sole purpose of running the service. You are solely responsible for the legality of your
            content.
          </p>
        </Section>

        <Section title="8. Disclaimers">
          <p>
            The service is provided &ldquo;as is&rdquo; without warranties of any kind. The operator is
            not liable for user-generated content, downtime, data loss, or any indirect damages, to the
            maximum extent permitted by law. Nothing in these terms limits liability for gross negligence
            or willful misconduct as required by Greek/EU law.
          </p>
        </Section>

        <Section title="9. Termination">
          <p>
            You may delete your account at any time. We may suspend or delete accounts that violate
            these terms. On deletion, your profile and posts are removed; aggregated/anonymized data
            and legally-required logs may be retained for the period defined in the Privacy Policy.
          </p>
        </Section>

        <Section title="10. Governing law">
          <p>
            These terms are governed by the laws of the Hellenic Republic (Greece) and applicable EU
            regulations (incl. GDPR and the Digital Services Act). Disputes are subject to the
            jurisdiction of the courts of Athens, Greece, without prejudice to your mandatory consumer
            rights.
          </p>
        </Section>

        <Section title="11. Changes">
          <p>
            We may update these terms. Material changes will be announced in-app and you may be asked
            to re-accept. The version date at the top of this page is the current effective version.
          </p>
        </Section>

        <Section title="12. Contact">
          <p>
            Operator contact: <a className="text-primary hover:underline" href="mailto:v.mastrogiannoudis@acg.edu">v.mastrogiannoudis@acg.edu</a>.
            For privacy/data requests, see the{" "}
            <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link>.
          </p>
        </Section>
      </div>
    </div>
  </div>
);

export default Terms;
