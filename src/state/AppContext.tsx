import {
  createContext,
  type ReactNode,
  useContext,
  useMemo,
  useState
} from "react";
import {
  initialGroceryLists,
  initialMealPlans,
  initialMessages,
  initialProfile
} from "../data/mockData";
import type {
  ChatMessage,
  GroceryItem,
  GroceryList,
  MealPlan,
  UserProfile
} from "../types";

type AppState = {
  isAuthenticated: boolean;
  profileComplete: boolean;
  shouldOpenAgentOnShell: boolean;
  profile: UserProfile;
  mealPlans: MealPlan[];
  groceryLists: GroceryList[];
  messages: ChatMessage[];
  login: (name: string) => void;
  signup: (name: string) => void;
  clearAgentShellPrompt: () => void;
  logout: () => void;
  saveProfile: (profile: UserProfile) => void;
  createMealPlan: (name?: string) => void;
  deleteMealPlan: (id: string) => void;
  createGroceryList: (list: Pick<GroceryList, "name" | "source"> & { items?: Omit<GroceryItem, "id">[] }) => void;
  updateGroceryList: (id: string, updates: Pick<GroceryList, "name" | "source">) => void;
  deleteGroceryList: (id: string) => void;
  addGroceryItem: (listId: string, item: Omit<GroceryItem, "id">) => void;
  sendAgentMessage: (content: string) => void;
};

const AppContext = createContext<AppState | undefined>(undefined);

const today = "2026-08-02";

export function AppProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setAuthenticated] = useState(false);
  const [profileComplete, setProfileComplete] = useState(true);
  const [shouldOpenAgentOnShell, setShouldOpenAgentOnShell] = useState(false);
  const [profile, setProfile] = useState(initialProfile);
  const [mealPlans, setMealPlans] = useState(initialMealPlans);
  const [groceryLists, setGroceryLists] = useState(initialGroceryLists);
  const [messages, setMessages] = useState(initialMessages);

  const value = useMemo<AppState>(
    () => ({
      isAuthenticated,
      profileComplete,
      shouldOpenAgentOnShell,
      profile,
      mealPlans,
      groceryLists,
      messages,
      login: (name: string) => {
        setAuthenticated(true);
        setProfile((current) => ({ ...current, name: name || current.name }));
        setProfileComplete(Boolean(name && name.length > 2));
        setShouldOpenAgentOnShell(Boolean(name && name.length > 2));
      },
      signup: (name: string) => {
        setAuthenticated(true);
        setProfile((current) => ({ ...current, name: name || current.name }));
        setProfileComplete(false);
        setShouldOpenAgentOnShell(false);
      },
      clearAgentShellPrompt: () => setShouldOpenAgentOnShell(false),
      logout: () => {
        setAuthenticated(false);
        setShouldOpenAgentOnShell(false);
      },
      saveProfile: (nextProfile: UserProfile) => {
        setProfile(nextProfile);
        setProfileComplete(true);
        setShouldOpenAgentOnShell(true);
      },
      createMealPlan: (name = "New agent meal plan") => {
        setMealPlans((plans) => [
          {
            id: `plan-${plans.length + 1}`,
            name,
            date: today,
            meals: [
              {
                id: `meal-${plans.length + 1}`,
                name: "Protein bowl",
                cuisine: profile.cuisines.split(",")[0] || "Custom",
                servings: 2,
                ingredients: ["Grain", "Protein", "Vegetables"],
                recipe: ["Prep base", "Cook protein", "Assemble bowls"]
              }
            ]
          },
          ...plans
        ]);
      },
      deleteMealPlan: (id: string) => {
        setMealPlans((plans) => plans.filter((plan) => plan.id !== id));
      },
      createGroceryList: ({ name, source, items = [] }) => {
        setGroceryLists((lists) => [
          {
            id: `grocery-${Date.now()}`,
            name,
            source,
            created: today,
            updated: today,
            items: items.map((nextItem, index) => ({
              ...nextItem,
              id: `item-${Date.now()}-${index + 1}`
            }))
          },
          ...lists
        ]);
      },
      updateGroceryList: (id: string, updates: Pick<GroceryList, "name" | "source">) => {
        setGroceryLists((lists) =>
          lists.map((list) =>
            list.id === id ? { ...list, ...updates, updated: today } : list
          )
        );
      },
      deleteGroceryList: (id: string) => {
        setGroceryLists((lists) => lists.filter((list) => list.id !== id));
      },
      addGroceryItem: (listId: string, item: Omit<GroceryItem, "id">) => {
        setGroceryLists((lists) =>
          lists.map((list) =>
            list.id === listId
              ? {
                  ...list,
                  updated: today,
                  items: [
                    ...list.items,
                    { ...item, id: `item-${list.items.length + 1}` }
                  ]
                }
              : list
          )
        );
      },
      sendAgentMessage: (content: string) => {
        const lowered = content.toLowerCase();
        const agentContent = lowered.includes("meal")
          ? "I drafted a meal plan using your proteins, cuisines, and current groceries."
          : lowered.includes("grocery")
            ? "Your grocery list has spinach and yogurt expiring soon. Add vegetables for two more dinners."
            : "I can help with meal plans, grocery lists, or profile changes.";

        setMessages((current) => [
          ...current,
          { id: `msg-${current.length + 1}`, role: "user", content },
          { id: `msg-${current.length + 2}`, role: "agent", content: agentContent }
        ]);

        if (lowered.includes("create") && lowered.includes("meal")) {
          setMealPlans((plans) => [
            {
              id: `plan-${plans.length + 1}`,
              name: "Agent generated plan",
              date: today,
              meals: [
                {
                  id: `meal-${plans.length + 1}`,
                  name: "Paneer rice bowl",
                  cuisine: "Indian",
                  servings: 2,
                  ingredients: ["Paneer", "Rice", "Spinach"],
                  recipe: ["Cook rice", "Sear paneer", "Assemble with greens"]
                }
              ]
            },
            ...plans
          ]);
        }
      }
    }),
    [
      groceryLists,
      isAuthenticated,
      mealPlans,
      messages,
      profile,
      profileComplete,
      shouldOpenAgentOnShell
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used inside AppProvider");
  }
  return context;
}
