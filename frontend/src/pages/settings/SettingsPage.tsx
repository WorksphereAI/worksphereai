import React from 'react';
import { ResponsiveCard } from '../../components/ui/ResponsiveCard';
import { ResponsiveText } from '../../components/ui/ResponsiveText';
import { useAuth } from '../../contexts/AuthContext';

export const SettingsPage: React.FC = () => {
  const { user } = useAuth();

  const handleToggleNotifications = () => {
    // placeholder - actual implementation would call API to update settings
    alert('Notification setting toggled (not implemented)');
  };

  const handleDeleteAccount = () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      alert('Account delete request not implemented');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <div className="bg-gradient-to-r from-gray-700 to-gray-900 text-white px-4 py-6 sm:p-8">
        <div className="max-w-6xl mx-auto">
          <ResponsiveText variant="h2" weight="medium" color="default" className="text-white">
            Settings
          </ResponsiveText>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6 sm:p-8 space-y-6">
        <ResponsiveCard>
          <ResponsiveText variant="h4" weight="semibold" className="mb-2">
            Account
          </ResponsiveText>
          <div className="flex flex-col gap-4">
            <button
              onClick={handleToggleNotifications}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Toggle Notifications (current: {user?.notifications ? 'on' : 'off'})
            </button>
            <button
              onClick={handleDeleteAccount}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Delete Account
            </button>
          </div>
        </ResponsiveCard>
      </div>
    </div>
  );
};
