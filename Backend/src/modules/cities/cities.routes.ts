import { Router } from 'express';
import { asyncHandler } from '../../lib/asyncHandler.js';
import { requireAuth } from '../../middleware/auth.middleware.js';
import { getCityHandler, listCitiesHandler } from './cities.controller.js';

/**
 * Scaffolded here only because Trips (Person B) needs a city catalog to
 * build itineraries against. Full ownership (Screen #7 City Search,
 * saved destinations, etc.) belongs to Person A — extend, don't fork.
 */
export const citiesRouter = Router();

citiesRouter.get('/', requireAuth, asyncHandler(listCitiesHandler));
citiesRouter.get('/:id', requireAuth, asyncHandler(getCityHandler));
