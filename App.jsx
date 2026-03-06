import React, { useState } from "react";
import logo from "./assets/duke-logo.jpg";

export default function App() {
  const [page, setPage] = useState("fixtures");
  const [boxes, setBoxes] = useState({
    box1: "No match assigned",
    box2: "No match assigned",
    box3: "No match assigned"
  });

  const matches = [
    "Premier League 17:30 - Sky Sports Main Event (Ch401)",
    "Champions League 20:00 - TNT Sports 1 (Ch410)",
    "Rugby Six Nations 16:45 - ITV 1 (Ch103)"
  ];

  function assign(box, match) {
    setBoxes({ ...boxes, [box]: match });
  }

  return (
    <div>
      <div className="header">
        <img src={logo} alt="Duke of Devonshire logo" />
        <div>
          <h2 style={{ margin: 0 }}>Duke of Devonshire Sports TV</h2>
          <div>Eastbourne Match Control</div>
        </div>
      </div>

      <div className="container">
        <button onClick={() => setPage("fixtures")}>Live Fixtures</button>
        <button onClick={() => setPage("board")}>Sky Box Board</button>

        {page === "fixtures" && (
          <div>
            <h2>Live Sports (FANZO)</h2>
            <iframe
              src="https://widget.fanzo.com/?id=14245"
              width="100%"
              height="500"
              title="Fanzo live sports"
            ></iframe>

            <h3>Assign Match To Sky Box</h3>

            {matches.map((m, i) => (
              <div key={i} className="match">
                <div>{m}</div>
                <div>
                  <button onClick={() => assign("box1", m)}>Sky Box 1</button>
                  <button onClick={() => assign("box2", m)}>Sky Box 2</button>
                  <button onClick={() => assign("box3", m)}>Sky Box 3</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {page === "board" && (
          <div className="board">
            <h2>Sky Box TV Schedule</h2>
            <p>📺 Sky Box 1: {boxes.box1}</p>
            <p>📺 Sky Box 2: {boxes.box2}</p>
            <p>📺 Sky Box 3: {boxes.box3}</p>
          </div>
        )}
      </div>
    </div>
  );
}
