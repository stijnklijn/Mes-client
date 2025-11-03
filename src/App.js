import "./styles/styles.css";

import { useState, useEffect } from "react";

import { REST_URL, WEBSOCKET_URL } from "./constants/Constants";

import Lobby from "./components/Lobby";
import Game from "./components/Game";
import { useStomp } from "./hooks/useStomp";
import ErrorModal from "./components/ErrorModal";

const playerId = crypto.randomUUID();

function App() {
  const [name, setName] = useState("");
  const [mode, setMode] = useState("new");
  const [gameId, setGameId] = useState("");
  const [error, setError] = useState("");

  const { stompClient, connect, disconnect, connected } = useStomp(
    `${WEBSOCKET_URL}?playerId=${playerId}`,
    onConnect,
    onError
  );

  useEffect(() => {
    const isWindows = navigator.userAgent.includes("Windows");
    if (isWindows) {
      document.documentElement.dataset.os = "windows";
    } else {
      document.documentElement.dataset.os = "other";
    }
  }, []);

  async function handleStart(e) {
    e.preventDefault();

    try {
      switch (mode) {
        case "new": {
          const res = await fetch(`${REST_URL}/create-game`);
          const id = res.headers.get("Game-Id");
          connect();
          setGameId(id);
          break;
        }
        case "join": {
          const res = await fetch(`${REST_URL}/can-join/${gameId}/${name}`);
          if (!res.ok) {
            const err = res.headers.get("Error");
            setError(err);
            return;
          }
          connect();
          break;
        }
        default:
      }
    } catch (error) {
      setError("Er kan geen verbinding met de server worden gemaakt.");
    }
  }

  function onConnect(frame) {
    console.log("Connected: " + frame);
  }

  function onError(error) {
    setError("Er is een probleem met de verbinding.");
  }

  return (
    <>
      {!connected && (
        <Lobby
          name={name}
          setName={setName}
          mode={mode}
          setMode={setMode}
          gameId={gameId}
          setGameId={setGameId}
          handleStart={handleStart}
        />
      )}
      {connected && (
        <Game
          stompClient={stompClient}
          playerId={playerId}
          name={name}
          setName={setName}
          setMode={setMode}
          gameId={gameId}
          setGameId={setGameId}
          disconnect={disconnect}
          setError={setError}
        />
      )}
      {error && <ErrorModal error={error} setError={setError} />}
    </>
  );
}

export default App;
