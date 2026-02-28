// src/components/integrations/IntegrationDashboard.tsx
import React, { useState, useEffect } from 'react';
import {
  Puzzle,
  Plus,
  Settings,
  Activity,
  CheckCircle,
  AlertCircle,
  Clock,
  Zap,
  Globe,
  Database,
  Cloud,
  MessageSquare,
  TrendingUp,
  Filter,
  Search
} from 'lucide-react';
import { integrationHub, type IntegrationInstance, type MarketplaceIntegration } from '../../services/integrationHubService';

// Helper functions - moved outside component to be accessible by all components
const getStatusIcon = (status: string) => {
  switch (status) {
    case 'active':
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    case 'error':
      return <AlertCircle className="w-4 h-4 text-red-500" />;
    case 'suspended':
      return <Clock className="w-4 h-4 text-yellow-500" />;
    default:
      return <Clock className="w-4 h-4 text-gray-400" />;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'active':
      return 'text-green-600 bg-green-50';
    case 'error':
      return 'text-red-600 bg-red-50';
    case 'suspended':
      return 'text-yellow-600 bg-yellow-50';
    default:
      return 'text-gray-600 bg-gray-50';
  }
};

export const IntegrationDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'instances' | 'marketplace' | 'webhooks' | 'analytics'>('instances');
  const [instances, setInstances] = useState<IntegrationInstance[]>([]);
  const [marketplaceIntegrations, setMarketplaceIntegrations] = useState<MarketplaceIntegration[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [stats, setStats] = useState<{
    total_integrations: number;
    active_integrations: number;
    total_webhooks: number;
    total_syncs: number;
    integrations_by_category: Record<string, number>;
    recent_activity: Array<{
      integration_name: string;
      event_type: string;
      timestamp: string;
    }>;
  }>({
    total_integrations: 0,
    active_integrations: 0,
    total_webhooks: 0,
    total_syncs: 0,
    integrations_by_category: {},
    recent_activity: []
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [instancesData, marketplaceData, statsData] = await Promise.all([
        integrationHub.getIntegrationInstances(),
        integrationHub.getMarketplaceIntegrations({ featured: true }),
        integrationHub.getOrganizationIntegrationStats()
      ]);

      setInstances(instancesData);
      setMarketplaceIntegrations(marketplaceData);
      setStats(statsData);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'communication':
        return <MessageSquare className="w-5 h-5" />;
      case 'storage':
        return <Cloud className="w-5 h-5" />;
      case 'database':
        return <Database className="w-5 h-5" />;
      case 'crm':
        return <Globe className="w-5 h-5" />;
      default:
        return <Puzzle className="w-5 h-5" />;
    }
  };

  const filteredInstances = instances.filter(instance =>
    instance.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    instance.integration?.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredMarketplace = marketplaceIntegrations.filter(integration =>
    integration.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    integration.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="spinner w-8 h-8"></div>
        <span className="ml-2 text-gray-600">Loading integrations...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Integration Hub</h1>
          <p className="text-gray-600 mt-1">Connect WorkSphere AI with your favorite tools</p>
        </div>
        <button className="btn btn-primary flex items-center space-x-2">
          <Plus className="w-4 h-4" />
          <span>Add Integration</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={<Puzzle className="text-blue-600" />}
          label="Total Integrations"
          value={stats.total_integrations}
          bgColor="bg-blue-50"
        />
        <StatCard
          icon={<CheckCircle className="text-green-600" />}
          label="Active Integrations"
          value={stats.active_integrations}
          bgColor="bg-green-50"
        />
        <StatCard
          icon={<Zap className="text-purple-600" />}
          label="Webhooks"
          value={stats.total_webhooks}
          bgColor="bg-purple-50"
        />
        <StatCard
          icon={<Activity className="text-orange-600" />}
          label="Data Syncs"
          value={stats.total_syncs}
          bgColor="bg-orange-50"
        />
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          <TabButton
            active={activeTab === 'instances'}
            onClick={() => setActiveTab('instances')}
            icon={<Puzzle size={18} />}
            label="My Integrations"
          />
          <TabButton
            active={activeTab === 'marketplace'}
            onClick={() => setActiveTab('marketplace')}
            icon={<Globe size={18} />}
            label="Marketplace"
          />
          <TabButton
            active={activeTab === 'webhooks'}
            onClick={() => setActiveTab('webhooks')}
            icon={<Zap size={18} />}
            label="Webhooks"
          />
          <TabButton
            active={activeTab === 'analytics'}
            onClick={() => setActiveTab('analytics')}
            icon={<TrendingUp size={18} />}
            label="Analytics"
          />
        </nav>
      </div>

      {/* Search Bar */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search integrations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
          />
        </div>
        
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
          title="Select integration category"
        >
          <option value="all">All Categories</option>
          <option value="communication">Communication</option>
          <option value="storage">Storage</option>
          <option value="crm">CRM</option>
          <option value="database">Database</option>
        </select>
      </div>

      {/* Tab Content */}
      {activeTab === 'instances' && (
        <div className="space-y-6">
          {filteredInstances.length === 0 ? (
            <EmptyState
              icon={<Puzzle size={48} />}
              title="No integrations yet"
              description="Connect your favorite tools to enhance your workflow"
              actionText="Browse Marketplace"
              onAction={() => setActiveTab('marketplace')}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredInstances.map((instance) => (
                <IntegrationCard
                  key={instance.id}
                  instance={instance}
                  onEdit={() => {/* Handle edit */}}
                  onTest={() => {/* Handle test */}}
                  onDelete={() => {/* Handle delete */}}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'marketplace' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMarketplace.map((integration) => (
              <MarketplaceCard
                key={integration.id}
                integration={integration}
                onInstall={() => {/* Handle install */}}
              />
            ))}
          </div>
        </div>
      )}

      {activeTab === 'webhooks' && (
        <div className="space-y-6">
          <EmptyState
            icon={<Zap size={48} />}
            title="Webhook Management"
            description="Configure webhooks to receive real-time events from external services"
            actionText="Create Webhook"
            onAction={() => {/* Handle webhook creation */}}
          />
        </div>
      )}

      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card p-6">
              <h3 className="text-lg font-semibold mb-4">Integration Categories</h3>
              <div className="space-y-3">
                {Object.entries(stats.integrations_by_category).map(([category, count]) => (
                  <div key={category} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {getCategoryIcon(category)}
                      <span className="text-sm font-medium capitalize">{category}</span>
                    </div>
                    <span className="text-sm text-gray-500">{count}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="card p-6">
              <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
              <div className="space-y-3">
                {stats.recent_activity.length === 0 ? (
                  <p className="text-sm text-gray-500">No recent activity</p>
                ) : (
                  stats.recent_activity.map((activity, index) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <div>
                        <span className="font-medium">{activity.integration_name}</span>
                        <span className="text-gray-500 ml-2">{activity.event_type}</span>
                      </div>
                      <span className="text-gray-500">
                        {new Date(activity.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Helper Components
const StatCard: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string | number;
  bgColor: string;
}> = ({ icon, label, value, bgColor }) => (
  <div className={`${bgColor} rounded-lg p-6`}>
    <div className="flex items-center justify-between mb-2">
      <span className="text-gray-600 text-sm">{label}</span>
      {icon}
    </div>
    <div className="text-2xl font-bold text-gray-900">{value}</div>
  </div>
);

const TabButton: React.FC<{
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}> = ({ active, onClick, icon, label }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-1 py-4 border-b-2 font-medium text-sm transition-colors ${
      active
        ? 'border-brand-600 text-brand-600'
        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
    }`}
  >
    {icon}
    <span>{label}</span>
  </button>
);

const IntegrationCard: React.FC<{
  instance: IntegrationInstance;
  onEdit: () => void;
  onTest: () => void;
  onDelete: () => void;
}> = ({ instance, onEdit, onTest, onDelete }) => (
  <div className="card p-6 card-hover">
    <div className="flex items-start justify-between mb-4">
      <div className="flex items-center space-x-3">
        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
          {instance.integration?.logo_url ? (
            <img
              src={instance.integration.logo_url}
              alt={instance.integration.name}
              className="w-8 h-8"
            />
          ) : (
            <Puzzle className="w-6 h-6 text-gray-400" />
          )}
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">{instance.name}</h3>
          <p className="text-sm text-gray-500">{instance.integration?.provider}</p>
        </div>
      </div>
      <div className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(instance.status)}`}>
        <div className="flex items-center space-x-1">
          {getStatusIcon(instance.status)}
          <span>{instance.status}</span>
        </div>
      </div>
    </div>

    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
      {instance.integration?.description}
    </p>

    <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
      <span>Category: {instance.integration?.category}</span>
      <span>Type: {instance.integration?.type}</span>
    </div>

    {instance.error_message && (
      <div className="mb-4 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-600">
        {instance.error_message}
      </div>
    )}

    <div className="flex items-center space-x-2">
      <button
        onClick={onEdit}
        className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
      >
        <Settings className="w-4 h-4 mr-1" />
        Configure
      </button>
      <button
        onClick={onTest}
        className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
      >
        <Zap className="w-4 h-4 mr-1" />
        Test
      </button>
      <button
        onClick={onDelete}
        className="px-3 py-2 text-sm text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
      >
        Delete
      </button>
    </div>
  </div>
);

const MarketplaceCard: React.FC<{
  integration: MarketplaceIntegration;
  onInstall: () => void;
}> = ({ integration, onInstall }) => (
  <div className="card p-6 card-hover">
    <div className="flex items-start space-x-4 mb-4">
      <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
        {integration.logo_url ? (
          <img
            src={integration.logo_url}
            alt={integration.name}
            className="w-8 h-8"
          />
        ) : (
          <Puzzle className="w-6 h-6 text-gray-400" />
        )}
      </div>
      <div className="flex-1">
        <div className="flex items-center space-x-2 mb-1">
          <h3 className="font-semibold text-gray-900">{integration.name}</h3>
          {integration.is_featured && (
            <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full">
              Featured
            </span>
          )}
        </div>
        <p className="text-sm text-gray-500">{integration.provider}</p>
      </div>
    </div>

    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
      {integration.description}
    </p>

    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center space-x-1">
        <span className="text-xs text-gray-500">Category:</span>
        <span className="text-xs font-medium capitalize">{integration.category}</span>
      </div>
      <div className="flex items-center space-x-1">
        <span className="text-xs text-gray-500">Rating:</span>
        <div className="flex items-center">
          <span className="text-xs font-medium">{integration.rating}</span>
          <span className="text-xs text-gray-500">({integration.review_count})</span>
        </div>
      </div>
    </div>

    <div className="flex flex-wrap gap-1 mb-4">
      {integration.features.slice(0, 3).map((feature, index) => (
        <span
          key={index}
          className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded"
        >
          {feature}
        </span>
      ))}
      {integration.features.length > 3 && (
        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
          +{integration.features.length - 3} more
        </span>
      )}
    </div>

    <div className="flex items-center justify-between">
      <div>
        <span className="text-sm font-medium capitalize">
          {integration.pricing_model === 'free' && 'Free'}
          {integration.pricing_model === 'freemium' && 'Freemium'}
          {integration.pricing_model === 'paid' && 'Paid'}
          {integration.pricing_model === 'enterprise' && 'Enterprise'}
        </span>
        <div className="text-xs text-gray-500">
          {integration.downloads.toLocaleString()} downloads
        </div>
      </div>
      <button
        onClick={onInstall}
        className="btn btn-primary text-sm"
      >
        Install
      </button>
    </div>
  </div>
);

const EmptyState: React.FC<{
  icon: React.ReactNode;
  title: string;
  description: string;
  actionText: string;
  onAction: () => void;
}> = ({ icon, title, description, actionText, onAction }) => (
  <div className="text-center py-12">
    <div className="flex justify-center mb-4 text-gray-400">
      {icon}
    </div>
    <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
    <p className="text-gray-500 mb-6">{description}</p>
    <button
      onClick={onAction}
      className="btn btn-primary"
    >
      {actionText}
    </button>
  </div>
);
