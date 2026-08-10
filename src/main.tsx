import React from "react";
import ReactDOM from "react-dom/client";
import { App } from "./App";
import { AppProvider } from "./state/AppContext";
import { RouterProvider } from "./state/RouterContext";
import "./styles.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AppProvider>
      <RouterProvider>
        <App />
      </RouterProvider>
    </AppProvider>
  </React.StrictMode>
);
