export const SMS_PROGRAM_NAME = "Truckee Partyline";
export const OPT_IN_KEYWORD = "PARTY";
export const OPT_OUT_KEYWORD = "STOP";

const OPT_OUT_KEYWORDS = new Set([
  OPT_OUT_KEYWORD,
  "STOPALL",
  "UNSUBSCRIBE",
  "CANCEL",
  "END",
  "QUIT",
]);

export function getInboundSmsIntent(body = "") {
  const normalizedBody = body.trim().toUpperCase();

  if (OPT_OUT_KEYWORDS.has(normalizedBody)) {
    return "opt-out";
  }

  return "opt-in";
}

export function buildOptInReply() {
  return `Welcoem to ${SMS_PROGRAM_NAME}. We'll hit this number with party details when it's time. Reply STOP to hear about no more cool parties.`;
}

export function buildOptOutReply() {
  return `You've left ${SMS_PROGRAM_NAME}. All good. Text ${OPT_IN_KEYWORD} whenever you want back in.`;
}

export function appendOptOutInstructions(message) {
  return `${message} Reply STOP to hop off.`;
}
