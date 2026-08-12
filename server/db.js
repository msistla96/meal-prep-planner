import Database from "better-sqlite3";
import path from "node:path";
import { fileURLToPath } from "node:url";

const dir = path.dirname(fileURLToPath(import.meta.url));
const dbPath = process.env.DB_PATH ?? path.join(dir, "data.sqlite3");

export const db = new Database(dbPath);
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    age TEXT NOT NULL DEFAULT '',
    gender TEXT NOT NULL DEFAULT '',
    lifestyle TEXT NOT NULL DEFAULT 'Semi active',
    allergies TEXT NOT NULL DEFAULT '',
    cuisines TEXT NOT NULL DEFAULT '',
    proteins TEXT NOT NULL DEFAULT '',
    diet_type TEXT NOT NULL DEFAULT '',
    profile_complete INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS meal_plans (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    date TEXT NOT NULL,
    created_by TEXT NOT NULL DEFAULT 'user',
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS meals (
    id TEXT PRIMARY KEY,
    meal_plan_id TEXT NOT NULL REFERENCES meal_plans(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    cuisine TEXT NOT NULL DEFAULT '',
    servings INTEGER NOT NULL DEFAULT 1,
    ingredients TEXT NOT NULL DEFAULT '[]',
    recipe TEXT NOT NULL DEFAULT '[]'
  );

  CREATE TABLE IF NOT EXISTS grocery_lists (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    source TEXT NOT NULL DEFAULT 'Manual',
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS grocery_items (
    id TEXT PRIMARY KEY,
    grocery_list_id TEXT NOT NULL REFERENCES grocery_lists(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    quantity TEXT NOT NULL DEFAULT '',
    type TEXT NOT NULL DEFAULT '',
    expiry_date TEXT NOT NULL DEFAULT '',
    purchase_date TEXT NOT NULL DEFAULT ''
  );

  CREATE INDEX IF NOT EXISTS idx_meal_plans_user ON meal_plans(user_id);
  CREATE INDEX IF NOT EXISTS idx_meals_plan ON meals(meal_plan_id);
  CREATE INDEX IF NOT EXISTS idx_grocery_lists_user ON grocery_lists(user_id);
  CREATE INDEX IF NOT EXISTS idx_grocery_items_list ON grocery_items(grocery_list_id);
`);
