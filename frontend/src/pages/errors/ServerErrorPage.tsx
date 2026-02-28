// src/pages/errors/ServerErrorPage.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

export const ServerErrorPage: React.FC = () => {
  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="w-24 h-24 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertTriangle size={48} className="text-orange-600" />
        </div>
        
        <h1 className="text-4xl font-bold text-gray-900 mb-2">500</h1>
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">Server Error</h2>
        <p className="text-gray-600 mb-8">
          Something went wrong on our end. We're working to fix it. Please try again later.
        </p>

        <div className="space-y-3">
          <button
            onClick={handleRefresh}
            className="block w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2"
          >
            <RefreshCw size={18} />
            Try Again
          </button>
          
          <Link
            to="/"
            className="block w-full py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition flex items-center justify-center gap-2"
          >
            <Home size={18} />
            Go to Home
          </Link>
        </div>

        <p className="mt-6 text-sm text-gray-500">
          If problem persists, <a href="/support" className="text-blue-600 hover:underline">contact support</a>
        </p>
      </div>
    </div>
  );
};
