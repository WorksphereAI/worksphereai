// src/services/signupService.ts
import { supabase } from '../lib/supabase';
import { v4 as uuidv4 } from 'uuid';
import { userService } from './userService';

export interface SignupAttempt {
  id?: string;
  email: string;
  phone?: string;
  user_type: 'enterprise' | 'individual' | 'customer';
  status: 'pending' | 'email_sent' | 'verified' | 'completed' | 'failed';
  organization_name?: string;
  full_name?: string;
  password_hash?: string;
  metadata?: Record<string, any>;
}

export interface EmailVerification {
  id?: string;
  user_id?: string;
  email: string;
  token: string;
  type: 'signup' | 'invitation' | 'password_reset';
  status: 'pending' | 'verified' | 'expired';
  attempts: number;
  max_attempts: number;
  expires_at: string;
  verified_at?: string;
}

export interface OrganizationInvitation {
  id?: string;
  organization_id: string;
  invited_by: string;
  email: string;
  role: 'admin' | 'manager' | 'employee';
  token: string;
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  message?: string;
  invited_at: string;
  expires_at: string;
  accepted_at?: string;
}

export interface OnboardingProgress {
  id?: string;
  user_id: string;
  organization_id: string;
  step_id: number;
  step_name: string;
  completed: boolean;
  skipped: boolean;
  data?: Record<string, any>;
  completed_at?: string;
}

class SignupService {
  // ============================================
  // SIGNUP ATTEMPTS
  // ============================================

  async createSignupAttempt(data: Omit<SignupAttempt, 'id' | 'status'>): Promise<SignupAttempt> {
    try {
      const { data: result, error } = await supabase
        .from('signup_attempts')
        .insert({
          ...data,
          status: 'pending',
          metadata: data.metadata || {}
        })
        .select()
        .single();

      if (error) throw error;
      return result;
    } catch (error) {
      console.error('Error creating signup attempt:', error);
      throw error;
    }
  }

  async updateSignupAttempt(id: string, updates: Partial<SignupAttempt>): Promise<SignupAttempt> {
    try {
      const { data: result, error } = await supabase
        .from('signup_attempts')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return result;
    } catch (error) {
      console.error('Error updating signup attempt:', error);
      throw error;
    }
  }

  async getSignupAttempt(email: string): Promise<SignupAttempt | null> {
    try {
      const { data, error } = await supabase
        .from('signup_attempts')
        .select('*')
        .eq('email', email)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    } catch (error) {
      console.error('Error getting signup attempt:', error);
      return null;
    }
  }

  // ============================================
  // EMAIL VERIFICATIONS
  // ============================================

  async createEmailVerification(
    email: string, 
    type: 'signup' | 'invitation' | 'password_reset' = 'signup',
    userId?: string
  ): Promise<EmailVerification> {
    try {
      const token = uuidv4();
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // 24 hours

      const { data, error } = await supabase
        .from('email_verifications')
        .insert({
          user_id: userId,
          email,
          token,
          type,
          status: 'pending',
          attempts: 0,
          max_attempts: 5,
          expires_at: expiresAt
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating email verification:', error);
      throw error;
    }
  }

  async verifyEmail(token: string): Promise<boolean> {
    try {
      // First check if token exists and is valid
      const { data: verification, error: fetchError } = await supabase
        .from('email_verifications')
        .select('*')
        .eq('token', token)
        .eq('status', 'pending')
        .single();

      if (fetchError) {
        if (fetchError.code === 'PGRST116') {
          throw new Error('Invalid or expired verification token');
        }
        throw fetchError;
      }

      // Check if expired
      if (new Date(verification.expires_at) < new Date()) {
        await supabase
          .from('email_verifications')
          .update({ status: 'expired' })
          .eq('id', verification.id);
        throw new Error('Verification token has expired');
      }

      // Check attempts
      if (verification.attempts >= verification.max_attempts) {
        await supabase
          .from('email_verifications')
          .update({ status: 'expired' })
          .eq('id', verification.id);
        throw new Error('Too many verification attempts');
      }

      // Increment attempts
      await supabase
        .from('email_verifications')
        .update({ 
          attempts: verification.attempts + 1,
          status: 'verified',
          verified_at: new Date().toISOString()
        })
        .eq('id', verification.id);

      // Update signup attempt status if applicable
      if (verification.type === 'signup') {
        await supabase
          .from('signup_attempts')
          .update({ status: 'verified' })
          .eq('email', verification.email);

        // Create user record after successful email verification
        try {
          await this.createUserFromVerifiedSignup(verification.email);
        } catch (userError) {
          console.warn('User creation failed after email verification:', userError);
          // Don't throw - email verification succeeded even if user creation failed
        }
      }

      return true;
    } catch (error) {
      console.error('Error verifying email:', error);
      throw error;
    }
  }

  async resendVerificationEmail(email: string): Promise<EmailVerification> {
    try {
      // Delete existing pending verifications
      await supabase
        .from('email_verifications')
        .delete()
        .eq('email', email)
        .eq('status', 'pending');

      // Create new verification
      return await this.createEmailVerification(email, 'signup');
    } catch (error) {
      console.error('Error resending verification email:', error);
      throw error;
    }
  }

  // ============================================
  // ORGANIZATION INVITATIONS
  // ============================================

  async sendInvitation(
    organizationId: string,
    email: string,
    role: 'admin' | 'manager' | 'employee',
    invitedBy: string,
    message?: string
  ): Promise<OrganizationInvitation> {
    try {
      const token = uuidv4();
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(); // 7 days

      const { data, error } = await supabase
        .from('organization_invitations')
        .insert({
          organization_id: organizationId,
          invited_by: invitedBy,
          email,
          role,
          token,
          status: 'pending',
          message,
          invited_at: new Date().toISOString(),
          expires_at: expiresAt
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error sending invitation:', error);
      throw error;
    }
  }

  async acceptInvitation(token: string): Promise<boolean> {
    try {
      const { data: invitation, error } = await supabase
        .from('organization_invitations')
        .select('*')
        .eq('token', token)
        .eq('status', 'pending')
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          throw new Error('Invalid or expired invitation');
        }
        throw error;
      }

      if (new Date(invitation.expires_at) < new Date()) {
        await supabase
          .from('organization_invitations')
          .update({ status: 'expired' })
          .eq('id', invitation.id);
        throw new Error('Invitation has expired');
      }

      // Update invitation status
      await supabase
        .from('organization_invitations')
        .update({ 
          status: 'accepted',
          accepted_at: new Date().toISOString()
        })
        .eq('id', invitation.id);

      return true;
    } catch (error) {
      console.error('Error accepting invitation:', error);
      throw error;
    }
  }

  async getPendingInvitations(organizationId: string): Promise<OrganizationInvitation[]> {
    try {
      const { data, error } = await supabase
        .from('organization_invitations')
        .select('*')
        .eq('organization_id', organizationId)
        .eq('status', 'pending')
        .order('invited_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting pending invitations:', error);
      return [];
    }
  }

  // ============================================
  // ONBOARDING PROGRESS
  // ============================================

  async updateOnboardingProgress(
    userId: string,
    organizationId: string,
    stepId: number,
    stepName: string,
    completed: boolean,
    skipped: boolean = false,
    data?: Record<string, any>
  ): Promise<OnboardingProgress> {
    try {
      const { data: result, error } = await supabase
        .from('onboarding_progress')
        .upsert({
          user_id: userId,
          organization_id: organizationId,
          step_id: stepId,
          step_name: stepName,
          completed,
          skipped,
          data: data || {},
          completed_at: completed ? new Date().toISOString() : null,
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      return result;
    } catch (error) {
      console.error('Error updating onboarding progress:', error);
      throw error;
    }
  }

  async getOnboardingProgress(userId: string, organizationId: string): Promise<OnboardingProgress[]> {
    try {
      const { data, error } = await supabase
        .from('onboarding_progress')
        .select('*')
        .eq('user_id', userId)
        .eq('organization_id', organizationId)
        .order('step_id', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting onboarding progress:', error);
      return [];
    }
  }

  async completeOnboarding(userId: string, organizationId: string): Promise<void> {
    try {
      // Update signup attempt to completed
      const { data: user } = await supabase.auth.getUser();
      if (user.user?.email) {
        await supabase
          .from('signup_attempts')
          .update({ status: 'completed' })
          .eq('email', user.user.email);
      }

      // Create final onboarding step
      await this.updateOnboardingProgress(
        userId,
        organizationId,
        99, // Final step
        'Onboarding Complete',
        true,
        false,
        { completed_at: new Date().toISOString() }
      );
    } catch (error) {
      console.error('Error completing onboarding:', error);
      throw error;
    }
  }

  // ============================================
  // USER CREATION FROM SIGNUP
  // ============================================

  async createUserFromVerifiedSignup(email: string, password?: string): Promise<any> {
    try {
      // Get the verified signup attempt
      const signupAttempt = await this.getSignupAttempt(email);
      if (!signupAttempt || signupAttempt.status !== 'verified') {
        throw new Error('No verified signup attempt found');
      }

      // Create user record
      const user = await userService.createUserFromSignup(signupAttempt);

      // If password provided, create auth user
      if (password) {
        const { authUser } = await userService.createAuthUser(email, password, {
          email: user.email,
          full_name: user.full_name,
          role: user.role,
          organization_id: user.organization_id,
          department_id: user.department_id
        });

        // Link auth to user
        await userService.linkAuthToUser(authUser.id, user);

        return { user, authUser };
      }

      return { user };
    } catch (error) {
      console.error('Error creating user from verified signup:', error);
      throw error;
    }
  }

  // ============================================
  // ANALYTICS
  // ============================================

  async trackSignupEvent(
    eventType: string,
    userType: string,
    stepName: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    try {
      // TODO: Implement analytics tracking when signup_analytics table is available
      console.log('Analytics Event:', { eventType, userType, stepName, metadata });
      
      // Temporarily disabled until signup_analytics table is created
      // await supabase
      //   .from('signup_analytics')
      //   .insert({
      //     event_type: eventType,
      //     user_type: userType,
      //     step_name: stepName,
      //     metadata: metadata || {},
      //     ip_address: null, // Would need to get from request
      //     user_agent: navigator.userAgent,
      //     referrer: document.referrer
      //   });
    } catch (error) {
      console.error('Error tracking signup event:', error);
      // Don't throw - analytics failures shouldn't break the app
    }
  }

  async getSignupFunnel(userType?: string): Promise<any[]> {
    try {
      let query = supabase
        .from('signup_funnel')
        .select('*');

      if (userType) {
        query = query.eq('user_type', userType);
      }

      const { data, error } = await query
        .order('date', { ascending: false })
        .limit(30);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting signup funnel:', error);
      return [];
    }
  }

  // ============================================
  // UTILITY METHODS
  // ============================================

  async cleanupExpiredTokens(): Promise<void> {
    try {
      // This would typically be called by a scheduled job
      const { error } = await supabase.rpc('cleanup_expired_tokens');
      if (error) throw error;
    } catch (error) {
      console.error('Error cleaning up expired tokens:', error);
    }
  }

  async isEmailAvailable(email: string): Promise<boolean> {
    try {
      // Check if email exists in users table
      const { data, error } = await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .single();

      // If no error and data exists, email is taken
      if (!error && data) {
        return false;
      }

      // Check if there's a pending signup attempt
      const pendingAttempt = await this.getSignupAttempt(email);
      if (pendingAttempt && pendingAttempt.status === 'pending') {
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error checking email availability:', error);
      return false;
    }
  }

  async getSignupStats(timeframe: 'day' | 'week' | 'month' = 'week'): Promise<any> {
    try {
      // TODO: Implement stats when signup_analytics table is available
      console.log('Getting signup stats for timeframe:', timeframe);
      
      // Return mock data for now
      return {
        total: 0,
        by_type: {},
        by_day: {}
      };
      
      // Temporarily disabled until signup_analytics table is created
      // const { data, error } = await supabase
      //   .from('signup_analytics')
      //   .select('*')
      //   .eq('event_type', 'signup_started')
      //   .gte('created_at', this.getTimeframeDate(timeframe))
      //   .order('created_at', { ascending: false });

      // if (error) throw error;

      // const stats = {
      //   total: data?.length || 0,
      //   by_type: {} as Record<string, number>,
      //   by_day: {} as Record<string, number>
      // };

      // data?.forEach(item => {
      //   // Count by user type
      //   if (item.user_type) {
      //     stats.by_type[item.user_type] = (stats.by_type[item.user_type] || 0) + 1;
      //   }

      //   // Count by day
      //   const day = new Date(item.created_at).toLocaleDateString();
      //   stats.by_day[day] = (stats.by_day[day] || 0) + 1;
      // });

      // return stats;
    } catch (error) {
      console.error('Error getting signup stats:', error);
      return { total: 0, by_type: {}, by_day: {} };
    }
  }
}

export const signupService = new SignupService();
