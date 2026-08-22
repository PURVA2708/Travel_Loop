# GlobeTrotter — Person B Work Log (Trip Core & Itinerary)

**Date:** 2026-08-22
**Scope:** Full implementation of the "Trip Core & Itinerary" vertical per `GlobeTrotter_Architecture_Roadmap_v2.md` Section 7 — Person B owns Screens #3, #4, #5, #6 and the `trips` / `trip_stops` / `trip_activities` tables end-to-end (DB + API + UI).

---

## 1. Starting Context

Before writing any code, the existing repo state was checked (not assumed):

- Repo: `github.com/PURVA2708/Travel_Loop`, working on branch `tirth.main`.
- Teammate work already existed on `origin/main` (merged in via PR from `Frontend_Deveops` branch): `Backend/package.json`, `Backend/prisma/schema.prisma`, `Backend/src/lib/prisma.ts`, `Backend/tsconfig.json`.
- That `schema.prisma` already matched the ERD in the roadmap almost exactly, with `// Person C: Tables Owned` comments marking `TripExpense`, `ShareLink`, `TripCollaborator` — confirming the team is building directly off the roadmap doc.
- **Action taken:** fast-forward merged `origin/main` into `tirth.main` (clean, no conflicts) before adding anything, so Person B's work sits on top of the shared schema instead of duplicating it.
- Found `Backend/` and `Frontend/` were the team's actual top-level folder convention (not the `apps/web` / `apps/api` monorepo layout originally sketched in the roadmap) — built everything to match what the team already committed to.
- Found no `.gitignore` anywhere in the repo — added one at the root before installing any dependencies, to stop `node_modules` and `.env` from ever getting staged.
- Postgres 18 is installed and running locally, but the superuser password was unknown/forgotten — database migration is the one step still pending on the user's side (see Section 5).

---

## 2. Backend — `Backend/`

### 2.1 Added to `package.json`
- New deps: `bcryptjs`, `jsonwebtoken`, `express-rate-limit`
- New dev deps: `@types/bcryptjs`, `@types/jsonwebtoken`
- New scripts: `prisma:generate`, `prisma:migrate`, `prisma:seed`, `prisma:studio`
- `"prisma": { "seed": "tsx prisma/seed.ts" }` block so `prisma migrate` auto-seeds

### 2.2 Core infrastructure (`src/lib/`, `src/middleware/`)
| File | Purpose |
|---|---|
| `lib/env.ts` | Typed, validated env var loader (fails fast on missing secrets) |
| `lib/jwt.ts` | Sign/verify access & refresh JWTs |
| `lib/asyncHandler.ts` | Wraps async route handlers so thrown errors reach Express's error middleware |
| `lib/ApiError.ts` | Typed HTTP error class (`badRequest`, `unauthorized`, `forbidden`, `notFound`, `conflict`) |
| `middleware/errorHandler.ts` | Central error handler — maps `ApiError`, `ZodError`, and known Prisma errors (P2025/P2002) to clean JSON responses |
| `middleware/auth.middleware.ts` | `requireAuth` (JWT bearer guard) + `requireAdmin`, shared by every module |
| `src/app.ts` | Express app wiring: CORS, JSON body parsing, `/health`, mounts `/api/v1/*` routers, 404 + error handler |
| `src/server.ts` | Entry point, starts the HTTP server |

### 2.3 `trips` module — full ownership (`src/modules/trips/`)
- `trips.schema.ts` — Zod validation for every input (create/update trip, create/update stop, reorder stops, add/update trip-activity, reorder activities), including date-range refinements (`endDate >= startDate`, etc.)
- `trips.service.ts` — business logic:
  - Ownership guard (`assertTripOwnership`) on every operation — 404 if the trip doesn't exist, 403 if it belongs to someone else
  - Full CRUD for trips, stops, and trip-activities
  - **Transactional reordering** for both stops and activities (`prisma.$transaction`) so a drag-and-drop never leaves duplicate/gapped `orderIndex` values on partial failure
  - `getItinerary()` — computes the day-grouped view consumed by Screen #6, including a running `totalActivityCost`
- `trips.controller.ts` / `trips.routes.ts` — REST endpoints exactly matching the roadmap's Section 4 API design:
  ```
  GET/POST     /api/v1/trips
  GET/PATCH/DELETE /api/v1/trips/:id
  GET          /api/v1/trips/:id/itinerary
  POST         /api/v1/trips/:id/stops
  PATCH        /api/v1/trips/:id/stops/reorder
  PATCH/DELETE /api/v1/trips/:id/stops/:stopId
  POST         /api/v1/trips/:id/stops/:stopId/activities
  PATCH        /api/v1/trips/:id/stops/:stopId/activities/reorder
  PATCH/DELETE /api/v1/trips/:id/stops/:stopId/activities/:activityId
  ```

### 2.4 Minimal scaffolds for other people's modules (unblocking only)
Built just enough to make Person B's vertical testable end-to-end — each file has a comment marking it as a scaffold for the actual owner to expand:
- `src/modules/auth/` — signup, login, `GET /me` (bcrypt + JWT). **Person A's real domain** (forgot password, validation polish, etc. still to come).
- `src/modules/cities/` — `GET /cities` (search/filter/sort), `GET /cities/:id`. **Person A's real domain** (Screen #7).
- `src/modules/activities/` — `GET /activities` (filter by city/category/cost/duration), `GET /activities/:id`. **Person A's real domain** (Screen #8).

### 2.5 Seed data (`prisma/seed.ts`)
- 1 demo user: `demo@globetrotter.app` / `password123`
- 15 cities (Mumbai, Goa, Jaipur, Kerala Backwaters, Manali, Udaipur, Rishikesh, Bangkok, Bali, Dubai, Paris, Rome, Tokyo, Singapore, London)
- ~3–4 activities per city across all 5 categories (sightseeing/food/adventure/culture/nightlife)

### 2.6 Verification
- `npm install` completed (had to run `npm approve-scripts --all` once — this repo's npm enforces an install-script allowlist; approved only `prisma`, `@prisma/client`, `@prisma/engines`, `esbuild`, all legitimate build-time scripts)
- `npx prisma generate` — succeeded
- `npx tsc --noEmit` — **clean, zero errors**

---

## 3. Frontend — `Frontend/`

### 3.1 Project setup
- Replaced the placeholder `index.html` with a real Vite entry point (Google Fonts: Inter + Sora)
- `package.json`, `tsconfig.json`, `vite.config.ts` (with `@/*` path alias), `tailwind.config.ts`, `postcss.config.js`
- `tailwind.config.ts` encodes the **exact TripAdvisor-inspired tokens** from the roadmap Section 5.4: `brand` (`#00EB5B`), `ink` (`#002B11`), `surface`/`surface-white`, `night`, plus `success`/`warning`/`danger`/`info`, and the `2xl` card radius / pill radius from Section 5.6

### 3.2 Shared infrastructure
| File | Purpose |
|---|---|
| `lib/api.ts` | Axios instance, attaches JWT from the auth store, auto-logout on 401 |
| `lib/queryClient.ts` | TanStack Query client config |
| `lib/money.ts` | INR currency formatting for cost displays |
| `lib/cn.ts` | Tailwind class-merge helper |
| `store/authStore.ts` | Zustand store, persisted to localStorage (access token + user) |
| `types/index.ts` | TS types mirroring the Prisma schema exactly (Decimal fields typed `string`, matching how Prisma serializes them over JSON) |

### 3.3 Shared UI kit (`components/ui/`)
`Button` (5 variants incl. the TripAdvisor dark-text-on-green primary style), `Input`/`Textarea`, `Card`, `Modal` (full-screen sheet on mobile → centered dialog on desktop, per Section 5.2), `PageContainer`, `Spinner`/`PageSpinner`, `EmptyState`.

### 3.4 Layout (`components/layout/`)
- `AppShell.tsx` — sticky top navbar (desktop nav links + "Plan New Trip" pill, TripAdvisor pattern) **and** a bottom tab bar that only shows below `lg:` breakpoint (mobile/tablet), per the roadmap's responsive nav spec
- `RequireAuth.tsx` — route guard, redirects to `/login` if no token

### 3.5 Person B's screens — fully built (`features/trips/`, `pages/trips/`)
- `features/trips/api.ts` — typed API client functions for every trips endpoint
- `features/trips/hooks.ts` — TanStack Query hooks (`useTrips`, `useTrip`, `useItinerary`, `useCreateTrip`, `useAddStop`, `useReorderStops`, `useAddTripActivity`, `useReorderActivities`, etc.), all with correct cache invalidation
- `features/trips/components/`:
  - `TripCard.tsx` — used on My Trips + Dashboard
  - `CityPickerModal.tsx`, `ActivityPickerModal.tsx` — search/filter pickers calling the (scaffolded) cities/activities APIs
  - `SortableItem.tsx` — generic `@dnd-kit` drag wrapper
  - `StopEditor.tsx` — the detail panel: editable arrival/departure dates, drag-to-reorder activity list **plus** ▲▼ button fallback (the roadmap explicitly calls for both, since drag is fiddly on touch), add/remove activities
- `pages/trips/CreateTripPage.tsx` — **Screen #3**
- `pages/trips/MyTripsPage.tsx` — **Screen #4**
- `pages/trips/ItineraryBuilderPage.tsx` — **Screen #5**, the hardest piece: two-pane layout (sortable stop list + detail panel) on `lg:`+, single-column stacked with inline expansion on mobile, exactly matching Section 5.3's spec
- `pages/trips/ItineraryViewPage.tsx` — **Screen #6**, day-by-day vertical timeline grouped by city stop, with per-day activity cards and cost

### 3.6 Minimal scaffolds (unblocking only)
- `pages/auth/LoginPage.tsx`, `SignupPage.tsx` — plain forms wired to the real auth API, pre-filled with the demo login. **Person A's real domain** (Screen #1).
- `pages/DashboardPage.tsx` — hero + recent trips list reusing `TripCard`. **Person A's real domain** (Screen #2).
- `pages/NotFoundPage.tsx`

### 3.7 Verification
- `npm install` (same install-script approval step as backend, for `esbuild`)
- `npx tsc --noEmit` — **clean, zero errors** (iterated through a few real config issues: `vite.config.ts` needed `@types/node` + an `import.meta.url` alias instead of `__dirname`; dropped an unnecessary `tsc -b` project-references setup that was tripping TS6310)
- Started the Vite dev server (`localhost:5173`) and opened `/login` in a real browser via Chrome automation — confirmed the page **actually renders correctly**: brand-green pill button, correct fonts (Inter/Sora), rounded card, no console errors

---

## 4. Repo Hygiene

- **Added root `.gitignore`** (none existed before) — excludes `node_modules/`, `.env*`, `dist/`, `.vite/`, build artifacts. This was checked *before* any `npm install`, so nothing large or secret ever touched git status.
- Updated root `README.md` (previously just the repo name) with local setup steps for both `Backend/` and `Frontend/`, and a summary of the 3-person work split.
- **Nothing has been committed or pushed** — all work is in the working tree only, per instruction to never commit without being explicitly asked.

---

## 5. What's Blocked / Not Done Yet

| Item | Status | Blocker |
|---|---|---|
| `prisma migrate dev` (create actual DB tables) | ⛔ Not run | Local Postgres superuser password was forgotten by the user; needs either a local password reset or a Neon/Supabase cloud connection string |
| `prisma:seed` | ⛔ Not run | Same — depends on migration first |
| End-to-end test (signup → create trip → add stop → add activity → view itinerary) | ⛔ Not run | Same — needs a live DB |
| Person A's screens (real Login/Signup polish, Dashboard content, City/Activity Search UI) | Not started | Out of scope for Person B — stubs exist only to unblock Trips testing |
| Person C's screens (Budget breakdown, Calendar, Public sharing, Admin) | Not started | Out of scope for Person B — `TripExpense`/`ShareLink`/`TripCollaborator` tables already exist in schema, ready for Person C |
| Cloudinary image upload for trip cover photos | Not implemented | `coverPhotoUrl` currently accepts a plain URL string only (no file upload widget) |

**Next step once a `DATABASE_URL` is available:** run `prisma migrate dev` + `prisma:seed` in `Backend/`, then walk through the full Create Trip → Itinerary Builder → Itinerary View flow in the browser to verify the real (not just type-checked) behavior.

---

## 6. Full List of New/Changed Files

```
.gitignore                                          [new]
README.md                                           [updated]

Backend/
├── .env.example                                    [new]
├── package.json                                    [updated — added jwt/bcrypt/rate-limit deps]
├── prisma/seed.ts                                  [new]
└── src/
    ├── app.ts                                      [new]
    ├── server.ts                                   [new]
    ├── lib/
    │   ├── env.ts                                  [new]
    │   ├── jwt.ts                                  [new]
    │   ├── asyncHandler.ts                         [new]
    │   └── ApiError.ts                             [new]
    ├── middleware/
    │   ├── auth.middleware.ts                      [new]
    │   └── errorHandler.ts                         [new]
    └── modules/
        ├── auth/{auth.schema,service,controller,routes}.ts     [new]
        ├── cities/{cities.service,controller,routes}.ts        [new]
        ├── activities/{activities.service,controller,routes}.ts [new]
        └── trips/{trips.schema,service,controller,routes}.ts   [new — core deliverable]

Frontend/
├── index.html                                      [updated]
├── package.json, tsconfig.json, vite.config.ts     [new]
├── tailwind.config.ts, postcss.config.js           [new]
├── .env.example                                    [new]
└── src/
    ├── main.tsx, App.tsx, index.css, vite-env.d.ts [new]
    ├── types/index.ts                              [new]
    ├── lib/{api,queryClient,money,cn}.ts            [new]
    ├── store/authStore.ts                          [new]
    ├── components/
    │   ├── ui/{Button,Input,Card,Modal,PageContainer,Spinner,EmptyState}.tsx [new]
    │   └── layout/{AppShell,RequireAuth}.tsx        [new]
    ├── features/
    │   ├── auth/api.ts                             [new]
    │   └── trips/
    │       ├── api.ts, hooks.ts                    [new — core deliverable]
    │       └── components/{TripCard,CityPickerModal,ActivityPickerModal,SortableItem,StopEditor}.tsx [new]
    └── pages/
        ├── auth/{LoginPage,SignupPage}.tsx          [new — Person A stub]
        ├── DashboardPage.tsx                        [new — Person A stub]
        ├── NotFoundPage.tsx                          [new]
        └── trips/{CreateTripPage,MyTripsPage,ItineraryBuilderPage,ItineraryViewPage}.tsx [new — core deliverable]
```
