import { WebSocketServer, WebSocket } from "ws";
import { normalizeSpectraEvent } from "./spectra-event-schema.mjs";

const port = Number.parseInt(process.env.SPECTRA_BRIDGE_PORT ?? "7777", 10);
const host = process.env.SPECTRA_BRIDGE_HOST ?? "localhost";
const server = new WebSocketServer({ host, port });

function broadcast(event, sender) {
  const payload = JSON.stringify({ channel: "spectra:event", event });

  for (const client of server.clients) {
    if (client !== sender && client.readyState === WebSocket.OPEN) {
      client.send(payload);
    }
  }
}

server.on("connection", (socket) => {
  socket.send(
    JSON.stringify({
      channel: "spectra:bridge",
      status: "connected",
      timestamp: Date.now()
    })
  );

  socket.on("message", (message) => {
    try {
      const parsed = JSON.parse(message.toString());
      const event = normalizeSpectraEvent(parsed.event ?? parsed);
      broadcast(event, socket);
      console.log(
        `[spectra] ${event.type} source=${event.source} intensity=${event.intensity.toFixed(2)}`
      );
    } catch (error) {
      socket.send(
        JSON.stringify({
          channel: "spectra:error",
          message: error instanceof Error ? error.message : "Invalid event payload"
        })
      );
    }
  });
});

server.on("listening", () => {
  console.log(`[spectra] bridge listening on ws://${host}:${port}`);
});

server.on("error", (error) => {
  console.error(`[spectra] bridge error: ${error.message}`);
  process.exitCode = 1;
});

function shutdown() {
  console.log("\n[spectra] bridge shutting down");
  server.close(() => process.exit(0));
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
