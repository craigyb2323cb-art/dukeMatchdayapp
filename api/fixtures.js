import cheerio from "cheerio";

export default async function handler(req, res) {

  const fixtures = [];

  // SKY SPORTS
  try {
    const sky = await fetch("https://www.skysports.com/watch/sport-on-sky");
    const html = await sky.text();
    const $ = cheerio.load(html);

    $(".fixres__item").each((i, el) => {
      fixtures.push({
        id: "sky-" + i,
        title: $(el).text().trim(),
        sport: "football",
        source: "Sky Sports"
      });
    });

  } catch {}

  res.status(200).json({ fixtures });
}
