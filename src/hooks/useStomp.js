import { useEffect, useRef, useState, useCallback } from "react";
import { Client } from "@stomp/stompjs";

export function useStomp(url, onConnect, onError) {
  const clientRef = useRef(null);
  const [connected, setConnected] = useState(false);

  const connect = useCallback(() => {
    if (clientRef.current) return;

    const client = new Client({
      brokerURL: url,
      reconnectDelay: 0,
      onConnect: (frame) => {
        setConnected(true);
        onConnect?.(frame);
      },
      onStompError: (frame) => {
        console.error("STOMP error:", frame);
        onError?.(frame);
      },
      onWebSocketError: (err) => {
        console.error("WebSocket error:", err);
        onError?.(err);
      },
    });

    client.activate();
    clientRef.current = client;
  }, [url, onConnect, onError]);

  const disconnect = useCallback((setName, setMode, setGameId) => {
    if (clientRef.current) {
      clientRef.current.deactivate();
      clientRef.current = null;
      setName("");
      setMode("new");
      setGameId("");
      setConnected(false);
    }
  }, []);

  useEffect(() => {
    return () => disconnect();
  }, [disconnect]);

  return { stompClient: clientRef.current, connect, disconnect, connected };
}
