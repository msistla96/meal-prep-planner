import { Bot, CalendarPlus, ListPlus, Settings } from "lucide-react";
import { PageHeader } from "../components/PageHeader";
import { useApp } from "../state/AppContext";
import { AppLink } from "../state/RouterContext";

export function HomePage() {
  const { profile, mealPlans, groceryLists } = useApp();
  const todayPlan = mealPlans[0];
  const expiringSoon = groceryLists.flatMap((list) => list.items).length;

  return (
    <>
      <PageHeader title={`Welcome, ${profile.name}`} />
      <section className="dashboard-grid">
        <div className="panel span-2">
          <h2>Quick actions</h2>
          <div className="quick-actions">
            <AppLink to="/meal-plans" className="action-tile">
              <CalendarPlus size={20} />
              Create meal plan
            </AppLink>
            <AppLink to="/grocery-lists" className="action-tile">
              <ListPlus size={20} />
              Create grocery list
            </AppLink>
            <AppLink to="/agent" className="action-tile">
              <Bot size={20} />
              Chat with agent
            </AppLink>
            <AppLink to="/settings" className="action-tile">
              <Settings size={20} />
              Settings
            </AppLink>
          </div>
        </div>
        <div className="panel">
          <h2>Today&apos;s plan</h2>
          <strong>{todayPlan.name}</strong>
          <p>{todayPlan.meals.length} meals prepared for today.</p>
          <AppLink to="/meal-plans">View meal plans</AppLink>
        </div>
        <div className="panel">
          <h2>Stats</h2>
          <div className="stat-row">
            <span>Meal plans</span>
            <strong>{mealPlans.length}</strong>
          </div>
          <div className="stat-row">
            <span>Tracked groceries</span>
            <strong>{expiringSoon}</strong>
          </div>
        </div>
      </section>
    </>
  );
}
