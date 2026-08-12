import { fork } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { randomUUID } from "node:crypto";
import { logger } from "../lib/logger.js";

const processPath = path.join(path.dirname(fileURLToPath(import.meta.url)), "process.js");
const CHAT_TIMEOUT_MS = 25_000;

let child = null;
const pending = new Map();

function spawn() {
  child = fork(processPath);

  child.on("message", (message) => {
    if (message?.type !== "chat-result") return;
    const waiter = pending.get(message.id);
    if (!waiter) return;
    pending.delete(message.id);
    clearTimeout(waiter.timeout);
    if (message.error) waiter.reject(new Error(message.error));
    else waiter.resolve(message.reply);
  });

  child.on("exit", (code) => {
    logger.error("agent process exited, restarting", { code });
    child = null;
    for (const [id, waiter] of pending) {
      clearTimeout(waiter.timeout);
      waiter.reject(new Error("Agent process restarted before it could reply"));
      pending.delete(id);
    }
    spawn();
  });

  return child;
}

export function startAgentProcess() {
  if (!child) spawn();
  return child;
}

export function askAgent(userId, content) {
  if (!child) spawn();

  return new Promise((resolve, reject) => {
    const id = randomUUID();
    const timeout = setTimeout(() => {
      pending.delete(id);
      reject(new Error("Agent did not respond in time"));
    }, CHAT_TIMEOUT_MS);

    pending.set(id, { resolve, reject, timeout });
    child.send({ type: "chat", id, userId, content });
  });
}
