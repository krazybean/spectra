import { sendSpectraEvent } from "./spectra-client.mjs";
import { SPECTRA_EVENT_TYPES } from "./spectra-event-schema.mjs";

function readArg(name, fallback) {
  const prefix = `--${name}=`;
  const inline = process.argv.find((arg) => arg.startsWith(prefix));
  if (inline) {
    return inline.slice(prefix.length);
  }

  const index = process.argv.indexOf(`--${name}`);
  if (index >= 0 && process.argv[index + 1]) {
    return process.argv[index + 1];
  }

  return fallback;
}

function readMetadata() {
  const raw = readArg("metadata", "{}");
  try {
    return JSON.parse(raw);
  } catch {
    throw new Error(`Invalid --metadata JSON: ${raw}`);
  }
}

const type = process.argv[2];

if (!SPECTRA_EVENT_TYPES.includes(type)) {
  console.error(`[spectra] usage: npm run emit -- <type> [--source name] [--intensity 0.7] [--metadata '{"key":"value"}']`);
  console.error(`[spectra] event types: ${SPECTRA_EVENT_TYPES.join(", ")}`);
  process.exit(1);
}

const intensity = Number.parseFloat(readArg("intensity", "0.5"));

try {
  const event = await sendSpectraEvent({
    type,
    source: readArg("source", "manual"),
    intensity,
    label: readArg("label", undefined),
    detail: readArg("detail", undefined),
    metadata: readMetadata()
  });

  console.log(`[spectra] emitted ${event.type} source=${event.source}`);
} catch (error) {
  console.error(`[spectra] emit failed: ${error instanceof Error ? error.message : "unknown error"}`);
  console.error("[spectra] start the bridge first with: npm run bridge");
  process.exit(1);
}
