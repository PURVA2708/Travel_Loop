import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { format } from 'date-fns';
import { Wallet, CalendarDays, Map, GripVertical, ChevronUp, ChevronDown } from 'lucide-react';
import {
  DndContext,
  type DragEndEvent,
  PointerSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { SortableContext, arrayMove, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { PageContainer } from '@/components/ui/PageContainer';
import { PageSpinner } from '@/components/ui/Spinner';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatMoney } from '@/lib/money';
import { CityPickerModal } from '@/features/trips/components/CityPickerModal';
import { SortableItem } from '@/features/trips/components/SortableItem';
import { StopEditor } from '@/features/trips/components/StopEditor';
import { useAddStop, useReorderStops, useTrip } from '@/features/trips/hooks';
import { cn } from '@/lib/cn';
import type { City, TripStop } from '@/types';

export function ItineraryBuilderPage() {
  const { tripId } = useParams<{ tripId: string }>();
  const { data: trip, isLoading } = useTrip(tripId);
  const addStop = useAddStop(tripId!);
  const reorderStops = useReorderStops(tripId!);
  const [isCityPickerOpen, setCityPickerOpen] = useState(false);
  const [selectedStopId, setSelectedStopId] = useState<string | null>(null);

  const sortedStops = trip ? [...trip.stops].sort((a, b) => a.orderIndex - b.orderIndex) : [];

  useEffect(() => {
    if (!selectedStopId && sortedStops.length > 0) {
      setSelectedStopId(sortedStops[0].id);
    }
  }, [sortedStops, selectedStopId]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 8 } }),
  );

  if (isLoading) return <PageSpinner />;
  if (!trip) return <PageContainer>Trip not found.</PageContainer>;

  function handleAddCity(city: City) {
    const arrival = sortedStops.length
      ? sortedStops[sortedStops.length - 1].departureDate
      : trip!.startDate;
    addStop.mutate(
      { cityId: city.id, arrivalDate: arrival, departureDate: arrival },
      { onSuccess: (newStop) => setSelectedStopId(newStop.id) },
    );
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = sortedStops.findIndex((s) => s.id === active.id);
    const newIndex = sortedStops.findIndex((s) => s.id === over.id);
    const reordered = arrayMove(sortedStops, oldIndex, newIndex);
    reorderStops.mutate(reordered.map((s) => s.id));
  }

  function moveStop(index: number, direction: -1 | 1) {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= sortedStops.length) return;
    const reordered = arrayMove(sortedStops, index, newIndex);
    reorderStops.mutate(reordered.map((s) => s.id));
  }

  const tripTotal = sortedStops.reduce(
    (sum, stop) => sum + stop.activities.reduce((s, a) => s + Number(a.actualCost), 0),
    0,
  );

  return (
    <PageContainer>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-extrabold text-ink sm:text-3xl">{trip.name}</h1>
          <p className="text-sm text-ink/60">
            {format(new Date(trip.startDate), 'd MMM yyyy')} – {format(new Date(trip.endDate), 'd MMM yyyy')}
            {' · '}
            {formatMoney(tripTotal)} planned so far
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link to={`/budget/${tripId}`}>
            <Button variant="outline">
              <Wallet className="h-4 w-4" /> Budget
            </Button>
          </Link>
          <Link to={`/calendar/${tripId}`}>
            <Button variant="outline">
              <CalendarDays className="h-4 w-4" /> Calendar
            </Button>
          </Link>
          <Button onClick={() => setCityPickerOpen(true)}>+ Add Stop</Button>
        </div>
      </div>

      {sortedStops.length === 0 ? (
        <EmptyState
          icon={<Map />}
          title="No stops yet"
          description="Add your first city to start building this trip's itinerary."
          action={<Button onClick={() => setCityPickerOpen(true)}>+ Add Stop</Button>}
        />
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[340px_1fr]">
          {/* Stop list — draggable on all sizes; on mobile each row expands inline */}
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={sortedStops.map((s) => s.id)} strategy={verticalListSortingStrategy}>
              <ul className="flex flex-col gap-2 lg:sticky lg:top-24 lg:self-start">
                {sortedStops.map((stop, index) => (
                  <StopListItem
                    key={stop.id}
                    stop={stop}
                    index={index}
                    isLast={index === sortedStops.length - 1}
                    isSelected={selectedStopId === stop.id}
                    onSelect={() => setSelectedStopId(stop.id)}
                    onMove={(dir) => moveStop(index, dir)}
                  />
                ))}
              </ul>
            </SortableContext>
          </DndContext>

          {/* Desktop detail panel */}
          <div className="hidden rounded-2xl bg-surface-white p-6 shadow-sm lg:block">
            {selectedStopId && sortedStops.find((s) => s.id === selectedStopId) ? (
              <StopEditor tripId={trip.id} stop={sortedStops.find((s) => s.id === selectedStopId)!} />
            ) : (
              <p className="text-sm text-ink/50">Select a stop to edit its activities.</p>
            )}
          </div>

          {/* Mobile: inline expanded editor right under the selected stop */}
          <div className="lg:hidden">
            {selectedStopId && sortedStops.find((s) => s.id === selectedStopId) && (
              <div className="rounded-2xl bg-surface-white p-4 shadow-sm">
                <StopEditor tripId={trip.id} stop={sortedStops.find((s) => s.id === selectedStopId)!} />
              </div>
            )}
          </div>
        </div>
      )}

      <CityPickerModal isOpen={isCityPickerOpen} onClose={() => setCityPickerOpen(false)} onSelect={handleAddCity} />
    </PageContainer>
  );
}

function StopListItem({
  stop,
  index,
  isLast,
  isSelected,
  onSelect,
  onMove,
}: {
  stop: TripStop;
  index: number;
  isLast: boolean;
  isSelected: boolean;
  onSelect: () => void;
  onMove: (direction: -1 | 1) => void;
}) {
  const activityCount = stop.activities.length;
  const stopCost = stop.activities.reduce((s, a) => s + Number(a.actualCost), 0);

  return (
    <SortableItem id={stop.id}>
      {({ listeners, attributes }) => (
        <li
          className={cn(
            'flex items-center gap-2 rounded-xl border px-3 py-3 transition-colors',
            isSelected ? 'border-brand bg-brand/10' : 'border-ink/10 bg-surface-white hover:bg-surface',
          )}
        >
          <button
            {...listeners}
            {...attributes}
            className="cursor-grab touch-none px-1 text-ink/30 active:cursor-grabbing"
            aria-label="Drag to reorder stop"
          >
            <GripVertical className="h-4 w-4" />
          </button>
          <button onClick={onSelect} className="flex-1 text-left">
            <p className="text-sm font-bold text-ink">
              {index + 1}. {stop.city.name}
            </p>
            <p className="text-xs text-ink/50">
              {format(new Date(stop.arrivalDate), 'd MMM')} – {format(new Date(stop.departureDate), 'd MMM')}
              {' · '}
              {activityCount} {activityCount === 1 ? 'activity' : 'activities'} · {formatMoney(stopCost)}
            </p>
          </button>
          <div className="flex flex-col">
            <button
              onClick={() => onMove(-1)}
              disabled={index === 0}
              className="text-ink/40 hover:text-ink disabled:opacity-20"
              aria-label="Move stop up"
            >
              <ChevronUp className="h-4 w-4" />
            </button>
            <button
              onClick={() => onMove(1)}
              disabled={isLast}
              className="text-ink/40 hover:text-ink disabled:opacity-20"
              aria-label="Move stop down"
            >
              <ChevronDown className="h-4 w-4" />
            </button>
          </div>
        </li>
      )}
    </SortableItem>
  );
}
