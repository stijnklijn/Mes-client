import Question from "./Question";

export default function Questions({
  SHARED_CONSTANTS,
  gameState,
  questions,
  modifyAnswer,
  answers,
  countDownRef,
}) {
  return (
    <div className="questions-grid">
      {questions.map((q, i) => (
        <Question
          SHARED_CONSTANTS={SHARED_CONSTANTS}
          key={q.id}
          question={q}
          answer={answers.find((a) => a.id === q.id)}
          modifyAnswer={modifyAnswer}
          gameState={gameState}
          countDownRef={countDownRef}
        />
      ))}
    </div>
  );
}
