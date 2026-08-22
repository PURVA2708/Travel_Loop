import { z } from 'zod';

export const createShareLinkSchema = z.object({
  allowCopy: z.boolean().default(true),
});

export const copyTripSchema = z.object({
  targetUserId: z.string().uuid().optional(),
  newName: z.string().min(1).optional(),
});

export type CreateShareLinkInput = z.infer<typeof createShareLinkSchema>;
export type CopyTripInput = z.infer<typeof copyTripSchema>;
