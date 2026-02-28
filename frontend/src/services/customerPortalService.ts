// src/services/customerPortalService.ts
import { supabase } from '../lib/supabase';

export interface SupportTicket {
  id: string;
  ticket_number: string;
  subject: string;
  description: string;
  status: 'open' | 'in_progress' | 'waiting' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: string;
  created_at: string;
  updated_at: string;
}

export interface TicketMessage {
  id: string;
  ticket_id: string;
  message: string;
  sender_type: 'customer' | 'agent' | 'system';
  sender_name: string;
  attachments: any[];
  created_at: string;
}

export interface KnowledgeBaseArticle {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  views: number;
  helpful_count: number;
}

export class CustomerPortalService {
  
  // ========== TICKET MANAGEMENT ==========
  
  async createTicket(ticket: Partial<SupportTicket>): Promise<SupportTicket> {
    const { data, error } = await supabase
      .from('support_tickets')
      .insert([{
        ...ticket,
        organization_id: await this.getOrganizationId(),
        customer_id: await this.getCustomerId()
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getTickets(filters?: {
    status?: string;
    priority?: string;
    search?: string;
  }): Promise<SupportTicket[]> {
    let query = supabase
      .from('support_tickets')
      .select('*')
      .order('created_at', { ascending: false });

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }
    if (filters?.priority) {
      query = query.eq('priority', filters.priority);
    }
    if (filters?.search) {
      query = query.or(`subject.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  async getTicketDetails(ticketId: string): Promise<SupportTicket> {
    const { data, error } = await supabase
      .from('support_tickets')
      .select('*')
      .eq('id', ticketId)
      .single();

    if (error) throw error;
    return data;
  }

  // ========== TICKET MESSAGES ==========

  async getTicketMessages(ticketId: string): Promise<TicketMessage[]> {
    const { data, error } = await supabase
      .from('ticket_messages')
      .select('*')
      .eq('ticket_id', ticketId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  async addTicketMessage(ticketId: string, message: string, attachments?: File[]): Promise<TicketMessage> {
    // Upload attachments if any
    const attachmentUrls = await this.uploadAttachments(attachments);

    const { data, error } = await supabase
      .from('ticket_messages')
      .insert([{
        ticket_id: ticketId,
        message: message,
        sender_type: 'customer',
        sender_id: await this.getCustomerId(),
        sender_name: await this.getCustomerName(),
        attachments: attachmentUrls
      }])
      .select()
      .single();

    if (error) throw error;

    // Update ticket status
    await supabase
      .from('support_tickets')
      .update({ status: 'in_progress', updated_at: new Date().toISOString() })
      .eq('id', ticketId);

    return data;
  }

  // ========== KNOWLEDGE BASE ==========

  async searchKnowledgeBase(query: string): Promise<KnowledgeBaseArticle[]> {
    const { data, error } = await supabase
      .from('knowledge_base_articles')
      .select('*')
      .or(`title.ilike.%${query}%,content.ilike.%${query}%`)
      .eq('is_published', true)
      .order('views', { ascending: false })
      .limit(20);

    if (error) throw error;
    return data || [];
  }

  async getArticleBySlug(slug: string): Promise<KnowledgeBaseArticle | null> {
    const { data, error } = await supabase
      .from('knowledge_base_articles')
      .select('*')
      .eq('slug', slug)
      .eq('is_published', true)
      .single();

    if (error) return null;

    // Increment view count
    await supabase
      .from('knowledge_base_articles')
      .update({ views: (data.views || 0) + 1 })
      .eq('id', data.id);

    return data;
  }

  async markArticleHelpful(articleId: string, helpful: boolean) {
    const field = helpful ? 'helpful_count' : 'not_helpful_count';
    await supabase
      .from('knowledge_base_articles')
      .update({ [field]: supabase.rpc('increment') })
      .eq('id', articleId);
  }

  // ========== CUSTOMER DOCUMENTS ==========

  async uploadDocument(file: File, type: string): Promise<string> {
    // For now, return a mock URL - in production, integrate with Cloudinary
    const mockUrl = `https://example.com/documents/${file.name}`;
    
    // Save to database
    await supabase.from('customer_documents').insert([{
      organization_id: await this.getOrganizationId(),
      customer_id: await this.getCustomerId(),
      name: file.name,
      url: mockUrl,
      public_id: `doc_${Date.now()}`,
      type: type,
      size: file.size,
      uploaded_by: await this.getCustomerId(),
      uploaded_by_type: 'customer'
    }]);

    return mockUrl;
  }

  async getCustomerDocuments(): Promise<any[]> {
    const { data, error } = await supabase
      .from('customer_documents')
      .select('*')
      .eq('customer_id', await this.getCustomerId())
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  // ========== FEEDBACK ==========

  async submitFeedback(feedback: {
    ticketId?: string;
    rating: number;
    feedback: string;
    category?: string;
  }) {
    const { error } = await supabase.from('customer_feedback').insert([{
      organization_id: await this.getOrganizationId(),
      customer_id: await this.getCustomerId(),
      ticket_id: feedback.ticketId,
      rating: feedback.rating,
      feedback: feedback.feedback,
      category: feedback.category
    }]);

    if (error) throw error;
  }

  // ========== DASHBOARD STATS ==========

  async getDashboardStats(): Promise<{
    totalTickets: number;
    openTickets: number;
    resolvedTickets: number;
    documents: number;
    avgResponseTime: string;
  }> {
    const customerId = await this.getCustomerId();
    
    const { data: tickets } = await supabase
      .from('support_tickets')
      .select('status, created_at, resolved_at')
      .eq('customer_id', customerId);

    const { data: documents } = await supabase
      .from('customer_documents')
      .select('id')
      .eq('customer_id', customerId);

    const totalTickets = tickets?.length || 0;
    const openTickets = tickets?.filter(t => !['resolved', 'closed'].includes(t.status)).length || 0;
    const resolvedTickets = tickets?.filter(t => ['resolved', 'closed'].includes(t.status)).length || 0;
    const documentCount = documents?.length || 0;

    // Calculate average response time (mock calculation for now)
    const avgResponseTime = '2.5 hours';

    return {
      totalTickets,
      openTickets,
      resolvedTickets,
      documents: documentCount,
      avgResponseTime
    };
  }

  // ========== CUSTOMER AUTH ==========

  async registerCustomer(customerData: {
    email: string;
    password: string;
    company_name: string;
    contact_person: string;
    phone?: string;
  }) {
    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: customerData.email,
      password: customerData.password
    });

    if (authError) throw authError;

    // Create customer record
    const { error: customerError } = await supabase
      .from('external_users')
      .insert([{
        email: customerData.email,
        company_name: customerData.company_name,
        contact_person: customerData.contact_person,
        phone: customerData.phone,
        organization_id: await this.getOrganizationId()
      }]);

    if (customerError) throw customerError;

    return authData;
  }

  // ========== HELPER METHODS ==========

  private async getOrganizationId(): Promise<string> {
    // For customer portal, we'll use a default organization or get it from context
    const { data } = await supabase
      .from('organizations')
      .select('id')
      .eq('slug', 'worksphere-technologies')
      .single();
    
    return data?.id || '';
  }

  private async getCustomerId(): Promise<string> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');
    
    const { data } = await supabase
      .from('external_users')
      .select('id')
      .eq('email', user.email)
      .single();
    
    if (!data) throw new Error('Customer not found');
    return data.id;
  }

  private async getCustomerName(): Promise<string> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return 'Customer';
    
    const { data } = await supabase
      .from('external_users')
      .select('contact_person, company_name')
      .eq('email', user.email)
      .single();
    
    return data?.contact_person || data?.company_name || 'Customer';
  }

  private async uploadAttachments(files?: File[]): Promise<any[]> {
    if (!files || files.length === 0) return [];

    const uploadPromises = files.map(async (file) => {
      const url = await this.uploadDocument(file, 'attachment');
      return { name: file.name, url, type: file.type };
    });

    return await Promise.all(uploadPromises);
  }
}

export const customerPortal = new CustomerPortalService();
