import { Router } from 'express';
import { calendarController } from './controller.js';

const router = Router({ mergeParams: true });

// Mounted under /api/v1/trips/:id/calendar
router.get('/', (req, res) => calendarController.getCalendar(req, res));

export default router;
