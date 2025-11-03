import Question from "./Question";

function Questions({
  gameState,
  statusMessage,
  questions,
  modifyAnswer,
  answers,
}) {
  return (
    <div className="questions-field">
      <div className="self-state-container">{statusMessage}</div>
      <div className="questions-container">
        {questions.map((q, i) => (
          <Question
            key={q.id}
            question={q}
            answer={answers.find((a) => a.id === q.id)}
            modifyAnswer={modifyAnswer}
            gameState={gameState}
          />
        ))}
      </div>
    </div>
  );
}

export default Questions;
