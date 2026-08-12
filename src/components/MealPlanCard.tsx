import { Pencil, Trash2 } from "lucide-react";
import type { Meal, MealPlan } from "../types";

function MealItem({
  meal,
  expanded,
  onToggle
}: {
  meal: Meal;
  expanded: boolean;
  onToggle: () => void;
}) {
  return (
    <button type="button" className={`meal-item-card ${expanded ? "expanded" : ""}`} onClick={onToggle}>
      <strong>{meal.name}</strong>
      <span>{meal.cuisine}</span>
      <small>{meal.servings} servings</small>
      {expanded ? (
        <div className="meal-item-details">
          <div>
            <h4>Ingredients</h4>
            <ul>
              {meal.ingredients.map((ingredient) => (
                <li key={ingredient}>{ingredient}</li>
              ))}
            </ul>
          </div>
          <div>
            <h4>Recipe</h4>
            <ol>
              {meal.recipe.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
          </div>
        </div>
      ) : null}
    </button>
  );
}

export function MealPlanCard({
  plan,
  expandedMealId,
  onToggleMeal,
  onEdit,
  onDelete
}: {
  plan: MealPlan;
  expandedMealId: string | null;
  onToggleMeal: (mealId: string | null) => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <>
      <div className="meal-card-header">
        <div>
          <span className="eyebrow">{plan.date}</span>
          <h2>{plan.name}</h2>
        </div>
        <div className="row-actions">
          <button className="icon-button" type="button" aria-label="Edit plan" onClick={onEdit}>
            <Pencil size={16} />
          </button>
          <button className="icon-button" type="button" aria-label="Delete plan" onClick={onDelete}>
            <Trash2 size={16} />
          </button>
        </div>
      </div>
      <div className="meal-list">
        {plan.meals
          .filter((meal) => !expandedMealId || meal.id === expandedMealId)
          .map((meal) => (
            <MealItem
              key={meal.id}
              meal={meal}
              expanded={expandedMealId === meal.id}
              onToggle={() => onToggleMeal(expandedMealId === meal.id ? null : meal.id)}
            />
          ))}
      </div>
    </>
  );
}
