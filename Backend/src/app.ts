import express from 'express';
import cors from 'cors';
import { env } from './lib/env.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { authRouter } from './modules/auth/auth.routes.js';
import { tripsRouter } from './modules/trips/trips.routes.js';
import { citiesRouter } from './modules/cities/cities.routes.js';
import { activitiesRouter } from './modules/activities/activities.routes.js';

export const app = express();

app.use(cors({ origin: env.corsOrigin, credentials: true }));
app.use(express.json());

app.get('/health', (_req, res) => res.status(200).json({ status: 'ok' }));

const v1 = express.Router();
v1.use('/auth', authRouter);
v1.use('/trips', tripsRouter);
v1.use('/cities', citiesRouter);
v1.use('/activities', activitiesRouter);
app.use('/api/v1', v1);

app.use(notFoundHandler);
app.use(errorHandler);
