import { GAME_ID_LENGTH, MAX_NAME_LENGTH } from "../constants/Constants";

function Lobby({
  name,
  setName,
  mode,
  setMode,
  gameId,
  setGameId,
  handleStart,
}) {
  function hasName() {
    return name.trim() !== "";
  }

  function hasGameId() {
    return gameId.trim().length === GAME_ID_LENGTH;
  }

  return (
    <div className="lobby-screen">
      <h1>
        <span>M</span>
        <span className="red">et </span>
        <span>h</span>
        <span className="red">e</span>
        <span>t M</span>
        <span className="red">e</span>
        <span>s o</span>
        <span className="red">p </span>
        <span>T</span>
        <span className="red">afe</span>
        <span>l</span>
      </h1>
      <div className="lobby-controls">
        <input
          type="text"
          maxLength={MAX_NAME_LENGTH}
          id="name"
          placeholder="Vul je naam in"
          onChange={(e) => setName(e.target.value)}
        />
        <div className={`radio-buttons` + (!hasName() ? " hidden" : "")}>
          <div>
            <input
              defaultChecked
              type="radio"
              name="mode"
              id="new"
              value="new"
              onClick={() => setMode("new")}
            />
            <label htmlFor="new">Nieuw spel opzetten</label>
          </div>
          <div>
            <input
              type="radio"
              name="mode"
              id="join"
              value="join"
              onClick={() => setMode("join")}
            />
            <label htmlFor="join">Deelnemen aan spel</label>
          </div>
        </div>
        <input
          className={!hasName() || mode === "new" ? "hidden" : ""}
          type="text"
          maxLength={GAME_ID_LENGTH}
          value={gameId}
          placeholder="Vul spelcode in"
          onChange={(e) => setGameId(e.target.value)}
        />
        <button
          className={
            !hasName() || (mode === "join" && !hasGameId()) ? "hidden" : ""
          }
          id="start"
          onClick={handleStart}
        >
          Start
        </button>
      </div>
    </div>
  );
}

export default Lobby;
