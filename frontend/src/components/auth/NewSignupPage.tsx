import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Mail, Lock, User, Building2, AlertCircle, ArrowRight, CheckCircle } from 'lucide-react';

type UserType = 'enterprise' | 'individual' | 'customer';

export const NewSignupPage: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [userType, setUserType] = useState<UserType>('enterprise');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    organizationName: '',
    phone: '',
    acceptTerms: false
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const validateStep1 = () => {
    if (!formData.fullName.trim()) {
      setError('Full name is required');
      return false;
    }
    if (!formData.email.trim()) {
      setError('Email is required');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }
    if (!formData.password) {
      setError('Password is required');
      return false;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (userType === 'enterprise' && !formData.organizationName.trim()) {
      setError('Organization name is required');
      return false;
    }
    if (!formData.acceptTerms) {
      setError('You must accept the terms of service');
      return false;
    }
    return true;
  };

  const handleNext = () => {
    setError(null);
    if (step === 1 && validateStep1()) {
      setStep(2);
    }
  };

  const handleBack = () => {
    setStep(1);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (step === 1) {
      handleNext();
      return;
    }

    if (!validateStep2()) return;

    setLoading(true);
    setError(null);

    try {
      console.log('Starting signup process for:', formData.email);

      // Track signup attempt (with better error handling)
      try {
        const { error: trackError } = await supabase
          .from('signup_attempts')
          .insert([{
            email: formData.email,
            user_type: userType,
            organization_name: formData.organizationName || null,
            full_name: formData.fullName,
            status: 'pending'
          }]);

        if (trackError) {
          console.warn('Failed to track signup attempt:', trackError);
          // Continue anyway - this is non-critical
        } else {
          console.log('Signup attempt tracked');
        }
      } catch (trackError) {
        console.warn('Error tracking signup:', trackError);
        // Continue anyway
      }

      // Create auth user
      console.log('Creating auth user with:', {
        email: formData.email,
        redirectTo: `${window.location.origin}/login` 
      });

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
            role: userType === 'enterprise' ? 'admin' : 
                  userType === 'individual' ? 'employee' : 'customer',
            user_type: userType
          },
          emailRedirectTo: `${window.location.origin}/login` 
        }
      });

      if (authError) {
        console.error('Auth error details:', {
          message: authError.message,
          status: authError.status,
          name: authError.name
        });
        
        if (authError.message.includes('User already registered')) {
          setError('An account with this email already exists. Please login instead.');
        } else if (authError.message.includes('Invalid API key')) {
          setError('Authentication service error. Please try again later.');
          console.error('API Key issue - check your VITE_SUPABASE_ANON_KEY environment variable');
        } else {
          setError(authError.message);
        }
        setLoading(false);
        return;
      }

      if (!authData.user) {
        setError('Failed to create user account');
        setLoading(false);
        return;
      }

      console.log('User created successfully:', authData.user.id);

      // For enterprise users, create organization
      if (userType === 'enterprise' && formData.organizationName) {
        try {
          const { data: orgData, error: orgError } = await supabase
            .from('organizations')
            .insert([{
              name: formData.organizationName,
              slug: formData.organizationName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
              email: formData.email
            }])
            .select()
            .single();

          if (orgError) {
            console.error('Organization creation error:', orgError);
          } else if (orgData) {
            console.log('Organization created:', orgData.id);

            // Update user with organization
            await supabase
              .from('users')
              .update({ organization_id: orgData.id })
              .eq('id', authData.user.id);

            // Create trial subscription
            await supabase.from('organization_subscriptions').insert([{
              organization_id: orgData.id,
              status: 'trialing',
              trial_start: new Date().toISOString(),
              trial_end: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
              billing_cycle: 'monthly'
            }]);

            // Create onboarding progress
            await supabase.from('onboarding_progress').insert([{
              user_id: authData.user.id,
              organization_id: orgData.id,
              current_step: 0,
              steps_completed: '[]',
              steps_skipped: '[]'
            }]);
          }
        } catch (orgError) {
          console.warn('Organization creation failed:', orgError);
          // Continue - user can set up organization later
        }
      }

      // Update signup attempt status
      try {
        await supabase
          .from('signup_attempts')
          .update({ status: 'completed' })
          .eq('email', formData.email)
          .eq('status', 'pending');
      } catch (updateError) {
        console.warn('Failed to update signup status:', updateError);
      }

      setSuccess(true);
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login', { 
          state: { 
            message: 'Account created successfully! Please check your email for verification.' 
          }
        });
      }, 3000);

    } catch (err: any) {
      console.error('Signup error:', err);
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={40} className="text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Account Created!</h2>
          <p className="text-gray-600 mb-6">
            We've sent a verification link to <strong>{formData.email}</strong>. Please check your inbox.
          </p>
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-sm text-gray-500 mt-4">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-2xl">WS</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Create Account</h1>
          <p className="text-gray-600 mt-2">Join WorkSphere AI today</p>
        </div>

        {/* User Type Selection (only on step 1) */}
        {step === 1 && (
          <div className="bg-white rounded-2xl shadow-xl p-6 mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              I want to sign up as:
            </label>
            <div className="grid grid-cols-3 gap-3">
              {(['enterprise', 'individual', 'customer'] as UserType[]).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setUserType(type)}
                  className={`p-3 border rounded-xl text-center transition ${
                    userType === type
                      ? 'border-blue-600 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                >
                  <span className="text-sm font-medium capitalize text-gray-900">{type === 'enterprise' ? 'Enterprise' : type === 'individual' ? 'Individual' : 'Customer'}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Signup Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {step === 1 ? (
              <>
                {/* Full Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="John Doe"
                      required
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="you@example.com"
                      required
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="••••••••"
                      minLength={6}
                      required
                    />
                  </div>
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="••••••••"
                      required
                    />
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* Organization Name (for enterprise) */}
                {userType === 'enterprise' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Organization Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                      <input
                        type="text"
                        name="organizationName"
                        value={formData.organizationName}
                        onChange={handleChange}
                        className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Acme Inc."
                        required={userType === 'enterprise'}
                      />
                    </div>
                  </div>
                )}

                {/* Phone (optional) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number <span className="text-gray-400">(optional)</span>
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="+250 788 123 456"
                  />
                </div>

                {/* Terms */}
                <div className="pt-2">
                  <label className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      name="acceptTerms"
                      checked={formData.acceptTerms}
                      onChange={handleChange}
                      className="mt-1"
                      required
                    />
                    <span className="text-sm text-gray-600">
                      I agree to the{' '}
                      <a href="/terms" className="text-blue-600 hover:text-blue-700">Terms of Service</a>
                      {' '}and{' '}
                      <a href="/privacy" className="text-blue-600 hover:text-blue-700">Privacy Policy</a>
                      . <span className="text-red-500">*</span>
                    </span>
                  </label>
                </div>
              </>
            )}

            {/* Error Message */}
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
                <AlertCircle className="text-red-500 flex-shrink-0" size={18} />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {/* Buttons */}
            <div className="flex gap-3 pt-4">
              {step === 2 && (
                <button
                  type="button"
                  onClick={handleBack}
                  className="flex-1 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 font-medium"
                >
                  Back
                </button>
              )}
              <button
                type="submit"
                disabled={loading}
                className={`${step === 2 ? 'flex-1' : 'w-full'} py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 font-medium disabled:opacity-50 flex items-center justify-center gap-2`}
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Processing...
                  </>
                ) : step === 1 ? (
                  <>
                    Continue
                    <ArrowRight size={18} />
                  </>
                ) : (
                  'Create Account'
                )}
              </button>
            </div>
          </form>

          {/* Login Link */}
          <p className="text-center mt-6 text-sm text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-600 hover:text-blue-700 font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
