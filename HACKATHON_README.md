# 🌍 GlobeTrotter

### Plan multi-city trips, track budgets in real time, and ship a shareable itinerary — all in one app, with an AI co-pilot that can actually build it for you.

![Node](https://img.shields.io/badge/node-%3E%3D18-339933?logo=node.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-18.3-61DAFB?logo=react&logoColor=black)
![Express](https://img.shields.io/badge/Express-4.21-000000?logo=express&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-6.4-2D3748?logo=prisma&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-database-4169E1?logo=postgresql&logoColor=white)
![Groq](https://img.shields.io/badge/AI-Groq_(gpt--oss--120b)-F55036?logo=groq&logoColor=white)

**[🔗 Live Demo — coming soon]()** · **[📹 Demo Video — coming soon]()** · [Quick Start](#-quick-start-5-minutes) · [Features](#-what-makes-globetrotter-different) · [Tech Stack](#️-technology-stack)

---

## 💡 The Problem

Planning a multi-city trip today means juggling five different tools: a maps app for logistics, a spreadsheet for budget, a notes app for the itinerary, a group chat to share plans, and a search engine to figure out what's even worth doing in each city. Nothing talks to each other, and nothing tells you when you're about to blow your budget.

## ✅ The Solution

**GlobeTrotter is a single app that owns the whole trip lifecycle** — from picking cities and activities, to sequencing stops with drag-and-drop, to watching a live budget-vs-spend status as you add expenses, to handing a friend a public link of the finished plan. An AI assistant sits on top of all of it and can build a first draft of the trip for you from a plain-language request.

---

## 🚀 What Makes GlobeTrotter Different

### 🤖 An AI assistant that takes real actions, not just chat
Most "AI travel chatbots" just answer questions. GlobeTrotter's assistant is wired into the app via function calling — ask it to *"plan a 5-day trip to Bali starting next Friday"* and it resolves the dates, calls the real trip-creation API, adds the first city stop, and drops the user straight into the itinerary builder it just built. It can also navigate the app for you or look up a city's cost/popularity on demand. Every suggestion is grounded — the model is constrained to city/activity IDs that actually exist in the database, so it can't hallucinate a destination that isn't real.

### 💰 A budget engine, not just an expense log
Every trip computes a live status — **within budget**, **warning** (≥80% spent), or **danger** (over budget) — by combining explicit logged expenses *and* the actual cost of every activity scheduled in the itinerary, plus a daily-average burn rate. It's the difference between "here's a list of what you spent" and "here's whether you're on track."

### 🧩 A real itinerary data model, not a glorified checklist
Trips → Stops (cities with arrival/departure dates) → Activities (scheduled time + cost), each independently reorderable via drag-and-drop. That structure is what makes the budget engine, the calendar timeline, and the AI assistant all work off one consistent source of truth instead of parsing free text.

### 🔗 One-click public sharing
Every trip can generate a public, unguessable share link with a toggleable "allow copy" flag — recipients can view the itinerary without an account, and clone it into their own if the owner allows it.

---

## 🔑 Core Features

1. **🔐 Authentication** — JWT access + refresh tokens, bcrypt password hashing
2. **🧳 Trip & Itinerary Builder** — multi-city stops, drag-and-drop reordering, per-activity scheduling
3. **🏙️ City & Activity Discovery** — 16 seeded destinations across 4 continents with cost index & popularity scoring
4. **💰 Budget Tracking** — category-based expenses, live status, daily average spend
5. **📅 Calendar Timeline** — day-by-day view of everything scheduled on a trip
6. **🔗 Public Sharing** — shareable slugs with clone-on-copy
7. **🛡️ Admin Analytics** — platform stats, top cities, top activities, user role management
8. **🤖 AI Assistant** — itinerary suggestions + action-taking chat, powered by Groq (`openai/gpt-oss-120b`)

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite 6 + TypeScript |
| Styling | Tailwind CSS |
| State / Data | Zustand (client state) + TanStack Query (server state) |
| Forms | React Hook Form + Zod |
| Charts | Recharts |
| Drag & Drop | dnd-kit |
| Backend | Express 4 + TypeScript |
| ORM / DB | Prisma 6 + PostgreSQL |
| Auth | JWT (access + refresh) + bcryptjs |
| Validation | Zod (shared schema-first validation) |
| AI | Groq API, function-calling |
| Image Hosting | Cloudinary (unsigned client uploads) |

---

## ⚡ Quick Start (5 minutes)

```bash
# 1. Clone
git clone https://github.com/PURVA2708/Travel_Loop.git && cd Travel_Loop

# 2. Backend
cd Backend
npm install
cp .env.example .env        # fill in DATABASE_URL + JWT secrets
npm run prisma:migrate
npm run prisma:seed         # demo users + 16-city catalog
npm run dev                  # http://localhost:5000

# 3. Frontend (new terminal)
cd Frontend
npm install
cp .env.example .env        # set VITE_API_URL to match backend PORT
npm run dev                  # http://localhost:5173
```

Need a Postgres instance fast? [Neon](https://neon.tech) has a free tier that works as a drop-in `DATABASE_URL`.

### Demo login

| Role | Email | Password |
|---|---|---|
| User | `demo@globetrotter.app` | `password123` |
| Admin | `admin@globetrotter.com` | `password123` |

*(Local/demo credentials only — created by the seed script.)*

> The AI assistant features (`/ai/suggest-itinerary`, `/ai/chat`) require a `GROQ_API_KEY` in `Backend/.env`. Everything else works without it.

---

## 🗺️ What's Next

- **Trip collaborators** — the data model (`TripCollaborator`, view/edit permissions) already exists in the Prisma schema; wiring up the API and a shared-editing UI is the next milestone toward real-time collaborative planning.
- **Richer AI planning** — extend the assistant's tool set beyond create/navigate/search to editing existing itineraries conversationally.
- **Offline-first mobile view** — the bottom-nav layout is already mobile-first; a PWA manifest is the natural next step.

---

## 📁 Project Structure

```
Travel_Loop/
├── Backend/    # Express + Prisma API — one module per feature (auth, trips, budget, calendar, share, admin, ai)
└── Frontend/   # React + Vite SPA — pages, feature components, Zustand stores
```

For the full architecture breakdown, module-by-module API reference, and validation rules, see [`README.md`](./README.md).
