import { useEffect, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faVolumeXmark, faVolumeHigh } from "@fortawesome/free-solid-svg-icons";

export default function Info({
  SHARED_CONSTANTS,
  info,
  name,
  submitChatMessage,
  soundOn,
  setSoundOn,
}) {
  const infoRef = useRef(null);

  const [chatMessage, setChatMessage] = useState("");

  function onKeyDown(e) {
    if (e.key === "Enter") onSubmitChatMessage();
  }

  function onSubmitChatMessage() {
    if (chatMessage.trim().length === 0) return;
    submitChatMessage({ name, content: chatMessage });
    setChatMessage("");
  }

  function onToggleSound() {
    setSoundOn((prev) => !prev);
  }

  useEffect(() => {
    if (infoRef.current) {
      infoRef.current.scrollTop = infoRef.current.scrollHeight;
    }
  }, [info]);

  return (
    <div className="info-field">
      <div className="info-container" ref={infoRef}>
        <table>
          <tbody>
            {info.map((m, i) => (
              <tr key={i}>
                <td>{m}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="chat-container">
        <input
          type="text"
          maxLength={SHARED_CONSTANTS.MAX_CHAT_CONTENT_LENGTH}
          value={chatMessage}
          placeholder="Typ een bericht"
          onChange={(e) => setChatMessage(e.target.value)}
          onKeyDown={onKeyDown}
        />
        <button onClick={onSubmitChatMessage}>Verstuur</button>
        <button onClick={onToggleSound}>
          {" "}
          <FontAwesomeIcon icon={soundOn ? faVolumeHigh : faVolumeXmark} />
        </button>
      </div>
    </div>
  );
}
