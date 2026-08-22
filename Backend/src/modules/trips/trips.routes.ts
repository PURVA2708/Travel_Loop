import { Router } from 'express';
import { asyncHandler } from '../../lib/asyncHandler.js';
import { requireAuth } from '../../middleware/auth.middleware.js';
import {
  addStopHandler,
  addTripActivityHandler,
  createTripHandler,
  deleteStopHandler,
  deleteTripActivityHandler,
  deleteTripHandler,
  getItineraryHandler,
  getTripHandler,
  listTripsHandler,
  reorderActivitiesHandler,
  reorderStopsHandler,
  updateStopHandler,
  updateTripActivityHandler,
  updateTripHandler,
} from './trips.controller.js';

/** Person B — Trip Core & Itinerary vertical (Screens #3, #4, #5, #6). */
export const tripsRouter = Router();

tripsRouter.use(requireAuth);

tripsRouter.get('/', asyncHandler(listTripsHandler));
tripsRouter.post('/', asyncHandler(createTripHandler));
tripsRouter.get('/:id', asyncHandler(getTripHandler));
tripsRouter.patch('/:id', asyncHandler(updateTripHandler));
tripsRouter.delete('/:id', asyncHandler(deleteTripHandler));

tripsRouter.get('/:id/itinerary', asyncHandler(getItineraryHandler));

tripsRouter.post('/:id/stops', asyncHandler(addStopHandler));
tripsRouter.patch('/:id/stops/reorder', asyncHandler(reorderStopsHandler));
tripsRouter.patch('/:id/stops/:stopId', asyncHandler(updateStopHandler));
tripsRouter.delete('/:id/stops/:stopId', asyncHandler(deleteStopHandler));

tripsRouter.post('/:id/stops/:stopId/activities', asyncHandler(addTripActivityHandler));
tripsRouter.patch('/:id/stops/:stopId/activities/reorder', asyncHandler(reorderActivitiesHandler));
tripsRouter.patch('/:id/stops/:stopId/activities/:activityId', asyncHandler(updateTripActivityHandler));
tripsRouter.delete('/:id/stops/:stopId/activities/:activityId', asyncHandler(deleteTripActivityHandler));
