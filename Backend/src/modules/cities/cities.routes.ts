import { Router } from 'express';
import { CitiesController, listCitiesHandler, getCityHandler } from './cities.controller';
import { optionalAuthMiddleware } from '../../middleware/auth.middleware';

export const citiesRouter = Router();

// Cities routes are public, but use optional auth so we know if user has saved them
citiesRouter.use(optionalAuthMiddleware);

citiesRouter.get('/', CitiesController.getCities);
citiesRouter.get('/raw', listCitiesHandler);
citiesRouter.get('/:id', CitiesController.getCityById);
citiesRouter.get('/:id/activities', CitiesController.getCityActivities);

export default citiesRouter;
