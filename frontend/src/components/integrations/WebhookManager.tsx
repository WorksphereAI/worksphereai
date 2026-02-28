// src/components/integrations/WebhookManager.tsx
import React, { useState, useEffect } from 'react';
import {
  Zap,
  Plus,
  Settings,
  Trash2,
  Play,
  Pause,
  CheckCircle,
  AlertCircle,
  Clock,
  Copy,
  Eye,
  EyeOff,
  RefreshCw,
  Globe,
  Shield,
  Activity
} from 'lucide-react';
import { integrationHub, type WebhookEndpoint } from '../../services/integrationHubService';

interface WebhookEvent {
  id: string;
  webhook_endpoint_id: string;
  event_type: string;
  payload: Record<string, any>;
  status: 'pending' | 'delivered' | 'failed' | 'retrying';
  response_status?: number;
  attempt_count: number;
  created_at: string;
  delivered_at?: string;
  error_message?: string;
}

export const WebhookManager: React.FC = () => {
  const [webhooks, setWebhooks] = useState<WebhookEndpoint[]>([]);
  const [selectedWebhook, setSelectedWebhook] = useState<WebhookEndpoint | null>(null);
  const [events, setEvents] = useState<WebhookEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showSecret, setShowSecret] = useState<{ [key: string]: boolean }>({});
  const [testingWebhook, setTestingWebhook] = useState<string | null>(null);

  const [newWebhook, setNewWebhook] = useState({
    name: '',
    endpoint_url: '',
    events: [] as string[],
    secret_key: '',
    retry_policy: {
      max_retries: 3,
      retry_delay: 60
    },
    headers: {}
  });

  useEffect(() => {
    loadWebhooks();
  }, []);

  const loadWebhooks = async () => {
    setLoading(true);
    try {
      const data = await integrationHub.getWebhookEndpoints();
      setWebhooks(data);
    } catch (error) {
      console.error('Error loading webhooks:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadWebhookEvents = async (webhookId: string) => {
    try {
      // In a real implementation, this would fetch events from the database
      // For now, we'll use mock data
      const mockEvents: WebhookEvent[] = [
        {
          id: '1',
          webhook_endpoint_id: webhookId,
          event_type: 'user.created',
          payload: { user_id: '123', email: 'test@example.com' },
          status: 'delivered',
          response_status: 200,
          attempt_count: 1,
          created_at: new Date().toISOString(),
          delivered_at: new Date().toISOString()
        },
        {
          id: '2',
          webhook_endpoint_id: webhookId,
          event_type: 'task.completed',
          payload: { task_id: '456', title: 'Test Task' },
          status: 'failed',
          attempt_count: 3,
          created_at: new Date(Date.now() - 3600000).toISOString(),
          error_message: 'Connection timeout'
        }
      ];
      setEvents(mockEvents);
    } catch (error) {
      console.error('Error loading webhook events:', error);
    }
  };

  const createWebhook = async () => {
    try {
      const secret = newWebhook.secret_key || crypto.randomUUID();
      await integrationHub.createWebhookEndpoint({
        ...newWebhook,
        secret_key: secret
      });
      
      setShowCreateModal(false);
      setNewWebhook({
        name: '',
        endpoint_url: '',
        events: [],
        secret_key: '',
        retry_policy: { max_retries: 3, retry_delay: 60 },
        headers: {}
      });
      loadWebhooks();
    } catch (error) {
      console.error('Error creating webhook:', error);
    }
  };

  const deleteWebhook = async (webhookId: string) => {
    if (!confirm('Are you sure you want to delete this webhook?')) return;
    
    try {
      await integrationHub.updateWebhookEndpoint(webhookId, { is_active: false });
      loadWebhooks();
    } catch (error) {
      console.error('Error deleting webhook:', error);
    }
  };

  const testWebhook = async (webhookId: string) => {
    setTestingWebhook(webhookId);
    try {
      await integrationHub.triggerWebhook(webhookId, 'test.event', {
        test: true,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error testing webhook:', error);
    } finally {
      setTestingWebhook(null);
    }
  };

  const toggleWebhook = async (webhookId: string, isActive: boolean) => {
    try {
      await integrationHub.updateWebhookEndpoint(webhookId, { is_active: !isActive });
      loadWebhooks();
    } catch (error) {
      console.error('Error toggling webhook:', error);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'retrying':
        return <RefreshCw className="w-4 h-4 text-yellow-500 animate-spin" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'text-green-600 bg-green-50';
      case 'failed':
        return 'text-red-600 bg-red-50';
      case 'retrying':
        return 'text-yellow-600 bg-yellow-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="spinner w-8 h-8"></div>
        <span className="ml-2 text-gray-600">Loading webhooks...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Webhook Management</h2>
          <p className="text-gray-600 mt-1">Configure webhooks to receive real-time events</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn btn-primary flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Create Webhook</span>
        </button>
      </div>

      {/* Webhooks List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {webhooks.map((webhook) => (
          <div key={webhook.id} className="card p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  webhook.is_active ? 'bg-green-100' : 'bg-gray-100'
                }`}>
                  <Zap className={`w-5 h-5 ${webhook.is_active ? 'text-green-600' : 'text-gray-400'}`} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{webhook.name}</h3>
                  <p className="text-sm text-gray-500">{webhook.endpoint_url}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => toggleWebhook(webhook.id, webhook.is_active)}
                  className={`p-2 rounded-lg transition-colors ${
                    webhook.is_active 
                      ? 'text-green-600 hover:bg-green-50' 
                      : 'text-gray-400 hover:bg-gray-50'
                  }`}
                  title={webhook.is_active ? 'Pause webhook' : 'Activate webhook'}
                >
                  {webhook.is_active ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => setSelectedWebhook(webhook)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                  title="View details"
                >
                  <Eye className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Events:</span>
                <div className="flex flex-wrap gap-1">
                  {webhook.events.map((event, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded"
                    >
                      {event}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Retry Policy:</span>
                <span className="text-gray-700">
                  {webhook.retry_policy.max_retries} retries, {webhook.retry_policy.retry_delay}s delay
                </span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Secret Key:</span>
                <div className="flex items-center space-x-2">
                  <span className="font-mono text-xs text-gray-600">
                    {showSecret[webhook.id] ? webhook.secret_key?.substring(0, 20) + '...' : '•••••••••••••••'}
                  </span>
                  <button
                    onClick={() => setShowSecret(prev => ({ ...prev, [webhook.id]: !prev[webhook.id] }))}
                    className="text-gray-400 hover:text-gray-600"
                    title={showSecret[webhook.id] ? 'Hide secret' : 'Show secret'}
                  >
                    {showSecret[webhook.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => copyToClipboard(webhook.secret_key || '')}
                    className="text-gray-400 hover:text-gray-600"
                    title="Copy secret"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="flex items-center space-x-2 pt-2 border-t">
                <button
                  onClick={() => testWebhook(webhook.id)}
                  disabled={testingWebhook === webhook.id}
                  className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 flex items-center justify-center space-x-1"
                >
                  {testingWebhook === webhook.id ? (
                    <div className="spinner w-4 h-4"></div>
                  ) : (
                    <Activity className="w-4 h-4" />
                  )}
                  <span>{testingWebhook === webhook.id ? 'Testing...' : 'Test'}</span>
                </button>
                <button
                  onClick={() => loadWebhookEvents(webhook.id)}
                  className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center space-x-1"
                >
                  <Globe className="w-4 h-4" />
                  <span>View Events</span>
                </button>
                <button
                  onClick={() => deleteWebhook(webhook.id)}
                  className="px-3 py-2 text-sm text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors flex items-center justify-center space-x-1"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {webhooks.length === 0 && (
        <div className="text-center py-12">
          <Zap className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No webhooks configured</h3>
          <p className="text-gray-500 mb-6">Create your first webhook to start receiving real-time events</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn btn-primary"
          >
            Create Webhook
          </button>
        </div>
      )}

      {/* Events Display */}
      {selectedWebhook && (
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Recent Events - {selectedWebhook.name}
            </h3>
            <button
              onClick={() => setSelectedWebhook(null)}
              className="text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          </div>
          
          <div className="space-y-3">
            {events.map((event) => (
              <div key={event.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(event.status)}
                    <span className="font-medium text-gray-900">{event.event_type}</span>
                  </div>
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(event.status)}`}>
                    {event.status}
                  </div>
                </div>
                
                <div className="text-sm text-gray-600 mb-2">
                  <pre className="bg-gray-50 p-2 rounded text-xs overflow-x-auto">
                    {JSON.stringify(event.payload, null, 2)}
                  </pre>
                </div>
                
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>Attempt {event.attempt_count}</span>
                  <span>{new Date(event.created_at).toLocaleString()}</span>
                  {event.response_status && (
                    <span>Status: {event.response_status}</span>
                  )}
                </div>
                
                {event.error_message && (
                  <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-600">
                    {event.error_message}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Create Webhook Modal */}
      {showCreateModal && (
        <div className="modal-overlay">
          <div className="modal-content max-w-2xl">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Create Webhook</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={newWebhook.name}
                  onChange={(e) => setNewWebhook({ ...newWebhook, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                  placeholder="Webhook name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Endpoint URL</label>
                <input
                  type="url"
                  value={newWebhook.endpoint_url}
                  onChange={(e) => setNewWebhook({ ...newWebhook, endpoint_url: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                  placeholder="https://example.com/webhook"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Events</label>
                <div className="space-y-2">
                  {['user.created', 'user.updated', 'task.created', 'task.completed', 'message.sent'].map((event) => (
                    <label key={event} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={newWebhook.events.includes(event)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setNewWebhook({ ...newWebhook, events: [...newWebhook.events, event] });
                          } else {
                            setNewWebhook({ ...newWebhook, events: newWebhook.events.filter(e => e !== event) });
                          }
                        }}
                        className="rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                      />
                      <span className="text-sm text-gray-700">{event}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Secret Key (optional)</label>
                <input
                  type="text"
                  value={newWebhook.secret_key}
                  onChange={(e) => setNewWebhook({ ...newWebhook, secret_key: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                  placeholder="Leave empty to auto-generate"
                />
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-4">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={createWebhook}
                disabled={!newWebhook.name || !newWebhook.endpoint_url || newWebhook.events.length === 0}
                className="btn btn-primary disabled:opacity-50"
              >
                Create Webhook
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
