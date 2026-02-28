// src/services/salesPipelineService.ts
import { supabase } from '../lib/supabase';

export interface SalesLead {
  id: string;
  company_name: string;
  contact_name: string;
  contact_email: string;
  contact_phone?: string;
  industry?: string;
  employee_count?: number;
  current_solution?: string;
  pain_points?: string;
  budget?: number;
  timeline?: string;
  status: 'new' | 'contacted' | 'qualified' | 'demo' | 'proposal' | 'negotiation' | 'closed_won' | 'closed_lost';
  source: 'website' | 'referral' | 'partner' | 'outbound' | 'event' | 'cold_email' | 'social';
  assigned_to?: string;
  estimated_value?: number;
  probability?: number;
  notes?: string;
  next_followup?: string;
  created_at: string;
  updated_at: string;
}

export interface SalesActivity {
  id: string;
  lead_id: string;
  activity_type: 'call' | 'email' | 'meeting' | 'demo' | 'proposal' | 'note';
  subject: string;
  description?: string;
  duration_minutes?: number;
  outcome?: string;
  next_step?: string;
  created_by: string;
  created_at: string;
}

export interface Partner {
  id: string;
  company_name: string;
  contact_name: string;
  contact_email: string;
  contact_phone?: string;
  partner_type: 'reseller' | 'implementer' | 'referral' | 'technology' | 'strategic';
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  commission_rate: number;
  total_revenue: number;
  customers_referred: number;
  status: 'pending' | 'active' | 'inactive';
  agreement_signed_at?: string;
  territory?: string;
  specialties?: string[];
  created_at: string;
  updated_at: string;
}

export interface PartnerCommission {
  id: string;
  partner_id: string;
  organization_id: string;
  subscription_id?: string;
  amount: number;
  rate: number;
  status: 'pending' | 'approved' | 'paid';
  paid_at?: string;
  created_at: string;
}

export class SalesPipelineService {
  
  // Lead Management
  async createLead(lead: Partial<SalesLead>): Promise<SalesLead> {
    const { data, error } = await supabase
      .from('sales_leads')
      .insert([{
        ...lead,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) throw error;
    
    // Send notification to sales team
    await this.notifySalesTeam(data);
    
    return data;
  }

  async getLeads(filters?: {
    status?: SalesLead['status'];
    assigned_to?: string;
    source?: SalesLead['source'];
  }): Promise<SalesLead[]> {
    let query = supabase
      .from('sales_leads')
      .select('*')
      .order('created_at', { ascending: false });

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }
    if (filters?.assigned_to) {
      query = query.eq('assigned_to', filters.assigned_to);
    }
    if (filters?.source) {
      query = query.eq('source', filters.source);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  async updateLeadStatus(leadId: string, status: SalesLead['status'], notes?: string): Promise<void> {
    const { error } = await supabase
      .from('sales_leads')
      .update({ 
        status, 
        notes,
        updated_at: new Date().toISOString()
      })
      .eq('id', leadId);

    if (error) throw error;
  }

  async updateLead(leadId: string, updates: Partial<SalesLead>): Promise<SalesLead> {
    const { data, error } = await supabase
      .from('sales_leads')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', leadId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async assignLead(leadId: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from('sales_leads')
      .update({
        assigned_to: userId,
        updated_at: new Date().toISOString()
      })
      .eq('id', leadId);

    if (error) throw error;
  }

  // Activity Management
  async createActivity(activity: Partial<SalesActivity>): Promise<SalesActivity> {
    const { data, error } = await supabase
      .from('sales_activities')
      .insert([{
        ...activity,
        created_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getLeadActivities(leadId: string): Promise<SalesActivity[]> {
    const { data, error } = await supabase
      .from('sales_activities')
      .select('*')
      .eq('lead_id', leadId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  // Demo Scheduling
  async scheduleDemo(leadId: string, demoDate: Date, salesPersonId: string): Promise<void> {
    const { data: lead } = await supabase
      .from('sales_leads')
      .select('*')
      .eq('id', leadId)
      .single();

    if (!lead) throw new Error('Lead not found');

    // Create demo activity
    await this.createActivity({
      lead_id: leadId,
      activity_type: 'demo',
      subject: `Demo: ${lead.company_name}`,
      description: 'Product demonstration for the team',
      duration_minutes: 60,
      created_by: salesPersonId
    });

    // Update lead status
    await this.updateLeadStatus(leadId, 'demo');
    
    // Send confirmation emails
    await this.sendDemoConfirmation(lead, demoDate, salesPersonId);
  }

  // Pipeline Analytics
  async generatePipelineReport(): Promise<any> {
    const { data: leadsByStatus } = await supabase
      .from('sales_leads')
      .select('status')
      .order('status');

    const statusCounts = leadsByStatus?.reduce((acc, lead) => {
      acc[lead.status] = (acc[lead.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>) || {};

    const totalLeads = Object.values(statusCounts).reduce((sum, count) => sum + count, 0);
    const conversionRate = await this.calculateConversionRate();
    const averageDealSize = await this.getAverageDealSize();
    const salesVelocity = await this.calculateSalesVelocity();

    return {
      totalLeads,
      byStatus: statusCounts,
      conversionRate,
      averageDealSize,
      salesVelocity,
      pipelineValue: await this.calculatePipelineValue()
    };
  }

  async calculateConversionRate(): Promise<number> {
    const { data: totalLeads } = await supabase
      .from('sales_leads')
      .select('id')
      .eq('status', 'new');

    const { data: wonLeads } = await supabase
      .from('sales_leads')
      .select('id')
      .eq('status', 'closed_won');

    if (!totalLeads || totalLeads.length === 0) return 0;
    return (wonLeads?.length || 0) / totalLeads.length * 100;
  }

  async getAverageDealSize(): Promise<number> {
    const { data } = await supabase
      .from('sales_leads')
      .select('estimated_value')
      .eq('status', 'closed_won')
      .not('estimated_value', 'is', null);

    if (!data || data.length === 0) return 0;
    
    const total = data.reduce((sum, lead) => sum + (lead.estimated_value || 0), 0);
    return total / data.length;
  }

  async calculateSalesVelocity(): Promise<number> {
    // Calculate average time from lead to close
    const { data } = await supabase
      .from('sales_leads')
      .select('created_at, updated_at')
      .eq('status', 'closed_won');

    if (!data || data.length === 0) return 0;

    const totalDays = data.reduce((sum, lead) => {
      const created = new Date(lead.created_at);
      const closed = new Date(lead.updated_at);
      return sum + (closed.getTime() - created.getTime()) / (1000 * 60 * 60 * 24);
    }, 0);

    return totalDays / data.length;
  }

  async calculatePipelineValue(): Promise<number> {
    const { data } = await supabase
      .from('sales_leads')
      .select('estimated_value, probability')
      .in('status', ['qualified', 'demo', 'proposal', 'negotiation'])
      .not('estimated_value', 'is', null);

    if (!data || data.length === 0) return 0;

    return data.reduce((sum, lead) => {
      return sum + ((lead.estimated_value || 0) * ((lead.probability || 0) / 100));
    }, 0);
  }

  // Partner Management
  async createPartner(partner: Partial<Partner>): Promise<Partner> {
    const { data, error } = await supabase
      .from('partners')
      .insert([{
        ...partner,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getPartners(filters?: {
    status?: Partner['status'];
    tier?: Partner['tier'];
    partner_type?: Partner['partner_type'];
  }): Promise<Partner[]> {
    let query = supabase
      .from('partners')
      .select('*')
      .order('created_at', { ascending: false });

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }
    if (filters?.tier) {
      query = query.eq('tier', filters.tier);
    }
    if (filters?.partner_type) {
      query = query.eq('partner_type', filters.partner_type);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  async updatePartner(partnerId: string, updates: Partial<Partner>): Promise<Partner> {
    const { data, error } = await supabase
      .from('partners')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', partnerId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Commission Management
  async createCommission(commission: Partial<PartnerCommission>): Promise<PartnerCommission> {
    const { data, error } = await supabase
      .from('partner_commissions')
      .insert([{
        ...commission,
        created_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getPartnerCommissions(partnerId: string): Promise<PartnerCommission[]> {
    const { data, error } = await supabase
      .from('partner_commissions')
      .select('*')
      .eq('partner_id', partnerId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async approveCommission(commissionId: string): Promise<void> {
    const { error } = await supabase
      .from('partner_commissions')
      .update({ status: 'approved' })
      .eq('id', commissionId);

    if (error) throw error;
  }

  async payCommission(commissionId: string): Promise<void> {
    const { error } = await supabase
      .from('partner_commissions')
      .update({ 
        status: 'paid',
        paid_at: new Date().toISOString()
      })
      .eq('id', commissionId);

    if (error) throw error;
  }

  // Notification Methods
  private async notifySalesTeam(lead: SalesLead): Promise<void> {
    // Send notification to sales team about new lead
    // This could integrate with Slack, email, or other notification systems
    console.log('New lead notification:', lead);
  }

  private async sendDemoConfirmation(lead: SalesLead, _demoDate: Date, _salesPersonId: string): Promise<void> {
    // Send demo confirmation email to lead and sales person
    console.log('Demo confirmation sent for:', lead.company_name);
  }

  // Lead Scoring
  async calculateLeadScore(leadId: string): Promise<number> {
    const { data: lead } = await supabase
      .from('sales_leads')
      .select('*')
      .eq('id', leadId)
      .single();

    if (!lead) return 0;

    let score = 0;

    // Budget scoring
    if (lead.budget) {
      if (lead.budget >= 100000) score += 30; // High budget
      else if (lead.budget >= 50000) score += 20; // Medium budget
      else if (lead.budget >= 10000) score += 10; // Low budget
    }

    // Company size scoring
    if (lead.employee_count) {
      if (lead.employee_count >= 500) score += 25; // Enterprise
      else if (lead.employee_count >= 100) score += 20; // Large business
      else if (lead.employee_count >= 50) score += 15; // Medium business
      else if (lead.employee_count >= 10) score += 10; // Small business
    }

    // Timeline scoring
    if (lead.timeline) {
      if (lead.timeline.includes('immediate')) score += 20;
      else if (lead.timeline.includes('month')) score += 15;
      else if (lead.timeline.includes('quarter')) score += 10;
    }

    // Source scoring
    switch (lead.source) {
      case 'referral': score += 15; break;
      case 'partner': score += 12; break;
      case 'event': score += 10; break;
      case 'website': score += 8; break;
      case 'social': score += 5; break;
      case 'cold_email': score += 2; break;
      case 'outbound': score += 1; break;
    }

    // Industry scoring (prioritize high-value industries)
    const highValueIndustries = ['technology', 'finance', 'healthcare', 'manufacturing', 'retail'];
    if (lead.industry && highValueIndustries.includes(lead.industry.toLowerCase())) {
      score += 10;
    }

    return Math.min(score, 100);
  }

  // Forecasting
  async generateRevenueForecast(months: number = 6): Promise<any> {
    const { data: closedDeals } = await supabase
      .from('sales_leads')
      .select('estimated_value, updated_at')
      .eq('status', 'closed_won')
      .order('updated_at', { ascending: false })
      .limit(12);

    const { data: pipelineDeals } = await supabase
      .from('sales_leads')
      .select('estimated_value, probability, status')
      .in('status', ['qualified', 'demo', 'proposal', 'negotiation']);

    if (!closedDeals || !pipelineDeals) {
      return { forecast: [], confidence: 0 };
    }

    // Calculate historical win rate and deal size
    const recentDeals = closedDeals.slice(0, 6);
    const avgDealSize = recentDeals.reduce((sum, deal) => sum + (deal.estimated_value || 0), 0) / recentDeals.length;
    console.log('Average deal size for forecasting:', avgDealSize); // Debug log
    
    // Calculate probability-weighted pipeline value
    const pipelineValue = pipelineDeals.reduce((sum, deal) => {
      return sum + ((deal.estimated_value || 0) * ((deal.probability || 0) / 100));
    }, 0);

    // Generate forecast (simplified)
    const forecast = [];
    for (let i = 1; i <= months; i++) {
      const monthForecast = {
        month: i,
        predictedRevenue: pipelineValue / months,
        confidence: Math.max(0.3, 1 - (i * 0.1)), // Decreasing confidence over time
        factors: ['Historical win rate', 'Pipeline value', 'Seasonal trends']
      };
      forecast.push(monthForecast);
    }

    return {
      forecast,
      confidence: 0.75,
      assumptions: [
        'Based on recent 6-month performance',
        'Weighted by deal probability',
        'Assumes consistent sales cycle'
      ]
    };
  }

  // Activity Automation
  async scheduleFollowUp(leadId: string, daysFromNow: number, activityType: SalesActivity['activity_type'], subject: string): Promise<void> {
    const followUpDate = new Date();
    followUpDate.setDate(followUpDate.getDate() + daysFromNow);

    await this.createActivity({
      lead_id: leadId,
      activity_type: activityType,
      subject,
      description: `Scheduled follow-up for ${followUpDate.toDateString()}`,
      created_by: 'system' // This would be the actual user ID in production
    });
  }

  // Lead Nurturing
  async nurtureLead(leadId: string): Promise<void> {
    const { data: lead } = await supabase
      .from('sales_leads')
      .select('*')
      .eq('id', leadId)
      .single();

    if (!lead) return;

    // Send nurturing content based on lead status and profile
    switch (lead.status) {
      case 'new':
        await this.sendWelcomeSequence(lead);
        break;
      case 'contacted':
        await this.sendEducationalContent(lead);
        break;
      case 'qualified':
        await this.sendCaseStudies(lead);
        break;
      case 'demo':
        await this.sendDemoPrep(lead);
        break;
      case 'proposal':
        await this.sendProposalFollowUp(lead);
        break;
    }
  }

  private async sendWelcomeSequence(lead: SalesLead): Promise<void> {
    // Send welcome email sequence
    console.log('Sending welcome sequence to:', lead.contact_email);
  }

  private async sendEducationalContent(lead: SalesLead): Promise<void> {
    // Send educational content based on industry
    console.log('Sending educational content to:', lead.contact_email);
  }

  private async sendCaseStudies(lead: SalesLead): Promise<void> {
    // Send relevant case studies
    console.log('Sending case studies to:', lead.contact_email);
  }

  private async sendDemoPrep(lead: SalesLead): Promise<void> {
    // Send demo preparation materials
    console.log('Sending demo prep to:', lead.contact_email);
  }

  private async sendProposalFollowUp(lead: SalesLead): Promise<void> {
    // Send proposal follow-up
    console.log('Sending proposal follow-up to:', lead.contact_email);
  }
}

export const salesPipelineService = new SalesPipelineService();
