import React, { useState, useRef } from "react";

export default function WebSocketTester() {
  const [lid, setLid] = useState("test123");
  const [idname, setIdname] = useState("Player" + Math.floor(Math.random() * 1000));

  const [lobbyLog, setLobbyLog] = useState([]);
  const [battleLog, setBattleLog] = useState([]);

  const lobbyWS = useRef(null);
  const battleWS = useRef(null);

  const timestamp = () =>
    new Date().toLocaleTimeString("en-US", { hour12: false });

  const logLobby = (msg) =>
    setLobbyLog((prev) => [...prev, `${timestamp()}  ${msg}`]);

  const logBattle = (msg) =>
    setBattleLog((prev) => [...prev, `${timestamp()}  ${msg}`]);

  // -----------------------------
  // LOBBY CONNECTION
  // -----------------------------
  const connectLobby = () => {
    if (lobbyWS.current) lobbyWS.current.close();

    const ws = new WebSocket(`ws://localhost:8000/ws/${lid}/${idname}`);
    lobbyWS.current = ws;

    ws.onopen = () => logLobby("[OPEN]");
    ws.onclose = () => logLobby("[CLOSE]");
    ws.onerror = (e) => logLobby("[ERROR] " + e.message);

    ws.onmessage = (event) => {
      try {
        const parsed = JSON.parse(event.data);
        logLobby("[RECV] " + JSON.stringify(parsed, null, 2));
      } catch {
        logLobby("[RECV RAW] " + event.data);
      }
    };
  };

  const sendLobby = (obj) => {
    if (!lobbyWS.current || lobbyWS.current.readyState !== 1) {
      logLobby("[SEND FAILED] socket not open");
      return;
    }
    lobbyWS.current.send(JSON.stringify(obj));
    logLobby("[SEND] " + JSON.stringify(obj));
  };

  const closeLobby = () => {
    if (lobbyWS.current) lobbyWS.current.close();
  };

  // -----------------------------
  // BATTLE CONNECTION
  // -----------------------------
  const connectBattle = () => {
    if (battleWS.current) battleWS.current.close();

    const ws = new WebSocket(`ws://localhost:8000/battle/${lid}/${idname}`);
    battleWS.current = ws;

    ws.onopen = () => logBattle("[OPEN]");
    ws.onclose = () => logBattle("[CLOSE]");
    ws.onerror = (e) => logBattle("[ERROR] " + e.message);

    ws.onmessage = (event) => {
      try {
        const parsed = JSON.parse(event.data);
        logBattle("[RECV] " + JSON.stringify(parsed, null, 2));
      } catch {
        logBattle("[RECV RAW] " + event.data);
      }
    };
  };

  const sendBattle = (obj) => {
    if (!battleWS.current || battleWS.current.readyState !== 1) {
      logBattle("[SEND FAILED] socket not open");
      return;
    }
    battleWS.current.send(JSON.stringify(obj));
    logBattle("[SEND] " + JSON.stringify(obj));
  };

  const closeBattle = () => {
    if (battleWS.current) battleWS.current.close();
  };

  // -----------------------------
  // UI
  // -----------------------------
  return (
    <div style={{ padding: 20, fontFamily: "monospace" }}>
      <h2>WebSocket Protocol Tester</h2>

      <div style={{ marginBottom: 20 }}>
        <label>Lobby ID: </label>
        <input value={lid} onChange={(e) => setLid(e.target.value)} />
        <br />
        <label>Player Name: </label>
        <input value={idname} onChange={(e) => setIdname(e.target.value)} />
      </div>

      {/* LOBBY SECTION */}
      <h3>Lobby WebSocket</h3>
      <button onClick={connectLobby}>Connect Lobby</button>
      <button onClick={closeLobby} style={{ marginLeft: 10 }}>
        Close Lobby
      </button>
      <button onClick={() => setLobbyLog([])} style={{ marginLeft: 10 }}>
        Clear Log
      </button>

      <div style={{ marginTop: 10 }}>
        <button onClick={() => sendLobby({ type: "JOIN_LOBBY" })}>JOIN_LOBBY</button>
        <button onClick={() => sendLobby({ type: "LEAVE_LOBBY" })}>LEAVE_LOBBY</button>
        <button onClick={() => sendLobby({ type: "SET_READY", payload: { ready: true } })}>
          SET_READY (true)
        </button>
        <button onClick={() => sendLobby({ type: "SET_READY", payload: { ready: false } })}>
          SET_READY (false)
        </button>
        <button onClick={() => sendLobby({ type: "SELECT_SONG", payload: { songID: "song_42" } })}>
          SELECT_SONG
        </button>
        <button onClick={() => sendLobby({ type: "START_BATTLE" })}>START_BATTLE</button>
      </div>

      <pre style={{ background: "#111", color: "#0f0", padding: 10, height: 200, overflowY: "scroll", marginTop: 10 }}>
        {lobbyLog.join("\n")}
      </pre>

      {/* BATTLE SECTION */}
      <h3>Battle WebSocket</h3>
      <button onClick={connectBattle}>Connect Battle</button>
      <button onClick={closeBattle} style={{ marginLeft: 10 }}>
        Close Battle
      </button>
      <button onClick={() => setBattleLog([])} style={{ marginLeft: 10 }}>
        Clear Log
      </button>

      <div style={{ marginTop: 10 }}>
        <button
          onClick={() =>
            sendBattle({
              type: "pitch",
              pitch: 220 + Math.random() * 20,
              time: Math.floor(Math.random() * 50000),
            })
          }
        >
          Send pitch packet
        </button>

        <button onClick={() => sendBattle({ type: "FINISH_BATTLE" })}>
          FINISH_BATTLE
        </button>
      </div>

      <pre style={{ background: "#111", color: "#0ff", padding: 10, height: 200, overflowY: "scroll", marginTop: 10 }}>
        {battleLog.join("\n")}
      </pre>
    </div>
  );
}
