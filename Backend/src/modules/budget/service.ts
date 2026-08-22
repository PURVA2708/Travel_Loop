import { prisma } from '../../lib/prisma.js';
import { CreateExpenseInput, UpdateExpenseInput } from './schema.js';

export class BudgetService {
  async getTripBudget(tripId: string) {
    const trip = await prisma.trip.findUnique({
      where: { id: tripId },
      include: {
        expenses: {
          orderBy: { createdAt: 'desc' },
        },
        stops: {
          include: {
            activities: true,
          },
        },
      },
    });

    if (!trip) {
      throw new Error('Trip not found');
    }

    // Aggregate category totals from explicit expenses
    const categoryTotals: Record<string, number> = {
      transport: 0,
      stay: 0,
      activities: 0,
      meals: 0,
      misc: 0,
    };

    trip.expenses.forEach((expense) => {
      const cat = expense.category;
      categoryTotals[cat] = (categoryTotals[cat] || 0) + Number(expense.amount);
    });

    // Also include costs from scheduled trip activities
    let activityCostsFromItinerary = 0;
    trip.stops.forEach((stop) => {
      stop.activities.forEach((act) => {
        activityCostsFromItinerary += Number(act.actualCost || 0);
      });
    });

    // Total spent
    const totalExplicitExpenses = Object.values(categoryTotals).reduce((sum, val) => sum + val, 0);
    const totalSpent = totalExplicitExpenses + activityCostsFromItinerary;
    const totalBudget = Number(trip.totalBudget) || 0;
    const remaining = totalBudget - totalSpent;

    // Status: within (<80%), warning (80-100%), danger (>100%)
    let status: 'within' | 'warning' | 'danger' = 'within';
    if (totalBudget > 0) {
      const percentage = (totalSpent / totalBudget) * 100;
      if (percentage > 100) {
        status = 'danger';
      } else if (percentage >= 80) {
        status = 'warning';
      }
    }

    // Calculate days duration
    const start = new Date(trip.startDate);
    const end = new Date(trip.endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const durationDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1);
    const dailyAverageSpent = totalSpent / durationDays;
    const dailyBudget = totalBudget > 0 ? totalBudget / durationDays : 0;

    return {
      tripId: trip.id,
      tripName: trip.name,
      totalBudget,
      totalSpent,
      remaining,
      status,
      durationDays,
      dailyBudget,
      dailyAverageSpent,
      categoryBreakdown: {
        ...categoryTotals,
        activities: categoryTotals.activities + activityCostsFromItinerary,
      },
      expenses: trip.expenses,
      activityCostsCount: trip.stops.reduce((acc, s) => acc + s.activities.length, 0),
    };
  }

  async addExpense(tripId: string, data: CreateExpenseInput) {
    return prisma.tripExpense.create({
      data: {
        tripId,
        category: data.category,
        amount: data.amount,
        note: data.note,
      },
    });
  }

  async updateExpense(expenseId: string, data: UpdateExpenseInput) {
    return prisma.tripExpense.update({
      where: { id: expenseId },
      data,
    });
  }

  async deleteExpense(expenseId: string) {
    return prisma.tripExpense.delete({
      where: { id: expenseId },
    });
  }

  async getDailyAverage(tripId: string) {
    const budget = await this.getTripBudget(tripId);
    return {
      tripId,
      durationDays: budget.durationDays,
      dailyBudget: budget.dailyBudget,
      dailyAverageSpent: budget.dailyAverageSpent,
      isOverDailyLimit: budget.dailyBudget > 0 && budget.dailyAverageSpent > budget.dailyBudget,
    };
  }
}

export const budgetService = new BudgetService();
