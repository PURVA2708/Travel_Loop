import { Prisma } from '@prisma/client';
import { prisma } from '../../lib/prisma.js';
import { ApiError } from '../../lib/ApiError.js';

export type ActivityListQuery = {
  cityId?: string;
  category?: Prisma.ActivityWhereInput['category'];
  maxCost?: number;
  maxDuration?: number;
};

export async function listActivities(query: ActivityListQuery) {
  return prisma.activity.findMany({
    where: {
      ...(query.cityId ? { cityId: query.cityId } : {}),
      ...(query.category ? { category: query.category } : {}),
      ...(query.maxCost !== undefined ? { cost: { lte: query.maxCost } } : {}),
      ...(query.maxDuration !== undefined ? { durationMinutes: { lte: query.maxDuration } } : {}),
    },
    orderBy: { name: 'asc' },
    take: 100,
  });
}

export async function getActivityById(id: string) {
  const activity = await prisma.activity.findUnique({ where: { id } });
  if (!activity) {
    throw ApiError.notFound('Activity not found');
  }
  return activity;
}
