import SunCalc from "suncalc";

const PARTY_DATES = [
  { month: 5, day: 2 },
  { month: 7, day: 11 },
  { month: 8, day: 1 },
  { month: 10, day: 3 },
  { month: 12, day: 5 },
];

const PARTY_LOCATION = {
  venue: process.env.PARTY_VENUE ?? "The Studio",
  city: process.env.PARTY_CITY ?? "Truckee",
  latitude: Number(process.env.PARTY_LATITUDE ?? "39.32796"),
  longitude: Number(process.env.PARTY_LONGITUDE ?? "-120.18325"),
  timezone: process.env.PARTY_TIMEZONE ?? "America/Los_Angeles",
};

function getDateParts(date, timeZone) {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "numeric",
    day: "numeric",
  });

  const parts = formatter.formatToParts(date);

  return {
    year: Number(parts.find((part) => part.type === "year")?.value),
    month: Number(parts.find((part) => part.type === "month")?.value),
    day: Number(parts.find((part) => part.type === "day")?.value),
  };
}

function getTimeZoneOffsetMilliseconds(date, timeZone) {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });

  const parts = formatter.formatToParts(date);
  const values = Object.fromEntries(
    parts
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, part.value]),
  );

  const renderedAsUtc = Date.UTC(
    Number(values.year),
    Number(values.month) - 1,
    Number(values.day),
    Number(values.hour),
    Number(values.minute),
    Number(values.second),
  );

  return renderedAsUtc - date.getTime();
}

function zonedTimeToUtc({ year, month, day, hour = 0, minute = 0, second = 0 }, timeZone) {
  const utcGuess = Date.UTC(year, month - 1, day, hour, minute, second);
  const offset = getTimeZoneOffsetMilliseconds(new Date(utcGuess), timeZone);
  return new Date(utcGuess - offset);
}

function getNextPartyDate(now = new Date()) {
  const today = getDateParts(now, PARTY_LOCATION.timezone);

  for (const year of [today.year, today.year + 1]) {
    for (const partyDate of PARTY_DATES) {
      const candidate =
        year > today.year ||
        partyDate.month > today.month ||
        (partyDate.month === today.month && partyDate.day >= today.day);

      if (candidate) {
        return { year, ...partyDate };
      }
    }
  }

  return { year: today.year + 1, ...PARTY_DATES[0] };
}

function formatPartyDate(nextPartyDate) {
  const date = zonedTimeToUtc(
    { ...nextPartyDate, hour: 12, minute: 0, second: 0 },
    PARTY_LOCATION.timezone,
  );

  return new Intl.DateTimeFormat("en-US", {
    timeZone: PARTY_LOCATION.timezone,
    month: "long",
    day: "numeric",
  }).format(date);
}

function formatRecurringPartyDate(partyDate) {
  return formatPartyDate({ year: 2026, ...partyDate });
}

function getSunsetDate(nextPartyDate) {
  const localNoon = zonedTimeToUtc(
    { ...nextPartyDate, hour: 12, minute: 0, second: 0 },
    PARTY_LOCATION.timezone,
  );

  return SunCalc.getTimes(localNoon, PARTY_LOCATION.latitude, PARTY_LOCATION.longitude).sunset;
}

function formatSunset(nextPartyDate) {
  const sunset = getSunsetDate(nextPartyDate);

  return new Intl.DateTimeFormat("en-US", {
    timeZone: PARTY_LOCATION.timezone,
    hour: "numeric",
    minute: "2-digit",
  }).format(sunset);
}

export function getPartyDetails(now = new Date()) {
  const nextPartyDate = getNextPartyDate(now);
  const dateLabel = formatPartyDate(nextPartyDate);
  const sunsetLabel = formatSunset(nextPartyDate);

  return {
    location: `${PARTY_LOCATION.venue}, ${PARTY_LOCATION.city}`,
    venue: PARTY_LOCATION.venue,
    city: PARTY_LOCATION.city,
    nextPartyDate,
    dateLabel,
    sunsetLabel,
    schedule: PARTY_DATES.map(formatRecurringPartyDate),
  };
}

export function buildSmsReply(now = new Date()) {
  const party = getPartyDetails(now);

  return `The next party is at ${party.location} on ${party.dateLabel}. It starts at sunset, around ${party.sunsetLabel}.`;
}
