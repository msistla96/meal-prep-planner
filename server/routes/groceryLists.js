import { Router } from "express";
import * as groceryLists from "../services/groceryLists.js";

export const groceryListsRouter = Router();

groceryListsRouter.get("/", (req, res) => {
  res.json({ groceryLists: groceryLists.listGroceryLists(req.userId) });
});

groceryListsRouter.post("/", (req, res) => {
  try {
    res.status(201).json({ groceryList: groceryLists.createGroceryList(req.userId, req.body ?? {}) });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

groceryListsRouter.patch("/:id", (req, res) => {
  const list = groceryLists.updateGroceryList(req.userId, req.params.id, req.body ?? {});
  if (!list) return res.status(404).json({ error: "Grocery list not found" });
  res.json({ groceryList: list });
});

groceryListsRouter.delete("/:id", (req, res) => {
  const deleted = groceryLists.deleteGroceryList(req.userId, req.params.id);
  if (!deleted) return res.status(404).json({ error: "Grocery list not found" });
  res.status(204).end();
});

groceryListsRouter.post("/:id/items", (req, res) => {
  try {
    const list = groceryLists.addGroceryItem(req.userId, req.params.id, req.body ?? {});
    if (!list) return res.status(404).json({ error: "Grocery list not found" });
    res.status(201).json({ groceryList: list });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});
