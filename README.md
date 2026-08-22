# Travel_Loop — GlobeTrotter

Full-stack multi-city travel planner. See `GlobeTrotter_Architecture_Roadmap_v2.md` for the
full architecture, phase plan, and team split (Person A / B / C).

## Stack

- **Frontend:** React + Vite + TypeScript + Tailwind CSS
- **Backend:** Node.js + Express + TypeScript + Prisma
- **Database:** PostgreSQL

## Local setup

### 1. Database

Create a Postgres database (local or a free [Neon](https://neon.tech) instance) and note its
connection string.

### 2. Backend

```bash
cd Backend
npm install
cp .env.example .env   # fill in DATABASE_URL, JWT secrets
npm run prisma:migrate  # creates tables
npm run prisma:seed     # demo user + ~15 cities/activities
npm run dev              # http://localhost:4000
```

Demo login (created by the seed script): `demo@globetrotter.app` / `password123`

### 3. Frontend

```bash
cd Frontend
npm install
cp .env.example .env   # VITE_API_URL, defaults to http://localhost:4000/api/v1
npm run dev              # http://localhost:5173
```

## Team split

Each person owns a full vertical slice (DB tables + API module + UI screens), not a
frontend/backend split. See Section 7 of the roadmap doc for the full breakdown:

- **Person A** — Identity & Discovery (Login/Signup, Dashboard, City/Activity Search, Profile)
- **Person B** — Trip Core & Itinerary (Create Trip, My Trips, Itinerary Builder, Itinerary View) ✅ implemented
- **Person C** — Money, Time & Sharing (Budget, Calendar, Public Sharing, Admin)
