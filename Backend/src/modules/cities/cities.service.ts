import { prisma } from '../../lib/prisma.js';
import { ApiError } from '../../lib/ApiError.js';

export type CityListQuery = {
  search?: string;
  country?: string;
  region?: string;
  sort?: 'popularity' | 'name' | 'cost';
};

export async function listCities(query: CityListQuery) {
  const where = {
    ...(query.search
      ? { name: { contains: query.search, mode: 'insensitive' as const } }
      : {}),
    ...(query.country ? { country: query.country } : {}),
    ...(query.region ? { region: query.region } : {}),
  };

  const orderBy =
    query.sort === 'name'
      ? { name: 'asc' as const }
      : query.sort === 'cost'
        ? { costIndex: 'asc' as const }
        : { popularityScore: 'desc' as const };

  return prisma.city.findMany({ where, orderBy, take: 50 });
}

export async function getCityById(id: string) {
  const city = await prisma.city.findUnique({ where: { id } });
  if (!city) {
    throw ApiError.notFound('City not found');
  }
  return city;
}
