// src/components/admin/RevenueChart.tsx
import React from 'react';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar
} from 'lucide-react';

interface RevenueChartProps {
  data: {
    daily: Array<{ date: string; revenue: number }>;
    monthly: Array<{ month: string; revenue: number }>;
    byPlan: Array<{ plan: string; count: number; revenue: number }>;
  };
  timeRange: 'today' | 'week' | 'month' | 'quarter';
}

export const RevenueChart: React.FC<RevenueChartProps> = ({ data, timeRange }) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-RW', {
      style: 'currency',
      currency: 'RWF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const totalRevenue = data.daily.reduce((sum, item) => sum + item.revenue, 0);
  const previousRevenue = totalRevenue * 0.85; // Mock previous period
  const growth = ((totalRevenue - previousRevenue) / previousRevenue * 100).toFixed(1);

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold">Revenue Overview</h3>
          <p className="text-sm text-gray-500 mt-1">
            {timeRange === 'today' && 'Today\'s revenue'}
            {timeRange === 'week' && 'Last 7 days'}
            {timeRange === 'month' && 'Last 30 days'}
            {timeRange === 'quarter' && 'Last 90 days'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`flex items-center gap-1 text-sm ${
            parseFloat(growth) >= 0 ? 'text-green-600' : 'text-red-600'
          }`}>
            {parseFloat(growth) >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
            {Math.abs(parseFloat(growth))}%
          </span>
          <span className="text-sm text-gray-500">vs last period</span>
        </div>
      </div>

      {/* Total Revenue */}
      <div className="mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
            <DollarSign className="text-purple-600" size={24} />
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900">{formatCurrency(totalRevenue)}</div>
            <div className="text-sm text-gray-500">Total Revenue</div>
          </div>
        </div>
      </div>

      {/* Revenue by Plan */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Revenue by Plan</h4>
        <div className="space-y-3">
          {data.byPlan.map((plan, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                <span className="text-sm font-medium">{plan.plan}</span>
                <span className="text-xs text-gray-500">({plan.count} customers)</span>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium">{formatCurrency(plan.revenue)}</div>
                <div className="text-xs text-gray-500">
                  {((plan.revenue / totalRevenue) * 100).toFixed(1)}% of total
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Daily Revenue Chart (Mock) */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-3">Daily Revenue Trend</h4>
        <div className="h-32 bg-gray-50 rounded-lg flex items-end justify-between p-4">
          {data.daily.slice(-7).map((item, index) => {
            const height = (item.revenue / Math.max(...data.daily.map(d => d.revenue))) * 100;
            return (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div
                  className="w-full bg-purple-500 rounded-t"
                  style={{ height: `${height}%` }}
                ></div>
                <span className="text-xs text-gray-500 mt-1">
                  {new Date(item.date).getDate()}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
