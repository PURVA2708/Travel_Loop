import React from 'react';
import { CheckCircle2, AlertTriangle, AlertOctagon, TrendingUp } from 'lucide-react';

interface BudgetAlertBannerProps {
  status: 'within' | 'warning' | 'danger';
  totalBudget: number;
  totalSpent: number;
  remaining: number;
}

export const BudgetAlertBanner: React.FC<BudgetAlertBannerProps> = ({
  status,
  totalBudget,
  totalSpent,
  remaining,
}) => {
  const percentage = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0;

  if (status === 'danger') {
    return (
      <div className="rounded-2xl bg-red-50 border-2 border-danger/40 p-4 sm:p-5 flex items-start gap-3.5 text-danger shadow-subtle">
        <AlertOctagon className="w-6 h-6 text-danger shrink-0 mt-0.5" />
        <div className="flex-1">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h4 className="font-bold text-sm sm:text-base text-red-900">
              Budget Exceeded by ₹{Math.abs(remaining).toLocaleString('en-IN')} ({percentage}%)
            </h4>
            <span className="text-xs font-bold uppercase tracking-wider bg-danger text-white px-2.5 py-0.5 rounded-full">
              Critical Alert
            </span>
          </div>
          <p className="text-xs sm:text-sm text-red-700 mt-1 leading-relaxed">
            Your total planned expenses (₹{totalSpent.toLocaleString('en-IN')}) have surpassed the allocated total budget (₹{totalBudget.toLocaleString('en-IN')}). Consider adjusting activity costs or increasing your budget limit.
          </p>
        </div>
      </div>
    );
  }

  if (status === 'warning') {
    return (
      <div className="rounded-2xl bg-amber-50 border-2 border-warning/40 p-4 sm:p-5 flex items-start gap-3.5 text-amber-900 shadow-subtle">
        <AlertTriangle className="w-6 h-6 text-warning shrink-0 mt-0.5" />
        <div className="flex-1">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h4 className="font-bold text-sm sm:text-base text-amber-900">
              Approaching Budget Limit — {percentage}% Utilized
            </h4>
            <span className="text-xs font-bold uppercase tracking-wider bg-warning text-ink px-2.5 py-0.5 rounded-full">
              Warning
            </span>
          </div>
          <p className="text-xs sm:text-sm text-amber-800 mt-1 leading-relaxed">
            You have ₹{remaining.toLocaleString('en-IN')} remaining of your ₹{totalBudget.toLocaleString('en-IN')} budget. Keep an eye on upcoming day-to-day miscellaneous spend.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-emerald-50 border-2 border-success/40 p-4 sm:p-5 flex items-start gap-3.5 text-emerald-950 shadow-subtle">
      <CheckCircle2 className="w-6 h-6 text-success shrink-0 mt-0.5" />
      <div className="flex-1">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h4 className="font-bold text-sm sm:text-base text-emerald-950 flex items-center gap-2">
            Healthy Budget Track ({percentage}% Spent)
          </h4>
          <span className="text-xs font-bold uppercase tracking-wider bg-success text-white px-2.5 py-0.5 rounded-full flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> On Track
          </span>
        </div>
        <p className="text-xs sm:text-sm text-emerald-800 mt-1 leading-relaxed">
          Great job! You have ₹{remaining.toLocaleString('en-IN')} safely left in your trip budget.
        </p>
      </div>
    </div>
  );
};
