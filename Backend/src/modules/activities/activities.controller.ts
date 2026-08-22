import type { Request, Response } from 'express';
import * as activitiesService from './activities.service.js';

const VALID_CATEGORIES = ['sightseeing', 'food', 'adventure', 'culture', 'nightlife'] as const;

export async function listActivitiesHandler(req: Request, res: Response) {
  const { cityId, category, maxCost, maxDuration } = req.query;
  const activities = await activitiesService.listActivities({
    cityId: typeof cityId === 'string' ? cityId : undefined,
    category: VALID_CATEGORIES.includes(category as (typeof VALID_CATEGORIES)[number])
      ? (category as (typeof VALID_CATEGORIES)[number])
      : undefined,
    maxCost: typeof maxCost === 'string' ? Number(maxCost) : undefined,
    maxDuration: typeof maxDuration === 'string' ? Number(maxDuration) : undefined,
  });
  res.status(200).json(activities);
}

export async function getActivityHandler(req: Request, res: Response) {
  const activity = await activitiesService.getActivityById(req.params.id);
  res.status(200).json(activity);
}
