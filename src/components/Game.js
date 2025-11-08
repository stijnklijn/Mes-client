import { useCallback, useEffect, useState, useRef } from "react";

import ping from "../sounds/ping";

import Questions from "./Questions";
import Info from "./Info";
import Controls from "./Controls";
import StatusBar from "./StatusBar";

export default function Game({
  SHARED_CONSTANTS,
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
    self: {},
  });
  const [statusMessage, setStatusMessage] = useState("");
  const [timer, setTimer] = useState(0);
  const [progress, setProgress] = useState(0);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [info, setInfo] = useState([]);
  const [soundOn, setSoundOn] = useState(false);

  const answersRef = useRef(answers);
  const intervalRef = useRef(null);
  const countDownRef = useRef(null);
  const soundOnRef = useRef(soundOn);

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
          setIntervalCoupledToSystemTime(
            "Beantwoord de vragen...",
            () => {},
            SHARED_CONSTANTS.ROUND_TIME
          );
        },
        SHARED_CONSTANTS.COUNT_DOWN
      );
    },
    [
      SHARED_CONSTANTS.ROUND_TIME,
      SHARED_CONSTANTS.COUNT_DOWN,
      setIntervalCoupledToSystemTime,
    ]
  );

  const collectAnswers = useCallback(() => {
    stompClient.publish({
      destination: `${SHARED_CONSTANTS.WEBSOCKET_PUBLISH_BASE_PATH}${SHARED_CONSTANTS.SUBMIT_ANSWERS_PATH}`,
      body: JSON.stringify(answersRef.current),
    });
  }, [
    stompClient,
    SHARED_CONSTANTS.WEBSOCKET_PUBLISH_BASE_PATH,
    SHARED_CONSTANTS.SUBMIT_ANSWERS_PATH,
  ]);

  const onGameStateUpdate = useCallback(
    (gameState) => {
      setGameState(gameState);
      switch (gameState.self.state) {
        case "AWAIT_OPPONENT":
          setStatusMessage("Wachten op tegenstander...");
          break;
        case "SUBMIT_ANSWERS":
          collectAnswers();
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
    },
    [collectAnswers]
  );

  useEffect(() => {
    answersRef.current = answers;
    soundOnRef.current = soundOn;
  }, [answers, soundOn]);

  useEffect(() => {
    return () => {
      clearCustomInterval();
    };
  }, [clearCustomInterval]);

  useEffect(() => {
    const subscription = stompClient.subscribe(
      `/user${SHARED_CONSTANTS.WEBSOCKET_SUBSCRIBE_BASE_PATH}`,
      (messageJson) => {
        const message = JSON.parse(messageJson.body);
        switch (message.type) {
          case "INFO":
            if (soundOnRef.current) ping();
            setInfo((prev) =>
              [...prev, message.payload].slice(
                -SHARED_CONSTANTS.MAX_INFO_MESSAGES
              )
            );
            break;
          case "ERROR":
            setError(message.payload);
            disconnect(setName, setMode, setGameId);
            break;
          case "GAME_STATE":
            onGameStateUpdate(message.payload);
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
      destination: `${SHARED_CONSTANTS.WEBSOCKET_PUBLISH_BASE_PATH}${SHARED_CONSTANTS.JOIN_GAME_PATH}`,
      body: JSON.stringify({ gameId, name }),
    });

    const keepAliveInterval = setInterval(() => {
      if (stompClient.connected) {
        stompClient.publish({
          destination: `${SHARED_CONSTANTS.WEBSOCKET_PUBLISH_BASE_PATH}${SHARED_CONSTANTS.HEARTBEAT_PATH}`,
          body: {},
        });
      }
    }, SHARED_CONSTANTS.HEARTBEAT_INTERVAL * 1000);

    return () => {
      clearInterval(keepAliveInterval);
      subscription.unsubscribe();
    };
  }, [
    SHARED_CONSTANTS.WEBSOCKET_SUBSCRIBE_BASE_PATH,
    SHARED_CONSTANTS.WEBSOCKET_PUBLISH_BASE_PATH,
    SHARED_CONSTANTS.JOIN_GAME_PATH,
    SHARED_CONSTANTS.HEARTBEAT_PATH,
    SHARED_CONSTANTS.HEARTBEAT_INTERVAL,
    SHARED_CONSTANTS.MAX_INFO_MESSAGES,
    gameId,
    name,
    stompClient,
    onGameStateUpdate,
    countDown,
    disconnect,
    setGameId,
    setMode,
    setName,
    setError,
    soundOnRef,
  ]);

  function submitBid(bid) {
    stompClient.publish({
      destination: `${SHARED_CONSTANTS.WEBSOCKET_PUBLISH_BASE_PATH}${SHARED_CONSTANTS.SUBMIT_BID_PATH}`,
      body: JSON.stringify(bid),
    });
  }

  function submitChatMessage(message) {
    stompClient.publish({
      destination: `${SHARED_CONSTANTS.WEBSOCKET_PUBLISH_BASE_PATH}${SHARED_CONSTANTS.CHAT_PATH}`,
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
          SHARED_CONSTANTS={SHARED_CONSTANTS}
          gameState={gameState}
          statusMessage={statusMessage}
          questions={questions}
          answers={answers}
          modifyAnswer={modifyAnswer}
          countDownRef={countDownRef}
        />
      </div>
      <div className="right-field">
        <Info
          SHARED_CONSTANTS={SHARED_CONSTANTS}
          info={info}
          name={name}
          submitChatMessage={submitChatMessage}
          soundOn={soundOn}
          setSoundOn={setSoundOn}
        />
        <Controls
          SHARED_CONSTANTS={SHARED_CONSTANTS}
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
