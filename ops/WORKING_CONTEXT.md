# Spectra Working Context

## Concept

Spectra is "JARVIS meets htop meets Winamp": a premium ambient visualization layer for autonomous coding agents.

## Phase 1 Scope

Build a visually impressive MVP where mocked terminal or agent events create visible energy:

- particle motion
- node pulses
- waveform movement
- event-state copy
- cinematic dark environment

## Near-Term Next Steps

1. Add terminal output and agent log adapters that publish into Spectra Bridge.
2. Add visual themes for different agent modes.
3. Add a second-screen or kiosk mode with zero chrome.
4. Profile frame rate and tune particle count for common laptops.

## Bridge Workflow

- Start the full local system: `npm run spectra`
- Start bridge: `npm run bridge`
- Start frontend: `npm run dev`
- Emit test sequence: `npm run emit:test`
- Default bridge URL: `ws://localhost:7777`

## Local Producer Workflow

- Watch repo edits: `npm run spectra:watch`
- Watch broader Codex/editor activity: `npm run spectra:watch:codex`
- Preview watcher targets: `npm run spectra:watch:codex -- --dry-run`
- Wrap a command: `npm run spectra:run -- npm run build`
- Emit a manual event: `npm run emit -- tool_call --source vscode`
- Install local git commit events: `npm run hooks:install`
