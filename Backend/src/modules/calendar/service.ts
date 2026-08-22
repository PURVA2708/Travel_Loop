import { prisma } from '../../lib/prisma.js';

export class CalendarService {
  async getTripCalendar(tripId: string) {
    const trip = await prisma.trip.findUnique({
      where: { id: tripId },
      include: {
        stops: {
          orderBy: { orderIndex: 'asc' },
          include: {
            city: true,
            activities: {
              orderBy: { orderIndex: 'asc' },
              include: {
                activity: true,
              },
            },
          },
        },
      },
    });

    if (!trip) {
      throw new Error('Trip not found');
    }

    // Build day-by-day map
    const startDate = new Date(trip.startDate);
    const endDate = new Date(trip.endDate);
    
    // Group all activities by scheduledDate (YYYY-MM-DD)
    const dayMap: Record<
      string,
      {
        date: string;
        dayNumber: number;
        cityStop?: {
          id: string;
          cityName: string;
          country: string;
          imageUrl?: string | null;
        };
        activities: Array<{
          id: string;
          name: string;
          category: string;
          description?: string | null;
          scheduledTime?: string | null;
          actualCost: number;
          durationMinutes: number;
          imageUrl?: string | null;
          orderIndex: number;
        }>;
      }
    > = {};

    // Initialize all dates in trip duration
    const curr = new Date(startDate);
    let dayCount = 1;
    while (curr <= endDate) {
      const dateStr = curr.toISOString().split('T')[0];
      dayMap[dateStr] = {
        date: dateStr,
        dayNumber: dayCount++,
        activities: [],
      };
      curr.setDate(curr.getDate() + 1);
    }

    // Populate stops & activities into days
    trip.stops.forEach((stop) => {
      const stopArrival = new Date(stop.arrivalDate);
      const stopDeparture = new Date(stop.departureDate);

      // Tag city info for the stop date range
      const step = new Date(stopArrival);
      while (step <= stopDeparture) {
        const dStr = step.toISOString().split('T')[0];
        if (dayMap[dStr]) {
          dayMap[dStr].cityStop = {
            id: stop.id,
            cityName: stop.city.name,
            country: stop.city.country,
            imageUrl: stop.city.imageUrl,
          };
        }
        step.setDate(step.getDate() + 1);
      }

      // Add activities
      stop.activities.forEach((act) => {
        const actDateStr = new Date(act.scheduledDate).toISOString().split('T')[0];
        if (!dayMap[actDateStr]) {
          dayMap[actDateStr] = {
            date: actDateStr,
            dayNumber: 0,
            activities: [],
          };
        }
        dayMap[actDateStr].activities.push({
          id: act.id,
          name: act.activity.name,
          category: act.activity.category,
          description: act.activity.description,
          scheduledTime: act.scheduledTime,
          actualCost: Number(act.actualCost || act.activity.cost),
          durationMinutes: act.activity.durationMinutes,
          imageUrl: act.activity.imageUrl,
          orderIndex: act.orderIndex,
        });
      });
    });

    const days = Object.values(dayMap).sort((a, b) => a.date.localeCompare(b.date));

    return {
      trip: {
        id: trip.id,
        name: trip.name,
        description: trip.description,
        startDate: trip.startDate,
        endDate: trip.endDate,
        coverPhotoUrl: trip.coverPhotoUrl,
        totalBudget: Number(trip.totalBudget),
        status: trip.status,
      },
      totalDays: days.length,
      days,
    };
  }
}

export const calendarService = new CalendarService();
