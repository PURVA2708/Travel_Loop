import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Spinner } from '@/components/ui/Spinner';
import { formatMoney } from '@/lib/money';
import { useActivitiesForCity } from '../hooks';
import type { Activity, ActivityCategory } from '@/types';

const CATEGORIES: Array<{ value: ActivityCategory | 'all'; label: string }> = [
  { value: 'all', label: 'All' },
  { value: 'sightseeing', label: 'Sightseeing' },
  { value: 'food', label: 'Food' },
  { value: 'adventure', label: 'Adventure' },
  { value: 'culture', label: 'Culture' },
  { value: 'nightlife', label: 'Nightlife' },
];

export function ActivityPickerModal({
  isOpen,
  onClose,
  cityId,
  cityName,
  onSelect,
}: {
  isOpen: boolean;
  onClose: () => void;
  cityId: string | undefined;
  cityName?: string;
  onSelect: (activity: Activity) => void;
}) {
  const [category, setCategory] = useState<ActivityCategory | 'all'>('all');
  const { data: activities, isLoading } = useActivitiesForCity(cityId);
  const filtered = activities?.filter((a) => category === 'all' || a.category === category);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Add activity${cityName ? ` in ${cityName}` : ''}`}>
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {CATEGORIES.map((c) => (
          <button
            key={c.value}
            onClick={() => setCategory(c.value)}
            className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold ${
              category === c.value ? 'bg-brand text-ink' : 'bg-surface text-ink/60'
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      <div className="mt-4 flex max-h-80 flex-col gap-1 overflow-y-auto">
        {isLoading && (
          <div className="py-8">
            <Spinner className="mx-auto h-6 w-6" />
          </div>
        )}
        {!isLoading && filtered?.length === 0 && (
          <p className="py-8 text-center text-sm text-ink/50">No activities found for this filter.</p>
        )}
        {filtered?.map((activity) => (
          <button
            key={activity.id}
            onClick={() => {
              onSelect(activity);
              onClose();
            }}
            className="flex items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-left hover:bg-surface"
          >
            <div>
              <p className="text-sm font-semibold text-ink">{activity.name}</p>
              <p className="text-xs text-ink/50">
                {activity.category} · {activity.durationMinutes} min
              </p>
            </div>
            <span className="shrink-0 text-sm font-semibold text-ink">{formatMoney(activity.cost)}</span>
          </button>
        ))}
      </div>
    </Modal>
  );
}
