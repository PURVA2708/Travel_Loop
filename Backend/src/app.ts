import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import authRoutes from './modules/auth/auth.routes';
import usersRoutes from './modules/users/users.routes';
import citiesRoutes from './modules/cities/cities.routes';
import activitiesRoutes from './modules/activities/activities.routes';
import { errorHandler } from './middleware/error.middleware';

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
  app.get('/api/v1/health', (_req: Request, res: Response) => {
    res.status(200).json({
      status: 'ok',
      service: 'GlobeTrotter API',
      version: 'v1.0.0',
      timestamp: new Date().toISOString(),
    });
  });

  // Mount API modules
  app.use('/api/v1/auth', authRoutes);
  app.use('/api/v1/users', usersRoutes);
  app.use('/api/v1/cities', citiesRoutes);
  app.use('/api/v1/activities', activitiesRoutes);

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
