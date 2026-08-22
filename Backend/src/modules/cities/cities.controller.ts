import { Response, NextFunction, Request } from 'express';
import { CitiesService, listCities, getCityById as getCityByIdFunc } from './cities.service';
import { AuthenticatedRequest } from '../../middleware/auth.middleware';

export class CitiesController {
  static async getCities(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId || req.userId;
      const result = await CitiesService.getCities(req.query as any, userId);
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
      const userId = req.user?.userId || req.userId;
      const city = await CitiesService.getCityById(id, userId);
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

export async function listCitiesHandler(req: Request, res: Response, next?: NextFunction) {
  try {
    const { search, country, region, sort } = req.query;
    const cities = await listCities({
      search: typeof search === 'string' ? search : undefined,
      country: typeof country === 'string' ? country : undefined,
      region: typeof region === 'string' ? region : undefined,
      sort: sort as any,
    });
    res.status(200).json(cities);
  } catch (err) {
    if (next) next(err);
    else res.status(500).json({ error: (err as any).message });
  }
}

export async function getCityHandler(req: Request, res: Response, next?: NextFunction) {
  try {
    const city = await getCityByIdFunc(req.params.id);
    res.status(200).json(city);
  } catch (err) {
    if (next) next(err);
    else res.status(500).json({ error: (err as any).message });
  }
}
