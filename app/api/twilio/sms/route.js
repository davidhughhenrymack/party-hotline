import { twiml } from "twilio";

import { subscribeSmsNumber, unsubscribeSmsNumber } from "@/lib/db/sms";
import { buildSmsReply } from "@/lib/party";
import { buildOptInReply, buildOptOutReply, getInboundSmsIntent } from "@/lib/sms";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  return Response.json({
    ok: true,
    message: "Send a POST request from Twilio to receive TwiML.",
    preview: {
      optIn: buildOptInReply(),
      partyNotification: buildSmsReply(),
      optOut: buildOptOutReply(),
    },
  });
}

export async function POST(request) {
  const formData = await request.formData();
  const inboundBody = String(formData.get("Body") ?? "");
  const inboundPhoneNumber = String(formData.get("From") ?? "");
  const intent = getInboundSmsIntent(inboundBody);
  const messagingResponse = new twiml.MessagingResponse();
  const reply = intent === "opt-out" ? buildOptOutReply() : buildOptInReply();

  if (intent === "opt-out") {
    await unsubscribeSmsNumber({
      phoneNumber: inboundPhoneNumber,
      inboundMessage: inboundBody,
    });
  } else {
    await subscribeSmsNumber({
      phoneNumber: inboundPhoneNumber,
      inboundMessage: inboundBody,
    });
  }

  messagingResponse.message(reply);

  return new Response(messagingResponse.toString(), {
    headers: {
      "Content-Type": "text/xml; charset=utf-8",
    },
  });
}
