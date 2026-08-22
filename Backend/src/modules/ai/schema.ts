import { z } from 'zod';

export const suggestItinerarySchema = z.object({
  startDate: z.string().min(1),
  endDate: z.string().min(1),
  interests: z.string().max(200).optional(),
});

export type SuggestItineraryInput = z.infer<typeof suggestItinerarySchema>;

export const assistantChatSchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(['user', 'assistant']),
        content: z.string().min(1).max(2000),
      }),
    )
    .min(1)
    .max(30),
});

export type AssistantChatInput = z.infer<typeof assistantChatSchema>;
