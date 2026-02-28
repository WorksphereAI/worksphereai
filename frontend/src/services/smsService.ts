// src/services/smsService.ts
import { supabase } from '../lib/supabase';
import { v4 as uuidv4 } from 'uuid';

export interface SMSVerification {
  id?: string;
  phone: string;
  code: string;
  user_id?: string;
  status: 'pending' | 'verified' | 'expired';
  attempts: number;
  max_attempts: number;
  expires_at: string;
  verified_at?: string;
}

export interface SMSTemplate {
  to: string;
  message: string;
  from?: string;
}

class SMSService {
  private readonly apiKey = import.meta.env.VITE_AT_API_KEY;
  private readonly username = import.meta.env.VITE_AT_USERNAME;
  private readonly baseUrl = 'https://api.africastalking.com/version1/messaging';

  // ============================================
  // PHONE VERIFICATION
  // ============================================

  async createPhoneVerification(phone: string, userId?: string): Promise<SMSVerification> {
    try {
      const code = this.generateVerificationCode();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 minutes

      // Store verification in database
      const { data, error } = await supabase
        .from('phone_verifications')
        .insert({
          phone,
          code,
          user_id: userId,
          status: 'pending',
          attempts: 0,
          max_attempts: 5,
          expires_at: expiresAt
        })
        .select()
        .single();

      if (error) throw error;

      // Send SMS with verification code
      await this.sendVerificationSMS(phone, code);

      return data;
    } catch (error) {
      console.error('Error creating phone verification:', error);
      throw error;
    }
  }

  async verifyPhone(phone: string, code: string): Promise<boolean> {
    try {
      // Get the verification record
      const { data: verification, error } = await supabase
        .from('phone_verifications')
        .select('*')
        .eq('phone', phone)
        .eq('code', code)
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          throw new Error('Invalid verification code');
        }
        throw error;
      }

      // Check if expired
      if (new Date(verification.expires_at) < new Date()) {
        await supabase
          .from('phone_verifications')
          .update({ status: 'expired' })
          .eq('id', verification.id);
        throw new Error('Verification code has expired');
      }

      // Check attempts
      if (verification.attempts >= verification.max_attempts) {
        await supabase
          .from('phone_verifications')
          .update({ status: 'expired' })
          .eq('id', verification.id);
        throw new Error('Too many verification attempts');
      }

      // Increment attempts and mark as verified
      await supabase
        .from('phone_verifications')
        .update({ 
          attempts: verification.attempts + 1,
          status: 'verified',
          verified_at: new Date().toISOString()
        })
        .eq('id', verification.id);

      return true;
    } catch (error) {
      console.error('Error verifying phone:', error);
      throw error;
    }
  }

  async resendPhoneVerification(phone: string): Promise<SMSVerification> {
    try {
      // Delete existing pending verifications
      await supabase
        .from('phone_verifications')
        .delete()
        .eq('phone', phone)
        .eq('status', 'pending');

      // Create new verification
      return await this.createPhoneVerification(phone);
    } catch (error) {
      console.error('Error resending phone verification:', error);
      throw error;
    }
  }

  // ============================================
  // SMS SENDING
  // ============================================

  async sendSMS(template: SMSTemplate): Promise<boolean> {
    try {
      if (!this.apiKey || !this.username) {
        console.warn('Africa\'s Talking credentials not configured');
        return false;
      }

      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json',
        },
        body: new URLSearchParams({
          username: this.username,
          to: template.to,
          message: template.message,
          from: template.from || 'WorkSphereAI'
        })
      });

      if (!response.ok) {
        throw new Error(`SMS sending failed: ${response.statusText}`);
      }

      const result = await response.json();
      
      // Log SMS for analytics
      await this.logSMS(template.to, template.message, result);

      return true;
    } catch (error) {
      console.error('Error sending SMS:', error);
      throw error;
    }
  }

  async sendVerificationSMS(phone: string, code: string): Promise<boolean> {
    const message = `Your WorkSphere AI verification code is: ${code}. This code expires in 10 minutes. Do not share this code with anyone.`;
    
    return await this.sendSMS({
      to: phone,
      message
    });
  }

  async sendWelcomeSMS(phone: string, name: string, userType: string): Promise<boolean> {
    const message = `Welcome to WorkSphere AI, ${name}! Your ${userType} account is ready. Log in to start transforming the way you work. Reply HELP for support.`;
    
    return await this.sendSMS({
      to: phone,
      message
    });
  }

  async sendInvitationSMS(phone: string, inviterName: string, organizationName: string): Promise<boolean> {
    const message = `${inviterName} has invited you to join ${organizationName} on WorkSphere AI! Reply ACCEPT to join or DECLINE to pass. Link: worksphere.ai/join`;
    
    return await this.sendSMS({
      to: phone,
      message
    });
  }

  async sendAlertSMS(phone: string, message: string): Promise<boolean> {
    const alertMessage = `WorkSphere AI Alert: ${message}. Reply STOP to unsubscribe from alerts.`;
    
    return await this.sendSMS({
      to: phone,
      message: alertMessage
    });
  }

  // ============================================
  // BULK SMS
  // ============================================

  async sendBulkSMS(phones: string[], message: string): Promise<{ success: string[], failed: string[] }> {
    const results = { success: [], failed: [] };

    for (const phone of phones) {
      try {
        await this.sendSMS({ to: phone, message });
        results.success.push(phone);
      } catch (error) {
        console.error(`Failed to send SMS to ${phone}:`, error);
        results.failed.push(phone);
      }
    }

    return results;
  }

  // ============================================
  // SMS TEMPLATES
  // ============================================

  getVerificationTemplate(code: string): string {
    return `Your WorkSphere AI verification code is: ${code}. This code expires in 10 minutes. Do not share this code with anyone.`;
  }

  getWelcomeTemplate(name: string, userType: string): string {
    return `Welcome to WorkSphere AI, ${name}! Your ${userType} account is ready. Log in to start transforming the way you work. Reply HELP for support.`;
  }

  getInvitationTemplate(inviterName: string, organizationName: string): string {
    return `${inviterName} has invited you to join ${organizationName} on WorkSphere AI! Reply ACCEPT to join or DECLINE to pass. Link: worksphere.ai/join`;
  }

  getPasswordResetTemplate(): string {
    return `Your WorkSphere AI password reset code has been sent to your email. If you didn't request this, please ignore this message. Reply HELP for support.`;
  }

  getAccountSuspendedTemplate(): string {
    return `Your WorkSphere AI account has been suspended. Please check your email for details or contact support. Reply HELP for assistance.`;
  }

  // ============================================
  // UTILITY METHODS
  // ============================================

  private generateVerificationCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  private async logSMS(phone: string, message: string, result: any): Promise<void> {
    try {
      await supabase
        .from('sms_logs')
        .insert({
          phone,
          message,
          status: result.SMSMessageData?.Recipients?.[0]?.status || 'unknown',
          message_id: result.SMSMessageData?.Recipients?.[0]?.messageId,
          cost: result.SMSMessageData?.Recipients?.[0]?.cost,
          created_at: new Date().toISOString()
        });
    } catch (error) {
      console.error('Error logging SMS:', error);
      // Don't throw - logging failures shouldn't break SMS sending
    }
  }

  async getSMSLogs(phone?: string, limit: number = 50): Promise<any[]> {
    try {
      let query = supabase
        .from('sms_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (phone) {
        query = query.eq('phone', phone);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting SMS logs:', error);
      return [];
    }
  }

  async getSMSStats(timeframe: 'day' | 'week' | 'month' = 'week'): Promise<any> {
    try {
      const { data, error } = await supabase
        .from('sms_logs')
        .select('*')
        .gte('created_at', this.getTimeframeDate(timeframe));

      if (error) throw error;

      const stats = {
        total: data?.length || 0,
        successful: data?.filter(log => log.status === 'Success').length || 0,
        failed: data?.filter(log => log.status === 'Failed').length || 0,
        total_cost: data?.reduce((sum, log) => sum + (parseFloat(log.cost) || 0), 0) || 0,
        by_day: {} as Record<string, number>
      };

      data?.forEach(item => {
        const day = new Date(item.created_at).toLocaleDateString();
        stats.by_day[day] = (stats.by_day[day] || 0) + 1;
      });

      return stats;
    } catch (error) {
      console.error('Error getting SMS stats:', error);
      return { total: 0, successful: 0, failed: 0, total_cost: 0, by_day: {} };
    }
  }

  private getTimeframeDate(timeframe: 'day' | 'week' | 'month'): string {
    const now = new Date();
    switch (timeframe) {
      case 'day':
        now.setDate(now.getDate() - 1);
        break;
      case 'week':
        now.setDate(now.getDate() - 7);
        break;
      case 'month':
        now.setMonth(now.getMonth() - 1);
        break;
    }
    return now.toISOString();
  }

  // ============================================
  // PHONE NUMBER VALIDATION
  // ============================================

  validatePhoneNumber(phone: string, country: string = 'RW'): boolean {
    // Remove all non-digit characters
    const cleanPhone = phone.replace(/\D/g, '');

    // Basic validation for different countries
    const patterns = {
      'RW': /^2507\d{8}$/, // Rwanda: +250 7xx xxx xxx
      'KE': /^2547\d{8}$/, // Kenya: +254 7xx xxx xxx
      'UG': /^2567\d{8}$/, // Uganda: +256 7xx xxx xxx
      'TZ': /^2557\d{8}$/, // Tanzania: +255 7xx xxx xxx
      'NG': /^2347\d{8}$/, // Nigeria: +234 7xx xxx xxx
      'ZA': /^276\d{8}$/, // South Africa: +27 6xx xxx xxx
      'GH': /^2332\d{8}$/, // Ghana: +233 2xx xxx xxx
    };

    const pattern = patterns[country as keyof typeof patterns];
    if (pattern) {
      return pattern.test(cleanPhone);
    }

    // Generic international format validation
    return /^\d{10,15}$/.test(cleanPhone);
  }

  formatPhoneNumber(phone: string, country: string = 'RW'): string {
    let cleanPhone = phone.replace(/\D/g, '');

    // Add country code if not present
    const countryCodes = {
      'RW': '250',
      'KE': '254',
      'UG': '256',
      'TZ': '255',
      'NG': '234',
      'ZA': '27',
      'GH': '233'
    };

    const countryCode = countryCodes[country as keyof typeof countryCodes];
    if (countryCode && !cleanPhone.startsWith(countryCode)) {
      // Remove leading 0 if present
      if (cleanPhone.startsWith('0')) {
        cleanPhone = cleanPhone.substring(1);
      }
      cleanPhone = countryCode + cleanPhone;
    }

    return cleanPhone;
  }

  // ============================================
  // SMS CAMPAIGNS
  // ============================================

  async createCampaign(
    name: string,
    message: string,
    targetAudience: string[],
    scheduledFor?: Date
  ): Promise<any> {
    try {
      const { data, error } = await supabase
        .from('sms_campaigns')
        .insert({
          name,
          message,
          target_audience: targetAudience,
          status: scheduledFor ? 'scheduled' : 'draft',
          scheduled_for: scheduledFor?.toISOString(),
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating SMS campaign:', error);
      throw error;
    }
  }

  async launchCampaign(campaignId: string): Promise<{ success: string[], failed: string[] }> {
    try {
      // Get campaign details
      const { data: campaign, error } = await supabase
        .from('sms_campaigns')
        .select('*')
        .eq('id', campaignId)
        .single();

      if (error) throw error;

      // Update campaign status
      await supabase
        .from('sms_campaigns')
        .update({ 
          status: 'running',
          launched_at: new Date().toISOString()
        })
        .eq('id', campaignId);

      // Send SMS to target audience
      const results = await this.sendBulkSMS(campaign.target_audience, campaign.message);

      // Update campaign with results
      await supabase
        .from('sms_campaigns')
        .update({ 
          status: 'completed',
          completed_at: new Date().toISOString(),
          success_count: results.success.length,
          failed_count: results.failed.length
        })
        .eq('id', campaignId);

      return results;
    } catch (error) {
      console.error('Error launching SMS campaign:', error);
      throw error;
    }
  }

  // ============================================
  // WEBHOOK HANDLERS
  // ============================================

  async handleDeliveryNotification(webhookData: any): Promise<void> {
    try {
      const { messageId, status, phoneNumber } = webhookData;

      // Update SMS log with delivery status
      await supabase
        .from('sms_logs')
        .update({ 
          delivery_status: status,
          delivered_at: new Date().toISOString()
        })
        .eq('message_id', messageId);

      // Handle specific status updates
      if (status === 'Failed') {
        console.error(`SMS delivery failed for ${phoneNumber}:`, webhookData);
        // Could trigger retry logic or notification here
      }

    } catch (error) {
      console.error('Error handling delivery notification:', error);
    }
  }

  async handleIncomingSMS(webhookData: any): Promise<void> {
    try {
      const { from, text, date } = webhookData;

      // Log incoming message
      await supabase
        .from('incoming_sms')
        .insert({
          phone: from,
          message: text,
          received_at: new Date(date).toISOString(),
          processed: false
        });

      // Process message based on content
      await this.processIncomingMessage(from, text);

    } catch (error) {
      console.error('Error handling incoming SMS:', error);
    }
  }

  private async processIncomingMessage(phone: string, message: string): Promise<void> {
    const upperMessage = message.toUpperCase().trim();

    switch (upperMessage) {
      case 'HELP':
        await this.sendSMS({
          to: phone,
          message: 'WorkSphere AI Help: Reply STOP to unsubscribe, STATUS for account info, or SUPPORT for assistance.'
        });
        break;

      case 'STOP':
        await this.sendSMS({
          to: phone,
          message: 'You have been unsubscribed from WorkSphere AI SMS notifications. Reply START to resubscribe.'
        });
        // Update user preferences
        await supabase
          .from('user_sms_preferences')
          .upsert({
            phone,
            unsubscribed: true,
            unsubscribed_at: new Date().toISOString()
          });
        break;

      case 'START':
        await this.sendSMS({
          to: phone,
          message: 'Welcome back! You have been resubscribed to WorkSphere AI SMS notifications.'
        });
        await supabase
          .from('user_sms_preferences')
          .upsert({
            phone,
            unsubscribed: false,
            unsubscribed_at: null
          });
        break;

      case 'STATUS':
        // Would need to look up user by phone and send status
        await this.sendSMS({
          to: phone,
          message: 'Please check your email for detailed account status or contact support.'
        });
        break;

      case 'SUPPORT':
        await this.sendSMS({
          to: phone,
          message: 'Our support team has been notified. They will contact you shortly. You can also email support@worksphere.ai'
        });
        // Create support ticket
        await supabase
          .from('support_tickets')
          .insert({
            phone,
            message: 'SMS support request',
            source: 'sms',
            status: 'open',
            created_at: new Date().toISOString()
          });
        break;

      default:
        // Handle invitation responses
        if (upperMessage === 'ACCEPT' || upperMessage === 'DECLINE') {
          await this.handleInvitationResponse(phone, upperMessage);
        }
        break;
    }
  }

  private async handleInvitationResponse(phone: string, response: string): Promise<void> {
    try {
      // Find pending invitation for this phone
      const { data: invitation, error } = await supabase
        .from('organization_invitations')
        .select('*')
        .eq('phone', phone)
        .eq('status', 'pending')
        .single();

      if (error || !invitation) {
        await this.sendSMS({
          to: phone,
          message: 'No pending invitation found for this number.'
        });
        return;
      }

      // Update invitation status
      await supabase
        .from('organization_invitations')
        .update({ 
          status: response.toLowerCase(),
          responded_at: new Date().toISOString()
        })
        .eq('id', invitation.id);

      // Send confirmation
      const responseText = response === 'ACCEPT' ? 'accepted' : 'declined';
      await this.sendSMS({
        to: phone,
        message: `Invitation ${responseText}. ${response === 'ACCEPT' ? 'Check your email for next steps.' : 'No further action needed.'}`
      });

    } catch (error) {
      console.error('Error handling invitation response:', error);
    }
  }
}

export const smsService = new SMSService();
