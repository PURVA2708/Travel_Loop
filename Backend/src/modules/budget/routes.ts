import { Router } from 'express';
import { budgetController } from './controller.js';

const router = Router({ mergeParams: true });

// Routes mapped under /api/v1/trips/:id/budget
router.get('/', (req, res) => budgetController.getBudget(req, res));
router.post('/expenses', (req, res) => budgetController.addExpense(req, res));
router.patch('/expenses/:expenseId', (req, res) => budgetController.updateExpense(req, res));
router.delete('/expenses/:expenseId', (req, res) => budgetController.deleteExpense(req, res));
router.get('/daily-average', (req, res) => budgetController.getDailyAverage(req, res));

export default router;
