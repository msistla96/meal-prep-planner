import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState
} from "react";
import { api, ApiError } from "./api";
import { initialMessages } from "../data/mockData";
import type {
  ChatMessage,
  GroceryItem,
  GroceryList,
  MealPlan,
  UserProfile
} from "../types";

const emptyProfile: UserProfile = {
  name: "",
  age: "",
  gender: "",
  lifestyle: "Semi active",
  allergies: "",
  cuisines: "",
  proteins: "",
  dietType: ""
};

type AppState = {
  isLoading: boolean;
  isAuthenticated: boolean;
  profileComplete: boolean;
  shouldOpenAgentOnShell: boolean;
  authError: string | null;
  profile: UserProfile;
  mealPlans: MealPlan[];
  groceryLists: GroceryList[];
  messages: ChatMessage[];
  login: (name: string, password: string) => Promise<boolean>;
  signup: (name: string, password: string) => Promise<boolean>;
  clearAgentShellPrompt: () => void;
  logout: () => void;
  saveProfile: (profile: UserProfile) => Promise<void>;
  createMealPlan: (name?: string) => Promise<void>;
  updateMealPlan: (id: string, updates: Partial<Pick<MealPlan, "name" | "date" | "meals">>) => Promise<void>;
  deleteMealPlan: (id: string) => Promise<void>;
  createGroceryList: (list: Pick<GroceryList, "name" | "source">) => Promise<string>;
  updateGroceryList: (id: string, updates: Pick<GroceryList, "name" | "source">) => Promise<void>;
  deleteGroceryList: (id: string) => Promise<void>;
  addGroceryItem: (listId: string, item: Omit<GroceryItem, "id">) => Promise<void>;
  sendAgentMessage: (content: string) => Promise<void>;
};

const AppContext = createContext<AppState | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setAuthenticated] = useState(false);
  const [profileComplete, setProfileComplete] = useState(false);
  const [shouldOpenAgentOnShell, setShouldOpenAgentOnShell] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [profile, setProfile] = useState<UserProfile>(emptyProfile);
  const [mealPlans, setMealPlans] = useState<MealPlan[]>([]);
  const [groceryLists, setGroceryLists] = useState<GroceryList[]>([]);
  const [messages, setMessages] = useState(initialMessages);

  async function loadAppData() {
    const [plans, lists] = await Promise.all([
      api<{ mealPlans: MealPlan[] }>("/meal-plans"),
      api<{ groceryLists: GroceryList[] }>("/grocery-lists")
    ]);
    setMealPlans(plans.mealPlans);
    setGroceryLists(lists.groceryLists);
  }

  // Restore an existing session cookie on first load.
  useEffect(() => {
    api<{ profile: UserProfile; profileComplete: boolean }>("/profile")
      .then(async (data) => {
        setAuthenticated(true);
        setProfile(data.profile);
        setProfileComplete(data.profileComplete);
        await loadAppData();
      })
      .catch(() => setAuthenticated(false))
      .finally(() => setIsLoading(false));
  }, []);

  async function login(name: string, password: string) {
    setAuthError(null);
    try {
      const data = await api<{ profile: UserProfile; profileComplete: boolean }>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ name, password })
      });
      setAuthenticated(true);
      setProfile(data.profile);
      setProfileComplete(data.profileComplete);
      setShouldOpenAgentOnShell(data.profileComplete);
      await loadAppData();
      return true;
    } catch (error) {
      setAuthError(error instanceof ApiError ? error.message : "Login failed");
      return false;
    }
  }

  async function signup(name: string, password: string) {
    setAuthError(null);
    try {
      const data = await api<{ profile: UserProfile; profileComplete: boolean }>("/auth/signup", {
        method: "POST",
        body: JSON.stringify({ name, password })
      });
      setAuthenticated(true);
      setProfile(data.profile);
      setProfileComplete(data.profileComplete);
      setShouldOpenAgentOnShell(false);
      await loadAppData();
      return true;
    } catch (error) {
      setAuthError(error instanceof ApiError ? error.message : "Signup failed");
      return false;
    }
  }

  function logout() {
    api("/auth/logout", { method: "POST" }).finally(() => {
      setAuthenticated(false);
      setShouldOpenAgentOnShell(false);
      setProfile(emptyProfile);
      setMealPlans([]);
      setGroceryLists([]);
    });
  }

  async function saveProfile(nextProfile: UserProfile) {
    const data = await api<{ profile: UserProfile; profileComplete: boolean }>("/profile", {
      method: "PUT",
      body: JSON.stringify(nextProfile)
    });
    setProfile(data.profile);
    setProfileComplete(data.profileComplete);
    setShouldOpenAgentOnShell(true);
  }

  async function createMealPlan(name = "New agent meal plan") {
    const data = await api<{ mealPlan: MealPlan }>("/meal-plans", {
      method: "POST",
      body: JSON.stringify({
        name,
        date: new Date().toISOString().slice(0, 10),
        meals: [
          {
            name: "Protein bowl",
            cuisine: profile.cuisines.split(",")[0] || "Custom",
            servings: 2,
            ingredients: ["Grain", "Protein", "Vegetables"],
            recipe: ["Prep base", "Cook protein", "Assemble bowls"]
          }
        ]
      })
    });
    setMealPlans((plans) => [data.mealPlan, ...plans]);
  }

  async function updateMealPlan(id: string, updates: Partial<Pick<MealPlan, "name" | "date" | "meals">>) {
    const data = await api<{ mealPlan: MealPlan }>(`/meal-plans/${id}`, {
      method: "PATCH",
      body: JSON.stringify(updates)
    });
    setMealPlans((plans) => plans.map((plan) => (plan.id === id ? data.mealPlan : plan)));
  }

  async function deleteMealPlan(id: string) {
    await api(`/meal-plans/${id}`, { method: "DELETE" });
    setMealPlans((plans) => plans.filter((plan) => plan.id !== id));
  }

  async function createGroceryList({ name, source }: Pick<GroceryList, "name" | "source">) {
    const data = await api<{ groceryList: GroceryList }>("/grocery-lists", {
      method: "POST",
      body: JSON.stringify({ name, source })
    });
    setGroceryLists((lists) => [data.groceryList, ...lists]);
    return data.groceryList.id;
  }

  async function updateGroceryList(id: string, updates: Pick<GroceryList, "name" | "source">) {
    const data = await api<{ groceryList: GroceryList }>(`/grocery-lists/${id}`, {
      method: "PATCH",
      body: JSON.stringify(updates)
    });
    setGroceryLists((lists) => lists.map((list) => (list.id === id ? data.groceryList : list)));
  }

  async function deleteGroceryList(id: string) {
    await api(`/grocery-lists/${id}`, { method: "DELETE" });
    setGroceryLists((lists) => lists.filter((list) => list.id !== id));
  }

  async function addGroceryItem(listId: string, item: Omit<GroceryItem, "id">) {
    const data = await api<{ groceryList: GroceryList }>(`/grocery-lists/${listId}/items`, {
      method: "POST",
      body: JSON.stringify(item)
    });
    setGroceryLists((lists) => lists.map((list) => (list.id === listId ? data.groceryList : list)));
  }

  async function sendAgentMessage(content: string) {
    setMessages((current) => [...current, { id: `msg-${current.length + 1}`, role: "user", content }]);

    try {
      const data = await api<{ reply: string }>("/agent", {
        method: "POST",
        body: JSON.stringify({ content })
      });
      setMessages((current) => [...current, { id: `msg-${current.length + 1}`, role: "agent", content: data.reply }]);
      // The agent may have created/edited/deleted meal plans, grocery lists,
      // or the profile as tool calls — refetch rather than guessing the diff.
      await Promise.all([loadAppData(), api<{ profile: UserProfile; profileComplete: boolean }>("/profile").then((data) => {
        setProfile(data.profile);
        setProfileComplete(data.profileComplete);
      })]);
    } catch (error) {
      const message = error instanceof ApiError ? error.message : "The agent didn't respond in time.";
      setMessages((current) => [...current, { id: `msg-${current.length + 1}`, role: "agent", content: message }]);
    }
  }

  const value = useMemo<AppState>(
    () => ({
      isLoading,
      isAuthenticated,
      profileComplete,
      shouldOpenAgentOnShell,
      authError,
      profile,
      mealPlans,
      groceryLists,
      messages,
      login,
      signup,
      clearAgentShellPrompt: () => setShouldOpenAgentOnShell(false),
      logout,
      saveProfile,
      createMealPlan,
      updateMealPlan,
      deleteMealPlan,
      createGroceryList,
      updateGroceryList,
      deleteGroceryList,
      addGroceryItem,
      sendAgentMessage
    }),
    [
      isLoading,
      isAuthenticated,
      authError,
      groceryLists,
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
