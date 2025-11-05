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
  const [progress, setProgress] = useState(0);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [info, setInfo] = useState([]);

  const answersRef = useRef(answers);
  const intervalRef = useRef(null);
  const countDownRef = useRef(null);

  function setCustomInterval(fn, delay) {
    fn();
    return setInterval(fn, delay);
  }

  const clearCustomInterval = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const setIntervalCoupledToSystemTime = useCallback(
    (message, fn, time) => {
      clearCustomInterval();
      setStatusMessage(message);
      const start = Date.now();
      const end = start + time * 1000;
      const total = end - start;
      intervalRef.current = setCustomInterval(() => {
        const elapsed = Date.now() - start;
        const remaining = end - Date.now();
        setProgress(elapsed / total);
        setTimer(Math.ceil(remaining / 1000));
        if (Date.now() >= end) {
          clearCustomInterval();
          fn();
        }
      }, 10);
    },
    [clearCustomInterval]
  );

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
    setIntervalCoupledToSystemTime(
      "Beantwoord de vragen...",
      () => {
        stompClient.publish({
          destination: SUBMIT_ANSWERS_PATH,
          body: JSON.stringify(answersRef.current),
        });
      },
      ROUND_TIME
    );
  }, [stompClient, setIntervalCoupledToSystemTime]);

  const countDown = useCallback(
    (questions) => {
      countDownRef.current = true;
      setIntervalCoupledToSystemTime(
        "De volgende ronde begint...",
        () => {
          setQuestions(questions);
          setAnswers(
            questions.map((q) => ({
              id: q.id,
              content: "",
            }))
          );
          countDownRef.current = false;
          collectAnswers();
        },
        COUNT_DOWN
      );
    },
    [collectAnswers, setIntervalCoupledToSystemTime]
  );

  useEffect(() => {
    answersRef.current = answers;
  }, [answers]);

  useEffect(() => {
    return () => {
      clearCustomInterval();
    };
  }, [clearCustomInterval]);

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
        <StatusBar
          statusMessage={statusMessage}
          timer={timer}
          progress={progress}
        />
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
