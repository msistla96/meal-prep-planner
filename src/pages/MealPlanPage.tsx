import { useState } from "react";
import { PageHeader } from "../components/PageHeader";
import { useApp } from "../state/AppContext";
import type { ViewMode } from "../types";

const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function MealPlanPage() {
  const { mealPlans, createMealPlan, deleteMealPlan } = useApp();
  const [view, setView] = useState<ViewMode>("day");

  return (
    <>
      <PageHeader title="Meal plans">
        <button className="primary-button" type="button" onClick={() => createMealPlan()}>
          Create plan
        </button>
      </PageHeader>
      <section className="planner-layout">
        <div className="panel">
          <div className="segmented" role="group" aria-label="Meal plan view">
            {(["day", "week", "month"] as ViewMode[]).map((mode) => (
              <button
                key={mode}
                type="button"
                className={view === mode ? "active" : ""}
                onClick={() => setView(mode)}
              >
                {mode}
              </button>
            ))}
          </div>
          <div className="calendar-strip" aria-label="Calendar">
            {days.map((day, index) => (
              <div key={day} className="calendar-day">
                <span>{day}</span>
                <strong>{index + 2}</strong>
                {index < 2 ? <i aria-label="meal planned" /> : null}
              </div>
            ))}
          </div>
        </div>
        <section className="meal-panel">
          {mealPlans.map((plan) => (
            <article className="panel meal-card" key={plan.id}>
              <div>
                <span className="eyebrow">{plan.date}</span>
                <h2>{plan.name}</h2>
              </div>
              <div className="meal-list">
                {plan.meals.map((meal) => (
                  <div key={meal.id}>
                    <strong>{meal.name}</strong>
                    <span>{meal.cuisine}</span>
                    <small>{meal.servings} servings</small>
                  </div>
                ))}
              </div>
              <div className="row-actions">
                <button type="button">Edit plan</button>
                <button type="button" onClick={() => deleteMealPlan(plan.id)}>
                  Delete plan
                </button>
              </div>
            </article>
          ))}
        </section>
      </section>
    </>
  );
}
