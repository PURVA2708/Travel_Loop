import React from 'react';
import { Compass, DollarSign, Calendar, Share2, Shield, Menu, X } from 'lucide-react';
import { MOCK_TRIP_ID, MOCK_SHARE_SLUG } from '../../services/api.ts';

interface NavbarProps {
  currentTab: string;
  onNavigate: (tab: string, param?: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, onNavigate }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const navItems = [
    { id: 'home', label: 'Overview', icon: Compass },
    { id: 'budget', label: 'Budget (#9)', icon: DollarSign, param: MOCK_TRIP_ID },
    { id: 'calendar', label: 'Calendar & Timeline (#10)', icon: Calendar, param: MOCK_TRIP_ID },
    { id: 'share', label: 'Public Itinerary (#11)', icon: Share2, param: MOCK_SHARE_SLUG },
    { id: 'admin', label: 'Admin Analytics (#13)', icon: Shield },
  ];

  return (
    <header className="sticky top-0 z-40 bg-surface-white border-b border-surface-subtle shadow-subtle">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div 
            onClick={() => onNavigate('home')} 
            className="flex items-center gap-2.5 cursor-pointer select-none group"
          >
            <div className="w-10 h-10 rounded-full bg-brand flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
              <Compass className="w-6 h-6 text-ink stroke-[2.5]" />
            </div>
            <div>
              <span className="font-display font-bold text-xl tracking-tight text-ink flex items-center gap-1.5">
                GlobeTrotter
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-brand-light text-ink border border-brand/40">
                  Person C
                </span>
              </span>
              <p className="text-[10px] text-ink-muted -mt-1 hidden sm:block">Money · Time · Sharing</p>
            </div>
          </div>

          {/* Desktop Nav Items */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id, item.param)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-full text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-ink text-surface font-semibold shadow-sm'
                      : 'text-ink hover:bg-surface hover:text-ink'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-brand' : 'text-ink-muted'}`} />
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Right Action / Profile Pill */}
          <div className="hidden lg:flex items-center gap-3">
            <button
              onClick={() => onNavigate('share', MOCK_SHARE_SLUG)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full border-2 border-brand text-ink text-sm font-semibold hover:bg-brand-light transition-all"
            >
              <Share2 className="w-4 h-4 text-ink" />
              <span>Share Preview</span>
            </button>
            
            <div className="flex items-center gap-2 pl-2 border-l border-surface-subtle">
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
                alt="Purva Sharma"
                className="w-8 h-8 rounded-full ring-2 ring-brand object-cover"
              />
              <span className="text-xs font-bold text-ink">Purva (C)</span>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-ink hover:bg-surface"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-surface-white border-b border-surface-subtle px-4 pt-2 pb-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onNavigate(item.id, item.param);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-left text-sm font-medium ${
                  isActive ? 'bg-brand text-ink font-bold' : 'text-ink hover:bg-surface'
                }`}
              >
                <Icon className="w-5 h-5" />
                {item.label}
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
};
