import { Router } from 'express';
import { adminController } from './controller.js';

const router = Router();

// Mounted under /api/v1/admin
router.get('/stats/overview', (req, res) => adminController.getOverview(req, res));
router.get('/stats/top-cities', (req, res) => adminController.getTopCities(req, res));
router.get('/stats/top-activities', (req, res) => adminController.getTopActivities(req, res));
router.get('/users', (req, res) => adminController.getUsers(req, res));
router.patch('/users/:id/role', (req, res) => adminController.updateUserRole(req, res));

export default router;
