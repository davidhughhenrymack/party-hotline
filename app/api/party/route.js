import { buildSmsReply, getPartyDetails } from "@/lib/party";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const party = getPartyDetails();

  return Response.json({
    ...party,
    smsReply: buildSmsReply(),
  });
}
