import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { sendSpectraEvent } from "./spectra-client.mjs";

const root = process.cwd();
const home = os.homedir();
const debounceMs = 450;
const pollMs = Number.parseInt(process.env.SPECTRA_WATCH_POLL_MS ?? "1800", 10);
const maxFiles = Number.parseInt(process.env.SPECTRA_WATCH_MAX_FILES ?? "9000", 10);
const pending = new Map();
const snapshots = new Map();
let pollTimer = null;

const ignoredSegments = new Set([
  ".git",
  ".next",
  ".turbo",
  ".venv",
  "coverage",
  "dist",
  "node_modules",
  "out"
]);

const ignoredSuffixes = [
  ".map",
  ".png",
  ".jpg",
  ".jpeg",
  ".gif",
  ".webp",
  ".ico",
  ".db",
  ".sqlite",
  ".lock"
];

function parseArgs(argv) {
  const args = {
    dryRun: false,
    includes: [],
    paths: [],
    profile: "repo"
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === "--dry-run") {
      args.dryRun = true;
      continue;
    }

    if (arg === "--profile" && argv[index + 1]) {
      args.profile = argv[index + 1];
      index += 1;
      continue;
    }

    if (arg.startsWith("--profile=")) {
      args.profile = arg.slice("--profile=".length);
      continue;
    }

    if (arg === "--include" && argv[index + 1]) {
      args.includes.push(argv[index + 1]);
      index += 1;
      continue;
    }

    if (arg.startsWith("--include=")) {
      args.includes.push(arg.slice("--include=".length));
      continue;
    }

    args.paths.push(arg);
  }

  return args;
}

function expandHome(inputPath) {
  if (inputPath === "~") {
    return home;
  }
  if (inputPath.startsWith("~/")) {
    return path.join(home, inputPath.slice(2));
  }
  return inputPath;
}

function existingDirectories(paths) {
  const unique = new Set();

  for (const inputPath of paths) {
    const resolved = path.resolve(root, expandHome(inputPath));

    if (!fs.existsSync(resolved)) {
      continue;
    }

    const stat = fs.statSync(resolved);
    if (stat.isDirectory()) {
      unique.add(resolved);
    } else {
      unique.add(path.dirname(resolved));
    }
  }

  return [...unique];
}

function repoProfile() {
  return existingDirectories(["src", "scripts", "ops"]);
}

function codexProfile() {
  return existingDirectories([
    "src",
    "scripts",
    "ops",
    "~/.codex",
    "~/.codex/sessions",
    "~/.config/codex",
    "~/Library/Application Support/Codex",
    "~/Library/Application Support/Code/User/globalStorage",
    "~/Library/Application Support/Code/logs",
    "~/Library/Application Support/Cursor/User/globalStorage",
    "~/Library/Application Support/Cursor/logs"
  ]);
}

function projectsProfile() {
  return existingDirectories([
    "~/Documents/Github",
    "~/Documents/GitHub",
    "~/Developer",
    "~/code",
    "~/src"
  ]);
}

function targetsFor(args) {
  if (args.paths.length > 0) {
    return existingDirectories(args.paths);
  }

  const extra = process.env.SPECTRA_WATCH_EXTRA
    ? process.env.SPECTRA_WATCH_EXTRA.split(",").map((item) => item.trim()).filter(Boolean)
    : [];

  const profiles = {
    codex: codexProfile,
    projects: projectsProfile,
    repo: repoProfile
  };

  const profileTargets = profiles[args.profile]?.() ?? repoProfile();
  return existingDirectories([...profileTargets, ...args.includes, ...extra]);
}

function relativeDisplay(filePath) {
  const relative = path.relative(root, filePath);
  return relative.startsWith("..") ? filePath : relative || ".";
}

function shouldIgnore(filePath) {
  const parts = filePath.split(path.sep);
  return (
    parts.some((part) => ignoredSegments.has(part)) ||
    ignoredSuffixes.some((suffix) => filePath.endsWith(suffix))
  );
}

function shouldSkipDirectory(directory) {
  const parts = directory.split(path.sep);
  return parts.some((part) => ignoredSegments.has(part));
}

function classifyChange(filePath) {
  const normalized = filePath.toLowerCase();

  if (normalized.includes(`${path.sep}.codex${path.sep}`)) {
    return {
      type: "agent_thinking",
      source: "codex-watch",
      intensity: 0.68
    };
  }

  if (normalized.includes("globalstorage") || normalized.includes(`${path.sep}logs${path.sep}`)) {
    return {
      type: "tool_call",
      source: "editor-watch",
      intensity: 0.48
    };
  }

  return {
    type: "file_written",
    source: "file-watch",
    intensity: intensityFor(filePath)
  };
}

function intensityFor(filePath) {
  if (filePath.endsWith(".tsx") || filePath.endsWith(".ts")) {
    return 0.78;
  }
  if (filePath.endsWith(".md")) {
    return 0.42;
  }
  if (filePath.endsWith(".json")) {
    return 0.5;
  }
  return 0.58;
}

async function emitChange(filePath) {
  const displayPath = relativeDisplay(filePath);
  const classified = classifyChange(filePath);

  try {
    await sendSpectraEvent(
      {
        ...classified,
        metadata: { path: displayPath }
      },
      { timeoutMs: 650 }
    );
    console.log(`[spectra] ${classified.type} ${displayPath}`);
  } catch {
    console.log(`[spectra] bridge unavailable; skipped ${displayPath}`);
  }
}

function queue(filePath) {
  if (!filePath || shouldIgnore(filePath)) {
    return;
  }

  if (pending.has(filePath)) {
    clearTimeout(pending.get(filePath));
  }

  pending.set(
    filePath,
    setTimeout(() => {
      pending.delete(filePath);
      emitChange(filePath);
    }, debounceMs)
  );
}

function walkDirectory(directory, files = [], state = { count: 0 }) {
  if (state.count >= maxFiles || shouldSkipDirectory(directory)) {
    return files;
  }

  let entries = [];
  try {
    entries = fs.readdirSync(directory, { withFileTypes: true });
  } catch {
    return files;
  }

  for (const entry of entries) {
    if (state.count >= maxFiles) {
      break;
    }

    const entryPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      walkDirectory(entryPath, files, state);
      continue;
    }

    if (!entry.isFile() || shouldIgnore(entryPath)) {
      continue;
    }

    try {
      const stat = fs.statSync(entryPath);
      files.push([entryPath, stat.mtimeMs, stat.size]);
      state.count += 1;
    } catch {
      // Ignore files that disappear during a scan.
    }
  }

  return files;
}

function scanTarget(target, emitChanges) {
  const previous = snapshots.get(target) ?? new Map();
  const next = new Map();
  const files = walkDirectory(target);

  for (const [filePath, mtimeMs, size] of files) {
    const signature = `${mtimeMs}:${size}`;
    next.set(filePath, signature);

    if (emitChanges && previous.has(filePath) && previous.get(filePath) !== signature) {
      queue(filePath);
    }
  }

  snapshots.set(target, next);
}

function scanAll(targets, emitChanges) {
  for (const target of targets) {
    scanTarget(target, emitChanges);
  }
}

const args = parseArgs(process.argv.slice(2));
const targets = targetsFor(args);

if (targets.length === 0) {
  console.error(`[spectra] no watchable directories found for profile "${args.profile}"`);
  process.exit(1);
}

if (args.dryRun) {
  targets.forEach((target) => console.log(`[spectra] would watch ${relativeDisplay(target)}`));
  process.exit(0);
}

for (const target of targets) {
  console.log(`[spectra] watching ${relativeDisplay(target)}`);
}

scanAll(targets, false);
pollTimer = setInterval(() => scanAll(targets, true), pollMs);

console.log(
  `[spectra] ${args.profile} watcher active poll=${pollMs}ms maxFiles=${maxFiles}`
);

function shutdown() {
  for (const timer of pending.values()) {
    clearTimeout(timer);
  }
  if (pollTimer) {
    clearInterval(pollTimer);
  }
  process.exit(0);
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
