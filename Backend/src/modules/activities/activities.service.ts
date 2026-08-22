import { Prisma, ActivityCategory } from '@prisma/client';
import { prisma } from '../../lib/prisma';
import { AppError } from '../../middleware/error.middleware';
import { ActivityQueryInput } from './activities.schema';

export class ActivitiesService {
  static async getActivities(query: ActivityQueryInput) {
    const { search, cityId, category, maxCost, maxDuration, sort, page = 1, limit = 20 } = query;

    const where: Prisma.ActivityWhereInput = {};

    if (search && search.trim() !== '') {
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
      const catEnum = category.toUpperCase() as ActivityCategory;
      if (Object.values(ActivityCategory).includes(catEnum)) {
        where.category = catEnum;
      }
    }

    if (maxCost !== undefined) {
      where.cost = { lte: maxCost };
    }

    if (maxDuration !== undefined) {
      where.durationMinutes = { lte: maxDuration };
    }

    let orderBy: Prisma.ActivityOrderByWithRelationInput = { rating: 'desc' };
    if (sort === 'cost_asc') {
      orderBy = { cost: 'asc' };
    } else if (sort === 'cost_desc') {
      orderBy = { cost: 'desc' };
    } else if (sort === 'duration_asc') {
      orderBy = { durationMinutes: 'asc' };
    }

    const skip = (page - 1) * limit;

    const [total, activities] = await Promise.all([
      prisma.activity.count({ where }),
      prisma.activity.findMany({
        where,
        orderBy,
        skip,
        take: limit,
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
      rating: Number(a.rating),
      city: a.city,
    }));

    return {
      activities: formatted,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
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
      rating: Number(activity.rating),
      city: {
        ...activity.city,
        costIndex: Number(activity.city.costIndex),
        lat: activity.city.lat ? Number(activity.city.lat) : null,
        lng: activity.city.lng ? Number(activity.city.lng) : null,
      },
    };
  }
}
