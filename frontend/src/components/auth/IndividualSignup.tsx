// src/components/auth/IndividualSignup.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Mail,
  Shield,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Loader2,
  Eye,
  EyeOff,
  Briefcase,
  Calendar,
  MapPin,
  Zap
} from 'lucide-react';
import { signupService } from '../../services/signupService';
import { userService } from '../../services/userService';
import { useAuth } from '../../contexts/AuthContext';
import { ROUTES } from '../../config/routes';

interface PersonalInfo {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  jobTitle: string;
  company: string;
  location: string;
  experience: string;
}

export const IndividualSignup: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [personalInfo, setPersonalInfo] = useState<PersonalInfo>({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    jobTitle: '',
    company: '',
    location: '',
    experience: ''
  });

  const { login } = useAuth();

  const experienceLevels = [
    'Student',
    'Junior (0-2 years)',
    'Mid-level (2-5 years)',
    'Senior (5-10 years)',
    'Expert (10+ years)',
    'Executive'
  ];

  const jobTitles = [
    'Software Developer',
    'Designer',
    'Project Manager',
    'Marketing',
    'Sales',
    'Consultant',
    'Freelancer',
    'Entrepreneur',
    'Analyst',
    'Other'
  ];

  useEffect(() => {
    // Track signup start
    signupService.trackSignupEvent('individual_signup_started', 'individual', 'personal_info');
  }, []);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!personalInfo.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    } else if (personalInfo.fullName.length < 2) {
      newErrors.fullName = 'Full name must be at least 2 characters';
    }

    if (!personalInfo.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!isValidEmail(personalInfo.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!personalInfo.password) {
      newErrors.password = 'Password is required';
    } else if (personalInfo.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!isStrongPassword(personalInfo.password)) {
      newErrors.password = 'Password must contain uppercase, lowercase, and numbers';
    }

    if (!personalInfo.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (personalInfo.password !== personalInfo.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!personalInfo.jobTitle) {
      newErrors.jobTitle = 'Please select your job title';
    }

    if (!personalInfo.experience) {
      newErrors.experience = 'Please select your experience level';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidEmail = (email: string): boolean => {
    return /\S+@\S+\.\S+/.test(email);
  };

  const isStrongPassword = (password: string): boolean => {
    return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    setErrors({});

    try {
      // Check if email is available
      const isEmailAvailable = await signupService.isEmailAvailable(personalInfo.email);
      if (!isEmailAvailable) {
        setErrors({ email: 'This email is already registered' });
        return;
      }

      // Create signup attempt
      await signupService.createSignupAttempt({
        email: personalInfo.email,
        user_type: 'individual',
        full_name: personalInfo.fullName,
        metadata: {
          personal: personalInfo
        }
      });

      // Create auth user + user record
      await userService.createAuthUser(personalInfo.email, personalInfo.password, {
        email: personalInfo.email,
        full_name: personalInfo.fullName,
        role: 'employee',
        settings: {
          signup_source: 'individual',
          location: personalInfo.location
        }
      });

      // Track signup completion
      await signupService.trackSignupEvent('individual_signup_completed', 'individual', 'account_created');

      // Immediately sign the user in and redirect to dashboard
      await login(personalInfo.email, personalInfo.password);
      navigate(ROUTES.protected.dashboard);

    } catch (error: any) {
      console.error('Error creating signup:', error);
      setErrors({ general: error.message || 'An error occurred. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-green-50">
      {/* Background Pattern */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-green-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-emerald-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
      </div>

      <div className="relative z-10">
        {/* Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-4xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl flex items-center justify-center">
                  <User className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-xl font-bold text-gray-900">WorkSphere AI</h1>
              </div>
              <button
                onClick={() => navigate('/signup')}
                className="text-gray-500 hover:text-gray-700"
                title="Go back to signup options"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Form Content */}
        <div className="max-w-4xl mx-auto px-6 py-12">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Create your individual account
              </h2>
              <p className="text-gray-600">
                Join thousands of professionals using WorkSphere AI to boost their productivity
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      value={personalInfo.fullName}
                      onChange={(e) => setPersonalInfo({ ...personalInfo, fullName: e.target.value })}
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                        errors.fullName ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="John Doe"
                      disabled={loading}
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="email"
                      value={personalInfo.email}
                      onChange={(e) => setPersonalInfo({ ...personalInfo, email: e.target.value })}
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                        errors.email ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="john@example.com"
                      disabled={loading}
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Job Title *
                  </label>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <select
                      value={personalInfo.jobTitle}
                      onChange={(e) => setPersonalInfo({ ...personalInfo, jobTitle: e.target.value })}
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent appearance-none ${
                        errors.jobTitle ? 'border-red-500' : 'border-gray-300'
                      }`}
                      disabled={loading}
                      title="Select your job title"
                    >
                      <option value="">Select job title</option>
                      {jobTitles.map(title => (
                        <option key={title} value={title}>{title}</option>
                      ))}
                    </select>
                  </div>
                  {errors.jobTitle && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.jobTitle}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Experience Level *
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <select
                      value={personalInfo.experience}
                      onChange={(e) => setPersonalInfo({ ...personalInfo, experience: e.target.value })}
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent appearance-none ${
                        errors.experience ? 'border-red-500' : 'border-gray-300'
                      }`}
                      disabled={loading}
                      title="Select your experience level"
                    >
                      <option value="">Select experience level</option>
                      {experienceLevels.map(level => (
                        <option key={level} value={level}>{level}</option>
                      ))}
                    </select>
                  </div>
                  {errors.experience && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.experience}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Company (Optional)
                  </label>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      value={personalInfo.company}
                      onChange={(e) => setPersonalInfo({ ...personalInfo, company: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Acme Inc."
                      disabled={loading}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location (Optional)
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      value={personalInfo.location}
                      onChange={(e) => setPersonalInfo({ ...personalInfo, location: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Kigali, Rwanda"
                      disabled={loading}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password *
                  </label>
                  <div className="relative">
                    <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={personalInfo.password}
                      onChange={(e) => setPersonalInfo({ ...personalInfo, password: e.target.value })}
                      className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                        errors.password ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="••••••••"
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      disabled={loading}
                      title="Toggle password visibility"
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

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm Password *
                  </label>
                  <div className="relative">
                    <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={personalInfo.confirmPassword}
                      onChange={(e) => setPersonalInfo({ ...personalInfo, confirmPassword: e.target.value })}
                      className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                        errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="••••••••"
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      disabled={loading}
                      title="Toggle password visibility"
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.confirmPassword}
                    </p>
                  )}
                </div>
              </div>

              {/* Password Requirements */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Password Requirements:</h4>
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center text-sm">
                    <CheckCircle className={`w-4 h-4 mr-2 ${personalInfo.password.length >= 8 ? 'text-green-500' : 'text-gray-300'}`} />
                    At least 8 characters
                  </div>
                  <div className="flex items-center text-sm">
                    <CheckCircle className={`w-4 h-4 mr-2 ${/[a-z]/.test(personalInfo.password) ? 'text-green-500' : 'text-gray-300'}`} />
                    Contains lowercase
                  </div>
                  <div className="flex items-center text-sm">
                    <CheckCircle className={`w-4 h-4 mr-2 ${/[A-Z]/.test(personalInfo.password) ? 'text-green-500' : 'text-gray-300'}`} />
                    Contains uppercase
                  </div>
                  <div className="flex items-center text-sm">
                    <CheckCircle className={`w-4 h-4 mr-2 ${/\d/.test(personalInfo.password) ? 'text-green-500' : 'text-gray-300'}`} />
                    Contains number
                  </div>
                </div>
              </div>

              {errors.general && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-2" />
                    {errors.general}
                  </p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-medium hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  <>
                    Create Free Account
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>

            {/* Features Preview */}
            <div className="mt-8 pt-8 border-t border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">What you'll get with Individual</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <Zap className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-medium">AI Tools</h4>
                    <p className="text-sm text-gray-500">Smart productivity</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Shield className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-medium">Secure</h4>
                    <p className="text-sm text-gray-500">Data protection</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <User className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-medium">Mobile App</h4>
                    <p className="text-sm text-gray-500">Work anywhere</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Terms */}
            <div className="mt-6 text-center text-sm text-gray-600">
              By creating an account, you agree to our{' '}
              <a href="/terms" className="text-green-600 hover:text-green-700 font-medium">Terms of Service</a>{' '}
              and{' '}
              <a href="/privacy" className="text-green-600 hover:text-green-700 font-medium">Privacy Policy</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
