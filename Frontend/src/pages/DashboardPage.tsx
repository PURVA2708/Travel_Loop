import { Link } from 'react-router-dom';
import { PageContainer } from '@/components/ui/PageContainer';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/store/authStore';
import { useTrips } from '@/features/trips/hooks';
import { TripCard } from '@/features/trips/components/TripCard';
import { useDeleteTrip } from '@/features/trips/hooks';

/**
 * Stub — Screen #2 (Dashboard/Home) is Person A's full ownership:
 * recommended destinations, budget highlights, etc. This wires just
 * enough to link into the Trips vertical for now.
 */
export function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const { data: trips } = useTrips();
  const deleteTrip = useDeleteTrip();
  const recentTrips = trips?.slice(0, 3) ?? [];

  return (
    <PageContainer>
      <div className="mb-6 rounded-2xl bg-gradient-to-br from-brand to-brand-dark p-6 sm:p-10">
        <h1 className="font-display text-2xl font-extrabold text-ink sm:text-4xl">
          Welcome back{user?.name ? `, ${user.name.split(' ')[0]}` : ''} 👋
        </h1>
        <p className="mt-2 max-w-md text-sm text-ink/70">
          Where to next? Build a new multi-city itinerary or pick up where you left off.
        </p>
        <Link to="/trips/new">
          <Button variant="secondary" className="mt-4">
            + Plan New Trip
          </Button>
        </Link>
      </div>

      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display text-lg font-bold text-ink">Your recent trips</h2>
        <Link to="/trips" className="text-sm font-semibold text-ink underline">
          View all
        </Link>
      </div>

      {recentTrips.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-ink/15 bg-surface-white px-6 py-10 text-center text-sm text-ink/50">
          No trips yet — start planning your first one above.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {recentTrips.map((trip) => (
            <TripCard
              key={trip.id}
              trip={trip}
              onDelete={(id) => confirm('Delete this trip?') && deleteTrip.mutate(id)}
            />
          ))}
        </div>
      )}
    </PageContainer>
  );
}
