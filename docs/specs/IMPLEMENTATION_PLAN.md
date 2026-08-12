# Implementation plan: scaffold meal-prep-planner

## Context
The repo currently has only docs (`docs/architecture/SPECS.md`, a component diagram, sketches) — no frontend, no backend, no code. `docs/architecture/SPECS.md` was just filled in with all the missing implementation-section detail (data models, APIs, agent runtime, routing) and is now the source of truth. This plan scaffolds the actual application described there, so the user has a working local dev setup: login → onboarding → home → meal plans / grocery lists / agent chat / settings.

Confirmed tech decisions (agreed with user, not to be re-litigated):
- **Frontend**: React + TypeScript (Vite)
- **Backend**: Node.js + Express + TypeScript — chosen to pair with the React/TS frontend (shared language/types)
- **Database**: Postgres
- **Agent/LLM**: provider-agnostic — build the seam now, wire in a real LLM later. Use a `MockAgentProvider` for v1 so the whole chat flow works end-to-end without needing an API key yet.
- Simple two-folder monorepo (`client/`, `server/`) using npm workspaces — no heavier tool (Turborepo/Nx) needed for a first project.

## Directory structure
```
meal-prep-planner/
  client/                 React + TS (Vite)
    src/
      pages/              Home, Login, Onboarding, UserProfile, MealPlan, GroceryList, Settings
      components/         Calendar, MealCard, GroceryItemRow, AgentChat/{ChatWindow,ChatHistory,MessageInput}
      api/                auth.ts, mealPlans.ts, groceryLists.ts, profile.ts, agent.ts (axios wrapper)
      context/            AuthContext
      routes.tsx, App.tsx, main.tsx
  server/                 Express + TS
    src/
      db/                 index.ts (Postgres client + Drizzle instance), schema.ts, migrations/, seeds/
      services/           authService, userProfileService, mealPlanService, groceryListService
      routes/             auth.ts, userProfile.ts, mealPlans.ts, groceryLists.ts, agent.ts
      agent/
        AgentProvider.ts  interface
        providers/MockAgentProvider.ts
        tools/            toolDefinitions.ts, toolHandlers.ts (call the same services/* as REST routes)
      middleware/         auth.ts (JWT verify), errorHandler.ts
      app.ts, index.ts
    drizzle.config.ts
  docker-compose.yml       Postgres only
  .env.example, client/.env.example
  package.json             root, npm workspaces ["client","server"]
```

## Backend
- Packages: `express`, `typescript`, `ts-node-dev`, `cors`, `dotenv`, `zod`, `bcrypt`, `jsonwebtoken`, `pg`, `drizzle-orm`, `drizzle-kit` (dev dependency, generates/runs migrations from the schema).
- **DB layer: Drizzle** (TypeScript-native schema + lightweight query builder) — schema is defined directly in TypeScript (`server/src/db/schema.ts`), no separate DSL/codegen file like Prisma, and `drizzle-kit` generates SQL migrations from that schema automatically. Lighter than Prisma, more type-safe and less manual SQL than Knex, and the current trending choice for Node+Postgres+TypeScript stacks.
- **Schema/migrations** (tables defined in `server/src/db/schema.ts`, one per SPECS.md data model; `drizzle-kit generate` produces the SQL migration files in `server/src/db/migrations/`):
  1. `users` (id, name, age, gender, timestamps)
  2. `credentials` (id, user_id fk, username unique, password_hash, timestamps)
  3. `lifestyles` (id, user_id fk, type enum: active/sedentary/semi_active)
  4. `diet_preferences` (id, user_id fk, diet_type enum) + lookup tables `allergies(id,name,category)`, `proteins(id,name,category)`, `cuisines(id,name)` + join tables `diet_preference_allergies`, `diet_preference_proteins`, `diet_preference_cuisines`
  5. `macros` (id, diet_preference_id fk 1:1, protein, fats, carbs, vitamins, fiber)
  6. `meal_plans` (id, user_id fk, name, plan_date, timestamps)
  7. `meals` (id, meal_plan_id fk, name, cuisine, servings, recipe, photos jsonb)
  8. `meal_ingredients` (id, meal_id fk, name, quantity)
  9. `grocery_lists` (id, user_id fk, name, source enum: manual/pdf/image/txt, timestamps)
  10. `grocery_items` (id, grocery_list_id fk, name, type, quantity, expiry_date, purchase_date)
- **Auth**: `credentials` table with bcrypt password hash; login issues a JWT (`userId` payload, `JWT_SECRET` env, ~7d expiry) sent as `Authorization: Bearer`. No password reset/rate limiting/refresh tokens for v1 — call this out as a known simplification, matching the spec's "keep it simple."
- **Routes** (thin — validate with zod, call service layer):
  - `POST /api/auth/register`, `POST /api/auth/login`
  - `GET /api/profile`, `PATCH /api/profile`
  - `POST/GET/PATCH/DELETE /api/meal-plans[/:id]` (GET supports `?view=day|week|month&date=`)
  - `POST/GET/PATCH/DELETE /api/grocery-lists[/:id]` (file upload via `multer`, stored but content-parsing deferred — user fills items manually for v1)
  - `POST /api/agent/chat`

## Agent runtime seam
- `AgentProvider` interface: `chat({messages, tools}) -> {message, toolCalls?}`.
- `tools/toolDefinitions.ts`: one tool per SPECS.md Agent function — create/edit/delete(confirm)/cancel/view meal plan, create/edit/delete(confirm)/view grocery list, edit user profile, plus read-only Q&A (groceries remaining, meals eaten on date).
- `tools/toolHandlers.ts`: maps each tool → the **same service functions** used by REST routes — no duplicated business logic.
- `providers/MockAgentProvider.ts`: deterministic keyword-based stub for local dev, selected via `AGENT_PROVIDER=mock` env var through a small factory — swapping in a real LLM later means adding one new provider file, no other changes.
- Delete confirmation: tool call returns "needs confirmation"; frontend prompts the user; a follow-up confirms before the service actually deletes.

## Frontend
- Packages: `react`, `react-dom`, `react-router-dom`, `vite`, `@vitejs/plugin-react`, `axios`. Build calendar as a simple custom month-grid component rather than adding a dependency.
- Routes: `/login`, `/onboarding` (new users), `/` (Home — welcome + quick actions for new users; stats + today's plan link for existing users), `/profile`, `/meal-plans` (day/week/month toggle, calendar with dot indicators, create/edit/delete/view), `/grocery-lists` and `/grocery-lists/:id`, `/settings`.
- Agent chat: persistent component (not a route) mounted on Home per the component diagram, with `ChatWindow`/`ChatHistory`/`MessageInput` subcomponents.
- `AuthContext`: holds JWT + user id (persisted to localStorage), `login`/`logout`/`register`; route guard redirects unauthenticated → `/login`, incomplete-profile → `/onboarding`.
- `api/` layer: one module per resource wrapping an axios instance (`VITE_API_URL` env, auth header interceptor).

## Local dev setup
- `docker-compose.yml`: single `postgres:16` service (app code stays native, not containerized yet).
- `.env.example` (server): `DATABASE_URL`, `JWT_SECRET`, `AGENT_PROVIDER=mock`, `PORT=4000`. `client/.env.example`: `VITE_API_URL=http://localhost:4000/api`.
- Root scripts: `dev` (concurrently runs client+server), `db:up` (docker compose up -d), `db:generate` (`drizzle-kit generate` — creates migration SQL from `schema.ts`), `db:migrate` (`drizzle-kit migrate` — applies pending migrations).

## Build order
1. Scaffolding: root workspaces, Vite client skeleton, Express server skeleton (`/health`), docker-compose, env examples.
2. DB schema (`schema.ts`) + generated migrations, run against local Postgres, sanity-check with a seed/manual query.
3. Backend core CRUD: auth, profile, meal plans, grocery lists (no agent yet).
4. Frontend shell: routing, AuthContext, Login, Onboarding, Home skeleton wired to real backend.
5. Meal Plan UI (calendar, toggle, CRUD forms).
6. Grocery List UI (list + item CRUD, upload accepted but manual item entry for v1).
7. Settings page.
8. Agent chat: AgentProvider interface + tools/handlers wired to existing services, MockAgentProvider, chat UI — full round trip without needing a real LLM key.

## Explicitly not building now
Mobile app; phone/social-media data integration; fridge/cupboard/grocery-store awareness; real LLM provider wiring (mock only); grocery file content-parsing/OCR; agent sandboxing (runs in-process for now); monitoring/evals/ops metrics; AWS deployment; password reset/rate limiting/refresh tokens.

## Verification
- `npm install` at root wires both workspaces.
- `docker compose up -d && npm run db:migrate` brings up Postgres with all tables created.
- `npm run dev` starts client + server; manually walk the golden path in the browser: register → onboarding → Home → create a meal plan → create a grocery list → open agent chat and confirm a mock tool-call round trip (e.g. "create a meal plan") → log out.
- Spot-check a few REST endpoints directly (curl/Postman) for auth-required 401s and basic CRUD correctness.
