import * as cheerio from "cheerio";

const SKY_URL = "https://www.skysports.com/watch/sport-on-sky";
const TV24_URL = "https://tv24.co.uk/sports";

function normaliseSport(text = "") {
  const value = text.toLowerCase();

  if (value.includes("football")) return "football";
  if (value.includes("rugby")) return "rugby";
  if (value.includes("darts")) return "darts";
  if (value.includes("f1") || value.includes("formula 1") || value.includes("motor")) return "f1";

  return "other";
}

function normaliseChannel(text = "") {
  const value = text.toLowerCase();

  if (value.includes("sky")) return "SKY";
  if (value.includes("tnt")) return "TNT";
  if (value.includes("bbc")) return "BBC";
  if (value.includes("itv")) return "ITV";
  if (value.includes("amazon")) return "AMAZON";

  return "OTHER";
}

function todayDateString() {
  const now = new Date();
  return now.toISOString().slice(0, 10);
}

function cleanText(value = "") {
  return value.replace(/\s+/g, " ").trim();
}

function uniqueFixtures(fixtures) {
  const seen = new Set();

  return fixtures.filter((fixture) => {
    const key = [
      fixture.source,
      fixture.sport,
      fixture.title,
      fixture.time,
      fixture.channel,
      fixture.date
    ].join("|");

    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

async function fetchHtml(url) {
  const response = await fetch(url, {
    headers: {
      "user-agent": "Mozilla/5.0 DukeMatchdayApp/1.0"
    }
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status}`);
  }

  return response.text();
}

/**
 * SKY SPORTS PARSER
 * These selectors are best-effort and may need adjusting if the site changes.
 */
function parseSkySports(html) {
  const $ = cheerio.load(html);
  const fixtures = [];

  // Try several likely card/list selectors to make it more resilient.
  const candidateSelectors = [
    "[class*='event']",
    "[class*='Event']",
    "[class*='schedule'] [class*='item']",
    "[class*='Schedule'] [class*='Item']",
    "article",
    "li"
  ];

  const nodes = [];

  candidateSelectors.forEach((selector) => {
    $(selector).each((_, el) => {
      nodes.push(el);
    });
  });

  nodes.forEach((el, index) => {
    const text = cleanText($(el).text());
    if (!text) return;

    const lower = text.toLowerCase();

    // only keep sports we care about
    if (
      !lower.includes("football") &&
      !lower.includes("rugby") &&
      !lower.includes("darts") &&
      !lower.includes("f1") &&
      !lower.includes("formula 1")
    ) {
      return;
    }

    const timeMatch = text.match(/\b([01]?\d|2[0-3]):([0-5]\d)\b/);
    const time = timeMatch ? timeMatch[0] : "00:00";

    let sport = "other";
    if (lower.includes("football")) sport = "football";
    if (lower.includes("rugby")) sport = "rugby";
    if (lower.includes("darts")) sport = "darts";
    if (lower.includes("f1") || lower.includes("formula 1")) sport = "f1";

    // rough title extraction fallback
    const title =
      cleanText(
        $(el).find("h1,h2,h3,h4,strong,b,[class*='title'],[class*='Title']").first().text()
      ) || text.slice(0, 120);

    const channelText =
      cleanText(
        $(el).find("[class*='channel'],[class*='Channel']").first().text()
      ) ||
      (lower.includes("sky sports") ? text.match(/Sky Sports[^|,]*/i)?.[0] : "") ||
      "Sky Sports";

    fixtures.push({
      id: `sky-${index}-${title}-${time}`.replace(/\s+/g, "-"),
      source: "Sky Sports",
      sport,
      date: todayDateString(),
      time,
      title,
      channel: channelText,
      code: normaliseChannel(channelText)
    });
  });

  return fixtures;
}

/**
 * TV24 PARSER
 * These selectors are also best-effort and may need adjusting if the site changes.
 */
function parseTv24(html) {
  const $ = cheerio.load(html);
  const fixtures = [];

  const candidateSelectors = [
    "[class*='programme']",
    "[class*='program']",
    "[class*='listing']",
    "[class*='event']",
    "article",
    "li"
  ];

  const nodes = [];

  candidateSelectors.forEach((selector) => {
    $(selector).each((_, el) => {
      nodes.push(el);
    });
  });

  nodes.forEach((el, index) => {
    const text = cleanText($(el).text());
    if (!text) return;

    const lower = text.toLowerCase();

    if (
      !lower.includes("football") &&
      !lower.includes("rugby") &&
      !lower.includes("darts") &&
      !lower.includes("f1") &&
      !lower.includes("formula 1") &&
      !lower.includes("motor")
    ) {
      return;
    }

    const timeMatch = text.match(/\b([01]?\d|2[0-3]):([0-5]\d)\b/);
    const time = timeMatch ? timeMatch[0] : "00:00";

    let sport = "other";
    if (lower.includes("football")) sport = "football";
    if (lower.includes("rugby")) sport = "rugby";
    if (lower.includes("darts")) sport = "darts";
    if (lower.includes("f1") || lower.includes("formula 1") || lower.includes("motor")) sport = "f1";

    const title =
      cleanText(
        $(el).find("h1,h2,h3,h4,strong,b,[class*='title'],[class*='Title']").first().text()
      ) || text.slice(0, 120);

    const channelText =
      cleanText(
        $(el).find("[class*='channel'],[class*='Channel']").first().text()
      ) ||
      text.match(/TNT Sports\s*\d+|Sky Sports[^|,]*|BBC[^|,]*|ITV[^|,]*/i)?.[0] ||
      "TV Channel";

    fixtures.push({
      id: `tv24-${index}-${title}-${time}`.replace(/\s+/g, "-"),
      source: "TV24",
      sport,
      date: todayDateString(),
      time,
      title,
      channel: channelText,
      code: normaliseChannel(channelText)
    });
  });

  return fixtures;
}

export default async function handler(req, res) {
  try {
    const [skyHtml, tv24Html] = await Promise.all([
      fetchHtml(SKY_URL),
      fetchHtml(TV24_URL)
    ]);

    const skyFixtures = parseSkySports(skyHtml);
    const tv24Fixtures = parseTv24(tv24Html);

    const fixtures = uniqueFixtures([...skyFixtures, ...tv24Fixtures]).sort((a, b) => {
      const sportCompare = a.sport.localeCompare(b.sport);
      if (sportCompare !== 0) return sportCompare;
      return a.time.localeCompare(b.time);
    });

    res.status(200).json({
      fetchedAt: new Date().toISOString(),
      count: fixtures.length,
      fixtures
    });
  } catch (error) {
    res.status(500).json({
      error: "Failed to build automatic fixtures feed",
      detail: error.message
    });
  }
}
