import {
  Bot,
  CalendarDays,
  Home,
  ListChecks,
  Settings,
  UserRound
} from "lucide-react";
import { useEffect, type ReactNode } from "react";
import { AgentWidget } from "./AgentWidget";
import { useApp } from "../state/AppContext";
import { AppLink, useRouter } from "../state/RouterContext";

const navItems = [
  { to: "/", label: "Home", icon: Home },
  { to: "/meal-plans", label: "Meal plans", icon: CalendarDays },
  { to: "/grocery-lists", label: "Grocery lists", icon: ListChecks },
  { to: "/agent", label: "Agent chat", icon: Bot },
  { to: "/settings", label: "Settings", icon: Settings },
  { to: "/profile", label: "Profile", icon: UserRound }
];

export function AppShell({ children }: { children: ReactNode }) {
  const { clearAgentShellPrompt, shouldOpenAgentOnShell } = useApp();
  const { path } = useRouter();
  const showAgentWidget = path !== "/agent";

  useEffect(() => {
    if (showAgentWidget && shouldOpenAgentOnShell) {
      clearAgentShellPrompt();
    }
  }, [clearAgentShellPrompt, shouldOpenAgentOnShell, showAgentWidget]);

  return (
    <div className="app-shell">
      <aside className="sidebar" aria-label="Primary navigation">
        <div className="brand">
          <span className="brand-mark">MP</span>
          <div>
            <strong>Meal Prep</strong>
            <span>Planner</span>
          </div>
        </div>
        <nav>
          {navItems.map(({ to, label, icon: Icon }) => (
            <AppLink
              key={to}
              to={to}
              end={to === "/"}
              className="nav-link"
              activeClassName="active"
            >
              <Icon aria-hidden="true" size={18} />
              <span>{label}</span>
            </AppLink>
          ))}
        </nav>
      </aside>
      <main className="content">{children}</main>
      {showAgentWidget ? <AgentWidget initiallyOpen={shouldOpenAgentOnShell} /> : null}
    </div>
  );
}
