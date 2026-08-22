import { Router } from 'express';
import { shareController } from './controller.js';

// Public share router: /api/v1/share
export const publicShareRouter = Router();
publicShareRouter.get('/:slug', (req, res) => shareController.getSharedTrip(req, res));
publicShareRouter.post('/:slug/copy', (req, res) => shareController.copyTrip(req, res));

// Trip scoped router: /api/v1/trips/:id/share
export const tripShareRouter = Router({ mergeParams: true });
tripShareRouter.post('/', (req, res) => shareController.createOrGetShareLink(req, res));
tripShareRouter.delete('/', (req, res) => shareController.revokeShareLink(req, res));
