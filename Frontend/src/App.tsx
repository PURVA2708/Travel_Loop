import React from 'react';
import { Routes, Route, Navigate, useParams } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { AuthLayout } from './components/layout/AuthLayout';
import { ProtectedRoute } from './components/layout/ProtectedRoute';

import { LoginPage } from './pages/auth/LoginPage';
import { SignupPage } from './pages/auth/SignupPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';

import { DashboardPage } from './pages/dashboard/DashboardPage';
import { CitySearchPage } from './pages/cities/CitySearchPage';
import { ActivitySearchPage } from './pages/activities/ActivitySearchPage';
import { ProfilePage } from './pages/profile/ProfilePage';

import { MyTripsPage } from './pages/trips/MyTripsPage';
import { CreateTripPage } from './pages/trips/CreateTripPage';
import { ItineraryBuilderPage } from './pages/trips/ItineraryBuilderPage';
import { ItineraryViewPage } from './pages/trips/ItineraryViewPage';

import { BudgetPage } from './pages/BudgetPage';
import { CalendarTimelinePage } from './pages/CalendarTimelinePage';
import { SharedItineraryPage } from './pages/SharedItineraryPage';
import { AdminAnalyticsPage } from './pages/AdminAnalyticsPage';

// Route wrappers for params
const BudgetPageRoute: React.FC = () => {
  const { tripId } = useParams();
  return <BudgetPage tripId={tripId} />;
};

const CalendarPageRoute: React.FC = () => {
  const { tripId } = useParams();
  return <CalendarTimelinePage tripId={tripId} />;
};

const SharedPageRoute: React.FC = () => {
  const { slug } = useParams();
  return <SharedItineraryPage slug={slug} />;
};

export const App: React.FC = () => {
  return (
    <Routes>
      {/* Main App Layout — every screen here requires login */}
      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/cities" element={<CitySearchPage />} />
        <Route path="/activities" element={<ActivitySearchPage />} />

        {/* Trips (Person B) */}
        <Route path="/trips" element={<MyTripsPage />} />
        <Route path="/trips/new" element={<CreateTripPage />} />
        <Route path="/trips/:tripId/builder" element={<ItineraryBuilderPage />} />
        <Route path="/trips/:tripId/view" element={<ItineraryViewPage />} />

        {/* Budget & Calendar (Person C) */}
        <Route path="/budget" element={<BudgetPageRoute />} />
        <Route path="/budget/:tripId" element={<BudgetPageRoute />} />
        <Route path="/calendar" element={<CalendarPageRoute />} />
        <Route path="/calendar/:tripId" element={<CalendarPageRoute />} />
        <Route path="/admin" element={<AdminAnalyticsPage />} />

        {/* User Profile */}
        <Route path="/profile" element={<ProfilePage />} />
      </Route>

      {/* Standalone Shared Page */}
      <Route path="/share/:slug" element={<SharedPageRoute />} />

      {/* Auth Layout */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      </Route>

      {/* 404 Fallback */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

export default App;
