import { Prisma } from '@prisma/client';
import { prisma } from '../../lib/prisma';
import { AppError } from '../../middleware/error.middleware';
import { CityQueryInput } from './cities.schema';

export class CitiesService {
  static async getCities(query: CityQueryInput, userId?: string) {
    const { search, region, country, sort, minCost, maxCost, page = 1, limit = 20 } = query;

    const where: Prisma.CityWhereInput = {};

    if (search && search.trim() !== '') {
      const q = search.trim();
      where.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { country: { contains: q, mode: 'insensitive' } },
        { region: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
      ];
    }

    if (region && region !== 'all') {
      where.region = { equals: region, mode: 'insensitive' };
    }

    if (country) {
      where.country = { equals: country, mode: 'insensitive' };
    }

    if (minCost !== undefined || maxCost !== undefined) {
      where.costIndex = {};
      if (minCost !== undefined) where.costIndex.gte = minCost;
      if (maxCost !== undefined) where.costIndex.lte = maxCost;
    }

    let orderBy: Prisma.CityOrderByWithRelationInput = { popularityScore: 'desc' };
    if (sort === 'cost_asc') {
      orderBy = { costIndex: 'asc' };
    } else if (sort === 'cost_desc') {
      orderBy = { costIndex: 'desc' };
    } else if (sort === 'name') {
      orderBy = { name: 'asc' };
    }

    const skip = (page - 1) * limit;

    const [total, cities] = await Promise.all([
      prisma.city.count({ where }),
      prisma.city.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          _count: {
            select: { activities: true },
          },
          savedByUsers: userId ? { where: { userId } } : false,
        },
      }),
    ]);

    const formattedCities = cities.map((c) => ({
      id: c.id,
      name: c.name,
      country: c.country,
      region: c.region,
      description: c.description,
      costIndex: Number(c.costIndex),
      popularityScore: c.popularityScore,
      imageUrl: c.imageUrl,
      lat: c.lat ? Number(c.lat) : null,
      lng: c.lng ? Number(c.lng) : null,
      activityCount: c._count.activities,
      isSaved: userId ? Array.isArray(c.savedByUsers) && c.savedByUsers.length > 0 : false,
    }));

    return {
      cities: formattedCities,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  static async getCityById(cityId: string, userId?: string) {
    const city = await prisma.city.findUnique({
      where: { id: cityId },
      include: {
        activities: {
          orderBy: { rating: 'desc' },
        },
        _count: {
          select: { activities: true },
        },
        savedByUsers: userId ? { where: { userId } } : false,
      },
    });

    if (!city) {
      throw new AppError('City not found', 404);
    }

    return {
      id: city.id,
      name: city.name,
      country: city.country,
      region: city.region,
      description: city.description,
      costIndex: Number(city.costIndex),
      popularityScore: city.popularityScore,
      imageUrl: city.imageUrl,
      lat: city.lat ? Number(city.lat) : null,
      lng: city.lng ? Number(city.lng) : null,
      activityCount: city._count.activities,
      isSaved: userId ? Array.isArray(city.savedByUsers) && city.savedByUsers.length > 0 : false,
      activities: city.activities.map((a) => ({
        id: a.id,
        cityId: a.cityId,
        name: a.name,
        description: a.description,
        category: a.category,
        cost: Number(a.cost),
        durationMinutes: a.durationMinutes,
        imageUrl: a.imageUrl,
        rating: Number(a.rating),
      })),
    };
  }

  static async getCityActivities(
    cityId: string,
    filters?: { category?: string; maxCost?: number; maxDuration?: number }
  ) {
    const city = await prisma.city.findUnique({
      where: { id: cityId },
    });

    if (!city) {
      throw new AppError('City not found', 404);
    }

    const where: Prisma.ActivityWhereInput = { cityId };

    if (filters?.category && filters.category !== 'all') {
      where.category = filters.category.toUpperCase() as any;
    }

    if (filters?.maxCost !== undefined) {
      where.cost = { lte: filters.maxCost };
    }

    if (filters?.maxDuration !== undefined) {
      where.durationMinutes = { lte: filters.maxDuration };
    }

    const activities = await prisma.activity.findMany({
      where,
      orderBy: { rating: 'desc' },
    });

    return activities.map((a) => ({
      id: a.id,
      cityId: a.cityId,
      name: a.name,
      description: a.description,
      category: a.category,
      cost: Number(a.cost),
      durationMinutes: a.durationMinutes,
      imageUrl: a.imageUrl,
      rating: Number(a.rating),
    }));
  }
}
