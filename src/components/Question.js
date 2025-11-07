export default function Question({
  question,
  answer,
  modifyAnswer,
  gameState,
  countDownRef,
}) {
  function onAnswerChanged(e) {
    modifyAnswer(question.id, e.target.value);
  }

  return (
    <>
      <div className="question-cell">
        <p className="question-content">{question.content}</p>
        <p className="question-correct-answer">
          {answer.correctAnswers
            ? "Het juiste antwoord is " + answer.correctAnswers[0]
            : ""}
        </p>
      </div>
      <div className="answer-cell">
        <input
          className={
            "answer-player-answer " +
            (answer.correct !== undefined
              ? answer.correct
                ? "correct"
                : "incorrect"
              : "neutral")
          }
          type="text"
          placeholder={
            gameState.self.state === "ANSWER_QUESTIONS" && !countDownRef.current
              ? "Vul antwoord in"
              : ""
          }
          onChange={onAnswerChanged}
          disabled={
            gameState.self.state !== "ANSWER_QUESTIONS" || countDownRef.current
          }
        ></input>
      </div>
    </>
  );
}
