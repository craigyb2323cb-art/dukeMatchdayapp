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
  { id: 105, date: "2026-03-15", title: "BBC Live Football", time: "19:45", channel: "BBC One", code: "BBC", dayType: "weekend" },
  { id: 106, date: "2026-03-15", title: "Fight Night", time: "22:00", channel: "Amazon Prime", code: "AMAZON", dayType: "weekend" }
];

const STORAGE_KEY = "duke-matchday-state-v4";

export default function App() {
  const [page, setPage] = useState("planner");
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
      setPage(parsed.page || "planner");
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
    setSchedule((prev) => ({
      ...prev,
      [boxKey]: [...prev[boxKey], fixture].sort((a, b) =>
        `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`)
      )
    }));

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

  function openFanzoFixtures() {
    window.open("https://business.fanzo.com/fixtures", "_blank");
  }

  const currentFixtures = useMemo(() => unassigned[fixtureMode], [unassigned, fixtureMode]);

  return (
    <div style={appShell}>
      <div style={heroHeader}>
        <img src={logo} alt="Duke of Devonshire logo" style={logoStyle} />
        <div>
          <div style={eyebrow}>DUKE OF DEVONSHIRE</div>
          <h1 style={mainTitle}>Sky Box Assignment Planner</h1>
          <div style={subTitle}>Plan the full day across all 3 screens</div>
        </div>
      </div>

      <div style={{ padding: "20px" }}>
        <div style={topBar}>
          <div style={navRow}>
            <button onClick={() => setPage("planner")} style={tabButton(page === "planner")}>
              Planner
            </button>
            <button onClick={() => setPage("fanzo")} style={tabButton(page === "fanzo")}>
              FANZO Planner
            </button>
          </div>

          <div style={navRow}>
            <button onClick={() => setFixtureMode("weekday")} style={modeButton(fixtureMode === "weekday")}>
              Weekday
            </button>
            <button onClick={() => setFixtureMode("weekend")} style={modeButton(fixtureMode === "weekend")}>
              Weekend
            </button>
            <button onClick={() => autoAssignDay(fixtureMode)} style={autoAssignButton}>
              Auto Assign
            </button>
            <button onClick={resetAll} style={resetButton}>
              Reset All
            </button>
          </div>
        </div>

        {page === "planner" && (
          <>
            <div style={plannerIntro}>
              <div style={plannerIntroTitle}>Unassigned Fixtures</div>
              <div style={plannerIntroText}>
                Add each match to Sky Box 1, 2 or 3. Fixtures stay saved and can be scheduled for later in the day.
              </div>
            </div>

            <div style={layoutGrid}>
              <div style={leftColumn}>
                {currentFixtures.length === 0 && (
                  <div style={emptyCard}>✅ No unassigned {fixtureMode} fixtures left</div>
                )}

                {currentFixtures.map((fixture) => (
                  <FixtureCard
                    key={fixture.id}
                    fixture={fixture}
                    getChannelInfo={getChannelInfo}
                    formatDate={formatDate}
                    onAssign={assignFixture}
                  />
                ))}
              </div>

              <div style={rightColumn}>
                <SkyBoxLane
                  title="📺 SKY BOX 1"
                  accent="#1e88e5"
                  fixtures={schedule.box1}
                  getChannelInfo={getChannelInfo}
                  formatDate={formatDate}
                  onRemove={(fixture) => removeFromBox("box1", fixture)}
                  onClear={() => clearBox("box1")}
                />

                <SkyBoxLane
                  title="📺 SKY BOX 2"
                  accent="#fb8c00"
                  fixtures={schedule.box2}
                  getChannelInfo={getChannelInfo}
                  formatDate={formatDate}
                  onRemove={(fixture) => removeFromBox("box2", fixture)}
                  onClear={() => clearBox("box2")}
                />

                <SkyBoxLane
                  title="📺 SKY BOX 3"
                  accent="#43a047"
                  fixtures={schedule.box3}
                  getChannelInfo={getChannelInfo}
                  formatDate={formatDate}
                  onRemove={(fixture) => removeFromBox("box3", fixture)}
                  onClear={() => clearBox("box3")}
                />
              </div>
            </div>
          </>
        )}

        {page === "fanzo" && (
          <div style={fanzoCard}>
            <h2 style={{ marginTop: 0 }}>FANZO Fixture Planner</h2>
            <p style={{ color: "#d8d8d8" }}>
              Open the full FANZO planner in a separate page.
            </p>
            <button onClick={openFanzoFixtures} style={openButton}>
              Open FANZO Fixtures
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function FixtureCard({ fixture, getChannelInfo, formatDate, onAssign }) {
  const channel = getChannelInfo(fixture.code);

  return (
    <div
      style={{
        background: "#1b1b1b",
        borderRadius: "16px",
        padding: "16px",
        marginBottom: "16px",
        borderLeft: `6px solid ${channel.border}`,
        border: "1px solid #313131",
        boxShadow: "0 8px 24px rgba(0,0,0,0.25)"
      }}
    >
      <div style={fixtureCardHeader}>
        <div>
          <div style={fixtureDate}>{formatDate(fixture.date)} • {fixture.time}</div>
          <div style={fixtureTitle}>{fixture.title}</div>
          <div style={fixtureChannelText}>{fixture.channel}</div>
        </div>

        <div style={channelWrap}>
          {channel.logo && (
            <img
              src={channel.logo}
              alt={`${channel.label} logo`}
              style={channelLogoSmall}
            />
          )}
          <span style={{ ...channelBadge, background: channel.bg }}>
            {channel.label}
          </span>
        </div>
      </div>

      <div style={assignButtonRow}>
        <button style={box1Button} onClick={() => onAssign("box1", fixture)}>
          Add to Box 1
        </button>
        <button style={box2Button} onClick={() => onAssign("box2", fixture)}>
          Add to Box 2
        </button>
        <button style={box3Button} onClick={() => onAssign("box3", fixture)}>
          Add to Box 3
        </button>
      </div>
    </div>
  );
}

function SkyBoxLane({ title, accent, fixtures, getChannelInfo, formatDate, onRemove, onClear }) {
  return (
    <div
      style={{
        background: "#171717",
        borderRadius: "18px",
        padding: "18px",
        borderTop: `6px solid ${accent}`,
        boxShadow: "0 10px 28px rgba(0,0,0,0.28)"
      }}
    >
      <div style={laneHeader}>
        <div style={laneTitle}>{title}</div>
        <button onClick={onClear} style={clearBoxButton}>
          Clear
        </button>
      </div>

      {fixtures.length === 0 && (
        <div style={emptyLane}>No matches assigned</div>
      )}

      {fixtures.map((fixture) => {
        const channel = getChannelInfo(fixture.code);

        return (
          <div
            key={fixture.id}
            style={{
              marginTop: "14px",
              padding: "14px",
              borderRadius: "14px",
              background: "#252525",
              borderLeft: `5px solid ${channel.border}`
            }}
          >
            <div style={laneFixtureDate}>{formatDate(fixture.date)} • {fixture.time}</div>
            <div style={laneFixtureTitle}>{fixture.title}</div>
            <div style={laneFixtureChannel}>{fixture.channel}</div>

            <div style={laneBadgeRow}>
              {channel.logo && (
                <img
                  src={channel.logo}
                  alt={`${channel.label} logo`}
                  style={channelLogoSmall}
                />
              )}
              <span style={{ ...channelBadge, background: channel.bg }}>
                {channel.label}
              </span>
            </div>

            <button onClick={() => onRemove(fixture)} style={removeButton}>
              Remove
            </button>
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
  fontFamily: "'Segoe UI', Arial, sans-serif"
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
  fontSize: "30px",
  lineHeight: "1.1"
};

const subTitle = {
  color: "#d7d7d7",
  fontSize: "15px",
  fontWeight: "600"
};

const topBar = {
  display: "flex",
  justifyContent: "space-between",
  gap: "14px",
  flexWrap: "wrap",
  marginBottom: "20px"
};

const navRow = {
  display: "flex",
  gap: "10px",
  flexWrap: "wrap"
};

const tabButton = (active) => ({
  background: active ? "#1e88e5" : "#222",
  color: "white",
  border: "none",
  padding: "12px 16px",
  borderRadius: "10px",
  fontWeight: "700",
  fontSize: "15px",
  cursor: "pointer"
});

const modeButton = (active) => ({
  background: active ? "#1565c0" : "#2b2b2b",
  color: "white",
  border: "none",
  padding: "12px 16px",
  borderRadius: "10px",
  fontWeight: "700",
  fontSize: "15px",
  cursor: "pointer"
});

const autoAssignButton = {
  background: "#7b1fa2",
  color: "white",
  border: "none",
  padding: "12px 16px",
  borderRadius: "10px",
  fontWeight: "700",
  fontSize: "15px",
  cursor: "pointer"
};

const resetButton = {
  background: "#b71c1c",
  color: "white",
  border: "none",
  padding: "12px 16px",
  borderRadius: "10px",
  fontWeight: "700",
  fontSize: "15px",
  cursor: "pointer"
};

const plannerIntro = {
  background: "#171717",
  border: "1px solid #2d2d2d",
  borderRadius: "14px",
  padding: "16px",
  marginBottom: "18px"
};

const plannerIntroTitle = {
  fontWeight: "800",
  fontSize: "18px",
  marginBottom: "6px"
};

const plannerIntroText = {
  color: "#c7c7c7"
};

const layoutGrid = {
  display: "grid",
  gridTemplateColumns: "minmax(320px, 1fr) minmax(320px, 1.4fr)",
  gap: "20px"
};

const leftColumn = {
  minWidth: 0
};

const rightColumn = {
  display: "grid",
  gap: "16px",
  minWidth: 0
};

const emptyCard = {
  padding: "18px",
  background: "#1c1c1c",
  borderRadius: "12px",
  fontSize: "18px",
  fontWeight: "bold",
  border: "1px solid #2f2f2f"
};

const fixtureCardHeader = {
  display: "flex",
  justifyContent: "space-between",
  gap: "12px",
  flexWrap: "wrap",
  alignItems: "flex-start"
};

const fixtureDate = {
  color: "#c0c0c0",
  fontSize: "14px",
  marginBottom: "4px",
  fontWeight: "600"
};

const fixtureTitle = {
  fontSize: "21px",
  fontWeight: "800"
};

const fixtureChannelText = {
  color: "#d0d0d0",
  marginTop: "4px"
};

const channelWrap = {
  display: "flex",
  alignItems: "center",
  gap: "10px",
  flexWrap: "wrap"
};

const channelBadge = {
  display: "inline-block",
  color: "white",
  padding: "6px 10px",
  borderRadius: "999px",
  fontSize: "12px",
  fontWeight: "800",
  letterSpacing: "0.4px"
};

const assignButtonRow = {
  display: "flex",
  gap: "10px",
  flexWrap: "wrap",
  marginTop: "16px"
};

const laneHeader = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "10px"
};

const laneTitle = {
  fontSize: "22px",
  fontWeight: "800"
};

const emptyLane = {
  marginTop: "14px",
  color: "#bdbdbd"
};

const laneFixtureDate = {
  color: "#cfcfcf",
  fontSize: "14px",
  fontWeight: "700"
};

const laneFixtureTitle = {
  marginTop: "4px",
  fontSize: "18px",
  fontWeight: "800"
};

const laneFixtureChannel = {
  marginTop: "4px",
  color: "#d0d0d0"
};

const laneBadgeRow = {
  marginTop: "10px",
  display: "flex",
  alignItems: "center",
  gap: "10px",
  flexWrap: "wrap"
};

const clearBoxButton = {
  background: "#5d4037",
  color: "white",
  border: "none",
  padding: "9px 12px",
  borderRadius: "8px",
  fontWeight: "700",
  cursor: "pointer"
};

const removeButton = {
  marginTop: "12px",
  background: "#8e2424",
  color: "white",
  border: "none",
  padding: "8px 12px",
  borderRadius: "8px",
  fontWeight: "700",
  cursor: "pointer"
};

const openButton = {
  background: "#1e88e5",
  color: "white",
  border: "none",
  padding: "14px 20px",
  borderRadius: "10px",
  fontWeight: "700",
  fontSize: "16px",
  cursor: "pointer"
};

const box1Button = {
  background: "#1e88e5",
  color: "white",
  border: "none",
  padding: "12px 16px",
  borderRadius: "10px",
  fontWeight: "700",
  fontSize: "15px",
  cursor: "pointer"
};

const box2Button = {
  background: "#fb8c00",
  color: "white",
  border: "none",
  padding: "12px 16px",
  borderRadius: "10px",
  fontWeight: "700",
  fontSize: "15px",
  cursor: "pointer"
};

const box3Button = {
  background: "#43a047",
  color: "white",
  border: "none",
  padding: "12px 16px",
  borderRadius: "10px",
  fontWeight: "700",
  fontSize: "15px",
  cursor: "pointer"
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

const fanzoCard = {
  background: "#1c1c1c",
  borderRadius: "12px",
  padding: "24px",
  border: "1px solid #333"
};
