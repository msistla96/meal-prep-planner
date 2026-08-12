import { FormEvent, useState } from "react";
import { CalendarStrip } from "../components/CalendarStrip";
import { DraftMeal, MealPlanEditForm, fromDraftMeal, toDraftMeal } from "../components/MealPlanEditForm";
import { MealPlanCard } from "../components/MealPlanCard";
import { PageHeader } from "../components/PageHeader";
import { useApp } from "../state/AppContext";
import type { MealPlan } from "../types";

export function MealPlanPage() {
  const { mealPlans, createMealPlan, updateMealPlan, deleteMealPlan } = useApp();
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [expandedMealId, setExpandedMealId] = useState<string | null>(null);
  const [editingPlanId, setEditingPlanId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editDate, setEditDate] = useState("");
  const [editMeals, setEditMeals] = useState<DraftMeal[]>([]);

  const plansForDay = mealPlans.filter((plan) => plan.date === selectedDate);

  function startEditing(plan: MealPlan) {
    setEditingPlanId(plan.id);
    setEditName(plan.name);
    setEditDate(plan.date);
    setEditMeals(plan.meals.map(toDraftMeal));
  }

  function updateEditMeal(mealId: string, key: keyof DraftMeal, value: string) {
    setEditMeals((current) =>
      current.map((meal) => (meal.id === mealId ? { ...meal, [key]: value } : meal))
    );
  }

  function saveEdit(event: FormEvent, planId: string) {
    event.preventDefault();
    if (!editName.trim() || !editDate.trim()) return;
    updateMealPlan(planId, {
      name: editName.trim(),
      date: editDate.trim(),
      meals: editMeals.map(fromDraftMeal)
    });
    setEditingPlanId(null);
  }

  return (
    <>
      <PageHeader title="Meal plans">
        <button className="primary-button" type="button" onClick={() => createMealPlan()}>
          Create plan
        </button>
      </PageHeader>
      <section className="planner-layout">
        <div className="panel">
          <CalendarStrip
            selectedDate={selectedDate}
            hasPlanOnDate={(date) => mealPlans.some((plan) => plan.date === date)}
            onSelect={(date) => {
              setSelectedDate(date);
              setExpandedMealId(null);
            }}
          />
        </div>
        <section className="meal-panel">
          {plansForDay.length === 0 ? (
            <p className="empty-state">No meal plans for this day.</p>
          ) : (
            plansForDay.map((plan) => (
              <article className="panel meal-card" key={plan.id}>
                {editingPlanId === plan.id ? (
                  <MealPlanEditForm
                    name={editName}
                    date={editDate}
                    meals={editMeals}
                    onNameChange={setEditName}
                    onDateChange={setEditDate}
                    onMealChange={updateEditMeal}
                    onSubmit={(event) => saveEdit(event, plan.id)}
                    onCancel={() => setEditingPlanId(null)}
                  />
                ) : (
                  <MealPlanCard
                    plan={plan}
                    expandedMealId={expandedMealId}
                    onToggleMeal={setExpandedMealId}
                    onEdit={() => startEditing(plan)}
                    onDelete={() => deleteMealPlan(plan.id)}
                  />
                )}
              </article>
            ))
          )}
        </section>
      </section>
    </>
  );
}
