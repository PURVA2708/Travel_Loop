import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import authRoutes from './modules/auth/auth.routes';
import usersRoutes from './modules/users/users.routes';
import citiesRoutes from './modules/cities/cities.routes';
import activitiesRoutes from './modules/activities/activities.routes';
import { tripsRouter } from './modules/trips/trips.routes';
import budgetRoutes from './modules/budget/routes';
import calendarRoutes from './modules/calendar/routes';
import { publicShareRouter, tripShareRouter } from './modules/share/routes';
import adminRoutes from './modules/admin/routes';
import aiRoutes from './modules/ai/routes';
import { errorHandler } from './middleware/error.middleware';
import { requireAuth } from './middleware/auth.middleware';

export const createApp = (): Express => {
  const app = express();

  // Middleware
  app.use(
    cors({
      origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
      credentials: true,
      methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    })
  );

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Basic request logger
  app.use((req, _res, next) => {
    if (process.env.NODE_ENV !== 'test') {
      console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
    }
    next();
  });

  // Health check
  app.get('/health', (_req: Request, res: Response) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  app.get('/api/v1/health', (_req: Request, res: Response) => {
    res.status(200).json({
      status: 'ok',
      service: 'GlobeTrotter API',
      version: 'v1.0.0',
      timestamp: new Date().toISOString(),
    });
  });

  // Mount API v1 modules
  const v1 = express.Router();
  v1.use('/auth', authRoutes);
  v1.use('/users', usersRoutes);
  v1.use('/cities', citiesRoutes);
  v1.use('/activities', activitiesRoutes);
  v1.use('/trips', tripsRouter);
  v1.use('/trips/:id/budget', requireAuth, budgetRoutes);
  v1.use('/trips/:id/calendar', requireAuth, calendarRoutes);
  v1.use('/trips/:id/share', requireAuth, tripShareRouter);
  v1.use('/share', publicShareRouter);
  v1.use('/admin', adminRoutes);
  v1.use('/ai', aiRoutes);

  app.use('/api/v1', v1);

  // 404 Handler
  app.use((req: Request, res: Response) => {
    res.status(404).json({
      success: false,
      message: `Route ${req.method} ${req.originalUrl} not found`,
    });
  });

  // Error Handler
  app.use(errorHandler);

  return app;
};

export const app = createApp();
export default app;
