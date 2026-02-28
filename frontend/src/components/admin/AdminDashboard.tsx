// src/components/admin/AdminDashboard.tsx
import React, { useState, useEffect } from 'react';
import {
  Users,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw,
  Download,
  Shield,
  LayoutDashboard,
  CreditCard,
  Settings
} from 'lucide-react';
import { adminService, type AdminMetrics, type SystemHealth } from '../../services/adminService';
import { supabase } from '../../lib/supabase';
import { MetricsOverview } from './MetricsOverview';
import { RevenueChart } from './RevenueChart';
import { CustomerTable } from './CustomerTable';
import { SystemStatus } from './SystemStatus';
import { AlertsPanel } from './AlertsPanel';
import { QuickActions } from './QuickActions';
import { CustomerManagement } from './CustomerManagement';
import { SubscriptionManagement } from './SubscriptionManagement';
import { AdvancedAnalytics } from './AdvancedAnalytics';
import { AdminSettings } from './AdminSettings';

export const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'customers' | 'subscriptions' | 'analytics' | 'settings'>('overview');
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'today' | 'week' | 'month' | 'quarter'>('month');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadDashboardData();
    subscribeToAlerts();
  }, [timeRange]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [metricsData, healthData] = await Promise.all([
        adminService.getDashboardMetrics(timeRange),
        adminService.getSystemHealth()
      ]);
      setMetrics(metricsData);
      setSystemHealth(healthData);
    } catch (error) {
      console.error('Error loading admin dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const subscribeToAlerts = () => {
    const subscription = supabase
      .channel('admin-alerts')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'system_alerts' },
        (payload) => {
          // Show notification for new alert
          showAlertNotification(payload.new);
          // Refresh alerts
          loadDashboardData();
        }
      )
      .subscribe();

    return () => subscription.unsubscribe();
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const handleExportReport = () => {
    // Generate and download report
    if (metrics) {
      const csv = `Metric,Value\nTotal Users,${metrics.overview.totalUsers}\nActive Users,${metrics.overview.activeUsers}\nTotal Organizations,${metrics.overview.totalOrganizations}\nPaid Organizations,${metrics.overview.paidOrganizations}\nMRR,${metrics.overview.mrr}\nARR,${metrics.overview.arr}\nChurn Rate,${metrics.overview.churnRate}%`;
      
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `admin-report-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
                <Shield className="text-white" size={20} />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
              {systemHealth && (
                <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
                  systemHealth.status === 'healthy' ? 'bg-green-100 text-green-700' :
                  systemHealth.status === 'degraded' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {systemHealth.status === 'healthy' ? <CheckCircle size={14} /> :
                   systemHealth.status === 'degraded' ? <AlertTriangle size={14} /> :
                   <XCircle size={14} />}
                  System {systemHealth.status}
                </div>
              )}
            </div>

            <div className="flex items-center gap-4">
              {/* Time Range Selector */}
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500"
                title="Select time range for metrics"
              >
                <option value="today">Today</option>
                <option value="week">Last 7 Days</option>
                <option value="month">Last 30 Days</option>
                <option value="quarter">Last 90 Days</option>
              </select>

              {/* Refresh Button */}
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="p-2 hover:bg-gray-100 rounded-lg"
                title="Refresh dashboard data"
              >
                <RefreshCw size={20} className={refreshing ? 'animate-spin' : ''} />
              </button>

              {/* Export Button */}
              <button
                onClick={handleExportReport}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                title="Export dashboard report"
              >
                <Download size={16} />
                Export Report
              </button>

              {/* Admin Profile */}
              <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex gap-6 mt-4">
            <TabButton
              active={activeTab === 'overview'}
              onClick={() => setActiveTab('overview')}
              icon={<LayoutDashboard size={18} />}
              label="Overview"
            />
            <TabButton
              active={activeTab === 'customers'}
              onClick={() => setActiveTab('customers')}
              icon={<Users size={18} />}
              label="Customers"
            />
            <TabButton
              active={activeTab === 'subscriptions'}
              onClick={() => setActiveTab('subscriptions')}
              icon={<CreditCard size={18} />}
              label="Subscriptions"
            />
            <TabButton
              active={activeTab === 'analytics'}
              onClick={() => setActiveTab('analytics')}
              icon={<TrendingUp size={18} />}
              label="Analytics"
            />
            <TabButton
              active={activeTab === 'settings'}
              onClick={() => setActiveTab('settings')}
              icon={<Settings size={18} />}
              label="Settings"
            />
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Metrics Overview */}
            <MetricsOverview metrics={metrics!} />

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Revenue Chart - Takes 2 columns */}
              <div className="lg:col-span-2">
                <RevenueChart data={metrics?.revenue || { daily: [], monthly: [], byPlan: [] }} timeRange={timeRange} />
              </div>

              {/* System Status & Alerts - Takes 1 column */}
              <div className="space-y-6">
                <SystemStatus health={systemHealth!} />
                <AlertsPanel />
              </div>
            </div>

            {/* Quick Actions */}
            <QuickActions />

            {/* Recent Customers */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Recent Customers</h2>
                <button
                  onClick={() => setActiveTab('customers')}
                  className="text-purple-600 hover:text-purple-700 text-sm font-medium"
                >
                  View All
                </button>
              </div>
              <CustomerTable limit={5} />
            </div>
          </div>
        )}

        {activeTab === 'customers' && (
          <CustomerManagement />
        )}

        {activeTab === 'subscriptions' && (
          <SubscriptionManagement />
        )}

        {activeTab === 'analytics' && (
          <AdvancedAnalytics />
        )}

        {activeTab === 'settings' && (
          <AdminSettings />
        )}
      </main>
    </div>
  );
};

const TabButton: React.FC<{
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}> = ({ active, onClick, icon, label }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-4 py-2 border-b-2 transition ${
      active
        ? 'border-purple-600 text-purple-600'
        : 'border-transparent text-gray-500 hover:text-gray-700'
    }`}
  >
    {icon}
    <span className="text-sm font-medium">{label}</span>
  </button>
);

const showAlertNotification = (alert: any) => {
  // Show toast notification
  console.log('New alert:', alert);
};
