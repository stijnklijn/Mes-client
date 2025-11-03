function StatusBar({ statusMessage, timer }) {
  return (
    <div className="status-bar">
      <div className="status">{statusMessage}</div>
      {timer ? (
        <div className="timer">
          <h3>{timer}</h3>
        </div>
      ) : (
        ""
      )}
    </div>
  );
}

export default StatusBar;
