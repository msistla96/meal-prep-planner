import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { App } from "./App";
import { renderWithProviders } from "./test/renderWithProviders";

async function login() {
  const user = userEvent.setup();
  await user.type(screen.getByLabelText("Name"), "Meena");
  await user.type(screen.getByLabelText("Password"), "password");
  await user.click(screen.getByRole("button", { name: /continue/i }));
  return user;
}

describe("Meal Prep Planner frontend", () => {
  it("starts at login and routes to the home dashboard", async () => {
    renderWithProviders(<App />, "/");

    expect(screen.getByRole("heading", { name: /sign in/i })).toBeInTheDocument();

    await login();

    expect(screen.getByRole("heading", { name: /welcome, meena/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /create meal plan/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /minimize agent chat/i })).toBeInTheDocument();
  });

  it("signs up a new user and starts profile setup", async () => {
    renderWithProviders(<App />, "/signup");
    const user = userEvent.setup();

    expect(screen.getByRole("heading", { name: /create account/i })).toBeInTheDocument();

    await user.type(screen.getByLabelText("Name"), "Priya");
    await user.type(screen.getByLabelText("Email"), "priya@example.com");
    await user.type(screen.getByLabelText("Password"), "password");
    await user.click(screen.getByRole("button", { name: /sign up/i }));

    expect(screen.getByRole("heading", { name: /user profile questionnaire/i })).toBeInTheDocument();
    expect(screen.getByDisplayValue("Priya")).toBeInTheDocument();
    expect(screen.queryByLabelText("Primary navigation")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Agent chat widget")).not.toBeInTheDocument();

    await user.clear(screen.getByLabelText("Gender"));
    expect(screen.getByRole("button", { name: /save profile/i })).toBeDisabled();
    await user.type(screen.getByLabelText("Gender"), "Female");
    expect(screen.getByRole("button", { name: /save profile/i })).toBeEnabled();

    await user.click(screen.getByRole("button", { name: /save profile/i }));
    expect(screen.getByRole("heading", { name: /welcome, priya/i })).toBeInTheDocument();
    expect(screen.getByLabelText("Agent chat widget")).toBeInTheDocument();
  });

  it("minimizes and reopens the bottom-right agent widget", async () => {
    renderWithProviders(<App />, "/login");
    const user = await login();

    await user.click(screen.getByRole("button", { name: /minimize agent chat/i }));
    expect(screen.getByRole("button", { name: /open agent chat/i })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /open agent chat/i }));
    expect(screen.getByLabelText("Agent chat widget")).toBeInTheDocument();
  });

  it("agent chat can create a meal plan from mock frontend state", async () => {
    renderWithProviders(<App />, "/login");
    const user = await login();

    await user.type(screen.getByLabelText("Agent message"), "check my groceries");
    await user.click(screen.getByRole("button", { name: /send message/i }));

    await user.click(screen.getByRole("link", { name: /agent chat/i }));
    expect(screen.queryByLabelText("Agent chat widget")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /open agent chat/i })).not.toBeInTheDocument();
    expect(screen.getByText(/check my groceries/i)).toBeInTheDocument();

    await user.type(screen.getByLabelText("Message agent"), "create a meal plan");
    const chatScreen = screen.getByLabelText("Chat screen");
    await user.click(within(chatScreen).getByRole("button", { name: /send/i }));

    expect(within(chatScreen).getByText(/i drafted a meal plan/i)).toBeInTheDocument();

    await user.click(screen.getByRole("link", { name: /meal plans/i }));
    expect(screen.getByText(/agent generated plan/i)).toBeInTheDocument();
  });

  it("opens grocery upload and manual list creation pages", async () => {
    renderWithProviders(<App />, "/login");
    const user = await login();

    await user.click(screen.getByRole("link", { name: /grocery lists/i }));
    expect(screen.queryByText("Pantry")).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: /create list/i })).toBeInTheDocument();
    expect(screen.getByText(/no grocery lists yet/i)).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /upload file/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /fill manually/i })).not.toBeInTheDocument();

    await user.click(screen.getByRole("link", { name: /create list/i }));
    expect(screen.getByRole("heading", { name: /create grocery list/i })).toBeInTheDocument();

    await user.click(screen.getByRole("link", { name: /upload file/i }));
    expect(screen.getByRole("heading", { name: /upload file/i })).toBeInTheDocument();

    await user.click(screen.getByRole("link", { name: /back to lists/i }));
    await user.click(screen.getByRole("link", { name: /create list/i }));
    await user.click(screen.getByRole("link", { name: /fill manually/i }));
    expect(screen.getByRole("heading", { name: /fill manually/i })).toBeInTheDocument();
    expect(screen.getByLabelText("List name")).toHaveValue("");

    await user.type(screen.getByLabelText("List name"), "Costco run");
    await user.type(screen.getByLabelText("name"), "Blueberries");
    await user.type(screen.getByLabelText("quantity"), "2 cartons");
    await user.click(screen.getByRole("button", { name: /create list/i }));

    expect(screen.getByRole("heading", { name: /grocery lists/i })).toBeInTheDocument();
    expect(screen.getByText("Name")).toBeInTheDocument();
    expect(screen.getByText("Source")).toBeInTheDocument();
    expect(screen.getByText("Created")).toBeInTheDocument();
    expect(screen.getByText("Updated")).toBeInTheDocument();
    expect(screen.getByText("Items")).toBeInTheDocument();
    expect(screen.getByText("Actions")).toBeInTheDocument();
    expect(screen.getByText("Costco run")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /edit list/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /delete list/i })).toBeInTheDocument();

    await user.click(screen.getByRole("link", { name: /edit list/i }));
    expect(screen.getByRole("heading", { name: /edit grocery list/i })).toBeInTheDocument();
    await user.clear(screen.getByLabelText("List name"));
    await user.type(screen.getByLabelText("List name"), "Market run");
    await user.click(screen.getByRole("button", { name: /save changes/i }));

    expect(screen.getByRole("heading", { name: /grocery lists/i })).toBeInTheDocument();
    expect(screen.getByText("Market run")).toBeInTheDocument();

    window.history.back();
    await screen.findByRole("heading", { name: /grocery lists/i });
    expect(screen.queryByRole("heading", { name: /fill manually/i })).not.toBeInTheDocument();
    await user.click(screen.getByRole("link", { name: /market run/i }));

    await user.click(screen.getByRole("button", { name: /delete list/i }));
    expect(screen.getByRole("heading", { name: /grocery lists/i })).toBeInTheDocument();
    expect(screen.queryByText("Market run")).not.toBeInTheDocument();
  });
});
