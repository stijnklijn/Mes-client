export default function StatusBar({ statusMessage, timer }) {
  return (
    <div className="status-bar">
      <div className="status">{statusMessage}</div>
      {timer > 0 ? (
        <div className="timer">
          <h3>{timer}</h3>
        </div>
      ) : (
        ""
      )}
    </div>
  );
}
