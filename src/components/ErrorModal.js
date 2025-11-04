function ErrorModal({ error, setError }) {
  function handleClose() {
    setError("");
  }

  return (
    <div className="backdrop">
      <div className="error-modal">
        <h2>{"Fout"}</h2>
        <p>{error}</p>
        <button className="button-clear-error" onClick={handleClose}>
          Sluiten
        </button>
      </div>
    </div>
  );
}

export default ErrorModal;
