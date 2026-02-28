// src/components/admin/CustomerManagement.tsx
import React, { useState, useEffect } from 'react';
import {
  Search,
  MoreVertical,
  Mail,
  Calendar,
  Activity,
  AlertTriangle,
  XCircle,
  Edit,
  Eye,
  Download,
  CreditCard
} from 'lucide-react';
import { adminService, type Customer } from '../../services/adminService';

export const CustomerManagement: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({
    plan: '',
    status: '',
    health: ''
  });
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    loadCustomers();
  }, [page, search, filters]);

  const loadCustomers = async () => {
    setLoading(true);
    try {
      const result = await adminService.getCustomers({
        search,
        plan: filters.plan || undefined,
        status: filters.status || undefined,
        health: filters.health || undefined,
        page,
        limit: 20
      });
      setCustomers(result.customers);
      setTotal(result.total);
    } catch (error) {
      console.error('Error loading customers:', error);
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
      inactive: 'bg-gray-100 text-gray-700'
    };
    return styles[status as keyof typeof styles] || styles.inactive;
  };

  const getHealthColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    if (score >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  const handleViewCustomer = async (customer: Customer) => {
    const details = await adminService.getCustomerDetails(customer.id);
    setSelectedCustomer({ ...customer, ...details });
    setShowDetails(true);
  };

  const handleUpdateCustomer = async (customerId: string, updates: any) => {
    await adminService.updateCustomer(customerId, updates);
    loadCustomers();
  };

  const handleExportCustomers = () => {
    // Export to CSV
    const csv = customers.map(c => 
      `${c.organization_name},${c.email},${c.plan},${c.status},${c.mrr},${c.users}` 
    ).join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'customers.csv';
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Customer Management</h2>
        <button
          onClick={handleExportCustomers}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2"
        >
          <Download size={16} />
          Export CSV
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search customers by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <select
            value={filters.plan}
            onChange={(e) => setFilters({ ...filters, plan: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
          >
            <option value="">All Plans</option>
            <option value="Starter">Starter</option>
            <option value="Professional">Professional</option>
            <option value="Enterprise">Enterprise</option>
          </select>

          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
          >
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="trialing">Trial</option>
            <option value="past_due">Past Due</option>
            <option value="canceled">Canceled</option>
          </select>

          <select
            value={filters.health}
            onChange={(e) => setFilters({ ...filters, health: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
          >
            <option value="">All Health</option>
            <option value="80">Healthy (80+)</option>
            <option value="60">At Risk (60-79)</option>
            <option value="40">Critical (40-59)</option>
            <option value="0">Danger (&lt;40)</option>
          </select>
        </div>
      </div>

      {/* Customer Table */}
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
                MRR
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Users
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Health
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Created
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Last Active
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={9} className="px-6 py-12 text-center">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                  <p className="mt-2 text-gray-500">Loading customers...</p>
                </td>
              </tr>
            ) : customers.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-6 py-12 text-center text-gray-500">
                  No customers found
                </td>
              </tr>
            ) : (
              customers.map((customer) => (
                <tr key={customer.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-medium text-gray-900">{customer.organization_name}</div>
                      <div className="text-sm text-gray-500">{customer.email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm">{customer.plan}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(customer.status)}`}>
                      {customer.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">${customer.mrr.toLocaleString()}</td>
                  <td className="px-6 py-4 text-sm">{customer.users}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className={`text-sm font-medium ${getHealthColor(customer.health_score)}`}>
                        {customer.health_score}%
                      </div>
                      {customer.health_score < 40 && (
                        <AlertTriangle size={14} className="text-red-500" />
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {new Date(customer.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {new Date(customer.last_active).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleViewCustomer(customer)}
                      className="text-blue-600 hover:text-blue-700 mr-2"
                      title="View details"
                    >
                      <Eye size={16} />
                    </button>
                    <button className="text-gray-600 hover:text-gray-700" title="More options">
                      <MoreVertical size={16} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Showing {((page - 1) * 20) + 1} to {Math.min(page * 20, total)} of {total} customers
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-50"
            >
              Previous
            </button>
            <span className="px-3 py-1 bg-purple-600 text-white rounded">{page}</span>
            <button
              onClick={() => setPage(p => p + 1)}
              disabled={page * 20 >= total}
              className="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Customer Details Modal */}
      {showDetails && selectedCustomer && (
        <CustomerDetailsModal
          customer={selectedCustomer}
          onClose={() => setShowDetails(false)}
          onUpdate={handleUpdateCustomer}
        />
      )}
    </div>
  );
};

// Customer Details Modal Component
const CustomerDetailsModal: React.FC<{
  customer: any;
  onClose: () => void;
  onUpdate: (id: string, updates: any) => void;
}> = ({ customer, onClose, onUpdate }) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-RW', {
      style: 'currency',
      currency: 'RWF',
      minimumFractionDigits: 0
    }).format(value);
  };

  const getHealthColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    if (score >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Customer Details</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <XCircle size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Customer Header */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <h3 className="text-2xl font-bold">{customer.organization_name}</h3>
              <div className="flex items-center gap-4 mt-2 text-gray-600">
                <div className="flex items-center gap-1">
                  <Mail size={14} />
                  <span>{customer.email}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar size={14} />
                  <span>Customer since {new Date(customer.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => onUpdate(customer.id, {})}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <Edit size={16} />
              Edit Customer
            </button>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-sm text-gray-600 mb-1">Current Plan</div>
              <div className="text-lg font-semibold">{customer.subscription?.subscription_plans?.name || 'Free'}</div>
              <div className="text-xs text-gray-500 mt-1 capitalize">{customer.subscription?.billing_cycle}</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-sm text-gray-600 mb-1">Monthly Revenue</div>
              <div className="text-lg font-semibold">
                {formatCurrency(customer.subscription?.subscription_plans?.price_monthly || 0)}
              </div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="text-sm text-gray-600 mb-1">Total Users</div>
              <div className="text-lg font-semibold">{customer.userCount || 0}</div>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg">
              <div className="text-sm text-gray-600 mb-1">Health Score</div>
              <div className={`text-lg font-semibold ${getHealthColor(customer.metrics?.health_score || 0)}`}>
                {customer.metrics?.health_score || 0}%
              </div>
            </div>
          </div>

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Subscription Details */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <CreditCard size={16} className="text-purple-600" />
                Subscription Details
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Status</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    customer.subscription?.status === 'active' ? 'bg-green-100 text-green-700' :
                    customer.subscription?.status === 'trialing' ? 'bg-blue-100 text-blue-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {customer.subscription?.status}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Plan</span>
                  <span className="font-medium">{customer.subscription?.subscription_plans?.name}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Billing Cycle</span>
                  <span className="capitalize">{customer.subscription?.billing_cycle}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Current Period</span>
                  <span>
                    {new Date(customer.subscription?.current_period_start).toLocaleDateString()} - {new Date(customer.subscription?.current_period_end).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Trial Ends</span>
                  <span>{customer.subscription?.trial_end ? new Date(customer.subscription.trial_end).toLocaleDateString() : 'N/A'}</span>
                </div>
              </div>
            </div>

            {/* Usage Metrics */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <Activity size={16} className="text-purple-600" />
                Usage Metrics (Last 30 Days)
              </h4>
              <div className="space-y-2">
                {customer.usage?.map((metric: any) => (
                  <div key={metric.id} className="flex justify-between text-sm">
                    <span className="text-gray-500 capitalize">{metric.metric_type}</span>
                    <span className="font-medium">{metric.metric_value.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
