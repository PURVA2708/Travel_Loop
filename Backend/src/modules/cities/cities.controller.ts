import { Response, NextFunction } from 'express';
import { CitiesService } from './cities.service';
import { AuthenticatedRequest } from '../../middleware/auth.middleware';

export class CitiesController {
  static async getCities(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await CitiesService.getCities(req.query as any, req.user?.userId);
      res.status(200).json({
        success: true,
        data: result.cities,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getCityById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const city = await CitiesService.getCityById(id, req.user?.userId);
      res.status(200).json({
        success: true,
        data: city,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getCityActivities(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const { category, maxCost, maxDuration } = req.query;

      const activities = await CitiesService.getCityActivities(id, {
        category: category as string,
        maxCost: maxCost ? parseFloat(maxCost as string) : undefined,
        maxDuration: maxDuration ? parseInt(maxDuration as string, 10) : undefined,
      });

      res.status(200).json({
        success: true,
        data: activities,
      });
    } catch (error) {
      next(error);
    }
  }
}
