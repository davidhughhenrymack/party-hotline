import { OPT_IN_KEYWORD, OPT_OUT_KEYWORD, SMS_PROGRAM_NAME } from "@/lib/sms";

export const metadata = {
  title: "Privacy Policy | SEASONAL PRODUCE",
  description: "Privacy policy for Truckee Partyline SMS subscriptions.",
  alternates: {
    canonical: "/privacy",
  },
};

const lastUpdated = "April 28, 2026";

export default function PrivacyPage() {
  return (
    <main className="compliance-page">
      <section className="page-shell privacy-shell">
        <header className="compliance-section compliance-hero privacy-hero">
          <span className="eyebrow">Privacy policy</span>
          <h1>We keep subscription information private.</h1>
          <p className="lede">
            {SMS_PROGRAM_NAME} is based in California, USA. This policy explains how we
            handle SMS subscription information and the choices subscribers have.
          </p>
          <p className="privacy-updated">Last updated: {lastUpdated}</p>
        </header>

        <section className="privacy-policy">
          <article>
            <h2>Information we collect</h2>
            <p>
              When someone joins the {SMS_PROGRAM_NAME} text list, we collect the phone
              number that contacted us, subscription status, opt-in and opt-out
              timestamps, and basic SMS history needed to manage the subscription.
            </p>
          </article>

          <article>
            <h2>How we use it</h2>
            <p>
              We use subscription information to send party-related SMS messages,
              confirm opt-ins, process opt-outs, maintain our subscriber list, prevent
              unwanted messages, and comply with applicable laws and carrier rules.
            </p>
          </article>

          <article>
            <h2>How we protect it</h2>
            <p>
              We treat SMS subscription information as private. We do not sell subscriber
              phone numbers, and we do not share them for third-party marketing. Access
              is limited to people and service providers who need it to operate the text
              list.
            </p>
          </article>

          <article>
            <h2>Legal compliance</h2>
            <p>
              We intend to respect all applicable privacy, telecommunications, and
              consumer protection laws that apply in California and the United States.
              That includes, where applicable, the Telephone Consumer Protection Act
              (TCPA), FCC text messaging and consent rules, the California Consumer
              Privacy Act as amended by the California Privacy Rights Act (CCPA/CPRA),
              and the California Online Privacy Protection Act (CalOPPA). Subscribers
              should only receive messages after opting in or otherwise giving
              permission.
            </p>
          </article>

          <article>
            <h2>Subscriber choices</h2>
            <p>
              Subscribers can text <code>{OPT_OUT_KEYWORD}</code> at any time to leave
              the list. They can text <code>{OPT_IN_KEYWORD}</code> later if they want
              to join again.
            </p>
          </article>

          <article>
            <h2>Retention</h2>
            <p>
              We keep subscription records for as long as needed to operate the text
              list, honor opt-out requests, resolve issues, and meet legal or compliance
              obligations.
            </p>
          </article>

          <article>
            <h2>Questions</h2>
            <p>
              If someone has questions about their subscription information, they can
              contact us through the same public channels used for {SMS_PROGRAM_NAME}.
            </p>
          </article>
        </section>
      </section>
    </main>
  );
}
