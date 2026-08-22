import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Compass, Ticket, Bookmark, User } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { clsx } from 'clsx';

export const BottomNav: React.FC = () => {
  const { isAuthenticated } = useAuthStore();

  const tabs = [
    { label: 'Home', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Cities', path: '/cities', icon: Compass },
    { label: 'Activities', path: '/activities', icon: Ticket },
    { label: 'Saved', path: isAuthenticated ? '/profile?tab=saved' : '/login', icon: Bookmark },
    { label: 'Profile', path: isAuthenticated ? '/profile' : '/login', icon: User },
  ];

  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 bg-surface-white/95 backdrop-blur-md border-t border-ink-border/30 md:hidden pb-safe">
      <div className="flex items-center justify-around h-16 px-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <NavLink
              key={tab.label}
              to={tab.path}
              className={({ isActive }) =>
                clsx(
                  'flex flex-col items-center justify-center w-full h-full py-1 text-[11px] font-medium transition-colors select-none',
                  isActive
                    ? 'text-brand-dark font-bold'
                    : 'text-ink-muted hover:text-ink'
                )
              }
            >
              {({ isActive }) => (
                <>
                  <div
                    className={clsx(
                      'p-1 rounded-full transition-transform',
                      isActive && 'bg-brand/20 scale-110'
                    )}
                  >
                    <Icon className={clsx('w-5 h-5', isActive ? 'stroke-[2.5] text-ink' : '')} />
                  </div>
                  <span className="mt-0.5">{tab.label}</span>
                </>
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};
