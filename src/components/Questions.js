import Question from "./Question";

function Questions({ gameState, questions, modifyAnswer, answers }) {
  return (
    <div className="questions-grid">
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
  );
}

export default Questions;
