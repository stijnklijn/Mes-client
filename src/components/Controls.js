import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCopy, faCheck } from "@fortawesome/free-solid-svg-icons";

import BidButton from "./BidButton";

export default function Controls({
  gameState,
  submitBid,
  setName,
  setMode,
  gameId,
  setGameId,
  disconnect,
}) {
  const [copied, setCopied] = useState(false);

  function copy() {
    navigator.clipboard.writeText(gameId);
    setCopied(true);
  }

  function onDisconnect() {
    disconnect(setName, setMode, setGameId);
  }

  return (
    <div className="controls-field">
      <h1>Ronde {gameState.round}</h1>
      <div className="players-container">
        <div className="player-container">
          <div className="player-name">{gameState.self.name}</div>
          <div>{gameState.self.score}</div>
        </div>
        <div className="player-container">
          <div className="player-name">Pot</div>
          <div>{gameState.bank}</div>
        </div>
        <div className="player-container">
          <div className="player-name">
            {gameState.opponent ? gameState.opponent.name : "-"}
          </div>
          <div>{gameState.opponent ? gameState.opponent.score : "-"}</div>
        </div>
      </div>
      <div className="bid-buttons-container">
        {[10, 20, 30, 40, 50, 0].map((value) => (
          <BidButton
            key={value}
            gameState={gameState}
            value={value}
            submitBid={submitBid}
          />
        ))}
      </div>
      <div className="connection-container">
        <div className="game-id">
          <span>Spelcode: {gameId}</span>
          <button onClick={copy}>
            <FontAwesomeIcon icon={copied ? faCheck : faCopy} />
          </button>
        </div>
        <div>
          <button onClick={onDisconnect}>Spel verlaten</button>
        </div>
      </div>
    </div>
  );
}
