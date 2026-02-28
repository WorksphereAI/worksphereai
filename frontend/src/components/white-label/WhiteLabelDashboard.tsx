// src/components/white-label/WhiteLabelDashboard.tsx
import React, { useState, useEffect } from 'react';
import {
  Palette,
  Globe,
  CreditCard,
  Settings,
  BarChart3,
  Plus,
  Edit,
  Eye,
  Copy,
  CheckCircle,
  AlertCircle,
  Clock,
  Crown,
  Star,
  TrendingUp,
  Users,
  Lock
} from 'lucide-react';
import { whiteLabel, type WhiteLabelConfiguration, type WhiteLabelTheme, type CustomDomain, type WhiteLabelSubscription } from '../../services/whiteLabelService';
import { supabase } from '../../lib/supabase';

export const WhiteLabelDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'branding' | 'domains' | 'themes' | 'subscription' | 'analytics'>('branding');
  const [configuration, setConfiguration] = useState<WhiteLabelConfiguration | null>(null);
  const [themes, setThemes] = useState<WhiteLabelTheme[]>([]);
  const [domains, setDomains] = useState<CustomDomain[]>([]);
  const [subscription, setSubscription] = useState<WhiteLabelSubscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [showBrandingModal, setShowBrandingModal] = useState(false);
  const [showDomainModal, setShowDomainModal] = useState(false);
  const [showThemeModal, setShowThemeModal] = useState(false);

  const [brandingForm, setBrandingForm] = useState({
    company_name: '',
    logo_url: '',
    favicon_url: '',
    primary_color: '#3B82F6',
    secondary_color: '#10B981',
    accent_color: '#F59E0B',
    background_color: '#FFFFFF',
    text_color: '#1F2937',
    font_family: 'Inter',
    custom_css: '',
    custom_javascript: ''
  });

  const [domainForm, setDomainForm] = useState({
    domain: '',
    subdomain: ''
  });

  const [themeForm, setThemeForm] = useState({
    name: '',
    description: '',
    theme_type: 'light' as 'light' | 'dark' | 'auto',
    color_palette: {},
    typography: {},
    spacing: {},
    components: {}
  });

  useEffect(() => {
    loadWhiteLabelData();
  }, []);

  const loadWhiteLabelData = async () => {
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

      // Load all white label data
      const [config, themeList, domainList, subData] = await Promise.all([
        whiteLabel.getWhiteLabelConfiguration(orgId),
        whiteLabel.getThemes(orgId),
        whiteLabel.getCustomDomains(orgId),
        whiteLabel.getSubscription(orgId)
      ]);

      setConfiguration(config);
      setThemes(themeList);
      setDomains(domainList);
      setSubscription(subData);

      if (config) {
        setBrandingForm({
          company_name: config.company_name,
          logo_url: config.logo_url || '',
          favicon_url: config.favicon_url || '',
          primary_color: config.primary_color,
          secondary_color: config.secondary_color,
          accent_color: config.accent_color,
          background_color: config.background_color,
          text_color: config.text_color,
          font_family: config.font_family,
          custom_css: config.custom_css || '',
          custom_javascript: config.custom_javascript || ''
        });
      }
    } catch (error) {
      console.error('Error loading white label data:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveBranding = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: userData } = await supabase
        .from('users')
        .select('organization_id')
        .eq('id', user.id)
        .single();

      if (!userData) return;

      if (configuration) {
        await whiteLabel.updateWhiteLabelConfiguration(configuration.id, brandingForm);
      } else {
        await whiteLabel.createWhiteLabelConfiguration({
          ...brandingForm,
          organization_id: userData.organization_id,
          created_by: user.id
        });
      }

      setShowBrandingModal(false);
      loadWhiteLabelData();
    } catch (error) {
      console.error('Error saving branding:', error);
    }
  };

  const addDomain = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: userData } = await supabase
        .from('users')
        .select('organization_id')
        .eq('id', user.id)
        .single();

      if (!userData) return;

      if (domainForm.domain) {
        await whiteLabel.addCustomDomain({
          organization_id: userData.organization_id,
          domain: domainForm.domain
        });
      } else if (domainForm.subdomain) {
        await whiteLabel.createWhiteLabelConfiguration({
          organization_id: userData.organization_id,
          subdomain: domainForm.subdomain,
          company_name: brandingForm.company_name,
          primary_color: brandingForm.primary_color,
          secondary_color: brandingForm.secondary_color,
          accent_color: brandingForm.accent_color,
          background_color: brandingForm.background_color,
          text_color: brandingForm.text_color,
          font_family: brandingForm.font_family,
          created_by: user.id
        });
      }

      setShowDomainModal(false);
      setDomainForm({ domain: '', subdomain: '' });
      loadWhiteLabelData();
    } catch (error) {
      console.error('Error adding domain:', error);
    }
  };

  const createTheme = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: userData } = await supabase
        .from('users')
        .select('organization_id')
        .eq('id', user.id)
        .single();

      if (!userData) return;

      await whiteLabel.createTheme({
        ...themeForm,
        organization_id: userData.organization_id,
        slug: themeForm.name.toLowerCase().replace(/\s+/g, '-')
      });

      setShowThemeModal(false);
      setThemeForm({
        name: '',
        description: '',
        theme_type: 'light',
        color_palette: {},
        typography: {},
        spacing: {},
        components: {}
      });
      loadWhiteLabelData();
    } catch (error) {
      console.error('Error creating theme:', error);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const getDomainStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-400" />;
    }
  };

  const getPlanIcon = (planType: string) => {
    switch (planType) {
      case 'enterprise':
        return <Crown className="w-5 h-5 text-purple-500" />;
      case 'professional':
        return <Star className="w-5 h-5 text-blue-500" />;
      case 'starter':
        return <Users className="w-5 h-5 text-green-500" />;
      default:
        return <Users className="w-5 h-5 text-gray-400" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="spinner w-8 h-8"></div>
        <span className="ml-2 text-gray-600">Loading white label settings...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">White Label Solution</h2>
          <p className="text-gray-600 mt-1">Customize WorkSphere AI with your brand</p>
        </div>
        <div className="flex items-center space-x-3">
          {subscription && (
            <div className="flex items-center space-x-2 px-3 py-2 bg-gray-50 rounded-lg">
              {getPlanIcon(subscription.plan_type)}
              <span className="text-sm font-medium text-gray-700 capitalize">
                {subscription.plan_type} Plan
              </span>
            </div>
          )}
          <button
            onClick={() => setShowBrandingModal(true)}
            className="btn btn-primary flex items-center space-x-2"
          >
            <Palette className="w-4 h-4" />
            <span>Customize Brand</span>
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {[
            { id: 'branding', label: 'Branding', icon: Palette },
            { id: 'domains', label: 'Domains', icon: Globe },
            { id: 'themes', label: 'Themes', icon: Settings },
            { id: 'subscription', label: 'Subscription', icon: CreditCard },
            { id: 'analytics', label: 'Analytics', icon: BarChart3 }
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
      {activeTab === 'branding' && (
        <div className="space-y-6">
          {configuration ? (
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Branding</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Company Name</label>
                  <p className="text-gray-900">{configuration.company_name}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Subdomain</label>
                  <p className="text-gray-900">{configuration.subdomain || 'Not set'}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Custom Domain</label>
                  <p className="text-gray-900">{configuration.custom_domain || 'Not set'}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Font Family</label>
                  <p className="text-gray-900">{configuration.font_family}</p>
                </div>
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Color Palette</label>
                <div className="flex space-x-4">
                  <div className="flex items-center space-x-2">
                    <div 
                      className="w-8 h-8 rounded border border-gray-300"
                      style={{ backgroundColor: configuration.primary_color }}
                    ></div>
                    <span className="text-sm text-gray-600">Primary</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div 
                      className="w-8 h-8 rounded border border-gray-300"
                      style={{ backgroundColor: configuration.secondary_color }}
                    ></div>
                    <span className="text-sm text-gray-600">Secondary</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div 
                      className="w-8 h-8 rounded border border-gray-300"
                      style={{ backgroundColor: configuration.accent_color }}
                    ></div>
                    <span className="text-sm text-gray-600">Accent</span>
                  </div>
                </div>
              </div>

              {configuration.logo_url && (
                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Logo</label>
                  <img 
                    src={configuration.logo_url} 
                    alt="Company Logo" 
                    className="h-12 max-w-xs"
                  />
                </div>
              )}

              <div className="mt-6 flex space-x-3">
                <button
                  onClick={() => setShowBrandingModal(true)}
                  className="btn btn-primary"
                >
                  Edit Branding
                </button>
                <button
                  onClick={() => copyToClipboard(window.location.origin)}
                  className="btn btn-secondary"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copy URL
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <Palette className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No branding configured</h3>
              <p className="text-gray-500 mb-6">Start by setting up your company branding</p>
              <button
                onClick={() => setShowBrandingModal(true)}
                className="btn btn-primary"
              >
                Setup Branding
              </button>
            </div>
          )}
        </div>
      )}

      {activeTab === 'domains' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Domain Management</h3>
            <button
              onClick={() => setShowDomainModal(true)}
              className="btn btn-primary flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add Domain</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {domains.map((domain) => (
              <div key={domain.id} className="card p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h4 className="font-medium text-gray-900">{domain.domain}</h4>
                    <div className="flex items-center space-x-2 mt-1">
                      {getDomainStatusIcon(domain.dns_status)}
                      <span className="text-sm text-gray-500 capitalize">{domain.dns_status}</span>
                      {domain.is_primary && (
                        <span className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded">Primary</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      className="p-2 text-gray-400 hover:text-gray-600"
                      title="View details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      className="p-2 text-gray-400 hover:text-gray-600"
                      title="Edit domain"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">SSL Status:</span>
                    <span className={`font-medium ${
                      domain.ssl_status === 'active' ? 'text-green-600' : 'text-yellow-600'
                    }`}>
                      {domain.ssl_status}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Verified:</span>
                    <span className={`font-medium ${
                      domain.is_verified ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {domain.is_verified ? 'Yes' : 'No'}
                    </span>
                  </div>
                  {domain.verification_token && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Verification Token:</span>
                      <button
                        onClick={() => copyToClipboard(domain.verification_token!)}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        <Copy className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>

                {!domain.is_primary && (
                  <div className="mt-4 pt-4 border-t">
                    <button
                      onClick={() => whiteLabel.setPrimaryDomain(domain.id)}
                      className="text-sm text-blue-600 hover:text-blue-700"
                    >
                      Set as Primary
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>

          {domains.length === 0 && (
            <div className="text-center py-12">
              <Globe className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No domains configured</h3>
              <p className="text-gray-500 mb-6">Add a custom domain or subdomain for your white label</p>
              <button
                onClick={() => setShowDomainModal(true)}
                className="btn btn-primary"
              >
                Add Domain
              </button>
            </div>
          )}
        </div>
      )}

      {activeTab === 'themes' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Theme Management</h3>
            <button
              onClick={() => setShowThemeModal(true)}
              className="btn btn-primary flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Create Theme</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {themes.map((theme) => (
              <div key={theme.id} className="card p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h4 className="font-medium text-gray-900">{theme.name}</h4>
                    <p className="text-sm text-gray-500 mt-1">{theme.description}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    {theme.is_default && (
                      <span className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded">Default</span>
                    )}
                    <button
                      className="p-2 text-gray-400 hover:text-gray-600"
                      title="Edit theme"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Type:</span>
                    <span className="font-medium capitalize">{theme.theme_type}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Status:</span>
                    <span className={`font-medium ${
                      theme.is_active ? 'text-green-600' : 'text-gray-600'
                    }`}>
                      {theme.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>

                <div className="mt-4 flex space-x-2">
                  <button
                    onClick={() => whiteLabel.applyTheme(theme.organization_id, theme.id)}
                    className="flex-1 btn btn-secondary text-sm"
                  >
                    Apply Theme
                  </button>
                  <button
                    className="p-2 text-gray-400 hover:text-gray-600"
                    title="Preview theme"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {themes.length === 0 && (
            <div className="text-center py-12">
              <Settings className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No themes created</h3>
              <p className="text-gray-500 mb-6">Create custom themes for your white label</p>
              <button
                onClick={() => setShowThemeModal(true)}
                className="btn btn-primary"
              >
                Create Theme
              </button>
            </div>
          )}
        </div>
      )}

      {activeTab === 'subscription' && (
        <div className="space-y-6">
          {subscription ? (
            <div className="card p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  {getPlanIcon(subscription.plan_type)}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 capitalize">
                      {subscription.plan_type} Plan
                    </h3>
                    <p className="text-gray-500">
                      ${subscription.price}/{subscription.billing_cycle}
                    </p>
                  </div>
                </div>
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                  subscription.status === 'active' 
                    ? 'bg-green-50 text-green-700' 
                    : 'bg-gray-50 text-gray-700'
                }`}>
                  {subscription.status}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Features</h4>
                  <div className="space-y-2">
                    {Object.entries(subscription.features).map(([key, enabled]) => (
                      <div key={key} className="flex items-center space-x-2">
                        {enabled ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <Lock className="w-4 h-4 text-gray-400" />
                        )}
                        <span className="text-sm text-gray-700 capitalize">
                          {key.replace(/_/g, ' ')}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Limits</h4>
                  <div className="space-y-2">
                    {Object.entries(subscription.limits).map(([key, limit]) => (
                      <div key={key} className="flex justify-between text-sm">
                        <span className="text-gray-500 capitalize">{key.replace(/_/g, ' ')}:</span>
                        <span className="font-medium">
                          {limit === -1 ? 'Unlimited' : limit}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t">
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>Next billing: {new Date(subscription.next_billing_at).toLocaleDateString()}</span>
                  <button
                    onClick={() => whiteLabel.cancelSubscription(subscription.organization_id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    Cancel Subscription
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <CreditCard className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No active subscription</h3>
              <p className="text-gray-500 mb-6">Choose a plan to unlock white label features</p>
              <div className="space-y-3">
                <button
                  onClick={() => whiteLabel.updateSubscription('', 'starter')}
                  className="btn btn-primary"
                >
                  Start with Starter Plan
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Visits</p>
                  <p className="text-2xl font-bold text-gray-900">12,543</p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-500" />
              </div>
            </div>
            
            <div className="card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Active Domains</p>
                  <p className="text-2xl font-bold text-gray-900">{domains.length}</p>
                </div>
                <Globe className="w-8 h-8 text-blue-500" />
              </div>
            </div>
            
            <div className="card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Custom Themes</p>
                  <p className="text-2xl font-bold text-gray-900">{themes.length}</p>
                </div>
                <Palette className="w-8 h-8 text-purple-500" />
              </div>
            </div>
          </div>

          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Usage Analytics</h3>
            <p className="text-gray-500">Analytics dashboard coming soon...</p>
          </div>
        </div>
      )}

      {/* Branding Modal */}
      {showBrandingModal && (
        <div className="modal-overlay">
          <div className="modal-content max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Customize Branding</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                <input
                  type="text"
                  value={brandingForm.company_name}
                  onChange={(e) => setBrandingForm({ ...brandingForm, company_name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                  placeholder="Your company name"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Logo URL</label>
                  <input
                    type="url"
                    value={brandingForm.logo_url}
                    onChange={(e) => setBrandingForm({ ...brandingForm, logo_url: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                    placeholder="https://example.com/logo.png"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Favicon URL</label>
                  <input
                    type="url"
                    value={brandingForm.favicon_url}
                    onChange={(e) => setBrandingForm({ ...brandingForm, favicon_url: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                    placeholder="https://example.com/favicon.ico"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Font Family</label>
                <select
                  value={brandingForm.font_family}
                  onChange={(e) => setBrandingForm({ ...brandingForm, font_family: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                >
                  <option value="Inter">Inter</option>
                  <option value="Roboto">Roboto</option>
                  <option value="Poppins">Poppins</option>
                  <option value="Open Sans">Open Sans</option>
                  <option value="Lato">Lato</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Color Palette</label>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Primary</label>
                    <input
                      type="color"
                      value={brandingForm.primary_color}
                      onChange={(e) => setBrandingForm({ ...brandingForm, primary_color: e.target.value })}
                      className="w-full h-10 border border-gray-200 rounded cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Secondary</label>
                    <input
                      type="color"
                      value={brandingForm.secondary_color}
                      onChange={(e) => setBrandingForm({ ...brandingForm, secondary_color: e.target.value })}
                      className="w-full h-10 border border-gray-200 rounded cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Accent</label>
                    <input
                      type="color"
                      value={brandingForm.accent_color}
                      onChange={(e) => setBrandingForm({ ...brandingForm, accent_color: e.target.value })}
                      className="w-full h-10 border border-gray-200 rounded cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Background</label>
                    <input
                      type="color"
                      value={brandingForm.background_color}
                      onChange={(e) => setBrandingForm({ ...brandingForm, background_color: e.target.value })}
                      className="w-full h-10 border border-gray-200 rounded cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Text</label>
                    <input
                      type="color"
                      value={brandingForm.text_color}
                      onChange={(e) => setBrandingForm({ ...brandingForm, text_color: e.target.value })}
                      className="w-full h-10 border border-gray-200 rounded cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Custom CSS (optional)</label>
                <textarea
                  value={brandingForm.custom_css}
                  onChange={(e) => setBrandingForm({ ...brandingForm, custom_css: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                  rows={4}
                  placeholder="Additional CSS styles..."
                />
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-4">
              <button
                onClick={() => setShowBrandingModal(false)}
                className="px-4 py-2 text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={saveBranding}
                disabled={!brandingForm.company_name}
                className="btn btn-primary disabled:opacity-50"
              >
                Save Branding
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Domain Modal */}
      {showDomainModal && (
        <div className="modal-overlay">
          <div className="modal-content max-w-md">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Add Domain</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Custom Domain</label>
                <input
                  type="text"
                  value={domainForm.domain}
                  onChange={(e) => setDomainForm({ ...domainForm, domain: e.target.value, subdomain: '' })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                  placeholder="yourcompany.com"
                />
                <p className="text-xs text-gray-500 mt-1">Enter your custom domain name</p>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">OR</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subdomain</label>
                <input
                  type="text"
                  value={domainForm.subdomain}
                  onChange={(e) => setDomainForm({ ...domainForm, subdomain: e.target.value, domain: '' })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                  placeholder="yourcompany"
                />
                <p className="text-xs text-gray-500 mt-1">Create a subdomain on worksphere.ai</p>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-4">
              <button
                onClick={() => setShowDomainModal(false)}
                className="px-4 py-2 text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={addDomain}
                disabled={!domainForm.domain && !domainForm.subdomain}
                className="btn btn-primary disabled:opacity-50"
              >
                Add Domain
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Theme Modal */}
      {showThemeModal && (
        <div className="modal-overlay">
          <div className="modal-content max-w-md">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Create Theme</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Theme Name</label>
                <input
                  type="text"
                  value={themeForm.name}
                  onChange={(e) => setThemeForm({ ...themeForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                  placeholder="Theme name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={themeForm.description}
                  onChange={(e) => setThemeForm({ ...themeForm, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                  rows={3}
                  placeholder="Theme description"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Theme Type</label>
                <select
                  value={themeForm.theme_type}
                  onChange={(e) => setThemeForm({ ...themeForm, theme_type: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                >
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                  <option value="auto">Auto</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-4">
              <button
                onClick={() => setShowThemeModal(false)}
                className="px-4 py-2 text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={createTheme}
                disabled={!themeForm.name}
                className="btn btn-primary disabled:opacity-50"
              >
                Create Theme
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
