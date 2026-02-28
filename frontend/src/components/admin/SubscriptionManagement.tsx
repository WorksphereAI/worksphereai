// src/components/admin/SubscriptionManagement.tsx
import React, { useState, useEffect } from 'react';
import {
  Eye,
  Edit,
  XCircle
} from 'lucide-react';
import { adminService } from '../../services/adminService';

export const SubscriptionManagement: React.FC = () => {
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [, setTotal] = useState(0);
  const [page] = useState(1);
  const [filters, setFilters] = useState({
    status: '',
    plan: ''
  });

  useEffect(() => {
    loadSubscriptions();
  }, [page, filters]);

  const loadSubscriptions = async () => {
    setLoading(true);
    try {
      const result = await adminService.getSubscriptions({
        status: filters.status || undefined,
        plan: filters.plan || undefined,
        page,
        limit: 20
      });
      setSubscriptions(result.subscriptions);
      setTotal(result.total);
    } catch (error) {
      console.error('Error loading subscriptions:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      active: 'bg-green-100 text-green-700',
      past_due: 'bg-yellow-100 text-yellow-700',
      canceled: 'bg-red-100 text-red-700',
      trialing: 'bg-blue-100 text-blue-700',
      incomplete: 'bg-gray-100 text-gray-700'
    };
    return styles[status as keyof typeof styles] || styles.incomplete;
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-RW', {
      style: 'currency',
      currency: 'RWF',
      minimumFractionDigits: 0
    }).format(value);
  };

  const handleUpdateSubscription = async (subscriptionId: string, updates: any) => {
    await adminService.updateSubscription(subscriptionId, updates);
    loadSubscriptions();
  };

  const handleCancelSubscription = async (subscriptionId: string) => {
    if (confirm('Are you sure you want to cancel this subscription?')) {
      await handleUpdateSubscription(subscriptionId, { status: 'canceled' });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Subscription Management</h2>
        <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
          Create Subscription
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center gap-4">
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            title="Filter by subscription status"
          >
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="trialing">Trial</option>
            <option value="past_due">Past Due</option>
            <option value="canceled">Canceled</option>
            <option value="incomplete">Incomplete</option>
          </select>

          <select
            value={filters.plan}
            onChange={(e) => setFilters({ ...filters, plan: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            title="Filter by subscription plan"
          >
            <option value="">All Plans</option>
            <option value="Starter">Starter</option>
            <option value="Professional">Professional</option>
            <option value="Enterprise">Enterprise</option>
          </select>
        </div>
      </div>

      {/* Subscriptions Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Organization
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Plan
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Billing Cycle
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Current Period
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                </td>
              </tr>
            ) : subscriptions.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                  No subscriptions found
                </td>
              </tr>
            ) : (
              subscriptions.map((sub) => (
                <tr key={sub.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="font-medium">{sub.organizations?.name}</div>
                    <div className="text-sm text-gray-500">{sub.organizations?.email}</div>
                  </td>
                  <td className="px-6 py-4">{sub.subscription_plans?.name}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(sub.status)}`}>
                      {sub.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 capitalize">{sub.billing_cycle}</td>
                  <td className="px-6 py-4 font-medium">
                    {formatCurrency(
                      sub.billing_cycle === 'yearly' 
                        ? sub.subscription_plans?.price_yearly 
                        : sub.subscription_plans?.price_monthly
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {new Date(sub.current_period_start).toLocaleDateString()} - {new Date(sub.current_period_end).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-blue-600 hover:text-blue-700 mr-2" title="View details">
                      <Eye size={16} />
                    </button>
                    <button className="text-gray-600 hover:text-gray-700 mr-2" title="Edit">
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleCancelSubscription(sub.id)}
                      className="text-red-600 hover:text-red-700"
                      title="Cancel subscription"
                    >
                      <XCircle size={16} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
