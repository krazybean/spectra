import { spawn } from "node:child_process";
import { sendSpectraEvent } from "./spectra-client.mjs";

const separatorIndex = process.argv.indexOf("--");
const command = separatorIndex >= 0 ? process.argv.slice(separatorIndex + 1) : process.argv.slice(2);

if (command.length === 0) {
  console.error("[spectra] usage: npm run spectra:run -- <command> [...args]");
  process.exit(1);
}

const commandText = command.join(" ");
const lowerCommand = commandText.toLowerCase();
const source = process.env.SPECTRA_SOURCE ?? "terminal";
const startedAt = Date.now();

function classifyStart() {
  if (lowerCommand.includes("build")) {
    return "build_started";
  }
  return "tool_call";
}

function classifyEnd(exitCode) {
  if (exitCode !== 0) {
    return "error_state";
  }
  if (lowerCommand.includes("build")) {
    return "build_completed";
  }
  return "task_completed";
}

async function emit(input) {
  try {
    await sendSpectraEvent(input, { timeoutMs: 700 });
  } catch {
    // Wrapped commands should keep working even when Spectra is not running.
  }
}

await emit({
  type: classifyStart(),
  source,
  intensity: lowerCommand.includes("build") ? 0.62 : 0.54,
  metadata: { command: commandText }
});

const child = spawn(command[0], command.slice(1), {
  env: process.env,
  shell: process.platform === "win32",
  stdio: "inherit"
});

child.on("exit", async (code) => {
  const exitCode = code ?? 1;
  await emit({
    type: classifyEnd(exitCode),
    source,
    intensity: exitCode === 0 ? 0.82 : 0.96,
    metadata: {
      command: commandText,
      durationMs: Date.now() - startedAt,
      exitCode
    }
  });
  process.exit(exitCode);
});
