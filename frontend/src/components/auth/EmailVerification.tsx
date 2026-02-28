// src/components/auth/EmailVerification.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Mail,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  ArrowRight,
  Sparkles,
  Loader2
} from 'lucide-react';
import { signupService } from '../../services/signupService';

export const EmailVerification: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [, setVerifying] = useState(false);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resendDisabled, setResendDisabled] = useState(false);
  const [countdown, setCountdown] = useState(60);

  const { email, message, userType } = location.state || {
    email: '',
    message: 'We\'ve sent a verification link to your email.',
    userType: 'enterprise'
  };

  useEffect(() => {
    // Check for verification token in URL
    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    
    if (token) {
      handleVerify(token);
    }
  }, [location]);

  useEffect(() => {
    let timer: number;
    if (resendDisabled && countdown > 0) {
      timer = window.setTimeout(() => setCountdown(countdown - 1), 1000);
    } else if (countdown === 0) {
      setResendDisabled(false);
      setCountdown(60);
    }
    return () => window.clearTimeout(timer);
  }, [resendDisabled, countdown]);

  const handleVerify = async (token: string) => {
    setVerifying(true);
    setError(null);

    try {
      await signupService.verifyEmail(token);
      setVerified(true);
      
      // Track verification success
      await signupService.trackSignupEvent('email_verified', userType, 'onboarding');
      
      // Redirect to onboarding after 3 seconds
      setTimeout(() => {
        if (userType === 'customer') {
          navigate('/customer-portal');
        } else {
          navigate('/onboarding');
        }
      }, 3000);
    } catch (err: any) {
      setError(err.message);
      // Track verification failure
      await signupService.trackSignupEvent('email_verification_failed', userType, 'email_verification');
    } finally {
      setVerifying(false);
    }
  };

  const handleResend = async () => {
    setLoading(true);
    setError(null);

    try {
      await signupService.resendVerificationEmail(email);
      setResendDisabled(true);
      
      // Track resend event
      await signupService.trackSignupEvent('email_verification_resent', userType, 'email_verification');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (verified) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle size={40} className="text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Email Verified!</h1>
            <p className="text-gray-600 mb-6">
              Your email has been successfully verified. Redirecting you to complete your setup...
            </p>
            <div className="flex justify-center">
              <Loader2 className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Mail size={40} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Check Your Email</h1>
          <p className="text-gray-600 mt-2">{message}</p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Email Display */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
            <p className="text-sm text-blue-800 text-center">
              We sent a verification link to<br />
              <span className="font-semibold">{email}</span>
            </p>
          </div>

          {/* Instructions */}
          <div className="space-y-4 mb-8">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-blue-600 text-sm font-medium">1</span>
              </div>
              <p className="text-sm text-gray-600">
                Open the email we sent to <span className="font-medium">{email}</span>
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-blue-600 text-sm font-medium">2</span>
              </div>
              <p className="text-sm text-gray-600">
                Click the verification link in the email
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-blue-600 text-sm font-medium">3</span>
              </div>
              <p className="text-sm text-gray-600">
                You'll be redirected to complete your setup
              </p>
            </div>
          </div>

          {/* Tips */}
          <div className="bg-gray-50 rounded-xl p-4 mb-6">
            <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <Sparkles size={16} className="text-yellow-500" />
              Quick Tips
            </h3>
            <ul className="text-xs text-gray-600 space-y-2">
              <li>• Check your spam folder if you don't see the email</li>
              <li>• Add noreply@worksphere.ai to your contacts</li>
              <li>• The link expires in 24 hours</li>
              <li>• Make sure to click the most recent verification email</li>
            </ul>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 mb-6">
              <AlertCircle className="text-red-500 flex-shrink-0" size={18} />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Actions */}
          <div className="space-y-3">
            <button
              onClick={handleResend}
              disabled={loading || resendDisabled}
              className="w-full py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 font-medium disabled:opacity-50 flex items-center justify-center gap-2"
              title="Resend verification email"
            >
              <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
              {resendDisabled 
                ? `Resend available in ${countdown}s` 
                : loading 
                  ? 'Sending...' 
                  : 'Resend Email'
              }
            </button>

            <button
              onClick={() => navigate('/login')}
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 font-medium flex items-center justify-center gap-2"
              title="Go to login page"
            >
              Go to Login
              <ArrowRight size={18} />
            </button>
          </div>
        </div>

        {/* Help Link */}
        <p className="text-center mt-6 text-sm text-gray-600">
          Need help?{' '}
          <a href="/support" className="text-blue-600 hover:text-blue-700 font-medium">
            Contact Support
          </a>
        </p>
      </div>
    </div>
  );
};
