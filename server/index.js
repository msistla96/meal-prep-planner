import "dotenv/config";
import express from "express";
import "./db.js";
import { sessionMiddleware, requireAuth } from "./middleware/auth.js";
import { requestLogger, logger } from "./lib/logger.js";
import { authRouter } from "./routes/auth.js";
import { profileRouter } from "./routes/profile.js";
import { mealPlansRouter } from "./routes/mealPlans.js";
import { groceryListsRouter } from "./routes/groceryLists.js";
import { agentRouter } from "./routes/agent.js";
import { startAgentProcess } from "./agent/client.js";

const app = express();
const PORT = process.env.PORT ?? 4000;

app.use(express.json());
app.use(sessionMiddleware);
app.use(requestLogger);

app.use("/api/auth", authRouter);
app.use("/api/profile", requireAuth, profileRouter);
app.use("/api/meal-plans", requireAuth, mealPlansRouter);
app.use("/api/grocery-lists", requireAuth, groceryListsRouter);
app.use("/api/agent", requireAuth, agentRouter);

app.use((err, req, res, next) => {
  logger.error("unhandled error", { path: req.path, error: err.message });
  res.status(500).json({ error: "Internal server error" });
});

app.listen(PORT, () => {
  logger.info("server listening", { port: PORT });
  startAgentProcess();
});
