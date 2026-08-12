export type UserProfile = {
  name: string;
  age: string;
  gender: string;
  lifestyle: "Active" | "Sedentary" | "Semi active";
  allergies: string;
  cuisines: string;
  proteins: string;
  dietType: string;
};

export type Meal = {
  id: string;
  name: string;
  cuisine: string;
  servings: number;
  ingredients: string[];
  recipe: string[];
};

export type MealPlan = {
  id: string;
  name: string;
  date: string;
  meals: Meal[];
};

export type GroceryItem = {
  id: string;
  name: string;
  quantity: string;
  type: string;
  expiryDate: string;
  purchaseDate: string;
};

export type GroceryList = {
  id: string;
  name: string;
  source: "Manual" | "PDF" | "Image" | "Text";
  created: string;
  updated: string;
  items: GroceryItem[];
};

export type ChatMessage = {
  id: string;
  role: "agent" | "user";
  content: string;
};
