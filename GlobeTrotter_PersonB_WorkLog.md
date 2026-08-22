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
| Person A's screens (real Login/Signup polish, Dashboard content, City/Activity Search UI) | Not started | Out of scope for Person B — stubs exist only to unblock Trips testing |
| Person C's screens (Budget breakdown, Calendar, Public sharing, Admin) | Not started | Out of scope for Person B — `TripExpense`/`ShareLink`/`TripCollaborator` tables already exist in schema, ready for Person C |

Everything else originally in Person B's scope (DB + API + UI for Screens #3–#6, responsive QA, cover-photo upload) is done — see 5.1 and 5.2 below.

---

## 5.1 Session 2 (2026-08-22, continued) — Live DB verification

The local Postgres password was recovered (`tirth3086`) and a `globetrotter` database already existed on the instance. Found the instance is **not** on the default port — it's listening on **`localhost:8080`**, not 5432 (confirmed via `Get-NetTCPConnection`).

- Created `Backend/.env` with `DATABASE_URL="postgresql://postgres:tirth3086@localhost:8080/globetrotter?schema=public"` (confirmed gitignored before writing it).
- Ran `npx prisma migrate dev --name init` — created all 11 tables cleanly (`_prisma_migrations`, `users`, `cities`, `activities`, `trips`, `trip_stops`, `trip_activities`, `trip_expenses`, `trip_collaborators`, `share_links`, `saved_destinations`). Note: Prisma's auto-seed-after-migrate did **not** actually populate rows (ran silently but tables stayed empty) — had to run `npx prisma db seed` explicitly, which worked (1 user, 15 cities, 53 activities).
- `npx tsc --noEmit` in `Backend/` — still clean.
- Started the backend (`npx tsx src/server.ts`, port 4000) and ran a full curl-based E2E pass against the live DB: login → create trip → add stop → add activity → get itinerary. All endpoints returned correct data, including the day-grouped `activitiesByDate` view and running `totalActivityCost`. One schema note for future reference: the create-trip payload field is `name`, not `title` — matches `trips.schema.ts`, just flagging since it's an easy mistake when wiring up API calls by hand.
- Created `Frontend/.env` from `.env.example` and started the Vite dev server (port 5173).
- Drove the real UI through Chrome automation end-to-end, logged in as the seeded demo user, and walked the entire Person B flow: Login → My Trips (empty state) → Create Trip (Screen #3) → Itinerary Builder (Screen #5, added a Bangkok stop via `CityPickerModal`, added an activity via `ActivityPickerModal`, confirmed running cost updates live) → Itinerary View (Screen #6, day-by-day timeline rendered correctly with cost). Every screen matched the intended design and worked against the real backend, not just `tsc --noEmit`.
- **Testing note, not an app bug:** browser-automation clicks on React Router `<Link>`/`<NavLink>` elements were unreliable in this session's Chrome automation tool (clicks landed on the correct element per `elementFromPoint` but didn't trigger navigation), while `<button>` clicks (form submits) worked fine. Dispatching `.click()` on the anchor via JS worked every time. Also saw one false alarm where a hard page reload appeared to redirect to `/trips`/`/login` — turned out to be a screenshot taken before Vite finished transpiling on cold load; a 2s wait after `navigate()` showed the correct page every time. Neither is a real product bug — just noted here so a future session doesn't re-chase the same red herring.
- Cleaned up: deleted the test trip via the API after verification, restored DB to the clean seeded state (0 trips, 1 user, 15 cities, 53 activities). Backend and frontend dev servers were left running in the background for this session (ports 4000 and 5173).

**Status: the entire Trip Core & Itinerary vertical (Screens #3–#6) is now verified working end-to-end against a live database, not just type-checked.**

---

## 5.2 Session 2 (2026-08-22, continued) — Responsive QA + Cloudinary cover-photo upload

Closed out the two remaining gaps from Section 5's original list.

**Responsive QA (roadmap Phase 6):** The Chrome automation tool's `resize_window` didn't actually shrink the browser viewport in this environment (window stayed at its OS-managed size regardless of the requested dimensions), so used a same-origin `<iframe>` injected into a loaded page as a viewport-emulation harness instead — Tailwind's width-based breakpoints respond correctly to an iframe's own rendered width, so this gives accurate results without relying on `resize_window`. Checked all 4 screens at 390px (mobile), 768–900px (tablet), and 1100px (desktop):
- **My Trips (#4):** single column → 2-col grid at `md:` (768px) → correct card grid, bottom tab bar shows below `lg:`, header nav switches to the pill+avatar-only mobile header correctly.
- **Create Trip (#3):** start/end date fields stack to one column below `sm:` (640px) as coded, no overflow.
- **Itinerary Builder (#5):** confirmed the mobile inline-expansion vs. desktop two-pane split is real, intentional, and correctly implemented in `ItineraryBuilderPage.tsx` (`hidden lg:block` desktop panel / `lg:hidden` mobile panel, `lg:grid-cols-[340px_1fr]`) — matches the roadmap's Section 5.3 spec exactly.
- **Itinerary View (#6):** day-by-day timeline flows cleanly at 390px, header wraps correctly, no horizontal overflow.

No responsive bugs found — the original build already handled this correctly. No code changes were needed here, just verification.

**Cloudinary cover-photo upload:** the user set up a real Cloudinary account and an unsigned upload preset (cloud name `yjjqyocf`, preset `globetrotter`, folder `globetrotter/trip-covers`). Implemented:
- `Frontend/src/lib/cloudinary.ts` — `uploadImageToCloudinary(file)`, posts directly to Cloudinary's unsigned upload endpoint (`https://api.cloudinary.com/v1_1/{cloud}/image/upload`) with `upload_preset` and `folder` fields. No backend involvement needed since the preset is unsigned — this was the simplest option for a project at this stage (no API secret has to live anywhere in app code).
- `Frontend/src/components/ui/ImageUploadField.tsx` — new shared component: dashed dropzone → click to pick a file → uploads with a spinner → shows the resulting image with a remove (×) button. Validates image MIME type and a 5MB size cap client-side before uploading.
- Wired into `CreateTripPage.tsx`, replacing the old plain-text `coverPhotoUrl` `Input` with `<ImageUploadField>`.
- Added `VITE_CLOUDINARY_CLOUD_NAME` / `VITE_CLOUDINARY_UPLOAD_PRESET` to `vite-env.d.ts`, `Frontend/.env.example` (placeholder values), and `Frontend/.env` (real values — gitignored, not committed).
- **Verified live, not just type-checked:** restarted the Vite dev server to pick up the new env vars, logged in, used the browser automation's `file_upload` tool to attach a generated test PNG to the real file input, confirmed it uploaded to `res.cloudinary.com/yjjqyocf/image/upload/.../globetrotter/trip-covers/test-cover.png`, then created a trip with that URL via the API and confirmed it round-tripped correctly and rendered as the actual card background image on the My Trips page. Cleaned up the test trip afterward. (The tiny test PNG itself is still sitting in the user's Cloudinary media library under `globetrotter/trip-covers` — harmless, but worth deleting from the Cloudinary dashboard if they want a clean media library before the demo.)
- `npx tsc --noEmit` clean in both `Backend/` and `Frontend/` after these changes.

**Status: Person B's full scope — DB + API + UI for Screens #3–#6, responsive QA, and cover-photo upload — is complete and verified end-to-end.**

---

## 5.3 Session 3 (2026-08-22, continued) — Fixed a team merge collision that broke the whole build

The user asked to "run my project" and hit `[plugin:vite:esbuild] parsing tsconfig.json failed`. Root cause: PR #4 (`Merge pull request #4 from PURVA2708/Frontend_Deveops`) merged **Person C's** entire independent frontend scaffold (Budget #9, Calendar #10, Public Share #11, Admin #13 — a full parallel Vite+React setup with its own `App.tsx`, routing, tokens, dependencies) into this branch. Wherever both people had touched the **same file path** with genuinely different content, the merge left both versions **literally concatenated** instead of resolved — not git conflict markers, just two complete file bodies stitched together, which is syntactically invalid for anything that isn't a flat list of independent statements. Files with only independent top-level statements (e.g. `types/index.ts`, which is just a sequence of `export type`/`export interface`) merged fine on their own; anything with a single wrapping structure (a JSON object, a JSX return, a `compilerOptions` block) did not.

**Corrupted and fixed, frontend:**
- `tsconfig.json`, `package.json`, `vite.config.ts`, `postcss.config.js`, `index.html`, `src/index.css`, `src/main.tsx`, `src/App.tsx` — each had two competing full versions concatenated. Rebuilt each as one coherent file, keeping the more complete/correct option per-field (e.g. `tsconfig.json` kept the `@/*` path alias + `types: ["node"]`; `vite.config.ts` kept both the `@` alias *and* Person C's `/api` dev proxy, retargeted from their placeholder port 5000 to the real backend port 4000).
- `tailwind.config.js` **and** `tailwind.config.ts` existed side by side (each person ran their own Vite/Tailwind scaffold independently) with different token sets — Tailwind will only load one, silently dropping the other's colors/shadows. Merged Person C's extra tokens (`brand.light`, `ink.light`/`muted`, `surface.subtle`, and the `subtle`/`card`/`hover`/`modal` shadow names, confirmed via grep against what their components actually reference) into the `.ts` version and deleted the `.js` duplicate.
- `App.tsx` was rebuilt as one router: kept the existing `react-router-dom` structure (a real router, not Person C's original `window.location.hash` tab-switcher) and added routes for their screens — `/trips/:tripId/budget` → `BudgetPage`, `/trips/:tripId/calendar` → `CalendarTimelinePage`, `/share/:slug` → `SharedItineraryPage` (public, outside the `RequireAuth`/`AppShell` wrapper since it's meant to be viewed without login), `/admin` → `AdminAnalyticsPage`. Left Person C's own `HomePage.tsx`/`Navbar.tsx` unrouted — they duplicate Person A's Dashboard/AppShell nav territory, so wiring them in would just create two competing shells; flagging this as a team decision, not something to resolve unilaterally.
- `package.json`: merged both dependency lists (Person C's `recharts`, `lucide-react`, `tailwind-merge` alongside Person B's `@dnd-kit/*`, `react-router-dom`, `zustand`, `@tanstack/react-query`, etc.), then ran `npm install` to actually pull in the newly-added packages (`tsc` was failing on `Cannot find module 'recharts'`/`'lucide-react'` until this ran).

**Corrupted and fixed, backend:**
- `Backend/src/server.ts` had the same problem: Person C had written their own **entire standalone Express bootstrap** (own `app = express()`, own CORS/JSON middleware, own error handler, own port-5000 default) instead of plugging their routers into the shared `app.ts` Person B built. This wasn't just a syntax fix — their four route modules (`budget`, `calendar`, `share`, `admin`) were never actually reachable from the real running server. Restored `server.ts` to the single clean entry point (`import { app } from './app.js'`), and instead mounted Person C's routers into the shared `app.ts`'s `v1` router: `/trips/:id/budget`, `/trips/:id/calendar`, `/trips/:id/share`, `/share` (public), `/admin`. Checked their service files first — they already import the shared `lib/prisma.ts` client, not a separate DB connection, so this was a clean plug-in with no further changes needed.

**Verification, not just `tsc --noEmit`:** after all fixes, ran a heuristic scan across every `.ts`/`.tsx`/`.css`/`.json` file in both `Backend/` and `Frontend/` for brace-count mismatches and duplicate top-level exports to make sure no other file had the same silent-concatenation damage — none found. Restarted both dev servers clean, reloaded the app in a real browser (no more error overlay), logged in, and specifically exercised the newly-wired integration: created a trip via the API, navigated to `/trips/:id/budget`, and confirmed Person C's Budget screen (#9) renders correctly — charts, stat tiles, category breakdown — inside the shared `AppShell` nav, proving the merge is a real integration and not just a compiling no-op. Cleaned up the test trip afterward. `npx tsc --noEmit` clean in both `Backend/` and `Frontend/`; both dev servers healthy on ports 4000/5173.

**Not done / worth a team conversation:** Person C's `HomePage.tsx` and `Navbar.tsx` are now orphaned (unrouted, still compile, unused) since they duplicate Person A's Dashboard/AppShell scope — worth the team agreeing on one shell rather than me picking unilaterally. Also worth adding nav links to Budget/Calendar/Admin somewhere in `AppShell` now that the routes exist, so they're reachable without typing a URL by hand — not done here since that's a UX/IA decision, not a bug fix.

**Superseded almost immediately** — see 5.4 below. Shortly after this fix, the user pulled a newer, better-resolved merge from the team (`origin/main`/`parth.main`) that replaced this entire hand-patched state with a proper 3-way merge including Person A's real screens. All the manual fixes above became moot once that landed; kept this section for the historical record of what the collision looked like and how it was diagnosed.

---

## 5.4 Session 3 (2026-08-22, continued) — Pulled the team's real merge (`origin/main`), fixed what it broke

The user pulled the latest from all branches and asked to cross-check connections against the roadmap. `origin/main`/`parth.main` (commit `62fa3aa`, "chore: merge main and resolve all schema, routes, and component conflicts") turned out to be a **properly resolved** merge — Person A's real Login/Signup/Dashboard/City Search/Activity Search/Profile screens, a new `AppLayout`/`Navbar`/`Sidebar`/`BottomNav` shell, and a cleanly rebuilt `app.ts`/`App.tsx` that already included Person C's Budget/Calendar/Share/Admin wiring. This fully superseded the hand-patched state from 5.3.

**Process:** stashed the local session-3 patches (`git stash push -u`) since they'd conflict with a better upstream fix, then `git merge origin/main` — a clean fast-forward, no conflicts. This pulled in 66 changed files. The stash was left in place (not popped) since its code is now obsolete; only the historical work-log text was recovered from it (see 5.3 above).

**Real bugs found and fixed after the merge, not just type errors:**
- **`SavedDestination` schema/code mismatch** — `users.service.ts` (Person A's) queries `orderBy: { createdAt: 'desc' }` and reads `s.createdAt`/`s.city` on saved destinations, but the shared `schema.prisma` model had no `createdAt` field. Added it (`createdAt DateTime @default(now())`) and ran a migration (`add_saved_destination_created_at`) rather than stripping the feature out of the service code.
- **`express` / `@types/express` major-version mismatch** — `package.json` declared `express@^4.21.2` (runtime) but `@types/express@^5.0.0` (types for a different major, where Express 5's route params can be `string | string[]`). This produced ~25 real `tsc` errors across every controller (`req.params.id` typed as possibly an array). Pinned `@types/express` to `^4.17.21` to match the actual runtime, not band-aided at each call site.
- **Duplicate seed data** — re-running the updated `seed.ts` against a DB already seeded by an earlier version left two near-identical `Kerala Backwaters` city rows (8 duplicate activities). `prisma migrate reset --force` was correctly blocked by the auto-mode safety classifier as destructive; used a targeted `DELETE` on the one duplicate row instead. Back to a clean 15 cities / 53 activities / 2 users.
- **`TripStatus`/`ActivityCategory` type unions littered with defensive uppercase variants** (`'DRAFT' | 'PLANNED' | ...`) that nothing in the codebase actually produces (backend enums are strictly lowercase) — these were silently masking a real type error in `TripCard.tsx`'s `Record<TripStatus, string>`. Removed the dead uppercase members from `TripStatus` rather than keep expanding the union to chase symptoms.
- **`.toFixed()` called directly on `cost`/`costIndex` fields** typed `string | number` (an accurate type — Prisma Decimal fields serialize as strings on some endpoints, plain numbers on others, a genuine backend inconsistency) in `ActivitySearchPage.tsx`, `CitySearchPage.tsx`, `DashboardPage.tsx`. Fixed at each call site with `Number(x).toFixed(...)` instead of loosening the type.
- **Broken "Plan New Trip" navigation, and no way to reach Trips at all** — `Sidebar.tsx`'s primary CTA linked to `/cities` instead of `/trips/new`; the dashboard's "Explore & Add Stops" button did the same; and **no nav surface anywhere** (`Sidebar`, top `Navbar`, mobile `BottomNav`) linked to `/trips` (My Trips). Person B's entire vertical was fully built and routed but genuinely unreachable from the UI. Added "My Trips" to all three nav surfaces (swapped "Activities" out of the 5-slot mobile bottom nav for it, since Activities stays reachable via city pages and the desktop top nav) and fixed both CTAs to point at the real trip-creation flow.
- **Auth guard gap** — `AppLayout` (used by `/dashboard`, `/cities`, `/activities`, `/trips`, `/budget`, `/admin`, etc.) had no auth check at all; only `/profile` was individually wrapped in `ProtectedRoute`. Every other screen was reachable while logged out (the API calls would then 401, but the shell would render first). Moved `ProtectedRoute` to wrap the whole `AppLayout` route instead of one page. Verified by clearing `localStorage` and confirming `/trips` now correctly redirects to `/login`.
- **`CityPickerModal` crash — `cities?.map is not a function`** — this was the one that actually broke the Itinerary Builder (blank page, no error shown on screen, only in console). Person A's real `/cities` and `/activities` endpoints return `{ success, data, pagination }`, but Person B's `features/trips/api.ts` (`fetchCities`/`fetchActivitiesForCity`) was still written against the old scaffolded endpoints' raw-array shape from early in the project. Fixed both functions to unwrap `.data.data`.
- **Also re-approved new install scripts and dependency changes** the merge brought in: `prisma`/`@prisma/client` bumped 5→6 major (regenerated the client, re-ran migrations, confirmed `migrate status` clean), and picked up `lucide-react`/`recharts` etc. via `npm install` on both sides.

**Verification, live not just typechecked:** full flow re-tested end to end after every fix — login → dashboard → My Trips (now reachable) → Create Trip → Itinerary Builder (Add Stop modal, previously crashing, now works) → Budget screen at the *correct* route (`/budget/:tripId`, not `/trips/:tripId/budget` — the route Person C actually shipped) → Explore Cities (15 results, matching the de-duplicated seed) → Activities → Admin analytics. Console checked for errors at each step via the browser tool, not just visually. Test trips created via the API for speed, always deleted afterward. `npx tsc --noEmit` clean in both `Backend/` and `Frontend/` after every fix, not just at the end.

**Not done / worth a team conversation:**
- `/admin` is reachable by any logged-in user, not just `role: 'admin'` — `AdminAnalyticsPage` and the router don't check role. Left as-is since the roadmap marks Admin as optional and this is a demo/hackathon project, but worth a real role check before anything resembling production use.
- Person C's `HomePage.tsx`/`Navbar.tsx` (from the 5.3 episode) are still orphaned dead files under the new merge too — same team conversation still pending.
- `lib/env.ts` and `lib/jwt.ts` (Person B's original typed env loader / JWT helpers) are now fully orphaned — the new `app.ts`/`server.ts`/`utils/jwt.ts` (Person A's) don't use them. Harmless (they compile, nothing imports them), left in place rather than deleted unilaterally.

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
    ├── lib/{api,queryClient,money,cn,cloudinary}.ts [new — cloudinary.ts added session 2]
    ├── store/authStore.ts                          [new]
    ├── components/
    │   ├── ui/{Button,Input,Card,Modal,PageContainer,Spinner,EmptyState,ImageUploadField}.tsx [new — ImageUploadField added session 2]
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
