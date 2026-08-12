import { randomUUID } from "node:crypto";
import { Router } from "express";
import { db } from "../db.js";
import { hashPassword, verifyPassword } from "../lib/password.js";
import { logger } from "../lib/logger.js";

export const authRouter = Router();

function toProfile(user) {
  return {
    name: user.name,
    age: user.age,
    gender: user.gender,
    lifestyle: user.lifestyle,
    allergies: user.allergies,
    cuisines: user.cuisines,
    proteins: user.proteins,
    dietType: user.diet_type
  };
}

authRouter.post("/signup", (req, res) => {
  const { name, password } = req.body ?? {};
  if (!name?.trim() || !password) {
    return res.status(400).json({ error: "Name and password are required" });
  }

  const existing = db.prepare("SELECT id FROM users WHERE name = ?").get(name.trim());
  if (existing) return res.status(409).json({ error: "That name is already taken" });

  const now = new Date().toISOString();
  const user = {
    id: randomUUID(),
    name: name.trim(),
    password_hash: hashPassword(password),
    age: "",
    gender: "",
    lifestyle: "Semi active",
    allergies: "",
    cuisines: "",
    proteins: "",
    diet_type: "",
    profile_complete: 0,
    created_at: now,
    updated_at: now
  };
  db.prepare(
    `INSERT INTO users (id, name, password_hash, age, gender, lifestyle, allergies, cuisines, proteins, diet_type, profile_complete, created_at, updated_at)
     VALUES (@id, @name, @password_hash, @age, @gender, @lifestyle, @allergies, @cuisines, @proteins, @diet_type, @profile_complete, @created_at, @updated_at)`
  ).run(user);

  req.session.userId = user.id;
  logger.info("user signed up", { userId: user.id });
  res.status(201).json({ profile: toProfile(user), profileComplete: false });
});

authRouter.post("/login", (req, res) => {
  const { name, password } = req.body ?? {};
  if (!name?.trim() || !password) {
    return res.status(400).json({ error: "Name and password are required" });
  }

  const user = db.prepare("SELECT * FROM users WHERE name = ?").get(name.trim());
  if (!user || !verifyPassword(password, user.password_hash)) {
    logger.warn("failed login attempt", { name: name.trim() });
    return res.status(401).json({ error: "Invalid name or password" });
  }

  req.session.userId = user.id;
  logger.info("user logged in", { userId: user.id });
  res.json({ profile: toProfile(user), profileComplete: Boolean(user.profile_complete) });
});

authRouter.post("/logout", (req, res) => {
  const userId = req.session?.userId;
  req.session?.destroy((err) => {
    if (err) {
      logger.error("logout failed", { userId, error: err.message });
      return res.status(500).json({ error: "Logout failed" });
    }
    res.clearCookie("session_token");
    logger.info("user logged out", { userId });
    res.status(204).end();
  });
});
