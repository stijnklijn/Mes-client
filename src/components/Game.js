import { useCallback, useEffect, useState, useRef } from "react";

import {
  START_SCORE,
  COUNT_DOWN,
  ROUND_TIME,
  USER_QUEUE_PATH,
  SUBMIT_ANSWERS_PATH,
  JOIN_GAME_PATH,
  SUBMIT_BID_PATH,
  MAX_INFO_MESSAGES,
  CHAT_PATH,
} from "../constants/Constants";

import Questions from "./Questions";
import Info from "./Info";
import Controls from "./Controls";
import StatusBar from "./StatusBar";

export default function Game({
  stompClient,
  name,
  setName,
  setMode,
  gameId,
  setGameId,
  disconnect,
  setError,
}) {
  const [gameState, setGameState] = useState({
    self: {
      name,
      score: START_SCORE,
    },
    bank: 0,
  });
  const [statusMessage, setStatusMessage] = useState("");
  const [timer, setTimer] = useState(0);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [info, setInfo] = useState([]);

  const answersRef = useRef(answers);
  const intervalRef = useRef(null);
  const timeoutRef = useRef(null);
  const countDownRef = useRef(null);

  function setIntervalWithoutInitialDelay(fn, delay) {
    fn();
    return setInterval(fn, delay);
  }

  const clearTimers = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const updateStatusMessage = useCallback((gameState) => {
    setGameState(gameState);
    switch (gameState.self.state) {
      case "AWAIT_OPPONENT":
        setStatusMessage("Wachten op tegenstander...");
        break;
      case "DO_BID":
        setStatusMessage("Doe een bod...");
        break;
      case "AWAIT_BID":
        setStatusMessage("Wachten op bod van de tegenstander...");
        break;
      case "END_GAME":
        setStatusMessage("Het spel is afgelopen.");
        break;
      default:
    }
  }, []);

  const collectAnswers = useCallback(() => {
    setTimer(ROUND_TIME);
    clearTimers();
    setStatusMessage("Beantwoord de vragen...");
    intervalRef.current = setIntervalWithoutInitialDelay(
      () => setTimer((prev) => prev - 1),
      1000
    );
    timeoutRef.current = setTimeout(() => {
      clearTimers();
      stompClient.publish({
        destination: SUBMIT_ANSWERS_PATH,
        body: JSON.stringify(answersRef.current),
      });
    }, (ROUND_TIME - 1) * 1000);
  }, [stompClient, clearTimers]);

  const countDown = useCallback(
    (questions) => {
      countDownRef.current = true;
      setTimer(COUNT_DOWN);
      clearTimers();
      setStatusMessage("De volgende ronde begint...");
      intervalRef.current = setIntervalWithoutInitialDelay(
        () => setTimer((prev) => prev - 1),
        1000
      );
      timeoutRef.current = setTimeout(() => {
        clearTimers();
        setQuestions(questions);
        setAnswers(
          questions.map((q) => ({
            id: q.id,
            content: "",
          }))
        );
        countDownRef.current = false;
        collectAnswers();
      }, (COUNT_DOWN - 1) * 1000);
    },
    [collectAnswers, clearTimers]
  );

  useEffect(() => {
    answersRef.current = answers;
  }, [answers]);

  useEffect(() => {
    return () => {
      clearTimers();
    };
  }, [clearTimers]);

  useEffect(() => {
    const subscription = stompClient.subscribe(
      USER_QUEUE_PATH,
      (messageJson) => {
        const message = JSON.parse(messageJson.body);
        switch (message.type) {
          case "INFO":
            setInfo((prev) =>
              [...prev, message.payload].slice(-MAX_INFO_MESSAGES)
            );
            break;
          case "ERROR":
            setError(message.payload);
            disconnect(setName, setMode, setGameId);
            break;
          case "GAME_STATE":
            updateStatusMessage(message.payload);
            break;
          case "QUESTIONS":
            countDown(message.payload);
            break;
          case "FEEDBACK":
            setAnswers(message.payload);
            break;
          default:
        }
      }
    );

    stompClient.publish({
      destination: JOIN_GAME_PATH,
      body: JSON.stringify({ gameId, name }),
    });

    return () => subscription.unsubscribe();
  }, [
    gameId,
    name,
    stompClient,
    updateStatusMessage,
    countDown,
    disconnect,
    setGameId,
    setMode,
    setName,
    setError,
  ]);

  function submitBid(bid) {
    stompClient.publish({
      destination: SUBMIT_BID_PATH,
      body: JSON.stringify(bid),
    });
  }

  function submitChatMessage(message) {
    stompClient.publish({
      destination: CHAT_PATH,
      body: JSON.stringify(message),
    });
  }

  function modifyAnswer(id, content) {
    setAnswers((prev) => prev.map((a) => (a.id === id ? { id, content } : a)));
  }

  return (
    <div className="main-content">
      <div className="left-field">
        <StatusBar statusMessage={statusMessage} timer={timer} />
        <Questions
          gameState={gameState}
          statusMessage={statusMessage}
          questions={questions}
          answers={answers}
          modifyAnswer={modifyAnswer}
          countDownRef={countDownRef}
        />
      </div>
      <div className="right-field">
        <Info info={info} name={name} submitChatMessage={submitChatMessage} />
        <Controls
          gameState={gameState}
          submitBid={submitBid}
          gameId={gameId}
          disconnect={disconnect}
          setName={setName}
          setMode={setMode}
          setGameId={setGameId}
        />
      </div>
    </div>
  );
}
