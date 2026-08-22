import { Router } from 'express';
import { AuthController } from './auth.controller';
import { validateRequest } from '../../middleware/validate.middleware';
import { signupSchema, loginSchema, refreshTokenSchema } from './auth.schema';
import { authMiddleware } from '../../middleware/auth.middleware';

export const authRouter = Router();

authRouter.post('/signup', validateRequest(signupSchema), AuthController.signup);
authRouter.post('/login', validateRequest(loginSchema), AuthController.login);
authRouter.post('/logout', AuthController.logout);
authRouter.post('/refresh-token', validateRequest(refreshTokenSchema), AuthController.refreshToken);
authRouter.get('/me', authMiddleware, AuthController.getMe);

export default authRouter;
