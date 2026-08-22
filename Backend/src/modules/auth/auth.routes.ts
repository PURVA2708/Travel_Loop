import { Router } from 'express';
import { AuthController } from './auth.controller';
import { validateRequest } from '../../middleware/validate.middleware';
import { signupSchema, loginSchema, refreshTokenSchema } from './auth.schema';
import { authMiddleware } from '../../middleware/auth.middleware';

const router = Router();

router.post('/signup', validateRequest(signupSchema), AuthController.signup);
router.post('/login', validateRequest(loginSchema), AuthController.login);
router.post('/logout', AuthController.logout);
router.post('/refresh-token', validateRequest(refreshTokenSchema), AuthController.refreshToken);
router.get('/me', authMiddleware, AuthController.getMe);

export default router;
