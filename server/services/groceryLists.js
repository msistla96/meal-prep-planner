import { randomUUID } from "node:crypto";
import { db } from "../db.js";
import { logger } from "../lib/logger.js";

function toItem(row) {
  return {
    id: row.id,
    name: row.name,
    quantity: row.quantity,
    type: row.type,
    expiryDate: row.expiry_date,
    purchaseDate: row.purchase_date
  };
}

function loadList(listRow) {
  const items = db
    .prepare("SELECT * FROM grocery_items WHERE grocery_list_id = ?")
    .all(listRow.id)
    .map(toItem);
  return {
    id: listRow.id,
    name: listRow.name,
    source: listRow.source,
    created: listRow.created_at.slice(0, 10),
    updated: listRow.updated_at.slice(0, 10),
    items
  };
}

function ownedList(userId, id) {
  return db.prepare("SELECT * FROM grocery_lists WHERE id = ? AND user_id = ?").get(id, userId);
}

export function listGroceryLists(userId) {
  return db
    .prepare("SELECT * FROM grocery_lists WHERE user_id = ? ORDER BY created_at DESC")
    .all(userId)
    .map(loadList);
}

export function getGroceryList(userId, id) {
  const list = ownedList(userId, id);
  return list ? loadList(list) : null;
}

export function createGroceryList(userId, { name, source }) {
  if (!name?.trim()) throw new Error("List name is required");

  const now = new Date().toISOString();
  const id = randomUUID();
  db.prepare(
    "INSERT INTO grocery_lists (id, user_id, name, source, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)"
  ).run(id, userId, name.trim(), source ?? "Manual", now, now);

  logger.info("grocery list created", { userId, listId: id });
  return loadList(ownedList(userId, id));
}

export function updateGroceryList(userId, id, { name, source }) {
  const list = ownedList(userId, id);
  if (!list) return null;

  db.prepare("UPDATE grocery_lists SET name = ?, source = ?, updated_at = ? WHERE id = ?").run(
    name?.trim() || list.name,
    source ?? list.source,
    new Date().toISOString(),
    list.id
  );

  logger.info("grocery list updated", { userId, listId: list.id });
  return loadList(ownedList(userId, list.id));
}

export function deleteGroceryList(userId, id) {
  const list = ownedList(userId, id);
  if (!list) return false;

  db.prepare("DELETE FROM grocery_lists WHERE id = ?").run(list.id);
  logger.info("grocery list deleted", { userId, listId: list.id });
  return true;
}

export function addGroceryItem(userId, listId, { name, quantity, type, expiryDate, purchaseDate }) {
  const list = ownedList(userId, listId);
  if (!list) return null;
  if (!name?.trim()) throw new Error("Item name is required");

  db.prepare(
    `INSERT INTO grocery_items (id, grocery_list_id, name, quantity, type, expiry_date, purchase_date)
     VALUES (?, ?, ?, ?, ?, ?, ?)`
  ).run(randomUUID(), list.id, name.trim(), quantity ?? "", type ?? "", expiryDate ?? "", purchaseDate ?? "");
  db.prepare("UPDATE grocery_lists SET updated_at = ? WHERE id = ?").run(new Date().toISOString(), list.id);

  logger.info("grocery item added", { userId, listId: list.id });
  return loadList(ownedList(userId, list.id));
}
