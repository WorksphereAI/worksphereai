// src/components/auth/PhoneVerification.tsx
import React, { useState, useEffect } from 'react';
import {
  Shield,
  ArrowLeft,
  ArrowRight,
  Loader2,
  CheckCircle,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { smsService } from '../../services/smsService';

interface PhoneVerificationProps {
  onVerified: (phone: string) => void;
  onBack?: () => void;
  initialPhone?: string;
  userId?: string;
}

export const PhoneVerification: React.FC<PhoneVerificationProps> = ({
  onVerified,
  onBack,
  initialPhone = '',
  userId
}) => {
  const [phone, setPhone] = useState(initialPhone);
  const [code, setCode] = useState('');
  const [step, setStep] = useState<'input' | 'verify'>('input');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);

  // Countdown timer for resend
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft]);

  const formatPhone = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length <= 3) return cleaned;
    if (cleaned.length <= 6) return `${cleaned.slice(0, 3)} ${cleaned.slice(3)}`;
    return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6, 9)}`;
  };

  const validatePhone = (phone: string): boolean => {
    const cleaned = phone.replace(/\D/g, '');
    return cleaned.length >= 10 && cleaned.length <= 15;
  };

  const handleSendCode = async () => {
    if (!validatePhone(phone)) {
      setError('Please enter a valid phone number');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Format phone to international format
      const formattedPhone = phone.startsWith('+') ? phone : `+${phone.replace(/\D/g, '')}`;
      
      await smsService.createPhoneVerification(formattedPhone, userId);
      setStep('verify');
      setSuccess('Verification code sent to your phone');
      setTimeLeft(60); // 60 seconds countdown
    } catch (err: any) {
      setError(err.message || 'Failed to send verification code');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (code.length !== 6) {
      setError('Please enter a 6-digit code');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const formattedPhone = phone.startsWith('+') ? phone : `+${phone.replace(/\D/g, '')}`;
      const isValid = await smsService.verifyPhone(formattedPhone, code);
      
      if (isValid) {
        setSuccess('Phone number verified successfully!');
        setTimeout(() => {
          onVerified(formattedPhone);
        }, 1500);
      } else {
        setError('Invalid verification code');
      }
    } catch (err: any) {
      setError(err.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (timeLeft > 0) return;

    setResending(true);
    setError(null);

    try {
      const formattedPhone = phone.startsWith('+') ? phone : `+${phone.replace(/\D/g, '')}`;
      await smsService.resendPhoneVerification(formattedPhone);
      setSuccess('New verification code sent');
      setTimeLeft(60);
    } catch (err: any) {
      setError(err.message || 'Failed to resend code');
    } finally {
      setResending(false);
    }
  };

  const handleBack = () => {
    setStep('input');
    setCode('');
    setError(null);
    setSuccess(null);
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Shield className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Phone Verification</h2>
            <p className="text-sm text-gray-500">
              {step === 'input' ? 'Enter your phone number' : 'Enter verification code'}
            </p>
          </div>
        </div>
        {onBack && step === 'input' && (
          <button
            onClick={onBack}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Go back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Error and Success Messages */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center space-x-2">
          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
          <p className="text-sm text-green-700">{success}</p>
        </div>
      )}

      {step === 'input' ? (
        /* Phone Input Step */
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number
            </label>
            <input
              type="tel"
              value={formatPhone(phone)}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="+250 788 123 456"
              disabled={loading}
            />
            <p className="mt-2 text-sm text-gray-500">
              We'll send a verification code to this number
            </p>
          </div>

          <button
            onClick={handleSendCode}
            disabled={loading || !validatePhone(phone)}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center space-x-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Sending Code...</span>
              </>
            ) : (
              <>
                <span>Send Verification Code</span>
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </div>
      ) : (
        /* Code Verification Step */
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Verification Code
            </label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              className="w-full px-4 py-3 text-center text-2xl font-mono border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="000000"
              disabled={loading}
              maxLength={6}
            />
            <p className="mt-2 text-sm text-gray-500">
              Enter the 6-digit code sent to {formatPhone(phone)}
            </p>
          </div>

          <div className="flex items-center justify-between">
            <button
              onClick={handleBack}
              className="text-gray-600 hover:text-gray-800 font-medium text-sm flex items-center space-x-1"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Change Number</span>
            </button>

            <button
              onClick={handleResendCode}
              disabled={resending || timeLeft > 0}
              className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center space-x-1 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw className={`w-4 h-4 ${resending ? 'animate-spin' : ''}`} />
              <span>
                {resending ? 'Resending...' : timeLeft > 0 ? `Resend (${timeLeft}s)` : 'Resend Code'}
              </span>
            </button>
          </div>

          <button
            onClick={handleVerifyCode}
            disabled={loading || code.length !== 6}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center space-x-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Verifying...</span>
              </>
            ) : (
              <>
                <CheckCircle className="w-5 h-5" />
                <span>Verify Phone Number</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};
