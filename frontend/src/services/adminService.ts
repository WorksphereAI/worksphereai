// src/services/adminService.ts
import { supabase } from '../lib/supabase';
import { subDays, format, differenceInDays } from 'date-fns';

export interface AdminMetrics {
  overview: {
    totalUsers: number;
    activeUsers: number;
    totalOrganizations: number;
    paidOrganizations: number;
    trialOrganizations: number;
    mrr: number;
    arr: number;
    churnRate: number;
    cac: number;
    ltv: number;
  };
  revenue: {
    daily: Array<{ date: string; revenue: number }>;
    monthly: Array<{ month: string; revenue: number }>;
    byPlan: Array<{ plan: string; count: number; revenue: number }>;
  };
  usage: {
    messages: number;
    tasks: number;
    documents: number;
    storage: number;
    apiCalls: number;
  };
  performance: {
    avgResponseTime: number;
    uptime: number;
    errorRate: number;
    activeSessions: number;
  };
}

export interface Customer {
  id: string;
  organization_name: string;
  email: string;
  plan: string;
  status: string;
  mrr: number;
  users: number;
  created_at: string;
  last_active: string;
  health_score: number;
}

export interface SystemHealth {
  status: 'healthy' | 'degraded' | 'down';
  services: Array<{
    name: string;
    status: 'healthy' | 'degraded' | 'down';
    latency: number;
    lastChecked: string;
  }>;
  alerts: Array<{
    id: string;
    title: string;
    severity: string;
    timestamp: string;
  }>;
}

export class AdminService {
  
  // ============= DASHBOARD METRICS =============
  
  async getDashboardMetrics(timeRange: 'today' | 'week' | 'month' | 'quarter' = 'month'): Promise<AdminMetrics> {
    const [overview, revenue, usage, performance] = await Promise.all([
      this.getOverviewMetrics(),
      this.getRevenueMetrics(timeRange),
      this.getUsageMetrics(timeRange),
      this.getPerformanceMetrics()
    ]);

    return { overview, revenue, usage, performance };
  }

  private async getOverviewMetrics() {
    // Get current metrics
    const { data: businessMetrics } = await supabase
      .from('business_metrics')
      .select('*')
      .order('date', { ascending: false })
      .limit(1)
      .single();

    // Get active users today
    const today = new Date().toISOString().split('T')[0];
    const { count: activeUsers } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .gte('last_active', `${today}T00:00:00`);

    // Calculate churn rate
    const thirtyDaysAgo = format(subDays(new Date(), 30), 'yyyy-MM-dd');
    const { data: churnData } = await supabase
      .from('business_metrics')
      .select('paid_organizations')
      .gte('date', thirtyDaysAgo)
      .order('date', { ascending: true });

    let churnRate = 0;
    if (churnData && churnData.length >= 2) {
      const startCustomers = churnData[0].paid_organizations;
      const endCustomers = churnData[churnData.length - 1].paid_organizations;
      churnRate = ((startCustomers - endCustomers) / startCustomers) * 100;
    }

    return {
      totalUsers: businessMetrics?.total_users || 0,
      activeUsers: activeUsers || 0,
      totalOrganizations: businessMetrics?.active_organizations || 0,
      paidOrganizations: businessMetrics?.paid_organizations || 0,
      trialOrganizations: businessMetrics?.trial_organizations || 0,
      mrr: businessMetrics?.mrr || 0,
      arr: businessMetrics?.arr || 0,
      churnRate: Math.max(0, churnRate),
      cac: businessMetrics?.cac || 0,
      ltv: businessMetrics?.ltv || 0
    };
  }

  private async getRevenueMetrics(timeRange: string) {
    let startDate: Date;
    switch (timeRange) {
      case 'today':
        startDate = new Date();
        break;
      case 'week':
        startDate = subDays(new Date(), 7);
        break;
      case 'month':
        startDate = subDays(new Date(), 30);
        break;
      case 'quarter':
        startDate = subDays(new Date(), 90);
        break;
      default:
        startDate = subDays(new Date(), 30);
    }

    // Get daily revenue
    const { data: dailyInvoices } = await supabase
      .from('subscription_invoices')
      .select('amount_paid, paid_at')
      .gte('paid_at', startDate.toISOString())
      .order('paid_at', { ascending: true });

    const dailyMap = new Map();
    dailyInvoices?.forEach(invoice => {
      const date = format(new Date(invoice.paid_at), 'yyyy-MM-dd');
      dailyMap.set(date, (dailyMap.get(date) || 0) + invoice.amount_paid);
    });

    const daily = Array.from(dailyMap.entries()).map(([date, revenue]) => ({
      date,
      revenue
    }));

    // Get revenue by plan
    const { data: subscriptions } = await supabase
      .from('organization_subscriptions')
      .select(`
        plan_id,
        billing_cycle,
        subscription_plans (
          name,
          price_monthly,
          price_yearly
        )
      `)
      .eq('status', 'active');

    const planMap = new Map();
    subscriptions?.forEach(sub => {
      const planName = sub.subscription_plans?.name || 'Unknown';
      const revenue = sub.billing_cycle === 'yearly' 
        ? (sub.subscription_plans?.price_yearly || 0) / 12
        : (sub.subscription_plans?.price_monthly || 0);
      
      const current = planMap.get(planName) || { count: 0, revenue: 0 };
      planMap.set(planName, {
        count: current.count + 1,
        revenue: current.revenue + revenue
      });
    });

    const byPlan = Array.from(planMap.entries()).map(([plan, data]) => ({
      plan,
      count: data.count,
      revenue: data.revenue
    }));

    return {
      daily,
      monthly: [], // Would aggregate by month
      byPlan
    };
  }

  private async getUsageMetrics(timeRange: string) {
    let startDate: Date;
    switch (timeRange) {
      case 'today':
        startDate = new Date();
        break;
      case 'week':
        startDate = subDays(new Date(), 7);
        break;
      case 'month':
        startDate = subDays(new Date(), 30);
        break;
      case 'quarter':
        startDate = subDays(new Date(), 90);
        break;
      default:
        startDate = subDays(new Date(), 30);
    }

    // Get message count
    const { count: messages } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', startDate.toISOString());

    // Get task count
    const { count: tasks } = await supabase
      .from('tasks')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', startDate.toISOString());

    // Get document count
    const { count: documents } = await supabase
      .from('files')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', startDate.toISOString());

    // Get total storage
    const { data: storageData } = await supabase
      .from('files')
      .select('size')
      .gte('created_at', startDate.toISOString());

    const totalStorage = storageData?.reduce((sum, file) => sum + (file.size || 0), 0) || 0;

    return {
      messages: messages || 0,
      tasks: tasks || 0,
      documents: documents || 0,
      storage: totalStorage,
      apiCalls: 0 // Would come from API logs
    };
  }

  private async getPerformanceMetrics() {
    // This would integrate with your monitoring system
    // For now, return mock data
    return {
      avgResponseTime: 150, // ms
      uptime: 99.9,
      errorRate: 0.1,
      activeSessions: 1245
    };
  }

  // ============= CUSTOMER MANAGEMENT =============

  async getCustomers(filters?: {
    search?: string;
    plan?: string;
    status?: string;
    health?: string;
    page?: number;
    limit?: number;
  }): Promise<{ customers: Customer[]; total: number }> {
    let query = supabase
      .from('organizations')
      .select(`
        *,
        organization_subscriptions!inner (
          status,
          billing_cycle,
          subscription_plans (name)
        ),
        customer_success_metrics (
          health_score
        )
      `, { count: 'exact' });

    if (filters?.search) {
      query = query.or(`name.ilike.%${filters.search}%,email.ilike.%${filters.search}%`);
    }

    if (filters?.plan) {
      query = query.eq('organization_subscriptions.subscription_plans.name', filters.plan);
    }

    if (filters?.status) {
      query = query.eq('organization_subscriptions.status', filters.status);
    }

    if (filters?.health) {
      query = query.gte('customer_success_metrics.health_score', parseInt(filters.health));
    }

    const page = filters?.page || 1;
    const limit = filters?.limit || 20;
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, error, count } = await query
      .range(from, to)
      .order('created_at', { ascending: false });

    if (error) throw error;

    const customers = data?.map(org => ({
      id: org.id,
      organization_name: org.name,
      email: org.email,
      plan: org.organization_subscriptions?.[0]?.subscription_plans?.name || 'Free',
      status: org.organization_subscriptions?.[0]?.status || 'inactive',
      mrr: 0, // Calculate from subscription
      users: 0, // Count users
      created_at: org.created_at,
      last_active: org.updated_at,
      health_score: org.customer_success_metrics?.[0]?.health_score || 0
    })) || [];

    return {
      customers,
      total: count || 0
    };
  }

  async getCustomerDetails(organizationId: string): Promise<any> {
    const [organization, subscription, metrics, users, usage] = await Promise.all([
      supabase.from('organizations').select('*').eq('id', organizationId).single(),
      supabase.from('organization_subscriptions').select(`
        *,
        subscription_plans (*)
      `).eq('organization_id', organizationId).single(),
      supabase.from('customer_success_metrics').select('*').eq('organization_id', organizationId).single(),
      supabase.from('users').select('count').eq('organization_id', organizationId),
      supabase.from('usage_metrics').select('*').eq('organization_id', organizationId).order('metric_date', { ascending: false }).limit(30)
    ]);

    return {
      organization: organization.data,
      subscription: subscription.data,
      metrics: metrics.data,
      userCount: users.count || 0,
      usage: usage.data || []
    };
  }

  async updateCustomer(organizationId: string, updates: any): Promise<void> {
    const { error } = await supabase
      .from('organizations')
      .update(updates)
      .eq('id', organizationId);

    if (error) throw error;

    // Log admin action
    await this.logAdminAction('update_customer', 'organizations', organizationId, updates);
  }

  // ============= SUBSCRIPTION MANAGEMENT =============

  async getSubscriptions(filters?: {
    status?: string;
    plan?: string;
    page?: number;
    limit?: number;
  }): Promise<any> {
    let query = supabase
      .from('organization_subscriptions')
      .select(`
        *,
        organizations (name, email),
        subscription_plans (name, price_monthly)
      `, { count: 'exact' });

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    if (filters?.plan) {
      query = query.eq('plan_id', filters.plan);
    }

    const page = filters?.page || 1;
    const limit = filters?.limit || 20;
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, error, count } = await query
      .range(from, to)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return {
      subscriptions: data,
      total: count || 0
    };
  }

  async updateSubscription(subscriptionId: string, updates: any): Promise<void> {
    const { error } = await supabase
      .from('organization_subscriptions')
      .update(updates)
      .eq('id', subscriptionId);

    if (error) throw error;

    // Log admin action
    await this.logAdminAction('update_subscription', 'organization_subscriptions', subscriptionId, updates);
  }

  // ============= SYSTEM ALERTS =============

  async getAlerts(filters?: {
    severity?: string;
    status?: string;
    limit?: number;
  }): Promise<any[]> {
    let query = supabase
      .from('system_alerts')
      .select('*')
      .order('created_at', { ascending: false });

    if (filters?.severity) {
      query = query.eq('severity', filters.severity);
    }

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    const limit = filters?.limit || 50;
    query = query.limit(limit);

    const { data, error } = await query;
    if (error) throw error;

    return data || [];
  }

  async acknowledgeAlert(alertId: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    
    const { error } = await supabase
      .from('system_alerts')
      .update({
        status: 'acknowledged',
        acknowledged_by: user?.id,
        acknowledged_at: new Date().toISOString()
      })
      .eq('id', alertId);

    if (error) throw error;
  }

  async resolveAlert(alertId: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    
    const { error } = await supabase
      .from('system_alerts')
      .update({
        status: 'resolved',
        resolved_by: user?.id,
        resolved_at: new Date().toISOString()
      })
      .eq('id', alertId);

    if (error) throw error;
  }

  async createAlert(alert: {
    title: string;
    description: string;
    severity: string;
    category: string;
    metadata?: any;
  }): Promise<void> {
    const { error } = await supabase
      .from('system_alerts')
      .insert([alert]);

    if (error) throw error;
  }

  // ============= SYSTEM HEALTH =============

  async getSystemHealth(): Promise<SystemHealth> {
    // Get latest health metrics
    const { data: metrics } = await supabase
      .from('system_health_metrics')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(10);

    // Get active alerts
    const { data: alerts } = await supabase
      .from('system_alerts')
      .select('*')
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(5);

    // Determine overall status
    let status: 'healthy' | 'degraded' | 'down' = 'healthy';
    if (alerts?.some(a => a.severity === 'critical')) {
      status = 'down';
    } else if (alerts?.some(a => a.severity === 'error')) {
      status = 'degraded';
    }

    // Mock service status
    const services = [
      { name: 'API', status: 'healthy', latency: 120, lastChecked: new Date().toISOString() },
      { name: 'Database', status: 'healthy', latency: 45, lastChecked: new Date().toISOString() },
      { name: 'Storage', status: 'healthy', latency: 89, lastChecked: new Date().toISOString() },
      { name: 'Auth', status: 'healthy', latency: 67, lastChecked: new Date().toISOString() },
      { name: 'Realtime', status: 'healthy', latency: 34, lastChecked: new Date().toISOString() }
    ];

    return {
      status,
      services,
      alerts: alerts?.map(a => ({
        id: a.id,
        title: a.title,
        severity: a.severity,
        timestamp: a.created_at
      })) || []
    };
  }

  // ============= FEATURE FLAGS =============

  async getFeatureFlags(): Promise<any[]> {
    const { data, error } = await supabase
      .from('feature_flags')
      .select('*')
      .order('name');

    if (error) throw error;
    return data || [];
  }

  async updateFeatureFlag(flagId: string, updates: any): Promise<void> {
    const { error } = await supabase
      .from('feature_flags')
      .update(updates)
      .eq('id', flagId);

    if (error) throw error;
  }

  async createFeatureFlag(flag: any): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    
    const { error } = await supabase
      .from('feature_flags')
      .insert([{
        ...flag,
        created_by: user?.id
      }]);

    if (error) throw error;
  }

  // ============= ANNOUNCEMENTS =============

  async getAnnouncements(filters?: {
    type?: string;
    active?: boolean;
  }): Promise<any[]> {
    let query = supabase
      .from('announcements')
      .select('*')
      .order('created_at', { ascending: false });

    if (filters?.type) {
      query = query.eq('type', filters.type);
    }

    if (filters?.active) {
      query = query
        .lte('scheduled_for', new Date().toISOString())
        .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`);
    }

    const { data, error } = await query;
    if (error) throw error;

    return data || [];
  }

  async createAnnouncement(announcement: any): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    
    const { error } = await supabase
      .from('announcements')
      .insert([{
        ...announcement,
        created_by: user?.id
      }]);

    if (error) throw error;
  }

  async updateAnnouncement(announcementId: string, updates: any): Promise<void> {
    const { error } = await supabase
      .from('announcements')
      .update(updates)
      .eq('id', announcementId);

    if (error) throw error;
  }

  // ============= AUDIT LOGS =============

  async getAuditLogs(filters?: {
    admin_id?: string;
    entity_type?: string;
    start_date?: string;
    end_date?: string;
    page?: number;
    limit?: number;
  }): Promise<any> {
    let query = supabase
      .from('admin_audit_logs')
      .select(`
        *,
        users!admin_id (email, full_name)
      `, { count: 'exact' })
      .order('created_at', { ascending: false });

    if (filters?.admin_id) {
      query = query.eq('admin_id', filters.admin_id);
    }

    if (filters?.entity_type) {
      query = query.eq('entity_type', filters.entity_type);
    }

    if (filters?.start_date) {
      query = query.gte('created_at', filters.start_date);
    }

    if (filters?.end_date) {
      query = query.lte('created_at', filters.end_date);
    }

    const page = filters?.page || 1;
    const limit = filters?.limit || 50;
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, error, count } = await query
      .range(from, to);

    if (error) throw error;

    return {
      logs: data,
      total: count || 0
    };
  }

  private async logAdminAction(
    action: string,
    entityType: string,
    entityId: string,
    newValues: any
  ): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    
    await supabase.from('admin_audit_logs').insert([{
      admin_id: user?.id,
      action,
      entity_type: entityType,
      entity_id: entityId,
      new_values: newValues,
      ip_address: '', // Would get from request
      user_agent: '' // Would get from request
    }]);
  }
}

export const adminService = new AdminService();
