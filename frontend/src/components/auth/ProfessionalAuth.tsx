// src/components/auth/ProfessionalAuth.tsx
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Building2, Mail, Lock, User, Eye, EyeOff, Check, AlertCircle, Loader2, ArrowRight, Shield, Zap, Globe, ArrowLeft } from 'lucide-react';
import { GoogleLogin, GoogleOAuthProvider } from '@react-oauth/google';

interface AuthProps {
  onAuth: (user: any) => void;
}

interface FormData {
  email: string;
  password: string;
  fullName: string;
  companyName: string;
  agreeToTerms: boolean;
}

interface FormErrors {
  email?: string;
  password?: string;
  fullName?: string;
  companyName?: string;
  general?: string;
}

export const ProfessionalAuth: React.FC<AuthProps> = ({ onAuth }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    fullName: '',
    companyName: '',
    agreeToTerms: false
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    // Determine auth mode based on URL
    const path = location.pathname;
    if (path === '/signup' || path === '/register') {
      setIsSignUp(true);
    } else {
      setIsSignUp(false);
    }
    checkExistingSession();
  }, [location.pathname]);

  const checkExistingSession = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const userData = await getUserProfile(session.user.id);
        if (userData) {
          onAuth(userData);
        }
      }
    } catch (error) {
      console.error('Error checking session:', error);
    }
  };

  const getUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) {
        console.error('Error fetching user profile:', error);
        return null;
      }
      
      return data;
    } catch (error) {
      console.error('Error:', error);
      return null;
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (isSignUp) {
      if (!formData.fullName) {
        newErrors.fullName = 'Full name is required';
      } else if (formData.fullName.length < 2) {
        newErrors.fullName = 'Full name must be at least 2 characters';
      }

      if (!formData.companyName) {
        newErrors.companyName = 'Company name is required';
      } else if (formData.companyName.length < 2) {
        newErrors.companyName = 'Company name must be at least 2 characters';
      }

      if (!formData.agreeToTerms) {
        newErrors.general = 'You must agree to the terms and conditions';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({});

    try {
      if (isSignUp) {
        // Sign up
        const { data, error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              full_name: formData.fullName,
              company_name: formData.companyName
            }
          }
        });

        if (error) throw error;

        if (data.user && !data.session) {
          setSuccessMessage('Account created! Please check your email to verify your account.');
        } else if (data.session && data.user) {
          const userData = await getUserProfile(data.user.id);
          if (userData) {
            onAuth(userData);
          }
        }
      } else {
        // Sign in
        const { data, error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password
        });

        if (error) throw error;

        if (data.user) {
          const userData = await getUserProfile(data.user.id);
          if (userData) {
            onAuth(userData);
          }
        }
      }
    } catch (error: any) {
      setErrors({
        general: error.message || 'An error occurred during authentication'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleAuth = async (credential: string) => {
    setIsLoading(true);
    setErrors({});

    try {
      const { data, error } = await supabase.auth.signInWithIdToken({
        provider: 'google',
        token: credential,
      });

      if (error) throw error;

      if (data.user) {
        // Check if user profile exists, if not create one
        let userData = await getUserProfile(data.user.id);
        
        if (!userData && isSignUp) {
          // Create user profile for new Google sign-ups
          const { error: profileError } = await supabase
            .from('users')
            .insert({
              id: data.user.id,
              email: data.user.email,
              full_name: data.user.user_metadata?.full_name || data.user.email?.split('@')[0],
              avatar_url: data.user.user_metadata?.avatar_url,
              created_at: new Date().toISOString()
            });

          if (profileError) throw profileError;

          userData = await getUserProfile(data.user.id);
        }

        if (userData) {
          onAuth(userData);
        }
      }
    } catch (error: any) {
      setErrors({
        general: error.message || 'An error occurred during Google authentication'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof FormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field when user starts typing
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID || 'your-google-client-id'}>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
      </div>

      <div className="relative w-full max-w-4xl">
        <div className="bg-white/80 backdrop-blur-lg shadow-2xl rounded-2xl overflow-hidden">
          <div className="grid md:grid-cols-2">
            {/* Left Side - Branding */}
            <div className="bg-gradient-to-br from-blue-600 to-purple-700 p-8 flex flex-col justify-center">
              <div className="text-white">
                <div className="flex items-center space-x-3 mb-8">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
                    <Building2 className="w-7 h-7 text-white" />
                  </div>
                  <h1 className="text-2xl font-bold">WorkSphere</h1>
                </div>
                
                <h2 className="text-3xl font-bold mb-4">
                  {isSignUp ? 'Join the Future' : 'Welcome Back'}
                </h2>
                
                <p className="text-blue-100 mb-8">
                  {isSignUp 
                    ? 'Transform your business with our intelligent corporate operating system. Streamline operations, boost productivity, and scale with confidence.'
                    : 'Continue your journey to operational excellence. Manage your workspace, collaborate seamlessly, and achieve more.'
                  }
                </p>

                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-white/20 backdrop-blur rounded-lg flex items-center justify-center">
                      <Shield className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Enterprise Security</h3>
                      <p className="text-sm text-blue-100">Bank-level encryption and compliance</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-white/20 backdrop-blur rounded-lg flex items-center justify-center">
                      <Zap className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Lightning Fast</h3>
                      <p className="text-sm text-blue-100">Optimized for performance and speed</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-white/20 backdrop-blur rounded-lg flex items-center justify-center">
                      <Globe className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Global Scale</h3>
                      <p className="text-sm text-blue-100">Built for businesses worldwide</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side - Auth Form */}
            <div className="p-8">
              <div className="max-w-sm mx-auto">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    {isSignUp ? 'Create Account' : 'Sign In'}
                  </h3>
                  <p className="text-gray-600">
                    {isSignUp 
                      ? 'Start your free trial today'
                      : 'Welcome back to WorkSphere'
                    }
                  </p>
                </div>

                {/* Google Sign In */}
                <div className="mb-6">
                  <GoogleLogin
                    onSuccess={(credentialResponse) => {
                      if (credentialResponse.credential) {
                        handleGoogleAuth(credentialResponse.credential);
                      }
                    }}
                    onError={() => {
                      setErrors({ general: 'Google authentication failed' });
                    }}
                    text={isSignUp ? 'signup_with' : 'signin_with'}
                    width="100%"
                    theme="filled_blue"
                    size="large"
                    shape="rectangular"
                    logo_alignment="left"
                  />
                </div>

                {/* Divider */}
                <div className="relative mb-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white text-gray-500">Or continue with email</span>
                  </div>
                </div>

                {/* Email Form */}
                <form onSubmit={handleEmailAuth} className="space-y-4">
                  {isSignUp && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Full Name
                        </label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                          <input
                            type="text"
                            value={formData.fullName}
                            onChange={(e) => handleInputChange('fullName', e.target.value)}
                            className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                              errors.fullName ? 'border-red-500' : 'border-gray-300'
                            }`}
                            placeholder="John Doe"
                            disabled={isLoading}
                          />
                        </div>
                        {errors.fullName && (
                          <p className="mt-1 text-sm text-red-600 flex items-center">
                            <AlertCircle className="w-4 h-4 mr-1" />
                            {errors.fullName}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Company Name
                        </label>
                        <div className="relative">
                          <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                          <input
                            type="text"
                            value={formData.companyName}
                            onChange={(e) => handleInputChange('companyName', e.target.value)}
                            className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                              errors.companyName ? 'border-red-500' : 'border-gray-300'
                            }`}
                            placeholder="Acme Corporation"
                            disabled={isLoading}
                          />
                        </div>
                        {errors.companyName && (
                          <p className="mt-1 text-sm text-red-600 flex items-center">
                            <AlertCircle className="w-4 h-4 mr-1" />
                            {errors.companyName}
                          </p>
                        )}
                      </div>
                    </>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                          errors.email ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="you@company.com"
                        disabled={isLoading}
                      />
                    </div>
                    {errors.email && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {errors.email}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={formData.password}
                        onChange={(e) => handleInputChange('password', e.target.value)}
                        className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                          errors.password ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="••••••••"
                        disabled={isLoading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        disabled={isLoading}
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {errors.password}
                      </p>
                    )}
                  </div>

                  {isSignUp && (
                    <div className="flex items-start">
                      <input
                        type="checkbox"
                        id="terms"
                        checked={formData.agreeToTerms}
                        onChange={(e) => handleInputChange('agreeToTerms', e.target.checked)}
                        className="mt-0.5 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        disabled={isLoading}
                      />
                      <label htmlFor="terms" className="ml-2 text-sm text-gray-600">
                        I agree to the{' '}
                        <a href="#" className="text-blue-600 hover:text-blue-700 font-medium">
                          Terms of Service
                        </a>{' '}
                        and{' '}
                        <a href="#" className="text-blue-600 hover:text-blue-700 font-medium">
                          Privacy Policy
                        </a>
                      </label>
                    </div>
                  )}

                  {errors.general && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-sm text-red-600 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-2" />
                        {errors.general}
                      </p>
                    </div>
                  )}

                  {successMessage && (
                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-sm text-green-600 flex items-center">
                        <Check className="w-4 h-4 mr-2" />
                        {successMessage}
                      </p>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        {isSignUp ? 'Creating Account...' : 'Signing In...'}
                      </>
                    ) : (
                      <>
                        {isSignUp ? 'Create Account' : 'Sign In'}
                        <ArrowRight className="w-5 h-5 ml-2" />
                      </>
                    )}
                  </button>
                </form>

                <div className="mt-6 text-center space-y-3">
                  <button
                    onClick={() => {
                      if (isSignUp) {
                        // If currently in signup mode, switch to login mode
                        setIsSignUp(false);
                        setErrors({});
                        setSuccessMessage('');
                        setFormData({
                          email: '',
                          password: '',
                          fullName: '',
                          companyName: '',
                          agreeToTerms: false
                        });
                      } else {
                        // If currently in login mode, navigate to signup page
                        navigate('/signup');
                      }
                    }}
                    className="text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors"
                    title={isSignUp ? "Switch to sign in" : "Go to signup page"}
                  >
                    {isSignUp 
                      ? 'Already have an account? Sign in'
                      : "Don't have an account? Choose signup type"
                    }
                  </button>
                  
                  {!isSignUp && (
                    <div className="text-center">
                      <p className="text-gray-500 text-sm mb-2">or choose your account type</p>
                      <button
                        onClick={() => navigate('/signup')}
                        className="text-purple-600 hover:text-purple-700 font-medium text-sm transition-colors"
                        title="View all signup options"
                      >
                        View signup options →
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>
    </GoogleOAuthProvider>
  );
};
