import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as tripsApi from './api';

export const tripKeys = {
  all: ['trips'] as const,
  detail: (id: string) => ['trips', id] as const,
  itinerary: (id: string) => ['trips', id, 'itinerary'] as const,
  cities: (search?: string) => ['cities', search ?? ''] as const,
  activities: (cityId: string) => ['activities', cityId] as const,
};

export function useTrips() {
  return useQuery({ queryKey: tripKeys.all, queryFn: tripsApi.fetchTrips });
}

export function useTrip(tripId: string | undefined) {
  return useQuery({
    queryKey: tripKeys.detail(tripId ?? ''),
    queryFn: () => tripsApi.fetchTrip(tripId!),
    enabled: !!tripId,
  });
}

export function useItinerary(tripId: string | undefined) {
  return useQuery({
    queryKey: tripKeys.itinerary(tripId ?? ''),
    queryFn: () => tripsApi.fetchItinerary(tripId!),
    enabled: !!tripId,
  });
}

export function useCreateTrip() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: tripsApi.createTrip,
    onSuccess: () => qc.invalidateQueries({ queryKey: tripKeys.all }),
  });
}

export function useUpdateTrip(tripId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: Parameters<typeof tripsApi.updateTrip>[1]) => tripsApi.updateTrip(tripId, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: tripKeys.all });
      qc.invalidateQueries({ queryKey: tripKeys.detail(tripId) });
    },
  });
}

export function useDeleteTrip() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: tripsApi.deleteTrip,
    onSuccess: () => qc.invalidateQueries({ queryKey: tripKeys.all }),
  });
}

function invalidateTrip(qc: ReturnType<typeof useQueryClient>, tripId: string) {
  qc.invalidateQueries({ queryKey: tripKeys.detail(tripId) });
  qc.invalidateQueries({ queryKey: tripKeys.itinerary(tripId) });
}

export function useAddStop(tripId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: Parameters<typeof tripsApi.addStop>[1]) => tripsApi.addStop(tripId, input),
    onSuccess: () => invalidateTrip(qc, tripId),
  });
}

export function useUpdateStop(tripId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ stopId, input }: { stopId: string; input: Parameters<typeof tripsApi.updateStop>[2] }) =>
      tripsApi.updateStop(tripId, stopId, input),
    onSuccess: () => invalidateTrip(qc, tripId),
  });
}

export function useDeleteStop(tripId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (stopId: string) => tripsApi.deleteStop(tripId, stopId),
    onSuccess: () => invalidateTrip(qc, tripId),
  });
}

export function useReorderStops(tripId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (orderedStopIds: string[]) => tripsApi.reorderStops(tripId, orderedStopIds),
    onSuccess: () => invalidateTrip(qc, tripId),
  });
}

export function useAddTripActivity(tripId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ stopId, input }: { stopId: string; input: Parameters<typeof tripsApi.addTripActivity>[2] }) =>
      tripsApi.addTripActivity(tripId, stopId, input),
    onSuccess: () => invalidateTrip(qc, tripId),
  });
}

export function useDeleteTripActivity(tripId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ stopId, tripActivityId }: { stopId: string; tripActivityId: string }) =>
      tripsApi.deleteTripActivity(tripId, stopId, tripActivityId),
    onSuccess: () => invalidateTrip(qc, tripId),
  });
}

export function useReorderActivities(tripId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ stopId, orderedTripActivityIds }: { stopId: string; orderedTripActivityIds: string[] }) =>
      tripsApi.reorderActivities(tripId, stopId, orderedTripActivityIds),
    onSuccess: () => invalidateTrip(qc, tripId),
  });
}

export function useCities(search: string) {
  return useQuery({
    queryKey: tripKeys.cities(search),
    queryFn: () => tripsApi.fetchCities(search || undefined),
  });
}

export function useActivitiesForCity(cityId: string | undefined) {
  return useQuery({
    queryKey: tripKeys.activities(cityId ?? ''),
    queryFn: () => tripsApi.fetchActivitiesForCity(cityId!),
    enabled: !!cityId,
  });
}

export function useCreateShareLink() {
  return useMutation({ mutationFn: tripsApi.createShareLink });
}

export function useSuggestItinerary() {
  return useMutation({ mutationFn: tripsApi.suggestItinerary });
}
