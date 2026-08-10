import { AppShell } from "./components/AppShell";
import { AgentPage } from "./pages/AgentPage";
import { GroceryListPage } from "./pages/GroceryListPage";
import { GroceryCreatePage } from "./pages/GroceryCreatePage";
import { GroceryEditPage } from "./pages/GroceryEditPage";
import { GroceryItemCreatePage } from "./pages/GroceryItemCreatePage";
import { GroceryListDetailPage } from "./pages/GroceryListDetailPage";
import { GroceryManualPage } from "./pages/GroceryManualPage";
import { GroceryUploadPage } from "./pages/GroceryUploadPage";
import { HomePage } from "./pages/HomePage";
import { LoginPage } from "./pages/LoginPage";
import { MealPlanPage } from "./pages/MealPlanPage";
import { ProfilePage } from "./pages/ProfilePage";
import { SettingsPage } from "./pages/SettingsPage";
import { SignupPage } from "./pages/SignupPage";
import { useApp } from "./state/AppContext";
import { useRouter } from "./state/RouterContext";

export function App() {
  const { isAuthenticated, profileComplete } = useApp();
  const { path } = useRouter();

  if (!isAuthenticated) return path === "/signup" ? <SignupPage /> : <LoginPage />;
  if (!profileComplete) return <ProfilePage standalone />;

  const page =
    path === "/agent" ? (
      <AgentPage />
    ) : path === "/profile" ? (
      <ProfilePage />
    ) : path === "/grocery-lists/upload" ? (
      <GroceryUploadPage />
    ) : path === "/grocery-lists/manual" ? (
      <GroceryManualPage />
    ) : path === "/grocery-lists/create" ? (
      <GroceryCreatePage />
    ) : path.startsWith("/grocery-lists/") && path.endsWith("/edit") ? (
      <GroceryEditPage />
    ) : path.startsWith("/grocery-lists/") && path.endsWith("/items/new") ? (
      <GroceryItemCreatePage />
    ) : path === "/meal-plans" ? (
      <MealPlanPage />
    ) : path === "/grocery-lists" ? (
      <GroceryListPage />
    ) : path.startsWith("/grocery-lists/") ? (
      <GroceryListDetailPage />
    ) : path === "/settings" ? (
      <SettingsPage />
    ) : (
      <HomePage />
    );

  return <AppShell>{page}</AppShell>;
}
