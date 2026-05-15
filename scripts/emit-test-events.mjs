import { WebSocket } from "ws";
import { normalizeSpectraEvent } from "./spectra-event-schema.mjs";

const bridgeUrl = process.env.SPECTRA_BRIDGE_URL ?? "ws://localhost:7777";

const samples = [
  {
    type: "agent_thinking",
    source: "emit:test",
    intensity: 0.36,
    metadata: { phase: "plan" }
  },
  {
    type: "tool_call",
    source: "emit:test",
    intensity: 0.78,
    metadata: { tool: "rg", command: "search repository" }
  },
  {
    type: "file_written",
    source: "emit:test",
    intensity: 0.86,
    metadata: { path: "src/components/spectra-field.tsx" }
  },
  {
    type: "git_commit",
    source: "emit:test",
    intensity: 0.64,
    metadata: { branch: "main" }
  },
  {
    type: "build_started",
    source: "emit:test",
    intensity: 0.58,
    metadata: { script: "npm run build" }
  },
  {
    type: "build_completed",
    source: "emit:test",
    intensity: 0.82,
    metadata: { status: "ok" }
  },
  {
    type: "error_state",
    source: "emit:test",
    intensity: 0.95,
    metadata: { severity: "test", message: "Synthetic bridge event" }
  },
  {
    type: "task_completed",
    source: "emit:test",
    intensity: 1,
    metadata: { result: "sequence complete" }
  }
];

const socket = new WebSocket(bridgeUrl);

socket.on("open", () => {
  console.log(`[spectra] emitting ${samples.length} test events to ${bridgeUrl}`);

  samples.forEach((sample, index) => {
    setTimeout(() => {
      const event = normalizeSpectraEvent(sample);
      socket.send(JSON.stringify(event));
      console.log(`[spectra] emitted ${event.type}`);

      if (index === samples.length - 1) {
        setTimeout(() => socket.close(), 250);
      }
    }, index * 650);
  });
});

socket.on("error", (error) => {
  console.error(`[spectra] emit failed: ${error.message}`);
  console.error("[spectra] start the bridge first with: npm run bridge");
  process.exitCode = 1;
});
