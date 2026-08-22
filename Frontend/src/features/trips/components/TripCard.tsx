import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { Wallet, CalendarDays, Trash2 } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import type { TripSummary } from '@/types';

const STATUS_STYLES: Record<TripSummary['status'], string> = {
  draft: 'bg-ink/10 text-ink',
  planned: 'bg-info/15 text-info',
  completed: 'bg-success/15 text-success',
};

export function TripCard({ trip, onDelete }: { trip: TripSummary; onDelete: (id: string) => void }) {
  const cityCount = new Set(trip.stops.map((s) => s.cityId)).size;
  const coverImage = trip.coverPhotoUrl || trip.stops[0]?.city?.imageUrl || undefined;

  return (
    <Card className="flex flex-col overflow-hidden">
      <div
        className="h-32 w-full bg-gradient-to-br from-brand to-brand-dark bg-cover bg-center"
        style={coverImage ? { backgroundImage: `url(${coverImage})` } : undefined}
      />
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-display text-lg font-bold text-ink">{trip.name}</h3>
          <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_STYLES[trip.status]}`}>
            {trip.status}
          </span>
        </div>
        <p className="text-sm text-ink/60">
          {format(new Date(trip.startDate), 'd MMM')} – {format(new Date(trip.endDate), 'd MMM yyyy')}
          {' · '}
          {cityCount} {cityCount === 1 ? 'city' : 'cities'}
        </p>
        <div className="mt-auto flex items-center gap-2 pt-2">
          <Link
            to={`/trips/${trip.id}/builder`}
            className="flex-1 rounded-full bg-brand px-4 py-2 text-center text-sm font-semibold text-ink hover:bg-brand-dark"
          >
            Edit itinerary
          </Link>
          <Link
            to={`/trips/${trip.id}/view`}
            className="flex-1 rounded-full border border-ink/15 px-4 py-2 text-center text-sm font-semibold text-ink hover:bg-ink/5"
          >
            View
          </Link>
          <button
            onClick={() => onDelete(trip.id)}
            aria-label="Delete trip"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-ink/15 text-ink/50 hover:bg-danger/10 hover:text-danger"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to={`/budget/${trip.id}`}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-full border border-ink/15 px-3 py-1.5 text-xs font-semibold text-ink/70 hover:bg-ink/5"
          >
            <Wallet className="h-3.5 w-3.5" /> Budget
          </Link>
          <Link
            to={`/calendar/${trip.id}`}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-full border border-ink/15 px-3 py-1.5 text-xs font-semibold text-ink/70 hover:bg-ink/5"
          >
            <CalendarDays className="h-3.5 w-3.5" /> Calendar
          </Link>
        </div>
      </div>
    </Card>
  );
}
