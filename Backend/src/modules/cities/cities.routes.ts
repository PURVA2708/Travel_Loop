import { Router } from 'express';
import { CitiesController } from './cities.controller';
import { optionalAuthMiddleware } from '../../middleware/auth.middleware';

const router = Router();

// Cities routes are public, but use optional auth so we know if user has saved them
router.use(optionalAuthMiddleware);

router.get('/', CitiesController.getCities);
router.get('/:id', CitiesController.getCityById);
router.get('/:id/activities', CitiesController.getCityActivities);

export default router;
