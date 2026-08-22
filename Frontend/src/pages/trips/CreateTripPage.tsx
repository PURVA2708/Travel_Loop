import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageContainer } from '@/components/ui/PageContainer';
import { Button } from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Input';
import { getApiErrorMessage } from '@/lib/api';
import { useCreateTrip } from '@/features/trips/hooks';

export function CreateTripPage() {
  const navigate = useNavigate();
  const createTrip = useCreateTrip();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [coverPhotoUrl, setCoverPhotoUrl] = useState('');
  const [error, setError] = useState<string | null>(null);

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
      });
      navigate(`/trips/${trip.id}/builder`);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not create trip'));
    }
  }

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

        <Textarea
          label="Description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          placeholder="What's this trip about?"
        />

        <Input
          label="Cover photo URL (optional)"
          value={coverPhotoUrl}
          onChange={(e) => setCoverPhotoUrl(e.target.value)}
          placeholder="https://..."
        />

        {error && <p className="text-sm text-danger">{error}</p>}

        <div className="mt-2 flex gap-3">
          <Button type="submit" isLoading={createTrip.isPending} className="flex-1">
            Save & build itinerary
          </Button>
        </div>
      </form>
    </PageContainer>
  );
}
