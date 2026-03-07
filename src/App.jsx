import React, { useEffect, useMemo, useState } from "react";
import logo from "./assets/IMG_20260306_141840.jpg";

const STORAGE_KEY = "duke-auto-fixtures-v1";

// 0 = Sunday, 1 = Monday ... 6 = Saturday
const OPENING_HOURS = {
  0: { open: "12:00", close: "23:30" },
  1: { open: "12:00", close: "23:30" },
  2: { open: "12:00", close: "23:30" },
  3: { open: "12:00", close: "23:30" },
  4: { open: "12:00", close: "23:30" },
  5: { open: "12:00", close: "00:30" },
  6: { open: "12:00", close: "00:30" }
};

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
        // ignore invalid saved data
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
    } catch {
      setError("Unable to load automatic fixtures right now.");
      setFixtures([]);
    } finally {
      setLoading(false);
    }
  }

  function getChannelInfo(codeOrText) {
    const text = String(codeOrText || "").toLowerCase();

    if (text.includes("sky")) return { label: "SKY", bg: "#1565c0" };
    if (text.includes("tnt")) return { label: "TNT", bg: "#e65100" };
    if (text.includes("bbc")) return { label: "BBC", bg: "#6a1b9a" };
    if (text.includes("itv")) return { label: "ITV", bg: "#2e7d32" };
    if (text.includes("amazon")) return { label: "AMAZON", bg: "#212121" };

    return { label: "OTHER", bg: "#424242" };
  }

  function getSportColour(sport) {
    const value = String(sport || "").toLowerCase();

    if (value === "football") return "#1e88e5";
    if (value === "rugby") return "#2e7d32";
    if (value === "darts") return "#8e24aa";
    if (value === "f1") return "#c62828";

    return "#666666";
  }

  function formatDate(dateString) {
    if (!dateString) return "";

    const date = new Date(`${dateString}T12:00:00`);

    if (Number.isNaN(date.getTime())) {
      return dateString;
    }

    return date.toLocaleDateString("en-GB", {
      weekday: "short",
      day: "numeric",
      month: "short"
    });
  }

  function timeToMinutes(value) {
    if (!value || !value.includes(":")) return null;
    const [hour, minute] = value.split(":").map(Number);
    if (Number.isNaN(hour) || Number.isNaN(minute)) return null;
    return hour * 60 + minute;
  }

  function isWithinOpeningHours(fixture) {
    if (!fixture?.date || !fixture?.time) return true;

    const date = new Date(`${fixture.date}T12:00:00`);
    if (Number.isNaN(date.getTime())) return true;

    const dayIndex = date.getDay();
    const hours = OPENING_HOURS[dayIndex];
    if (!hours) return true;

    const matchMinutes = timeToMinutes(fixture.time);
    const openMinutes = timeToMinutes(hours.open);
    const closeMinutes = timeToMinutes(hours.close);

    if (matchMinutes === null || openMinutes === null || closeMinutes === null) {
      return true;
    }

    // Handles normal closing times and after-midnight closing times
    if (closeMinutes >= openMinutes) {
      return matchMinutes >= openMinutes && matchMinutes <= closeMinutes;
    }

    return matchMinutes >= openMinutes || matchMinutes <= closeMinutes;
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

  function resetBoxes() {
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
    const unassignedFixtures = fixtures
      .filter((fixture) => !isAssigned(fixture.id))
      .filter((fixture) => isWithinOpeningHours(fixture));

    if (sportFilter === "all") {
      return unassignedFixtures;
    }

    return unassignedFixtures.filter(
      (fixture) => String(fixture.sport || "").toLowerCase() === sportFilter
    );
  }, [fixtures, sportFilter, schedule]);

  return (
    <div style={styles.appShell}>
      <div style={styles.heroHeader}>
        <img src={logo} alt="Duke of Devonshire logo" style={styles.logoStyle} />

        <div>
          <div style={styles.eyebrow}>DUKE OF DEVONSHIRE</div>
          <h1 style={styles.mainTitle}>Automatic Fixture Planner</h1>
          <div style={styles.subTitle}>Auto cards + full day Sky Box assignment</div>
        </div>
      </div>

      <div style={styles.pagePadding}>
        <div style={styles.topBar}>
          <div style={styles.navRow}>
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

          <div style={styles.navRow}>
            <button onClick={() => setSportFilter("all")} style={modeButton(sportFilter === "all")}>
              All
            </button>

            <button
              onClick={() => setSportFilter("football")}
              style={modeButton(sportFilter === "football")}
            >
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

            <button onClick={loadFixtures} style={styles.refreshButton}>
              Refresh Feed
            </button>

            <button onClick={resetBoxes} style={styles.resetButton}>
              Reset Boxes
            </button>
          </div>
        </div>

        {page === "fixtures" && (
          <>
            <div style={styles.plannerIntro}>
              <div style={styles.plannerIntroTitle}>Automatic Fixture Cards</div>
              <div style={styles.plannerIntroText}>
                Pulls from your backend feed, filters out fixtures outside opening hours, then lets staff assign each event to a Sky Box.
              </div>
            </div>

            {loading && <div style={styles.emptyCard}>Loading fixtures...</div>}
            {!loading && error && <div style={styles.errorCard}>{error}</div>}

            {!loading && !error && (
              <div style={styles.layoutGrid}>
                <div style={styles.leftColumn}>
                  {filteredFixtures.length === 0 && (
                    <div style={styles.emptyCard}>No fixtures available in this filter</div>
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

                <div style={styles.rightColumn}>
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
            <h2 style={styles.sectionTitle}>Showing At The Duke</h2>

            <div style={styles.showingGrid}>
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
          <div style={styles.fanzoCard}>
            <h2 style={styles.sectionTitle}>FANZO Fixture Planner</h2>
            <p style={styles.fanzoText}>
              Open the full FANZO planner in a separate page.
            </p>
            <button onClick={openFanzoFixtures} style={styles.openButton}>
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
        ...styles.fixtureCard,
        borderLeft: `6px solid ${getSportColour(fixture.sport)}`
      }}
    >
      <div style={styles.fixtureCardHeader}>
        <div>
          <div style={styles.fixtureSport}>
            {String(fixture.sport || "").toUpperCase()} • {fixture.source}
          </div>

          <div style={styles.fixtureDate}>
            {formatDate(fixture.date)}
            {fixture.date ? " • " : ""}
            {fixture.time}
          </div>

          <div style={styles.fixtureTitle}>{fixture.title}</div>
          <div style={styles.fixtureMeta}>{fixture.channel}</div>
        </div>

        <div style={styles.channelWrap}>
          <span style={{ ...styles.channelBadge, background: channel.bg }}>
            {channel.label}
          </span>
        </div>
      </div>

      <div style={styles.assignButtonRow}>
        <button style={styles.box1Button} onClick={() => onAssign("box1", fixture)}>
          Add to Box 1
        </button>

        <button style={styles.box2Button} onClick={() => onAssign("box2", fixture)}>
          Add to Box 2
        </button>

        <button style={styles.box3Button} onClick={() => onAssign("box3", fixture)}>
          Add to Box 3
        </button>
      </div>
    </div>
  );
}

function SkyBoxLane({
  title,
  accent,
  fixtures,
  getChannelInfo,
  getSportColour,
  formatDate,
  onRemove,
  onClear
}) {
  return (
    <div
      style={{
        ...styles.laneCard,
        borderTop: `6px solid ${accent}`
      }}
    >
      <div style={styles.laneHeader}>
        <div style={styles.laneTitle}>{title}</div>
        <button onClick={onClear} style={styles.clearBoxButton}>
          Clear
        </button>
      </div>

      {fixtures.length === 0 && <div style={styles.emptyLane}>No matches assigned</div>}

      {fixtures.map((fixture) => {
        const channel = getChannelInfo(fixture.code);

        return (
          <div
            key={fixture.id}
            style={{
              ...styles.laneFixtureCard,
              borderLeft: `5px solid ${getSportColour(fixture.sport)}`
            }}
          >
            <div style={styles.laneFixtureSport}>
              {String(fixture.sport || "").toUpperCase()} • {fixture.source}
            </div>

            <div style={styles.laneFixtureDate}>
              {formatDate(fixture.date)}
              {fixture.date ? " • " : ""}
              {fixture.time}
            </div>

            <div style={styles.laneFixtureTitle}>{fixture.title}</div>
            <div style={styles.laneFixtureChannel}>{fixture.channel}</div>

            <div style={styles.laneBadgeRow}>
              <span style={{ ...styles.channelBadge, background: channel.bg }}>
                {channel.label}
              </span>
            </div>

            <button onClick={() => onRemove(fixture)} style={styles.removeButton}>
              Remove
            </button>
          </div>
        );
      })}
    </div>
  );
}

const tabButton = (active) => ({
  background: active ? "#1e88e5" : "#222222",
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

const styles = {
  appShell: {
    background: "linear-gradient(180deg, #0d0d0d 0%, #171717 45%, #111111 100%)",
    minHeight: "100vh",
    color: "white",
    fontFamily: "'Segoe UI', Arial, sans-serif"
  },
  heroHeader: {
    display: "flex",
    alignItems: "center",
    gap: "18px",
    padding: "18px 20px",
    background: "linear-gradient(135deg, #000000 0%, #111111 45%, #1b1b1b 100%)",
    borderBottom: "3px solid #1e88e5",
    flexWrap: "wrap"
  },
  logoStyle: {
    height: "72px",
    width: "72px",
    borderRadius: "50%",
    objectFit: "cover",
    border: "2px solid #2b2b2b"
  },
  eyebrow: {
    fontSize: "12px",
    letterSpacing: "2px",
    color: "#bdbdbd",
    fontWeight: "800",
    textTransform: "uppercase"
  },
  mainTitle: {
    margin: "4px 0",
    fontSize: "30px",
    lineHeight: "1.1"
  },
  subTitle: {
    color: "#d7d7d7",
    fontSize: "15px",
    fontWeight: "600"
  },
  pagePadding: {
    padding: "20px"
  },
  topBar: {
    display: "flex",
    justifyContent: "space-between",
    gap: "14px",
    flexWrap: "wrap",
    marginBottom: "20px"
  },
  navRow: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap"
  },
  refreshButton: {
    background: "#7b1fa2",
    color: "white",
    border: "none",
    padding: "12px 16px",
    borderRadius: "10px",
    fontWeight: "700",
    fontSize: "15px",
    cursor: "pointer"
  },
  resetButton: {
    background: "#b71c1c",
    color: "white",
    border: "none",
    padding: "12px 16px",
    borderRadius: "10px",
    fontWeight: "700",
    fontSize: "15px",
    cursor: "pointer"
  },
  plannerIntro: {
    background: "#171717",
    border: "1px solid #2d2d2d",
    borderRadius: "14px",
    padding: "16px",
    marginBottom: "18px"
  },
  plannerIntroTitle: {
    fontWeight: "800",
    fontSize: "18px",
    marginBottom: "6px"
  },
  plannerIntroText: {
    color: "#c7c7c7"
  },
  layoutGrid: {
    display: "grid",
    gridTemplateColumns: "minmax(320px, 1fr) minmax(320px, 1.4fr)",
    gap: "20px"
  },
  showingGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
    gap: "16px"
  },
  leftColumn: {
    minWidth: 0
  },
  rightColumn: {
    display: "grid",
    gap: "16px",
    minWidth: 0
  },
  emptyCard: {
    padding: "18px",
    background: "#1c1c1c",
    borderRadius: "12px",
    fontSize: "18px",
    fontWeight: "bold",
    border: "1px solid #2f2f2f"
  },
  errorCard: {
    padding: "18px",
    background: "#3a1212",
    borderRadius: "12px",
    fontSize: "18px",
    fontWeight: "bold",
    border: "1px solid #7a2525",
    marginBottom: "18px"
  },
  fixtureCard: {
    background: "#1b1b1b",
    borderRadius: "16px",
    padding: "16px",
    marginBottom: "16px",
    border: "1px solid #313131",
    boxShadow: "0 8px 24px rgba(0,0,0,0.25)"
  },
  fixtureCardHeader: {
    display: "flex",
    justifyContent: "space-between",
    gap: "12px",
    flexWrap: "wrap",
    alignItems: "flex-start"
  },
  fixtureSport: {
    color: "#c0c0c0",
    fontSize: "13px",
    marginBottom: "4px",
    fontWeight: "700",
    letterSpacing: "1px"
  },
  fixtureDate: {
    color: "#c0c0c0",
    fontSize: "14px",
    marginBottom: "4px",
    fontWeight: "600"
  },
  fixtureTitle: {
    fontSize: "21px",
    fontWeight: "800"
  },
  fixtureMeta: {
    color: "#d0d0d0",
    marginTop: "4px"
  },
  channelWrap: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    flexWrap: "wrap"
  },
  channelBadge: {
    display: "inline-block",
    color: "white",
    padding: "6px 10px",
    borderRadius: "999px",
    fontSize: "12px",
    fontWeight: "800",
    letterSpacing: "0.4px"
  },
  assignButtonRow: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
    marginTop: "16px"
  },
  laneCard: {
    background: "#171717",
    borderRadius: "18px",
    padding: "18px",
    boxShadow: "0 10px 28px rgba(0,0,0,0.28)"
  },
  laneHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "10px"
  },
  laneTitle: {
    fontSize: "22px",
    fontWeight: "800"
  },
  emptyLane: {
    marginTop: "14px",
    color: "#bdbdbd"
 
