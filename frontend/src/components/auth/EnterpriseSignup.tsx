// src/components/auth/EnterpriseSignup.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2,
  Users,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Loader2,
  Mail,
  Phone,
  Globe,
  Briefcase,
  Shield,
  Zap,
  Eye,
  EyeOff
} from 'lucide-react';
import { signupService } from '../../services/signupService';
import { emailService } from '../../services/emailService';

interface CompanyInfo {
  name: string;
  website: string;
  industry: string;
  size: string;
  location: string;
  phone: string;
}

interface PersonalInfo {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  jobTitle: string;
}

export const EnterpriseSignup: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState('');

  const [companyInfo, setCompanyInfo] = useState<CompanyInfo>({
    name: '',
    website: '',
    industry: '',
    size: '',
    location: '',
    phone: ''
  });

  const [personalInfo, setPersonalInfo] = useState<PersonalInfo>({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    jobTitle: ''
  });

  const industries = [
    'Technology',
    'Finance',
    'Healthcare',
    'Education',
    'Real Estate',
    'Construction',
    'Retail',
    'Manufacturing',
    'Transportation',
    'Government',
    'Non-profit',
    'Consulting',
    'Legal',
    'Media',
    'Other'
  ];

  const companySizes = [
    '1-10',
    '11-50',
    '51-200',
    '201-500',
    '501-1000',
    '1000+'
  ];

  useEffect(() => {
    // Track signup start
    signupService.trackSignupEvent('enterprise_signup_started', 'enterprise', 'company_info');
  }, []);

  const validateCompanyInfo = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!companyInfo.name.trim()) {
      newErrors.name = 'Company name is required';
    } else if (companyInfo.name.length < 2) {
      newErrors.name = 'Company name must be at least 2 characters';
    }

    if (companyInfo.website && !isValidUrl(companyInfo.website)) {
      newErrors.website = 'Please enter a valid website URL';
    }

    if (!companyInfo.industry) {
      newErrors.industry = 'Please select an industry';
    }

    if (!companyInfo.size) {
      newErrors.size = 'Please select company size';
    }

    if (!companyInfo.location.trim()) {
      newErrors.location = 'Location is required';
    }

    if (companyInfo.phone && !isValidPhone(companyInfo.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validatePersonalInfo = (): boolean => {
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

    if (!personalInfo.jobTitle.trim()) {
      newErrors.jobTitle = 'Job title is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidEmail = (email: string): boolean => {
    return /\S+@\S+\.\S+/.test(email);
  };

  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const isValidPhone = (phone: string): boolean => {
    const cleanPhone = phone.replace(/\D/g, '');
    return cleanPhone.length >= 10 && cleanPhone.length <= 15;
  };

  const isStrongPassword = (password: string): boolean => {
    return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password);
  };

  const handleCompanyInfoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateCompanyInfo()) return;

    setLoading(true);
    setErrors({});

    try {
      // Check if company name is available
      const isAvailable = await signupService.isEmailAvailable(`${companyInfo.name.toLowerCase().replace(/\s+/g, '')}@company.com`);
      
      // Track step completion
      await signupService.trackSignupEvent('enterprise_company_info_completed', 'enterprise', 'personal_info');
      
      setStep(2);
    } catch (error) {
      console.error('Error validating company info:', error);
      setErrors({ general: 'An error occurred. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handlePersonalInfoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validatePersonalInfo()) return;

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
        phone: companyInfo.phone,
        user_type: 'enterprise',
        organization_name: companyInfo.name,
        full_name: personalInfo.fullName,
        metadata: {
          company: companyInfo,
          personal: personalInfo,
          jobTitle: personalInfo.jobTitle
        }
      });

      // Create email verification
      const verification = await signupService.createEmailVerification(personalInfo.email, 'signup');
      
      // Send verification email
      await emailService.sendVerificationEmail(
        personalInfo.email,
        verification.token,
        'enterprise'
      );

      // Track signup completion
      await signupService.trackSignupEvent('enterprise_signup_completed', 'enterprise', 'email_verification');

      // Navigate to verification page
      navigate('/verify-email', {
        state: {
          email: personalInfo.email,
          message: 'We\'ve sent a verification link to your email. Please check your inbox and click the link to complete your enterprise signup.',
          userType: 'enterprise'
        }
      });

    } catch (error: any) {
      console.error('Error creating signup:', error);
      setErrors({ general: error.message || 'An error occurred. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    setStep(step - 1);
    setErrors({});
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Background Pattern */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
      </div>

      <div className="relative z-10">
        {/* Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-4xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-xl font-bold text-gray-900">WorkSphere AI</h1>
              </div>
              <button
                onClick={() => navigate('/signup')}
                className="text-gray-500 hover:text-gray-700"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-4xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className={`flex items-center space-x-2 ${step >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200'
                  }`}>
                    {step > 1 ? <CheckCircle className="w-4 h-4" /> : '1'}
                  </div>
                  <span className="font-medium">Company Info</span>
                </div>
                <div className={`w-16 h-1 ${step >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
                <div className={`flex items-center space-x-2 ${step >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200'
                  }`}>
                    {step > 2 ? <CheckCircle className="w-4 h-4" /> : '2'}
                  </div>
                  <span className="font-medium">Personal Info</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Form Content */}
        <div className="max-w-4xl mx-auto px-6 py-12">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            {step === 1 ? (
              /* Company Information Step */
              <div>
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Tell us about your company
                  </h2>
                  <p className="text-gray-600">
                    Help us understand your organization to provide the best experience
                  </p>
                </div>

                <form onSubmit={handleCompanyInfoSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Company Name *
                      </label>
                      <div className="relative">
                        <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                          type="text"
                          value={companyInfo.name}
                          onChange={(e) => setCompanyInfo({ ...companyInfo, name: e.target.value })}
                          className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                            errors.name ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="Acme Corporation"
                          disabled={loading}
                        />
                      </div>
                      {errors.name && (
                        <p className="mt-1 text-sm text-red-600 flex items-center">
                          <AlertCircle className="w-4 h-4 mr-1" />
                          {errors.name}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Website
                      </label>
                      <div className="relative">
                        <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                          type="url"
                          value={companyInfo.website}
                          onChange={(e) => setCompanyInfo({ ...companyInfo, website: e.target.value })}
                          className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                            errors.website ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="https://acme.com"
                          disabled={loading}
                        />
                      </div>
                      {errors.website && (
                        <p className="mt-1 text-sm text-red-600 flex items-center">
                          <AlertCircle className="w-4 h-4 mr-1" />
                          {errors.website}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Industry *
                      </label>
                      <select
                        value={companyInfo.industry}
                        onChange={(e) => setCompanyInfo({ ...companyInfo, industry: e.target.value })}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          errors.industry ? 'border-red-500' : 'border-gray-300'
                        }`}
                        disabled={loading}
                      >
                        <option value="">Select industry</option>
                        {industries.map(industry => (
                          <option key={industry} value={industry}>{industry}</option>
                        ))}
                      </select>
                      {errors.industry && (
                        <p className="mt-1 text-sm text-red-600 flex items-center">
                          <AlertCircle className="w-4 h-4 mr-1" />
                          {errors.industry}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Company Size *
                      </label>
                      <select
                        value={companyInfo.size}
                        onChange={(e) => setCompanyInfo({ ...companyInfo, size: e.target.value })}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          errors.size ? 'border-red-500' : 'border-gray-300'
                        }`}
                        disabled={loading}
                      >
                        <option value="">Select size</option>
                        {companySizes.map(size => (
                          <option key={size} value={size}>{size} employees</option>
                        ))}
                      </select>
                      {errors.size && (
                        <p className="mt-1 text-sm text-red-600 flex items-center">
                          <AlertCircle className="w-4 h-4 mr-1" />
                          {errors.size}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Location *
                      </label>
                      <div className="relative">
                        <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                          type="text"
                          value={companyInfo.location}
                          onChange={(e) => setCompanyInfo({ ...companyInfo, location: e.target.value })}
                          className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                            errors.location ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="Kigali, Rwanda"
                          disabled={loading}
                        />
                      </div>
                      {errors.location && (
                        <p className="mt-1 text-sm text-red-600 flex items-center">
                          <AlertCircle className="w-4 h-4 mr-1" />
                          {errors.location}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                          type="tel"
                          value={companyInfo.phone}
                          onChange={(e) => setCompanyInfo({ ...companyInfo, phone: e.target.value })}
                          className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
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
                    className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Validating...
                      </>
                    ) : (
                      <>
                        Continue
                        <ArrowRight className="w-5 h-5" />
                      </>
                    )}
                  </button>
                </form>
              </div>
            ) : (
              /* Personal Information Step */
              <div>
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Your information
                  </h2>
                  <p className="text-gray-600">
                    Tell us about yourself to complete your enterprise signup
                  </p>
                </div>

                <form onSubmit={handlePersonalInfoSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name *
                      </label>
                      <div className="relative">
                        <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                          type="text"
                          value={personalInfo.fullName}
                          onChange={(e) => setPersonalInfo({ ...personalInfo, fullName: e.target.value })}
                          className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
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
                        Job Title *
                      </label>
                      <div className="relative">
                        <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                          type="text"
                          value={personalInfo.jobTitle}
                          onChange={(e) => setPersonalInfo({ ...personalInfo, jobTitle: e.target.value })}
                          className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                            errors.jobTitle ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="CEO, CTO, Manager"
                          disabled={loading}
                        />
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
                        Work Email *
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                          type="email"
                          value={personalInfo.email}
                          onChange={(e) => setPersonalInfo({ ...personalInfo, email: e.target.value })}
                          className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                            errors.email ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="john@acme.com"
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
                        Password *
                      </label>
                      <div className="relative">
                        <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={personalInfo.password}
                          onChange={(e) => setPersonalInfo({ ...personalInfo, password: e.target.value })}
                          className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
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

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Confirm Password *
                      </label>
                      <div className="relative">
                        <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          value={personalInfo.confirmPassword}
                          onChange={(e) => setPersonalInfo({ ...personalInfo, confirmPassword: e.target.value })}
                          className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
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
                    <div className="space-y-1">
                      <div className="flex items-center text-sm">
                        <CheckCircle className={`w-4 h-4 mr-2 ${personalInfo.password.length >= 8 ? 'text-green-500' : 'text-gray-300'}`} />
                        At least 8 characters
                      </div>
                      <div className="flex items-center text-sm">
                        <CheckCircle className={`w-4 h-4 mr-2 ${/[a-z]/.test(personalInfo.password) ? 'text-green-500' : 'text-gray-300'}`} />
                        Contains lowercase letter
                      </div>
                      <div className="flex items-center text-sm">
                        <CheckCircle className={`w-4 h-4 mr-2 ${/[A-Z]/.test(personalInfo.password) ? 'text-green-500' : 'text-gray-300'}`} />
                        Contains uppercase letter
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

                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={handleBack}
                      disabled={loading}
                      className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      <ArrowLeft className="w-5 h-5" />
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Creating Account...
                        </>
                      ) : (
                        <>
                          Create Account
                          <ArrowRight className="w-5 h-5" />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Features Preview */}
            <div className="mt-8 pt-8 border-t border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">What you'll get with Enterprise</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Users className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-medium">Unlimited Team</h4>
                    <p className="text-sm text-gray-500">No user limits</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <Shield className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-medium">Enterprise Security</h4>
                    <p className="text-sm text-gray-500">Bank-level protection</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Zap className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-medium">Priority Support</h4>
                    <p className="text-sm text-gray-500">24/7 assistance</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
