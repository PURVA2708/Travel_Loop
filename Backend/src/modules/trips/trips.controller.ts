import type { Request, Response } from 'express';
import * as tripsService from './trips.service.js';
import {
  addTripActivitySchema,
  createStopSchema,
  createTripSchema,
  reorderActivitiesSchema,
  reorderStopsSchema,
  updateStopSchema,
  updateTripActivitySchema,
  updateTripSchema,
} from './trips.schema.js';

export async function listTripsHandler(req: Request, res: Response) {
  const trips = await tripsService.listTrips(req.userId!);
  res.status(200).json(trips);
}

export async function createTripHandler(req: Request, res: Response) {
  const input = createTripSchema.parse(req.body);
  const trip = await tripsService.createTrip(req.userId!, input);
  res.status(201).json(trip);
}

export async function getTripHandler(req: Request, res: Response) {
  const trip = await tripsService.getTripById(req.userId!, req.params.id);
  res.status(200).json(trip);
}

export async function updateTripHandler(req: Request, res: Response) {
  const input = updateTripSchema.parse(req.body);
  const trip = await tripsService.updateTrip(req.userId!, req.params.id, input);
  res.status(200).json(trip);
}

export async function deleteTripHandler(req: Request, res: Response) {
  await tripsService.deleteTrip(req.userId!, req.params.id);
  res.status(204).send();
}

export async function addStopHandler(req: Request, res: Response) {
  const input = createStopSchema.parse(req.body);
  const stop = await tripsService.addStop(req.userId!, req.params.id, input);
  res.status(201).json(stop);
}

export async function updateStopHandler(req: Request, res: Response) {
  const input = updateStopSchema.parse(req.body);
  const stop = await tripsService.updateStop(req.userId!, req.params.id, req.params.stopId, input);
  res.status(200).json(stop);
}

export async function deleteStopHandler(req: Request, res: Response) {
  await tripsService.deleteStop(req.userId!, req.params.id, req.params.stopId);
  res.status(204).send();
}

export async function reorderStopsHandler(req: Request, res: Response) {
  const input = reorderStopsSchema.parse(req.body);
  const stops = await tripsService.reorderStops(req.userId!, req.params.id, input);
  res.status(200).json(stops);
}

export async function addTripActivityHandler(req: Request, res: Response) {
  const input = addTripActivitySchema.parse(req.body);
  const tripActivity = await tripsService.addTripActivity(req.userId!, req.params.id, req.params.stopId, input);
  res.status(201).json(tripActivity);
}

export async function updateTripActivityHandler(req: Request, res: Response) {
  const input = updateTripActivitySchema.parse(req.body);
  const tripActivity = await tripsService.updateTripActivity(
    req.userId!,
    req.params.id,
    req.params.stopId,
    req.params.activityId,
    input,
  );
  res.status(200).json(tripActivity);
}

export async function deleteTripActivityHandler(req: Request, res: Response) {
  await tripsService.deleteTripActivity(req.userId!, req.params.id, req.params.stopId, req.params.activityId);
  res.status(204).send();
}

export async function reorderActivitiesHandler(req: Request, res: Response) {
  const input = reorderActivitiesSchema.parse(req.body);
  const activities = await tripsService.reorderActivities(req.userId!, req.params.id, req.params.stopId, input);
  res.status(200).json(activities);
}

export async function getItineraryHandler(req: Request, res: Response) {
  const itinerary = await tripsService.getItinerary(req.userId!, req.params.id);
  res.status(200).json(itinerary);
}
