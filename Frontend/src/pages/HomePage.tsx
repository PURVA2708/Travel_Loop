import React from 'react';
import {
  DollarSign,
  Calendar,
  Share2,
  Shield,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Layers,
  Database,
  Terminal,
} from 'lucide-react';
import { MOCK_TRIP_ID, MOCK_SHARE_SLUG } from '../services/api.ts';

interface HomePageProps {
  onNavigate: (tab: string, param?: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate }) => {
  const cards = [
    {
      id: 'budget',
      title: 'Screen #9 — Budget & Cost Breakdown',
      desc: 'Interactive Recharts donut & daily bar charts, category allocation, smart threshold alerts, and real-time expense logging.',
      icon: DollarSign,
      color: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      badge: 'Screen #9',
      param: MOCK_TRIP_ID,
      cta: 'Explore Budget',
    },
    {
      id: 'calendar',
      title: 'Screen #10 — Trip Calendar / Timeline',
      desc: 'Day-by-day vertical chronological agenda and month/week calendar grid with activity time slots and city stops.',
      icon: Calendar,
      color: 'bg-blue-50 text-blue-800 border-blue-200',
      badge: 'Screen #10',
      param: MOCK_TRIP_ID,
      cta: 'View Timeline & Calendar',
    },
    {
      id: 'share',
      title: 'Screen #11 — Shared / Public Itinerary',
      desc: 'Zero-auth public itinerary with TripAdvisor split hero banner, full journey timeline, "Copy Trip" action, and social modal.',
      icon: Share2,
      color: 'bg-brand-light text-ink border-brand/40',
      badge: 'Screen #11',
      param: MOCK_SHARE_SLUG,
      cta: 'Open Public Itinerary',
    },
    {
      id: 'admin',
      title: 'Screen #13 — Admin & Analytics Dashboard',
      desc: 'Platform KPIs, user growth & trip velocity Recharts area charts, destination leaderboard, and user role management.',
      icon: Shield,
      color: 'bg-purple-50 text-purple-800 border-purple-200',
      badge: 'Screen #13',
      cta: 'Launch Admin Console',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fade-in">
      {/* Hero Welcome Box */}
      <div className="bg-surface-white rounded-3xl p-8 sm:p-12 border border-surface-subtle shadow-card mb-10 relative overflow-hidden">
        <div className="max-w-2xl relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-light text-ink text-xs font-bold mb-4 border border-brand/40">
            <Sparkles className="w-3.5 h-3.5" /> Person C Implementation Suite
          </div>
          <h1 className="font-display font-black text-3xl sm:text-4xl lg:text-5xl text-ink tracking-tight leading-tight">
            Money, Time & Sharing Vertical Slice
          </h1>
          <p className="text-sm sm:text-base text-ink-muted mt-4 leading-relaxed">
            Full-stack implementation for GlobeTrotter as specified in the Architecture Roadmap (Section 7, Line 526). Includes all database models, Express REST APIs, Recharts data visualizers, and TripAdvisor-styled responsive UI screens.
          </p>

          <div className="flex flex-wrap items-center gap-3 mt-6 text-xs text-ink font-semibold">
            <span className="flex items-center gap-1.5 bg-surface px-3 py-1.5 rounded-full border border-surface-subtle">
              <CheckCircle2 className="w-4 h-4 text-success" /> React 18 + Vite + TS
            </span>
            <span className="flex items-center gap-1.5 bg-surface px-3 py-1.5 rounded-full border border-surface-subtle">
              <Database className="w-4 h-4 text-brand-dark" /> Prisma + PostgreSQL
            </span>
            <span className="flex items-center gap-1.5 bg-surface px-3 py-1.5 rounded-full border border-surface-subtle">
              <Layers className="w-4 h-4 text-info" /> Recharts Data Viz
            </span>
          </div>
        </div>

        {/* Decorative Watermark */}
        <div className="hidden lg:block absolute -right-8 -bottom-8 opacity-10 pointer-events-none select-none text-ink font-black font-display text-[160px]">
          C
        </div>
      </div>

      {/* 4 Feature Screen Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.id}
              onClick={() => onNavigate(card.id, card.param)}
              className="bg-surface-white rounded-3xl p-6 sm:p-8 border border-surface-subtle shadow-card hover:border-brand hover:shadow-hover transition-all cursor-pointer flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${card.color} shadow-sm`}>
                    <Icon className="w-6 h-6 stroke-[2.5]" />
                  </div>
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-surface text-ink border border-surface-subtle">
                    {card.badge}
                  </span>
                </div>

                <h3 className="font-display font-bold text-xl text-ink group-hover:text-brand-dark transition-colors">
                  {card.title}
                </h3>
                <p className="text-xs sm:text-sm text-ink-muted mt-2 leading-relaxed">
                  {card.desc}
                </p>
              </div>

              <div className="pt-6 mt-6 border-t border-surface-subtle flex items-center justify-between">
                <span className="text-xs font-bold text-ink flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  {card.cta} <ArrowRight className="w-4 h-4 text-brand" />
                </span>
                <span className="text-[11px] text-ink-muted">Person C Vertical</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Backend API Endpoints Reference Card */}
      <div className="bg-surface-white rounded-3xl p-6 sm:p-8 border border-surface-subtle shadow-card">
        <div className="flex items-center gap-2 mb-4">
          <Terminal className="w-5 h-5 text-brand" />
          <h3 className="font-display font-bold text-lg text-ink">Person C API Modules & Endpoints</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-mono">
          <div className="p-4 rounded-2xl bg-surface border border-surface-subtle">
            <p className="font-bold text-ink mb-2">💰 /api/v1/trips/:id/budget</p>
            <ul className="space-y-1 text-ink-muted text-[11px]">
              <li>GET / - Full breakdown</li>
              <li>POST /expenses - Add expense</li>
              <li>DELETE /expenses/:id</li>
              <li>GET /daily-average</li>
            </ul>
          </div>
          <div className="p-4 rounded-2xl bg-surface border border-surface-subtle">
            <p className="font-bold text-ink mb-2">📅 /api/v1/trips/:id/calendar</p>
            <ul className="space-y-1 text-ink-muted text-[11px]">
              <li>GET / - Day-by-day feed</li>
              <li>Includes stops, events & actual costs</li>
            </ul>
          </div>
          <div className="p-4 rounded-2xl bg-surface border border-surface-subtle">
            <p className="font-bold text-ink mb-2">🔗 /api/v1/share</p>
            <ul className="space-y-1 text-ink-muted text-[11px]">
              <li>POST /trips/:id/share - Slug</li>
              <li>GET /:slug - Public (No Auth)</li>
              <li>POST /:slug/copy - Clone trip</li>
            </ul>
          </div>
          <div className="p-4 rounded-2xl bg-surface border border-surface-subtle">
            <p className="font-bold text-ink mb-2">📊 /api/v1/admin</p>
            <ul className="space-y-1 text-ink-muted text-[11px]">
              <li>GET /stats/overview - KPIs</li>
              <li>GET /stats/top-cities</li>
              <li>GET /stats/top-activities</li>
              <li>GET /users & PATCH /role</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
