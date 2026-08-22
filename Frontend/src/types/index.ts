// Mirrors Backend/prisma/schema.prisma. Prisma serializes Decimal fields
// as strings over JSON, so cost/budget fields are typed `string` here —
// convert with Number(...) at the point of use (see money.ts).

export type PublicUser = {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  avatarUrl: string | null;
  languagePref: string;
};

export type TripStatus = 'draft' | 'planned' | 'completed';

export type City = {
  id: string;
  name: string;
  country: string;
  region: string | null;
  costIndex: string;
  popularityScore: number;
  imageUrl: string | null;
  lat: string | null;
  lng: string | null;
};

export type ActivityCategory = 'sightseeing' | 'food' | 'adventure' | 'culture' | 'nightlife';

export type Activity = {
  id: string;
  cityId: string;
  name: string;
  description: string | null;
  category: ActivityCategory;
  cost: string;
  durationMinutes: number;
  imageUrl: string | null;
};

export type TripActivity = {
  id: string;
  tripStopId: string;
  activityId: string;
  scheduledDate: string;
  scheduledTime: string | null;
  actualCost: string;
  orderIndex: number;
  activity: Activity;
};

export type TripStop = {
  id: string;
  tripId: string;
  cityId: string;
  arrivalDate: string;
  departureDate: string;
  orderIndex: number;
  city: City;
  activities: TripActivity[];
};

export type Trip = {
  id: string;
  userId: string;
  name: string;
  description: string | null;
  startDate: string;
  endDate: string;
  coverPhotoUrl: string | null;
  totalBudget: string;
  status: TripStatus;
  createdAt: string;
  stops: TripStop[];
};

export type TripSummary = Omit<Trip, 'stops'> & {
  stops: Array<{ id: string; cityId: string }>;
};

export type ItineraryDay = {
  stopId: string;
  city: City;
  arrivalDate: string;
  departureDate: string;
  activitiesByDate: Record<string, TripActivity[]>;
};

export type Itinerary = {
  tripId: string;
  name: string;
  startDate: string;
  endDate: string;
  stops: ItineraryDay[];
  totalActivityCost: number;
};
