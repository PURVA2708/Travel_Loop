import { Request, Response } from 'express';
import { adminService } from './service.js';

export class AdminController {
  async getOverview(req: Request, res: Response) {
    try {
      const stats = await adminService.getOverviewStats();
      return res.json({ success: true, data: stats });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        error: error.message || 'Failed to fetch overview stats',
      });
    }
  }

  async getTopCities(req: Request, res: Response) {
    try {
      const cities = await adminService.getTopCities();
      return res.json({ success: true, data: cities });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        error: error.message || 'Failed to fetch top cities',
      });
    }
  }

  async getTopActivities(req: Request, res: Response) {
    try {
      const activities = await adminService.getTopActivities();
      return res.json({ success: true, data: activities });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        error: error.message || 'Failed to fetch top activities',
      });
    }
  }

  async getUsers(req: Request, res: Response) {
    try {
      const users = await adminService.getUsers();
      return res.json({ success: true, data: users });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        error: error.message || 'Failed to fetch users',
      });
    }
  }

  async updateUserRole(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { role } = req.body;
      if (!['user', 'admin'].includes(role)) {
        return res.status(400).json({ success: false, error: 'Invalid role value' });
      }
      const updated = await adminService.updateUserRole(id, role);
      return res.json({ success: true, data: updated });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        error: error.message || 'Failed to update user role',
      });
    }
  }
}

export const adminController = new AdminController();
