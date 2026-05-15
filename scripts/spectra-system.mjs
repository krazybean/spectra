import { spawn } from "node:child_process";

const colors = {
  bridge: "\x1b[36m",
  dev: "\x1b[35m",
  reset: "\x1b[0m",
  system: "\x1b[2m",
  watch: "\x1b[33m"
};

function parseArgs(argv) {
  const args = {
    bridge: true,
    dev: true,
    watch: true,
    watchIncludes: [],
    watchProfile: "codex"
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === "--no-bridge") {
      args.bridge = false;
      continue;
    }

    if (arg === "--no-dev") {
      args.dev = false;
      continue;
    }

    if (arg === "--no-watch") {
      args.watch = false;
      continue;
    }

    if (arg === "--watch-profile" && argv[index + 1]) {
      args.watchProfile = argv[index + 1];
      index += 1;
      continue;
    }

    if (arg.startsWith("--watch-profile=")) {
      args.watchProfile = arg.slice("--watch-profile=".length);
      continue;
    }

    if (arg === "--include" && argv[index + 1]) {
      args.watchIncludes.push(argv[index + 1]);
      index += 1;
      continue;
    }

    if (arg.startsWith("--include=")) {
      args.watchIncludes.push(arg.slice("--include=".length));
    }
  }

  return args;
}

function prefixLines(name, stream, chunk) {
  const text = chunk.toString();
  const lines = text.split(/\r?\n/);

  for (const line of lines) {
    if (line.length === 0) {
      continue;
    }
    stream.write(`${colors[name] ?? ""}[${name}]${colors.reset} ${line}\n`);
  }
}

function spawnProcess(name, command, args) {
  const child = spawn(command, args, {
    cwd: process.cwd(),
    env: process.env,
    shell: process.platform === "win32",
    stdio: ["ignore", "pipe", "pipe"]
  });

  child.stdout.on("data", (chunk) => prefixLines(name, process.stdout, chunk));
  child.stderr.on("data", (chunk) => prefixLines(name, process.stderr, chunk));

  child.on("exit", (code, signal) => {
    if (shuttingDown) {
      return;
    }

    const reason = signal ? `signal ${signal}` : `code ${code}`;
    console.error(`${colors.system}[system]${colors.reset} ${name} exited with ${reason}`);

    if (name === "bridge" || name === "dev") {
      shutdown(1);
    }
  });

  return child;
}

const args = parseArgs(process.argv.slice(2));
const children = [];
let shuttingDown = false;

console.log(`${colors.system}[system]${colors.reset} starting Spectra`);

if (args.bridge) {
  children.push(spawnProcess("bridge", "node", ["scripts/spectra-bridge.mjs"]));
}

if (args.watch) {
  const watchArgs = ["scripts/spectra-watch.mjs", "--profile", args.watchProfile];
  for (const include of args.watchIncludes) {
    watchArgs.push("--include", include);
  }
  children.push(spawnProcess("watch", "node", watchArgs));
}

if (args.dev) {
  children.push(spawnProcess("dev", "npx", ["next", "dev"]));
}

if (children.length === 0) {
  console.log(`${colors.system}[system]${colors.reset} nothing enabled`);
  process.exit(0);
}

console.log(`${colors.system}[system]${colors.reset} press Ctrl-C to stop all Spectra processes`);

function shutdown(exitCode = 0) {
  if (shuttingDown) {
    return;
  }

  shuttingDown = true;
  console.log(`${colors.system}[system]${colors.reset} stopping Spectra`);

  for (const child of children) {
    if (!child.killed) {
      child.kill("SIGTERM");
    }
  }

  setTimeout(() => {
    for (const child of children) {
      if (!child.killed) {
        child.kill("SIGKILL");
      }
    }
    process.exit(exitCode);
  }, 1500);
}

process.on("SIGINT", () => shutdown(0));
process.on("SIGTERM", () => shutdown(0));
