import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import budgetRoutes from './modules/budget/routes.js';
import calendarRoutes from './modules/calendar/routes.js';
import { publicShareRouter, tripShareRouter } from './modules/share/routes.js';
import adminRoutes from './modules/admin/routes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'GlobeTrotter API',
    vertical: 'Person C: Money, Time & Sharing',
  });
});

// Mount Person C Modules
// Budget & Calendar under /api/v1/trips/:id
app.use('/api/v1/trips/:id/budget', budgetRoutes);
app.use('/api/v1/trips/:id/calendar', calendarRoutes);
app.use('/api/v1/trips/:id/share', tripShareRouter);

// Public share endpoints: /api/v1/share/:slug
app.use('/api/v1/share', publicShareRouter);

// Admin endpoints: /api/v1/admin
app.use('/api/v1/admin', adminRoutes);

// Error Handling Middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('[API Error]:', err);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal Server Error',
  });
});

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`🌍 GlobeTrotter Backend API running on http://localhost:${PORT}`);
    console.log(`💰 Budget API: http://localhost:${PORT}/api/v1/trips/:id/budget`);
    console.log(`📅 Calendar API: http://localhost:${PORT}/api/v1/trips/:id/calendar`);
    console.log(`🔗 Share API: http://localhost:${PORT}/api/v1/share/:slug`);
    console.log(`📊 Admin API: http://localhost:${PORT}/api/v1/admin/stats/overview`);
  });
}

export default app;
import { app } from './app.js';
import { env } from './lib/env.js';

app.listen(env.port, () => {
  console.log(`GlobeTrotter API listening on http://localhost:${env.port}`);
});
