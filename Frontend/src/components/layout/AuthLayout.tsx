import React from 'react';
import { Link, Outlet } from 'react-router-dom';
import { MapPin, ShieldCheck } from 'lucide-react';
import { LogoMark } from './Logo';

const HIGHLIGHTS = [
  { icon: MapPin, text: 'Curated activities across 15+ world-class cities' },
  { icon: ShieldCheck, text: 'Your itinerary, budget, and data stay private' },
];

export const AuthLayout: React.FC = () => {
  return (
    <div className="min-h-screen w-full bg-surface lg:grid lg:grid-cols-2">
      {/* Left: brand panel — desktop only */}
      <div className="hero-banner-gradient relative hidden flex-col justify-between overflow-hidden px-12 py-12 text-surface-white lg:flex">
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-brand/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -left-16 h-80 w-80 rounded-full bg-brand/10 blur-3xl" />

        <Link to="/" className="relative flex items-center gap-2.5">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-brand to-brand-dark text-white shadow-sm">
            <LogoMark className="h-6 w-6" />
          </div>
          <span className="text-xl font-extrabold tracking-tight">
            Globe<span className="text-brand">Trotter</span>
          </span>
        </Link>

        <div className="relative max-w-md">
          <h1 className="font-display text-4xl font-extrabold leading-tight">
            Plan trips that feel like they planned themselves.
          </h1>
          <p className="mt-4 text-sm text-surface-white/70">
            Multi-city itineraries, budget tracking, and destination discovery — all in one place.
          </p>

          <div className="mt-8 flex flex-col gap-4">
            {HIGHLIGHTS.map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface-white/10">
                  <Icon className="h-4 w-4" />
                </div>
                <p className="text-sm text-surface-white/80">{text}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="relative text-xs text-surface-white/40">© 2026 GlobeTrotter. All rights reserved.</p>
      </div>

      {/* Right: form panel */}
      <div className="flex flex-col justify-center px-4 py-12 sm:px-6 lg:px-16">
        <div className="mx-auto w-full max-w-[420px]">
          <Link to="/" className="mb-8 flex items-center justify-center gap-2.5 lg:hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-brand to-brand-dark text-white shadow-sm">
              <LogoMark className="h-6 w-6" />
            </div>
            <span className="text-xl font-extrabold tracking-tight text-ink">
              Globe<span className="text-brand-dark">Trotter</span>
            </span>
          </Link>
          <Outlet />
        </div>
      </div>
    </div>
  );
};
