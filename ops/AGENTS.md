# Spectra Agent Guide

Spectra is an ambient AI visualizer for autonomous coding agents and terminal-heavy developer workflows.

## Operating Rules

- Prefer additive, reversible changes.
- Keep architecture notes in `ops/DECISION_LOG.md`.
- Keep current state and handoff notes in `ops/STATUS.md` and `ops/WORKING_CONTEXT.md`.
- Preserve a single event ingestion boundary so terminal, file, and WebSocket sources can plug in later.
- Optimize first for visual presence, motion quality, and shareable wow factor.

## Product North Star

Spectra should feel like a cinematic system field that proves background AI work is alive. It is not a dashboard, spinner, or admin surface.

## Implementation Biases

- Use Next.js App Router, TypeScript, TailwindCSS, Framer Motion, and Three.js.
- Keep components small enough to replace as the visual language matures.
- Avoid premature data-model complexity.
- Make visual state respond to events before adding analytics or controls.
