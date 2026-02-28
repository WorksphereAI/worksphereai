// src/components/admin/AdvancedAnalytics.tsx
import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Activity,
  Download,
  DollarSign,
  Users
} from 'lucide-react';
import { adminService } from '../../services/adminService';

export const AdvancedAnalytics: React.FC = () => {
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'quarter'>('month');

  useEffect(() => {
    loadAnalytics();
  }, [timeRange]);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const data = await adminService.getDashboardMetrics(timeRange);
      setAnalytics(data);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="spinner w-8 h-8"></div>
        <span className="ml-2 text-gray-600">Loading analytics...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Advanced Analytics</h2>
        <div className="flex items-center gap-4">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
          >
            <option value="week">Last 7 Days</option>
            <option value="month">Last 30 Days</option>
            <option value="quarter">Last 90 Days</option>
          </select>
          <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2">
            <Download size={16} />
            Export Report
          </button>
        </div>
      </div>

      {/* Analytics Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Analytics */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <DollarSign className="text-green-600" size={20} />
            Revenue Analytics
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Revenue</span>
              <span className="text-2xl font-bold text-gray-900">
                {new Intl.NumberFormat('en-RW', {
                  style: 'currency',
                  currency: 'RWF',
                  minimumFractionDigits: 0
                }).format(analytics?.overview?.mrr || 0)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Growth Rate</span>
              <span className="text-green-600 font-medium">+15.3%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">ARR</span>
              <span className="text-xl font-bold text-gray-900">
                {new Intl.NumberFormat('en-RW', {
                  style: 'currency',
                  currency: 'RWF',
                  minimumFractionDigits: 0
                }).format(analytics?.overview?.arr || 0)}
              </span>
            </div>
          </div>
        </div>

        {/* User Analytics */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Users className="text-blue-600" size={20} />
            User Analytics
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Users</span>
              <span className="text-2xl font-bold text-gray-900">
                {analytics?.overview?.totalUsers?.toLocaleString() || 0}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Active Users</span>
              <span className="text-xl font-bold text-green-600">
                {analytics?.overview?.activeUsers?.toLocaleString() || 0}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Growth Rate</span>
              <span className="text-green-600 font-medium">+12.5%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Avg. Daily Active</span>
              <span className="text-lg font-bold text-gray-900">
                {Math.round((analytics?.overview?.activeUsers || 0) / 30)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Usage Metrics */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Activity className="text-purple-600" size={20} />
          Usage Metrics
        </h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{analytics?.usage?.messages?.toLocaleString() || 0}</div>
            <div className="text-sm text-gray-600">Messages</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{analytics?.usage?.tasks?.toLocaleString() || 0}</div>
            <div className="text-sm text-gray-600">Tasks</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">{analytics?.usage?.documents?.toLocaleString() || 0}</div>
            <div className="text-sm text-gray-600">Documents</div>
          </div>
          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <div className="text-2xl font-bold text-orange-600">
              {(analytics?.usage?.storage / 1024 / 1024).toFixed(1)} GB
            </div>
            <div className="text-sm text-gray-600">Storage Used</div>
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <TrendingUp className="text-indigo-600" size={20} />
          Performance Metrics
        </h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-indigo-50 rounded-lg">
            <div className="text-2xl font-bold text-indigo-600">{analytics?.performance?.avgResponseTime}ms</div>
            <div className="text-sm text-gray-600">Avg Response Time</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{analytics?.performance?.uptime}%</div>
            <div className="text-sm text-gray-600">Uptime</div>
          </div>
          <div className="text-center p-4 bg-yellow-50 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600">{analytics?.performance?.errorRate}%</div>
            <div className="text-sm text-gray-600">Error Rate</div>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{analytics?.performance?.activeSessions?.toLocaleString()}</div>
            <div className="text-sm text-gray-600">Active Sessions</div>
          </div>
        </div>
      </div>

      {/* Customer Insights */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Customer Insights</h3>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div>
            <h4 className="font-medium text-gray-700 mb-2">Customer Health</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Healthy (80+)</span>
                <span className="text-sm font-medium text-green-600">75%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">At Risk (60-79)</span>
                <span className="text-sm font-medium text-yellow-600">20%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Critical (&lt;40)</span>
                <span className="text-sm font-medium text-red-600">5%</span>
              </div>
            </div>
          </div>
          <div>
            <h4 className="font-medium text-gray-700 mb-2">Churn Analysis</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Monthly Churn</span>
                <span className="text-sm font-medium text-orange-600">{analytics?.overview?.churnRate.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Customer Lifetime</span>
                <span className="text-sm font-medium text-green-600">
                  {new Intl.NumberFormat('en-RW', {
                    style: 'currency',
                    currency: 'RWF',
                    minimumFractionDigits: 0
                  }).format(analytics?.overview?.ltv || 0)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Acquisition Cost</span>
                <span className="text-sm font-medium text-blue-600">
                  {new Intl.NumberFormat('en-RW', {
                    style: 'currency',
                    currency: 'RWF',
                    minimumFractionDigits: 0
                  }).format(analytics?.overview?.cac || 0)}
                </span>
              </div>
            </div>
          </div>
          <div>
            <h4 className="font-medium text-gray-700 mb-2">Revenue Metrics</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">LTV:CAC Ratio</span>
                <span className="text-sm font-medium text-green-600">3.2:1</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Avg. Revenue/Customer</span>
                <span className="text-sm font-medium text-blue-600">
                  {new Intl.NumberFormat('en-RW', {
                    style: 'currency',
                    currency: 'RWF',
                    minimumFractionDigits: 0
                  }).format((analytics?.overview?.mrr || 0) / (analytics?.overview?.paidOrganizations || 1))}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Conversion Rate</span>
                <span className="text-sm font-medium text-purple-600">85%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
