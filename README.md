# Spectra

Ambient AI visualizer for autonomous coding agents and terminal-heavy developer workflows.

Spectra turns background agent activity into a cinematic visual field: particles, waveform pulses, neural nodes, and reactive ambience.

## Development

```bash
npm install
npm run spectra
```

This starts the bridge, the Codex/editor watcher, and the Next.js preview in one terminal. Press Ctrl-C once to stop everything.

Useful variants:

```bash
npm run spectra -- --watch-profile repo
npm run spectra -- --no-dev
npm run spectra -- --no-watch
npm run spectra -- --include ~/Documents/Github/other-repo
```

Open the local URL printed by the `dev` process, usually `http://localhost:3000`.

The watcher uses polling by default so broader profiles do not exhaust macOS file watcher limits. Tune it with `SPECTRA_WATCH_POLL_MS` and `SPECTRA_WATCH_MAX_FILES` if needed.

## Spectra Bridge

Run the local event bridge in a separate terminal:

```bash
npm run bridge
```

The bridge listens on `ws://localhost:7777`.

Send a sample event sequence:

```bash
npm run emit:test
```

The frontend consumes bridge events when available and falls back to mock events when the bridge is disconnected.

## Local Producers

For VS Code or editor-based agent workflows, Spectra can observe local side effects:

```bash
npm run spectra:watch
```

This watches `src`, `scripts`, and `ops` by default and emits `file_written` events when files change.

For broader Codex/editor activity:

```bash
npm run spectra:watch:codex
```

This watches this repo plus common local Codex, VS Code, and Cursor state/log locations when they exist, including `~/.codex`, VS Code global storage, and editor logs. It does not watch your whole home directory by default.

Preview what a profile will watch:

```bash
npm run spectra:watch:codex -- --dry-run
```

Watch common project roots:

```bash
npm run spectra:watch:projects
```

Add custom roots:

```bash
npm run spectra:watch:codex -- --include ~/Documents/Github/other-repo
```

Wrap a command so Spectra sees start/completion/error events:

```bash
npm run spectra:run -- npm run build
```

Emit a one-off manual event:

```bash
npm run emit -- tool_call --source vscode --intensity 0.7 --metadata '{"tool":"manual"}'
```

Optionally install a local post-commit hook:

```bash
npm run hooks:install
```

The hook emits `git_commit` events when you commit, but it never blocks commits if Spectra is not running.
