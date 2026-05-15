import fs from "node:fs";
import path from "node:path";

const hookPath = path.join(process.cwd(), ".git", "hooks", "post-commit");
const hookBody = `#!/bin/sh
node scripts/spectra-git-post-commit.mjs >/dev/null 2>&1 || true
`;

if (!fs.existsSync(path.dirname(hookPath))) {
  console.error("[spectra] .git/hooks not found");
  process.exit(1);
}

fs.writeFileSync(hookPath, hookBody, { mode: 0o755 });
console.log("[spectra] installed .git/hooks/post-commit");
