// src/pages/TestSupabasePage.tsx
import React, { useState } from 'react';
import { testSupabaseConnection } from '../lib/testSupabase';

export const TestSupabasePage: React.FC = () => {
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const runTest = async () => {
    setLoading(true);
    setResult('Running tests...');
    
    // Capture console logs
    const logs: string[] = [];
    const originalLog = console.log;
    const originalError = console.error;
    
    console.log = (...args) => {
      logs.push(args.join(' '));
      originalLog.apply(console, args);
    };
    
    console.error = (...args) => {
      logs.push('❌ ' + args.join(' '));
      originalError.apply(console, args);
    };

    await testSupabaseConnection();

    console.log = originalLog;
    console.error = originalError;
    
    setResult(logs.join('\n'));
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Supabase Connection Test</h1>
        
        <button
          onClick={runTest}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Testing...' : 'Run Test'}
        </button>

        {result && (
          <pre className="mt-4 p-4 bg-gray-900 text-green-400 rounded-lg overflow-auto max-h-96 text-sm">
            {result}
          </pre>
        )}

        <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded">
          <h2 className="font-semibold mb-2">Environment Variables:</h2>
          <p>VITE_SUPABASE_URL: {import.meta.env.VITE_SUPABASE_URL ? '✅ Set' : '❌ Missing'}</p>
          <p>VITE_SUPABASE_ANON_KEY: {import.meta.env.VITE_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing'}</p>
          <p>VITE_APP_URL: {import.meta.env.VITE_APP_URL ? '✅ Set' : '❌ Missing'}</p>
        </div>
      </div>
    </div>
  );
};
