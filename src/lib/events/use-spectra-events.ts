"use client";

import { useEffect, useMemo, useState } from "react";
import { createMockEventSource } from "./mock-event-source";
import { createWebSocketEventSource } from "./websocket-event-source";
import type { SpectraEvent } from "./types";

export function useSpectraEvents() {
  const source = useMemo(
    () =>
      createWebSocketEventSource({
        fallback: createMockEventSource()
      }),
    []
  );
  const [latestEvent, setLatestEvent] = useState<SpectraEvent | null>(null);
  const [eventLog, setEventLog] = useState<SpectraEvent[]>([]);

  useEffect(() => {
    const unsubscribe = source.subscribe((event) => {
      setLatestEvent(event);
      setEventLog((events) => [event, ...events].slice(0, 5));
    });

    source.start();

    return () => {
      unsubscribe();
      source.stop();
    };
  }, [source]);

  return {
    latestEvent,
    eventLog
  };
}
