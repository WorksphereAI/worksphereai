// src/components/test/SMSTest.tsx
import React, { useState } from 'react';
import { smsService } from '../../services/smsService';

export const SMSTest: React.FC = () => {
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const testSendSMS = async () => {
    if (!phone || !message) {
      setError('Please enter both phone and message');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const success = await smsService.sendSMS({
        to: phone,
        message: message
      });
      
      setResult({ success, message: 'SMS sent successfully!' });
    } catch (err: any) {
      setError(err.message || 'Failed to send SMS');
    } finally {
      setLoading(false);
    }
  };

  const testPhoneVerification = async () => {
    if (!phone) {
      setError('Please enter a phone number');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const verification = await smsService.createPhoneVerification(phone);
      setResult({ 
        verification, 
        message: 'Phone verification created! Check your phone for the code.' 
      });
    } catch (err: any) {
      setError(err.message || 'Failed to create phone verification');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6">SMS Service Test</h2>
      
      {/* Test Form */}
      <div className="space-y-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Phone Number
          </label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="+250 788 123 456"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Message (for SMS test)
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="Enter your test message here..."
            rows={3}
          />
        </div>
      </div>

      {/* Test Buttons */}
      <div className="flex space-x-4 mb-6">
        <button
          onClick={testSendSMS}
          disabled={loading || !phone || !message}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Sending...' : 'Send SMS'}
        </button>

        <button
          onClick={testPhoneVerification}
          disabled={loading || !phone}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
        >
          {loading ? 'Creating...' : 'Test Phone Verification'}
        </button>
      </div>

      {/* Results */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg mb-4">
          <h3 className="text-red-800 font-medium mb-2">Error:</h3>
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {result && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <h3 className="text-green-800 font-medium mb-2">Success:</h3>
          <p className="text-green-700 mb-2">{result.message}</p>
          {result.verification && (
            <div className="mt-2 p-2 bg-green-100 rounded">
              <pre className="text-xs text-green-800">
                {JSON.stringify(result.verification, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}

      {/* Configuration Info */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-gray-800 font-medium mb-2">Configuration:</h3>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• API Key: {import.meta.env.VITE_AT_API_KEY ? '✅ Configured' : '❌ Missing'}</li>
          <li>• Username: {import.meta.env.VITE_AT_USERNAME ? '✅ Configured' : '❌ Missing'}</li>
          <li>• Service: Africa's Talking</li>
        </ul>
      </div>
    </div>
  );
};
