import React, { useState } from "react";
import logo from "./assets/IMG_20260306_141840.jpg";

const defaultMatches = [
  "Premier League 17:30 - Sky Sports Main Event (Ch401)",
  "Champions League 20:00 - TNT Sports 1 (Ch410)",
  "FA Cup 19:45 - BBC One (Ch101)",
  "Six Nations 16:45 - ITV 1 (Ch103)",
  "Boxing 22:00 - Amazon Prime"
];

export default function App() {
  const [page, setPage] = useState("fixtures");

  const [boxes, setBoxes] = useState({
    box1: "No match assigned",
    box2: "No match assigned",
    box3: "No match assigned"
  });

  const [matches, setMatches] = useState(defaultMatches);

  function assign(box, match) {
    setBoxes((prev) => ({
      ...prev,
      [box]: match
    }));
    setMatches((prev) => prev.filter((m) => m !== match));
  }

  function resetAssignments() {
    setBoxes({
      box1: "No match assigned",
      box2: "No match assigned",
      box3: "No match assigned"
    });
    setMatches(defaultMatches);
  }

  function openFanzoFixtures() {
    window.open("https://business.fanzo.com/fixtures", "_blank");
  }

  function getChannelInfo(text) {
    const item = text.toLowerCase();

    if (item.includes("sky")) {
      return { label: "SKY", bg: "#1565c0", border: "#42a5f5" };
    }
    if (item.includes("tnt")) {
      return { label: "TNT", bg: "#e65100", border: "#ffb74d" };
    }
    if (item.includes("bbc")) {
      return { label: "BBC", bg: "#6a1b9a", border: "#ba68c8" };
    }
    if (item.includes("itv")) {
      return { label: "ITV", bg: "#2e7d32", border: "#81c784" };
    }
    if (item.includes("amazon")) {
      return { label: "AMAZON", bg: "#212121", border: "#fbc02d" };
    }

    return { label: "OTHER", bg: "#424242", border: "#9e9e9e" };
  }

  function getPopularityScore(match) {
    const m = match.toLowerCase();
    let score = 0;

    if (m.includes("premier league")) score += 100;
    if (m.includes("champions league")) score += 90;
    if (m.includes("fa cup")) score += 75;
    if (m.includes("boxing")) score += 70;
    if (m.includes("six nations")) score += 65;

    if (m.includes("sky sports main event")) score += 20;
    if (m.includes("tnt")) score += 15;
    if (m.includes("bbc")) score += 10;
    if (m.includes("itv")) score += 8;
    if (m.includes("amazon")) score += 6;

    return score;
  }

  function autoAssign() {
    const pool = [...matches].sort(
      (a, b) => getPopularityScore(b) - getPopularityScore(a)
    );

    setBoxes({
      box1: pool[0] || "No match assigned",
      box2: pool[1] || "No match assigned",
      box3: pool[2] || "No match assigned"
    });

    setMatches(pool.slice(3));
  }

  function ChannelBadge({ text }) {
    const channel = getChannelInfo(text);

    return (
      <span
        style={{
          display: "inline-block",
          background: channel.bg,
          color: "white",
          padding: "6px 10px",
          borderRadius: "999px",
          fontSize: "12px",
          fontWeight: "800",
          letterSpacing: "0.5px",
          marginTop: "10px"
        }}
      >
        {channel.label}
      </span>
    );
  }

  return (
    <div style={appShell}>
      <div style={heroHeader}>
        <img
          src={logo}
          alt="Duke of Devonshire logo"
          style={logoStyle}
        />

        <div style={{ flex: 1 }}>
          <div style={eyebrow}>WELCOME TO</div>
          <h1 style={mainTitle}>The Duke Of Devonshire</h1>
          <div style={subTitle}>Excellent Value Pub In Eastbourne</div>
          <div style={heroCopy}>
            Big nights, big matches and an even bigger atmosphere.
          </div>
        </div>
      </div>

      <div style={topInfoGrid}>
        <div style={infoCard}>
          <div style={infoTitle}>Venue</div>
          <div style={infoText}>155 Terminus Road</div>
          <div style={infoText}>Eastbourne, East Sussex, BN21 3NU</div>
          <div style={infoText}>01323 433041</div>
        </div>

        <div style={infoCard}>
          <div style={infoTitle}>Opening Hours</div>
          <div style={infoText}>Mon-Sun: 10:00 - 23:00</div>
        </div>

        <div style={infoCard}>
          <div style={infoTitle}>Pub Highlights</div>
          <div style={badgeWrap}>
            <span style={featureBadge}>Live Sport</span>
            <span style={featureBadge}>Broad Range of Beers</span>
            <span style={featureBadge}>Pub Garden</span>
            <span style={featureBadge}>Heaters & Cover</span>
            <span style={featureBadge}>Three Regional Real Ales</span>
            <span style={featureBadge}>Food & Drink Deals</span>
          </div>
        </div>
      </div>

      <div style={{ padding: "20px" }}>
        <div style={navRow}>
          <button onClick={() => setPage("fixtures")} style={tabButton(page === "fixtures")}>
            Live Fixtures
          </button>

          <button onClick={() => setPage("board")} style={tabButton(page === "board")}>
            Sky Box Board
          </button>

          <button onClick={() => setPage("fanzo")} style={tabButton(page === "fanzo")}>
            FANZO Planner
          </button>

          <button onClick={autoAssign} style={autoAssignButton}>
            Auto Assign
          </button>

          <button onClick={resetAssignments} style={resetButton}>
            Reset All
          </button>
        </div>

        {page === "fixtures" && (
          <div>
            <h2 style={sectionTitle}>Live Sports</h2>

            <div style={iframeCard}>
              <iframe
                src="https://widget.fanzo.com/?id=14245"
                width="100%"
                height="500"
                title="Fanzo live sports"
                style={{ border: "none", display: "block", background: "#fff" }}
              ></iframe>
            </div>

            <div style={assignIntroCard}>
              <div style={assignIntroTitle}>Assign matches to screens</div>
              <div style={assignIntroText}>
                Put the biggest event on Sky Box 1, then work down to 3.
              </div>
            </div>

            {matches.map((match, i) => {
              const channel = getChannelInfo(match);

              return (
                <div
                  key={i}
                  style={{
                    marginBottom: "16px",
                    padding: "16px",
                    background: "#1b1b1b",
                    borderRadius: "14px",
                    borderLeft: `6px solid ${channel.border}`,
                    borderTop: `1px solid ${channel.border}`,
                    borderRight: "1px solid #313131",
                    borderBottom: "1px solid #313131",
                    boxShadow: "0 8px 24px rgba(0,0,0,0.25)"
                  }}
                >
                  <div style={matchTitle}>{match}</div>

                  <ChannelBadge text={match} />

                  <div style={buttonRow}>
                    <button style={box1Button} onClick={() => assign("box1", match)}>
                      📺 SKY BOX 1
                    </button>

                    <button style={box2Button} onClick={() => assign("box2", match)}>
                      📺 SKY BOX 2
                    </button>

                    <button style={box3Button} onClick={() => assign("box3", match)}>
                      📺 SKY BOX 3
                    </button>
                  </div>
                </div>
              );
            })}

            {matches.length === 0 && (
              <div style={allAssignedCard}>✅ All matches assigned</div>
            )}
          </div>
        )}

        {page === "board" && (
          <div>
            <h2 style={sectionTitle}>Sky Box TV Schedule</h2>

            <div style={boardGrid}>
              {[["box1", "📺 SKY BOX 1"], ["box2", "📺 SKY BOX 2"], ["box3", "📺 SKY BOX 3"]].map(
                ([key, title]) => {
                  const channel = getChannelInfo(boxes[key]);

                  return (
                    <div
                      key={key}
                      style={{
                        background: "#1c1c1c",
                        borderRadius: "16px",
                        padding: "20px",
                        borderTop: `6px solid ${channel.border}`,
                        minHeight: "210px",
                        boxShadow: "0 10px 28px rgba(0,0,0,0.28)"
                      }}
                    >
                      <div style={boardTitle}>{title}</div>
                      <div style={boardText}>{boxes[key]}</div>

                      {boxes[key] !== "No match assigned" && (
                        <div style={{ marginTop: "14px" }}>
                          <ChannelBadge text={boxes[key]} />
                        </div>
                      )}
                    </div>
                  );
                }
              )}
            </div>

            <div style={legendRow}>
              <div style={legendStyle("#1565c0")}>Sky</div>
              <div style={legendStyle("#e65100")}>TNT</div>
              <div style={legendStyle("#6a1b9a")}>BBC</div>
              <div style={legendStyle("#2e7d32")}>ITV</div>
              <div style={legendStyle("#212121")}>Amazon</div>
            </div>
          </div>
        )}

        {page === "fanzo" && (
          <div>
            <h2 style={sectionTitle}>FANZO Fixture Planner</h2>

            <div style={plannerCard}>
              <p style={{ fontSize: "18px", marginTop: 0, color: "#f0f0f0" }}>
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

const appShell = {
  background:
    "linear-gradient(180deg, #0d0d0d 0%, #171717 45%, #111111 100%)",
  minHeight: "100vh",
  color: "white",
  fontFamily:
    "'Arial Black', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
};

const heroHeader = {
  display: "flex",
  alignItems: "center",
  gap: "18px",
  padding: "18px 20px",
  background:
    "linear-gradient(135deg, #000000 0%, #111111 45%, #1b1b1b 100%)",
  borderBottom: "3px solid #1e88e5",
  boxShadow: "0 10px 28px rgba(0,0,0,0.28)",
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

const heroCopy = {
  marginTop: "6px",
  color: "#b0b0b0",
  fontSize: "15px"
};

const topInfoGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
  gap: "14px",
  padding: "18px 20px 0 20px"
};

const infoCard = {
  background: "#1a1a1a",
  border: "1px solid #2f2f2f",
  borderRadius: "14px",
  padding: "16px",
  boxShadow: "0 8px 22px rgba(0,0,0,0.22)"
};

const infoTitle = {
  fontSize: "15px",
  fontWeight: "800",
  color: "#64b5f6",
  marginBottom: "10px",
  textTransform: "uppercase",
  letterSpacing: "1px"
};

const infoText = {
  color: "#ececec",
  lineHeight: "1.6",
  fontSize: "15px"
};

const badgeWrap = {
  display: "flex",
  flexWrap: "wrap",
  gap: "8px"
};

const featureBadge = {
  background: "#252525",
  color: "#f5f5f5",
  border: "1px solid #3a3a3a",
  padding: "8px 10px",
  borderRadius: "999px",
  fontSize: "12px",
  fontWeight: "700"
};

const navRow = {
  display: "flex",
  gap: "10px",
  flexWrap: "wrap",
  marginBottom: "20px"
};

const sectionTitle = {
  marginBottom: "16px",
  fontSize: "28px"
};

const iframeCard = {
  marginBottom: "24px",
  borderRadius: "14px",
  overflow: "hidden",
  border: "1px solid #333",
  boxShadow: "0 10px 28px rgba(0,0,0,0.28)"
};

const assignIntroCard = {
  background: "#171717",
  border: "1px solid #2d2d2d",
  borderRadius: "14px",
  padding: "16px",
  marginBottom: "16px"
};

const assignIntroTitle = {
  fontWeight: "800",
  fontSize: "18px",
  marginBottom: "6px"
};

const assignIntroText = {
  color: "#c7c7c7"
};

const matchTitle = {
  marginBottom: "8px",
  fontSize: "18px",
  fontWeight: "800",
  lineHeight: "1.4"
};

const buttonRow = {
  display: "flex",
  gap: "12px",
  flexWrap: "wrap",
  marginTop: "14px"
};

const allAssignedCard = {
  padding: "18px",
  background: "#1c1c1c",
  borderRadius: "12px",
  fontSize: "18px",
  fontWeight: "bold",
  border: "1px solid #2f2f2f"
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

const boardGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
  gap: "16px"
};

const boardTitle = {
  fontSize: "22px",
  fontWeight: "800",
  marginBottom: "12px"
};

const boardText = {
  fontSize: "18px",
  lineHeight: "1.5",
  color: "#f1f1f1"
};

const legendRow = {
  marginTop: "24px",
  display: "flex",
  gap: "12px",
  flexWrap: "wrap"
};

const legendStyle = (background) => ({
  background,
  color: "white",
  padding: "10px 14px",
  borderRadius: "10px",
  fontWeight: "800"
});

const plannerCard = {
  background: "#1c1c1c",
  borderRadius: "12px",
  padding: "24px",
  border: "1px solid #333"
};
