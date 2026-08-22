import { Link } from 'react-router-dom';
import { Luggage } from 'lucide-react';
import { PageContainer } from '@/components/ui/PageContainer';
import { PageSpinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/Button';
import { TripCard } from '@/features/trips/components/TripCard';
import { useDeleteTrip, useTrips } from '@/features/trips/hooks';

export function MyTripsPage() {
  const { data: trips, isLoading } = useTrips();
  const deleteTrip = useDeleteTrip();

  if (isLoading) return <PageSpinner />;

  return (
    <PageContainer>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-2xl font-extrabold text-ink sm:text-3xl">My Trips</h1>
        <Link to="/trips/new">
          <Button>+ Plan New Trip</Button>
        </Link>
      </div>

      {!trips || trips.length === 0 ? (
        <EmptyState
          icon={<Luggage />}
          title="No trips yet"
          description="Plan your first multi-city trip — add stops, activities, and track your budget as you go."
          action={
            <Link to="/trips/new">
              <Button>+ Plan New Trip</Button>
            </Link>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {trips.map((trip) => (
            <TripCard
              key={trip.id}
              trip={trip}
              onDelete={(id) => confirm('Delete this trip? This cannot be undone.') && deleteTrip.mutate(id)}
            />
          ))}
        </div>
      )}
    </PageContainer>
  );
}
