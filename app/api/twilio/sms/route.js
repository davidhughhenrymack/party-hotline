import { twiml } from "twilio";

import { buildSmsReply } from "@/lib/party";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  return Response.json({
    ok: true,
    message: "Send a POST request from Twilio to receive TwiML.",
    preview: buildSmsReply(),
  });
}

export async function POST() {
  const messagingResponse = new twiml.MessagingResponse();
  messagingResponse.message(buildSmsReply());

  return new Response(messagingResponse.toString(), {
    headers: {
      "Content-Type": "text/xml; charset=utf-8",
    },
  });
}
