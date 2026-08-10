import type { ChatMessage, GroceryList, MealPlan, UserProfile } from "../types";

export const initialProfile: UserProfile = {
  name: "Meena",
  age: "32",
  gender: "Female",
  lifestyle: "Semi active",
  allergies: "Peanuts",
  cuisines: "Indian, Mediterranean, Asian",
  proteins: "Paneer, lentils, chicken",
  dietType: "High protein"
};

export const initialMealPlans: MealPlan[] = [
  {
    id: "plan-1",
    name: "Balanced weekday prep",
    date: "2026-08-02",
    meals: [
      {
        id: "meal-1",
        name: "Masala oats bowl",
        cuisine: "Indian",
        servings: 2,
        ingredients: ["Oats", "Peas", "Carrots", "Yogurt"],
        recipe: ["Toast spices", "Simmer oats", "Top with yogurt"]
      },
      {
        id: "meal-2",
        name: "Lentil quinoa salad",
        cuisine: "Mediterranean",
        servings: 3,
        ingredients: ["Lentils", "Quinoa", "Cucumber", "Feta"],
        recipe: ["Cook grains", "Toss vegetables", "Add dressing"]
      }
    ]
  },
  {
    id: "plan-2",
    name: "Sunday freezer batch",
    date: "2026-08-04",
    meals: [
      {
        id: "meal-3",
        name: "Coconut chickpea curry",
        cuisine: "Indian",
        servings: 4,
        ingredients: ["Chickpeas", "Coconut milk", "Spinach"],
        recipe: ["Saute aromatics", "Simmer curry", "Portion with rice"]
      }
    ]
  }
];

export const initialGroceryLists: GroceryList[] = [];

export const initialMessages: ChatMessage[] = [
  {
    id: "msg-1",
    role: "agent",
    content: "Hi Meena. I can create meal plans, update grocery lists, or adjust your profile."
  }
];
