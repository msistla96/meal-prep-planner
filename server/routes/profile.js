import { Router } from "express";
import * as profile from "../services/profile.js";

export const profileRouter = Router();

profileRouter.get("/", (req, res) => {
  res.json(profile.getProfile(req.userId));
});

profileRouter.put("/", (req, res) => {
  try {
    res.json(profile.saveProfile(req.userId, req.body ?? {}));
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});
