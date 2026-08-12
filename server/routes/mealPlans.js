import { Router } from "express";
import * as mealPlans from "../services/mealPlans.js";

export const mealPlansRouter = Router();

// GET/POST /api/meal-plans, PATCH/DELETE /api/meal-plans/:id — called from
// React's AppContext (createMealPlan/updateMealPlan/deleteMealPlan) via
// fetch, proxied by Vite from :5173 to this server at :4000.
mealPlansRouter.get("/", (req, res) => {
  res.json({ mealPlans: mealPlans.listMealPlans(req.userId) });
});

mealPlansRouter.post("/", (req, res) => {
  res.status(201).json({ mealPlan: mealPlans.createMealPlan(req.userId, req.body ?? {}) });
});

mealPlansRouter.patch("/:id", (req, res) => {
  const plan = mealPlans.updateMealPlan(req.userId, req.params.id, req.body ?? {});
  if (!plan) return res.status(404).json({ error: "Meal plan not found" });
  res.json({ mealPlan: plan });
});

mealPlansRouter.delete("/:id", (req, res) => {
  const deleted = mealPlans.deleteMealPlan(req.userId, req.params.id);
  if (!deleted) return res.status(404).json({ error: "Meal plan not found" });
  res.status(204).end();
});
