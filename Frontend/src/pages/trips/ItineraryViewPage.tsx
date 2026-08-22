import { useParams, Link } from 'react-router-dom';
import { format, eachDayOfInterval } from 'date-fns';
import { PageContainer } from '@/components/ui/PageContainer';
import { PageSpinner } from '@/components/ui/Spinner';
import { Button } from '@/components/ui/Button';
import { formatMoney } from '@/lib/money';
import { useItinerary } from '@/features/trips/hooks';

export function ItineraryViewPage() {
  const { tripId } = useParams<{ tripId: string }>();
  const { data: itinerary, isLoading } = useItinerary(tripId);

  if (isLoading) return <PageSpinner />;
  if (!itinerary) return <PageContainer>Trip not found.</PageContainer>;

  return (
    <PageContainer className="max-w-3xl">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-extrabold text-ink sm:text-3xl">{itinerary.name}</h1>
          <p className="text-sm text-ink/60">
            {format(new Date(itinerary.startDate), 'd MMM yyyy')} –{' '}
            {format(new Date(itinerary.endDate), 'd MMM yyyy')} · {formatMoney(itinerary.totalActivityCost)} planned
          </p>
        </div>
        <Link to={`/trips/${tripId}/builder`}>
          <Button variant="outline">Edit itinerary</Button>
        </Link>
      </div>

      {itinerary.stops.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-ink/15 bg-surface-white px-6 py-14 text-center text-sm text-ink/50">
          This trip has no stops yet.
        </p>
      ) : (
        <div className="flex flex-col gap-8">
          {itinerary.stops.map((stop) => {
            const days = eachDayOfInterval({
              start: new Date(stop.arrivalDate),
              end: new Date(stop.departureDate),
            });

            return (
              <section key={stop.stopId}>
                <div className="mb-3 flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand font-bold text-ink">
                    📍
                  </span>
                  <div>
                    <h2 className="font-display text-xl font-bold text-ink">{stop.city.name}</h2>
                    <p className="text-xs text-ink/50">
                      {format(new Date(stop.arrivalDate), 'd MMM')} – {format(new Date(stop.departureDate), 'd MMM')}
                    </p>
                  </div>
                </div>

                <ol className="flex flex-col gap-3 border-l-2 border-ink/10 pl-5">
                  {days.map((day) => {
                    const key = format(day, 'yyyy-MM-dd');
                    const activities = stop.activitiesByDate[key] ?? [];
                    return (
                      <li key={key} className="relative">
                        <span className="absolute -left-[27px] top-1 h-3 w-3 rounded-full bg-brand" />
                        <p className="text-sm font-semibold text-ink">{format(day, 'EEEE, d MMM')}</p>
                        {activities.length === 0 ? (
                          <p className="mt-1 text-sm text-ink/40">Free day / travel day</p>
                        ) : (
                          <ul className="mt-2 flex flex-col gap-2">
                            {activities.map((tripActivity) => (
                              <li
                                key={tripActivity.id}
                                className="flex items-center justify-between rounded-lg bg-surface-white px-3.5 py-2.5 shadow-sm"
                              >
                                <div>
                                  <p className="text-sm font-semibold text-ink">{tripActivity.activity.name}</p>
                                  <p className="text-xs text-ink/50">
                                    {tripActivity.scheduledTime ?? 'Anytime'} ·{' '}
                                    {tripActivity.activity.durationMinutes} min
                                  </p>
                                </div>
                                <span className="text-sm font-semibold text-ink">
                                  {formatMoney(tripActivity.actualCost)}
                                </span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </li>
                    );
                  })}
                </ol>
              </section>
            );
          })}
        </div>
      )}
    </PageContainer>
  );
}
