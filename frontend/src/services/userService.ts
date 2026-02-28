// src/services/userService.ts
import { supabase } from '../lib/supabase';

export interface User {
  id?: string;
  email: string;
  full_name: string;
  role: 'ceo' | 'manager' | 'employee' | 'customer';
  organization_id?: string;
  department_id?: string;
  avatar_url?: string;
  last_active?: string;
  settings?: Record<string, any>;
  created_at?: string;
  updated_at?: string;
}

export interface CreateUserData {
  email: string;
  full_name: string;
  role: 'ceo' | 'manager' | 'employee' | 'customer';
  organization_id?: string;
  department_id?: string;
  avatar_url?: string;
  settings?: Record<string, any>;
}

class UserService {
  // ============================================
  // USER CREATION
  // ============================================

  async createUser(userData: CreateUserData): Promise<User> {
    try {
      const { data, error } = await supabase
        .from('users')
        .insert({
          ...userData,
          settings: userData.settings || {},
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  async createUserFromSignup(signupAttempt: any): Promise<User> {
    try {
      // Determine role based on user_type
      let role: 'ceo' | 'manager' | 'employee' | 'customer';
      switch (signupAttempt.user_type) {
        case 'enterprise':
          role = 'ceo'; // First enterprise user becomes CEO
          break;
        case 'individual':
          role = 'employee';
          break;
        case 'customer':
          role = 'customer';
          break;
        default:
          role = 'employee';
      }

      const userData: CreateUserData = {
        email: signupAttempt.email,
        full_name: signupAttempt.full_name || signupAttempt.email.split('@')[0],
        role,
        settings: {
          signup_source: signupAttempt.user_type,
          organization_name: signupAttempt.organization_name
        }
      };

      // Create the user
      const user = await this.createUser(userData);

      // Update signup attempt to reference the user
      await supabase
        .from('signup_attempts')
        .update({ 
          status: 'completed',
          metadata: {
            ...signupAttempt.metadata,
            user_id: user.id
          }
        })
        .eq('id', signupAttempt.id);

      return user;
    } catch (error) {
      console.error('Error creating user from signup:', error);
      throw error;
    }
  }

  // ============================================
  // USER RETRIEVAL
  // ============================================

  async getUserById(userId: string): Promise<User | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    } catch (error) {
      console.error('Error getting user by ID:', error);
      return null;
    }
  }

  async getUserByEmail(email: string): Promise<User | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    } catch (error) {
      console.error('Error getting user by email:', error);
      return null;
    }
  }

  async updateUser(userId: string, updates: Partial<User>): Promise<User> {
    try {
      const { data, error } = await supabase
        .from('users')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  async updateLastActive(userId: string): Promise<void> {
    try {
      await supabase
        .from('users')
        .update({ 
          last_active: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);
    } catch (error) {
      console.error('Error updating last active:', error);
      // Don't throw - this is a non-critical update
    }
  }

  // ============================================
  // USER MANAGEMENT
  // ============================================

  async getUsersByOrganization(organizationId: string): Promise<User[]> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('organization_id', organizationId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting users by organization:', error);
      return [];
    }
  }

  async deleteUser(userId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', userId);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }

  // ============================================
  // AUTH INTEGRATION
  // ============================================

  async createAuthUser(email: string, password: string, userData: CreateUserData): Promise<{ user: User; authUser: any }> {
    try {
      // First create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: userData.full_name,
            role: userData.role
          }
        }
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error('Failed to create auth user');

      // Then create user record
      const user = await this.createUser(userData);

      return { user, authUser: authData.user };
    } catch (error) {
      console.error('Error creating auth user:', error);
      throw error;
    }
  }

  async linkAuthToUser(authUserId: string, userRecord: User): Promise<void> {
    try {
      // This would typically be handled by a database trigger or backend service
      // For now, we'll update the user's metadata to include the auth ID
      await this.updateUser(userRecord.id!, {
        settings: {
          ...userRecord.settings,
          auth_user_id: authUserId
        }
      });
    } catch (error) {
      console.error('Error linking auth to user:', error);
      throw error;
    }
  }
}

export const userService = new UserService();
