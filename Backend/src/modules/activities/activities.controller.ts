import { Request, Response, NextFunction } from 'express';
import { ActivitiesService } from './activities.service';

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
