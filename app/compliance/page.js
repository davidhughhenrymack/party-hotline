import { buildOptInReply, buildOptOutReply, OPT_IN_KEYWORD, SMS_PROGRAM_NAME } from "@/lib/sms";

export const metadata = {
  title: "SMS Compliance | SEASONAL PRODUCE",
  description:
    "SMS opt-in, notification, and opt-out flow for SEASONAL PRODUCE party text messages.",
  alternates: {
    canonical: "/compliance",
  },
};

const smsNumberLabel = "our published SMS number";
const examplePartyNotification =
  "The next party is at a neighborhood venue on June 21. It starts at sunset 8:30 PM. Reply STOP to hop off.";

function SmsMessage({ sender, variant, children }) {
  return (
    <div className={`sms-message sms-message-${variant}`}>
      <span className={`sms-avatar ${sender.length === 1 ? "sms-avatar-initial" : ""}`}>
        {sender}
      </span>
      <p>{children}</p>
    </div>
  );
}

export default function CompliancePage() {
  return (
    <main className="compliance-page">
      <section className="page-shell">
        <div className="compliance-section compliance-hero">
          <span className="eyebrow">Truckee Partyline SMS compliance</span>
          <h1>How people join, receive, and leave the text list.</h1>
          <p className="lede">
            {SMS_PROGRAM_NAME} uses a simple, user-initiated SMS flow. People start the
            conversation by texting {OPT_IN_KEYWORD} to {smsNumberLabel}, receive a
            confirmation, see opt-out instructions on every party notification, and can
            stop or restart the messages at any time.
          </p>
        </div>

        <section className="compliance-section">
          <span className="eyebrow">Opt-in flow</span>
          <div className="compliance-steps">
            <article>
              <strong>1. A person texts us first.</strong>
              <p>
                The public instruction is to text <code>{OPT_IN_KEYWORD}</code> to the
                SMS number. Operationally, any first inbound message from an unknown
                number is treated as a request to join the party text list.
              </p>
              <SmsMessage sender="Guest" variant="guest">
                {OPT_IN_KEYWORD}
              </SmsMessage>
            </article>
            <article>
              <strong>2. We confirm the subscription.</strong>
              <p>
                The reply tells the person they are subscribed and gives the required
                STOP instruction before any future party notices are sent.
              </p>
              <SmsMessage sender="P" variant="partyline">
                {buildOptInReply()}
              </SmsMessage>
            </article>
            <article>
              <strong>3. Every notification includes opt-out language.</strong>
              <p>
                Party messages are informational and end with a clear instruction to
                reply <code>STOP</code> to unsubscribe.
              </p>
              <SmsMessage sender="P" variant="partyline">
                {examplePartyNotification}
              </SmsMessage>
            </article>
          </div>
        </section>

        <section className="compliance-section">
          <span className="eyebrow">Opt-out flow</span>
          <div className="compliance-steps">
            <article>
              <strong>1. A subscriber texts STOP.</strong>
              <p>
                A subscribed person can leave the text list at any time by replying{" "}
                <code>STOP</code> to any party notification.
              </p>
              <SmsMessage sender="Guest" variant="guest">
                STOP
              </SmsMessage>
            </article>
            <article>
              <strong>2. We remove them and confirm.</strong>
              <p>
                When someone texts <code>STOP</code>, they are removed from the text
                list and receive a friendly goodbye message.
              </p>
              <SmsMessage sender="P" variant="partyline">
                {buildOptOutReply()}
              </SmsMessage>
            </article>
            <article>
              <strong>3. They can start again later.</strong>
              <p>
                A previously unsubscribed person can text <code>{OPT_IN_KEYWORD}</code>{" "}
                again when they want back in. That starts the opt-in flow from the top.
              </p>
              <SmsMessage sender="Guest" variant="guest">
                {OPT_IN_KEYWORD}
              </SmsMessage>
            </article>
          </div>
        </section>

      </section>
    </main>
  );
}
