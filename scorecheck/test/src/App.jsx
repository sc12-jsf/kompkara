import React, { useState, useRef } from "react";

export default function WebSocketTester() {
  const [lid, setLid] = useState("test123");
  const [idname, setIdname] = useState("Player" + Math.floor(Math.random() * 1000));

  const [lobbyLog, setLobbyLog] = useState([]);
  const [battleLog, setBattleLog] = useState([]);

  const lobbyWS = useRef(null);
  const battleWS = useRef(null);

  const addLobbyLog = (msg) =>
    setLobbyLog((prev) => [...prev, `[LOBBY] ${msg}`]);

  const addBattleLog = (msg) =>
    setBattleLog((prev) => [...prev, `[BATTLE] ${msg}`]);

  // -----------------------------
  // LOBBY CONNECTION
  // -----------------------------
  const connectLobby = () => {
    lobbyWS.current = new WebSocket(`ws://localhost:8000/ws/${lid}/${idname}`);

    lobbyWS.current.onopen = () => addLobbyLog("Connected");
    lobbyWS.current.onclose = () => addLobbyLog("Closed");
    lobbyWS.current.onerror = (e) => addLobbyLog("Error: " + e.message);

    lobbyWS.current.onmessage = (event) => {
      addLobbyLog("Recv: " + event.data);
    };
  };

  const sendLobby = (obj) => {
    if (!lobbyWS.current) return;
    lobbyWS.current.send(JSON.stringify(obj));
    addLobbyLog("Sent: " + JSON.stringify(obj));
  };

  // -----------------------------
  // BATTLE CONNECTION
  // -----------------------------
  const connectBattle = () => {
    battleWS.current = new WebSocket(`ws://localhost:8000/battle/${lid}/${idname}`);

    battleWS.current.onopen = () => addBattleLog("Connected");
    battleWS.current.onclose = () => addBattleLog("Closed");
    battleWS.current.onerror = (e) => addBattleLog("Error: " + e.message);

    battleWS.current.onmessage = (event) => {
      addBattleLog("Recv: " + event.data);
    };
  };

  const sendBattle = (obj) => {
    if (!battleWS.current) return;
    battleWS.current.send(JSON.stringify(obj));
    addBattleLog("Sent: " + JSON.stringify(obj));
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

      <div style={{ marginTop: 10 }}>
        <button onClick={() => sendLobby({ type: "JOIN_LOBBY" })}>
          JOIN_LOBBY
        </button>

        <button onClick={() => sendLobby({ type: "LEAVE_LOBBY" })}>
          LEAVE_LOBBY
        </button>

        <button
          onClick={() =>
            sendLobby({ type: "SET_READY", payload: { ready: true } })
          }
        >
          SET_READY (true)
        </button>

        <button
          onClick={() =>
            sendLobby({ type: "SET_READY", payload: { ready: false } })
          }
        >
          SET_READY (false)
        </button>

        <button
          onClick={() =>
            sendLobby({ type: "SELECT_SONG", payload: { songID: "song_42" } })
          }
        >
          SELECT_SONG
        </button>

        <button onClick={() => sendLobby({ type: "START_BATTLE" })}>
          START_BATTLE
        </button>
      </div>

      <pre
        style={{
          background: "#111",
          color: "#0f0",
          padding: 10,
          height: 200,
          overflowY: "scroll",
          marginTop: 10,
        }}
      >
        {lobbyLog.join("\n")}
      </pre>

      {/* BATTLE SECTION */}
      <h3>Battle WebSocket</h3>
      <button onClick={connectBattle}>Connect Battle</button>

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

      <pre
        style={{
          background: "#111",
          color: "#0ff",
          padding: 10,
          height: 200,
          overflowY: "scroll",
          marginTop: 10,
        }}
      >
        {battleLog.join("\n")}
      </pre>
    </div>
  );
}
