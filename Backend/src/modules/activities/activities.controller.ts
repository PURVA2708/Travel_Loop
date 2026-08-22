import { Request, Response, NextFunction } from 'express';
import { ActivitiesService, listActivities, getActivityById as getActById } from './activities.service';

export class ActivitiesController {
  static async getActivities(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await ActivitiesService.getActivities(req.query as any);
      res.status(200).json({
        success: true,
        data: result.activities,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getActivityById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const activity = await ActivitiesService.getActivityById(id);
      res.status(200).json({
        success: true,
        data: activity,
      });
    } catch (error) {
      next(error);
    }
  }
}

export async function listActivitiesHandler(req: Request, res: Response, next?: NextFunction) {
  try {
    const { cityId, category, maxCost, maxDuration } = req.query;
    const activities = await listActivities({
      cityId: typeof cityId === 'string' ? cityId : undefined,
      category: category as any,
      maxCost: typeof maxCost === 'string' ? Number(maxCost) : undefined,
      maxDuration: typeof maxDuration === 'string' ? Number(maxDuration) : undefined,
    });
    res.status(200).json(activities);
  } catch (err) {
    if (next) next(err);
    else res.status(500).json({ error: (err as any).message });
  }
}

export async function getActivityHandler(req: Request, res: Response, next?: NextFunction) {
  try {
    const activity = await getActById(req.params.id);
    res.status(200).json(activity);
  } catch (err) {
    if (next) next(err);
    else res.status(500).json({ error: (err as any).message });
  }
}
