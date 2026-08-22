import { differenceInCalendarDays } from 'date-fns';
import { Star } from 'lucide-react';
import { Spinner } from '@/components/ui/Spinner';
import { formatMoney } from '@/lib/money';
import { cn } from '@/lib/cn';
import { useCities, useActivitiesForCity } from '../hooks';
import type { Activity, City } from '@/types';

export function SuggestedDestinations({
  startDate,
  endDate,
  selectedCityIds,
  onToggleCity,
}: {
  startDate: string;
  endDate: string;
  selectedCityIds: string[];
  onToggleCity: (city: City) => void;
}) {
  const { data: cities, isLoading } = useCities('');
  const days =
    startDate && endDate ? differenceInCalendarDays(new Date(endDate), new Date(startDate)) + 1 : null;

  return (
    <div className="flex flex-col gap-3 rounded-2xl bg-surface-white p-5 shadow-sm">
      <div>
        <h3 className="font-display text-base font-bold text-ink">
          Suggested destinations{days && days > 0 ? ` for your ${days}-day trip` : ''}
        </h3>
        <p className="text-xs text-ink/50">
          Tap a city to add it as a stop — dates split evenly, fine-tune everything after.
        </p>
      </div>

      {isLoading ? (
        <Spinner className="mx-auto h-5 w-5" />
      ) : (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {(cities ?? []).slice(0, 6).map((city) => {
            const isSelected = selectedCityIds.includes(city.id);
            return (
              <button
                key={city.id}
                type="button"
                onClick={() => onToggleCity(city)}
                className={cn(
                  'flex flex-col items-start gap-1.5 overflow-hidden rounded-xl border text-left transition-colors',
                  isSelected ? 'border-brand bg-brand/10' : 'border-ink/10 hover:bg-surface',
                )}
              >
                {city.imageUrl && (
                  <img src={city.imageUrl} alt={city.name} className="h-16 w-full object-cover" />
                )}
                <span className="px-3 pt-2.5 text-sm font-semibold text-ink">{city.name}</span>
                <span className="flex items-center gap-1 px-3 pb-2.5 text-xs text-ink/50">
                  {city.country} ·
                  <Star className="h-3 w-3 fill-current" /> {city.popularityScore}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function SuggestedActivitiesForCity({
  city,
  selectedActivityIds,
  onToggleActivity,
}: {
  city: City;
  selectedActivityIds: Set<string>;
  onToggleActivity: (activity: Activity) => void;
}) {
  const { data: activities, isLoading } = useActivitiesForCity(city.id);

  if (isLoading) {
    return (
      <div className="py-2">
        <Spinner className="h-4 w-4" />
      </div>
    );
  }
  if (!activities || activities.length === 0) return null;

  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs font-semibold text-ink/70">{city.name}</p>
      <div className="flex flex-col gap-1.5">
        {activities.slice(0, 4).map((activity) => {
          const isChecked = selectedActivityIds.has(activity.id);
          return (
            <label
              key={activity.id}
              className="flex cursor-pointer items-center justify-between gap-2 rounded-lg border border-ink/10 px-3 py-2 hover:bg-surface"
            >
              <span className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => onToggleActivity(activity)}
                  className="h-4 w-4 rounded accent-brand"
                />
                <span className="text-sm text-ink">{activity.name}</span>
              </span>
              <span className="text-xs font-medium text-ink/50">{formatMoney(activity.cost)}</span>
            </label>
          );
        })}
      </div>
    </div>
  );
}
