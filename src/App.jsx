import React, { useState } from "react";
import logo from "./assets/IMG_20260306_141840.jpg";

export default function App() {
  const [page, setPage] = useState("fixtures");

  const [boxes, setBoxes] = useState({
    box1: "No match assigned",
    box2: "No match assigned",
    box3: "No match assigned"
  });

  const [matches, setMatches] = useState([
    "Premier League 17:30 - Sky Sports Main Event (Ch401)",
    "Champions League 20:00 - TNT Sports 1 (Ch410)",
    "FA Cup 19:45 - BBC One (Ch101)",
    "Six Nations 16:45 - ITV 1 (Ch103)",
    "Boxing 22:00 - Amazon Prime"
  ]);

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

    setMatches([
      "Premier League 17:30 - Sky Sports Main Event (Ch401)",
      "Champions League 20:00 - TNT Sports 1 (Ch410)",
      "FA Cup 19:45 - BBC One (Ch101)",
      "Six Nations 16:45 - ITV 1 (Ch103)",
      "Boxing 22:00 - Amazon Prime"
    ]);
  }

  function openFanzoFixtures() {
    window.open("https://business.fanzo.com/fixtures", "_blank");
  }

  function getChannelStyle(text) {
    const item = text.toLowerCase();

    if (item.includes("sky")) {
      return {
        background: "#1565c0",
        borderLeft: "6px solid #42a5f5",
        color: "white"
      };
    }

    if (item.includes("tnt")) {
      return {
        background: "#e65100",
        borderLeft: "6px solid #ffb74d",
        color: "white"
      };
    }

    if (item.includes("bbc")) {
      return {
        background: "#6a1b9a",
        borderLeft: "6px solid #ba68c8",
        color: "white"
      };
    }

    if (item.includes("itv")) {
      return {
        background: "#2e7d32",
        borderLeft: "6px solid #81c784",
        color: "white"
      };
    }

    if (item.includes("amazon")) {
      return {
        background: "#212121",
        borderLeft: "6px solid #fbc02d",
        color: "white"
      };
    }

    return {
      background: "#1c1c1c",
      borderLeft: "6px solid #666",
      color: "white"
    };
  }

  return (
    <div style={{ background: "#111", minHeight: "100vh", color: "white" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "15px",
          padding: "14px 18px",
          background: "#000",
          borderBottom: "2px solid #1e88e5"
        }}
      >
        <img
          src={logo}
          alt="Duke of Devonshire logo"
          style={{ height: "64px", width: "64px", borderRadius: "50%" }}
        />
        <div>
          <h2 style={{ margin: 0 }}>Duke of Devonshire Sports TV</h2>
          <div style={{ color: "#bbb" }}>Eastbourne Match Control</div>
        </div>
      </div>

      <div style={{ padding: "20px" }}>
        <div
          style={{
            display: "flex",
            gap: "10px",
            flexWrap: "wrap",
            marginBottom: "20px"
          }}
        >
          <button onClick={() => setPage("fixtures")} style={tabButton(page === "fixtures")}>
            Live Fixtures
          </button>

          <button onClick={() => setPage("board")} style={tabButton(page === "board")}>
            Sky Box Board
          </button>

          <button onClick={() => setPage("fanzo")} style={tabButton(page === "fanzo")}>
            Fanzo Fixtures
          </button>

          <button onClick={resetAssignments} style={resetButton}>
            Reset All
          </button>
        </div>

        {page === "fixtures" && (
          <div>
            <h2 style={{ marginBottom: "16px" }}>Live Sports (FANZO)</h2>

            <div
              style={{
                marginBottom: "24px",
                borderRadius: "12px",
                overflow: "hidden",
                border: "1px solid #333"
              }}
            >
              <iframe
                src="https://widget.fanzo.com/?id=14245"
                width="100%"
                height="500"
                title="Fanzo live sports"
                style={{ border: "none", display: "block", background: "#fff" }}
              ></iframe>
            </div>

            <h3 style={{ marginBottom: "16px" }}>Assign Match To Sky Box</h3>

            {matches.map((match, i) => (
              <div
                key={i}
                style={{
                  ...getChannelStyle(match),
                  marginBottom: "16px",
                  padding: "16px",
                  borderRadius: "12px"
                }}
              >
                <div
                  style={{
                    marginBottom: "14px",
                    fontSize: "18px",
                    fontWeight: "bold",
                    lineHeight: "1.4"
                  }}
                >
                  {match}
                </div>

                <div
                  style={{
                    display: "flex",
                    gap: "12px",
                    flexWrap: "wrap"
                  }}
                >
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
            ))}

            {matches.length === 0 && (
              <div
                style={{
                  padding: "18px",
                  background: "#1c1c1c",
                  borderRadius: "12px",
                  fontSize: "18px",
                  fontWeight: "bold",
                  border: "1px solid #2f2f2f"
                }}
              >
                ✅ All matches assigned
              </div>
            )}
          </div>
        )}

        {page === "board" && (
          <div>
            <h2 style={{ marginBottom: "16px" }}>Sky Box TV Schedule</h2>

            <div style={boardGrid}>
              <div style={{ ...boardCard("#1e88e5"), ...getChannelStyle(boxes.box1) }}>
                <div style={boardTitle}>📺 SKY BOX 1</div>
                <div style={boardText}>{boxes.box1}</div>
              </div>

              <div style={{ ...boardCard("#fb8c00"), ...getChannelStyle(boxes.box2) }}>
                <div style={boardTitle}>📺 SKY BOX 2</div>
                <div style={boardText}>{boxes.box2}</div>
              </div>

              <div style={{ ...boardCard("#43a047"), ...getChannelStyle(boxes.box3) }}>
                <div style={boardTitle}>📺 SKY BOX 3</div>
                <div style={boardText}>{boxes.box3}</div>
              </div>
            </div>

            <div
              style={{
                marginTop: "24px",
                display: "flex",
                gap: "12px",
                flexWrap: "wrap"
              }}
            >
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
            <h2 style={{ marginBottom: "16px" }}>Fanzo Fixture Planner</h2>

            <div
              style={{
                background: "#1c1c1c",
                borderRadius: "12px",
                padding: "24px",
                border: "1px solid #333"
              }}
            >
              <p style={{ fontSize: "18px", marginTop: 0 }}>
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

const tabButton = (active) => ({
  background: active ? "#1e88e5" : "#222",
  color: "white",
  border: "none",
  padding: "12px 16px",
  borderRadius: "10px",
  fontWeight: "bold",
  fontSize: "15px",
  cursor: "pointer"
});

const resetButton = {
  background: "#b71c1c",
  color: "white",
  border: "none",
  padding: "12px 16px",
  borderRadius: "10px",
  fontWeight: "bold",
  fontSize: "15px",
  cursor: "pointer"
};

const openButton = {
  background: "#1e88e5",
  color: "white",
  border: "none",
  padding: "14px 20px",
  borderRadius: "10px",
  fontWeight: "bold",
  fontSize: "16px",
  cursor: "pointer"
};

const box1Button = {
  background: "#1e88e5",
  color: "white",
  border: "none",
  padding: "14px 18px",
  borderRadius: "10px",
  fontWeight: "bold",
  fontSize: "16px",
  cursor: "pointer"
};

const box2Button = {
  background: "#fb8c00",
  color: "white",
  border: "none",
  padding: "14px 18px",
  borderRadius: "10px",
  fontWeight: "bold",
  fontSize: "16px",
  cursor: "pointer"
};

const box3Button = {
  background: "#43a047",
  color: "white",
  border: "none",
  padding: "14px 18px",
  borderRadius: "10px",
  fontWeight: "bold",
  fontSize: "16px",
  cursor: "pointer"
};

const boardGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
  gap: "16px"
};

const boardCard = (color) => ({
  borderRadius: "14px",
  padding: "18px",
  borderTop: `6px solid ${color}`,
  minHeight: "160px"
});

const boardTitle = {
  fontSize: "22px",
  fontWeight: "bold",
  marginBottom: "12px"
};

const boardText = {
  fontSize: "18px",
  lineHeight: "1.5",
  color: "#f1f1f1"
};

const legendStyle = (background) => ({
  background,
  color: "white",
  padding: "10px 14px",
  borderRadius: "10px",
  fontWeight: "bold"
});
