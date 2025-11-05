export default function StatusBar({ statusMessage, timer, progress }) {
  return (
    <div
      className="status-bar"
      style={{
        background: `linear-gradient(
    to right,
    var(--color-accent) ${progress * 100}%,
    var(--color-primary) ${progress * 100}% 100%
  )`,
      }}
    >
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
