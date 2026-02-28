// src/components/auth/CustomerSignup.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Mail,
  Shield,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Loader2,
  Eye,
  EyeOff,
  FileText,
  Headphones,
  CreditCard,
  Phone,
  Building2
} from 'lucide-react';
import { signupService } from '../../services/signupService';
import { emailService } from '../../services/emailService';

interface CustomerInfo {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone: string;
  companyName: string;
  customerType: string;
}

export const CustomerSignup: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    companyName: '',
    customerType: ''
  });

  const customerTypes = [
    'Existing Customer',
    'New Customer',
    'Trial User',
    'Partner',
    'Reseller'
  ];

  useEffect(() => {
    // Track signup start
    signupService.trackSignupEvent('customer_signup_started', 'customer', 'customer_info');
  }, []);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!customerInfo.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    } else if (customerInfo.fullName.length < 2) {
      newErrors.fullName = 'Full name must be at least 2 characters';
    }

    if (!customerInfo.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!isValidEmail(customerInfo.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!customerInfo.password) {
      newErrors.password = 'Password is required';
    } else if (customerInfo.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!isStrongPassword(customerInfo.password)) {
      newErrors.password = 'Password must contain uppercase, lowercase, and numbers';
    }

    if (!customerInfo.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (customerInfo.password !== customerInfo.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!customerInfo.companyName.trim()) {
      newErrors.companyName = 'Company name is required';
    }

    if (!customerInfo.customerType) {
      newErrors.customerType = 'Please select customer type';
    }

    if (customerInfo.phone && !isValidPhone(customerInfo.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidEmail = (email: string): boolean => {
    return /\S+@\S+\.\S+/.test(email);
  };

  const isValidPhone = (phone: string): boolean => {
    const cleanPhone = phone.replace(/\D/g, '');
    return cleanPhone.length >= 10 && cleanPhone.length <= 15;
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
      const isEmailAvailable = await signupService.isEmailAvailable(customerInfo.email);
      if (!isEmailAvailable) {
        setErrors({ email: 'This email is already registered' });
        return;
      }

      // Create signup attempt
      await signupService.createSignupAttempt({
        email: customerInfo.email,
        phone: customerInfo.phone,
        user_type: 'customer',
        full_name: customerInfo.fullName,
        organization_name: customerInfo.companyName,
        metadata: {
          customer: customerInfo
        }
      });

      // Create email verification
      const verification = await signupService.createEmailVerification(customerInfo.email, 'signup');
      
      // Send verification email
      await emailService.sendVerificationEmail(
        customerInfo.email,
        verification.token,
        'customer'
      );

      // Track signup completion
      await signupService.trackSignupEvent('customer_signup_completed', 'customer', 'email_verification');

      // Navigate to verification page
      navigate('/verify-email', {
        state: {
          email: customerInfo.email,
          message: 'We\'ve sent a verification link to your email. Please check your inbox and click the link to access your customer portal.',
          userType: 'customer'
        }
      });

    } catch (error: any) {
      console.error('Error creating signup:', error);
      setErrors({ general: error.message || 'An error occurred. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50">
      {/* Background Pattern */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
      </div>

      <div className="relative z-10">
        {/* Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-4xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-white" />
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
                Access your customer portal
              </h2>
              <p className="text-gray-600">
                Manage your account, billing, and support tickets in one place
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <div className="relative">
                    <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      value={customerInfo.fullName}
                      onChange={(e) => setCustomerInfo({ ...customerInfo, fullName: e.target.value })}
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 ${
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
                      value={customerInfo.email}
                      onChange={(e) => setCustomerInfo({ ...customerInfo, email: e.target.value })}
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 ${
                        errors.email ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="john@company.com"
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
                    Company Name *
                  </label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      value={customerInfo.companyName}
                      onChange={(e) => setCustomerInfo({ ...customerInfo, companyName: e.target.value })}
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 ${
                        errors.companyName ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Acme Corporation"
                      disabled={loading}
                    />
                  </div>
                  {errors.companyName && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.companyName}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Customer Type *
                  </label>
                  <div className="relative">
                    <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <select
                      value={customerInfo.customerType}
                      onChange={(e) => setCustomerInfo({ ...customerInfo, customerType: e.target.value })}
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent appearance-none text-gray-900 ${
                        errors.customerType ? 'border-red-500' : 'border-gray-300'
                      }`}
                      disabled={loading}
                      title="Select your customer type"
                    >
                      <option value="">Select customer type</option>
                      {customerTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>
                  {errors.customerType && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.customerType}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number (Optional)
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="tel"
                      value={customerInfo.phone}
                      onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 ${
                        errors.phone ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="+250 788 123 456"
                      disabled={loading}
                    />
                  </div>
                  {errors.phone && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.phone}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password *
                  </label>
                  <div className="relative">
                    <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={customerInfo.password}
                      onChange={(e) => setCustomerInfo({ ...customerInfo, password: e.target.value })}
                      className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 ${
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
                      value={customerInfo.confirmPassword}
                      onChange={(e) => setCustomerInfo({ ...customerInfo, confirmPassword: e.target.value })}
                      className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 ${
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
                    <CheckCircle className={`w-4 h-4 mr-2 ${customerInfo.password.length >= 8 ? 'text-green-500' : 'text-gray-300'}`} />
                    At least 8 characters
                  </div>
                  <div className="flex items-center text-sm">
                    <CheckCircle className={`w-4 h-4 mr-2 ${/[a-z]/.test(customerInfo.password) ? 'text-green-500' : 'text-gray-300'}`} />
                    Contains lowercase
                  </div>
                  <div className="flex items-center text-sm">
                    <CheckCircle className={`w-4 h-4 mr-2 ${/[A-Z]/.test(customerInfo.password) ? 'text-green-500' : 'text-gray-300'}`} />
                    Contains uppercase
                  </div>
                  <div className="flex items-center text-sm">
                    <CheckCircle className={`w-4 h-4 mr-2 ${/\d/.test(customerInfo.password) ? 'text-green-500' : 'text-gray-300'}`} />
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
                className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-medium hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  <>
                    Create Customer Account
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>

            {/* Features Preview */}
            <div className="mt-8 pt-8 border-t border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Portal Features</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <FileText className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-medium">Document Access</h4>
                    <p className="text-sm text-gray-500">View contracts & files</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center">
                    <Headphones className="w-5 h-5 text-pink-600" />
                  </div>
                  <div>
                    <h4 className="font-medium">Support Tickets</h4>
                    <p className="text-sm text-gray-500">Get help anytime</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                    <CreditCard className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <h4 className="font-medium">Invoice History</h4>
                    <p className="text-sm text-gray-500">Billing & payments</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Login Link */}
            <p className="text-center mt-6 text-sm text-gray-600">
              Already have a customer account?{' '}
              <a href="/login?type=customer" className="text-purple-600 hover:text-purple-700 font-medium">
                Sign in to portal
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
