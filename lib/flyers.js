import { readdir } from "node:fs/promises";
import path from "node:path";

const PARTY_TIMEZONE = process.env.PARTY_TIMEZONE ?? "America/Los_Angeles";
const FLYER_DIRECTORY = path.join(process.cwd(), "public", "party-flyers");
const FLYER_PUBLIC_PATH = "/party-flyers";

const MONTH_NAMES = new Map([
  ["january", 1],
  ["jan", 1],
  ["february", 2],
  ["feb", 2],
  ["march", 3],
  ["mar", 3],
  ["april", 4],
  ["apr", 4],
  ["may", 5],
  ["june", 6],
  ["jun", 6],
  ["july", 7],
  ["jul", 7],
  ["august", 8],
  ["aug", 8],
  ["september", 9],
  ["sep", 9],
  ["sept", 9],
  ["october", 10],
  ["oct", 10],
  ["november", 11],
  ["nov", 11],
  ["december", 12],
  ["dec", 12],
]);

function getTodayParts(now = new Date()) {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: PARTY_TIMEZONE,
    year: "numeric",
    month: "numeric",
    day: "numeric",
  });

  const parts = formatter.formatToParts(now);

  return {
    year: Number(parts.find((part) => part.type === "year")?.value),
    month: Number(parts.find((part) => part.type === "month")?.value),
    day: Number(parts.find((part) => part.type === "day")?.value),
  };
}

function compareDateParts(left, right) {
  if (left.year !== right.year) {
    return left.year - right.year;
  }

  if (left.month !== right.month) {
    return left.month - right.month;
  }

  return left.day - right.day;
}

function parseFlyerDate(fileName) {
  const basename = path.basename(fileName, ".png");
  const lowered = basename.toLowerCase();

  const isoMatch = lowered.match(/(?:^|[^0-9])(20\d{2})[-_ ](\d{1,2})[-_ ](\d{1,2})(?:[^0-9]|$)/);

  if (isoMatch) {
    return {
      year: Number(isoMatch[1]),
      month: Number(isoMatch[2]),
      day: Number(isoMatch[3]),
    };
  }

  const numericMatch = lowered.match(/(?:^|[^0-9])(\d{1,2})[-_ ](\d{1,2})(?:[^0-9]|$)/);

  if (numericMatch) {
    return {
      month: Number(numericMatch[1]),
      day: Number(numericMatch[2]),
    };
  }

  const monthNameMatch = lowered.match(
    /\b(january|jan|february|feb|march|mar|april|apr|may|june|jun|july|jul|august|aug|september|sep|sept|october|oct|november|nov|december|dec)\b[-_ ]*(\d{1,2})\b/,
  );

  if (monthNameMatch) {
    return {
      month: MONTH_NAMES.get(monthNameMatch[1]),
      day: Number(monthNameMatch[2]),
    };
  }

  return null;
}

function getFlyerCandidate(dateParts, today) {
  if (dateParts.year) {
    return compareDateParts(dateParts, today) >= 0 ? dateParts : null;
  }

  const thisYearCandidate = { ...dateParts, year: today.year };

  if (compareDateParts(thisYearCandidate, today) >= 0) {
    return thisYearCandidate;
  }

  return { ...dateParts, year: today.year + 1 };
}

export async function getNextFlyer(now = new Date()) {
  let entries = [];

  try {
    entries = await readdir(FLYER_DIRECTORY, { withFileTypes: true });
  } catch {
    return null;
  }

  const today = getTodayParts(now);
  const flyers = entries
    .filter((entry) => entry.isFile() && entry.name.toLowerCase().endsWith(".png"))
    .map((entry) => {
      const dateParts = parseFlyerDate(entry.name);

      if (!dateParts) {
        return null;
      }

      const candidate = getFlyerCandidate(dateParts, today);

      if (!candidate) {
        return null;
      }

      return {
        fileName: entry.name,
        src: `${FLYER_PUBLIC_PATH}/${entry.name}`,
        dateParts: candidate,
      };
    })
    .filter(Boolean)
    .sort((left, right) => compareDateParts(left.dateParts, right.dateParts));

  return flyers[0] ?? null;
}
