# Spectra Decision Log

## 2026-05-14: Use Direct Three.js Canvas For MVP

Decision: Use a direct Three.js renderer inside a client component instead of adding react-three-fiber.

Reason: The first prototype needs a controlled visual field with minimal abstraction. Direct Three.js keeps the MVP dependency surface small while still allowing a future migration if scene complexity grows.

Status: Reversible.

## 2026-05-14: Isolate Event Ingestion Behind A Source Contract

Decision: Mock events flow through `EventSourceController` and `useSpectraEvents`.

Reason: Future terminal tailing, Codex output, Claude Code logs, or WebSocket streams can replace the mock source without rewriting the visual components.

Status: Accepted.

## 2026-05-15: Add A Single Local Supervisor

Decision: Add `npm run spectra` to spawn and manage bridge, watcher, and Next.js dev server together.

Reason: The system is becoming multi-process, and asking users to manage several terminals makes the product feel fragile. A small supervisor keeps local operation understandable.

Status: Accepted.

## 2026-05-15: Use Polling For Broad Watch Profiles

Decision: Replace recursive `fs.watch` with a polling scanner for Spectra watcher profiles.

Reason: Recursive native watchers can exhaust file descriptors when monitoring editor and agent directories. Polling is less elegant internally but more reliable for long-running ambient monitoring.

Status: Accepted.

## 2026-05-15: Use Watch Profiles Instead Of Whole-Home Monitoring

Decision: Add `repo`, `codex`, and `projects` watch profiles instead of watching the entire user home directory.

Reason: System-wide agent ambience needs broader coverage than one repo, but whole-home recursive watching would be noisy, expensive, and privacy-hostile. Profiles keep the behavior legible and adjustable.

Status: Accepted.

## 2026-05-15: Observe Editor Agent Side Effects Before Direct Codex Integration

Decision: Add producers for file changes, wrapped commands, manual events, and optional git post-commit hooks.

Reason: VS Code-hosted agents may not expose a stable local event API. Observing file writes, builds, tests, and commits gives Spectra useful real signals without depending on a specific agent vendor.

Status: Accepted.

## 2026-05-15: Add Local WebSocket Bridge Before Agent-Specific Integrations

Decision: Add a small `ws` bridge on `ws://localhost:7777` that accepts JSON Spectra events and broadcasts them to connected frontend clients.

Reason: This proves real local event -> frontend visual feedback without committing to Codex, Claude, terminal parser, git hook, or file watcher details too early.

Status: Accepted.
