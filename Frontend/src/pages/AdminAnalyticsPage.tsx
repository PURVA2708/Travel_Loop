import React, { useState, useEffect } from 'react';
import {
  Users,
  Compass,
  MapPin,
  TrendingUp,
  Shield,
  Search,
  CheckCircle2,
  DollarSign,
  RefreshCw,
} from 'lucide-react';
import { apiClient } from '../services/api.ts';
import { AdminStats, TopCity, TopActivity, AdminUser } from '../types/index.ts';
import { SignupsAreaChart, TopActivitiesBarChart } from '../components/charts/AnalyticsCharts.tsx';

export const AdminAnalyticsPage: React.FC = () => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [topCities, setTopCities] = useState<TopCity[]>([]);
  const [topActivities, setTopActivities] = useState<TopActivity[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [userSearch, setUserSearch] = useState('');

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const data = await apiClient.getAdminStats();
      setStats(data.stats);
      setTopCities(data.topCities);
      setTopActivities(data.topActivities);
      setUsers(data.users);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleRoleToggle = (userId: string) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          const nextRole = u.role === 'admin' ? 'user' : 'admin';
          return { ...u, role: nextRole };
        }
        return u;
      })
    );
  };

  if (loading && !stats) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col items-center justify-center min-h-[50vh]">
        <RefreshCw className="w-8 h-8 text-brand animate-spin mb-4" />
        <p className="text-sm font-semibold text-ink">Aggregating Admin Platform Analytics...</p>
      </div>
    );
  }

  if (!stats) return null;

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearch.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-ink text-brand text-xs font-bold uppercase tracking-wider">
              Screen #13
            </span>
            <span className="text-xs text-ink-muted">Admin Intelligence & Governance</span>
          </div>
          <h1 className="font-display font-bold text-2xl sm:text-3xl text-ink tracking-tight">
            GlobeTrotter Platform Analytics
          </h1>
          <p className="text-xs sm:text-sm text-ink-muted mt-0.5">
            Real-time KPIs, destination trends, and user administration
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" /> System Healthy
          </span>
        </div>
      </div>

      {/* 4 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-surface-white p-5 rounded-2xl border border-surface-subtle shadow-card flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-ink-muted uppercase">Active Travelers</p>
            <p className="font-display font-bold text-2xl text-ink mt-1">
              {stats.totalUsers.toLocaleString('en-IN')}
            </p>
            <p className="text-[11px] text-success mt-1 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> +18% this month
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-brand-light flex items-center justify-center text-ink">
            <Users className="w-6 h-6 stroke-[2.5]" />
          </div>
        </div>

        <div className="bg-surface-white p-5 rounded-2xl border border-surface-subtle shadow-card flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-ink-muted uppercase">Trips Configured</p>
            <p className="font-display font-bold text-2xl text-ink mt-1">
              {stats.totalTrips.toLocaleString('en-IN')}
            </p>
            <p className="text-[11px] text-ink-muted mt-1">
              {stats.tripsByStatus.planned} upcoming journeys
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-700">
            <Compass className="w-6 h-6 stroke-[2.5]" />
          </div>
        </div>

        <div className="bg-surface-white p-5 rounded-2xl border border-surface-subtle shadow-card flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-ink-muted uppercase">Platform Budget Volume</p>
            <p className="font-display font-bold text-2xl text-ink mt-1">
              ₹{(stats.totalBudgetVolume / 10000000).toFixed(2)} Cr
            </p>
            <p className="text-[11px] text-ink-muted mt-1">
              Avg ₹{stats.avgBudget.toLocaleString('en-IN')} / trip
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-800">
            <DollarSign className="w-6 h-6 text-success stroke-[2.5]" />
          </div>
        </div>

        <div className="bg-surface-white p-5 rounded-2xl border border-surface-subtle shadow-card flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-ink-muted uppercase">Destinations & Tours</p>
            <p className="font-display font-bold text-2xl text-ink mt-1">
              {stats.totalCities} Cities · {stats.totalActivities} Tours
            </p>
            <p className="text-[11px] text-ink-muted mt-1">100% Curated Inventory</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-800">
            <MapPin className="w-6 h-6 stroke-[2.5]" />
          </div>
        </div>
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Growth Trend Area Chart */}
        <div className="bg-surface-white p-6 sm:p-8 rounded-3xl border border-surface-subtle shadow-card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-display font-bold text-lg text-ink">Growth & Itinerary Velocity</h3>
              <p className="text-xs text-ink-muted">User signups vs trips planned (H1 2026)</p>
            </div>
          </div>
          <SignupsAreaChart data={stats.signupsByMonth} />
        </div>

        {/* Popular Categories Bar Chart */}
        <div className="bg-surface-white p-6 sm:p-8 rounded-3xl border border-surface-subtle shadow-card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-display font-bold text-lg text-ink">Popular Activity Categories</h3>
              <p className="text-xs text-ink-muted">Top planned activities across all itineraries</p>
            </div>
          </div>
          <TopActivitiesBarChart data={topActivities} />
        </div>
      </div>

      {/* Top Destinations Leaderboard */}
      <div className="bg-surface-white p-6 sm:p-8 rounded-3xl border border-surface-subtle shadow-card mb-8">
        <h3 className="font-display font-bold text-xl text-ink mb-1">Top Planned Destinations</h3>
        <p className="text-xs text-ink-muted mb-6">Most added cities in user travel loops</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {topCities.map((city, idx) => (
            <div
              key={city.name}
              className="p-4 rounded-2xl bg-surface/70 border border-surface-subtle flex flex-col justify-between hover:bg-surface-white transition-all shadow-sm group"
            >
              {city.imageUrl && (
                <img
                  src={city.imageUrl}
                  alt={city.name}
                  className="w-full h-28 rounded-xl object-cover mb-3 ring-1 ring-black/5 group-hover:scale-102 transition-transform"
                />
              )}
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-brand-dark bg-brand-light px-2 py-0.5 rounded-md">
                    #{idx + 1}
                  </span>
                  <span className="text-xs font-semibold text-ink-muted">{city.count} trips</span>
                </div>
                <h4 className="font-display font-bold text-base text-ink mt-2">{city.name}</h4>
                <p className="text-xs text-ink-muted">{city.country}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* User Governance & Role Management */}
      <div className="bg-surface-white p-6 sm:p-8 rounded-3xl border border-surface-subtle shadow-card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="font-display font-bold text-xl text-ink">User Administration</h3>
            <p className="text-xs text-ink-muted">Manage roles and permissions across registered accounts</p>
          </div>

          <div className="relative">
            <Search className="w-4 h-4 text-ink-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search user name or email..."
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
              className="pl-9 pr-4 py-2 text-xs rounded-full bg-surface border border-gray-200 text-ink focus:outline-none focus:ring-2 focus:ring-brand w-64"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-surface-subtle text-ink-muted uppercase tracking-wider font-bold">
                <th className="pb-3 px-3">User</th>
                <th className="pb-3 px-3">Email</th>
                <th className="pb-3 px-3">Role</th>
                <th className="pb-3 px-3">Trips Created</th>
                <th className="pb-3 px-3">Member Since</th>
                <th className="pb-3 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-subtle">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-surface/50 transition-colors">
                  <td className="py-3.5 px-3 font-semibold text-ink flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-ink text-brand flex items-center justify-center font-bold text-xs">
                      {user.name.charAt(0)}
                    </div>
                    {user.name}
                  </td>
                  <td className="py-3.5 px-3 text-ink-muted">{user.email}</td>
                  <td className="py-3.5 px-3">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-bold text-[11px] ${
                        user.role === 'admin'
                          ? 'bg-purple-100 text-purple-900 border border-purple-200'
                          : 'bg-surface text-ink-muted border border-gray-200'
                      }`}
                    >
                      <Shield className="w-3 h-3" />
                      {user.role.toUpperCase()}
                    </span>
                  </td>
                  <td className="py-3.5 px-3 font-bold text-ink">{user._count.trips}</td>
                  <td className="py-3.5 px-3 text-ink-muted">
                    {new Date(user.createdAt).toLocaleDateString('en-IN', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </td>
                  <td className="py-3.5 px-3 text-right">
                    <button
                      onClick={() => handleRoleToggle(user.id)}
                      className="px-3 py-1 rounded-full text-xs font-semibold border border-gray-200 hover:bg-surface text-ink transition-colors"
                    >
                      Toggle Role
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
