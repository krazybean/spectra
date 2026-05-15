export const SPECTRA_EVENT_TYPES = [
  "agent_thinking",
  "tool_call",
  "file_written",
  "task_completed",
  "git_commit",
  "build_started",
  "build_completed",
  "error_state"
];

const defaultLabels = {
  agent_thinking: ["Agent thinking", "Planning next code path"],
  tool_call: ["Tool call", "Invoking local capability"],
  file_written: ["File written", "Persisting implementation changes"],
  task_completed: ["Task completed", "Workflow reached stable state"],
  git_commit: ["Git commit", "Repository state captured"],
  build_started: ["Build started", "Compilation sequence engaged"],
  build_completed: ["Build completed", "Build pipeline completed"],
  error_state: ["Error state", "Attention required"]
};

export function normalizeSpectraEvent(input) {
  if (!input || typeof input !== "object") {
    throw new Error("Event payload must be a JSON object.");
  }

  if (!SPECTRA_EVENT_TYPES.includes(input.type)) {
    throw new Error(
      `Invalid event type "${input.type}". Expected one of: ${SPECTRA_EVENT_TYPES.join(", ")}.`
    );
  }

  const [fallbackLabel, fallbackDetail] = defaultLabels[input.type];
  const timestamp =
    typeof input.timestamp === "number" && Number.isFinite(input.timestamp)
      ? input.timestamp
      : Date.now();
  const intensity =
    typeof input.intensity === "number" && Number.isFinite(input.intensity)
      ? Math.max(0, Math.min(1, input.intensity))
      : 0.5;

  return {
    id:
      typeof input.id === "string" && input.id.length > 0
        ? input.id
        : `${input.type}-${timestamp}-${Math.random().toString(16).slice(2)}`,
    type: input.type,
    source:
      typeof input.source === "string" && input.source.length > 0
        ? input.source
        : "local",
    timestamp,
    intensity,
    metadata:
      input.metadata && typeof input.metadata === "object" && !Array.isArray(input.metadata)
        ? input.metadata
        : {},
    label:
      typeof input.label === "string" && input.label.length > 0
        ? input.label
        : fallbackLabel,
    detail:
      typeof input.detail === "string" && input.detail.length > 0
        ? input.detail
        : fallbackDetail
  };
}
