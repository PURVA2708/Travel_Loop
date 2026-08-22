import React, { useState, useEffect } from 'react';
import { Navbar } from './components/common/Navbar.tsx';
import { HomePage } from './pages/HomePage.tsx';
import { BudgetPage } from './pages/BudgetPage.tsx';
import { CalendarTimelinePage } from './pages/CalendarTimelinePage.tsx';
import { SharedItineraryPage } from './pages/SharedItineraryPage.tsx';
import { AdminAnalyticsPage } from './pages/AdminAnalyticsPage.tsx';
import { MOCK_TRIP_ID, MOCK_SHARE_SLUG } from './services/api.ts';

export const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<string>('home');
  const [currentParam, setCurrentParam] = useState<string | undefined>(undefined);

  // Sync hash routing with window location
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#/', '').replace('#', '');
      if (!hash) {
        setCurrentTab('home');
        setCurrentParam(undefined);
        return;
      }

      if (hash.startsWith('budget')) {
        const parts = hash.split('/');
        setCurrentTab('budget');
        setCurrentParam(parts[1] || MOCK_TRIP_ID);
      } else if (hash.startsWith('calendar')) {
        const parts = hash.split('/');
        setCurrentTab('calendar');
        setCurrentParam(parts[1] || MOCK_TRIP_ID);
      } else if (hash.startsWith('share')) {
        const parts = hash.split('/');
        setCurrentTab('share');
        setCurrentParam(parts[1] || MOCK_SHARE_SLUG);
      } else if (hash.startsWith('admin')) {
        setCurrentTab('admin');
        setCurrentParam(undefined);
      } else {
        setCurrentTab('home');
        setCurrentParam(undefined);
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigateTo = (tab: string, param?: string) => {
    setCurrentTab(tab);
    setCurrentParam(param);
    if (tab === 'home') {
      window.location.hash = '#/';
    } else if (param) {
      window.location.hash = `#/${tab}/${param}`;
    } else {
      window.location.hash = `#/${tab}`;
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-surface text-ink font-sans">
      <Navbar currentTab={currentTab} onNavigate={navigateTo} />

      <main className="flex-1">
        {currentTab === 'home' && <HomePage onNavigate={navigateTo} />}
        {currentTab === 'budget' && <BudgetPage tripId={currentParam || MOCK_TRIP_ID} />}
        {currentTab === 'calendar' && (
          <CalendarTimelinePage tripId={currentParam || MOCK_TRIP_ID} />
        )}
        {currentTab === 'share' && (
          <SharedItineraryPage
            slug={currentParam || MOCK_SHARE_SLUG}
            onNavigate={navigateTo}
          />
        )}
        {currentTab === 'admin' && <AdminAnalyticsPage />}
      </main>

      {/* Modern TripAdvisor Styled Footer */}
      <footer className="bg-surface-white border-t border-surface-subtle py-8 text-center text-xs text-ink-muted">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-brand" />
            <span className="font-bold text-ink">GlobeTrotter</span> — Person C Vertical Suite
          </div>
          <p>© 2026 GlobeTrotter Hackathon Edition · Money, Time & Sharing</p>
          <div className="flex items-center gap-4 text-[11px] font-semibold">
            <button onClick={() => navigateTo('budget', MOCK_TRIP_ID)} className="hover:text-ink">
              Budget #9
            </button>
            <button onClick={() => navigateTo('calendar', MOCK_TRIP_ID)} className="hover:text-ink">
              Calendar #10
            </button>
            <button onClick={() => navigateTo('share', MOCK_SHARE_SLUG)} className="hover:text-ink">
              Share #11
            </button>
            <button onClick={() => navigateTo('admin')} className="hover:text-ink">
              Admin #13
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};
export default App;
import { Navigate, Route, Routes } from 'react-router-dom';
import { AppShell } from '@/components/layout/AppShell';
import { RequireAuth } from '@/components/layout/RequireAuth';
import { LoginPage } from '@/pages/auth/LoginPage';
import { SignupPage } from '@/pages/auth/SignupPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { MyTripsPage } from '@/pages/trips/MyTripsPage';
import { CreateTripPage } from '@/pages/trips/CreateTripPage';
import { ItineraryBuilderPage } from '@/pages/trips/ItineraryBuilderPage';
import { ItineraryViewPage } from '@/pages/trips/ItineraryViewPage';
import { NotFoundPage } from '@/pages/NotFoundPage';

export function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />

      <Route
        element={
          <RequireAuth>
            <AppShell />
          </RequireAuth>
        }
      >
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/trips" element={<MyTripsPage />} />
        <Route path="/trips/new" element={<CreateTripPage />} />
        <Route path="/trips/:tripId/builder" element={<ItineraryBuilderPage />} />
        <Route path="/trips/:tripId/view" element={<ItineraryViewPage />} />
      </Route>

      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
