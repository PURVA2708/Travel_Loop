import { Request, Response } from 'express';
import { budgetService } from './service.js';
import { createExpenseSchema, updateExpenseSchema } from './schema.js';

export class BudgetController {
  async getBudget(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const budget = await budgetService.getTripBudget(id);
      return res.json({ success: true, data: budget });
    } catch (error: any) {
      return res.status(error.message === 'Trip not found' ? 404 : 500).json({
        success: false,
        error: error.message || 'Failed to fetch budget',
      });
    }
  }

  async addExpense(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const validated = createExpenseSchema.parse(req.body);
      const expense = await budgetService.addExpense(id, validated);
      return res.status(201).json({ success: true, data: expense });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        error: error.errors || error.message || 'Invalid expense data',
      });
    }
  }

  async updateExpense(req: Request, res: Response) {
    try {
      const { expenseId } = req.params;
      const validated = updateExpenseSchema.parse(req.body);
      const updated = await budgetService.updateExpense(expenseId, validated);
      return res.json({ success: true, data: updated });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        error: error.errors || error.message || 'Failed to update expense',
      });
    }
  }

  async deleteExpense(req: Request, res: Response) {
    try {
      const { expenseId } = req.params;
      await budgetService.deleteExpense(expenseId);
      return res.json({ success: true, message: 'Expense deleted successfully' });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        error: error.message || 'Failed to delete expense',
      });
    }
  }

  async getDailyAverage(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const data = await budgetService.getDailyAverage(id);
      return res.json({ success: true, data });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        error: error.message || 'Failed to calculate daily average',
      });
    }
  }
}

export const budgetController = new BudgetController();
