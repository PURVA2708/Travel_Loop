import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { addDays, differenceInCalendarDays, format } from 'date-fns';
import { Sparkles } from 'lucide-react';
import { PageContainer } from '@/components/ui/PageContainer';
import { Button } from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Input';
import { ImageUploadField } from '@/components/ui/ImageUploadField';
import { getApiErrorMessage } from '@/lib/api';
import { useCreateTrip, useSuggestItinerary } from '@/features/trips/hooks';
import { addStop, addTripActivity } from '@/features/trips/api';
import { SuggestedActivitiesForCity, SuggestedDestinations } from '@/features/trips/components/TripSuggestions';
import type { Activity, City } from '@/types';

function splitDateRange(startDate: string, endDate: string, count: number) {
  const start = new Date(startDate);
  const totalDays = Math.max(differenceInCalendarDays(new Date(endDate), start) + 1, count);
  const base = Math.floor(totalDays / count);
  const remainder = totalDays % count;

  const segments: Array<{ arrivalDate: string; departureDate: string }> = [];
  let cursor = start;
  for (let i = 0; i < count; i++) {
    const length = base + (i < remainder ? 1 : 0);
    const arrival = cursor;
    const departure = addDays(cursor, Math.max(length - 1, 0));
    segments.push({
      arrivalDate: format(arrival, 'yyyy-MM-dd'),
      departureDate: format(departure, 'yyyy-MM-dd'),
    });
    cursor = addDays(departure, 1);
  }
  return segments;
}

export function CreateTripPage() {
  const navigate = useNavigate();
  const createTrip = useCreateTrip();
  const suggestItinerary = useSuggestItinerary();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [coverPhotoUrl, setCoverPhotoUrl] = useState('');
  const [totalBudget, setTotalBudget] = useState('');
  const [interests, setInterests] = useState('');
  const [selectedCities, setSelectedCities] = useState<City[]>([]);
  const [selectedActivities, setSelectedActivities] = useState<Activity[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isBuildingItinerary, setIsBuildingItinerary] = useState(false);

  function toggleCity(city: City) {
    suggestItinerary.reset();
    setSelectedCities((prev) =>
      prev.some((c) => c.id === city.id) ? prev.filter((c) => c.id !== city.id) : [...prev, city],
    );
  }

  function toggleActivity(activity: Activity) {
    suggestItinerary.reset();
    setSelectedActivities((prev) =>
      prev.some((a) => a.id === activity.id) ? prev.filter((a) => a.id !== activity.id) : [...prev, activity],
    );
  }

  async function handleAiSuggest() {
    const result = await suggestItinerary.mutateAsync({ startDate, endDate, interests: interests || undefined });
    setSelectedCities(result.cities);
    setSelectedActivities(result.activities);
  }

  const selectedActivityIds = new Set(selectedActivities.map((a) => a.id));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      const trip = await createTrip.mutateAsync({
        name,
        description: description || undefined,
        startDate,
        endDate,
        coverPhotoUrl: coverPhotoUrl || undefined,
        totalBudget: totalBudget ? Number(totalBudget) : undefined,
      });

      if (selectedCities.length > 0) {
        setIsBuildingItinerary(true);
        const segments = splitDateRange(startDate, endDate, selectedCities.length);
        for (let i = 0; i < selectedCities.length; i++) {
          const city = selectedCities[i];
          const stop = await addStop(trip.id, { cityId: city.id, ...segments[i] });
          const activitiesForCity = selectedActivities.filter((a) => a.cityId === city.id);
          for (const activity of activitiesForCity) {
            await addTripActivity(trip.id, stop.id, {
              activityId: activity.id,
              scheduledDate: segments[i].arrivalDate,
            });
          }
        }
      }

      navigate(`/trips/${trip.id}/builder`);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not create trip'));
    } finally {
      setIsBuildingItinerary(false);
    }
  }

  const isSubmitting = createTrip.isPending || isBuildingItinerary;

  return (
    <PageContainer className="max-w-2xl">
      {/* Split hero-ish header, TripAdvisor pattern (Section 5.5) */}
      <div className="mb-6 rounded-2xl bg-brand p-6 sm:p-8">
        <h1 className="font-display text-2xl font-extrabold text-ink sm:text-3xl">Plan a new trip</h1>
        <p className="mt-1 text-sm text-ink/70">Give it a name and rough dates — you'll add cities next.</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4 rounded-2xl bg-surface-white p-6 shadow-sm">
        <Input label="Trip name" value={name} onChange={(e) => setName(e.target.value)} required minLength={2} placeholder="Summer in Southeast Asia" />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            label="Start date"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            required
          />
          <Input label="End date" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} required />
        </div>

        <Input
          label="Total budget (optional)"
          type="number"
          min={0}
          step="0.01"
          value={totalBudget}
          onChange={(e) => setTotalBudget(e.target.value)}
          placeholder="e.g. 65000"
        />

        <Textarea
          label="Description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          placeholder="What's this trip about?"
        />

        <ImageUploadField label="Cover photo (optional)" value={coverPhotoUrl} onChange={setCoverPhotoUrl} />

        {error && <p className="text-sm text-danger">{error}</p>}

        <div className="mt-2 flex gap-3">
          <Button type="submit" isLoading={isSubmitting} className="flex-1">
            Save & build itinerary
          </Button>
        </div>
      </form>

      {startDate && endDate && endDate >= startDate && (
        <div className="mt-6 flex flex-col gap-4">
          <div className="flex flex-col gap-3 rounded-2xl border border-brand/30 bg-gradient-to-br from-brand/10 to-transparent p-5 shadow-sm">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-brand-dark" />
              <h3 className="font-display text-base font-bold text-ink">AI trip assistant</h3>
            </div>
            <p className="text-xs text-ink/60">
              Tell us what you're after and Groq will pick destinations and activities that fit your dates.
            </p>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Input
                value={interests}
                onChange={(e) => setInterests(e.target.value)}
                placeholder="e.g. beaches and nightlife, culture, adventure..."
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleAiSuggest}
                isLoading={suggestItinerary.isPending}
                disabled={!startDate || !endDate}
                className="shrink-0"
              >
                {suggestItinerary.isPending ? (
                  'Thinking...'
                ) : (
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="h-4 w-4" /> Get AI suggestions
                  </span>
                )}
              </Button>
            </div>
            {suggestItinerary.isError && (
              <p className="text-xs text-danger">{getApiErrorMessage(suggestItinerary.error, 'AI suggestion failed')}</p>
            )}
            {suggestItinerary.data && (
              <p className="flex items-start gap-1.5 rounded-xl bg-surface-white/70 p-3 text-xs text-ink/70">
                <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-dark" />
                <span className="font-semibold text-ink">{suggestItinerary.data.rationale}</span>
              </p>
            )}
          </div>

          <SuggestedDestinations
            startDate={startDate}
            endDate={endDate}
            selectedCityIds={selectedCities.map((c) => c.id)}
            onToggleCity={toggleCity}
          />

          {selectedCities.length > 0 && (
            <div className="flex flex-col gap-4 rounded-2xl bg-surface-white p-5 shadow-sm">
              <div>
                <h3 className="font-display text-base font-bold text-ink">Activities to perform</h3>
                <p className="text-xs text-ink/50">Pick a few and they'll be added straight into your itinerary.</p>
              </div>
              {selectedCities.map((city) => (
                <SuggestedActivitiesForCity
                  key={city.id}
                  city={city}
                  selectedActivityIds={selectedActivityIds}
                  onToggleActivity={toggleActivity}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </PageContainer>
  );
}
