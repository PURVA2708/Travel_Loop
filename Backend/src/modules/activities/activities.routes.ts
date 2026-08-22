import { Router } from 'express';
import { ActivitiesController } from './activities.controller';

const router = Router();

router.get('/', ActivitiesController.getActivities);
router.get('/:id', ActivitiesController.getActivityById);

export default router;
