import { NavLink, Outlet } from 'react-router-dom';
import { cn } from '@/lib/cn';
import { useAuthStore } from '@/store/authStore';

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard', icon: '🏠' },
  { to: '/trips', label: 'My Trips', icon: '🧳' },
] as const;

function NavItem({ to, label, icon, className }: { to: string; label: string; icon: string; className?: string }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn(
          'flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-colors',
          isActive ? 'bg-brand text-ink' : 'text-ink/70 hover:bg-ink/5',
          className,
        )
      }
    >
      <span aria-hidden>{icon}</span>
      {label}
    </NavLink>
  );
}

export function AppShell() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  return (
    <div className="min-h-screen bg-surface">
      {/* Sticky top navbar — TripAdvisor pattern: logo left, nav links, pill CTA + profile right */}
      <header className="sticky top-0 z-30 border-b border-ink/10 bg-surface-white">
        <div className="mx-auto flex h-16 max-w-[1280px] items-center justify-between px-4 sm:px-6 lg:px-10">
          <NavLink to="/dashboard" className="font-display text-xl font-extrabold text-ink">
            Globe<span className="text-brand">Trotter</span>
          </NavLink>

          <nav className="hidden items-center gap-1 lg:flex">
            {NAV_ITEMS.map((item) => (
              <NavItem key={item.to} {...item} />
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <NavLink
              to="/trips/new"
              className="hidden rounded-full border border-brand px-4 py-2 text-sm font-semibold text-ink hover:bg-brand/10 sm:inline-flex"
            >
              + Plan New Trip
            </NavLink>
            <button
              onClick={logout}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-ink text-sm font-bold text-surface-white"
              title={user?.name}
            >
              {user?.name?.[0]?.toUpperCase() ?? '?'}
            </button>
          </div>
        </div>
      </header>

      <main>
        <Outlet />
      </main>

      {/* Bottom tab bar — mobile & tablet only (Section 5.2) */}
      <nav className="fixed inset-x-0 bottom-0 z-30 flex items-center justify-around border-t border-ink/10 bg-surface-white py-2 lg:hidden">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                'flex min-w-[64px] flex-col items-center gap-0.5 rounded-lg px-3 py-1.5 text-xs font-semibold',
                isActive ? 'text-ink' : 'text-ink/50',
              )
            }
          >
            <span className="text-lg" aria-hidden>
              {item.icon}
            </span>
            {item.label}
          </NavLink>
        ))}
        <NavLink
          to="/trips/new"
          className="flex min-w-[64px] flex-col items-center gap-0.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-ink/50"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand text-base text-ink">+</span>
          New Trip
        </NavLink>
      </nav>
    </div>
  );
}
