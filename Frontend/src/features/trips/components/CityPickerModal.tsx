import { useState } from 'react';
import { Star } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Spinner } from '@/components/ui/Spinner';
import { useCities } from '../hooks';
import type { City } from '@/types';

export function CityPickerModal({
  isOpen,
  onClose,
  onSelect,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (city: City) => void;
}) {
  const [search, setSearch] = useState('');
  const { data: cities, isLoading } = useCities(search);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add a stop">
      <Input
        placeholder="Search cities..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        autoFocus
      />
      <div className="mt-4 flex max-h-80 flex-col gap-1 overflow-y-auto">
        {isLoading && (
          <div className="py-8">
            <Spinner className="mx-auto h-6 w-6" />
          </div>
        )}
        {!isLoading && cities?.length === 0 && (
          <p className="py-8 text-center text-sm text-ink/50">No cities found.</p>
        )}
        {cities?.map((city) => (
          <button
            key={city.id}
            onClick={() => {
              onSelect(city);
              onClose();
            }}
            className="flex items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-left hover:bg-surface"
          >
            <div className="flex items-center gap-3 min-w-0">
              {city.imageUrl && (
                <img
                  src={city.imageUrl}
                  alt={city.name}
                  className="h-10 w-10 shrink-0 rounded-lg object-cover"
                />
              )}
              <div className="min-w-0">
                <p className="text-sm font-semibold text-ink">{city.name}</p>
                <p className="text-xs text-ink/50">
                  {city.country}
                  {city.region ? ` · ${city.region}` : ''}
                </p>
              </div>
            </div>
            <span className="flex shrink-0 items-center gap-1 text-xs font-medium text-ink/40">
              <Star className="h-3 w-3 fill-current" /> {city.popularityScore}
            </span>
          </button>
        ))}
      </div>
    </Modal>
  );
}
