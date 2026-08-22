import { Router } from 'express';
import { AiController } from './controller.js';
import { requireAuth } from '../../middleware/auth.middleware.js';

const router = Router();

router.post('/suggest-itinerary', requireAuth, (req, res, next) => AiController.suggestItinerary(req, res, next));
router.post('/chat', requireAuth, (req, res, next) => AiController.chatAssistant(req, res, next));

export default router;
