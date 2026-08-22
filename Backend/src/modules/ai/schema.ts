import { z } from 'zod';

export const suggestItinerarySchema = z.object({
  startDate: z.string().min(1),
  endDate: z.string().min(1),
  interests: z.string().max(200).optional(),
});

export type SuggestItineraryInput = z.infer<typeof suggestItinerarySchema>;
