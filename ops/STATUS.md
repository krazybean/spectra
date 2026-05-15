# Spectra Status

## Current Phase

Phase 1 MVP: Terminal Activity -> Visualizer.

## Implemented

- Next.js App Router project scaffold.
- Fullscreen cinematic landing experience.
- Three.js ambient visual field with particles, pulsing nodes, orbit line, and waveform.
- Mock event source emitting `agent_thinking`, `tool_call`, `file_written`, and `task_completed`.
- Isolated event source contract for future terminal or WebSocket ingestion.
- Spectra Bridge local WebSocket server at `ws://localhost:7777`.
- Frontend WebSocket event adapter with mock fallback.
- Local test emitter via `npm run emit:test`.
- Local producer scripts for manual events, command wrapping, profile-based file/editor watching, and optional git post-commit events.
- Single-process supervisor via `npm run spectra` for bridge, watcher, and frontend dev server.

## Current Risk

- Visual tuning is still first-pass and should be tested on a real second-monitor setup.
- Bridge events are real-time, but direct Codex and Claude APIs are not required yet; current integration observes local side effects and editor/agent state paths.
