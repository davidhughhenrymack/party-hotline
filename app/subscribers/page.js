import { redirect } from "next/navigation";

import { getSmsSubscribers, subscribeSmsNumber } from "@/lib/db/sms";
import { buildOptInReply } from "@/lib/sms";
import { sendSms } from "@/lib/twilio";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export const metadata = {
  title: "SMS Subscribers | SEASONAL PRODUCE",
  description: "Private SMS subscriber status view.",
  robots: {
    index: false,
    follow: false,
  },
};

function redactPhoneNumber(phoneNumber) {
  const visibleDigits = phoneNumber.replace(/\D/g, "").slice(-4);

  if (!visibleDigits) {
    return "**";
  }

  return `**${visibleDigits}`;
}

function formatDate(date) {
  if (!date) {
    return "—";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function normalizeManualPhoneNumber(phoneNumber) {
  const trimmedPhoneNumber = phoneNumber.trim();

  if (trimmedPhoneNumber.startsWith("+")) {
    return `+${trimmedPhoneNumber.slice(1).replace(/\D/g, "")}`;
  }

  const digits = trimmedPhoneNumber.replace(/\D/g, "");

  if (digits.length === 10) {
    return `+1${digits}`;
  }

  if (digits.length === 11 && digits.startsWith("1")) {
    return `+${digits}`;
  }

  return trimmedPhoneNumber;
}

async function addSubscriber(formData) {
  "use server";

  const phoneNumber = normalizeManualPhoneNumber(String(formData.get("phoneNumber") ?? ""));

  if (!phoneNumber.startsWith("+") || phoneNumber.length < 8) {
    redirect("/subscribers?status=invalid");
  }

  await subscribeSmsNumber({
    phoneNumber,
    inboundMessage: "Manually added from /subscribers after external opt-in.",
  });
  await sendSms({
    to: phoneNumber,
    body: buildOptInReply(),
  });

  redirect("/subscribers?status=added");
}

function getStatusMessage(status) {
  if (status === "added") {
    return "Subscriber added and welcome message sent.";
  }

  if (status === "invalid") {
    return "Enter a valid phone number, including country code when needed.";
  }

  return null;
}

export default async function SubscribersPage({ searchParams }) {
  const resolvedSearchParams = await searchParams;
  const statusMessage = getStatusMessage(resolvedSearchParams?.status);
  const subscribers = await getSmsSubscribers();
  const subscribedCount = subscribers.filter(
    (subscriber) => subscriber.status === "subscribed",
  ).length;
  const unsubscribedCount = subscribers.length - subscribedCount;

  return (
    <main className="subscribers-page">
      <section className="subscribers-shell">
        <header className="subscribers-hero">
          <span className="eyebrow">SMS subscribers</span>
          <h1>Phone list status</h1>
          <p className="lede">
            Subscriber phone numbers are redacted for privacy. Use this page to check who
            is currently subscribed before sending broadcasts.
          </p>
        </header>

        <section className="subscriber-stats" aria-label="Subscriber totals">
          <article>
            <span>Total</span>
            <strong>{subscribers.length}</strong>
          </article>
          <article>
            <span>Subscribed</span>
            <strong>{subscribedCount}</strong>
          </article>
          <article>
            <span>Unsubscribed</span>
            <strong>{unsubscribedCount}</strong>
          </article>
        </section>

        <section className="subscribers-card">
          <div className="subscribers-card-header">
            <div>
              <h2>Add subscriber</h2>
              <p>
                Add a number that opted in somewhere else. They will receive the welcome
                text with STOP instructions.
              </p>
            </div>
          </div>
          <form action={addSubscriber} className="subscriber-form">
            <label htmlFor="phoneNumber">Phone number</label>
            <div className="subscriber-form-row">
              <input
                id="phoneNumber"
                name="phoneNumber"
                type="tel"
                placeholder="+1 555 123 4567"
                autoComplete="tel"
                required
              />
              <button type="submit">Add and welcome</button>
            </div>
            {statusMessage ? <p className="subscriber-form-status">{statusMessage}</p> : null}
          </form>
        </section>

        <section className="subscribers-card">
          <div className="subscribers-card-header">
            <h2>Subscribers</h2>
            <span>{subscribers.length} total</span>
          </div>

          {subscribers.length > 0 ? (
            <div className="subscribers-table-wrap">
              <table className="subscribers-table">
                <thead>
                  <tr>
                    <th scope="col">Phone</th>
                    <th scope="col">Status</th>
                    <th scope="col">Last inbound</th>
                    <th scope="col">Subscribed</th>
                    <th scope="col">Unsubscribed</th>
                  </tr>
                </thead>
                <tbody>
                  {subscribers.map((subscriber) => (
                    <tr key={subscriber.phoneNumber}>
                      <td className="subscriber-phone">
                        {redactPhoneNumber(subscriber.phoneNumber)}
                      </td>
                      <td>
                        <span className={`status-pill status-pill-${subscriber.status}`}>
                          {subscriber.status}
                        </span>
                      </td>
                      <td>{formatDate(subscriber.lastInboundAt)}</td>
                      <td>{formatDate(subscriber.subscribedAt)}</td>
                      <td>{formatDate(subscriber.unsubscribedAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="subscribers-empty">No SMS subscribers yet.</p>
          )}
        </section>
      </section>
    </main>
  );
}
