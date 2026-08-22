import { z } from 'zod';

const isoDate = z.coerce.date();

export const createTripSchema = z
  .object({
    name: z.string().min(2).max(120),
    description: z.string().max(2000).optional(),
    startDate: isoDate,
    endDate: isoDate,
    coverPhotoUrl: z.string().url().optional(),
    totalBudget: z.coerce.number().nonnegative().optional(),
  })
  .refine((data) => data.endDate >= data.startDate, {
    message: 'endDate must be on or after startDate',
    path: ['endDate'],
  });

export const updateTripSchema = z
  .object({
    name: z.string().min(2).max(120).optional(),
    description: z.string().max(2000).optional(),
    startDate: isoDate.optional(),
    endDate: isoDate.optional(),
    coverPhotoUrl: z.string().url().optional(),
    totalBudget: z.coerce.number().nonnegative().optional(),
    status: z.enum(['draft', 'planned', 'completed']).optional(),
  })
  .refine((data) => !data.startDate || !data.endDate || data.endDate >= data.startDate, {
    message: 'endDate must be on or after startDate',
    path: ['endDate'],
  });

export const createStopSchema = z
  .object({
    cityId: z.string().uuid(),
    arrivalDate: isoDate,
    departureDate: isoDate,
  })
  .refine((data) => data.departureDate >= data.arrivalDate, {
    message: 'departureDate must be on or after arrivalDate',
    path: ['departureDate'],
  });

export const updateStopSchema = z
  .object({
    cityId: z.string().uuid().optional(),
    arrivalDate: isoDate.optional(),
    departureDate: isoDate.optional(),
  })
  .refine((data) => !data.arrivalDate || !data.departureDate || data.departureDate >= data.arrivalDate, {
    message: 'departureDate must be on or after arrivalDate',
    path: ['departureDate'],
  });

export const reorderStopsSchema = z.object({
  orderedStopIds: z.array(z.string().uuid()).min(1),
});

export const addTripActivitySchema = z.object({
  activityId: z.string().uuid(),
  scheduledDate: isoDate,
  scheduledTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  actualCost: z.number().nonnegative().optional(),
});

export const updateTripActivitySchema = z.object({
  scheduledDate: isoDate.optional(),
  scheduledTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  actualCost: z.number().nonnegative().optional(),
});

export const reorderActivitiesSchema = z.object({
  orderedTripActivityIds: z.array(z.string().uuid()).min(1),
});

export type CreateTripInput = z.infer<typeof createTripSchema>;
export type UpdateTripInput = z.infer<typeof updateTripSchema>;
export type CreateStopInput = z.infer<typeof createStopSchema>;
export type UpdateStopInput = z.infer<typeof updateStopSchema>;
export type ReorderStopsInput = z.infer<typeof reorderStopsSchema>;
export type AddTripActivityInput = z.infer<typeof addTripActivitySchema>;
export type UpdateTripActivityInput = z.infer<typeof updateTripActivitySchema>;
export type ReorderActivitiesInput = z.infer<typeof reorderActivitiesSchema>;
