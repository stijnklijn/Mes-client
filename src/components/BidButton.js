export default function BidButton({ gameState, value, submitBid }) {
  function onSubmitBid() {
    submitBid({ amount: value });
  }

  return (
    <button
      disabled={
        gameState.self.state !== "DO_BID" ||
        (value > 0 &&
          gameState.opponent.bid &&
          gameState.opponent.bid !== value)
      }
      onClick={onSubmitBid}
    >
      {value > 0 ? value : "Pas"}
    </button>
  );
}
