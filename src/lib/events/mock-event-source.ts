import type {
  EventListener,
  EventSourceController,
  SpectraEvent,
  SpectraEventType
} from "./types";

const EVENT_LIBRARY: Array<{
  type: SpectraEventType;
  label: string;
  detail: string;
  intensity: number;
}> = [
  {
    type: "agent_thinking",
    label: "Agent thinking",
    detail: "Planning next code path",
    intensity: 0.42
  },
  {
    type: "tool_call",
    label: "Tool call",
    detail: "Inspecting repository context",
    intensity: 0.7
  },
  {
    type: "file_written",
    label: "File written",
    detail: "Persisting implementation changes",
    intensity: 0.86
  },
  {
    type: "task_completed",
    label: "Task completed",
    detail: "Workflow reached stable state",
    intensity: 1
  }
];

const cadenceMs = [1100, 1600, 2300, 2900, 3700];

export function createMockEventSource(): EventSourceController {
  const listeners = new Set<EventListener>();
  let timer: number | null = null;
  let index = 0;

  const emit = () => {
    const template =
      EVENT_LIBRARY[(index + Math.floor(Math.random() * 2)) % EVENT_LIBRARY.length];
    const event: SpectraEvent = {
      ...template,
      id: `${template.type}-${Date.now()}-${index}`,
      intensity: Math.min(1, template.intensity + Math.random() * 0.16),
      metadata: { mode: "mock" },
      source: "mock",
      timestamp: Date.now()
    };

    listeners.forEach((listener) => listener(event));
    index += 1;

    timer = window.setTimeout(
      emit,
      cadenceMs[index % cadenceMs.length] + Math.random() * 850
    );
  };

  return {
    start() {
      if (timer) {
        return;
      }
      timer = window.setTimeout(emit, 450);
    },
    stop() {
      if (timer) {
        window.clearTimeout(timer);
        timer = null;
      }
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    }
  };
}
