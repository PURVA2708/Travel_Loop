import { prisma } from '../../lib/prisma.js';
import { CreateShareLinkInput, CopyTripInput } from './schema.js';

function generateSlug(length = 8): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let slug = '';
  for (let i = 0; i < length; i++) {
    slug += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return slug;
}

export class ShareService {
  async getOrCreateShareLink(tripId: string, data?: CreateShareLinkInput) {
    const existing = await prisma.shareLink.findUnique({
      where: { tripId },
    });

    if (existing) {
      if (data && data.allowCopy !== undefined && existing.allowCopy !== data.allowCopy) {
        return prisma.shareLink.update({
          where: { id: existing.id },
          data: { allowCopy: data.allowCopy },
        });
      }
      return existing;
    }

    const publicSlug = generateSlug(10);
    return prisma.shareLink.create({
      data: {
        tripId,
        publicSlug,
        allowCopy: data?.allowCopy ?? true,
      },
    });
  }

  async revokeShareLink(tripId: string) {
    const existing = await prisma.shareLink.findUnique({
      where: { tripId },
    });

    if (!existing) {
      return null;
    }

    return prisma.shareLink.delete({
      where: { id: existing.id },
    });
  }

  async getSharedTripBySlug(slug: string) {
    const shareLink = await prisma.shareLink.findUnique({
      where: { publicSlug: slug },
      include: {
        trip: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                avatarUrl: true,
              },
            },
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
            expenses: true,
          },
        },
      },
    });

    if (!shareLink || !shareLink.trip) {
      throw new Error('Shared itinerary not found or has expired');
    }

    const trip = shareLink.trip;

    // Calculate aggregated budget stats
    let totalActivityCost = 0;
    trip.stops.forEach((s) => {
      s.activities.forEach((a) => {
        totalActivityCost += Number(a.actualCost || a.activity.cost || 0);
      });
    });

    const totalExpenseCost = trip.expenses.reduce((sum, e) => sum + Number(e.amount), 0);
    const estimatedTotalCost = totalActivityCost + totalExpenseCost;

    return {
      shareLink: {
        slug: shareLink.publicSlug,
        allowCopy: shareLink.allowCopy,
        createdAt: shareLink.createdAt,
      },
      trip: {
        id: trip.id,
        name: trip.name,
        description: trip.description,
        startDate: trip.startDate,
        endDate: trip.endDate,
        coverPhotoUrl: trip.coverPhotoUrl,
        totalBudget: Number(trip.totalBudget),
        estimatedTotalCost,
        author: trip.user,
        stops: trip.stops.map((stop) => ({
          id: stop.id,
          city: stop.city,
          arrivalDate: stop.arrivalDate,
          departureDate: stop.departureDate,
          orderIndex: stop.orderIndex,
          activities: stop.activities.map((act) => ({
            id: act.id,
            name: act.activity.name,
            category: act.activity.category,
            description: act.activity.description,
            cost: Number(act.actualCost || act.activity.cost),
            durationMinutes: act.activity.durationMinutes,
            scheduledDate: act.scheduledDate,
            scheduledTime: act.scheduledTime,
            imageUrl: act.activity.imageUrl,
          })),
        })),
      },
    };
  }

  async copySharedTrip(slug: string, data: CopyTripInput, currentUserId: string) {
    const sharedData = await this.getSharedTripBySlug(slug);
    if (!sharedData.shareLink.allowCopy) {
      throw new Error('This itinerary cannot be copied by permission of its author');
    }

    const original = sharedData.trip;
    const targetUserId = data.targetUserId || currentUserId;

    // Create cloned Trip
    const newTrip = await prisma.trip.create({
      data: {
        userId: targetUserId,
        name: data.newName || `${original.name} (Copy)`,
        description: original.description,
        startDate: original.startDate,
        endDate: original.endDate,
        coverPhotoUrl: original.coverPhotoUrl,
        totalBudget: original.totalBudget,
        status: 'draft',
      },
    });

    // Clone stops and activities
    for (const stop of original.stops) {
      const newStop = await prisma.tripStop.create({
        data: {
          tripId: newTrip.id,
          cityId: stop.city.id,
          arrivalDate: stop.arrivalDate,
          departureDate: stop.departureDate,
          orderIndex: stop.orderIndex,
        },
      });

      for (const act of stop.activities) {
        await prisma.tripActivity.create({
          data: {
            tripStopId: newStop.id,
            activityId: act.id,
            scheduledDate: act.scheduledDate,
            scheduledTime: act.scheduledTime,
            actualCost: act.cost,
            orderIndex: 0,
          },
        });
      }
    }

    return newTrip;
  }
}

export const shareService = new ShareService();
