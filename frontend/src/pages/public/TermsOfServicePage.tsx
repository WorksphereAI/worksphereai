// src/pages/public/TermsOfServicePage.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, ArrowLeft, Shield } from 'lucide-react';

export const TermsOfServicePage: React.FC = () => {
  const lastUpdated = 'February 28, 2026';

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText size={32} className="text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Terms of Service</h1>
          <p className="text-gray-600">Last updated: {lastUpdated}</p>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="prose prose max-w-none">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">1. Acceptance of Terms</h2>
            <p className="text-gray-700 mb-4">
              By accessing and using WorkSphere AI ("the Service"), you agree to be bound by these Terms of Service. 
              If you do not agree to these terms, you may not access or use the Service.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mb-6">2. Description of Service</h2>
            <div className="space-y-4 text-gray-700">
              <p>
                WorkSphere AI is a comprehensive business management platform that provides tools for communication, 
                project management, document collaboration, customer relationship management, and business analytics.
              </p>
              <p>
                Our services include but are not limited to: team messaging, task management, 
                document storage and sharing, customer portal, administrative dashboard, 
                and integration capabilities with third-party services.
              </p>
            </div>

            <h2 className="text-2xl font-semibold text-gray-900 mb-6">3. User Accounts and Registration</h2>
            <div className="space-y-4 text-gray-700">
              <p>
                <strong>3.1 Account Creation.</strong> You must provide accurate, complete, and current information 
                when creating an account. You are responsible for maintaining the confidentiality of your account credentials.
              </p>
              <p>
                <strong>3.2 Account Security.</strong> You are responsible for maintaining the security of your account. 
                WorkSphere AI will never ask for your password via email or other unsolicited methods.
              </p>
              <p>
                <strong>3.3 Account Types.</strong> We offer different account types:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-6">
                <li><strong>Enterprise:</strong> Full-featured organizational accounts with advanced admin capabilities</li>
                <li><strong>Individual:</strong> Professional accounts for individual users and freelancers</li>
                <li><strong>Customer:</strong> Limited access for customer portal interactions</li>
              </ul>
            </div>

            <h2 className="text-2xl font-semibold text-gray-900 mb-6">4. Acceptable Use Policy</h2>
            <div className="space-y-4 text-gray-700">
              <p>
                <strong>4.1 Prohibited Uses.</strong> You may not use the Service for any illegal or unauthorized purposes, 
                including but not limited to:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-6">
                <li>Violating any applicable laws or regulations</li>
                <li>Infringing on intellectual property rights</li>
                <li>Transmitting harmful, threatening, or abusive content</li>
                <li>Spamming or sending unsolicited commercial messages</li>
                <li>Attempting to gain unauthorized access to our systems</li>
                <li>Interfering with or disrupting the Service or servers</li>
              </ul>
              <p>
                <strong>4.2 Data Usage.</strong> You must comply with all applicable data protection laws 
                and our Privacy Policy when using the Service.
              </p>
            </div>

            <h2 className="text-2xl font-semibold text-gray-900 mb-6">5. Privacy and Data Protection</h2>
            <div className="space-y-4 text-gray-700">
              <p>
                We respect your privacy and are committed to protecting your personal information. 
                Our complete Privacy Policy is available at the link below.
              </p>
            </div>

            <h2 className="text-2xl font-semibold text-gray-900 mb-6">6. Intellectual Property</h2>
            <div className="space-y-4 text-gray-700">
              <p>
                <strong>6.1 WorkSphere AI Content.</strong> All content, features, and functionality 
                provided by WorkSphere AI are the exclusive property of WorkSphere Technologies.
              </p>
              <p>
                <strong>6.2 User Content.</strong> You retain ownership of any content you create, 
                share, or upload through the Service, subject to our terms and applicable laws.
              </p>
            </div>

            <h2 className="text-2xl font-semibold text-gray-900 mb-6">7. Service Availability and Modifications</h2>
            <div className="space-y-4 text-gray-700">
              <p>
                <strong>7.1 Service Changes.</strong> We reserve the right to modify, suspend, or discontinue 
                any part of the Service at any time without prior notice.
              </p>
              <p>
                <strong>7.2 Service Availability.</strong> While we strive to maintain high availability, 
                the Service may be temporarily unavailable for maintenance or other reasons.
              </p>
            </div>

            <h2 className="text-2xl font-semibold text-gray-900 mb-6">8. Payment and Subscription Terms</h2>
            <div className="space-y-4 text-gray-700">
              <p>
                <strong>8.1 Subscription Fees.</strong> Subscription fees are charged in advance on a recurring basis. 
                All fees are non-refundable except as specified in our refund policy.
              </p>
              <p>
                <strong>8.2 Payment Methods.</strong> We accept various payment methods as specified during 
                the subscription process.
              </p>
              <p>
                <strong>8.3 Auto-Renewal.</strong> Subscriptions automatically renew unless cancelled 
                before the renewal date.
              </p>
            </div>

            <h2 className="text-2xl font-semibold text-gray-900 mb-6">9. Limitation of Liability</h2>
            <div className="space-y-4 text-gray-700">
              <p>
                <strong>9.1 Service As-Is.</strong> The Service is provided "as is" without warranties of any kind, 
                whether express or implied.
              </p>
              <p>
                <strong>9.2 Limitation of Damages.</strong> WorkSphere Technologies shall not be liable for any 
                indirect, incidental, special, or consequential damages.
              </p>
              <p>
                <strong>9.3 Maximum Liability.</strong> Our total liability for any claims arising from 
                or related to the Service shall not exceed the amount paid by you in the preceding 12 months.
              </p>
            </div>

            <h2 className="text-2xl font-semibold text-gray-900 mb-6">10. Termination</h2>
            <div className="space-y-4 text-gray-700">
              <p>
                <strong>10.1 Termination by User.</strong> You may terminate your account at any time by 
                following the account termination process.
              </p>
              <p>
                <strong>10.2 Termination by WorkSphere AI.</strong> We may terminate or suspend your account 
                for violations of these terms.
              </p>
              <p>
                <strong>10.3 Effect of Termination.</strong> Upon termination, your right to use the Service 
                ceases immediately.
              </p>
            </div>

            <h2 className="text-2xl font-semibold text-gray-900 mb-6">11. Governing Law and Dispute Resolution</h2>
            <div className="space-y-4 text-gray-700">
              <p>
                These terms are governed by the laws of Rwanda. Any disputes will be resolved 
                through good faith negotiations and, if necessary, through binding arbitration.
              </p>
            </div>

            <h2 className="text-2xl font-semibold text-gray-900 mb-6">12. Contact Information</h2>
            <div className="space-y-4 text-gray-700">
              <p>
                <strong>12.1 General Inquiries.</strong> For questions about these terms, contact us at:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-6">
                <li>Email: legal@worksphere.ai</li>
                <li>Website: https://worksphere.ai/legal</li>
              </ul>
              <p>
                <strong>12.2 Support.</strong> For technical support, visit our help center or 
                contact support@worksphere.ai.
              </p>
            </div>

            <div className="mt-12 pt-8 border-t border-gray-200">
              <p className="text-sm text-gray-500 text-center">
                By using WorkSphere AI, you acknowledge that you have read, understood, 
                and agree to be bound by these Terms of Service.
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="mt-8 text-center">
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ArrowLeft size={18} />
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};
