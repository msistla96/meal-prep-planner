import { randomUUID } from "node:crypto";
import { db } from "../db.js";
import { logger } from "../lib/logger.js";

// Single source of truth for meal-plan persistence — used by the REST
// routes (server/routes/mealPlans.js) and the agent's tools
// (server/agent/tools.js) so both go through the same validation and logging.

function toMeal(row) {
  return {
    id: row.id,
    name: row.name,
    cuisine: row.cuisine,
    servings: row.servings,
    ingredients: JSON.parse(row.ingredients),
    recipe: JSON.parse(row.recipe)
  };
}

function loadPlan(planRow) {
  const meals = db.prepare("SELECT * FROM meals WHERE meal_plan_id = ?").all(planRow.id).map(toMeal);
  return {
    id: planRow.id,
    name: planRow.name,
    date: planRow.date,
    createdBy: planRow.created_by,
    meals
  };
}

function insertMeal(planId, meal) {
  db.prepare(
    `INSERT INTO meals (id, meal_plan_id, name, cuisine, servings, ingredients, recipe)
     VALUES (?, ?, ?, ?, ?, ?, ?)`
  ).run(
    randomUUID(),
    planId,
    meal.name ?? "",
    meal.cuisine ?? "",
    Number(meal.servings) || 1,
    JSON.stringify(meal.ingredients ?? []),
    JSON.stringify(meal.recipe ?? [])
  );
}

function ownedPlan(userId, id) {
  return db.prepare("SELECT * FROM meal_plans WHERE id = ? AND user_id = ?").get(id, userId);
}

export function listMealPlans(userId) {
  return db
    .prepare("SELECT * FROM meal_plans WHERE user_id = ? ORDER BY date, created_at")
    .all(userId)
    .map(loadPlan);
}

export function getMealPlan(userId, id) {
  const plan = ownedPlan(userId, id);
  return plan ? loadPlan(plan) : null;
}

export function createMealPlan(userId, { name, date, meals }, createdBy = "user") {
  const now = new Date().toISOString();
  const id = randomUUID();

  db.prepare(
    "INSERT INTO meal_plans (id, user_id, name, date, created_by, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)"
  ).run(id, userId, name?.trim() || "New meal plan", date || now.slice(0, 10), createdBy, now, now);

  (meals ?? []).forEach((meal) => insertMeal(id, meal));

  logger.info("meal plan created", { userId, planId: id, createdBy });
  return loadPlan(ownedPlan(userId, id));
}

// Agent-authored plans dated today, so the expiry scan can tell "already
// handled today" from "needs a fresh plan" without re-reading every plan.
export function findTodayAgentPlan(userId, today) {
  const row = db
    .prepare("SELECT * FROM meal_plans WHERE user_id = ? AND date = ? AND created_by = 'agent'")
    .get(userId, today);
  return row ? loadPlan(row) : null;
}

// Cleanup for the expiry scan: agent-authored plans left over from before
// today that a user never edited (created_by stays 'agent' — any edit via
// the normal update path leaves created_by alone, so this only ever removes
// plans nobody engaged with).
export function deleteStaleAgentPlans(userId, beforeDate) {
  const rows = db
    .prepare("SELECT id FROM meal_plans WHERE user_id = ? AND date < ? AND created_by = 'agent'")
    .all(userId, beforeDate);
  rows.forEach((row) => db.prepare("DELETE FROM meal_plans WHERE id = ?").run(row.id));
  if (rows.length) logger.info("agent cleaned up stale plans", { userId, count: rows.length });
  return rows.length;
}

export function updateMealPlan(userId, id, { name, date, meals }) {
  const plan = ownedPlan(userId, id);
  if (!plan) return null;

  db.prepare("UPDATE meal_plans SET name = ?, date = ?, updated_at = ? WHERE id = ?").run(
    name?.trim() || plan.name,
    date || plan.date,
    new Date().toISOString(),
    plan.id
  );

  if (meals) {
    db.prepare("DELETE FROM meals WHERE meal_plan_id = ?").run(plan.id);
    meals.forEach((meal) => insertMeal(plan.id, meal));
  }

  logger.info("meal plan updated", { userId, planId: plan.id });
  return loadPlan(ownedPlan(userId, plan.id));
}

export function deleteMealPlan(userId, id) {
  const plan = ownedPlan(userId, id);
  if (!plan) return false;

  db.prepare("DELETE FROM meal_plans WHERE id = ?").run(plan.id);
  logger.info("meal plan deleted", { userId, planId: plan.id });
  return true;
}
