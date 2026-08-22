import { useState } from 'react';
import { format } from 'date-fns';
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
import { Button } from '@/components/ui/Button';
import { formatMoney } from '@/lib/money';
import { ActivityPickerModal } from './ActivityPickerModal';
import { SortableItem } from './SortableItem';
import {
  useAddTripActivity,
  useDeleteStop,
  useDeleteTripActivity,
  useReorderActivities,
  useUpdateStop,
} from '../hooks';
import type { Activity, TripStop } from '@/types';

export function StopEditor({ tripId, stop }: { tripId: string; stop: TripStop }) {
  const [isPickerOpen, setPickerOpen] = useState(false);
  const updateStop = useUpdateStop(tripId);
  const deleteStop = useDeleteStop(tripId);
  const addActivity = useAddTripActivity(tripId);
  const deleteActivity = useDeleteTripActivity(tripId);
  const reorderActivities = useReorderActivities(tripId);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 8 } }),
  );

  const sortedActivities = [...stop.activities].sort((a, b) => a.orderIndex - b.orderIndex);
  const dayTotal = sortedActivities.reduce((sum, a) => sum + Number(a.actualCost), 0);

  function handleSelectActivity(activity: Activity) {
    addActivity.mutate({
      stopId: stop.id,
      input: {
        activityId: activity.id,
        scheduledDate: stop.arrivalDate,
        actualCost: Number(activity.cost),
      },
    });
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = sortedActivities.findIndex((a) => a.id === active.id);
    const newIndex = sortedActivities.findIndex((a) => a.id === over.id);
    const reordered = arrayMove(sortedActivities, oldIndex, newIndex);
    reorderActivities.mutate({ stopId: stop.id, orderedTripActivityIds: reordered.map((a) => a.id) });
  }

  function moveActivity(index: number, direction: -1 | 1) {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= sortedActivities.length) return;
    const reordered = arrayMove(sortedActivities, index, newIndex);
    reorderActivities.mutate({ stopId: stop.id, orderedTripActivityIds: reordered.map((a) => a.id) });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="font-display text-xl font-bold text-ink">{stop.city.name}</h3>
          <p className="text-sm text-ink/50">
            {stop.city.country}
            {stop.city.region ? ` · ${stop.city.region}` : ''}
          </p>
        </div>
        <button
          onClick={() => confirm('Remove this stop and all its activities?') && deleteStop.mutate(stop.id)}
          className="rounded-full border border-ink/15 px-3 py-1.5 text-xs font-semibold text-ink/60 hover:bg-danger/10 hover:text-danger"
        >
          Remove stop
        </button>
      </div>

      <div className="flex flex-wrap gap-3">
        <label className="flex flex-col gap-1 text-xs font-medium text-ink/60">
          Arrival
          <input
            type="date"
            value={format(new Date(stop.arrivalDate), 'yyyy-MM-dd')}
            onChange={(e) => updateStop.mutate({ stopId: stop.id, input: { arrivalDate: e.target.value } })}
            className="rounded-md border border-ink/15 px-3 py-2 text-sm text-ink"
          />
        </label>
        <label className="flex flex-col gap-1 text-xs font-medium text-ink/60">
          Departure
          <input
            type="date"
            value={format(new Date(stop.departureDate), 'yyyy-MM-dd')}
            onChange={(e) => updateStop.mutate({ stopId: stop.id, input: { departureDate: e.target.value } })}
            className="rounded-md border border-ink/15 px-3 py-2 text-sm text-ink"
          />
        </label>
      </div>

      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-ink/70">Activities ({sortedActivities.length})</h4>
        <span className="text-sm font-semibold text-ink">{formatMoney(dayTotal)}</span>
      </div>

      {sortedActivities.length === 0 ? (
        <p className="rounded-lg border border-dashed border-ink/15 px-4 py-6 text-center text-sm text-ink/50">
          No activities yet — add sightseeing, food, or adventure for {stop.city.name}.
        </p>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={sortedActivities.map((a) => a.id)} strategy={verticalListSortingStrategy}>
            <ul className="flex flex-col gap-2">
              {sortedActivities.map((tripActivity, index) => (
                <SortableItem key={tripActivity.id} id={tripActivity.id}>
                  {({ listeners, attributes }) => (
                    <li className="flex items-center gap-2 rounded-lg border border-ink/10 bg-surface-white px-3 py-2.5">
                      <button
                        {...listeners}
                        {...attributes}
                        className="cursor-grab touch-none px-1 text-ink/30 active:cursor-grabbing"
                        aria-label="Drag to reorder"
                      >
                        ⠿
                      </button>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-ink">{tripActivity.activity.name}</p>
                        <p className="text-xs text-ink/50">
                          {tripActivity.activity.category} · {tripActivity.activity.durationMinutes} min
                        </p>
                      </div>
                      <span className="text-sm font-medium text-ink">{formatMoney(tripActivity.actualCost)}</span>
                      <div className="flex flex-col">
                        <button
                          onClick={() => moveActivity(index, -1)}
                          disabled={index === 0}
                          className="text-ink/40 hover:text-ink disabled:opacity-20"
                          aria-label="Move up"
                        >
                          ▲
                        </button>
                        <button
                          onClick={() => moveActivity(index, 1)}
                          disabled={index === sortedActivities.length - 1}
                          className="text-ink/40 hover:text-ink disabled:opacity-20"
                          aria-label="Move down"
                        >
                          ▼
                        </button>
                      </div>
                      <button
                        onClick={() => deleteActivity.mutate({ stopId: stop.id, tripActivityId: tripActivity.id })}
                        className="ml-1 text-ink/30 hover:text-danger"
                        aria-label="Remove activity"
                      >
                        ✕
                      </button>
                    </li>
                  )}
                </SortableItem>
              ))}
            </ul>
          </SortableContext>
        </DndContext>
      )}

      <Button variant="outline" size="sm" onClick={() => setPickerOpen(true)} className="self-start">
        + Add activity
      </Button>

      <ActivityPickerModal
        isOpen={isPickerOpen}
        onClose={() => setPickerOpen(false)}
        cityId={stop.cityId}
        cityName={stop.city.name}
        onSelect={handleSelectActivity}
      />
    </div>
  );
}
