import React, { useEffect, useMemo, useState } from "react";
import logo from "./assets/IMG_20260306_141840.jpg";

const STORAGE_KEY = "duke-auto-fixtures-v1";

export default function App() {
  const [page, setPage] = useState("fixtures");
  const [sportFilter, setSportFilter] = useState("all");
  const [fixtures, setFixtures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [schedule, setSchedule] = useState({
    box1: [],
    box2: [],
    box3: []
  });

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setSchedule(parsed.schedule || { box1: [], box2: [], box3: [] });
      } catch {
        // ignore bad saved data
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        schedule
      })
    );
  }, [schedule]);

  useEffect(() => {
    loadFixtures();
  }, []);

  async function loadFixtures() {
    try {
      setLoading(true);
      setError("");
      const response = await fetch("/api/fixtures");

      if (!response.ok) {
        throw new Error("Could not load fixtures");
      }

      const data = await response.json();
      setFixtures(Array.isArray(data.fixtures) ? data.fixtures : []);
    } catch (err) {
      setError("Unable to load automatic fixtures right now.");
    } finally {
      setLoading(false);
    }
  }

  function getChannelInfo(codeOrText) {
    const text = String(codeOrText || "").toLowerCase();

    if (text.includes("sky")) return { label: "SKY", bg: "#1565c0", border: "#42a5f5" };
    if (text.includes("tnt")) return { label: "TNT", bg: "#e65100", border: "#ffb74d" };
    if (text.includes("bbc")) return { label: "BBC", bg: "#6a1b9a", border: "#ba68c8" };
    if (text.includes("itv")) return { label: "ITV", bg: "#2e7d32", border: "#81c784" };
    if (text.includes("amazon")) return { label: "AMAZON", bg: "#212121", border: "#fbc02d" };

    return { label: "OTHER", bg: "#424242", border: "#9e9e9e" };
  }

  function getSportColour(sport) {
    const value = String(sport || "").toLowerCase();
    if (value === "football") return "#1e88e5";
    if (value === "rugby") return "#2e7d32";
    if (value === "darts") return "#8e24aa";
    if (value === "f1") return "#c62828";
    return "#666";
  }

  function formatDate(dateString) {
    if (!dateString) return "";
    const date = new Date(`${dateString}T12:00:00`);
    if (Number.isNaN(date.getTime())) return dateString;

    return date.toLocaleDateString("en-GB", {
      weekday: "short",
      day: "numeric",
      month: "short"
    });
  }

  function isAssigned(fixtureId) {
    return ["box1", "box2", "box3"].some((boxKey) =>
      schedule[boxKey].some((item) => item.id === fixtureId)
    );
  }

  function assignFixture(boxKey, fixture) {
    if (isAssigned(fixture.id)) return;

    setSchedule((prev) => ({
      ...prev,
      [boxKey]: [...prev[boxKey], fixture].sort((a, b) =>
        `${a.date || ""} ${a.time || ""}`.localeCompare(`${b.date || ""} ${b.time || ""}`)
      )
    }));
  }

  function removeFromBox(boxKey, fixture) {
    setSchedule((prev) => ({
      ...prev,
      [boxKey]: prev[boxKey].filter((item) => item.id !== fixture.id)
    }));
  }

  function clearBox(boxKey) {
    setSchedule((prev) => ({
      ...prev,
      [boxKey]: []
    }));
  }

  function resetAll() {
    setSchedule({
      box1: [],
      box2: [],
      box3: []
    });
  }

  function openFanzoFixtures() {
    window.open("https://business.fanzo.com/fixtures", "_blank");
  }

  const filteredFixtures = useMemo(() => {
    const unassignedOnly = fixtures.filter((fixture) => !isAssigned(fixture.id));

    if (sportFilter === "all") return unassignedOnly;

    return unassignedOnly.filter(
      (fixture) => String(fixture.sport || "").toLowerCase() === sportFilter
    );
  }, [fixtures, sportFilter, schedule]);

  return (
    <div style={appShell}>
      <div style={heroHeader}>
        <img src={logo} alt="Duke of Devonshire logo" style={logoStyle} />
        <div>
          <div style={eyebrow}>DUKE OF DEVONSHIRE</div>
          <h1 style={mainTitle}>Automatic Fixture Planner</h1>
          <div style={subTitle}>Auto cards + full day Sky Box assignment</div>
        </div>
      </div>

      <div style={{ padding: "20px" }}>
        <div style={topBar}>
          <div style={navRow}>
            <button onClick={() => setPage("fixtures")} style={tabButton(page === "fixtures")}>
              Auto Fixtures
            </button>
            <button onClick={() => setPage("showing")} style={tabButton(page === "showing")}>
              Showing At The Duke
            </button>
            <button onClick={() => setPage("fanzo")} style={tabButton(page === "fanzo")}>
              FANZO Planner
            </button>
          </div>

          <div style={navRow}>
            <button onClick={() => setSportFilter("all")} style={modeButton(sportFilter === "all")}>
              All
            </button>
            <button onClick={() => setSportFilter("football")} style={modeButton(sportFilter === "football")}>
              Football
            </button>
            <button onClick={() => setSportFilter("rugby")} style={modeButton(sportFilter === "rugby")}>
              Rugby
            </button>
            <button onClick={() => setSportFilter("darts")} style={modeButton(sportFilter === "darts")}>
              Darts
            </button>
            <button onClick={() => setSportFilter("f1")} style={modeButton(sportFilter === "f1")}>
              F1
            </button>
            <button onClick={loadFixtures} style={refreshButton}>
              Refresh Feed
            </button>
            <button onClick={resetAll} style={resetButton}>
              Reset Boxes
            </button>
          </div>
        </div>

        {page === "fixtures" && (
          <>
            <div style={plannerIntro}>
              <div style={plannerIntroTitle}>Automatic Fixture Cards</div>
              <div style={plannerIntroText}>
                Pulls from your backend feed, then lets staff assign each event to a Sky Box.
              </div>
            </div>

            {loading && <div style={emptyCard}>Loading fixtures…</div>}
            {error && <div style={errorCard}>{error}</div>}

            {!loading && !error && (
              <div style={layoutGrid}>
                <div style={leftColumn}>
                  {filteredFixtures.length === 0 && (
                    <div style={emptyCard}>No fixtures available in this filter</div>
                  )}

                  {filteredFixtures.map((fixture) => (
                    <FixtureCard
                      key={fixture.id}
                      fixture={fixture}
                      getChannelInfo={getChannelInfo}
                      getSportColour={getSportColour}
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
                    getSportColour={getSportColour}
                    formatDate={formatDate}
                    onRemove={(fixture) => removeFromBox("box1", fixture)}
                    onClear={() => clearBox("box1")}
                  />

                  <SkyBoxLane
                    title="📺 SKY BOX 2"
                    accent="#fb8c00"
                    fixtures={schedule.box2}
                    getChannelInfo={getChannelInfo}
                    getSportColour={getSportColour}
                    formatDate={formatDate}
                    onRemove={(fixture) => removeFromBox("box2", fixture)}
                    onClear={() => clearBox("box2")}
                  />

                  <SkyBoxLane
                    title="📺 SKY BOX 3"
                    accent="#43a047"
                    fixtures={schedule.box3}
                    getChannelInfo={getChannelInfo}
                    getSportColour={getSportColour}
                    formatDate={formatDate}
                    onRemove={(fixture) => removeFromBox("box3", fixture)}
                    onClear={() => clearBox("box3")}
                  />
                </div>
              </div>
            )}
          </>
        )}

        {page === "showing" && (
          <div>
            <h2 style={{ marginTop: 0 }}>Showing At The Duke</h2>

            <div style={showingGrid}>
              <SkyBoxLane
                title="📺 SKY BOX 1"
                accent="#1e88e5"
                fixtures={schedule.box1}
                getChannelInfo={getChannelInfo}
                getSportColour={getSportColour}
                formatDate={formatDate}
                onRemove={(fixture) => removeFromBox("box1", fixture)}
                onClear={() => clearBox("box1")}
              />

              <SkyBoxLane
                title="📺 SKY BOX 2"
                accent="#fb8c00"
                fixtures={schedule.box2}
                getChannelInfo={getChannelInfo}
                getSportColour={getSportColour}
                formatDate={formatDate}
                onRemove={(fixture) => removeFromBox("box2", fixture)}
                onClear={() => clearBox("box2")}
              />

              <SkyBoxLane
                title="📺 SKY BOX 3"
                accent="#43a047"
                fixtures={schedule.box3}
                getChannelInfo={getChannelInfo}
                getSportColour={getSportColour}
                formatDate={formatDate}
                onRemove={(fixture) => removeFromBox("box3", fixture)}
                onClear={() => clearBox("box3")}
              />
            </div>
          </div>
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

function FixtureCard({ fixture, getChannelInfo, getSportColour, formatDate, onAssign }) {
  const channel = getChannelInfo(fixture.code);

  return (
    <div
      style={{
        background: "#1b1b1b",
        borderRadius: "16px",
        padding: "16px",
        marginBottom: "16px",
        borderLeft: `6px solid ${getSportColour(fixture.sport)}`,
        border: "1px solid #313131",
        boxShadow: "0 8px 24px rgba(0,0,0,0.25)"
      }}
    >
      <div style={fixtureCardHeader}>
        <div>
          <div style={fixtureSport}>
            {String(fixture.sport || "").toUpperCase()} • {fixture.source}
          </div>
          <div style={fixtureDate}>
            {formatDate(fixture.date)}{fixture.date ? " • " : ""}{fixture.time}
          </div>
          <div style={fixtureTitle}>{fixture.title}</div>
          <div style={fixtureMeta}>{fixture.channel}</div>
        </div>

        <div style={channelWrap}>
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

function SkyBoxLane({ title, accent, fixtures, getChannelInfo, getSportColour, formatDate, onRemove, onClear }) {
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
              borderLeft: `5px solid ${getSportColour(fixture.sport)}`
            }}
          >
            <div style={laneFixtureSport}>
              {String(fixture.sport || "").toUpperCase()} • {fixture.source}
            </div>
            <div style={laneFixtureDate}>
              {formatDate(fixture.date)}{fixture.date ? " • " : ""}{fixture.time}
            </div>
            <div style={laneFixtureTitle}>{fixture.title}</div>
            <div style={laneFixtureChannel}>{fixture.channel}</div>

            <div style={laneBadgeRow}>
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

const refreshButton = {
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

const showingGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
  gap: "16px"
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

const errorCard = {
  padding: "18px",
  background: "#3a1212",
  borderRadius: "12px",
  fontSize: "18px",
  fontWeight: "bold",
  border: "1px solid #7a2525",
  marginBottom: "18px"
};

const fixtureCardHeader = {
  display: "flex",
  justifyContent: "space-between",
  gap: "12px",
  flexWrap: "wrap",
  alignItems: "flex-start"
};

const fixtureSport = {
  color: "#c0c0c0",
  fontSize: "13px",
  marginBottom: "4px",
  fontWeight: "700",
  letterSpacing: "1px"
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

const fixtureMeta = {
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

const laneFixtureSport = {
  color: "#cfcfcf",
  fontSize: "13px",
  fontWeight: "700",
  letterSpacing: "1px"
};

const laneFixtureDate = {
  marginTop: "4px",
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

const fanzoCard = {
  background: "#1c1c1c",
  borderRadius: "12px",
  padding: "24px",
  border: "1px solid #333"
};
