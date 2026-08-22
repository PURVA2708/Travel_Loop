import { Prisma, ActivityCategory } from '@prisma/client';
import { prisma } from '../../lib/prisma';
import { AppError } from '../../middleware/error.middleware';
import { ActivityQueryInput } from './activities.schema';

export type ActivityListQuery = {
  cityId?: string;
  category?: ActivityCategory;
  maxCost?: number;
  maxDuration?: number;
};

export class ActivitiesService {
  static async getActivities(query: ActivityQueryInput | any) {
    const { search, cityId, category, maxCost, maxDuration, sort, page = 1, limit = 50 } = query;

    const where: Prisma.ActivityWhereInput = {};

    if (search && typeof search === 'string' && search.trim() !== '') {
      const q = search.trim();
      where.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
        { city: { name: { contains: q, mode: 'insensitive' } } },
        { city: { country: { contains: q, mode: 'insensitive' } } },
      ];
    }

    if (cityId) {
      where.cityId = cityId;
    }

    if (category && category !== 'all') {
      where.category = category.toLowerCase() as ActivityCategory;
    }

    if (maxCost !== undefined) {
      where.cost = { lte: Number(maxCost) };
    }

    if (maxDuration !== undefined) {
      where.durationMinutes = { lte: Number(maxDuration) };
    }

    let orderBy: Prisma.ActivityOrderByWithRelationInput = { name: 'asc' };
    if (sort === 'cost_asc') {
      orderBy = { cost: 'asc' };
    } else if (sort === 'cost_desc') {
      orderBy = { cost: 'desc' };
    } else if (sort === 'duration_asc') {
      orderBy = { durationMinutes: 'asc' };
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [total, activities] = await Promise.all([
      prisma.activity.count({ where }),
      prisma.activity.findMany({
        where,
        orderBy,
        skip,
        take: Number(limit),
        include: {
          city: {
            select: {
              id: true,
              name: true,
              country: true,
              region: true,
            },
          },
        },
      }),
    ]);

    const formatted = activities.map((a) => ({
      id: a.id,
      cityId: a.cityId,
      name: a.name,
      description: a.description,
      category: a.category,
      cost: Number(a.cost),
      durationMinutes: a.durationMinutes,
      imageUrl: a.imageUrl,
      city: a.city,
    }));

    return {
      activities: formatted,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
      },
    };
  }

  static async getActivityById(activityId: string) {
    const activity = await prisma.activity.findUnique({
      where: { id: activityId },
      include: {
        city: true,
      },
    });

    if (!activity) {
      throw new AppError('Activity not found', 404);
    }

    return {
      id: activity.id,
      cityId: activity.cityId,
      name: activity.name,
      description: activity.description,
      category: activity.category,
      cost: Number(activity.cost),
      durationMinutes: activity.durationMinutes,
      imageUrl: activity.imageUrl,
      city: activity.city
        ? {
            ...activity.city,
            costIndex: Number(activity.city.costIndex),
            lat: activity.city.lat ? Number(activity.city.lat) : null,
            lng: activity.city.lng ? Number(activity.city.lng) : null,
          }
        : null,
    };
  }
}

export const listActivities = async (query: ActivityListQuery) => {
  const res = await ActivitiesService.getActivities({ ...query, limit: 100 });
  return res.activities;
};

export const getActivityById = ActivitiesService.getActivityById;
