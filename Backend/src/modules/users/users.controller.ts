import { Response, NextFunction } from 'express';
import { UsersService } from './users.service';
import { AuthenticatedRequest } from '../../middleware/auth.middleware';

export class UsersController {
  static async getProfile(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await UsersService.getProfile(req.user!.userId);
      res.status(200).json({
        success: true,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateProfile(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const updatedUser = await UsersService.updateProfile(req.user!.userId, req.body);
      res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        data: updatedUser,
      });
    } catch (error) {
      next(error);
    }
  }

  static async deleteAccount(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      await UsersService.deleteAccount(req.user!.userId);
      res.status(200).json({
        success: true,
        message: 'Account deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  static async getSavedDestinations(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const saved = await UsersService.getSavedDestinations(req.user!.userId);
      res.status(200).json({
        success: true,
        data: saved,
      });
    } catch (error) {
      next(error);
    }
  }

  static async addSavedDestination(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const cityId = req.params.cityId as string;
      const result = await UsersService.addSavedDestination(req.user!.userId, cityId);
      res.status(201).json({
        success: true,
        message: 'City added to saved destinations',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async removeSavedDestination(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const cityId = req.params.cityId as string;
      await UsersService.removeSavedDestination(req.user!.userId, cityId);
      res.status(200).json({
        success: true,
        message: 'City removed from saved destinations',
      });
    } catch (error) {
      next(error);
    }
  }
}
