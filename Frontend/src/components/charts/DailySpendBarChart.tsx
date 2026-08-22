import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  CartesianGrid,
} from 'recharts';

interface DailySpendBarChartProps {
  durationDays: number;
  dailyBudget: number;
  totalSpent: number;
}

export const DailySpendBarChart: React.FC<DailySpendBarChartProps> = ({
  durationDays,
  dailyBudget,
  totalSpent,
}) => {
  // Generate daily spend points for the trip
  const avg = durationDays > 0 ? Math.round(totalSpent / durationDays) : 0;
  const mockDailyData = Array.from({ length: durationDays || 6 }, (_, i) => {
    const variance = (i % 2 === 0 ? 1.2 : 0.85) * (i === 1 ? 1.4 : 1.0);
    const daySpend = Math.round(avg * variance);
    return {
      day: `Day ${i + 1}`,
      spend: daySpend,
    };
  });

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0];
      const isOver = dailyBudget > 0 && item.value > dailyBudget;
      return (
        <div className="bg-ink text-surface px-3 py-2 rounded-xl text-xs shadow-modal border border-ink-light">
          <p className="font-bold">{item.payload.day}</p>
          <p className="text-brand font-semibold mt-0.5">
            Spend: ₹{item.value.toLocaleString('en-IN')}
          </p>
          {dailyBudget > 0 && (
            <p className={`text-[10px] mt-0.5 ${isOver ? 'text-danger' : 'text-success'}`}>
              {isOver
                ? `+₹${(item.value - dailyBudget).toLocaleString('en-IN')} over daily limit`
                : `-₹${(dailyBudget - item.value).toLocaleString('en-IN')} under daily limit`}
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-72 sm:h-80">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={mockDailyData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
          <XAxis dataKey="day" tick={{ fill: '#4A6B56', fontSize: 11 }} tickLine={false} />
          <YAxis
            tick={{ fill: '#4A6B56', fontSize: 11 }}
            tickLine={false}
            tickFormatter={(val) => `₹${val / 1000}k`}
          />
          <Tooltip content={<CustomTooltip />} />
          {dailyBudget > 0 && (
            <ReferenceLine
              y={dailyBudget}
              stroke="#E5484D"
              strokeDasharray="4 4"
              label={{
                value: `Daily Cap ₹${dailyBudget.toLocaleString('en-IN')}`,
                fill: '#E5484D',
                fontSize: 10,
                position: 'top',
              }}
            />
          )}
          <Bar dataKey="spend" fill="#002B11" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
