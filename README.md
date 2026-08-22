# 🌍 GlobeTrotter

> A multi-city travel planning app for building itineraries, tracking trip budgets, and sharing trips publicly.

![Node](https://img.shields.io/badge/node-%3E%3D18-339933?logo=node.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-18.3-61DAFB?logo=react&logoColor=black)
![Express](https://img.shields.io/badge/Express-4.21-000000?logo=express&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-6.4-2D3748?logo=prisma&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-database-4169E1?logo=postgresql&logoColor=white)

## Table of Contents

- [Key Modules & Features](#-key-modules--features)
- [Technology Stack](#️-technology-stack)
- [Project Directory Structure](#-project-directory-structure)
- [Getting Started](#️-getting-started)
- [Seeding & Demo Credentials](#-seeding--demo-credentials)
- [Business & Validation Rules](#-business--validation-rules)

---

## 🔑 Key Modules & Features

1. **🔐 Authentication**
   - **Signup/login** with email + password (bcrypt-hashed), issuing short-lived **access tokens** and long-lived **refresh tokens** (JWT)
   - `GET /me` returns the authenticated user from the bearer token
   - Public routes (cities, activities) use **optional auth** so guests can browse while logged-in users get personalized data

2. **🧳 Trip Core & Itinerary Builder**
   - **Create, update, and delete trips** with name, date range, cover photo, and total budget; trips move through `draft → planned → completed` states
   - Build a multi-city itinerary by adding **trip stops** (city + arrival/departure dates) and **reordering** them via drag-and-drop
   - Attach **activities to stops** with a scheduled date/time and actual cost, and reorder them within a stop

3. **🏙️ City & Activity Discovery**
   - Browse a seeded catalog of cities (with cost index, popularity score, coordinates) and their activities (sightseeing, food, adventure, culture, nightlife)
   - Look up a city's activity list directly (`/cities/:id/activities`)
   - Save destinations to a personal list (`/users/me/saved-destinations`)

4. **💰 Budget Tracking**
   - Log trip **expenses** by category (`transport`, `stay`, `activities`, `meals`, `misc`) alongside itinerary activity costs
   - Auto-computed budget status: **within** (<80%), **warning** (80–100%), or **danger** (>100%) of the trip's total budget
   - **Daily average spend** endpoint for pacing a trip against its budget

5. **📅 Calendar Timeline**
   - View a trip's scheduled activities laid out across its date range for a day-by-day timeline view

6. **🔗 Public Sharing**
   - Generate a **public share link** (unique slug) for a trip, with an option to allow/disallow copying
   - Anyone with the link can view the shared itinerary; the trip owner can **copy** a shared trip into their own account

7. **🛡️ Admin Analytics**
   - Platform-wide stats overview, **top cities**, and **top activities** by usage
   - User management: list users and update user roles (`user` / `admin`)

8. **🤖 AI Trip Assistant** (Groq-powered)
   - `suggest-itinerary`: given a trip length and traveler interests, an LLM selects a matching set of cities and activities from the real catalog (never invents IDs)
   - `chat`: a conversational assistant that can call real app actions — navigate to a page, create a trip, or look up a city — via function calling

---

## 🛠️ Technology Stack

| Layer | Technology | Description |
|---|---|---|
| Frontend Framework | React 18 + Vite 6 | SPA with fast dev server and HMR |
| Language | TypeScript 5.7 | Used across both frontend and backend |
| Styling | Tailwind CSS 3 | Utility-first CSS |
| State Management | Zustand + TanStack Query | Client/UI state (Zustand) and server-state caching (React Query) |
| Forms & Validation (client) | React Hook Form + Zod | Form state and schema validation |
| Charts | Recharts | Budget donut chart, daily spend bar chart, analytics charts |
| Drag & Drop | dnd-kit | Reordering trip stops and activities |
| Backend Framework | Express 4 | REST API server |
| ORM | Prisma 6 | Type-safe PostgreSQL access and migrations |
| Database | PostgreSQL | Primary datastore |
| Authentication | JSON Web Tokens (jsonwebtoken) + bcryptjs | Access/refresh token auth, password hashing |
| Validation (server) | Zod | Request body/schema validation via middleware |
| AI Provider | Groq API (`openai/gpt-oss-120b`) | Itinerary suggestions and the in-app chat assistant |
| Image Hosting | Cloudinary | Client-side unsigned image uploads (avatars, cover photos) |
| Rate Limiting | express-rate-limit | API request throttling |

---

## 📁 Project Directory Structure

<details>
<summary>Click to expand full tree</summary>

```
Travel_Loop/
├── Backend/
│   ├── prisma/
│   │   ├── schema.prisma        # User, Trip, City, Activity, TripStop, TripActivity, TripExpense, ShareLink, TripCollaborator, SavedDestination
│   │   ├── migrations/          # Versioned SQL migrations
│   │   └── seed.ts              # Seeds demo users + 16 cities with activities
│   └── src/
│       ├── modules/             # One folder per feature, each with routes/controller/service/schema
│       │   ├── auth/            # Signup, login, refresh token, /me
│       │   ├── users/           # Profile, saved destinations
│       │   ├── cities/          # City catalog
│       │   ├── activities/      # Activity catalog
│       │   ├── trips/           # Trips, stops, trip-activities (itinerary core)
│       │   ├── budget/          # Expenses, budget status, daily average
│       │   ├── calendar/        # Trip calendar timeline
│       │   ├── share/           # Public share links, trip copying
│       │   ├── admin/           # Platform stats, user role management
│       │   └── ai/              # Groq-powered itinerary suggestions & chat assistant
│       ├── middleware/          # auth, validate, error handling
│       ├── lib/                 # prisma client, ApiError, asyncHandler, env, jwt
│       ├── app.ts               # Express app & route mounting
│       └── server.ts            # Entry point
└── Frontend/
    └── src/
        ├── components/
        │   ├── charts/           # BudgetDonutChart, DailySpendBarChart, AnalyticsCharts
        │   ├── common/ & ui/     # Shared UI primitives (Button, Card, Modal, Input, ShareModal, ...)
        │   └── layout/           # AppLayout, AuthLayout, Navbar, BottomNav, ProtectedRoute
        ├── features/
        │   ├── trips/            # Itinerary builder components (CityPickerModal, ActivityPickerModal, SortableItem, TripCard)
        │   └── assistant/        # AI chat widget
        ├── pages/                # Route-level pages (dashboard, trips, budget, calendar, admin, auth)
        ├── store/                # Zustand stores (auth, UI, assistant)
        ├── lib/                  # axios client, cloudinary helper, money formatting
        └── App.tsx               # Route definitions
```

</details>

---

## ⚙️ Getting Started

### Prerequisites

- **Node.js 18+** (required by Vite 6 and the TypeScript toolchain; no `engines` field is pinned in `package.json`)
- **PostgreSQL** database (local instance or a free hosted one, e.g. [Neon](https://neon.tech))

### 1. Clone & install

```bash
git clone https://github.com/PURVA2708/Travel_Loop.git
cd Travel_Loop
```

### 2. Backend setup

```bash
cd Backend
npm install
cp .env.example .env
```

<details>
<summary>Backend environment variables (<code>Backend/.env.example</code>)</summary>

```env
PORT=5000
NODE_ENV=development
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/globetrotter?schema=public"

JWT_ACCESS_SECRET="your_access_jwt_secret_key"
JWT_REFRESH_SECRET="your_refresh_jwt_secret_key"
JWT_ACCESS_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"

CORS_ORIGIN="http://localhost:5173"

GROQ_API_KEY="your_groq_api_key"
```

</details>

```bash
npm run prisma:migrate   # apply migrations, creates tables
npm run prisma:seed      # demo users + city/activity catalog
npm run dev               # starts the API (http://localhost:5000, or PORT from .env)
```

Other backend scripts: `npm run build` (compile TypeScript to `dist/`), `npm start` (run compiled build), `npm run prisma:studio` (Prisma Studio GUI).

### 3. Frontend setup

```bash
cd Frontend
npm install
cp .env.example .env
```

<details>
<summary>Frontend environment variables (<code>Frontend/.env.example</code>)</summary>

```env
VITE_API_URL="http://localhost:4000/api/v1"

VITE_CLOUDINARY_CLOUD_NAME="your-cloud-name"
VITE_CLOUDINARY_UPLOAD_PRESET="your-unsigned-upload-preset"
```

</details>

```bash
npm run dev   # starts Vite dev server on http://localhost:5173
```

Other frontend scripts: `npm run build` (typecheck + production build), `npm run preview` (preview the production build), `npm run typecheck`.

> **Note:** the frontend's `VITE_API_URL` default (`:4000`) and the backend's default `PORT` (`5000`) in `.env.example` don't match — set both to the same port explicitly in your local `.env` files.

---

## 🌱 Seeding & Demo Credentials

Running `npm run prisma:seed` in `Backend/` creates two demo accounts and a catalog of 16 cities with activities.

| Role | Email | Password |
|---|---|---|
| User | `demo@globetrotter.app` | `password123` |
| Admin | `admin@globetrotter.com` | `password123` |

> ⚠️ These credentials are for **local/demo use only**. Never reuse them in a production environment.

---

## 📋 Business & Validation Rules

**Auth**
- Password: minimum **6 characters** (max 72) on signup
- Name: 2–100 characters
- All auth endpoints require a valid email format

**Trips**
- Trip name: 2–120 characters; description capped at 2000 characters
- `endDate` must be on or after `startDate` (enforced on both create and update)
- `totalBudget` must be non-negative
- Status is restricted to `draft`, `planned`, or `completed`

**Trip Stops & Activities**
- A stop's `departureDate` must be on or after its `arrivalDate`
- Reordering stops/activities requires a non-empty ordered ID list
- `scheduledTime` must match `HH:MM` format when provided

**Budget**
- Expense `amount` must be strictly positive
- Expense `category` is restricted to `transport`, `stay`, `activities`, `meals`, or `misc`
- Budget status is derived automatically from spend vs. total budget: **within** (<80%), **warning** (80–100%), **danger** (>100%)
- Total spend combines explicit expense entries **and** actual costs logged against itinerary activities

**Sharing**
- A trip can have at most one active share link (unique `tripId` on `ShareLink`)
- Share links use a globally unique public slug

**Access Control**
- All trip, budget, calendar, and user-profile routes require a valid bearer access token
- City and activity catalog routes are public but support optional auth (to surface saved-destination state for logged-in users)
- Admin routes require `role: admin` on the authenticated user

**AI Assistant**
- Itinerary suggestions are constrained to city/activity IDs that literally exist in the catalog — the model cannot invent new ones
- The assistant only takes an app action when a request is explicit and present-tense (never for hypothetical or past-tense phrasing), and executes at most one tool call per turn
