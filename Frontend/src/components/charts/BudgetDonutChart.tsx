import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

interface BudgetDonutChartProps {
  data: {
    transport: number;
    stay: number;
    activities: number;
    meals: number;
    misc: number;
  };
}

const CATEGORY_CONFIG: Record<string, { label: string; color: string }> = {
  transport: { label: 'Transport', color: '#2F80ED' },
  stay: { label: 'Accommodation & Stay', color: '#8B5CF6' },
  activities: { label: 'Activities & Tours', color: '#A9784F' },
  meals: { label: 'Meals & Dining', color: '#F5A623' },
  misc: { label: 'Miscellaneous', color: '#6B7280' },
};

export const BudgetDonutChart: React.FC<BudgetDonutChartProps> = ({ data }) => {
  const chartData = Object.entries(data)
    .map(([key, value]) => ({
      name: CATEGORY_CONFIG[key]?.label || key,
      categoryKey: key,
      value: Number(value) || 0,
      color: CATEGORY_CONFIG[key]?.color || '#A9784F',
    }))
    .filter((item) => item.value > 0);

  const total = chartData.reduce((acc, curr) => acc + curr.value, 0);

  if (total === 0) {
    return (
      <div className="h-64 flex flex-col items-center justify-center text-ink-muted bg-surface/50 rounded-2xl border border-dashed border-gray-200">
        <p className="text-sm font-medium">No expenses logged yet</p>
        <p className="text-xs text-ink-muted mt-1">Add expenses to see category breakdown</p>
      </div>
    );
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0];
      const percent = total > 0 ? Math.round((item.value / total) * 100) : 0;
      return (
        <div className="bg-ink text-surface px-3 py-2 rounded-xl text-xs shadow-modal border border-ink-light">
          <p className="font-bold">{item.name}</p>
          <p className="text-brand font-semibold mt-0.5">
            ₹{item.value.toLocaleString('en-IN')} ({percent}%)
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-72 sm:h-80">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={65}
            outerRadius={95}
            paddingAngle={4}
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} stroke="#FFFFFF" strokeWidth={2} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend
            verticalAlign="bottom"
            height={36}
            iconType="circle"
            formatter={(value) => (
              <span className="text-xs font-semibold text-ink ml-1">{value}</span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};
