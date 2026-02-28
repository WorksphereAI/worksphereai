import Stripe from 'stripe';
import { supabase } from '../lib/supabase';

// Initialize Stripe with proper typing
const stripe = new Stripe(process.env.VITE_STRIPE_PUBLISHABLE_KEY!, {
  apiVersion: '2026-02-25.clover', // Use correct API version
  typescript: true,
});

// Define proper types for our service
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

interface CheckoutSessionResponse {
  id: string;
  url: string | null;
}

export class SubscriptionService {
  
  /**
   * Get all available subscription plans
   */
  async getPlans(): Promise<SubscriptionPlan[]> {
    const { data, error } = await supabase
      .from('subscription_plans')
      .select('*')
      .order('price_monthly', { ascending: true });

    if (error) {
      console.error('Error fetching plans:', error);
      throw new Error('Failed to fetch subscription plans');
    }

    return data || [];
  }

  /**
   * Get current subscription for an organization
   */
  async getCurrentSubscription(organizationId: string): Promise<OrganizationSubscription | null> {
    const { data, error } = await supabase
      .from('organization_subscriptions')
      .select(`
        *,
        subscription_plans (*)
      `)
      .eq('organization_id', organizationId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching subscription:', error);
      throw new Error('Failed to fetch subscription');
    }

    return data;
  }

  /**
   * Create a Stripe checkout session for subscription
   */
  async createCheckoutSession(
    organizationId: string,
    priceId: string,
    isYearly: boolean,
    successUrl: string,
    cancelUrl: string
  ): Promise<CheckoutSessionResponse> {
    try {
      // Get organization details
      const { data: org, error: orgError } = await supabase
        .from('organizations')
        .select('name, email')
        .eq('id', organizationId)
        .single();

      if (orgError || !org) {
        throw new Error('Organization not found');
      }

      // Create Stripe checkout session
      const session = await stripe.checkout.sessions.create({
        mode: 'subscription',
        payment_method_types: ['card'],
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        success_url: successUrl,
        cancel_url: cancelUrl,
        client_reference_id: organizationId,
        customer_email: org.email,
        metadata: {
          organization_id: organizationId,
          organization_name: org.name,
          billing_cycle: isYearly ? 'yearly' : 'monthly',
        },
      });

      if (!session.url) {
        throw new Error('Failed to create checkout session');
      }

      // Store checkout session in database
      await supabase.from('stripe_checkout_sessions').insert({
        organization_id: organizationId,
        stripe_session_id: session.id,
        price_id: priceId,
        billing_cycle: isYearly ? 'yearly' : 'monthly',
        status: 'pending',
        created_at: new Date().toISOString(),
      });

      return {
        id: session.id,
        url: session.url,
      };
    } catch (error) {
      console.error('Error creating checkout session:', error);
      throw new Error('Failed to create checkout session');
    }
  }

  /**
   * Handle Stripe webhook events
   */
  async handleWebhook(event: Stripe.Event): Promise<void> {
    try {
      switch (event.type) {
        case 'checkout.session.completed':
          await this.handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session);
          break;
          
        case 'invoice.payment_succeeded':
          await this.handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice);
          break;
          
        case 'invoice.payment_failed':
          await this.handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
          break;
          
        case 'customer.subscription.updated':
          await this.handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
          break;
          
        case 'customer.subscription.deleted':
          await this.handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
          break;
          
        case 'customer.subscription.trial_will_end':
          await this.handleTrialWillEnd(event.data.object as Stripe.Subscription);
          break;
          
        default:
          console.log(`Unhandled event type: ${event.type}`);
      }
    } catch (error) {
      console.error('Error handling webhook:', error);
      throw error;
    }
  }

  /**
   * Handle checkout.session.completed webhook
   */
  private async handleCheckoutSessionCompleted(session: Stripe.Checkout.Session): Promise<void> {
    const organizationId = session.client_reference_id;
    const subscriptionId = session.subscription as string;
    const customerId = session.customer as string;

    if (!organizationId || !subscriptionId || !customerId) {
      console.error('Missing required data in checkout session');
      return;
    }

    try {
      // Retrieve full subscription details from Stripe
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);
      
      // Get the price ID from the subscription items
      const priceId = subscription.items.data[0]?.price.id;
      
      // Find the matching plan in our database
      const { data: plan } = await supabase
        .from('subscription_plans')
        .select('id')
        .eq('stripe_price_id', priceId)
        .single();

      // Determine billing cycle from metadata or subscription
      const billingCycle = session.metadata?.billing_cycle || 
        (subscription.items.data[0]?.price.recurring?.interval === 'year' ? 'yearly' : 'monthly');

      // Create or update subscription in database
      await supabase.from('organization_subscriptions').upsert({
        organization_id: organizationId,
        stripe_subscription_id: subscriptionId,
        stripe_customer_id: customerId,
        plan_id: plan?.id,
        status: subscription.status,
        current_period_start: new Date((subscription as any).current_period_start * 1000).toISOString(),
        current_period_end: new Date((subscription as any).current_period_end * 1000).toISOString(),
        cancel_at_period_end: subscription.cancel_at_period_end,
        trial_start: subscription.trial_start ? new Date(subscription.trial_start * 1000).toISOString() : null,
        trial_end: subscription.trial_end ? new Date(subscription.trial_end * 1000).toISOString() : null,
        billing_cycle: billingCycle,
      });

      // Update checkout session status
      await supabase
        .from('stripe_checkout_sessions')
        .update({ 
          status: 'completed',
          completed_at: new Date().toISOString(),
        })
        .eq('stripe_session_id', session.id);

      console.log(`✅ Subscription created for organization ${organizationId}`);
    } catch (error) {
      console.error('Error processing checkout.session.completed:', error);
      
      // Log the error but don't throw to prevent webhook retries
      await supabase.from('webhook_errors').insert({
        event_type: 'checkout.session.completed',
        session_id: session.id,
        organization_id: organizationId,
        error: error instanceof Error ? error.message : 'Unknown error',
        created_at: new Date().toISOString(),
      });
    }
  }

  /**
   * Handle invoice.payment_succeeded webhook
   */
  private async handleInvoicePaymentSucceeded(invoice: Stripe.Invoice): Promise<void> {
    const subscriptionId = (invoice as any).subscription as string;

    if (!subscriptionId) return;

    try {
      // Get organization from subscription
      const { data: subscription } = await supabase
        .from('organization_subscriptions')
        .select('organization_id')
        .eq('stripe_subscription_id', subscriptionId)
        .single();

      if (!subscription) {
        console.log(`No subscription found for Stripe ID: ${subscriptionId}`);
        return;
      }

      // Store invoice in database
      await supabase.from('subscription_invoices').insert({
        organization_id: subscription.organization_id,
        stripe_invoice_id: invoice.id,
        amount_paid: invoice.amount_paid ? invoice.amount_paid / 100 : 0,
        amount_due: invoice.amount_due ? invoice.amount_due / 100 : 0,
        currency: invoice.currency?.toUpperCase() || 'USD',
        status: invoice.status || 'unknown',
        invoice_pdf: invoice.invoice_pdf || null,
        hosted_invoice_url: invoice.hosted_invoice_url || null,
        period_start: invoice.period_start ? new Date(invoice.period_start * 1000).toISOString() : null,
        period_end: invoice.period_end ? new Date(invoice.period_end * 1000).toISOString() : null,
        paid_at: new Date().toISOString(),
      });

      console.log(`✅ Invoice payment recorded for organization ${subscription.organization_id}`);
    } catch (error) {
      console.error('Error processing invoice.payment_succeeded:', error);
    }
  }

  /**
   * Handle invoice.payment_failed webhook
   */
  private async handleInvoicePaymentFailed(invoice: Stripe.Invoice): Promise<void> {
    const subscriptionId = (invoice as any).subscription as string;

    if (!subscriptionId) return;

    try {
      // Get organization from subscription
      const { data: subscription } = await supabase
        .from('organization_subscriptions')
        .select('organization_id')
        .eq('stripe_subscription_id', subscriptionId)
        .single();

      if (!subscription) return;

      // Update subscription status to past_due
      await supabase
        .from('organization_subscriptions')
        .update({ 
          status: 'past_due',
          updated_at: new Date().toISOString(),
        })
        .eq('stripe_subscription_id', subscriptionId);

      // Create notification for organization
      await supabase.from('notifications').insert({
        organization_id: subscription.organization_id,
        type: 'payment_failed',
        title: 'Payment Failed',
        message: 'Your recent payment failed. Please update your payment method to continue using all features.',
        severity: 'high',
        created_at: new Date().toISOString(),
      });

      console.log(`⚠️ Payment failed for organization ${subscription.organization_id}`);
    } catch (error) {
      console.error('Error processing invoice.payment_failed:', error);
    }
  }

  /**
   * Handle customer.subscription.updated webhook
   */
  private async handleSubscriptionUpdated(subscription: Stripe.Subscription): Promise<void> {
    try {
      // Update subscription in database
      await supabase
        .from('organization_subscriptions')
        .update({
          status: subscription.status,
          current_period_start: new Date((subscription as any).current_period_start * 1000).toISOString(),
          current_period_end: new Date((subscription as any).current_period_end * 1000).toISOString(),
          cancel_at_period_end: subscription.cancel_at_period_end,
          updated_at: new Date().toISOString(),
        })
        .eq('stripe_subscription_id', subscription.id);

      console.log(`✅ Subscription updated: ${subscription.id}`);
    } catch (error) {
      console.error('Error processing customer.subscription.updated:', error);
    }
  }

  /**
   * Handle customer.subscription.deleted webhook
   */
  private async handleSubscriptionDeleted(subscription: Stripe.Subscription): Promise<void> {
    try {
      // Update subscription status to canceled
      await supabase
        .from('organization_subscriptions')
        .update({
          status: 'canceled',
          updated_at: new Date().toISOString(),
        })
        .eq('stripe_subscription_id', subscription.id);

      console.log(`✅ Subscription canceled: ${subscription.id}`);
    } catch (error) {
      console.error('Error processing customer.subscription.deleted:', error);
    }
  }

  /**
   * Handle customer.subscription.trial_will_end webhook
   */
  private async handleTrialWillEnd(subscription: Stripe.Subscription): Promise<void> {
    try {
      // Get organization from subscription
      const { data: orgSub } = await supabase
        .from('organization_subscriptions')
        .select('organization_id')
        .eq('stripe_subscription_id', subscription.id)
        .single();

      if (!orgSub) return;

      // Create notification about trial ending
      await supabase.from('notifications').insert({
        organization_id: orgSub.organization_id,
        type: 'trial_ending',
        title: 'Trial Period Ending Soon',
        message: 'Your free trial will end in 3 days. Add a payment method to continue using all features.',
        severity: 'medium',
        created_at: new Date().toISOString(),
      });

      console.log(`⚠️ Trial ending soon for organization ${orgSub.organization_id}`);
    } catch (error) {
      console.error('Error processing customer.subscription.trial_will_end:', error);
    }
  }

  /**
   * Cancel a subscription
   */
  async cancelSubscription(subscriptionId: string, cancelAtPeriodEnd: boolean = true): Promise<void> {
    try {
      if (cancelAtPeriodEnd) {
        // Cancel at period end
        await stripe.subscriptions.update(subscriptionId, {
          cancel_at_period_end: true,
        });
      } else {
        // Cancel immediately
        await stripe.subscriptions.cancel(subscriptionId);
      }

      // Update local database
      await supabase
        .from('organization_subscriptions')
        .update({
          cancel_at_period_end: cancelAtPeriodEnd,
          status: cancelAtPeriodEnd ? 'active' : 'canceled',
          updated_at: new Date().toISOString(),
        })
        .eq('stripe_subscription_id', subscriptionId);

      console.log(`✅ Subscription cancellation initiated: ${subscriptionId}`);
    } catch (error) {
      console.error('Error canceling subscription:', error);
      throw new Error('Failed to cancel subscription');
    }
  }

  /**
   * Update payment method
   */
  async updatePaymentMethod(
    customerId: string,
    paymentMethodId: string,
    organizationId: string
  ): Promise<void> {
    try {
      // Attach payment method to customer
      await stripe.paymentMethods.attach(paymentMethodId, {
        customer: customerId,
      });

      // Set as default payment method
      await stripe.customers.update(customerId, {
        invoice_settings: {
          default_payment_method: paymentMethodId,
        },
      });

      // Store payment method in database
      const paymentMethod = await stripe.paymentMethods.retrieve(paymentMethodId);
      
      await supabase.from('payment_methods').upsert({
        organization_id: organizationId,
        stripe_payment_method_id: paymentMethodId,
        type: paymentMethod.type,
        provider: paymentMethod.type === 'card' ? 'card' : 'other',
        last4: paymentMethod.card?.last4 || null,
        brand: paymentMethod.card?.brand || null,
        expiry_month: paymentMethod.card?.exp_month || null,
        expiry_year: paymentMethod.card?.exp_year || null,
        is_default: true,
        updated_at: new Date().toISOString(),
      });

      console.log(`✅ Payment method updated for organization ${organizationId}`);
    } catch (error) {
      console.error('Error updating payment method:', error);
      throw new Error('Failed to update payment method');
    }
  }

  /**
   * Get subscription usage metrics
   */
  async getUsageMetrics(organizationId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('usage_metrics')
      .select('*')
      .eq('organization_id', organizationId)
      .order('metric_date', { ascending: false })
      .limit(30);

    if (error) {
      console.error('Error fetching usage metrics:', error);
      throw new Error('Failed to fetch usage metrics');
    }

    return data || [];
  }

  /**
   * Track usage for billing
   */
  async trackUsage(
    organizationId: string,
    metricType: string,
    metricValue: number,
    metricDate: Date = new Date()
  ): Promise<void> {
    try {
      const dateStr = metricDate.toISOString().split('T')[0];

      await supabase.rpc('track_usage', {
        p_organization_id: organizationId,
        p_metric_type: metricType,
        p_metric_value: metricValue,
        p_metric_date: dateStr,
      });
    } catch (error) {
      console.error('Error tracking usage:', error);
      // Don't throw - usage tracking should not block operations
    }
  }

  /**
   * Get subscription invoices
   */
  async getInvoices(organizationId: string, limit: number = 10): Promise<any[]> {
    const { data, error } = await supabase
      .from('subscription_invoices')
      .select('*')
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching invoices:', error);
      throw new Error('Failed to fetch invoices');
    }

    return data || [];
  }
}

export const subscriptionService = new SubscriptionService();
