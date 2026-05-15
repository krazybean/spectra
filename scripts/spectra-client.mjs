import { WebSocket } from "ws";
import { normalizeSpectraEvent } from "./spectra-event-schema.mjs";

export const defaultBridgeUrl = process.env.SPECTRA_BRIDGE_URL ?? "ws://localhost:7777";

export function sendSpectraEvent(input, options = {}) {
  const bridgeUrl = options.bridgeUrl ?? defaultBridgeUrl;
  const timeoutMs = options.timeoutMs ?? 1200;
  const event = normalizeSpectraEvent(input);

  return new Promise((resolve, reject) => {
    const socket = new WebSocket(bridgeUrl);
    const timeout = setTimeout(() => {
      socket.close();
      reject(new Error(`Timed out connecting to ${bridgeUrl}`));
    }, timeoutMs);

    socket.on("open", () => {
      clearTimeout(timeout);
      socket.send(JSON.stringify(event), (error) => {
        if (error) {
          reject(error);
          return;
        }
        socket.close();
        resolve(event);
      });
    });

    socket.on("error", (error) => {
      clearTimeout(timeout);
      reject(error);
    });
  });
}
