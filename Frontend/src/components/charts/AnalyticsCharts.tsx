import React from 'react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { TopActivity } from '../../types/index.ts';

interface SignupsChartProps {
  data: Array<{ month: string; signups: number; trips: number }>;
}

export const SignupsAreaChart: React.FC<SignupsChartProps> = ({ data }) => {
  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
          <defs>
            <linearGradient id="colorSignups" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#00EB5B" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#00EB5B" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorTrips" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#002B11" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#002B11" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
          <XAxis dataKey="month" tick={{ fill: '#4A6B56', fontSize: 11 }} tickLine={false} />
          <YAxis tick={{ fill: '#4A6B56', fontSize: 11 }} tickLine={false} />
          <Tooltip
            contentStyle={{
              backgroundColor: '#002B11',
              color: '#F7F7F7',
              borderRadius: '12px',
              border: 'none',
              fontSize: '12px',
            }}
          />
          <Area
            type="monotone"
            dataKey="signups"
            name="New Users"
            stroke="#00EB5B"
            strokeWidth={3}
            fillOpacity={1}
            fill="url(#colorSignups)"
          />
          <Area
            type="monotone"
            dataKey="trips"
            name="Trips Created"
            stroke="#002B11"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorTrips)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

interface ActivitiesBarChartProps {
  data: TopActivity[];
}

export const TopActivitiesBarChart: React.FC<ActivitiesBarChartProps> = ({ data }) => {
  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 10, right: 20, left: 30, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E5E7EB" />
          <XAxis type="number" tick={{ fill: '#4A6B56', fontSize: 11 }} tickLine={false} />
          <YAxis
            type="category"
            dataKey="category"
            tick={{ fill: '#002B11', fontSize: 11, fontWeight: 600 }}
            tickLine={false}
            width={120}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#002B11',
              color: '#F7F7F7',
              borderRadius: '12px',
              border: 'none',
              fontSize: '12px',
            }}
          />
          <Bar dataKey="count" name="Activities Planned" fill="#00EB5B" radius={[0, 8, 8, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
