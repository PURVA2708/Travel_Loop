import { Request, Response, NextFunction } from 'express';
import { AiService } from './service.js';
import { suggestItinerarySchema } from './schema.js';

export class AiController {
  static async suggestItinerary(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const input = suggestItinerarySchema.parse(req.body);
      const result = await AiService.suggestItinerary(input);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }
}
