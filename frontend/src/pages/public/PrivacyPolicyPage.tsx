// src/pages/public/PrivacyPolicyPage.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, ArrowLeft, Lock } from 'lucide-react';

export const PrivacyPolicyPage: React.FC = () => {
  const lastUpdated = 'February 28, 2026';

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield size={32} className="text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Privacy Policy</h1>
          <p className="text-gray-600">Last updated: {lastUpdated}</p>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="prose prose max-w-none">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">1. Information We Collect</h2>
            <div className="space-y-4 text-gray-700">
              <p>
                <strong>1.1 Account Information.</strong> When you create an account, we collect:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-6">
                <li>Full name and email address</li>
                <li>Organization name (for enterprise accounts)</li>
                <li>Phone number (optional)</li>
                <li>Job title and role within organization</li>
              </ul>
              
              <p>
                <strong>1.2 Usage Data.</strong> We automatically collect information about how you use our Service:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-6">
                <li>Pages visited and features used</li>
                <li>Time spent on different features</li>
                <li>Documents created and accessed</li>
                <li>Communication patterns and team interactions</li>
                <li>Device information and browser type</li>
                <li>IP address and general location</li>
              </ul>

              <p>
                <strong>1.3 Communications.</strong> We collect content of messages, documents, 
                and other communications you create within the Service.
              </p>

              <p>
                <strong>1.4 Payment Information.</strong> For paid subscriptions, we collect:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-6">
                <li>Payment method details</li>
                <li>Billing address and contact information</li>
                <li>Invoicing and payment history</li>
              </ul>
            </div>

            <h2 className="text-2xl font-semibold text-gray-900 mb-6">2. How We Use Your Information</h2>
            <div className="space-y-4 text-gray-700">
              <p>
                <strong>2.1 Service Provision.</strong> We use your information to:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-6">
                <li>Provide and maintain the WorkSphere AI Service</li>
                <li>Process payments and manage subscriptions</li>
                <li>Communicate with you about Service updates</li>
                <li>Provide customer support and technical assistance</li>
                <li>Analyze usage patterns to improve our Service</li>
              </ul>

              <p>
                <strong>2.2 Personalization.</strong> We may use your information to personalize your experience, 
                including displaying relevant content and remembering your preferences.
              </p>

              <p>
                <strong>2.3 Analytics.</strong> We use aggregated, anonymized data for analytics purposes 
                to understand usage patterns and improve our Service.
              </p>

              <p>
                <strong>2.4 Security.</strong> We implement appropriate security measures to protect your personal 
                information and maintain the integrity of our systems.
              </p>
            </div>

            <h2 className="text-2xl font-semibold text-gray-900 mb-6">3. Information Sharing</h2>
            <div className="space-y-4 text-gray-700">
              <p>
                <strong>3.1 General Policy.</strong> We do not sell, rent, or lease your personal information 
                to third parties. We only share your information as described in this policy.
              </p>

              <p>
                <strong>3.2 Service Providers.</strong> We may share information with trusted third-party 
                service providers who assist us in operating our Service:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-6">
                <li><strong>Payment Processors:</strong> For processing subscription payments</li>
                <li><strong>Cloud Infrastructure:</strong> For data storage and processing</li>
                <li><strong>Communication Services:</strong> For email notifications and messaging</li>
                <li><strong>Analytics Services:</strong> For usage analysis and improvement</li>
              </ul>

              <p>
                <strong>3.3 Legal Requirements.</strong> We may disclose your information when required by law, 
                court order, or government regulation.
              </p>

              <p>
                <strong>3.4 Business Transfers.</strong> In the event of a merger, acquisition, or sale 
                of our business, your information may be transferred as part of the transaction.
              </p>
            </div>

            <h2 className="text-2xl font-semibold text-gray-900 mb-6">4. Data Security</h2>
            <div className="space-y-4 text-gray-700">
              <p>
                <strong>4.1 Technical Measures.</strong> We implement industry-standard security measures:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-6">
                <li><Lock className="inline w-4 h-4 mr-2" /> SSL/TLS encryption for all data transmissions</li>
                <li>Secure password storage with hashing</li>
                <li>Regular security audits and penetration testing</li>
                <li>Firewall protection and intrusion detection</li>
                <li>Access controls and authentication mechanisms</li>
              </ul>

              <p>
                <strong>4.2 Data Protection.</strong> Your personal information is protected using:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-6">
                <li>Encryption at rest and in transit</li>
                <li>Regular data backups and disaster recovery</li>
                <li>Access logging and monitoring</li>
                <li>Employee training on data protection practices</li>
              </ul>
            </div>

            <h2 className="text-2xl font-semibold text-gray-900 mb-6">5. Data Retention</h2>
            <div className="space-y-4 text-gray-700">
              <p>
                <strong>5.1 Retention Period.</strong> We retain your personal information only as long as 
                necessary to provide the Service and fulfill legitimate business purposes.
              </p>
              
              <p>
                <strong>5.2 Specific Retention.</strong> Different types of information are retained for different periods:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-6">
                <li><strong>Account Information:</strong> Retained until account deletion</li>
                <li><strong>Usage Data:</strong> Retained for 24 months in anonymized form</li>
                <li><strong>Communications:</strong> Retained according to legal requirements</li>
                <li><strong>Payment Records:</strong> Retained for 7 years as required by law</li>
              </ul>

              <p>
                <strong>5.3 Deletion.</strong> You may request deletion of your personal information, 
                and we will comply unless required by law to retain certain data.
              </p>
            </div>

            <h2 className="text-2xl font-semibold text-gray-900 mb-6">6. Your Rights</h2>
            <div className="space-y-4 text-gray-700">
              <p>
                <strong>6.1 Access and Correction.</strong> You have the right to:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-6">
                <li>Access your personal information</li>
                <li>Correct inaccurate information</li>
                <li>Request deletion of your information</li>
                <li>Obtain a copy of your data</li>
              </ul>

              <p>
                <strong>6.2 Data Portability.</strong> You can request your data in a structured, 
                machine-readable format for transfer to another service.
              </p>

              <p>
                <strong>6.3 Marketing Communications.</strong> You can opt out of marketing 
                communications at any time through your account settings.
              </p>

              <p>
                <strong>6.4 Cookie and Tracking Control.</strong> You can control cookies and 
                tracking technologies through your browser settings and our preferences panel.
              </p>
            </div>

            <h2 className="text-2xl font-semibold text-gray-900 mb-6">7. International Data Transfers</h2>
            <div className="space-y-4 text-gray-700">
              <p>
                <strong>7.1 Data Location.</strong> WorkSphere AI is hosted in Rwanda and operates 
                under Rwandan data protection laws.
              </p>
              
              <p>
                <strong>7.2 International Transfers.</strong> If you are located outside Rwanda, 
                your information may be transferred to and processed in countries other than Rwanda.
              </p>
              
              <p>
                <strong>7.3 Adequate Protection.</strong> We ensure appropriate safeguards are in place 
                for international data transfers in accordance with applicable laws.
              </p>
            </div>

            <h2 className="text-2xl font-semibold text-gray-900 mb-6">8. Children's Privacy</h2>
            <div className="space-y-4 text-gray-700">
              <p>
                <strong>8.1 Age Requirement.</strong> WorkSphere AI is not intended for children under 13 years of age. 
                We do not knowingly collect personal information from children under 13.
              </p>
              
              <p>
                <strong>8.2 Parental Consent.</strong> If we become aware that we have collected information 
                from a child under 13 without parental consent, we will take steps to remove such information.
              </p>
            </div>

            <h2 className="text-2xl font-semibold text-gray-900 mb-6">9. Changes to This Policy</h2>
            <div className="space-y-4 text-gray-700">
              <p>
                <strong>9.1 Notification.</strong> We will notify you of any material changes to this 
                Privacy Policy through email or prominent notice on our website.
              </p>
              
              <p>
                <strong>9.2 Effective Date.</strong> Changes to this policy become effective when posted 
                on our website or as otherwise specified in the notification.
              </p>

              <p>
                <strong>9.3 Continued Use.</strong> Your continued use of the Service after changes 
                constitute acceptance of the updated policy.
              </p>
            </div>

            <h2 className="text-2xl font-semibold text-gray-900 mb-6">10. Contact Information</h2>
            <div className="space-y-4 text-gray-700">
              <p>
                <strong>10.1 Privacy Questions.</strong> If you have questions about this Privacy Policy, 
                please contact us:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-6">
                <li>Email: privacy@worksphere.ai</li>
                <li>Website: https://worksphere.ai/privacy</li>
              </ul>
              
              <p>
                <strong>10.2 Data Protection Officer.</strong> Our Data Protection Officer can be contacted 
                regarding privacy matters at dpo@worksphere.ai.
              </p>

              <p>
                <strong>10.3 Complaints.</strong> If you believe your privacy rights have been violated, 
                you can file a complaint with us or the relevant data protection authority.
              </p>
            </div>

            <div className="mt-12 pt-8 border-t border-gray-200">
              <p className="text-sm text-gray-500 text-center">
                This Privacy Policy is effective as of {lastUpdated} and governs your use of 
                WorkSphere AI services.
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
