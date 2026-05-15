import type { SpectraEvent, SpectraEventType } from "./types";

const eventTypes: SpectraEventType[] = [
  "agent_thinking",
  "tool_call",
  "file_written",
  "task_completed",
  "git_commit",
  "build_started",
  "build_completed",
  "error_state"
];

const labels: Record<SpectraEventType, [string, string]> = {
  agent_thinking: ["Agent thinking", "Planning next code path"],
  tool_call: ["Tool call", "Invoking local capability"],
  file_written: ["File written", "Persisting implementation changes"],
  task_completed: ["Task completed", "Workflow reached stable state"],
  git_commit: ["Git commit", "Repository state captured"],
  build_started: ["Build started", "Compilation sequence engaged"],
  build_completed: ["Build completed", "Build pipeline completed"],
  error_state: ["Error state", "Attention required"]
};

export function normalizeSpectraEvent(input: unknown): SpectraEvent | null {
  if (!input || typeof input !== "object") {
    return null;
  }

  const payload = input as Partial<SpectraEvent>;

  if (!payload.type || !eventTypes.includes(payload.type)) {
    return null;
  }

  const [label, detail] = labels[payload.type];
  const timestamp =
    typeof payload.timestamp === "number" && Number.isFinite(payload.timestamp)
      ? payload.timestamp
      : Date.now();
  const intensity =
    typeof payload.intensity === "number" && Number.isFinite(payload.intensity)
      ? Math.max(0, Math.min(1, payload.intensity))
      : 0.5;

  return {
    id:
      typeof payload.id === "string" && payload.id.length > 0
        ? payload.id
        : `${payload.type}-${timestamp}`,
    type: payload.type,
    source:
      typeof payload.source === "string" && payload.source.length > 0
        ? payload.source
        : "bridge",
    label:
      typeof payload.label === "string" && payload.label.length > 0
        ? payload.label
        : label,
    detail:
      typeof payload.detail === "string" && payload.detail.length > 0
        ? payload.detail
        : detail,
    intensity,
    timestamp,
    metadata:
      payload.metadata &&
      typeof payload.metadata === "object" &&
      !Array.isArray(payload.metadata)
        ? payload.metadata
        : {}
  };
}
