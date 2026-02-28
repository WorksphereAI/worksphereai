// src/services/whiteLabelService.ts
import { supabase } from '../lib/supabase';

export interface WhiteLabelConfiguration {
  id: string;
  organization_id: string;
  is_active: boolean;
  subdomain?: string;
  custom_domain?: string;
  company_name: string;
  logo_url?: string;
  favicon_url?: string;
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  background_color: string;
  text_color: string;
  font_family: string;
  custom_css?: string;
  custom_javascript?: string;
  theme_config: Record<string, any>;
  branding_settings: Record<string, any>;
  privacy_settings: Record<string, any>;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface WhiteLabelTheme {
  id: string;
  organization_id: string;
  name: string;
  slug: string;
  description?: string;
  theme_type: 'light' | 'dark' | 'auto';
  color_palette: Record<string, any>;
  typography: Record<string, any>;
  spacing: Record<string, any>;
  components: Record<string, any>;
  custom_properties: Record<string, any>;
  is_default: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CustomDomain {
  id: string;
  organization_id: string;
  domain: string;
  ssl_status: 'pending' | 'active' | 'failed' | 'expired';
  ssl_certificate?: string;
  ssl_private_key?: string;
  ssl_expires_at?: string;
  dns_status: 'pending' | 'active' | 'failed';
  dns_records: Record<string, any>;
  verification_token?: string;
  is_verified: boolean;
  is_primary: boolean;
  created_at: string;
  updated_at: string;
}

export interface WhiteLabelFeature {
  id: string;
  organization_id: string;
  feature_name: string;
  feature_key: string;
  is_enabled: boolean;
  configuration: Record<string, any>;
  pricing_tier: 'free' | 'basic' | 'premium' | 'enterprise';
  created_at: string;
  updated_at: string;
}

export interface WhiteLabelAnalytics {
  id: string;
  organization_id: string;
  domain_id?: string;
  metric_type: string;
  metric_value: number;
  metadata: Record<string, any>;
  timestamp: string;
}

export interface WhiteLabelTemplate {
  id: string;
  name: string;
  slug: string;
  description?: string;
  category: string;
  template_type: 'theme' | 'layout' | 'component' | 'email';
  preview_image_url?: string;
  configuration: Record<string, any>;
  is_premium: boolean;
  is_active: boolean;
  usage_count: number;
  created_at: string;
  updated_at: string;
}

export interface WhiteLabelSubscription {
  id: string;
  organization_id: string;
  plan_type: 'starter' | 'professional' | 'enterprise';
  status: 'active' | 'inactive' | 'cancelled' | 'suspended';
  billing_cycle: 'monthly' | 'yearly';
  price: number;
  features: Record<string, any>;
  limits: Record<string, any>;
  trial_ends_at?: string;
  current_period_ends_at: string;
  next_billing_at: string;
  cancelled_at?: string;
  created_at: string;
  updated_at: string;
}

class WhiteLabelService {
  // White Label Configuration
  async getWhiteLabelConfiguration(organizationId: string): Promise<WhiteLabelConfiguration | null> {
    const { data, error } = await supabase
      .from('white_label_configurations')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('is_active', true)
      .single();

    if (error) throw error;
    return data;
  }

  async createWhiteLabelConfiguration(config: Partial<WhiteLabelConfiguration>): Promise<WhiteLabelConfiguration> {
    const { data, error } = await supabase
      .from('white_label_configurations')
      .insert([config])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateWhiteLabelConfiguration(id: string, updates: Partial<WhiteLabelConfiguration>): Promise<WhiteLabelConfiguration> {
    const { data, error } = await supabase
      .from('white_label_configurations')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Theme Management
  async getThemes(organizationId: string): Promise<WhiteLabelTheme[]> {
    const { data, error } = await supabase
      .from('white_label_themes')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async createTheme(theme: Partial<WhiteLabelTheme>): Promise<WhiteLabelTheme> {
    const { data, error } = await supabase
      .from('white_label_themes')
      .insert([theme])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateTheme(id: string, updates: Partial<WhiteLabelTheme>): Promise<WhiteLabelTheme> {
    const { data, error } = await supabase
      .from('white_label_themes')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteTheme(id: string): Promise<void> {
    const { error } = await supabase
      .from('white_label_themes')
      .update({ is_active: false })
      .eq('id', id);

    if (error) throw error;
  }

  async applyTheme(organizationId: string, themeId: string): Promise<boolean> {
    const { data, error } = await supabase.rpc('apply_white_label_theme', {
      p_organization_id: organizationId,
      p_theme_id: themeId
    });

    if (error) throw error;
    return data;
  }

  // Custom Domain Management
  async getCustomDomains(organizationId: string): Promise<CustomDomain[]> {
    const { data, error } = await supabase
      .from('custom_domains')
      .select('*')
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async addCustomDomain(domain: Partial<CustomDomain>): Promise<CustomDomain> {
    // Generate verification token
    const { data: tokenData } = await supabase.rpc('generate_domain_verification_token');
    
    const { data, error } = await supabase
      .from('custom_domains')
      .insert([{ ...domain, verification_token: tokenData }])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async verifyDomain(domainId: string, token: string): Promise<boolean> {
    const { data, error } = await supabase.rpc('verify_domain_ownership', {
      p_domain_id: domainId,
      p_token: token
    });

    if (error) throw error;
    return data;
  }

  async updateDomainSSL(domainId: string, certificate: string, privateKey: string): Promise<CustomDomain> {
    const { data, error } = await supabase
      .from('custom_domains')
      .update({
        ssl_certificate: certificate,
        ssl_private_key: privateKey,
        ssl_status: 'active',
        ssl_expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year
        updated_at: new Date().toISOString()
      })
      .eq('id', domainId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async setPrimaryDomain(domainId: string): Promise<void> {
    // First, get the domain to find organization
    const { data: domain } = await supabase
      .from('custom_domains')
      .select('organization_id')
      .eq('id', domainId)
      .single();

    if (domain) {
      // Unset all primary domains for the organization
      await supabase
        .from('custom_domains')
        .update({ is_primary: false })
        .eq('organization_id', domain.organization_id)
        .neq('id', domainId);
    }

    // Set the new primary domain
    const { error } = await supabase
      .from('custom_domains')
      .update({ is_primary: true })
      .eq('id', domainId);

    if (error) throw error;
  }

  // Feature Management
  async getFeatures(organizationId: string): Promise<WhiteLabelFeature[]> {
    const { data, error } = await supabase
      .from('white_label_features')
      .select('*')
      .eq('organization_id', organizationId)
      .order('feature_name');

    if (error) throw error;
    return data || [];
  }

  async updateFeature(organizationId: string, featureKey: string, isEnabled: boolean): Promise<WhiteLabelFeature> {
    const { data, error } = await supabase
      .from('white_label_features')
      .update({ 
        is_enabled: isEnabled,
        updated_at: new Date().toISOString()
      })
      .eq('organization_id', organizationId)
      .eq('feature_key', featureKey)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async checkFeatureAccess(organizationId: string, featureKey: string): Promise<boolean> {
    const { data, error } = await supabase.rpc('check_white_label_feature', {
      p_organization_id: organizationId,
      p_feature_key: featureKey
    });

    if (error) throw error;
    return data;
  }

  // Analytics
  async getAnalytics(organizationId: string, startDate?: string, endDate?: string): Promise<WhiteLabelAnalytics[]> {
    let query = supabase
      .from('white_label_analytics')
      .select('*')
      .eq('organization_id', organizationId);

    if (startDate) {
      query = query.gte('timestamp', startDate);
    }
    if (endDate) {
      query = query.lte('timestamp', endDate);
    }

    query = query.order('timestamp', { ascending: false });

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  async logAnalytics(organizationId: string, domainId: string | null, metricType: string, metricValue: number, metadata: Record<string, any> = {}): Promise<void> {
    const { error } = await supabase.rpc('log_white_label_analytics', {
      p_organization_id: organizationId,
      p_domain_id: domainId,
      p_metric_type: metricType,
      p_metric_value: metricValue,
      p_metadata: metadata
    });

    if (error) throw error;
  }

  // Templates
  async getTemplates(category?: string, templateType?: string): Promise<WhiteLabelTemplate[]> {
    let query = supabase
      .from('white_label_templates')
      .select('*')
      .eq('is_active', true);

    if (category) {
      query = query.eq('category', category);
    }
    if (templateType) {
      query = query.eq('template_type', templateType);
    }

    query = query.order('usage_count', { ascending: false });

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  async useTemplate(templateId: string): Promise<WhiteLabelTemplate> {
    // First get current usage count
    const { data: template } = await supabase
      .from('white_label_templates')
      .select('usage_count')
      .eq('id', templateId)
      .single();

    if (!template) throw new Error('Template not found');

    // Then update with incremented count
    const { data, error } = await supabase
      .from('white_label_templates')
      .update({ 
        usage_count: template.usage_count + 1,
        updated_at: new Date().toISOString()
      })
      .eq('id', templateId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Subscription Management
  async getSubscription(organizationId: string): Promise<WhiteLabelSubscription | null> {
    const { data, error } = await supabase
      .from('white_label_subscriptions')
      .select('*')
      .eq('organization_id', organizationId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  async updateSubscription(organizationId: string, planType: 'starter' | 'professional' | 'enterprise', billingCycle: 'monthly' | 'yearly' = 'monthly'): Promise<WhiteLabelSubscription> {
    const { data: _, error } = await supabase.rpc('update_white_label_subscription', {
      p_organization_id: organizationId,
      p_plan_type: planType,
      p_billing_cycle: billingCycle
    });

    if (error) throw error;

    // Fetch the updated subscription
    return this.getSubscription(organizationId) as Promise<WhiteLabelSubscription>;
  }

  async cancelSubscription(organizationId: string): Promise<void> {
    const { error } = await supabase
      .from('white_label_subscriptions')
      .update({
        status: 'cancelled',
        cancelled_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('organization_id', organizationId);

    if (error) throw error;
  }

  // Utility Methods
  async getBrandingCSS(organizationId: string): Promise<string> {
    const config = await this.getWhiteLabelConfiguration(organizationId);
    if (!config) return '';

    let css = `
      :root {
        --brand-primary: ${config.primary_color};
        --brand-secondary: ${config.secondary_color};
        --brand-accent: ${config.accent_color};
        --brand-background: ${config.background_color};
        --brand-text: ${config.text_color};
        --brand-font-family: '${config.font_family}', system-ui, sans-serif;
      }
      
      body {
        font-family: var(--brand-font-family);
        background-color: var(--brand-background);
        color: var(--brand-text);
      }
      
      .btn-primary {
        background-color: var(--brand-primary);
        border-color: var(--brand-primary);
      }
      
      .btn-secondary {
        background-color: var(--brand-secondary);
        border-color: var(--brand-secondary);
      }
      
      .btn-accent {
        background-color: var(--brand-accent);
        border-color: var(--brand-accent);
      }
    `;

    if (config.custom_css) {
      css += '\n' + config.custom_css;
    }

    return css;
  }

  async getBrandingJavaScript(organizationId: string): Promise<string> {
    const config = await this.getWhiteLabelConfiguration(organizationId);
    if (!config) return '';

    let js = `
      // White Label Branding for ${config.company_name}
      console.log('White Label Branding Active: ${config.company_name}');
      
      // Apply custom branding
      document.addEventListener('DOMContentLoaded', function() {
        // Update favicon if provided
        if ('${config.favicon_url || ''}') {
          const favicon = document.querySelector('link[rel="icon"]');
          if (favicon) {
            favicon.href = '${config.favicon_url}';
          }
        }
        
        // Update company name in branding elements
        const brandingElements = document.querySelectorAll('[data-branding="company-name"]');
        brandingElements.forEach(element => {
          element.textContent = '${config.company_name}';
        });
      });
    `;

    if (config.custom_javascript) {
      js += '\n' + config.custom_javascript;
    }

    return js;
  }

  async getDomainBranding(domain: string): Promise<WhiteLabelConfiguration | null> {
    const { data, error } = await supabase
      .from('white_label_configurations')
      .select('*')
      .eq('custom_domain', domain)
      .eq('is_active', true)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  async getSubdomainBranding(subdomain: string): Promise<WhiteLabelConfiguration | null> {
    const { data, error } = await supabase
      .from('white_label_configurations')
      .select('*')
      .eq('subdomain', subdomain)
      .eq('is_active', true)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  // Real-time subscriptions
  subscribeToWhiteLabelUpdates(organizationId: string, callback: (payload: any) => void) {
    return supabase
      .channel('white-label-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'white_label_configurations',
          filter: `organization_id=eq.${organizationId}`
        },
        callback
      )
      .subscribe();
  }

  subscribeToDomainUpdates(organizationId: string, callback: (payload: any) => void) {
    return supabase
      .channel('domain-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'custom_domains',
          filter: `organization_id=eq.${organizationId}`
        },
        callback
      )
      .subscribe();
  }

  subscribeToAnalyticsUpdates(organizationId: string, callback: (payload: any) => void) {
    return supabase
      .channel('analytics-updates')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'white_label_analytics',
          filter: `organization_id=eq.${organizationId}`
        },
        callback
      )
      .subscribe();
  }
}

export const whiteLabel = new WhiteLabelService();
