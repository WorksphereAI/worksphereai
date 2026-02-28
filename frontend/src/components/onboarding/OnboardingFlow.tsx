// src/components/onboarding/OnboardingFlow.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CheckCircle,
  Users,
  Building2,
  Upload,
  Rocket,
  ArrowRight,
  Link as LinkIcon,
  Loader2
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { signupService } from '../../services/signupService';
import { emailService } from '../../services/emailService';

interface OnboardingStep {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  component: React.ReactNode;
  optional?: boolean;
}

export const OnboardingFlow: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [skippedSteps, setSkippedSteps] = useState<number[]>([]);
  const [organization, setOrganization] = useState<any>(null);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);

    if (user) {
      const { data: org } = await supabase
        .from('organizations')
        .select('*')
        .eq('id', user.user_metadata?.organization_id)
        .single();
      
      setOrganization(org);
    }
  };

  const steps: OnboardingStep[] = [
    {
      id: 0,
      title: 'Welcome to WorkSphere AI',
      description: 'Let\'s get your workspace set up in just a few minutes',
      icon: <Rocket className="text-blue-600" size={24} />,
      component: <WelcomeStep onComplete={() => completeStep(0)} />
    },
    {
      id: 1,
      title: 'Company Profile',
      description: 'Tell us about your organization',
      icon: <Building2 className="text-green-600" size={24} />,
      component: <CompanyProfileStep 
        organization={organization} 
        onComplete={(data) => completeStep(1, data)} 
      />
    },
    {
      id: 2,
      title: 'Invite Your Team',
      description: 'Bring your colleagues onboard',
      icon: <Users className="text-purple-600" size={24} />,
      component: <InviteTeamStep 
        organizationId={organization?.id} 
        onComplete={() => completeStep(2)}
        onSkip={() => skipStep(2)}
      />,
      optional: true
    },
    {
      id: 3,
      title: 'Connect Your Tools',
      description: 'Integrate with your favorite apps',
      icon: <LinkIcon className="text-orange-600" size={24} />,
      component: <IntegrationsStep 
        onComplete={() => completeStep(3)}
        onSkip={() => skipStep(3)}
      />,
      optional: true
    },
    {
      id: 4,
      title: 'Import Your Data',
      description: 'Bring your existing files and conversations',
      icon: <Upload className="text-indigo-600" size={24} />,
      component: <ImportDataStep 
        onComplete={() => completeStep(4)}
        onSkip={() => skipStep(4)}
      />,
      optional: true
    },
    {
      id: 5,
      title: 'You\'re All Set!',
      description: 'Your workspace is ready to go',
      icon: <CheckCircle className="text-green-600" size={24} />,
      component: <CompleteStep onComplete={() => finishOnboarding()} />
    }
  ];

  const completeStep = async (stepId: number, data?: any) => {
    setCompletedSteps(prev => [...prev, stepId]);
    
    if (data && organization) {
      await signupService.updateOnboardingProgress(
        user?.id,
        organization.id,
        stepId,
        'completed',
        false,
        data
      );
    }

    if (stepId < steps.length - 1) {
      setCurrentStep(stepId + 1);
    }
  };

  const skipStep = async (stepId: number) => {
    setSkippedSteps(prev => [...prev, stepId]);
    setCurrentStep(stepId + 1);
    
    if (organization) {
      await signupService.updateOnboardingProgress(
        user?.id,
        organization.id,
        stepId,
        'skipped',
        true
      );
    }
  };

  const finishOnboarding = async () => {
    // Mark onboarding as complete
    if (organization) {
      await signupService.completeOnboarding(user?.id, organization.id);
    }

    // Send welcome email
    if (user?.email) {
      await emailService.sendWelcomeEmail(
        user.email,
        user.user_metadata?.full_name || 'there',
        'enterprise'
      );
    }

    // Redirect to dashboard
    setTimeout(() => {
      navigate('/dashboard');
    }, 2000);
  };

  const progress = ((completedSteps.length + skippedSteps.length) / (steps.length - 1)) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-2xl">WS</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Welcome to WorkSphere AI</h1>
          <p className="text-gray-600 mt-2">Let's get your workspace set up</p>
        </div>

        {/* Progress Bar */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Setup Progress</span>
            <span className="text-sm text-gray-500">{Math.round(progress)}%</span>
          </div>
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Steps Navigation */}
        <div className="flex items-center justify-between mb-8 overflow-x-auto pb-2">
          {steps.map((step, index) => (
            <div
              key={step.id}
              className={`flex items-center ${index < steps.length - 1 ? 'flex-1' : ''}`}
            >
              <div className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  completedSteps.includes(step.id)
                    ? 'bg-green-500 text-white'
                    : skippedSteps.includes(step.id)
                    ? 'bg-gray-400 text-white'
                    : currentStep === step.id
                    ? 'bg-blue-600 text-white ring-4 ring-blue-100'
                    : 'bg-gray-200 text-gray-500'
                }`}>
                  {completedSteps.includes(step.id) ? (
                    <CheckCircle size={18} />
                  ) : (
                    step.id + 1
                  )}
                </div>
                <span className={`text-xs mt-2 whitespace-nowrap ${
                  currentStep === step.id ? 'text-blue-600 font-medium' : 'text-gray-500'
                }`}>
                  {step.title}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div className={`flex-1 h-0.5 mx-2 ${
                  index < completedSteps.length + skippedSteps.length
                    ? 'bg-green-500'
                    : 'bg-gray-200'
                }`} />
              )}
            </div>
          ))}
        </div>

        {/* Current Step */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="flex items-center gap-3 mb-6">
            {steps[currentStep].icon}
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {steps[currentStep].title}
              </h2>
              <p className="text-sm text-gray-600">
                {steps[currentStep].description}
              </p>
            </div>
          </div>

          {steps[currentStep].component}
        </div>
      </div>
    </div>
  );
};

// Welcome Step Component
const WelcomeStep: React.FC<{ onComplete: () => void }> = ({ onComplete }) => (
  <div className="space-y-6">
    <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
      <h3 className="text-lg font-semibold text-blue-900 mb-2">
        🎉 You're just minutes away from transforming how your team works!
      </h3>
      <p className="text-blue-700">
        We'll guide you through setting up your workspace. Most companies complete this in under 5 minutes.
      </p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="p-4 border border-gray-200 rounded-lg">
        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mb-3">
          <Building2 size={20} className="text-blue-600" />
        </div>
        <h4 className="font-medium mb-1">Company Profile</h4>
        <p className="text-sm text-gray-600">Set up your organization details</p>
      </div>
      <div className="p-4 border border-gray-200 rounded-lg">
        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mb-3">
          <Users size={20} className="text-green-600" />
        </div>
        <h4 className="font-medium mb-1">Invite Team</h4>
        <p className="text-sm text-gray-600">Bring your colleagues onboard</p>
      </div>
      <div className="p-4 border border-gray-200 rounded-lg">
        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mb-3">
          <LinkIcon size={20} className="text-purple-600" />
        </div>
        <h4 className="font-medium mb-1">Connect Tools</h4>
        <p className="text-sm text-gray-600">Integrate Slack, Google Drive, etc.</p>
      </div>
      <div className="p-4 border border-gray-200 rounded-lg">
        <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center mb-3">
          <Upload size={20} className="text-orange-600" />
        </div>
        <h4 className="font-medium mb-1">Import Data</h4>
        <p className="text-sm text-gray-600">Bring your existing files</p>
      </div>
    </div>

    <button
      onClick={onComplete}
      className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 font-medium flex items-center justify-center gap-2"
    >
      Let's Get Started
      <ArrowRight size={18} />
    </button>
  </div>
);

// Company Profile Step
const CompanyProfileStep: React.FC<{ 
  organization: any; 
  onComplete: (data: any) => void 
}> = ({ organization, onComplete }) => {
  const [formData, setFormData] = useState({
    name: organization?.name || '',
    website: '',
    industry: '',
    size: '',
    location: '',
    phone: ''
  });
  const [loading, setLoading] = useState(false);

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
    'Other'
  ];

  const sizes = [
    '1-10',
    '11-50',
    '51-200',
    '201-500',
    '501-1000',
    '1000+'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Update organization
      const { error } = await supabase
        .from('organizations')
        .update({
          name: formData.name,
          website: formData.website,
          industry: formData.industry,
          employee_count: formData.size,
          location: formData.location,
          phone: formData.phone,
          updated_at: new Date().toISOString()
        })
        .eq('id', organization?.id);

      if (error) throw error;

      onComplete(formData);
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Company Name
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          placeholder="Acme Inc."
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Website
        </label>
        <input
          type="url"
          value={formData.website}
          onChange={(e) => setFormData({ ...formData, website: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          placeholder="https://acme.com"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Industry
          </label>
          <select
            value={formData.industry}
            onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select industry</option>
            {industries.map(ind => (
              <option key={ind} value={ind}>{ind}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Company Size
          </label>
          <select
            value={formData.size}
            onChange={(e) => setFormData({ ...formData, size: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select size</option>
            {sizes.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Location
        </label>
        <input
          type="text"
          value={formData.location}
          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          placeholder="Kigali, Rwanda"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Phone Number
        </label>
        <input
          type="tel"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          placeholder="+250 788 123 456"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 font-medium disabled:opacity-50"
      >
        {loading ? 'Saving...' : 'Continue'}
      </button>
    </form>
  );
};

// Invite Team Step
const InviteTeamStep: React.FC<{ 
  organizationId: string; 
  onComplete: () => void;
  onSkip: () => void;
}> = ({ organizationId, onComplete, onSkip }) => {
  const [emails, setEmails] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState<string[]>([]);

  const handleSendInvites = async () => {
    const emailList = emails.split('\n').map(e => e.trim()).filter(e => e);
    setSending(true);

    try {
      for (const email of emailList) {
        await signupService.sendInvitation(
          organizationId,
          email,
          'employee',
          (await supabase.auth.getUser()).data.user?.id || ''
        );
        setSent(prev => [...prev, email]);
      }
      onComplete();
    } catch (error) {
      console.error('Error sending invites:', error);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
        <p className="text-sm text-purple-700">
          Invite your team members to collaborate. They'll receive an email with instructions to join.
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Email Addresses
        </label>
        <textarea
          value={emails}
          onChange={(e) => setEmails(e.target.value)}
          rows={4}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
          placeholder="colleague@company.com&#10;manager@company.com&#10;team@company.com"
        />
        <p className="text-xs text-gray-500 mt-1">
          Enter one email per line
        </p>
      </div>

      {sent.length > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <p className="text-sm text-green-700 font-medium mb-1">✓ Invitations sent to:</p>
          <ul className="text-xs text-green-600">
            {sent.map(email => (
              <li key={email}>{email}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex gap-3">
        <button
          onClick={handleSendInvites}
          disabled={!emails.trim() || sending}
          className="flex-1 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium disabled:opacity-50"
        >
          {sending ? 'Sending...' : 'Send Invitations'}
        </button>
        <button
          onClick={onSkip}
          className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
        >
          Skip for now
        </button>
      </div>
    </div>
  );
};

// Integrations Step
const IntegrationsStep: React.FC<{ 
  onComplete: () => void;
  onSkip: () => void;
}> = ({ onComplete, onSkip }) => {
  const integrations = [
    {
      name: 'Slack',
      icon: '💬',
      description: 'Get notifications in Slack',
      connected: false
    },
    {
      name: 'Google Drive',
      icon: '📁',
      description: 'Sync files from Google Drive',
      connected: false
    },
    {
      name: 'Microsoft Teams',
      icon: '👥',
      description: 'Collaborate in Teams',
      connected: false
    },
    {
      name: 'Zoom',
      icon: '📹',
      description: 'Schedule meetings from WorkSphere',
      connected: false
    },
    {
      name: 'Salesforce',
      icon: '📊',
      description: 'Sync customer data',
      connected: false
    },
    {
      name: 'QuickBooks',
      icon: '💰',
      description: 'Connect your accounting',
      connected: false
    }
  ];

  return (
    <div className="space-y-6">
      <p className="text-sm text-gray-600">
        Connect your favorite tools to streamline your workflow. You can always set these up later.
      </p>

      <div className="grid grid-cols-2 gap-3">
        {integrations.map(integration => (
          <div
            key={integration.name}
            className="p-3 border border-gray-200 rounded-lg hover:border-blue-300 cursor-pointer transition"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">{integration.icon}</span>
              <div>
                <h4 className="font-medium text-sm">{integration.name}</h4>
                <p className="text-xs text-gray-500">{integration.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-3">
        <button
          onClick={onComplete}
          className="flex-1 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 font-medium"
        >
          Connect Selected
        </button>
        <button
          onClick={onSkip}
          className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
        >
          Skip for now
        </button>
      </div>
    </div>
  );
};

// Import Data Step
const ImportDataStep: React.FC<{ 
  onComplete: () => void;
  onSkip: () => void;
}> = ({ onComplete, onSkip }) => {
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const handleUpload = async () => {
    setUploading(true);
    // Simulate upload
    setTimeout(() => {
      setUploading(false);
      onComplete();
    }, 2000);
  };

  return (
    <div className="space-y-6">
      <div
        className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-indigo-300 transition"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          if (e.dataTransfer.files) {
            setFiles(Array.from(e.dataTransfer.files));
          }
        }}
      >
        <Upload size={40} className="mx-auto text-gray-400 mb-3" />
        <p className="text-gray-600 mb-2">
          Drag and drop files here, or{' '}
          <label className="text-indigo-600 hover:text-indigo-700 cursor-pointer">
            browse
            <input
              type="file"
              multiple
              className="hidden"
              onChange={handleFileUpload}
            />
          </label>
        </p>
        <p className="text-xs text-gray-500">
          Support for documents, spreadsheets, and images
        </p>
      </div>

      {files.length > 0 && (
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-medium mb-2">Files to upload ({files.length})</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            {files.slice(0, 5).map((file, i) => (
              <li key={i} className="flex items-center justify-between">
                <span>{file.name}</span>
                <span className="text-xs text-gray-400">
                  {(file.size / 1024).toFixed(1)} KB
                </span>
              </li>
            ))}
            {files.length > 5 && (
              <li className="text-gray-500">...and {files.length - 5} more</li>
            )}
          </ul>
        </div>
      )}

      <div className="flex gap-3">
        <button
          onClick={handleUpload}
          disabled={files.length === 0 || uploading}
          className="flex-1 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium disabled:opacity-50"
        >
          {uploading ? 'Uploading...' : 'Upload Files'}
        </button>
        <button
          onClick={onSkip}
          className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
        >
          Skip for now
        </button>
      </div>
    </div>
  );
};

// Complete Step
const CompleteStep: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  useEffect(() => {
    onComplete();
  }, []);

  return (
    <div className="text-center py-12">
      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <CheckCircle size={40} className="text-green-600" />
      </div>
      <h3 className="text-2xl font-bold text-gray-900 mb-2">
        You're All Set!
      </h3>
      <p className="text-gray-600 mb-8">
        Your workspace is ready. Redirecting you to your dashboard...
      </p>
      <div className="flex justify-center">
        <Loader2 className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    </div>
  );
};
