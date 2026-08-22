import { Router } from 'express';
import { ActivitiesController, listActivitiesHandler, getActivityHandler } from './activities.controller';
import { optionalAuthMiddleware } from '../../middleware/auth.middleware';

export const activitiesRouter = Router();

activitiesRouter.get('/', optionalAuthMiddleware, ActivitiesController.getActivities);
activitiesRouter.get('/raw', optionalAuthMiddleware, listActivitiesHandler);
activitiesRouter.get('/:id', optionalAuthMiddleware, ActivitiesController.getActivityById);

export default activitiesRouter;
