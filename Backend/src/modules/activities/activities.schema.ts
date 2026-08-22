import { z } from 'zod';

export const activityQuerySchema = z.object({
  search: z.string().optional(),
  cityId: z.string().optional(),
  category: z.string().optional(),
  maxCost: z.string().optional().transform((val) => (val ? parseFloat(val) : undefined)),
  maxDuration: z.string().optional().transform((val) => (val ? parseInt(val, 10) : undefined)),
  sort: z.enum(['rating', 'cost_asc', 'cost_desc', 'duration_asc']).optional().default('rating'),
  page: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 1)),
  limit: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 20)),
});

export type ActivityQueryInput = z.infer<typeof activityQuerySchema>;
