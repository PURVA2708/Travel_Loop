import { Prisma } from '@prisma/client';
import { prisma } from '../../lib/prisma';
import { AppError } from '../../middleware/error.middleware';
import { CityQueryInput } from './cities.schema';

export type CityListQuery = {
  search?: string;
  country?: string;
  region?: string;
  sort?: 'popularity' | 'name' | 'cost' | 'cost_asc' | 'cost_desc';
};

// Cities store a specific region/state (e.g. "Rajasthan", "Southeast Asia") for
// display, which doesn't line up with the continent-level filter chips the UI
// offers (Europe, Asia, North America, Middle East, Oceania). Map by country
// instead so the filter always matches real data regardless of how granular
// each city's stored `region` is.
const COUNTRY_TO_CONTINENT: Record<string, string> = {
  India: 'Asia',
  Indonesia: 'Asia',
  Thailand: 'Asia',
  Singapore: 'Asia',
  Japan: 'Asia',
  UAE: 'Middle East',
  France: 'Europe',
  Italy: 'Europe',
  'United Kingdom': 'Europe',
  'United States': 'North America',
  Australia: 'Oceania',
};

export class CitiesService {
  static async getCities(query: CityQueryInput | any, userId?: string) {
    const { search, region, country, sort, minCost, maxCost, page = 1, limit = 50 } = query;

    const where: Prisma.CityWhereInput = {};

    if (search && typeof search === 'string' && search.trim() !== '') {
      const q = search.trim();
      where.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { country: { contains: q, mode: 'insensitive' } },
        { region: { contains: q, mode: 'insensitive' } },
      ];
    }

    if (region && region.toLowerCase() !== 'all') {
      const countriesInContinent = Object.entries(COUNTRY_TO_CONTINENT)
        .filter(([, continent]) => continent.toLowerCase() === region.toLowerCase())
        .map(([country]) => country);
      where.country = { in: countriesInContinent.length > 0 ? countriesInContinent : ['__none__'] };
    }

    if (country) {
      where.country = { equals: country, mode: 'insensitive' };
    }

    if (minCost !== undefined || maxCost !== undefined) {
      where.costIndex = {};
      if (minCost !== undefined) where.costIndex.gte = Number(minCost);
      if (maxCost !== undefined) where.costIndex.lte = Number(maxCost);
    }

    let orderBy: Prisma.CityOrderByWithRelationInput = { popularityScore: 'desc' };
    if (sort === 'cost_asc' || sort === 'cost') {
      orderBy = { costIndex: 'asc' };
    } else if (sort === 'cost_desc') {
      orderBy = { costIndex: 'desc' };
    } else if (sort === 'name') {
      orderBy = { name: 'asc' };
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [total, cities] = await Promise.all([
      prisma.city.count({ where }),
      prisma.city.findMany({
        where,
        orderBy,
        skip,
        take: Number(limit),
        include: {
          _count: {
            select: { activities: true },
          },
          savedBy: userId ? { where: { userId } } : false,
        },
      }),
    ]);

    const formattedCities = cities.map((c) => ({
      id: c.id,
      name: c.name,
      country: c.country,
      region: c.region,
      costIndex: Number(c.costIndex),
      popularityScore: c.popularityScore,
      imageUrl: c.imageUrl,
      lat: c.lat ? Number(c.lat) : null,
      lng: c.lng ? Number(c.lng) : null,
      activityCount: c._count.activities,
      isSaved: userId ? Array.isArray((c as any).savedBy) && (c as any).savedBy.length > 0 : false,
    }));

    return {
      cities: formattedCities,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
      },
    };
  }

  static async getCityById(cityId: string, userId?: string) {
    const city = await prisma.city.findUnique({
      where: { id: cityId },
      include: {
        activities: true,
        _count: {
          select: { activities: true },
        },
        savedBy: userId ? { where: { userId } } : false,
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
      costIndex: Number(city.costIndex),
      popularityScore: city.popularityScore,
      imageUrl: city.imageUrl,
      lat: city.lat ? Number(city.lat) : null,
      lng: city.lng ? Number(city.lng) : null,
      activityCount: city._count.activities,
      isSaved: userId ? Array.isArray((city as any).savedBy) && (city as any).savedBy.length > 0 : false,
      activities: city.activities.map((a) => ({
        id: a.id,
        cityId: a.cityId,
        name: a.name,
        description: a.description,
        category: a.category,
        cost: Number(a.cost),
        durationMinutes: a.durationMinutes,
        imageUrl: a.imageUrl,
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
      where.category = filters.category.toLowerCase() as any;
    }

    if (filters?.maxCost !== undefined) {
      where.cost = { lte: Number(filters.maxCost) };
    }

    if (filters?.maxDuration !== undefined) {
      where.durationMinutes = { lte: Number(filters.maxDuration) };
    }

    const activities = await prisma.activity.findMany({
      where,
      orderBy: { name: 'asc' },
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
    }));
  }
}

export const listCities = async (query: CityListQuery) => {
  const res = await CitiesService.getCities({ ...query, limit: 50 });
  return res.cities;
};

export const getCityById = CitiesService.getCityById;
