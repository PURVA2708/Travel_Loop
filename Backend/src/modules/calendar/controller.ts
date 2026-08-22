import { Request, Response } from 'express';
import { calendarService } from './service.js';

export class CalendarController {
  async getCalendar(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const calendar = await calendarService.getTripCalendar(id);
      return res.json({ success: true, data: calendar });
    } catch (error: any) {
      return res.status(error.message === 'Trip not found' ? 404 : 500).json({
        success: false,
        error: error.message || 'Failed to fetch calendar timeline',
      });
    }
  }
}

export const calendarController = new CalendarController();
