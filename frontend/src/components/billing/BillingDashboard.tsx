// src/components/billing/BillingDashboard.tsx
import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  TrendingUp,
  Users,
  HardDrive,
  Wifi,
  CheckCircle,
  AlertCircle,
  Clock,
  Download,
  ExternalLink,
  Settings,
  Zap,
  Crown,
  Star,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  DollarSign,
  Activity,
  BarChart3
} from 'lucide-react';
import { subscriptionService, type SubscriptionPlan, type OrganizationSubscription, type PaymentMethod, type BusinessMetric } from '../../services/subscriptionService';

export const BillingDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'plans' | 'payment' | 'invoices' | 'usage'>('overview');
  const [subscription, setSubscription] = useState<OrganizationSubscription | null>(null);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [businessMetrics, setBusinessMetrics] = useState<BusinessMetric[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  useEffect(() => {
    loadBillingData();
  }, []);

  const loadBillingData = async () => {
    setLoading(true);
    try {
      // Get current user's organization
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: userData } = await supabase
        .from('users')
        .select('organization_id')
        .eq('id', user.id)
        .single();

      if (!userData) return;

      const orgId = userData.organization_id;

      // Load billing data
      const [currentSubscription, availablePlans, methods, metrics] = await Promise.all([
        subscriptionService.getOrganizationSubscription(orgId),
        subscriptionService.getPlans(),
        subscriptionService.getPaymentMethods(orgId),
        subscriptionService.getBusinessMetrics()
      ]);

      setSubscription(currentSubscription);
      setPlans(availablePlans);
      setPaymentMethods(methods);
      setBusinessMetrics(metrics);
    } catch (error) {
      console.error('Error loading billing data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async (planId: string, isYearly: boolean = false) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: userData } = await supabase
        .from('users')
        .select('organization_id')
        .eq('id', user.id)
        .single();

      if (!userData) return;

      const plan = plans.find(p => p.id === planId);
      if (!plan) return;

      const priceId = isYearly ? plan.stripe_price_id.replace('_monthly', '_yearly') : plan.stripe_price_id;

      const { url } = await subscriptionService.createCheckoutSession(
        userData.organization_id,
        priceId,
        isYearly
      );

      if (url) {
        window.open(url, '_blank');
      }
    } catch (error) {
      console.error('Error upgrading subscription:', error);
    }
  };

  const getPlanIcon = (planName: string) => {
    switch (planName.toLowerCase()) {
      case 'enterprise':
        return <Crown className="w-6 h-6 text-purple-500" />;
      case 'professional':
        return <Star className="w-6 h-6 text-blue-500" />;
      case 'starter':
        return <Users className="w-6 h-6 text-green-500" />;
      default:
        return <Users className="w-6 h-6 text-gray-500" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'past_due':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case 'canceled':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'trialing':
        return <Clock className="w-4 h-4 text-blue-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-400" />;
    }
  };

  const formatCurrency = (amount: number, currency: string = 'RWF') => {
    return new Intl.NumberFormat('en-RW', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-RW', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="spinner w-8 h-8"></div>
        <span className="ml-2 text-gray-600">Loading billing information...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Billing & Subscription</h2>
          <p className="text-gray-600 mt-1">Manage your subscription and payment methods</p>
        </div>
        {subscription && (
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2 px-3 py-2 bg-gray-50 rounded-lg">
              {getPlanIcon(subscription.plan?.name || '')}
              <span className="text-sm font-medium text-gray-700 capitalize">
                {subscription.plan?.name || 'Free'} Plan
              </span>
            </div>
            <button
              onClick={() => setShowUpgradeModal(true)}
              className="btn btn-primary"
            >
              Upgrade Plan
            </button>
          </div>
        )}
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {[
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'plans', label: 'Plans', icon: Crown },
            { id: 'payment', label: 'Payment Methods', icon: CreditCard },
            { id: 'invoices', label: 'Invoices', icon: Download },
            { id: 'usage', label: 'Usage', icon: Activity }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-brand-500 text-brand-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {subscription ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="card p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Current Plan</p>
                    <p className="text-2xl font-bold text-gray-900 capitalize">
                      {subscription.plan?.name || 'Free'}
                    </p>
                  </div>
                  {getPlanIcon(subscription.plan?.name || '')}
                </div>
                <div className="mt-4 flex items-center space-x-2">
                  {getStatusIcon(subscription.status)}
                  <span className="text-sm text-gray-600 capitalize">{subscription.status}</span>
                </div>
              </div>

              <div className="card p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Monthly Cost</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatCurrency(subscription.plan?.price_monthly || 0)}
                    </p>
                  </div>
                  <DollarSign className="w-8 h-8 text-green-500" />
                </div>
                <div className="mt-4 text-sm text-gray-600">
                  {subscription.billing_cycle === 'yearly' ? 'Billed yearly' : 'Billed monthly'}
                </div>
              </div>

              <div className="card p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Next Billing</p>
                    <p className="text-lg font-bold text-gray-900">
                      {subscription.current_period_end 
                        ? formatDate(subscription.current_period_end)
                        : 'N/A'
                      }
                    </p>
                  </div>
                  <Calendar className="w-8 h-8 text-blue-500" />
                </div>
                {subscription.cancel_at_period_end && (
                  <div className="mt-4 text-sm text-red-600">
                    Cancels at period end
                  </div>
                )}
              </div>

              <div className="card p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Users</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {/* TODO: Get actual user count */}
                      5 / {subscription.plan?.max_users || 10}
                    </p>
                  </div>
                  <Users className="w-8 h-8 text-purple-500" />
                </div>
                <div className="mt-4">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-purple-500 h-2 rounded-full"
                      style={{ width: `${(5 / (subscription.plan?.max_users || 10)) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <Crown className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Active Subscription</h3>
              <p className="text-gray-500 mb-6">Choose a plan to unlock premium features</p>
              <button
                onClick={() => setActiveTab('plans')}
                className="btn btn-primary"
              >
                View Plans
              </button>
            </div>
          )}

          {/* Quick Actions */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={() => setShowUpgradeModal(true)}
                className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left"
              >
                <ArrowUpRight className="w-5 h-5 text-green-500 mb-2" />
                <h4 className="font-medium text-gray-900">Upgrade Plan</h4>
                <p className="text-sm text-gray-500">Get more features and users</p>
              </button>
              
              <button
                onClick={() => setActiveTab('payment')}
                className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left"
              >
                <CreditCard className="w-5 h-5 text-blue-500 mb-2" />
                <h4 className="font-medium text-gray-900">Payment Methods</h4>
                <p className="text-sm text-gray-500">Manage payment options</p>
              </button>
              
              <button
                onClick={() => setActiveTab('invoices')}
                className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left"
              >
                <Download className="w-5 h-5 text-purple-500 mb-2" />
                <h4 className="font-medium text-gray-900">View Invoices</h4>
                <p className="text-sm text-gray-500">Download billing documents</p>
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'plans' && (
        <div className="space-y-6">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Choose Your Plan</h3>
            <p className="text-gray-600">Select the perfect plan for your organization</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((plan) => (
              <div key={plan.id} className={`card p-6 relative ${
                subscription?.plan_id === plan.id ? 'ring-2 ring-brand-500' : ''
              }`}>
                {subscription?.plan_id === plan.id && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="px-3 py-1 bg-brand-500 text-white text-xs rounded-full">
                      Current Plan
                    </span>
                  </div>
                )}

                <div className="text-center mb-6">
                  {getPlanIcon(plan.name)}
                  <h3 className="text-xl font-bold text-gray-900 mt-2">{plan.name}</h3>
                  <div className="mt-4">
                    <span className="text-4xl font-bold text-gray-900">
                      {formatCurrency(plan.price_monthly)}
                    </span>
                    <span className="text-gray-500">/month</span>
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    {formatCurrency(plan.price_yearly)} billed yearly
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  {Object.entries(plan.features).map(([feature, enabled]) => (
                    <div key={feature} className="flex items-center space-x-2">
                      {enabled ? (
                        <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                      ) : (
                        <div className="w-4 h-4 border border-gray-300 rounded-full flex-shrink-0"></div>
                      )}
                      <span className={`text-sm ${enabled ? 'text-gray-700' : 'text-gray-400'}`}>
                        {feature.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="space-y-2 text-sm text-gray-600 border-t pt-4">
                  <div className="flex justify-between">
                    <span>Max Users:</span>
                    <span className="font-medium">{plan.max_users === 500 ? '500+' : plan.max_users}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Storage:</span>
                    <span className="font-medium">{plan.max_storage_gb} GB</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Bandwidth:</span>
                    <span className="font-medium">{plan.max_bandwidth_gb} GB</span>
                  </div>
                </div>

                <div className="mt-6 space-y-2">
                  <button
                    onClick={() => handleUpgrade(plan.id, false)}
                    disabled={subscription?.plan_id === plan.id}
                    className={`w-full btn ${
                      subscription?.plan_id === plan.id 
                        ? 'btn-secondary' 
                        : 'btn-primary'
                    } disabled:opacity-50`}
                  >
                    {subscription?.plan_id === plan.id ? 'Current Plan' : 'Upgrade Monthly'}
                  </button>
                  <button
                    onClick={() => handleUpgrade(plan.id, true)}
                    disabled={subscription?.plan_id === plan.id}
                    className={`w-full btn btn-secondary disabled:opacity-50`}
                  >
                    Upgrade Yearly (Save 20%)
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'payment' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Payment Methods</h3>
            <button
              onClick={() => setShowPaymentModal(true)}
              className="btn btn-primary"
            >
              Add Payment Method
            </button>
          </div>

          <div className="space-y-4">
            {paymentMethods.map((method) => (
              <div key={method.id} className="card p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <CreditCard className="w-8 h-8 text-gray-400" />
                    <div>
                      <div className="font-medium text-gray-900">
                        {method.brand?.toUpperCase()} •••• {method.last4}
                      </div>
                      <div className="text-sm text-gray-500">
                        Expires {method.expiry_month}/{method.expiry_year}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    {method.is_default && (
                      <span className="px-2 py-1 bg-green-50 text-green-700 text-xs rounded">
                        Default
                      </span>
                    )}
                    <button className="text-gray-400 hover:text-gray-600">
                      <Settings className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {paymentMethods.length === 0 && (
            <div className="text-center py-12">
              <CreditCard className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Payment Methods</h3>
              <p className="text-gray-500 mb-6">Add a payment method to upgrade your subscription</p>
              <button
                onClick={() => setShowPaymentModal(true)}
                className="btn btn-primary"
              >
                Add Payment Method
              </button>
            </div>
          )}
        </div>
      )}

      {activeTab === 'invoices' && (
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-gray-900">Billing Invoices</h3>
          
          <div className="text-center py-12">
            <Download className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Invoices Yet</h3>
            <p className="text-gray-500">Your billing history will appear here</p>
          </div>
        </div>
      )}

      {activeTab === 'usage' && (
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-gray-900">Usage Analytics</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Active Users</p>
                  <p className="text-2xl font-bold text-gray-900">5</p>
                </div>
                <Users className="w-8 h-8 text-blue-500" />
              </div>
            </div>
            
            <div className="card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Storage Used</p>
                  <p className="text-2xl font-bold text-gray-900">2.3 GB</p>
                </div>
                <HardDrive className="w-8 h-8 text-green-500" />
              </div>
            </div>
            
            <div className="card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">API Calls</p>
                  <p className="text-2xl font-bold text-gray-900">1,234</p>
                </div>
                <Wifi className="w-8 h-8 text-purple-500" />
              </div>
            </div>
          </div>

          <div className="card p-6">
            <h4 className="font-medium text-gray-900 mb-4">Usage Trends</h4>
            <p className="text-gray-500">Detailed usage analytics coming soon...</p>
          </div>
        </div>
      )}
    </div>
  );
};
