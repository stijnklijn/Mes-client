import "./styles/styles.css";

import { useState, useEffect } from "react";

import {
  REST_URL,
  WEBSOCKET_URL,
  SHARED_CONSTANTS_PATH,
} from "./constants/Constants";

import useStomp from "./hooks/useStomp";
import Lobby from "./components/Lobby";
import Game from "./components/Game";
import ErrorModal from "./components/ErrorModal";

let SHARED_CONSTANTS;
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
    document.documentElement.dataset.os = isWindows ? "windows" : "other";
  }, []);

  async function handleStart(e) {
    e.preventDefault();

    try {
      const res = await fetch(`${REST_URL}${SHARED_CONSTANTS_PATH}`);
      SHARED_CONSTANTS = await res.json();
      switch (mode) {
        case "new": {
          const res = await fetch(
            `${REST_URL}${SHARED_CONSTANTS.CREATE_GAME_PATH}`
          );
          const id = res.headers.get(SHARED_CONSTANTS.GAME_ID_HEADER);
          connect();
          setGameId(id);
          break;
        }
        case "join": {
          const res = await fetch(
            `${REST_URL}${SHARED_CONSTANTS.CAN_JOIN_PATH}/${gameId}/${name}`
          );
          if (!res.ok) {
            const err = res.headers.get(SHARED_CONSTANTS.ERROR_HEADER);
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
          SHARED_CONSTANTS={SHARED_CONSTANTS}
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
