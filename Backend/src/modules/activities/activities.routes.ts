import { Router } from 'express';
import { asyncHandler } from '../../lib/asyncHandler.js';
import { requireAuth } from '../../middleware/auth.middleware.js';
import { getActivityHandler, listActivitiesHandler } from './activities.controller.js';

/** Scaffolded for Trips (Person B); full ownership is Person A's (Screen #8). */
export const activitiesRouter = Router();

activitiesRouter.get('/', requireAuth, asyncHandler(listActivitiesHandler));
activitiesRouter.get('/:id', requireAuth, asyncHandler(getActivityHandler));
