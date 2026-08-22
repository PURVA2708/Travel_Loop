import { z } from 'zod';

export const cityQuerySchema = z.object({
  search: z.string().optional(),
  region: z.string().optional(),
  country: z.string().optional(),
  sort: z.enum(['popularity', 'cost_asc', 'cost_desc', 'name']).optional().default('popularity'),
  minCost: z.string().optional().transform((val) => (val ? parseFloat(val) : undefined)),
  maxCost: z.string().optional().transform((val) => (val ? parseFloat(val) : undefined)),
  page: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 1)),
  limit: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 20)),
});

export type CityQueryInput = z.infer<typeof cityQuerySchema>;
