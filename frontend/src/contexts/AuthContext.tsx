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
        } else {
          setUser(null);
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
        console.log('Auth state changed:', _event, session?.user?.email);
        
        if (session?.user) {
          // Small delay to ensure database is updated
          setTimeout(async () => {
            await loadUserProfile(session.user);
          }, 500);
        } else {
          setUser(null);
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const getUserPermissions = (role: string): string[] => {
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

  const loadUserProfile = async (authUser: User) => {
    try {
      console.log('Loading user profile for:', authUser.id);
      
      // Try to get existing profile
      const { data: profile, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching user profile:', error);
      }

      if (profile) {
        // Profile exists - use it
        console.log('User profile found:', profile);
        const permissions = getUserPermissions(profile.role);
        setUser({
          ...authUser,
          ...profile,
          permissions,
        });
        return;
      }

      // Profile doesn't exist - create it
      console.log('No profile found, creating one for:', authUser.id);
      
      const defaultRole = authUser.user_metadata?.role || 'employee';
      const defaultName = authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || 'User';
      
      const newProfile = {
        id: authUser.id,
        email: authUser.email!,
        full_name: defaultName,
        role: defaultRole,
        settings: {
          notifications: true,
          language: 'en',
          theme: 'system',
          onboarding_completed: false
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Try to insert the new profile
      const { data: createdProfile, error: createError } = await supabase
        .from('users')
        .insert([newProfile])
        .select()
        .maybeSingle();

      if (createError) {
        // log full error details for diagnosis
        console.error('Error creating user profile:', createError);
        console.error('createError message:', createError.message, 'code:', createError.code);
        
        // Check if profile was created by another process
        const { data: retryProfile } = await supabase
          .from('users')
          .select('*')
          .eq('id', authUser.id)
          .maybeSingle();

        if (retryProfile) {
          console.log('Profile found on retry:', retryProfile);
          const permissions = getUserPermissions(retryProfile.role);
          setUser({
            ...authUser,
            ...retryProfile,
            permissions,
          });
          return;
        }

        // Still failed, set user with basic data
        const permissions = getUserPermissions(defaultRole);
        setUser({
          ...authUser,
          full_name: defaultName,
          role: defaultRole,
          permissions,
        });
        return;
      }

      if (createdProfile) {
        console.log('User profile created successfully:', createdProfile);
        const permissions = getUserPermissions(createdProfile.role);
        setUser({
          ...authUser,
          ...createdProfile,
          permissions,
        });
      } else {
        // Fallback to auth user data
        const permissions = getUserPermissions(defaultRole);
        setUser({
          ...authUser,
          full_name: defaultName,
          role: defaultRole,
          permissions,
        });
      }

    } catch (error) {
      console.error('Error in loadUserProfile:', error);
      // Always set user with basic data to prevent infinite loading
      const defaultRole = authUser.user_metadata?.role || 'employee';
      const defaultName = authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || 'User';
      const permissions = getUserPermissions(defaultRole);
      
      setUser({
        ...authUser,
        full_name: defaultName,
        role: defaultRole,
        permissions,
      });
    }
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