import { prisma } from '../../lib/prisma.js';
import { ApiError } from '../../lib/ApiError.js';
import type {
  AddTripActivityInput,
  CreateStopInput,
  CreateTripInput,
  ReorderActivitiesInput,
  ReorderStopsInput,
  UpdateStopInput,
  UpdateTripActivityInput,
  UpdateTripInput,
} from './trips.schema.js';

const tripWithItinerary = {
  stops: {
    orderBy: { orderIndex: 'asc' as const },
    include: {
      city: true,
      activities: {
        orderBy: { orderIndex: 'asc' as const },
        include: { activity: true },
      },
    },
  },
};

/** Throws 404 if the trip doesn't exist, 403 if it belongs to someone else. */
async function assertTripOwnership(tripId: string, userId: string) {
  const trip = await prisma.trip.findUnique({ where: { id: tripId } });
  if (!trip) {
    throw ApiError.notFound('Trip not found');
  }
  if (trip.userId !== userId) {
    // NOTE: once Person C's TripCollaborator (edit permission) ships,
    // allow that case here too instead of a hard reject.
    throw ApiError.forbidden('You do not have access to this trip');
  }
  return trip;
}

async function assertStopBelongsToTrip(tripId: string, stopId: string) {
  const stop = await prisma.tripStop.findUnique({ where: { id: stopId } });
  if (!stop || stop.tripId !== tripId) {
    throw ApiError.notFound('Trip stop not found');
  }
  return stop;
}

async function assertTripActivityBelongsToStop(stopId: string, tripActivityId: string) {
  const tripActivity = await prisma.tripActivity.findUnique({ where: { id: tripActivityId } });
  if (!tripActivity || tripActivity.tripStopId !== stopId) {
    throw ApiError.notFound('Activity not found on this stop');
  }
  return tripActivity;
}

// ---------------------------------------------------------------------------
// Trips
// ---------------------------------------------------------------------------

export async function listTrips(userId: string) {
  return prisma.trip.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    include: {
      stops: {
        select: {
          id: true,
          cityId: true,
          orderIndex: true,
          city: { select: { name: true, imageUrl: true } },
        },
        orderBy: { orderIndex: 'asc' },
      },
    },
  });
}

export async function createTrip(userId: string, input: CreateTripInput) {
  return prisma.trip.create({
    data: {
      userId,
      name: input.name,
      description: input.description,
      startDate: input.startDate,
      endDate: input.endDate,
      coverPhotoUrl: input.coverPhotoUrl,
      totalBudget: input.totalBudget,
    },
  });
}

export async function getTripById(userId: string, tripId: string) {
  const trip = await assertTripOwnership(tripId, userId);
  return prisma.trip.findUnique({ where: { id: trip.id }, include: tripWithItinerary });
}

export async function updateTrip(userId: string, tripId: string, input: UpdateTripInput) {
  await assertTripOwnership(tripId, userId);
  return prisma.trip.update({ where: { id: tripId }, data: input });
}

export async function deleteTrip(userId: string, tripId: string) {
  await assertTripOwnership(tripId, userId);
  await prisma.trip.delete({ where: { id: tripId } });
}

// ---------------------------------------------------------------------------
// Stops (Itinerary Builder)
// ---------------------------------------------------------------------------

export async function addStop(userId: string, tripId: string, input: CreateStopInput) {
  await assertTripOwnership(tripId, userId);

  const city = await prisma.city.findUnique({ where: { id: input.cityId } });
  if (!city) {
    throw ApiError.badRequest('City not found');
  }

  const lastStop = await prisma.tripStop.findFirst({
    where: { tripId },
    orderBy: { orderIndex: 'desc' },
  });

  return prisma.tripStop.create({
    data: {
      tripId,
      cityId: input.cityId,
      arrivalDate: input.arrivalDate,
      departureDate: input.departureDate,
      orderIndex: (lastStop?.orderIndex ?? -1) + 1,
    },
    include: { city: true },
  });
}

export async function updateStop(userId: string, tripId: string, stopId: string, input: UpdateStopInput) {
  await assertTripOwnership(tripId, userId);
  await assertStopBelongsToTrip(tripId, stopId);

  return prisma.tripStop.update({
    where: { id: stopId },
    data: input,
    include: { city: true },
  });
}

export async function deleteStop(userId: string, tripId: string, stopId: string) {
  await assertTripOwnership(tripId, userId);
  await assertStopBelongsToTrip(tripId, stopId);
  await prisma.tripStop.delete({ where: { id: stopId } });
}

/**
 * Drag-and-drop reorder from the Itinerary Builder. Re-numbers order_index
 * for every stop in one transaction so partial failures never leave gaps
 * or duplicate indexes.
 */
export async function reorderStops(userId: string, tripId: string, input: ReorderStopsInput) {
  await assertTripOwnership(tripId, userId);

  const existingStops = await prisma.tripStop.findMany({ where: { tripId }, select: { id: true } });
  const existingIds = new Set(existingStops.map((s) => s.id));
  const incomingIds = new Set(input.orderedStopIds);

  if (existingIds.size !== incomingIds.size || [...existingIds].some((id) => !incomingIds.has(id))) {
    throw ApiError.badRequest('orderedStopIds must contain exactly the stops currently on this trip');
  }

  await prisma.$transaction(
    input.orderedStopIds.map((stopId, index) =>
      prisma.tripStop.update({ where: { id: stopId }, data: { orderIndex: index } }),
    ),
  );

  return prisma.tripStop.findMany({
    where: { tripId },
    orderBy: { orderIndex: 'asc' },
    include: { city: true },
  });
}

// ---------------------------------------------------------------------------
// Activities within a stop
// ---------------------------------------------------------------------------

export async function addTripActivity(
  userId: string,
  tripId: string,
  stopId: string,
  input: AddTripActivityInput,
) {
  await assertTripOwnership(tripId, userId);
  await assertStopBelongsToTrip(tripId, stopId);

  const activity = await prisma.activity.findUnique({ where: { id: input.activityId } });
  if (!activity) {
    throw ApiError.badRequest('Activity not found');
  }

  const lastActivity = await prisma.tripActivity.findFirst({
    where: { tripStopId: stopId },
    orderBy: { orderIndex: 'desc' },
  });

  return prisma.tripActivity.create({
    data: {
      tripStopId: stopId,
      activityId: input.activityId,
      scheduledDate: input.scheduledDate,
      scheduledTime: input.scheduledTime,
      actualCost: input.actualCost ?? activity.cost,
      orderIndex: (lastActivity?.orderIndex ?? -1) + 1,
    },
    include: { activity: true },
  });
}

export async function updateTripActivity(
  userId: string,
  tripId: string,
  stopId: string,
  tripActivityId: string,
  input: UpdateTripActivityInput,
) {
  await assertTripOwnership(tripId, userId);
  await assertStopBelongsToTrip(tripId, stopId);
  await assertTripActivityBelongsToStop(stopId, tripActivityId);

  return prisma.tripActivity.update({
    where: { id: tripActivityId },
    data: input,
    include: { activity: true },
  });
}

export async function deleteTripActivity(
  userId: string,
  tripId: string,
  stopId: string,
  tripActivityId: string,
) {
  await assertTripOwnership(tripId, userId);
  await assertStopBelongsToTrip(tripId, stopId);
  await assertTripActivityBelongsToStop(stopId, tripActivityId);
  await prisma.tripActivity.delete({ where: { id: tripActivityId } });
}

export async function reorderActivities(
  userId: string,
  tripId: string,
  stopId: string,
  input: ReorderActivitiesInput,
) {
  await assertTripOwnership(tripId, userId);
  await assertStopBelongsToTrip(tripId, stopId);

  const existing = await prisma.tripActivity.findMany({ where: { tripStopId: stopId }, select: { id: true } });
  const existingIds = new Set(existing.map((a) => a.id));
  const incomingIds = new Set(input.orderedTripActivityIds);

  if (existingIds.size !== incomingIds.size || [...existingIds].some((id) => !incomingIds.has(id))) {
    throw ApiError.badRequest('orderedTripActivityIds must contain exactly the activities currently on this stop');
  }

  await prisma.$transaction(
    input.orderedTripActivityIds.map((id, index) =>
      prisma.tripActivity.update({ where: { id }, data: { orderIndex: index } }),
    ),
  );

  return prisma.tripActivity.findMany({
    where: { tripStopId: stopId },
    orderBy: { orderIndex: 'asc' },
    include: { activity: true },
  });
}

// ---------------------------------------------------------------------------
// Computed itinerary (Screen #6 — Itinerary View)
// ---------------------------------------------------------------------------

export async function getItinerary(userId: string, tripId: string) {
  const trip = await assertTripOwnership(tripId, userId);

  const stops = await prisma.tripStop.findMany({
    where: { tripId },
    orderBy: { orderIndex: 'asc' },
    include: {
      city: true,
      activities: {
        orderBy: { orderIndex: 'asc' },
        include: { activity: true },
      },
    },
  });

  const days = stops.map((stop) => {
    const activitiesByDate = new Map<string, typeof stop.activities>();
    for (const tripActivity of stop.activities) {
      const key = tripActivity.scheduledDate.toISOString().slice(0, 10);
      if (!activitiesByDate.has(key)) activitiesByDate.set(key, []);
      activitiesByDate.get(key)!.push(tripActivity);
    }

    return {
      stopId: stop.id,
      city: stop.city,
      arrivalDate: stop.arrivalDate,
      departureDate: stop.departureDate,
      activitiesByDate: Object.fromEntries(activitiesByDate),
    };
  });

  const totalActivityCost = stops.reduce(
    (sum, stop) => sum + stop.activities.reduce((s, a) => s + Number(a.actualCost), 0),
    0,
  );

  return {
    tripId: trip.id,
    name: trip.name,
    startDate: trip.startDate,
    endDate: trip.endDate,
    stops: days,
    totalActivityCost,
  };
}
