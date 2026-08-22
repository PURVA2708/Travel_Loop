import { Request, Response } from 'express';
import { shareService } from './service.js';
import { createShareLinkSchema, copyTripSchema } from './schema.js';

export class ShareController {
  async createOrGetShareLink(req: Request, res: Response) {
    try {
      const { id } = req.params; // tripId
      const validated = createShareLinkSchema.optional().parse(req.body);
      const shareLink = await shareService.getOrCreateShareLink(id, validated);
      return res.json({ success: true, data: shareLink });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        error: error.message || 'Failed to generate share link',
      });
    }
  }

  async revokeShareLink(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await shareService.revokeShareLink(id);
      return res.json({ success: true, message: 'Share link revoked' });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        error: error.message || 'Failed to revoke share link',
      });
    }
  }

  async getSharedTrip(req: Request, res: Response) {
    try {
      const { slug } = req.params;
      const sharedTrip = await shareService.getSharedTripBySlug(slug);
      return res.json({ success: true, data: sharedTrip });
    } catch (error: any) {
      return res.status(error.message.includes('not found') ? 404 : 500).json({
        success: false,
        error: error.message || 'Failed to fetch shared itinerary',
      });
    }
  }

  async copyTrip(req: Request, res: Response) {
    try {
      const { slug } = req.params;
      const validated = copyTripSchema.parse(req.body || {});
      // In production, currentUserId is extracted from auth middleware (req.user.id)
      const currentUserId = (req as any).user?.id || validated.targetUserId || '00000000-0000-0000-0000-000000000001';
      const newTrip = await shareService.copySharedTrip(slug, validated, currentUserId);
      return res.status(201).json({ success: true, data: newTrip });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        error: error.message || 'Failed to copy trip',
      });
    }
  }
}

export const shareController = new ShareController();
