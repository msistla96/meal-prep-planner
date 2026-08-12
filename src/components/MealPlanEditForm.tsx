import { Check, X } from "lucide-react";
import { FormEvent } from "react";
import type { Meal } from "../types";

export type DraftMeal = {
  id: string;
  name: string;
  cuisine: string;
  servings: string;
  ingredients: string;
  recipe: string;
};

export function toDraftMeal(meal: Meal): DraftMeal {
  return {
    id: meal.id,
    name: meal.name,
    cuisine: meal.cuisine,
    servings: String(meal.servings),
    ingredients: meal.ingredients.join("\n"),
    recipe: meal.recipe.join("\n")
  };
}

export function fromDraftMeal(draft: DraftMeal): Meal {
  return {
    id: draft.id,
    name: draft.name.trim(),
    cuisine: draft.cuisine.trim(),
    servings: Number(draft.servings) || 1,
    ingredients: draft.ingredients.split("\n").map((line) => line.trim()).filter(Boolean),
    recipe: draft.recipe.split("\n").map((line) => line.trim()).filter(Boolean)
  };
}

export function MealPlanEditForm({
  name,
  date,
  meals,
  onNameChange,
  onDateChange,
  onMealChange,
  onSubmit,
  onCancel
}: {
  name: string;
  date: string;
  meals: DraftMeal[];
  onNameChange: (value: string) => void;
  onDateChange: (value: string) => void;
  onMealChange: (mealId: string, key: keyof DraftMeal, value: string) => void;
  onSubmit: (event: FormEvent) => void;
  onCancel: () => void;
}) {
  return (
    <form className="plan-edit-form" onSubmit={onSubmit}>
      <label>
        Plan name
        <input value={name} onChange={(event) => onNameChange(event.target.value)} />
      </label>
      <label>
        Date
        <input value={date} onChange={(event) => onDateChange(event.target.value)} />
      </label>

      <h3>Meals</h3>
      <div className="meal-edit-rows">
        {meals.map((meal) => (
          <div className="meal-edit-row" key={meal.id}>
            <div className="form-grid">
              <label>
                Meal name
                <input value={meal.name} onChange={(event) => onMealChange(meal.id, "name", event.target.value)} />
              </label>
              <label>
                Cuisine
                <input
                  value={meal.cuisine}
                  onChange={(event) => onMealChange(meal.id, "cuisine", event.target.value)}
                />
              </label>
              <label>
                Servings
                <input
                  type="number"
                  min="1"
                  value={meal.servings}
                  onChange={(event) => onMealChange(meal.id, "servings", event.target.value)}
                />
              </label>
            </div>
            <label>
              Ingredients (one per line)
              <textarea
                rows={3}
                value={meal.ingredients}
                onChange={(event) => onMealChange(meal.id, "ingredients", event.target.value)}
              />
            </label>
            <label>
              Recipe (one step per line)
              <textarea
                rows={4}
                value={meal.recipe}
                onChange={(event) => onMealChange(meal.id, "recipe", event.target.value)}
              />
            </label>
          </div>
        ))}
      </div>

      <div className="row-actions">
        <button className="icon-button" type="submit" aria-label="Save plan">
          <Check size={16} />
        </button>
        <button className="icon-button" type="button" aria-label="Cancel edit" onClick={onCancel}>
          <X size={16} />
        </button>
      </div>
    </form>
  );
}
