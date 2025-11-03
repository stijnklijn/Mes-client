function Question({ question, answer, modifyAnswer, gameState }) {
  function onAnswerChanged(e) {
    modifyAnswer(question.id, e.target.value);
  }

  return (
    <div className="question-container">
      <div className="question-content">
        <p className="question-text">{question.content}</p>
        <input
          className={
            "question-player-answer " +
            (answer.correct !== undefined
              ? answer.correct
                ? "correct"
                : "incorrect"
              : "neutral")
          }
          type="text"
          onChange={onAnswerChanged}
          disabled={gameState.self.state !== "ANSWER_QUESTIONS"}
        ></input>
      </div>
      <p className="question-correct-answer">
        {answer.correctAnswers
          ? "Het juiste antwoord is " + answer.correctAnswers.join(" / ")
          : ""}
      </p>
    </div>
  );
}

export default Question;
