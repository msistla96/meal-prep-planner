import { db } from "../db.js";
import { logger } from "../lib/logger.js";
import * as groceryLists from "../services/groceryLists.js";
import * as mealPlans from "../services/mealPlans.js";

const EXPIRY_WINDOW_DAYS = Number(process.env.AGENT_EXPIRY_WINDOW_DAYS ?? 2);
const AUTO_PLAN_NAME = "Use-it-up plan";

function addDays(isoDate, days) {
  const date = new Date(`${isoDate}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function expiringItemNames(items, today) {
  const cutoff = addDays(today, EXPIRY_WINDOW_DAYS);
  return items
    .filter((item) => item.expiryDate && item.expiryDate <= cutoff)
    .map((item) => item.name)
    .filter(Boolean);
}

// Pure decision function: today's date + the current data in, a list of
// actions out. Expiry is the only signal today; a future signal (e.g. "user
// hasn't cooked in 3 days") plugs in here as another input, not a rewrite.
export function decideActions({ today, groceryItems, existingAutoPlan }) {
  const expiring = [...new Set(expiringItemNames(groceryItems, today))];

  if (expiring.length === 0) return [];

  if (!existingAutoPlan) {
    return [
      {
        type: "create",
        plan: {
          name: AUTO_PLAN_NAME,
          date: today,
          meals: [
            {
              name: `Use up: ${expiring.slice(0, 3).join(", ")}`,
              cuisine: "Custom",
              servings: 2,
              ingredients: expiring,
              recipe: ["Combine the expiring ingredients into today's meal before they spoil."]
            }
          ]
        }
      }
    ];
  }

  const alreadyCovered = new Set(existingAutoPlan.meals.flatMap((meal) => meal.ingredients));
  const uncovered = expiring.filter((name) => !alreadyCovered.has(name));
  if (uncovered.length === 0) return [];

  return [
    {
      type: "edit",
      id: existingAutoPlan.id,
      plan: {
        meals: [
          ...existingAutoPlan.meals,
          {
            name: `Use up: ${uncovered.slice(0, 3).join(", ")}`,
            cuisine: "Custom",
            servings: 2,
            ingredients: uncovered,
            recipe: ["Combine the expiring ingredients into today's meal before they spoil."]
          }
        ]
      }
    }
  ];
}

export function scanUser(userId, today = new Date().toISOString().slice(0, 10)) {
  const groceryItems = groceryLists.listGroceryLists(userId).flatMap((list) => list.items);
  const existingAutoPlan = mealPlans.findTodayAgentPlan(userId, today);

  const actions = decideActions({ today, groceryItems, existingAutoPlan });

  for (const action of actions) {
    if (action.type === "create") {
      mealPlans.createMealPlan(userId, action.plan, "agent");
      logger.info("agent created meal plan from expiring groceries", { userId });
    } else if (action.type === "edit") {
      mealPlans.updateMealPlan(userId, action.id, action.plan);
      logger.info("agent extended meal plan with expiring groceries", { userId });
    }
  }

  mealPlans.deleteStaleAgentPlans(userId, today);
}

export function scanAllUsers() {
  const today = new Date().toISOString().slice(0, 10);
  const userIds = db.prepare("SELECT id FROM users").all().map((row) => row.id);
  for (const userId of userIds) {
    try {
      scanUser(userId, today);
    } catch (error) {
      logger.error("agent expiry scan failed for user", { userId, error: error.message });
    }
  }
}
