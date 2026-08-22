import { api } from '@/lib/api';
import type { City, Activity, Itinerary, Trip, TripActivity, TripStop, TripSummary } from '@/types';

export async function fetchTrips() {
  const { data } = await api.get<TripSummary[]>('/trips');
  return data;
}

export async function fetchTrip(tripId: string) {
  const { data } = await api.get<Trip>(`/trips/${tripId}`);
  return data;
}

export async function createTrip(input: {
  name: string;
  description?: string;
  startDate: string;
  endDate: string;
  coverPhotoUrl?: string;
  totalBudget?: number;
}) {
  const { data } = await api.post<Trip>('/trips', input);
  return data;
}

export async function updateTrip(tripId: string, input: Partial<{
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  coverPhotoUrl: string;
  totalBudget: number;
  status: Trip['status'];
}>) {
  const { data } = await api.patch<Trip>(`/trips/${tripId}`, input);
  return data;
}

export async function deleteTrip(tripId: string) {
  await api.delete(`/trips/${tripId}`);
}

export async function fetchItinerary(tripId: string) {
  const { data } = await api.get<Itinerary>(`/trips/${tripId}/itinerary`);
  return data;
}

// --- Stops -------------------------------------------------------------

export async function addStop(tripId: string, input: { cityId: string; arrivalDate: string; departureDate: string }) {
  const { data } = await api.post<TripStop>(`/trips/${tripId}/stops`, input);
  return data;
}

export async function updateStop(
  tripId: string,
  stopId: string,
  input: Partial<{ cityId: string; arrivalDate: string; departureDate: string }>,
) {
  const { data } = await api.patch<TripStop>(`/trips/${tripId}/stops/${stopId}`, input);
  return data;
}

export async function deleteStop(tripId: string, stopId: string) {
  await api.delete(`/trips/${tripId}/stops/${stopId}`);
}

export async function reorderStops(tripId: string, orderedStopIds: string[]) {
  const { data } = await api.patch(`/trips/${tripId}/stops/reorder`, { orderedStopIds });
  return data;
}

// --- Activities within a stop -------------------------------------------

export async function addTripActivity(
  tripId: string,
  stopId: string,
  input: { activityId: string; scheduledDate: string; scheduledTime?: string; actualCost?: number },
) {
  const { data } = await api.post<TripActivity>(`/trips/${tripId}/stops/${stopId}/activities`, input);
  return data;
}

export async function deleteTripActivity(tripId: string, stopId: string, tripActivityId: string) {
  await api.delete(`/trips/${tripId}/stops/${stopId}/activities/${tripActivityId}`);
}

export async function reorderActivities(tripId: string, stopId: string, orderedTripActivityIds: string[]) {
  const { data } = await api.patch(`/trips/${tripId}/stops/${stopId}/activities/reorder`, {
    orderedTripActivityIds,
  });
  return data;
}

// --- Cities & Activities catalog (Person A's domain; read-only here) ----
// These endpoints return { success, data, pagination } — unwrap to the array.

export async function fetchCities(search?: string) {
  const { data } = await api.get<{ data: City[] }>('/cities', { params: search ? { search } : undefined });
  return data.data;
}

export async function fetchActivitiesForCity(cityId: string) {
  const { data } = await api.get<{ data: Activity[] }>('/activities', { params: { cityId } });
  return data.data;
}

// --- AI itinerary suggestions --------------------------------------------

export interface AiItinerarySuggestion {
  rationale: string;
  cities: City[];
  activities: Activity[];
}

export async function suggestItinerary(input: { startDate: string; endDate: string; interests?: string }) {
  const { data } = await api.post<{ data: AiItinerarySuggestion }>('/ai/suggest-itinerary', input);
  return data.data;
}

// --- Sharing (Person C's domain) ------------------------------------------

export async function createShareLink(tripId: string) {
  const { data } = await api.post<{ data: { publicSlug: string } }>(`/trips/${tripId}/share`, {});
  return data.data;
}
