import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { sendSpectraEvent } from "./spectra-client.mjs";

const execFileAsync = promisify(execFile);

async function git(args) {
  const { stdout } = await execFileAsync("git", args, { cwd: process.cwd() });
  return stdout.trim();
}

try {
  const [sha, subject, branch] = await Promise.all([
    git(["rev-parse", "--short", "HEAD"]),
    git(["log", "-1", "--pretty=%s"]),
    git(["branch", "--show-current"])
  ]);

  await sendSpectraEvent(
    {
      type: "git_commit",
      source: "git-hook",
      intensity: 0.74,
      metadata: { sha, subject, branch }
    },
    { timeoutMs: 650 }
  );
} catch {
  // Git hooks should never block commits because Spectra is unavailable.
}
