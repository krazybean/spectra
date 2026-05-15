export type SpectraEventType =
  | "agent_thinking"
  | "tool_call"
  | "file_written"
  | "task_completed"
  | "git_commit"
  | "build_started"
  | "build_completed"
  | "error_state";

export type SpectraEvent = {
  id: string;
  type: SpectraEventType;
  source: string;
  label: string;
  detail: string;
  intensity: number;
  timestamp: number;
  metadata: Record<string, unknown>;
};

export type EventListener = (event: SpectraEvent) => void;

export type EventSourceController = {
  start: () => void;
  stop: () => void;
  subscribe: (listener: EventListener) => () => void;
};
