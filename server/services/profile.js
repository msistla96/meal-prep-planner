import { db } from "../db.js";
import { logger } from "../lib/logger.js";

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

export function getProfile(userId) {
  const user = db.prepare("SELECT * FROM users WHERE id = ?").get(userId);
  return { profile: toProfile(user), profileComplete: Boolean(user.profile_complete) };
}

export function saveProfile(userId, { name, age, gender, lifestyle, allergies, cuisines, proteins, dietType }) {
  if (!name?.trim() || !age?.trim() || !gender?.trim()) {
    throw new Error("Name, age, and gender are required");
  }

  db.prepare(
    `UPDATE users SET name = ?, age = ?, gender = ?, lifestyle = ?, allergies = ?, cuisines = ?, proteins = ?, diet_type = ?, profile_complete = 1, updated_at = ?
     WHERE id = ?`
  ).run(
    name.trim(),
    age.trim(),
    gender.trim(),
    lifestyle ?? "Semi active",
    allergies ?? "",
    cuisines ?? "",
    proteins ?? "",
    dietType ?? "",
    new Date().toISOString(),
    userId
  );

  logger.info("profile saved", { userId });
  return getProfile(userId);
}
