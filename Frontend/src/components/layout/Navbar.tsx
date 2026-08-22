import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BarChart3, Bookmark, Compass, LogOut, PlusCircle, Sparkles, User as UserIcon } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { Button } from '../common/Button';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuthStore();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-40 w-full glass-nav border-b border-ink-border/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Left: Brand Logo */}
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-full bg-brand flex items-center justify-center text-ink shadow-sm group-hover:scale-105 transition-transform">
              <Compass className="w-6 h-6 stroke-[2.5]" />
            </div>
            <span className="text-xl font-extrabold tracking-tight text-ink">
              Globe<span className="text-brand-dark">Trotter</span>
            </span>
          </Link>
        </div>

        {/* Center: Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2">
          <Link
            to="/dashboard"
            className="px-3.5 py-2 text-sm font-medium text-ink hover:text-brand-dark hover:bg-surface rounded-full transition-colors"
          >
            Dashboard
          </Link>
          <Link
            to="/trips"
            className="px-3.5 py-2 text-sm font-medium text-ink hover:text-brand-dark hover:bg-surface rounded-full transition-colors"
          >
            My Trips
          </Link>
          <Link
            to="/cities"
            className="px-3.5 py-2 text-sm font-medium text-ink hover:text-brand-dark hover:bg-surface rounded-full transition-colors"
          >
            Explore Cities
          </Link>
          <Link
            to="/activities"
            className="px-3.5 py-2 text-sm font-medium text-ink hover:text-brand-dark hover:bg-surface rounded-full transition-colors"
          >
            Activities
          </Link>
        </nav>

        {/* Right: Actions & User Dropdown */}
        <div className="flex items-center gap-2.5">
          <Link
            to="/trips/new"
            className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-brand text-xs font-bold text-ink shadow-sm hover:bg-brand-dark transition-colors"
          >
            <PlusCircle className="w-3.5 h-3.5 stroke-[2.5]" />
            Plan New Trip
          </Link>

          {/* TripAdvisor-inspired AI Pill */}
          <Link
            to="/cities"
            className="hidden lg:inline-flex items-center gap-1.5 px-4 py-2 rounded-full border-2 border-brand text-xs font-bold text-ink hover:bg-brand/10 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-brand-dark fill-brand" />
            AI Assistant
          </Link>

          {isAuthenticated && user ? (
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full border border-ink-border/40 hover:border-brand bg-surface-white transition-all duration-200"
              >
                {user.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={user.name}
                    className="w-7 h-7 rounded-full object-cover border border-brand/50"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-brand text-ink flex items-center justify-center font-bold text-xs">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <span className="text-xs font-semibold text-ink max-w-[100px] truncate hidden sm:inline">
                  {user.name}
                </span>
              </button>

              {/* Dropdown Menu */}
              {dropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setDropdownOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-56 bg-surface-white rounded-2xl shadow-modal border border-ink-border/30 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-4 py-2 border-b border-ink-border/20">
                      <p className="text-xs font-bold text-ink truncate">{user.name}</p>
                      <p className="text-[11px] text-ink-muted truncate">{user.email}</p>
                    </div>

                    <Link
                      to="/profile"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-ink hover:bg-surface transition-colors"
                    >
                      <UserIcon className="w-4 h-4 text-ink-muted" />
                      My Profile & Settings
                    </Link>

                    <Link
                      to="/profile?tab=saved"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-ink hover:bg-surface transition-colors"
                    >
                      <Bookmark className="w-4 h-4 text-ink-muted" />
                      Saved Wishlist
                    </Link>

                    {user.role?.toLowerCase() === 'admin' && (
                      <Link
                        to="/admin"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-ink hover:bg-surface transition-colors"
                      >
                        <BarChart3 className="w-4 h-4 text-ink-muted" />
                        Analytics Dashboard
                      </Link>
                    )}

                    <div className="border-t border-ink-border/20 my-1" />

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-danger hover:bg-danger/10 transition-colors text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login">
                <Button variant="secondary" size="sm" pill>
                  Sign In
                </Button>
              </Link>
              <Link to="/signup" className="hidden sm:inline-block">
                <Button variant="primary" size="sm" pill>
                  Sign Up
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
