import { Router } from "express";
import { askAgent } from "../agent/client.js";

export const agentRouter = Router();

agentRouter.post("/", async (req, res) => {
  const { content } = req.body ?? {};
  if (!content?.trim()) return res.status(400).json({ error: "Message content is required" });

  try {
    const reply = await askAgent(req.userId, content.trim());
    res.json({ reply });
  } catch (error) {
    res.status(504).json({ error: error.message });
  }
});
