import { Router } from 'express';
import { UsersController } from './users.controller';
import { authMiddleware } from '../../middleware/auth.middleware';
import { validateRequest } from '../../middleware/validate.middleware';
import { updateProfileSchema } from './users.schema';

const router = Router();

// All user routes require authentication
router.use(authMiddleware);

router.get('/me/profile', UsersController.getProfile);
router.patch('/me/profile', validateRequest(updateProfileSchema), UsersController.updateProfile);
router.delete('/me', UsersController.deleteAccount);

router.get('/me/saved-destinations', UsersController.getSavedDestinations);
router.post('/me/saved-destinations/:cityId', UsersController.addSavedDestination);
router.delete('/me/saved-destinations/:cityId', UsersController.removeSavedDestination);

export default router;
