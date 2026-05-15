import { normalizeSpectraEvent } from "./event-normalizer";
import type { EventListener, EventSourceController } from "./types";

type WebSocketEventSourceOptions = {
  fallback: EventSourceController;
  url?: string;
};

export function createWebSocketEventSource({
  fallback,
  url = "ws://localhost:7777"
}: WebSocketEventSourceOptions): EventSourceController {
  const listeners = new Set<EventListener>();
  let socket: WebSocket | null = null;
  let reconnectTimer: number | null = null;
  let fallbackActive = false;
  let stopped = false;

  const emit: EventListener = (event) => {
    listeners.forEach((listener) => listener(event));
  };

  const fallbackUnsubscribe = fallback.subscribe(emit);

  const startFallback = () => {
    if (fallbackActive) {
      return;
    }
    fallbackActive = true;
    fallback.start();
  };

  const stopFallback = () => {
    if (!fallbackActive) {
      return;
    }
    fallback.stop();
    fallbackActive = false;
  };

  const scheduleReconnect = () => {
    if (stopped || reconnectTimer) {
      return;
    }
    startFallback();
    reconnectTimer = window.setTimeout(() => {
      reconnectTimer = null;
      connect();
    }, 2500);
  };

  const connect = () => {
    if (stopped || socket?.readyState === WebSocket.OPEN) {
      return;
    }

    socket = new WebSocket(url);

    socket.addEventListener("open", () => {
      stopFallback();
    });

    socket.addEventListener("message", (message) => {
      try {
        const parsed = JSON.parse(message.data);
        const event = normalizeSpectraEvent(parsed.event ?? parsed);
        if (event) {
          emit(event);
        }
      } catch {
        // Ignore malformed local dev messages.
      }
    });

    socket.addEventListener("close", () => {
      socket = null;
      scheduleReconnect();
    });

    socket.addEventListener("error", () => {
      socket?.close();
      scheduleReconnect();
    });
  };

  return {
    start() {
      stopped = false;
      connect();
      startFallback();
    },
    stop() {
      stopped = true;
      if (reconnectTimer) {
        window.clearTimeout(reconnectTimer);
        reconnectTimer = null;
      }
      socket?.close();
      socket = null;
      stopFallback();
      fallbackUnsubscribe();
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    }
  };
}
