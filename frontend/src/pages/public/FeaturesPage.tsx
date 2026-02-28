// src/pages/public/FeaturesPage.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../config/routes';

export const FeaturesPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Powerful Features for Modern Teams
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Everything you need to run your business efficiently, all in one intelligent platform.
          </p>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            
            {/* Communication */}
            <div className="bg-white p-8 rounded-xl shadow-lg">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">Smart Messaging</h3>
              <p className="text-gray-600 mb-4">
                AI-powered chat with intelligent message routing, automated responses, and smart notifications.
              </p>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• Real-time collaboration</li>
                <li>• AI message suggestions</li>
                <li>• Smart notifications</li>
                <li>• Threaded conversations</li>
              </ul>
            </div>

            {/* Task Management */}
            <div className="bg-white p-8 rounded-xl shadow-lg">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">Task Management</h3>
              <p className="text-gray-600 mb-4">
                Intelligent task tracking with automated prioritization and smart deadline management.
              </p>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• AI-powered prioritization</li>
                <li>• Automated assignments</li>
                <li>• Progress tracking</li>
                <li>• Deadline management</li>
              </ul>
            </div>

            {/* Analytics */}
            <div className="bg-white p-8 rounded-xl shadow-lg">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">Advanced Analytics</h3>
              <p className="text-gray-600 mb-4">
                Real-time insights with AI-driven recommendations and predictive analytics.
              </p>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• Real-time dashboards</li>
                <li>• AI recommendations</li>
                <li>• Predictive analytics</li>
                <li>• Custom reports</li>
              </ul>
            </div>

            {/* Documents */}
            <div className="bg-white p-8 rounded-xl shadow-lg">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">Document Management</h3>
              <p className="text-gray-600 mb-4">
                Secure document storage with version control and intelligent search capabilities.
              </p>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• Cloud storage</li>
                <li>• Version control</li>
                <li>• AI-powered search</li>
                <li>• Secure sharing</li>
              </ul>
            </div>

            {/* Approvals */}
            <div className="bg-white p-8 rounded-xl shadow-lg">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">Approval Workflows</h3>
              <p className="text-gray-600 mb-4">
                Streamlined approval processes with automated routing and audit trails.
              </p>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• Automated routing</li>
                <li>• Audit trails</li>
                <li>• Multi-level approvals</li>
                <li>• Status tracking</li>
              </ul>
            </div>

            {/* Integrations */}
            <div className="bg-white p-8 rounded-xl shadow-lg">
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">Integrations</h3>
              <p className="text-gray-600 mb-4">
                Connect with your favorite tools and services for seamless workflow integration.
              </p>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• 100+ integrations</li>
                <li>• API access</li>
                <li>• Webhook support</li>
                <li>• Custom integrations</li>
              </ul>
            </div>

          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-blue-600 py-20">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Experience All These Features Today
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Start your free trial and see how WorkSphere AI can transform your business.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to={ROUTES.public.signup}
              className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
            >
              Start Free Trial
            </Link>
            <Link
              to={ROUTES.public.pricing}
              className="bg-transparent text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors border border-white"
            >
              View Pricing Plans
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
