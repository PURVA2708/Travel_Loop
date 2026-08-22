import { z } from 'zod';

export const ExpenseCategoryEnum = z.enum(['transport', 'stay', 'activities', 'meals', 'misc']);

export const createExpenseSchema = z.object({
  category: ExpenseCategoryEnum,
  amount: z.number().positive({ message: 'Amount must be positive' }),
  note: z.string().max(255).optional(),
});

export const updateExpenseSchema = z.object({
  category: ExpenseCategoryEnum.optional(),
  amount: z.number().positive().optional(),
  note: z.string().max(255).optional(),
});

export type CreateExpenseInput = z.infer<typeof createExpenseSchema>;
export type UpdateExpenseInput = z.infer<typeof updateExpenseSchema>;
