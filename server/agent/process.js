// Entry point for the agent's child process (forked from server/index.js via
// server/agent/client.js). Runs independently of the API server's event
// loop: its own module registry, own db.js connection (safe under SQLite's
// WAL mode), own crash domain. If this process hangs or dies, the API
// server keeps serving everything except live agent chat, and the parent
// can restart it.
import { scanAllUsers } from "./expiryAgent.js";
import { runAgent } from "./runtime.js";
import { logger } from "../lib/logger.js";

const SCAN_INTERVAL_MS = Number(process.env.AGENT_SCAN_INTERVAL_MS ?? 5 * 60 * 1000);

function runScan() {
  try {
    scanAllUsers();
  } catch (error) {
    logger.error("agent background scan failed", { error: error.message });
  }
}

runScan();
setInterval(runScan, SCAN_INTERVAL_MS);

process.on("message", async (message) => {
  if (message?.type !== "chat") return;
  const { id, userId, content } = message;
  try {
    const reply = await runAgent(userId, content);
    process.send({ type: "chat-result", id, reply });
  } catch (error) {
    logger.error("agent chat failed", { userId, error: error.message });
    process.send({ type: "chat-result", id, error: error.message });
  }
});

logger.info("agent process started", { scanIntervalMs: SCAN_INTERVAL_MS });
