// src/services/subscriptionService.ts
import Stripe from 'stripe';
import { supabase } from '../lib/supabase';
import process from 'process';

// Initialize Stripe with your secret key
const stripe = new Stripe(process.env.NEXT_PUBLIC_STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16'
});

export interface SubscriptionPlan {
  id: string;
  name: string;
  stripe_price_id: string;
  price_monthly: number;
  price_yearly: number;
  currency: string;
  features: Record<string, boolean>;
  max_users: number;
  max_storage_gb: number;
  max_bandwidth_gb: number;
  white_label: boolean;
  custom_domain: boolean;
  api_access: boolean;
  priority_support: boolean;
  mobile_money: boolean;
  advanced_analytics: boolean;
  custom_integrations: boolean;
  dedicated_support: boolean;
  sla_guarantee: string;
}

export interface OrganizationSubscription {
  id: string;
  organization_id: string;
  plan_id: string;
  stripe_subscription_id?: string;
  stripe_customer_id?: string;
  status: 'active' | 'past_due' | 'canceled' | 'incomplete' | 'trialing' | 'unpaid';
  current_period_start?: string;
  current_period_end?: string;
  cancel_at_period_end: boolean;
  trial_start?: string;
  trial_end?: string;
  billing_cycle: 'monthly' | 'yearly';
  payment_method?: 'card' | 'mobile_money' | 'bank_transfer';
  mobile_money_provider?: string;
  mobile_money_phone?: string;
}

export interface PaymentMethod {
  id: string;
  organization_id: string;
  stripe_payment_method_id?: string;
  type: 'card' | 'mobile_money' | 'bank_transfer';
  provider?: string;
  phone_number?: string;
  last4?: string;
  brand?: string;
  expiry_month?: number;
  expiry_year?: number;
  is_default: boolean;
}

export interface UsageMetric {
  id: string;
  organization_id: string;
  metric_type: string;
  metric_value: number;
  metric_date: string;
}

export interface BusinessMetric {
  id: string;
  date: string;
  mrr: number;
  arr: number;
  active_organizations: number;
  total_users: number;
  paid_organizations: number;
  free_organizations: number;
  trial_organizations: number;
  paid_conversion_rate: number;
  churn_rate: number;
  cac: number;
  ltv: number;
  nps_score?: number;
  average_revenue_per_customer: number;
}

export class SubscriptionService {
  
  // Get available subscription plans
  async getPlans(): Promise<SubscriptionPlan[]> {
    const { data, error } = await supabase
      .from('subscription_plans')
      .select('*')
      .order('price_monthly', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  // Get organization's current subscription
  async getOrganizationSubscription(organizationId: string): Promise<OrganizationSubscription | null> {
    const { data, error } = await supabase
      .from('organization_subscriptions')
      .select(`
        *,
        plan:subscription_plans(*)
      `)
      .eq('organization_id', organizationId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  // Create Stripe checkout session
  async createCheckoutSession(
    organizationId: string, 
    priceId: string, 
    isYearly: boolean = false,
    successUrl?: string,
    cancelUrl?: string
  ) {
    const { data: org } = await supabase
      .from('organizations')
      .select('name, email')
      .eq('id', organizationId)
      .single();

    if (!org) throw new Error('Organization not found');

    // Get the plan details
    const { data: plan } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('stripe_price_id', priceId)
      .single();

    if (!plan) throw new Error('Plan not found');

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{
        price: priceId,
        quantity: 1
      }],
      success_url: successUrl || `${process.env.NEXT_PUBLIC_APP_URL}/settings/billing?success=true`,
      cancel_url: cancelUrl || `${process.env.NEXT_PUBLIC_APP_URL}/settings/billing?canceled=true`,
      client_reference_id: organizationId,
      customer_email: org.email,
      metadata: {
        organization_id: organizationId,
        plan_id: plan.id,
        is_yearly: isYearly.toString()
      },
      subscription_data: {
        metadata: {
          organization_id: organizationId,
          plan_id: plan.id
        }
      }
    });

    return { url: session.url, sessionId: session.id };
  }

  // Create mobile money payment session
  async createMobileMoneySession(
    organizationId: string,
    planId: string,
    provider: 'mtn' | 'airtel',
    phoneNumber: string,
    amount: number
  ) {
    // This would integrate with local mobile money providers
    // For now, we'll create a pending payment record
    
    const { data, error } = await supabase
      .from('mobile_money_payments')
      .insert([{
        organization_id: organizationId,
        plan_id: planId,
        provider: provider,
        phone_number: phoneNumber,
        amount: amount,
        currency: 'RWF',
        status: 'pending',
        created_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) throw error;

    // In production, this would initiate the mobile money payment flow
    // For Rwanda: MTN Mobile Money or Airtel Money
    // For Kenya: M-PESA
    // For Uganda: MTN Mobile Money or Airtel Money
    
    return {
      paymentId: data.id,
      status: 'pending',
      instructions: `Please confirm the payment on your ${provider} mobile money app`
    };
  }

  // Handle Stripe webhook events
  async handleWebhook(event: Stripe.Event): Promise<void> {
    try {
      switch (event.type) {
        case 'checkout.session.completed':
          await this.handleCheckoutComplete(event.data.object as Stripe.Checkout.Session);
          break;
        case 'invoice.payment_succeeded':
          await this.handlePaymentSuccess(event.data.object as Stripe.Invoice);
          break;
        case 'invoice.payment_failed':
          await this.handlePaymentFailure(event.data.object as Stripe.Invoice);
          break;
        case 'customer.subscription.updated':
          await this.handleSubscriptionUpdate(event.data.object as Stripe.Subscription);
          break;
        case 'customer.subscription.deleted':
          await this.handleSubscriptionCancel(event.data.object as Stripe.Subscription);
          break;
        case 'customer.subscription.trial_will_end':
          await this.handleTrialEnding(event.data.object as Stripe.Subscription);
          break;
        default:
          console.log(`Unhandled event type: ${event.type}`);
      }
    } catch (error) {
      console.error('Webhook handling error:', error);
      throw error;
    }
  }

  private async handleCheckoutComplete(session: Stripe.Checkout.Session) {
    const organizationId = session.client_reference_id!;
    const subscriptionId = session.subscription as string;
    const planId = session.metadata?.plan_id;
    
    if (!organizationId || !subscriptionId || !planId) {
      console.error('Missing required metadata in checkout session');
      return;
    }

    // Get subscription details from Stripe
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    
    // Save subscription to database
    await supabase.from('organization_subscriptions').upsert({
      organization_id: organizationId,
      plan_id: planId,
      stripe_subscription_id: subscriptionId,
      stripe_customer_id: session.customer as string,
      status: subscription.status,
      current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      trial_start: subscription.trial_start ? new Date(subscription.trial_start * 1000).toISOString() : null,
      trial_end: subscription.trial_end ? new Date(subscription.trial_end * 1000).toISOString() : null,
      billing_cycle: subscription.items.data[0].recurring?.interval === 'year' ? 'yearly' : 'monthly'
    });

    // Start onboarding process
    await this.startOnboarding(organizationId);
  }

  private async handlePaymentSuccess(invoice: Stripe.Invoice) {
    if (!invoice.subscription || !invoice.customer) return;

    // Get organization from subscription
    const { data: subscription } = await supabase
      .from('organization_subscriptions')
      .select('organization_id')
      .eq('stripe_subscription_id', invoice.subscription)
      .single();

    if (!subscription) return;

    // Record invoice
    await supabase.from('subscription_invoices').insert([{
      organization_id: subscription.organization_id,
      subscription_id: invoice.subscription as string,
      stripe_invoice_id: invoice.id,
      amount_paid: invoice.amount_paid / 100,
      amount_due: invoice.amount_due / 100,
      currency: invoice.currency,
      status: invoice.status,
      invoice_pdf: invoice.invoice_pdf,
      hosted_invoice_url: invoice.hosted_invoice_url,
      period_start: new Date(invoice.period_start * 1000).toISOString(),
      period_end: new Date(invoice.period_end * 1000).toISOString(),
      due_date: invoice.due_date ? new Date(invoice.due_date * 1000).toISOString() : null,
      paid_at: invoice.status === 'paid' ? new Date().toISOString() : null
    }]);

    // Update subscription status if needed
    if (invoice.status === 'paid') {
      await supabase
        .from('organization_subscriptions')
        .update({ status: 'active' })
        .eq('stripe_subscription_id', invoice.subscription);
    }

    // Send receipt email
    await this.sendReceiptEmail(invoice);
  }

  private async handlePaymentFailure(invoice: Stripe.Invoice) {
    if (!invoice.subscription) return;

    // Update subscription status
    await supabase
      .from('organization_subscriptions')
      .update({ status: 'past_due' })
      .eq('stripe_subscription_id', invoice.subscription);

    // Send payment failure notification
    await this.sendPaymentFailureEmail(invoice);
  }

  private async handleSubscriptionUpdate(subscription: Stripe.Subscription) {
    await supabase
      .from('organization_subscriptions')
      .update({
        status: subscription.status,
        current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
        current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
        cancel_at_period_end: subscription.cancel_at_period_end
      })
      .eq('stripe_subscription_id', subscription.id);
  }

  private async handleSubscriptionCancel(subscription: Stripe.Subscription) {
    await supabase
      .from('organization_subscriptions')
      .update({ status: 'canceled' })
      .eq('stripe_subscription_id', subscription.id);
  }

  private async handleTrialEnding(subscription: Stripe.Subscription) {
    // Get organization details
    const { data: orgSubscription } = await supabase
      .from('organization_subscriptions')
      .select('organization_id')
      .eq('stripe_subscription_id', subscription.id)
      .single();

    if (orgSubscription) {
      // Send trial ending notification
      await this.sendTrialEndingEmail(orgSubscription.organization_id);
    }
  }

  // Cancel subscription
  async cancelSubscription(organizationId: string, immediate: boolean = false) {
    const { data: subscription } = await supabase
      .from('organization_subscriptions')
      .select('stripe_subscription_id')
      .eq('organization_id', organizationId)
      .single();

    if (!subscription?.stripe_subscription_id) {
      throw new Error('No active subscription found');
    }

    if (immediate) {
      // Cancel immediately
      await stripe.subscriptions.cancel(subscription.stripe_subscription_id);
    } else {
      // Cancel at period end
      await stripe.subscriptions.update(subscription.stripe_subscription_id, {
        cancel_at_period_end: true
      });
    }
  }

  // Update subscription plan
  async updateSubscriptionPlan(organizationId: string, newPriceId: string) {
    const { data: subscription } = await supabase
      .from('organization_subscriptions')
      .select('stripe_subscription_id')
      .eq('organization_id', organizationId)
      .single();

    if (!subscription?.stripe_subscription_id) {
      throw new Error('No active subscription found');
    }

    // Get current subscription
    const stripeSubscription = await stripe.subscriptions.retrieve(subscription.stripe_subscription_id);

    // Update subscription
    await stripe.subscriptions.update(subscription.stripe_subscription_id, {
      items: [{
        id: stripeSubscription.items.data[0].id,
        price: newPriceId
      }],
      proration_behavior: 'create_prorations'
    });
  }

  // Get payment methods
  async getPaymentMethods(organizationId: string): Promise<PaymentMethod[]> {
    const { data, error } = await supabase
      .from('payment_methods')
      .select('*')
      .eq('organization_id', organizationId)
      .order('is_default', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  // Add payment method
  async addPaymentMethod(organizationId: string, paymentMethodId: string) {
    // Retrieve payment method from Stripe
    const paymentMethod = await stripe.paymentMethods.retrieve(paymentMethodId);

    // Save to database
    const { data, error } = await supabase
      .from('payment_methods')
      .insert([{
        organization_id: organizationId,
        stripe_payment_method_id: paymentMethodId,
        type: paymentMethod.type,
        last4: paymentMethod.card?.last4,
        brand: paymentMethod.card?.brand,
        expiry_month: paymentMethod.card?.exp_month,
        expiry_year: paymentMethod.card?.exp_year
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Set default payment method
  async setDefaultPaymentMethod(organizationId: string, paymentMethodId: string) {
    // Unset all current defaults
    await supabase
      .from('payment_methods')
      .update({ is_default: false })
      .eq('organization_id', organizationId);

    // Set new default
    const { error } = await supabase
      .from('payment_methods')
      .update({ is_default: true })
      .eq('id', paymentMethodId)
      .eq('organization_id', organizationId);

    if (error) throw error;
  }

  // Get usage metrics
  async getUsageMetrics(organizationId: string, startDate?: string, endDate?: string): Promise<UsageMetric[]> {
    let query = supabase
      .from('usage_metrics')
      .select('*')
      .eq('organization_id', organizationId);

    if (startDate) {
      query = query.gte('metric_date', startDate);
    }
    if (endDate) {
      query = query.lte('metric_date', endDate);
    }

    query = query.order('metric_date', { ascending: false });

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  // Track usage
  async trackUsage(organizationId: string, metricType: string, metricValue: number) {
    const { error } = await supabase.rpc('track_usage', {
      p_organization_id: organizationId,
      p_metric_type: metricType,
      p_metric_value: metricValue
    });

    if (error) throw error;
  }

  // Get business metrics (admin only)
  async getBusinessMetrics(startDate?: string, endDate?: string): Promise<BusinessMetric[]> {
    let query = supabase
      .from('business_metrics')
      .select('*');

    if (startDate) {
      query = query.gte('date', startDate);
    }
    if (endDate) {
      query = query.lte('date', endDate);
    }

    query = query.order('date', { ascending: false });

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  // Update business metrics (admin only)
  async updateBusinessMetrics(date?: string) {
    const { error } = await supabase.rpc('update_business_metrics', {
      p_date: date || new Date().toISOString().split('T')[0]
    });

    if (error) throw error;
  }

  // Get invoices
  async getInvoices(organizationId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('subscription_invoices')
      .select('*')
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  // Start onboarding process
  private async startOnboarding(organizationId: string) {
    const checklist = [
      { task: 'Verify Email', completed: false },
      { task: 'Setup Organization Profile', completed: false },
      { task: 'Invite Team Members', completed: false },
      { task: 'Configure Departments', completed: false },
      { task: 'Setup Integrations', completed: false },
      { task: 'First Data Import', completed: false },
      { task: 'Team Training', completed: false },
      { task: 'Go Live', completed: false }
    ];

    await supabase.from('onboarding_checklists').insert([{
      organization_id: organizationId,
      checklist,
      current_step: 0,
      status: 'in_progress'
    }]);

    // Send welcome email
    await this.sendWelcomeEmail(organizationId);
  }

  // Email methods (implement with your email service)
  private async sendReceiptEmail(invoice: Stripe.Invoice) {
    // Implementation for sending receipt email
    console.log('Sending receipt email for invoice:', invoice.id);
  }

  private async sendPaymentFailureEmail(invoice: Stripe.Invoice) {
    // Implementation for sending payment failure notification
    console.log('Sending payment failure email for invoice:', invoice.id);
  }

  private async sendTrialEndingEmail(organizationId: string) {
    // Implementation for sending trial ending notification
    console.log('Sending trial ending email for organization:', organizationId);
  }

  private async sendWelcomeEmail(organizationId: string) {
    // Implementation for sending welcome email
    console.log('Sending welcome email for organization:', organizationId);
  }

  // Calculate MRR
  async calculateMRR(): Promise<number> {
    const { data, error } = await supabase.rpc('calculate_mrr');
    if (error) throw error;
    return data || 0;
  }

  // Check if organization has access to a feature
  async hasFeatureAccess(organizationId: string, feature: string): Promise<boolean> {
    const { data: subscription } = await supabase
      .from('organization_subscriptions')
      .select(`
        *,
        plan:subscription_plans(features)
      `)
      .eq('organization_id', organizationId)
      .eq('status', 'active')
      .single();

    if (!subscription || !subscription.plan) return false;

    const features = subscription.plan.features as Record<string, boolean>;
    return features[feature] || false;
  }

  // Get subscription limits
  async getSubscriptionLimits(organizationId: string) {
    const { data: subscription } = await supabase
      .from('organization_subscriptions')
      .select(`
        *,
        plan:subscription_plans(max_users, max_storage_gb, max_bandwidth_gb)
      `)
      .eq('organization_id', organizationId)
      .eq('status', 'active')
      .single();

    if (!subscription || !subscription.plan) {
      // Return default limits for free tier
      return {
        max_users: 5,
        max_storage_gb: 10,
        max_bandwidth_gb: 100
      };
    }

    return {
      max_users: subscription.plan.max_users,
      max_storage_gb: subscription.plan.max_storage_gb,
      max_bandwidth_gb: subscription.plan.max_bandwidth_gb
    };
  }
}

export const subscriptionService = new SubscriptionService();
