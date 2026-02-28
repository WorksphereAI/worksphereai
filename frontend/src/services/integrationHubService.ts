// src/services/integrationHubService.ts
import { supabase } from '../lib/supabase';

export interface Integration {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  type: 'api' | 'webhook' | 'oauth' | 'database' | 'file_storage';
  provider: string;
  logo_url?: string;
  documentation_url?: string;
  configuration_schema: Record<string, any>;
  authentication_type: 'api_key' | 'oauth2' | 'basic' | 'bearer' | 'custom';
  is_active: boolean;
  is_public: boolean;
  version: string;
}

export interface IntegrationInstance {
  id: string;
  integration_id: string;
  name: string;
  configuration: Record<string, any>;
  credentials: Record<string, any>;
  status: 'active' | 'inactive' | 'error' | 'suspended';
  last_sync_at?: string;
  error_message?: string;
  retry_count: number;
  integration?: Integration;
}

export interface WebhookEndpoint {
  id: string;
  integration_instance_id: string;
  name: string;
  endpoint_url: string;
  events: string[];
  secret_key?: string;
  is_active: boolean;
  retry_policy: Record<string, any>;
  headers: Record<string, any>;
}

export interface DataSyncConfiguration {
  id: string;
  integration_instance_id: string;
  name: string;
  source_entity: string;
  target_entity: string;
  field_mappings: Record<string, any>;
  sync_direction: 'import' | 'export' | 'bidirectional';
  sync_frequency: 'realtime' | 'hourly' | 'daily' | 'weekly' | 'manual';
  last_sync_at?: string;
  next_sync_at?: string;
  status: 'active' | 'paused' | 'error';
}

export interface MarketplaceIntegration {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  provider: string;
  logo_url?: string;
  screenshots?: string[];
  pricing_model: 'free' | 'freemium' | 'paid' | 'enterprise';
  pricing_details: Record<string, any>;
  features: string[];
  requirements: string[];
  documentation_url?: string;
  support_url?: string;
  rating: number;
  review_count: number;
  downloads: number;
  is_featured: boolean;
}

export class IntegrationHubService {

  // ========== INTEGRATION MANAGEMENT ==========

  async getIntegrations(filters?: {
    category?: string;
    type?: string;
    provider?: string;
    is_active?: boolean;
  }): Promise<Integration[]> {
    let query = supabase
      .from('integrations')
      .select('*')
      .order('name', { ascending: true });

    if (filters?.category) {
      query = query.eq('category', filters.category);
    }
    if (filters?.type) {
      query = query.eq('type', filters.type);
    }
    if (filters?.provider) {
      query = query.eq('provider', filters.provider);
    }
    if (filters?.is_active !== undefined) {
      query = query.eq('is_active', filters.is_active);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  async getIntegrationBySlug(slug: string): Promise<Integration | null> {
    const { data, error } = await supabase
      .from('integrations')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error) return null;
    return data;
  }

  // ========== INTEGRATION INSTANCES ==========

  async getIntegrationInstances(): Promise<IntegrationInstance[]> {
    const { data, error } = await supabase
      .from('integration_instances')
      .select(`
        *,
        integration:integrations (*)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async createIntegrationInstance(
    integrationId: string,
    name: string,
    configuration: Record<string, any>,
    credentials: Record<string, any>
  ): Promise<IntegrationInstance> {
    const { data, error } = await supabase
      .from('integration_instances')
      .insert([{
        integration_id: integrationId,
        name,
        configuration,
        credentials,
        organization_id: await this.getOrganizationId()
      }])
      .select(`
        *,
        integration:integrations (*)
      `)
      .single();

    if (error) throw error;
    return data;
  }

  async updateIntegrationInstance(
    instanceId: string,
    updates: Partial<IntegrationInstance>
  ): Promise<IntegrationInstance> {
    const { data, error } = await supabase
      .from('integration_instances')
      .update(updates)
      .eq('id', instanceId)
      .select(`
        *,
        integration:integrations (*)
      `)
      .single();

    if (error) throw error;
    return data;
  }

  async deleteIntegrationInstance(instanceId: string): Promise<void> {
    const { error } = await supabase
      .from('integration_instances')
      .delete()
      .eq('id', instanceId);

    if (error) throw error;
  }

  async testIntegrationInstance(instanceId: string): Promise<{
    success: boolean;
    response_status?: number;
    response_time_ms?: number;
    error_message?: string;
  }> {
    const { data, error } = await supabase
      .rpc('test_api_connection', { p_connection_id: instanceId });

    if (error) throw error;
    return data?.[0] || { success: false, error_message: 'Test failed' };
  }

  // ========== WEBHOOK MANAGEMENT ==========

  async getWebhookEndpoints(): Promise<WebhookEndpoint[]> {
    const { data, error } = await supabase
      .from('webhook_endpoints')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async createWebhookEndpoint(webhook: Partial<WebhookEndpoint>): Promise<WebhookEndpoint> {
    const { data, error } = await supabase
      .from('webhook_endpoints')
      .insert([{
        ...webhook,
        organization_id: await this.getOrganizationId()
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateWebhookEndpoint(
    endpointId: string,
    updates: Partial<WebhookEndpoint>
  ): Promise<WebhookEndpoint> {
    const { data, error } = await supabase
      .from('webhook_endpoints')
      .update(updates)
      .eq('id', endpointId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async triggerWebhook(
    endpointId: string,
    eventType: string,
    payload: Record<string, any>
  ): Promise<string> {
    const { data, error } = await supabase
      .rpc('trigger_webhook', {
        p_webhook_endpoint_id: endpointId,
        p_event_type: eventType,
        p_payload: payload
      });

    if (error) throw error;
    return data;
  }

  // ========== DATA SYNC CONFIGURATIONS ==========

  async getDataSyncConfigurations(): Promise<DataSyncConfiguration[]> {
    const { data, error } = await supabase
      .from('data_sync_configurations')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async createDataSyncConfiguration(config: Partial<DataSyncConfiguration>): Promise<DataSyncConfiguration> {
    const { data, error } = await supabase
      .from('data_sync_configurations')
      .insert([{
        ...config,
        organization_id: await this.getOrganizationId()
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async executeDataSync(configId: string): Promise<string> {
    const { data, error } = await supabase
      .rpc('execute_data_sync', { p_sync_configuration_id: configId });

    if (error) throw error;
    return data;
  }

  // ========== MARKETPLACE ==========

  async getMarketplaceIntegrations(filters?: {
    category?: string;
    pricing_model?: string;
    featured?: boolean;
  }): Promise<MarketplaceIntegration[]> {
    let query = supabase
      .from('integration_marketplace')
      .select('*')
      .eq('is_active', true)
      .order('is_featured', { ascending: false })
      .order('rating', { ascending: false })
      .order('downloads', { ascending: false });

    if (filters?.category) {
      query = query.eq('category', filters.category);
    }
    if (filters?.pricing_model) {
      query = query.eq('pricing_model', filters.pricing_model);
    }
    if (filters?.featured !== undefined) {
      query = query.eq('is_featured', filters.featured);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  async getMarketplaceIntegrationBySlug(slug: string): Promise<MarketplaceIntegration | null> {
    const { data, error } = await supabase
      .from('integration_marketplace')
      .select('*')
      .eq('slug', slug)
      .eq('is_active', true)
      .single();

    if (error) return null;
    return data;
  }

  async searchMarketplaceIntegrations(query: string): Promise<MarketplaceIntegration[]> {
    const { data, error } = await supabase
      .from('integration_marketplace')
      .select('*')
      .eq('is_active', true)
      .or(`name.ilike.%${query}%,description.ilike.%${query}%,provider.ilike.%${query}%`)
      .order('rating', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  // ========== ANALYTICS ==========

  async getIntegrationUsageStats(instanceId: string, timeRange: string = '7 days'): Promise<{
    total_events: number;
    events_by_type: Record<string, number>;
    daily_usage: Array<{ date: string; count: number }>;
  }> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(timeRange));

    const { data, error } = await supabase
      .from('integration_usage_analytics')
      .select('*')
      .eq('integration_instance_id', instanceId)
      .gte('timestamp', startDate.toISOString())
      .order('timestamp', { ascending: true });

    if (error) throw error;

    const events = data || [];
    const eventsByType: Record<string, number> = {};
    const dailyUsage: Record<string, number> = {};

    events.forEach(event => {
      // Count by type
      eventsByType[event.event_type] = (eventsByType[event.event_type] || 0) + 1;

      // Count by day
      const date = new Date(event.timestamp).toISOString().split('T')[0];
      dailyUsage[date] = (dailyUsage[date] || 0) + 1;
    });

    return {
      total_events: events.length,
      events_by_type: eventsByType,
      daily_usage: Object.entries(dailyUsage).map(([date, count]) => ({ date, count }))
    };
  }

  async getOrganizationIntegrationStats(): Promise<{
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
  }> {
    const organizationId = await this.getOrganizationId();

    // Get integration instances
    const { data: instances } = await supabase
      .from('integration_instances')
      .select('status, integration:integrations(name, category)')
      .eq('organization_id', organizationId);

    // Get webhooks
    const { data: webhooks } = await supabase
      .from('webhook_endpoints')
      .select('id')
      .eq('organization_id', organizationId);

    // Get sync configurations
    const { data: syncs } = await supabase
      .from('data_sync_configurations')
      .select('id')
      .eq('organization_id', organizationId);

    // Get recent activity
    const { data: activity } = await supabase
      .from('integration_usage_analytics')
      .select(`
        event_type,
        timestamp,
        integration_instance:integration_instances(name)
      `)
      .eq('organization_id', organizationId)
      .gte('timestamp', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      .order('timestamp', { ascending: false })
      .limit(10);

    const integrationsByCategory: Record<string, number> = {};
    instances?.forEach(instance => {
      const category = (instance.integration as any)?.category || 'Unknown';
      integrationsByCategory[category] = (integrationsByCategory[category] || 0) + 1;
    });

    return {
      total_integrations: instances?.length || 0,
      active_integrations: instances?.filter(i => i.status === 'active').length || 0,
      total_webhooks: webhooks?.length || 0,
      total_syncs: syncs?.length || 0,
      integrations_by_category: integrationsByCategory,
      recent_activity: activity?.map(a => ({
        integration_name: (a.integration_instance as any)?.name || 'Unknown',
        event_type: a.event_type,
        timestamp: a.timestamp
      })) || []
    };
  }

  // ========== OAUTH FLOWS ==========

  async initiateOAuth(integrationSlug: string, redirectUri: string): Promise<string> {
    // This would initiate OAuth flow for the specific integration
    // For now, return a mock URL
    const integration = await this.getIntegrationBySlug(integrationSlug);
    if (!integration) throw new Error('Integration not found');

    // In production, this would generate the actual OAuth URL
    return `https://${integration.provider.toLowerCase()}.com/oauth/authorize?client_id=mock&redirect_uri=${redirectUri}`;
  }

  async handleOAuthCallback(_code: string, _state: string): Promise<{
    access_token: string;
    refresh_token?: string;
    expires_in?: number;
  }> {
    // Handle OAuth callback and exchange code for tokens
    // Mock implementation for now
    return {
      access_token: 'mock_access_token',
      refresh_token: 'mock_refresh_token',
      expires_in: 3600
    };
  }

  // ========== HELPER METHODS ==========

  private async getOrganizationId(): Promise<string> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data } = await supabase
      .from('users')
      .select('organization_id')
      .eq('id', user.id)
      .single();

    if (!data) throw new Error('Organization not found');
    return data.organization_id;
  }

  // ========== UTILITY METHODS ==========

  async validateConfiguration(
    integrationId: string,
    configuration: Record<string, any>
  ): Promise<{
    valid: boolean;
    errors: string[];
  }> {
    const integration = await this.getIntegrationBySlug(
      (await supabase
        .from('integrations')
        .select('slug')
        .eq('id', integrationId)
        .single()).data?.slug || ''
    );

    if (!integration) {
      return { valid: false, errors: ['Integration not found'] };
    }

    const errors: string[] = [];
    const schema = integration.configuration_schema;

    // Validate required fields
    Object.entries(schema).forEach(([field, rules]: [string, any]) => {
      if (rules.required && !configuration[field]) {
        errors.push(`${field} is required`);
      }

      // Type validation (simplified)
      if (configuration[field] && rules.type) {
        switch (rules.type) {
          case 'string':
            if (typeof configuration[field] !== 'string') {
              errors.push(`${field} must be a string`);
            }
            break;
          case 'array':
            if (!Array.isArray(configuration[field])) {
              errors.push(`${field} must be an array`);
            }
            break;
          case 'number':
            if (typeof configuration[field] !== 'number') {
              errors.push(`${field} must be a number`);
            }
            break;
        }
      }
    });

    return {
      valid: errors.length === 0,
      errors
    };
  }

  async getIntegrationCategories(): Promise<string[]> {
    const { data, error } = await supabase
      .from('integrations')
      .select('category')
      .eq('is_active', true);

    if (error) throw error;

    const categories = [...new Set(data?.map(i => i.category) || [])];
    return categories.sort();
  }

  async getIntegrationProviders(): Promise<string[]> {
    const { data, error } = await supabase
      .from('integrations')
      .select('provider')
      .eq('is_active', true);

    if (error) throw error;

    const providers = [...new Set(data?.map(i => i.provider) || [])];
    return providers.sort();
  }
}

export const integrationHub = new IntegrationHubService();
