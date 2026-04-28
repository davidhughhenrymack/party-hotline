import twilio from "twilio";

let cachedClient = null;

function getTwilioClient() {
  if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
    throw new Error("Missing TWILIO_ACCOUNT_SID or TWILIO_AUTH_TOKEN.");
  }

  if (!cachedClient) {
    cachedClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
  }

  return cachedClient;
}

function getSenderConfig() {
  const messagingServiceSid = process.env.TWILIO_MESSAGING_SERVICE_SID;
  const from =
    process.env.TWILIO_PHONE_NUMBER ||
    process.env.TWILIO_FROM_NUMBER ||
    process.env.TWILIO_SMS_NUMBER;

  if (messagingServiceSid) {
    return { messagingServiceSid };
  }

  if (from) {
    return { from };
  }

  throw new Error(
    "Missing Twilio sender. Set TWILIO_MESSAGING_SERVICE_SID or TWILIO_PHONE_NUMBER.",
  );
}

export async function sendSms({ to, body }) {
  return getTwilioClient().messages.create({
    ...getSenderConfig(),
    to,
    body,
  });
}
