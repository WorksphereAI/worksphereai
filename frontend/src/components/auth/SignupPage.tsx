// src/components/auth/SignupPage.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2,
  User,
  Users,
  ArrowRight,
  CheckCircle,
  Sparkles,
  Globe,
  Shield,
  Zap,
  HeadphonesIcon
} from 'lucide-react';

export const SignupPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedType, setSelectedType] = useState<'enterprise' | 'individual' | 'customer' | null>(null);

  const userTypes = [
    {
      id: 'enterprise',
      title: 'Enterprise',
      subtitle: 'For teams and organizations',
      icon: <Building2 className="w-8 h-8" />,
      description: 'Complete workspace solution with team collaboration, advanced security, and enterprise features.',
      features: [
        'Unlimited team members',
        'Advanced security & compliance',
        'Custom integrations',
        'Priority support',
        'Advanced analytics',
        'SSO & directory sync'
      ],
      color: 'from-blue-600 to-indigo-600',
      recommended: true
    },
    {
      id: 'individual',
      title: 'Individual',
      subtitle: 'For professionals and freelancers',
      icon: <User className="w-8 h-8" />,
      description: 'Personal productivity tools with AI-powered features to help you achieve more.',
      features: [
        'Personal workspace',
        'AI-powered tools',
        'Project management',
        'Time tracking',
        'Basic analytics',
        'Mobile app access'
      ],
      color: 'from-green-600 to-emerald-600',
      recommended: false
    },
    {
      id: 'customer',
      title: 'Customer Portal',
      subtitle: 'For existing customers',
      icon: <Users className="w-8 h-8" />,
      description: 'Access your account, manage subscriptions, and get support for your WorkSphere services.',
      features: [
        'Account management',
        'Billing & invoices',
        'Support tickets',
        'Document access',
        'Service updates',
        'Community access'
      ],
      color: 'from-purple-600 to-pink-600',
      recommended: false
    }
  ];

  const handleSelectType = (type: 'enterprise' | 'individual' | 'customer') => {
    setSelectedType(type);
    setTimeout(() => {
      navigate(`/signup/${type}`);
    }, 300);
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
        <div className="text-center pt-12 pb-8">
          <div className="flex items-center justify-center space-x-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
              <Building2 className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">WorkSphere AI</h1>
          </div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-3">
            Choose Your Path
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Select the option that best describes your needs. Each path is tailored to provide you with the right tools and features.
          </p>
        </div>

        {/* User Type Selection */}
        <div className="max-w-6xl mx-auto px-6 pb-12">
          <div className="grid md:grid-cols-3 gap-8">
            {userTypes.map((type) => (
              <div
                key={type.id}
                onClick={() => handleSelectType(type.id as any)}
                className={`relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer overflow-hidden group ${
                  selectedType === type.id ? 'ring-4 ring-blue-500 scale-105' : ''
                }`}
              >
                {/* Recommended Badge */}
                {type.recommended && (
                  <div className="absolute top-4 right-4 z-10">
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
                      RECOMMENDED
                    </div>
                  </div>
                )}

                {/* Header */}
                <div className={`h-32 bg-gradient-to-r ${type.color} flex items-center justify-center relative overflow-hidden`}>
                  <div className="absolute inset-0 bg-black opacity-10"></div>
                  <div className="relative z-10 text-white">
                    {type.icon}
                  </div>
                  <div className="absolute -right-4 -top-4 w-24 h-24 bg-white opacity-10 rounded-full"></div>
                  <div className="absolute -left-4 -bottom-4 w-32 h-32 bg-white opacity-10 rounded-full"></div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <div className="mb-4">
                    <h3 className="text-xl font-bold text-gray-900 mb-1">{type.title}</h3>
                    <p className="text-sm text-gray-500">{type.subtitle}</p>
                  </div>

                  <p className="text-gray-600 text-sm mb-6 leading-relaxed">
                    {type.description}
                  </p>

                  {/* Features */}
                  <div className="space-y-3 mb-6">
                    {type.features.slice(0, 3).map((feature, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                        <span className="text-sm text-gray-600">{feature}</span>
                      </div>
                    ))}
                    {type.features.length > 3 && (
                      <p className="text-xs text-gray-500 ml-6">
                        +{type.features.length - 3} more features
                      </p>
                    )}
                  </div>

                  {/* CTA Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectType(type.id as any);
                    }}
                    className={`w-full py-3 px-4 bg-gradient-to-r ${type.color} text-white rounded-xl font-medium hover:opacity-90 transition-opacity flex items-center justify-center space-x-2 group-hover:scale-105 transform transition-transform`}
                  >
                    <span>Get Started</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

                {/* Hover Effect Overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white opacity-0 group-hover:opacity-5 transition-opacity"></div>
              </div>
            ))}
          </div>

          {/* Trust Indicators */}
          <div className="mt-16 text-center">
            <div className="inline-flex items-center space-x-8 text-sm text-gray-500">
              <div className="flex items-center space-x-2">
                <Shield className="w-4 h-4" />
                <span>Bank-level security</span>
              </div>
              <div className="flex items-center space-x-2">
                <Zap className="w-4 h-4" />
                <span>Lightning fast</span>
              </div>
              <div className="flex items-center space-x-2">
                <Globe className="w-4 h-4" />
                <span>Global scale</span>
              </div>
              <div className="flex items-center space-x-2">
                <HeadphonesIcon className="w-4 h-4" />
                <span>24/7 support</span>
              </div>
            </div>
          </div>

          {/* Bottom CTA */}
          <div className="mt-12 text-center">
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8">
              <div className="flex items-center justify-center mb-4">
                <Sparkles className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Not sure which plan is right for you?
              </h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                Our team can help you choose the perfect solution based on your specific needs and requirements.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => navigate('/contact-sales')}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium hover:opacity-90 transition-opacity"
                >
                  Talk to Sales
                </button>
                <button
                  onClick={() => navigate('/demo')}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                >
                  Request Demo
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center py-8 border-t border-gray-200">
          <p className="text-gray-600 mb-4">
            Already have an account?{' '}
            <button
              onClick={() => navigate('/login')}
              className="text-blue-600 hover:text-blue-700 font-medium"
              title="Sign in to your existing account"
            >
              Sign in
            </button>
          </p>
          <div className="flex items-center justify-center space-x-6 text-xs text-gray-500">
            <a href="/privacy" className="hover:text-gray-700">Privacy Policy</a>
            <a href="/terms" className="hover:text-gray-700">Terms of Service</a>
            <a href="/security" className="hover:text-gray-700">Security</a>
            <a href="/support" className="hover:text-gray-700">Support</a>
          </div>
        </div>
      </div>
    </div>
  );
};
