export default async function handler(req, res) {
  // Replace this mock data later with server-side fetching/parsing.
  // Keep the same shape so the app does not need changing.

  const fixtures = [
    {
      id: "sky-1",
      source: "Sky Sports",
      sport: "football",
      date: "2026-03-09",
      time: "12:30",
      title: "Premier League Live",
      channel: "Sky Sports Main Event",
      code: "SKY"
    },
    {
      id: "sky-2",
      source: "Sky Sports",
      sport: "darts",
      date: "2026-03-09",
      time: "19:00",
      title: "Premier League Darts",
      channel: "Sky Sports Arena",
      code: "SKY"
    },
    {
      id: "sky-3",
      source: "Sky Sports",
      sport: "f1",
      date: "2026-03-10",
      time: "14:00",
      title: "Formula 1 Qualifying",
      channel: "Sky Sports F1",
      code: "SKY"
    },
    {
      id: "tv24-1",
      source: "TV24",
      sport: "rugby",
      date: "2026-03-10",
      time: "17:30",
      title: "Rugby Union Live",
      channel: "TNT Sports 1",
      code: "TNT"
    },
    {
      id: "tv24-2",
      source: "TV24",
      sport: "football",
      date: "2026-03-10",
      time: "20:00",
      title: "European Football Live",
      channel: "TNT Sports 2",
      code: "TNT"
    }
  ];

  res.status(200).json({ fixtures });
}
