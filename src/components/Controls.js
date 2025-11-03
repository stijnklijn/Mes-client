import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCopy, faCheck } from "@fortawesome/free-solid-svg-icons";

import BidButton from "./BidButton";

function Controls({
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
      <h2>Ronde {gameState.round}</h2>
      <div className="players-container">
        <div className="player-container">
          <div className="player-name">{gameState.self.name}</div>
          <div className="player-score">{gameState.self.score}</div>
        </div>
        <div className="player-container">
          <div className="player-name">Pot</div>
          <div className="player-score">{gameState.bank}</div>
        </div>
        <div className="player-container">
          <div className="player-name">
            {gameState.opponent ? gameState.opponent.name : "-"}
          </div>
          <div className="player-score">
            {gameState.opponent ? gameState.opponent.score : "-"}
          </div>
        </div>
      </div>
      <div className="bids-container">
        <h2>Bieden</h2>
        <div className="bid-buttons">
          {[10, 20, 30, 40, 50, 0].map((value) => (
            <BidButton
              key={value}
              gameState={gameState}
              value={value}
              submitBid={submitBid}
            />
          ))}
        </div>
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

export default Controls;
