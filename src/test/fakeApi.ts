import { beforeEach, vi } from "vitest";

// Stands in for the Express server in tests: same /api contract, in-memory
// store, reset before every test. Login auto-creates the user on first use
// (mirrors the old mock frontend's behavior) so tests don't need a signup
// step before every login.
type Store = {
  users: Map<string, { profile: any; profileComplete: boolean }>;
  currentUser: string | null;
  mealPlans: any[];
  groceryLists: any[];
};

let store: Store;

function emptyProfile(name: string) {
  return {
    name,
    age: "",
    gender: "",
    lifestyle: "Semi active",
    allergies: "",
    cuisines: "",
    proteins: "",
    dietType: ""
  };
}

function json(body: unknown, status = 200) {
  return Promise.resolve(new Response(JSON.stringify(body), { status }));
}

function requireUser() {
  if (!store.currentUser) return null;
  return store.users.get(store.currentUser) ?? null;
}

async function handle(url: string, init: RequestInit) {
  const path = url.replace(/^.*\/api/, "");
  const method = (init.method ?? "GET").toUpperCase();
  const body = init.body ? JSON.parse(init.body as string) : {};

  if (path === "/auth/signup" && method === "POST") {
    if (store.users.has(body.name)) return json({ error: "That name is already taken" }, 409);
    store.users.set(body.name, { profile: emptyProfile(body.name), profileComplete: false });
    store.currentUser = body.name;
    return json({ profile: emptyProfile(body.name), profileComplete: false }, 201);
  }

  if (path === "/auth/login" && method === "POST") {
    if (!store.users.has(body.name)) {
      store.users.set(body.name, {
        profile: emptyProfile(body.name),
        profileComplete: Boolean(body.name && body.name.length > 2)
      });
    }
    store.currentUser = body.name;
    const user = store.users.get(body.name)!;
    return json({ profile: user.profile, profileComplete: user.profileComplete });
  }

  if (path === "/auth/logout" && method === "POST") {
    store.currentUser = null;
    return Promise.resolve(new Response(null, { status: 204 }));
  }

  const user = requireUser();
  if (!user) return json({ error: "Not authenticated" }, 401);

  if (path === "/profile" && method === "GET") {
    return json({ profile: user.profile, profileComplete: user.profileComplete });
  }
  if (path === "/profile" && method === "PUT") {
    user.profile = { ...body };
    user.profileComplete = true;
    return json({ profile: user.profile, profileComplete: true });
  }

  if (path === "/meal-plans" && method === "GET") {
    return json({ mealPlans: store.mealPlans });
  }
  if (path === "/meal-plans" && method === "POST") {
    const plan = {
      id: `plan-${store.mealPlans.length + 1}`,
      name: body.name,
      date: body.date,
      meals: (body.meals ?? []).map((meal: any, index: number) => ({
        id: `meal-${store.mealPlans.length + 1}-${index}`,
        ...meal
      }))
    };
    store.mealPlans = [plan, ...store.mealPlans];
    return json({ mealPlan: plan }, 201);
  }
  const mealPlanMatch = path.match(/^\/meal-plans\/([^/]+)$/);
  if (mealPlanMatch && method === "PATCH") {
    const plan = store.mealPlans.find((p) => p.id === mealPlanMatch[1]);
    Object.assign(plan, body);
    return json({ mealPlan: plan });
  }
  if (mealPlanMatch && method === "DELETE") {
    store.mealPlans = store.mealPlans.filter((p) => p.id !== mealPlanMatch[1]);
    return Promise.resolve(new Response(null, { status: 204 }));
  }

  if (path === "/grocery-lists" && method === "GET") {
    return json({ groceryLists: store.groceryLists });
  }
  if (path === "/grocery-lists" && method === "POST") {
    const today = new Date().toISOString().slice(0, 10);
    const list = {
      id: `grocery-${store.groceryLists.length + 1}`,
      name: body.name,
      source: body.source,
      created: today,
      updated: today,
      items: []
    };
    store.groceryLists = [list, ...store.groceryLists];
    return json({ groceryList: list }, 201);
  }
  const groceryListMatch = path.match(/^\/grocery-lists\/([^/]+)$/);
  if (groceryListMatch && method === "PATCH") {
    const list = store.groceryLists.find((l) => l.id === groceryListMatch[1]);
    Object.assign(list, body, { updated: new Date().toISOString().slice(0, 10) });
    return json({ groceryList: list });
  }
  if (groceryListMatch && method === "DELETE") {
    store.groceryLists = store.groceryLists.filter((l) => l.id !== groceryListMatch[1]);
    return Promise.resolve(new Response(null, { status: 204 }));
  }
  const itemsMatch = path.match(/^\/grocery-lists\/([^/]+)\/items$/);
  if (itemsMatch && method === "POST") {
    const list = store.groceryLists.find((l) => l.id === itemsMatch[1]);
    list.items.push({ id: `item-${list.items.length + 1}`, ...body });
    return json({ groceryList: list }, 201);
  }

  // Mirrors server/agent/providers/mockProvider.js's rules.
  if (path === "/agent" && method === "POST") {
    const content = (body.content ?? "").toLowerCase();
    if (content.includes("create") && content.includes("meal")) {
      const plan = {
        id: `plan-${store.mealPlans.length + 1}`,
        name: "Agent generated plan",
        date: new Date().toISOString().slice(0, 10),
        meals: [{ id: "meal-1", name: "Paneer rice bowl", cuisine: "Indian", servings: 2, ingredients: [], recipe: [] }]
      };
      store.mealPlans = [plan, ...store.mealPlans];
      return json({ reply: "I drafted a meal plan using your proteins, cuisines, and current groceries." });
    }
    if (content.includes("grocery")) {
      return json({
        reply: "Your grocery list has spinach and yogurt expiring soon. Add vegetables for two more dinners."
      });
    }
    return json({ reply: "I can help with meal plans, grocery lists, or profile changes." });
  }

  return json({ error: `No fake handler for ${method} ${path}` }, 404);
}

beforeEach(() => {
  store = { users: new Map(), currentUser: null, mealPlans: [], groceryLists: [] };
  vi.stubGlobal("fetch", (url: string, init: RequestInit = {}) => handle(url, init));
});
