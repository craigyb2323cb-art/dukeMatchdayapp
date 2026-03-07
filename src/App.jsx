import React, { useEffect, useMemo, useState } from "react";
import logo from "./assets/IMG_20260306_141840.jpg";
import skyLogo from "./assets/sky-logo.png";
import tntLogo from "./assets/tnt-logo.png";
import bbcLogo from "./assets/bbc-logo.png";
import itvLogo from "./assets/itv-logo.png";
import amazonLogo from "./assets/amazon-logo.png";

const weekdayFixtures = [
  { id: 1, date: "2026-03-09", title: "Premier League", time: "12:30", channel: "Sky Sports Main Event", code: "SKY", dayType: "weekday" },
  { id: 2, date: "2026-03-09", title: "Champions League", time: "15:00", channel: "TNT Sports 1", code: "TNT", dayType: "weekday" },
  { id: 3, date: "2026-03-10", title: "FA Cup", time: "17:30", channel: "BBC One", code: "BBC", dayType: "weekday" },
  { id: 4, date: "2026-03-10", title: "Six Nations", time: "20:00", channel: "ITV 1", code: "ITV", dayType: "weekday" },
  { id: 5, date: "2026-03-11", title: "Boxing", time: "22:00", channel: "Amazon Prime", code: "AMAZON", dayType: "weekday" }
];

const weekendFixtures = [
  { id: 101, date: "2026-03-14", title: "Premier League Early Kick Off", time: "12:30", channel: "Sky Sports Main Event", code: "SKY", dayType: "weekend" },
  { id: 102, date: "2026-03-14", title: "Rugby Union", time: "14:00", channel: "ITV 1", code: "ITV", dayType: "weekend" },
  { id: 103, date: "2026-03-14", title: "Premier League 3pm", time: "15:00", channel: "Sky Sports Premier League", code: "SKY", dayType: "weekend" },
  { id: 104, date: "2026-03-14", title: "Championship Football", time: "17:30", channel: "TNT Sports 1", code: "TNT", dayType: "weekend" },
  { id: 105, date: "2026-03-15", title: "Match of the Day Style Game", time: "19:45", channel: "BBC One", code: "BBC", dayType: "weekend" },
  { id: 106, date: "2026-03-15", title: "Fight Night", time: "22:00", channel: "Amazon Prime", code: "AMAZON", dayType: "weekend" }
];

const STORAGE_KEY = "duke-matchday-state-v3";

export default function App() {
  const [page, setPage] = useState("fixtures");
  const [fixtureMode, setFixtureMode] = useState("weekday");

  const [unassigned, setUnassigned] = useState({
    weekday: weekdayFixtures,
    weekend: weekendFixtures
  });

  const [schedule, setSchedule] = useState({
    box1: [],
    box2: [],
    box3: []
  });

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      setPage(parsed.page || "fixtures");
      setFixtureMode(parsed.fixtureMode || "weekday");
      setUnassigned(parsed.unassigned || { weekday: weekdayFixtures, weekend: weekendFixtures });
      setSchedule(parsed.schedule || { box1: [], box2: [], box3: [] });
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        page,
        fixtureMode,
        unassigned,
        schedule
      })
    );
  }, [page, fixtureMode, unassigned, schedule]);

  function getChannelInfo(codeOrText) {
    const text = String(codeOrText).toLowerCase();

    if (text.includes("sky")) return { label: "SKY", bg: "#1565c0", border: "#42a5f5", logo: skyLogo };
    if (text.includes("tnt")) return { label: "TNT", bg: "#e65100", border: "#ffb74d", logo: tntLogo };
    if (text.includes("bbc")) return { label: "BBC", bg: "#6a1b9a", border: "#ba68c8", logo: bbcLogo };
    if (text.includes("itv")) return { label: "ITV", bg: "#2e7d32", border: "#81c784", logo: itvLogo };
    if (text.includes("amazon")) return { label: "AMAZON", bg: "#212121", border: "#fbc02d", logo: amazonLogo };

    return { label: "OTHER", bg: "#424242", border: "#9e9e9e", logo: null };
  }

  function formatDate(dateString) {
    const date = new Date(dateString + "T12:00:00");
    return date.toLocaleDateString("en-GB", {
      weekday: "short",
      day: "numeric",
      month: "short"
    });
  }

  function assignFixture(boxKey, fixture) {
    setSchedule((prev) => {
      const next = {
        ...prev,
        [boxKey]: [...prev[boxKey], fixture].sort((a, b) =>
          `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`)
        )
      };
      return next;
    });

    setUnassigned((prev) => ({
      ...prev,
      [fixture.dayType]: prev[fixture.dayType].filter((f) => f.id !== fixture.id)
    }));
  }

  function removeFromBox(boxKey, fixture) {
    setSchedule((prev) => ({
      ...prev,
      [boxKey]: prev[boxKey].filter((f) => f.id !== fixture.id)
    }));

    setUnassigned((prev) => ({
      ...prev,
      [fixture.dayType]: [...prev[fixture.dayType], fixture].sort((a, b) =>
        `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`)
      )
    }));
  }

  function resetAll() {
    setUnassigned({
      weekday: weekdayFixtures,
      weekend: weekendFixtures
    });
    setSchedule({
      box1: [],
      box2: [],
      box3: []
    });
  }

  function clearBox(boxKey) {
    const fixturesToReturn = schedule[boxKey];

    setSchedule((prev) => ({
      ...prev,
      [boxKey]: []
    }));

    setUnassigned((prev) => {
      const next = { ...prev };
      fixturesToReturn.forEach((fixture) => {
        next[fixture.dayType] = [...next[fixture.dayType], fixture].sort((a, b) =>
          `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`)
        );
      });
      return next;
    });
  }

  function openFanzoFixtures() {
    window.open("https://business.fanzo.com/fixtures", "_blank");
  }

  function autoAssignDay(dayType) {
    const fixtures = [...unassigned[dayType]].sort((a, b) =>
      `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`)
    );

    const nextSchedule = {
      box1: [...schedule.box1],
      box2: [...schedule.box2],
      box3: [...schedule.box3]
    };

    fixtures.forEach((fixture, index) => {
      const target = index % 3 === 0 ? "box1" : index % 3 === 1 ? "box2" : "box3";
      nextSchedule[target].push(fixture);
    });

    nextSchedule.box1.sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`));
    nextSchedule.box2.sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`));
    nextSchedule.box3.sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`));

    setSchedule(nextSchedule);
    setUnassigned((prev) => ({
      ...prev,
      [dayType]: []
    }));
  }

  const currentFixtures = useMemo(() => unassigned[fixtureMode], [unassigned, fixtureMode]);

  return (
    <div style={appShell}>
      <div style={heroHeader}>
        <img src={logo} alt="Duke of Devonshire logo" style={logoStyle} />
        <div style={{ flex: 1 }}>
          <div style={eyebrow}>WELCOME TO</div>
          <h1 style={mainTitle}>The Duke Of Devonshire</h1>
          <div style={subTitle}>Live Sport Schedule & Screen Planner</div>
        </div>
      </div>

      <div style={{ padding: "20px" }}>
        <div style={navRow}>
          <button onClick={() => setPage("fixtures")} style={tabButton(page === "fixtures")}>Fixtures</button>
          <button onClick={() => setPage("board")} style={tabButton(page === "board")}>Sky Box Board</button>
          <button onClick={() => setPage("fanzo")} style={tabButton(page === "fanzo")}>FANZO Planner</button>
          <button onClick={resetAll} style={resetButton}>Reset All</button>
        </div>

        {page === "fixtures" && (
          <div>
            <h2 style={sectionTitle}>Assign Matches Across The Whole Day</h2>

            <div style={modeRow}>
              <button onClick={() => setFixtureMode("weekday")} style={modeButton(fixtureMode === "weekday")}>
                Weekday
              </button>
              <button onClick={() => setFixtureMode("weekend")} style={modeButton(fixtureMode === "weekend")}>
                Weekend
              </button>
              <button onClick={() => autoAssignDay(fixtureMode)} style={autoAssignButton}>
                Auto Assign This {fixtureMode === "weekend" ? "Weekend" : "Day"}
              </button>
            </div>

            <div style={helperCard}>
              Matches stay saved after refresh. You can assign early games now and come back later to place the evening fixtures.
            </div>

            {currentFixtures.length === 0 && (
              <div style={emptyCard}>
                ✅ No unassigned {fixtureMode} fixtures left
              </div>
            )}

            {currentFixtures.map((fixture) => {
              const channel = getChannelInfo(fixture.code);

              return (
                <div
                  key={fixture.id}
                  style={{
                    ...fixtureCard,
                    borderLeft: `6px solid ${channel.border}`
                  }}
                >
                  <div style={fixtureTopRow}>
                    <div>
                      <div style={fixtureTitle}>{fixture.title}</div>
                      <div style={fixtureMeta}>
                        {formatDate(fixture.date)} • {fixture.time}
                      </div>
                      <div style={fixtureMeta}>{fixture.channel}</div>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                      {channel.logo && (
                        <img
                          src={channel.logo}
                          alt={`${channel.label} logo`}
                          style={channelLogoSmall}
                        />
                      )}
                      <ChannelBadge code={fixture.code} />
                    </div>
                  </div>

                  <div style={buttonRow}>
                    <button style={box1Button} onClick={() => assignFixture("box1", fixture)}>📺 SKY BOX 1</button>
                    <button style={box2Button} onClick={() => assignFixture("box2", fixture)}>📺 SKY BOX 2</button>
                    <button style={box3Button} onClick={() => assignFixture("box3", fixture)}>📺 SKY BOX 3</button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {page === "board" && (
          <div>
            <h2 style={sectionTitle}>Full Day Sky Box Allocation</h2>

            <div style={boardGrid}>
              <SkyBoxColumn
                title="📺 SKY BOX 1"
                fixtures={schedule.box1}
                color="#1e88e5"
                getChannelInfo={getChannelInfo}
                formatDate={formatDate}
                onRemove={(fixture) => removeFromBox("box1", fixture)}
                onClear={() => clearBox("box1")}
              />

              <SkyBoxColumn
                title="📺 SKY BOX 2"
                fixtures={schedule.box2}
                color="#fb8c00"
                getChannelInfo={getChannelInfo}
                formatDate={formatDate}
                onRemove={(fixture) => removeFromBox("box2", fixture)}
                onClear={() => clearBox("box2")}
              />

              <SkyBoxColumn
                title="📺 SKY BOX 3"
                fixtures={schedule.box3}
                color="#43a047"
                getChannelInfo={getChannelInfo}
                formatDate={formatDate}
                onRemove={(fixture) => removeFromBox("box3", fixture)}
                onClear={() => clearBox("box3")}
              />
            </div>
          </div>
        )}

        {page === "fanzo" && (
          <div>
            <h2 style={sectionTitle}>FANZO Fixture Planner</h2>
            <div style={plannerCard}>
              <p style={{ marginTop: 0, fontSize: "18px", color: "#f1f1f1" }}>
                Open the full FANZO fixture planner in a separate page.
              </p>
              <button onClick={openFanzoFixtures} style={openButton}>
                Open FANZO Fixtures
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ChannelBadge({ code }) {
  const label =
    code === "SKY" ? "SKY" :
    code === "TNT" ? "TNT" :
    code === "BBC" ? "BBC" :
    code === "ITV" ? "ITV" :
    code === "AMAZON" ? "AMAZON" : "OTHER";

  const bg =
    code === "SKY" ? "#1565c0" :
    code === "TNT" ? "#e65100" :
    code === "BBC" ? "#6a1b9a" :
    code === "ITV" ? "#2e7d32" :
    code === "AMAZON" ? "#212121" : "#424242";

  return (
    <span
      style={{
        display: "inline-block",
        background: bg,
        color: "white",
        padding: "6px 10px",
        borderRadius: "999px",
        fontSize: "12px",
        fontWeight: "800",
        letterSpacing: "0.4px"
      }}
    >
      {label}
    </span>
  );
}

function SkyBoxColumn({ title, fixtures, color, getChannelInfo, formatDate, onRemove, onClear }) {
  return (
    <div
      style={{
        background: "#1c1c1c",
        borderRadius: "16px",
        padding: "18px",
        borderTop: `6px solid ${color}`,
        minHeight: "220px",
        boxShadow: "0 10px 28px rgba(0,0,0,0.28)"
      }}
    >
      <div style={boardTitle}>{title}</div>

      <button onClick={onClear} style={clearBoxButton}>
        Clear Box
      </button>

      {fixtures.length === 0 && (
        <div style={{ color: "#bdbdbd", marginTop: "14px" }}>No matches assigned</div>
      )}

      {fixtures.map((fixture) => {
        const channel = getChannelInfo(fixture.code);

        return (
          <div
            key={fixture.id}
            style={{
              marginTop: "14px",
              padding: "14px",
              borderRadius: "12px",
              background: "#252525",
              borderLeft: `5px solid ${channel.border}`
            }}
          >
            <div style={{ fontWeight: "800", fontSize: "16px", color: "#cfcfcf" }}>
              {formatDate(fixture.date)}
            </div>
            <div style={{ fontWeight: "800", fontSize: "18px", marginTop: "4px" }}>
              {fixture.time}
            </div>
            <div style={{ marginTop: "4px", fontSize: "17px", fontWeight: "700" }}>
              {fixture.title}
            </div>
            <div style={{ marginTop: "4px", color: "#d0d0d0" }}>
              {fixture.channel}
            </div>

            <div style={{ marginTop: "10px", display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
              {channel.logo && (
                <img
                  src={channel.logo}
                  alt={`${channel.label} logo`}
                  style={channelLogoSmall}
                />
              )}
              <span
                style={{
                  display: "inline-block",
                  background: channel.bg,
                  color: "white",
                  padding: "6px 10px",
                  borderRadius: "999px",
                  fontSize: "12px",
                  fontWeight: "800"
                }}
              >
                {channel.label}
              </span>
            </div>

            <div style={{ marginTop: "10px" }}>
              <button onClick={() => onRemove(fixture)} style={removeButton}>
                Remove
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

const appShell = {
  background: "linear-gradient(180deg, #0d0d0d 0%, #171717 45%, #111111 100%)",
  minHeight: "100vh",
  color: "white",
  fontFamily: "'Arial Black', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
};

const heroHeader = {
  display: "flex",
  alignItems: "center",
  gap: "18px",
  padding: "18px 20px",
  background: "linear-gradient(135deg, #000000 0%, #111111 45%, #1b1b1b 100%)",
  borderBottom: "3px solid #1e88e5",
  flexWrap: "wrap"
};

const logoStyle = {
  height: "72px",
  width: "72px",
  borderRadius: "50%",
  objectFit: "cover",
  border: "2px solid #2b2b2b"
};

const eyebrow = {
  fontSize: "12px",
  letterSpacing: "2px",
  color: "#bdbdbd",
  fontWeight: "800",
  textTransform: "uppercase"
};

const mainTitle = {
  margin: "4px 0",
  fontSize: "32px",
  lineHeight: "1.1"
};

const subTitle = {
  color: "#e0e0e0",
  fontSize: "16px",
  fontWeight: "700",
  textTransform: "uppercase",
  letterSpacing: "1px"
};

const navRow = {
  display: "flex",
  gap: "10px",
  flexWrap: "wrap",
  marginBottom: "20px"
};

const tabButton = (active) => ({
  background: active ? "#1e88e5" : "#222",
  color: "white",
  border: "none",
  padding: "12px 16px",
  borderRadius: "10px",
  fontWeight: "800",
  fontSize: "15px",
  cursor: "pointer"
});

const resetButton = {
  background: "#b71c1c",
  color: "white",
  border: "none",
  padding: "12px 16px",
  borderRadius: "10px",
  fontWeight: "800",
  fontSize: "15px",
  cursor: "pointer"
};

const autoAssignButton = {
  background: "#7b1fa2",
  color: "white",
  border: "none",
  padding: "12px 16px",
  borderRadius: "10px",
  fontWeight: "800",
  fontSize: "15px",
  cursor: "pointer"
};

const openButton = {
  background: "#1e88e5",
  color: "white",
  border: "none",
  padding: "14px 20px",
  borderRadius: "10px",
  fontWeight: "800",
  fontSize: "16px",
  cursor: "pointer"
};

const clearBoxButton = {
  background: "#5d4037",
  color: "white",
  border: "none",
  padding: "10px 14px",
  borderRadius: "8px",
  fontWeight: "700",
  cursor: "pointer"
};

const removeButton = {
  background: "#8e2424",
  color: "white",
  border: "none",
  padding: "8px 12px",
  borderRadius: "8px",
  fontWeight: "700",
  cursor: "pointer"
};

const box1Button = {
  background: "#1e88e5",
  color: "white",
  border: "none",
  padding: "14px 18px",
  borderRadius: "10px",
  fontWeight: "800",
  fontSize: "16px",
  cursor: "pointer"
};

const box2Button = {
  background: "#fb8c00",
  color: "white",
  border: "none",
  padding: "14px 18px",
  borderRadius: "10px",
  fontWeight: "800",
  fontSize: "16px",
  cursor: "pointer"
};

const box3Button = {
  background: "#43a047",
  color: "white",
  border: "none",
  padding: "14px 18px",
  borderRadius: "10px",
  fontWeight: "800",
  fontSize: "16px",
  cursor: "pointer"
};

const sectionTitle = {
  marginBottom: "16px",
  fontSize: "28px"
};

const modeRow = {
  display: "flex",
  gap: "10px",
  flexWrap: "wrap",
  marginBottom: "16px"
};

const modeButton = (active) => ({
  background: active ? "#1565c0" : "#2b2b2b",
  color: "white",
  border: "none",
  padding: "12px 16px",
  borderRadius: "10px",
  fontWeight: "800",
  cursor: "pointer"
});

const helperCard = {
  background: "#171717",
  border: "1px solid #2d2d2d",
  borderRadius: "14px",
  padding: "16px",
  marginBottom: "16px",
  color: "#d0d0d0"
};

const emptyCard = {
  padding: "18px",
  background: "#1c1c1c",
  borderRadius: "12px",
  fontSize: "18px",
  fontWeight: "bold",
  border: "1px solid #2f2f2f"
};

const fixtureCard = {
  marginBottom: "16px",
  padding: "16px",
  background: "#1b1b1b",
  borderRadius: "14px",
  borderTop: "1px solid #313131",
  borderRight: "1px solid #313131",
  borderBottom: "1px solid #313131",
  boxShadow: "0 8px 24px rgba(0,0,0,0.25)"
};

const fixtureTopRow = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "12px",
  flexWrap: "wrap"
};

const fixtureTitle = {
  fontSize: "19px",
  fontWeight: "800"
};

const fixtureMeta = {
  color: "#d0d0d0",
  marginTop: "4px"
};

const buttonRow = {
  display: "flex",
  gap: "12px",
  flexWrap: "wrap",
  marginTop: "14px"
};

const boardGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
  gap: "16px"
};

const boardTitle = {
  fontSize: "22px",
  fontWeight: "800",
  marginBottom: "12px"
};

const plannerCard = {
  background: "#1c1c1c",
  borderRadius: "12px",
  padding: "24px",
  border: "1px solid #333"
};

const channelLogoSmall = {
  height: "26px",
  width: "auto",
  maxWidth: "72px",
  objectFit: "contain",
  background: "#fff",
  padding: "4px 6px",
  borderRadius: "8px"
};
