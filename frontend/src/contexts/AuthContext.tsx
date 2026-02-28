// src/contexts/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { User } from '@supabase/supabase-js';

interface AuthUser extends User {
  full_name?: string;
  role?: 'ceo' | 'admin' | 'manager' | 'employee' | 'customer';
  organization_id?: string;
  department_id?: string;
  permissions?: string[];
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  isAuthenticated: boolean;
  userRole: string | null;
  organizationId: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  hasPermission: (permission: string) => boolean;
  hasRole: (roles: string | string[]) => boolean;
  isInOrganization: (orgId: string) => boolean;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check active session
    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          await loadUserProfile(session.user);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (session?.user) {
          await loadUserProfile(session.user);
        } else {
          setUser(null);
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const loadUserProfile = async (authUser: User) => {
    try {
      // Get additional user data from our users table
      const { data: profile, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .maybeSingle(); // Use maybeSingle() instead of single()

      if (error) {
        console.error('Error loading user profile:', error);
        // Don't throw error, continue with auth user data
        const permissions = await getUserPermissions(authUser.user_metadata?.role || 'employee');
        setUser({
          ...authUser,
          full_name: authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || 'User',
          role: authUser.user_metadata?.role || 'employee',
          permissions,
        });
        return;
      }

      if (profile) {
        // Profile exists - use it
        const permissions = await getUserPermissions(profile.role);
        setUser({
          ...authUser,
          ...profile,
          permissions,
        });
      } else {
        // Profile doesn't exist - create it
        console.log('No profile found, creating one for:', authUser.id);
        
        const newProfile = {
          id: authUser.id,
          email: authUser.email,
          full_name: authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || 'User',
          role: authUser.user_metadata?.role || 'employee',
          settings: {
            notifications: true,
            language: 'en',
            theme: 'system'
          }
        };

        const { data: createdProfile, error: createError } = await supabase
          .from('users')
          .insert([newProfile])
          .select()
          .maybeSingle();

        if (createError) {
          console.error('Error creating user profile:', createError);
          // Still set user with auth data
          const permissions = await getUserPermissions(authUser.user_metadata?.role || 'employee');
          setUser({
            ...authUser,
            full_name: authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || 'User',
            role: authUser.user_metadata?.role || 'employee',
            permissions,
          });
        } else if (createdProfile) {
          console.log('User profile created:', createdProfile);
          const permissions = await getUserPermissions(createdProfile.role);
          setUser({
            ...authUser,
            ...createdProfile,
            permissions,
          });
        } else {
          // Fallback to auth user data
          const permissions = await getUserPermissions(authUser.user_metadata?.role || 'employee');
          setUser({
            ...authUser,
            full_name: authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || 'User',
            role: authUser.user_metadata?.role || 'employee',
            permissions,
          });
        }
      }
    } catch (error) {
      console.error('Error in loadUserProfile:', error);
      // Still set user with auth data as fallback
      const permissions = await getUserPermissions(authUser.user_metadata?.role || 'employee');
      setUser({
        ...authUser,
        full_name: authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || 'User',
        role: authUser.user_metadata?.role || 'employee',
        permissions,
      });
    }
  };

  const getUserPermissions = async (role: string): Promise<string[]> => {
    // Define permissions based on role
    const permissionsMap: Record<string, string[]> = {
      ceo: ['*'], // All permissions
      admin: ['manage_users', 'manage_org', 'view_all', 'manage_settings'],
      manager: ['manage_team', 'approve_requests', 'view_team_reports'],
      employee: ['view_own', 'create_tasks', 'send_messages'],
      customer: ['view_portal', 'create_tickets', 'view_own_documents'],
    };

    return permissionsMap[role] || [];
  };

  const login = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
  };

  const logout = async () => {
    await supabase.auth.signOut();
  };

  const hasPermission = (permission: string): boolean => {
    if (!user?.permissions) return false;
    if (user.permissions.includes('*')) return true;
    return user.permissions.includes(permission);
  };

  const hasRole = (roles: string | string[]): boolean => {
    if (!user?.role) return false;
    const roleList = Array.isArray(roles) ? roles : [roles];
    return roleList.includes(user.role);
  };

  const isInOrganization = (orgId: string): boolean => {
    return user?.organization_id === orgId;
  };

  const refreshUser = async () => {
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (authUser) {
      await loadUserProfile(authUser);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        userRole: user?.role || null,
        organizationId: user?.organization_id || null,
        login,
        logout,
        hasPermission,
        hasRole,
        isInOrganization,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
