import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Compass, Ticket, Bookmark, User, X, PlusCircle } from 'lucide-react';
import { useUiStore } from '../../store/uiStore';
import { useAuthStore } from '../../store/authStore';
import { clsx } from 'clsx';

export const Sidebar: React.FC = () => {
  const { sidebarOpen, setSidebarOpen } = useUiStore();
  const { isAuthenticated } = useAuthStore();

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Explore Cities', path: '/cities', icon: Compass },
    { label: 'Activities', path: '/activities', icon: Ticket },
    ...(isAuthenticated
      ? [
          { label: 'Saved Destinations', path: '/profile?tab=saved', icon: Bookmark },
          { label: 'My Profile', path: '/profile', icon: User },
        ]
      : []),
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-50 bg-ink/60 backdrop-blur-sm md:hidden transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar Drawer / Rail */}
      <aside
        className={clsx(
          'fixed md:static inset-y-0 left-0 z-50 w-64 bg-surface-white border-r border-ink-border/30 flex flex-col justify-between transition-transform duration-300 ease-in-out md:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="p-5">
          {/* Header on mobile */}
          <div className="flex items-center justify-between md:hidden pb-4 mb-4 border-b border-ink-border/30">
            <span className="font-extrabold text-ink text-lg">Menu</span>
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-1.5 rounded-lg text-ink hover:bg-surface"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Action CTA */}
          <div className="mb-6">
            <NavLink
              to="/cities"
              onClick={() => setSidebarOpen(false)}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-full bg-brand text-ink font-bold text-sm shadow-sm hover:bg-brand-dark transition-all duration-200"
            >
              <PlusCircle className="w-4 h-4 stroke-[2.5]" />
              Plan New Trip
            </NavLink>
          </div>

          {/* Nav Links */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) =>
                    clsx(
                      'flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150',
                      isActive
                        ? 'bg-ink text-surface-white font-semibold shadow-sm'
                        : 'text-ink hover:bg-surface hover:text-ink'
                    )
                  }
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Footer info */}
        <div className="p-4 border-t border-ink-border/20 text-center">
          <p className="text-[11px] font-medium text-ink-muted">
            GlobeTrotter v1.0 • Person A Vertical
          </p>
        </div>
      </aside>
    </>
  );
};
