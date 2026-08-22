import React, { useState, useEffect } from 'react';
import {
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  RefreshCw,
  SlidersHorizontal,
  LayoutList,
  CalendarDays,
  DollarSign,
  Plus,
  CheckCircle2,
} from 'lucide-react';
import { apiClient, MOCK_TRIP_ID } from '../services/api.ts';
import { CalendarData, ExpenseCategory } from '../types/index.ts';
import { CategoryBadge } from '../components/common/Badge.tsx';

const EXPENSE_CATEGORIES: { value: ExpenseCategory; label: string }[] = [
  { value: 'transport', label: 'Transport & Flights' },
  { value: 'stay', label: 'Accommodation & Stay' },
  { value: 'activities', label: 'Activities & Tours' },
  { value: 'meals', label: 'Meals & Dining' },
  { value: 'misc', label: 'Miscellaneous' },
];

function formatGridMonthLabel(days: { date: string }[]): string {
  if (days.length === 0) return '';
  const first = new Date(days[0].date);
  const last = new Date(days[days.length - 1].date);
  const firstLabel = first.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
  if (first.getMonth() === last.getMonth() && first.getFullYear() === last.getFullYear()) {
    return firstLabel;
  }
  const lastLabel = last.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
  return `${first.toLocaleDateString('en-IN', { month: 'short' })} – ${lastLabel}`;
}

export const CalendarTimelinePage: React.FC<{ tripId?: string }> = ({
  tripId = MOCK_TRIP_ID,
}) => {
  const [data, setData] = useState<CalendarData | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'timeline' | 'grid'>('timeline');
  const [selectedCity, setSelectedCity] = useState<string>('all');
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [logCategory, setLogCategory] = useState<ExpenseCategory>('activities');
  const [logAmount, setLogAmount] = useState('');
  const [logNote, setLogNote] = useState('');
  const [logSubmitting, setLogSubmitting] = useState(false);
  const [logSuccess, setLogSuccess] = useState<string | null>(null);
  const [logError, setLogError] = useState<string | null>(null);

  const fetchCalendar = async () => {
    setLoading(true);
    try {
      const res = await apiClient.getCalendar(tripId);
      setData(res);
      if (res.days.length > 0) {
        setSelectedDate(res.days[0].date);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCalendar();
  }, [tripId]);

  useEffect(() => {
    setLogSuccess(null);
    setLogError(null);
  }, [selectedDate]);

  async function handleLogExpense(e: React.FormEvent, dayLabel: string) {
    e.preventDefault();
    const amount = Number(logAmount);
    if (!amount || amount <= 0) {
      setLogError('Enter a valid amount');
      return;
    }
    setLogSubmitting(true);
    setLogError(null);
    setLogSuccess(null);
    try {
      await apiClient.addExpense(tripId, {
        category: logCategory,
        amount,
        note: logNote ? `[${dayLabel}] ${logNote}` : `[${dayLabel}] Logged from Calendar`,
      });
      setLogSuccess(`Logged ₹${amount.toLocaleString('en-IN')} for ${dayLabel}`);
      setLogAmount('');
      setLogNote('');
    } catch (err) {
      console.error(err);
      setLogError('Could not log expense. Try again.');
    } finally {
      setLogSubmitting(false);
    }
  }

  if (loading && !data) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col items-center justify-center min-h-[50vh]">
        <RefreshCw className="w-8 h-8 text-brand animate-spin mb-4" />
        <p className="text-sm font-semibold text-ink">Assembling Day-by-Day Timeline...</p>
      </div>
    );
  }

  if (!data) return null;

  // Unique cities for filter
  const uniqueCities = Array.from(
    new Set(data.days.map((d) => d.cityStop?.cityName).filter(Boolean))
  ) as string[];

  const filteredDays = data.days.filter((day) => {
    if (selectedCity === 'all') return true;
    return day.cityStop?.cityName === selectedCity;
  });

  const activeDaySchedule = data.days.find((d) => d.date === selectedDate) || data.days[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-brand text-ink text-xs font-bold uppercase tracking-wider">
              Screen #10
            </span>
            <span className="text-xs text-ink-muted">Chrono Schedule & Timeline</span>
          </div>
          <h1 className="font-display font-bold text-2xl sm:text-3xl text-ink tracking-tight">
            {data.trip.name}
          </h1>
          <p className="text-xs sm:text-sm text-ink-muted mt-0.5">
            {new Date(data.trip.startDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })} –{' '}
            {new Date(data.trip.endDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })} · {data.totalDays} Total Days
          </p>
        </div>

        {/* View Switcher & Filter */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* City Filter */}
          <div className="flex items-center gap-1.5 bg-surface-white px-3.5 py-2 rounded-full border border-surface-subtle text-xs shadow-sm">
            <SlidersHorizontal className="w-3.5 h-3.5 text-ink-muted" />
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="bg-transparent font-semibold text-ink focus:outline-none cursor-pointer"
            >
              <option value="all">All Stops ({uniqueCities.length} Cities)</option>
              {uniqueCities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>

          {/* Toggle View Buttons */}
          <div className="flex items-center bg-surface-white p-1 rounded-full border border-surface-subtle shadow-sm">
            <button
              onClick={() => setViewMode('timeline')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
                viewMode === 'timeline'
                  ? 'bg-ink text-surface shadow-sm'
                  : 'text-ink-muted hover:text-ink'
              }`}
            >
              <LayoutList className="w-3.5 h-3.5" /> Timeline
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
                viewMode === 'grid'
                  ? 'bg-ink text-surface shadow-sm'
                  : 'text-ink-muted hover:text-ink'
              }`}
            >
              <CalendarDays className="w-3.5 h-3.5" /> Calendar
            </button>
          </div>
        </div>
      </div>

      {/* VIEW MODE 1: VERTICAL CHRONO TIMELINE */}
      {viewMode === 'timeline' ? (
        <div className="space-y-8">
          {filteredDays.map((day) => (
            <div
              key={day.date}
              className="bg-surface-white rounded-3xl p-6 sm:p-8 border border-surface-subtle shadow-card transition-all hover:border-brand/50"
            >
              {/* Day Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-surface-subtle gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-brand flex flex-col items-center justify-center text-ink font-bold shadow-sm">
                    <span className="text-[10px] uppercase tracking-wider font-extrabold -mb-1">DAY</span>
                    <span className="font-display text-lg">{day.dayNumber}</span>
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-lg sm:text-xl text-ink">
                      {new Date(day.date).toLocaleDateString('en-IN', {
                        weekday: 'long',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </h3>
                    {day.cityStop && (
                      <p className="text-xs text-ink-muted flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3.5 h-3.5 text-brand" />
                        <span className="font-semibold text-ink">{day.cityStop.cityName}</span>, {day.cityStop.country}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs px-3 py-1 rounded-full bg-surface text-ink font-semibold border border-surface-subtle">
                    {day.activities.length} Planned Events
                  </span>
                </div>
              </div>

              {/* Activity Cards inside this Day */}
              {day.activities.length === 0 ? (
                <div className="py-8 text-center text-ink-muted text-xs bg-surface/50 rounded-2xl mt-4 border border-dashed border-gray-200">
                  <p className="font-medium">Free day! No specific activities scheduled yet.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                  {day.activities.map((act) => (
                    <div
                      key={act.id}
                      className="group p-4 rounded-2xl bg-surface/60 border border-surface-subtle hover:bg-surface-white hover:border-brand/40 hover:shadow-hover transition-all flex gap-4 items-start"
                    >
                      {/* Image Thumbnail */}
                      {act.imageUrl && (
                        <img
                          src={act.imageUrl}
                          alt={act.name}
                          className="w-20 h-20 rounded-xl object-cover shrink-0 ring-1 ring-black/5"
                        />
                      )}

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          <CategoryBadge category={act.category} size="sm" />
                          {act.scheduledTime && (
                            <span className="text-xs font-bold text-ink-light bg-brand-light px-2 py-0.5 rounded-md flex items-center gap-1">
                              <Clock className="w-3 h-3 text-ink" />
                              {act.scheduledTime}
                            </span>
                          )}
                        </div>

                        <h4 className="font-bold text-sm text-ink truncate group-hover:text-brand-dark transition-colors">
                          {act.name}
                        </h4>

                        {act.description && (
                          <p className="text-xs text-ink-muted line-clamp-2 mt-1 leading-relaxed">
                            {act.description}
                          </p>
                        )}

                        <div className="flex items-center justify-between pt-2.5 mt-2.5 border-t border-gray-200/60 text-xs">
                          <span className="text-ink-muted flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {act.durationMinutes} mins
                          </span>
                          <span className="font-bold text-ink flex items-center gap-0.5">
                            <DollarSign className="w-3.5 h-3.5 text-brand stroke-[2.5]" />
                            ₹{act.actualCost.toLocaleString('en-IN')}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        /* VIEW MODE 2: INTERACTIVE CALENDAR GRID */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left 2 Cols: Month / Day Picker Grid */}
          <div className="lg:col-span-2 bg-surface-white p-6 sm:p-8 rounded-3xl border border-surface-subtle shadow-card">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-display font-bold text-xl text-ink flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-brand" /> {formatGridMonthLabel(data.days)}
              </h3>
              <span className="text-xs text-ink-muted font-medium">Click a day to view agenda</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
              {data.days.map((day) => {
                const isSelected = day.date === selectedDate;
                const dObj = new Date(day.date);
                return (
                  <div
                    key={day.date}
                    onClick={() => setSelectedDate(day.date)}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-ink text-surface border-ink shadow-hover scale-102'
                        : 'bg-surface/70 hover:bg-surface border-surface-subtle text-ink'
                    }`}
                  >
                    <p className={`text-[10px] font-bold uppercase tracking-wider ${isSelected ? 'text-brand' : 'text-ink-muted'}`}>
                      {dObj.toLocaleDateString('en-IN', { weekday: 'short' })}
                    </p>
                    <p className="font-display font-bold text-2xl mt-1">
                      {dObj.getDate()}
                    </p>
                    <div className="mt-3 flex items-center gap-1 flex-wrap">
                      {day.activities.slice(0, 3).map((_, idx) => (
                        <span
                          key={idx}
                          className={`w-2 h-2 rounded-full ${isSelected ? 'bg-brand' : 'bg-ink'}`}
                        />
                      ))}
                      {day.activities.length > 3 && (
                        <span className={`text-[9px] font-bold ${isSelected ? 'text-brand' : 'text-ink-muted'}`}>
                          +{day.activities.length - 3}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right 1 Col: Selected Day Agenda Card */}
          <div className="bg-surface-white p-6 rounded-3xl border border-surface-subtle shadow-card flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-surface-subtle">
                <div>
                  <span className="text-xs font-bold text-brand uppercase tracking-wider">Selected Day</span>
                  <h4 className="font-display font-bold text-lg text-ink">
                    {new Date(activeDaySchedule.date).toLocaleDateString('en-IN', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </h4>
                </div>
                {activeDaySchedule.cityStop && (
                  <span className="text-xs font-bold bg-brand-light text-ink px-2.5 py-1 rounded-full border border-brand/40">
                    {activeDaySchedule.cityStop.cityName}
                  </span>
                )}
              </div>

              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
                {activeDaySchedule.activities.length === 0 ? (
                  <p className="text-xs text-ink-muted py-6 text-center">No activities on this date.</p>
                ) : (
                  activeDaySchedule.activities.map((act) => (
                    <div
                      key={act.id}
                      className="p-3 rounded-xl bg-surface/80 border border-surface-subtle"
                    >
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-bold text-ink">{act.scheduledTime || 'Flexible Time'}</span>
                        <span className="text-brand-dark font-bold">₹{act.actualCost}</span>
                      </div>
                      <p className="font-semibold text-xs text-ink truncate">{act.name}</p>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-surface-subtle">
              <div className="flex items-center justify-between text-xs font-bold text-ink mb-4">
                <span>Day Spend Estimate:</span>
                <span>
                  ₹
                  {activeDaySchedule.activities
                    .reduce((acc, a) => acc + a.actualCost, 0)
                    .toLocaleString('en-IN')}
                </span>
              </div>

              {/* Log Expense for the Selected Day */}
              <form
                onSubmit={(e) =>
                  handleLogExpense(
                    e,
                    new Date(activeDaySchedule.date).toLocaleDateString('en-IN', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                    }),
                  )
                }
                className="space-y-2 rounded-2xl bg-surface/60 border border-surface-subtle p-3"
              >
                <p className="text-xs font-bold text-ink flex items-center gap-1.5">
                  <Plus className="w-3.5 h-3.5 text-brand-dark" /> Log expense for this day
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={logCategory}
                    onChange={(e) => setLogCategory(e.target.value as ExpenseCategory)}
                    className="col-span-1 rounded-lg border border-surface-subtle bg-surface-white px-2 py-1.5 text-xs text-ink focus:outline-none focus:ring-1 focus:ring-brand"
                  >
                    {EXPENSE_CATEGORIES.map((c) => (
                      <option key={c.value} value={c.value}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="Amount (₹)"
                    value={logAmount}
                    onChange={(e) => setLogAmount(e.target.value)}
                    className="col-span-1 rounded-lg border border-surface-subtle bg-surface-white px-2 py-1.5 text-xs text-ink focus:outline-none focus:ring-1 focus:ring-brand"
                  />
                </div>
                <input
                  type="text"
                  placeholder="Note (optional)"
                  value={logNote}
                  onChange={(e) => setLogNote(e.target.value)}
                  className="w-full rounded-lg border border-surface-subtle bg-surface-white px-2 py-1.5 text-xs text-ink focus:outline-none focus:ring-1 focus:ring-brand"
                />
                <button
                  type="submit"
                  disabled={logSubmitting}
                  className="w-full flex items-center justify-center gap-1.5 rounded-lg bg-brand text-ink text-xs font-bold py-2 hover:bg-brand-hover transition-colors disabled:opacity-60"
                >
                  {logSubmitting ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Plus className="w-3.5 h-3.5" />
                  )}
                  {logSubmitting ? 'Logging...' : 'Log Expense'}
                </button>
                {logSuccess && (
                  <p className="flex items-center gap-1 text-[11px] font-semibold text-success">
                    <CheckCircle2 className="w-3 h-3" /> {logSuccess}
                  </p>
                )}
                {logError && <p className="text-[11px] font-semibold text-danger">{logError}</p>}
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
