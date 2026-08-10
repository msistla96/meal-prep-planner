import { render } from "@testing-library/react";
import type { ReactElement } from "react";
import { AppProvider } from "../state/AppContext";
import { RouterProvider } from "../state/RouterContext";

export function renderWithProviders(ui: ReactElement, route = "/") {
  window.history.pushState({}, "", route);
  return render(
    <AppProvider>
      <RouterProvider>{ui}</RouterProvider>
    </AppProvider>
  );
}
