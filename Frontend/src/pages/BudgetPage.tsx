import React, { useState, useEffect } from 'react';
import {
  DollarSign,
  Plus,
  Trash2,
  PieChart as PieIcon,
  BarChart3,
  Calendar,
  Wallet,
  ArrowUpRight,
  TrendingDown,
  Search,
  Filter,
  RefreshCw,
} from 'lucide-react';
import { apiClient, MOCK_TRIP_ID } from '../services/api.ts';
import { BudgetData, ExpenseCategory } from '../types/index.ts';
import { BudgetDonutChart } from '../components/charts/BudgetDonutChart.tsx';
import { DailySpendBarChart } from '../components/charts/DailySpendBarChart.tsx';
import { BudgetAlertBanner } from '../components/common/BudgetAlertBanner.tsx';
import { CategoryBadge } from '../components/common/Badge.tsx';

export const BudgetPage: React.FC<{ tripId?: string }> = ({ tripId = MOCK_TRIP_ID }) => {
  const [data, setData] = useState<BudgetData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeChart, setActiveChart] = useState<'donut' | 'daily'>('donut');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  
  // Add Expense Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newAmount, setNewAmount] = useState('');
  const [newCategory, setNewCategory] = useState<ExpenseCategory>('transport');
  const [newNote, setNewNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchBudget = async () => {
    setLoading(true);
    try {
      const res = await apiClient.getBudget(tripId);
      setData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBudget();
  }, [tripId]);

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAmount || Number(newAmount) <= 0) return;

    setSubmitting(true);
    try {
      await apiClient.addExpense(tripId, {
        category: newCategory,
        amount: Number(newAmount),
        note: newNote || undefined,
      });
      setNewAmount('');
      setNewNote('');
      setIsAddModalOpen(false);
      await fetchBudget();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteExpense = async (id: string) => {
    if (!confirm('Are you sure you want to delete this expense?')) return;
    await apiClient.deleteExpense(id);
    await fetchBudget();
  };

  if (loading && !data) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col items-center justify-center min-h-[50vh]">
        <RefreshCw className="w-8 h-8 text-brand animate-spin mb-4" />
        <p className="text-sm font-semibold text-ink">Calculating Trip Budget...</p>
      </div>
    );
  }

  if (!data) return null;

  const filteredExpenses = data.expenses.filter((exp) => {
    const matchesSearch = exp.note ? exp.note.toLowerCase().includes(searchTerm.toLowerCase()) : true;
    const matchesCategory = selectedCategory === 'all' || exp.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-brand text-ink text-xs font-bold uppercase tracking-wider">
              Screen #9
            </span>
            <span className="text-xs text-ink-muted">Trip Budget & Cost Intelligence</span>
          </div>
          <h1 className="font-display font-bold text-2xl sm:text-3xl text-ink tracking-tight">
            {data.tripName}
          </h1>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-brand hover:bg-brand-dark text-ink font-bold text-sm transition-all shadow-sm active:scale-95"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            Log Expense
          </button>
        </div>
      </div>

      {/* Smart Budget Alert Banner */}
      <div className="mb-8">
        <BudgetAlertBanner
          status={data.status}
          totalBudget={data.totalBudget}
          totalSpent={data.totalSpent}
          remaining={data.remaining}
        />
      </div>

      {/* Top 4 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Total Budget */}
        <div className="bg-surface-white p-5 rounded-2xl border border-surface-subtle shadow-card flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-ink-muted uppercase tracking-wider">Total Budget</p>
            <p className="font-display font-bold text-2xl text-ink mt-1">
              ₹{data.totalBudget.toLocaleString('en-IN')}
            </p>
            <p className="text-[11px] text-ink-muted mt-1 flex items-center gap-1">
              <Wallet className="w-3 h-3 text-ink-muted" /> Target Allocation
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-brand-light flex items-center justify-center text-ink">
            <DollarSign className="w-6 h-6 text-ink stroke-[2.5]" />
          </div>
        </div>

        {/* Total Spent */}
        <div className="bg-surface-white p-5 rounded-2xl border border-surface-subtle shadow-card flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-ink-muted uppercase tracking-wider">Total Spent</p>
            <p className="font-display font-bold text-2xl text-ink mt-1">
              ₹{data.totalSpent.toLocaleString('en-IN')}
            </p>
            <p className="text-[11px] text-ink-muted mt-1 flex items-center gap-1">
              <ArrowUpRight className="w-3 h-3 text-danger" /> {data.expenses.length + data.activityCostsCount} line items
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-700">
            <BarChart3 className="w-6 h-6 stroke-[2.5]" />
          </div>
        </div>

        {/* Remaining Balance */}
        <div className="bg-surface-white p-5 rounded-2xl border border-surface-subtle shadow-card flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-ink-muted uppercase tracking-wider">Remaining</p>
            <p className={`font-display font-bold text-2xl mt-1 ${data.remaining >= 0 ? 'text-success' : 'text-danger'}`}>
              ₹{data.remaining.toLocaleString('en-IN')}
            </p>
            <p className="text-[11px] text-ink-muted mt-1 flex items-center gap-1">
              <TrendingDown className="w-3 h-3 text-success" /> Available to spend
            </p>
          </div>
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${data.remaining >= 0 ? 'bg-emerald-50 text-success' : 'bg-red-50 text-danger'}`}>
            <Wallet className="w-6 h-6 stroke-[2.5]" />
          </div>
        </div>

        {/* Daily Average */}
        <div className="bg-surface-white p-5 rounded-2xl border border-surface-subtle shadow-card flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-ink-muted uppercase tracking-wider">Daily Average</p>
            <p className="font-display font-bold text-2xl text-ink mt-1">
              ₹{data.dailyAverageSpent.toLocaleString('en-IN')}
            </p>
            <p className="text-[11px] text-ink-muted mt-1 flex items-center gap-1">
              <Calendar className="w-3 h-3 text-ink-muted" /> {data.durationDays} Days Duration
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-800">
            <Calendar className="w-6 h-6 stroke-[2.5]" />
          </div>
        </div>
      </div>

      {/* Main Grid: Charts (Left) & Breakdown Cards (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Left 2 Cols: Interactive Recharts Visualizer */}
        <div className="lg:col-span-2 bg-surface-white p-6 rounded-3xl border border-surface-subtle shadow-card">
          <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
            <div>
              <h3 className="font-display font-bold text-lg text-ink">Visual Cost Breakdown</h3>
              <p className="text-xs text-ink-muted">Interactive category & day-wise analytics</p>
            </div>

            {/* Toggle Button */}
            <div className="flex items-center bg-surface p-1 rounded-full border border-surface-subtle">
              <button
                onClick={() => setActiveChart('donut')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  activeChart === 'donut'
                    ? 'bg-ink text-surface shadow-sm'
                    : 'text-ink-muted hover:text-ink'
                }`}
              >
                <PieIcon className="w-3.5 h-3.5" /> Category Share
              </button>
              <button
                onClick={() => setActiveChart('daily')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  activeChart === 'daily'
                    ? 'bg-ink text-surface shadow-sm'
                    : 'text-ink-muted hover:text-ink'
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5" /> Daily Pace
              </button>
            </div>
          </div>

          {activeChart === 'donut' ? (
            <BudgetDonutChart data={data.categoryBreakdown} />
          ) : (
            <DailySpendBarChart
              durationDays={data.durationDays}
              dailyBudget={data.dailyBudget}
              totalSpent={data.totalSpent}
            />
          )}
        </div>

        {/* Right 1 Col: Category Summary Table */}
        <div className="bg-surface-white p-6 rounded-3xl border border-surface-subtle shadow-card flex flex-col justify-between">
          <div>
            <h3 className="font-display font-bold text-lg text-ink mb-1">Category Allocation</h3>
            <p className="text-xs text-ink-muted mb-4">Total spent per vertical</p>

            <div className="space-y-3.5">
              {[
                { key: 'transport', label: 'Transport & Flights', color: 'bg-blue-500', cost: data.categoryBreakdown.transport },
                { key: 'stay', label: 'Accommodation', color: 'bg-purple-500', cost: data.categoryBreakdown.stay },
                { key: 'activities', label: 'Activities & Tours', color: 'bg-brand', cost: data.categoryBreakdown.activities },
                { key: 'meals', label: 'Meals & Dining', color: 'bg-amber-500', cost: data.categoryBreakdown.meals },
                { key: 'misc', label: 'Miscellaneous', color: 'bg-gray-500', cost: data.categoryBreakdown.misc },
              ].map((cat) => {
                const percent = data.totalSpent > 0 ? Math.round((cat.cost / data.totalSpent) * 100) : 0;
                return (
                  <div key={cat.key} className="p-3 rounded-2xl bg-surface/70 border border-surface-subtle">
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className={`w-2.5 h-2.5 rounded-full ${cat.color}`} />
                        <span className="font-semibold text-ink">{cat.label}</span>
                      </div>
                      <span className="font-bold text-ink">₹{cat.cost.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${cat.color}`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                    <p className="text-[10px] text-ink-muted text-right mt-1">{percent}% of total spend</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Expense Records Section */}
      <div className="bg-surface-white p-6 sm:p-8 rounded-3xl border border-surface-subtle shadow-card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="font-display font-bold text-xl text-ink">Logged Expense Records</h3>
            <p className="text-xs text-ink-muted">Manage, filter, and track specific trip expenditures</p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-ink-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search note..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-2 text-xs rounded-full bg-surface border border-gray-200 text-ink focus:outline-none focus:ring-2 focus:ring-brand"
              />
            </div>

            {/* Category Filter */}
            <div className="flex items-center gap-1.5 bg-surface px-3 py-1.5 rounded-full border border-gray-200 text-xs">
              <Filter className="w-3.5 h-3.5 text-ink-muted" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-transparent font-medium text-ink focus:outline-none cursor-pointer"
              >
                <option value="all">All Categories</option>
                <option value="transport">Transport</option>
                <option value="stay">Stay</option>
                <option value="activities">Activities</option>
                <option value="meals">Meals</option>
                <option value="misc">Misc</option>
              </select>
            </div>
          </div>
        </div>

        {/* Expenses List */}
        {filteredExpenses.length === 0 ? (
          <div className="text-center py-12 bg-surface/50 rounded-2xl border border-dashed border-gray-200">
            <p className="text-sm font-semibold text-ink">No expenses found matching your filter</p>
            <p className="text-xs text-ink-muted mt-1">Try resetting search or log a new expense</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-surface-subtle text-ink-muted uppercase tracking-wider font-bold">
                  <th className="pb-3 px-3">Category</th>
                  <th className="pb-3 px-3">Description / Note</th>
                  <th className="pb-3 px-3">Date</th>
                  <th className="pb-3 px-3 text-right">Amount</th>
                  <th className="pb-3 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-subtle">
                {filteredExpenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-surface/50 transition-colors">
                    <td className="py-3.5 px-3">
                      <CategoryBadge category={exp.category} size="sm" />
                    </td>
                    <td className="py-3.5 px-3 font-medium text-ink max-w-xs truncate">
                      {exp.note || 'General expense'}
                    </td>
                    <td className="py-3.5 px-3 text-ink-muted">
                      {new Date(exp.createdAt).toLocaleDateString('en-IN', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </td>
                    <td className="py-3.5 px-3 font-bold text-ink text-right">
                      ₹{exp.amount.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 px-3 text-right">
                      <button
                        onClick={() => handleDeleteExpense(exp.id)}
                        className="p-1.5 rounded-lg text-ink-muted hover:text-danger hover:bg-red-50 transition-colors"
                        title="Delete expense"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Expense Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-surface-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-modal border border-surface-subtle">
            <h3 className="font-display font-bold text-xl text-ink mb-1">Log New Expense</h3>
            <p className="text-xs text-ink-muted mb-5">Record flight, hotel, meal, or activity spend</p>

            <form onSubmit={handleAddExpense} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-ink mb-1 uppercase tracking-wider">
                  Amount (₹) *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  step="any"
                  placeholder="e.g. 3500"
                  value={newAmount}
                  onChange={(e) => setNewAmount(e.target.value)}
                  className="w-full bg-surface px-4 py-3 rounded-2xl text-sm border border-gray-200 text-ink focus:outline-none focus:ring-2 focus:ring-brand font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-ink mb-1 uppercase tracking-wider">
                  Category *
                </label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as ExpenseCategory)}
                  className="w-full bg-surface px-4 py-3 rounded-2xl text-sm border border-gray-200 text-ink focus:outline-none focus:ring-2 focus:ring-brand font-medium cursor-pointer"
                >
                  <option value="transport">Transport & Flights</option>
                  <option value="stay">Accommodation & Stay</option>
                  <option value="activities">Activities & Tours</option>
                  <option value="meals">Meals & Dining</option>
                  <option value="misc">Miscellaneous</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-ink mb-1 uppercase tracking-wider">
                  Note / Details (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Indigo flight Mumbai to Goa"
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  className="w-full bg-surface px-4 py-3 rounded-2xl text-sm border border-gray-200 text-ink focus:outline-none focus:ring-2 focus:ring-brand"
                />
              </div>

              <div className="flex items-center gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 py-3 rounded-full border border-gray-200 text-ink font-semibold text-sm hover:bg-surface transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-3 rounded-full bg-brand hover:bg-brand-dark text-ink font-bold text-sm transition-all shadow-sm disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : 'Add Expense'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
