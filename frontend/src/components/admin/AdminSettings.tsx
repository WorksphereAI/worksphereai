// src/components/admin/AdminSettings.tsx
import React, { useState, useEffect } from 'react';
import {
  Settings,
  Shield,
  Bell,
  Save,
  RefreshCw,
  XCircle
} from 'lucide-react';
import { adminService } from '../../services/adminService';

export const AdminSettings: React.FC = () => {
  const [settings, setSettings] = useState({
    system: {
      maintenance: false,
      debugMode: false,
      apiRateLimit: 1000,
      sessionTimeout: 30
    },
    notifications: {
      emailAlerts: true,
      smsAlerts: false,
      pushNotifications: true
    },
    security: {
      twoFactorAuth: true,
      sessionTimeout: 60,
      passwordPolicy: {
        minLength: 8,
        requireUppercase: true,
        requireNumbers: true,
        requireSpecialChars: true
      }
    }
  });
  const [featureFlags, setFeatureFlags] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSettings();
    loadFeatureFlags();
    loadAnnouncements();
  }, []);

  const loadSettings = async () => {
    // Load system settings from database
    // This would be implemented based on your needs
  };

  const loadFeatureFlags = async () => {
    try {
      const flags = await adminService.getFeatureFlags();
      setFeatureFlags(flags);
    } catch (error) {
      console.error('Error loading feature flags:', error);
    }
  };

  const loadAnnouncements = async () => {
    try {
      const announcements = await adminService.getAnnouncements({ active: true });
      setAnnouncements(announcements);
    } catch (error) {
      console.error('Error loading announcements:', error);
    }
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      // Save settings to database
      await new Promise(resolve => setTimeout(resolve, 1000));
      // Show success message
    } catch (error) {
      console.error('Error saving settings:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleToggleFeatureFlag = async (flagId: string, enabled: boolean) => {
    try {
      await adminService.updateFeatureFlag(flagId, { enabled });
      loadFeatureFlags();
    } catch (error) {
      console.error('Error updating feature flag:', error);
    }
  };

  const handleDeleteAnnouncement = async (_id: string) => {
    if (confirm('Are you sure you want to delete this announcement?')) {
      // Delete announcement from database
      await new Promise(resolve => setTimeout(resolve, 1000));
      loadAnnouncements();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Admin Settings</h2>
        <button
          onClick={handleSaveSettings}
          disabled={saving}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 flex items-center gap-2"
        >
          {saving ? (
            <RefreshCw size={16} className="animate-spin" />
          ) : (
            <Save size={16} />
          )}
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* System Settings */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Settings className="text-purple-600" size={20} />
            System Settings
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">Maintenance Mode</label>
                <p className="text-xs text-gray-500">
                  Temporarily disable user access
                </p>
              </div>
              <button
                onClick={() => setSettings(prev => ({
                  ...prev,
                  system: { ...prev.system, maintenance: !prev.system.maintenance }
                }))}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.system.maintenance
                    ? 'bg-red-600'
                    : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${
                    settings.system.maintenance ? 'translate-x-5' : 'translate-x-0'
                  }`}
                ></span>
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">Debug Mode</label>
                <p className="text-xs text-gray-500">
                  Enable detailed logging
                </p>
              </div>
              <button
                onClick={() => setSettings(prev => ({
                  ...prev,
                  system: { ...prev.system, debugMode: !prev.system.debugMode }
                }))}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.system.debugMode
                    ? 'bg-orange-600'
                    : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${
                    settings.system.debugMode ? 'translate-x-5' : 'translate-x-0'
                  }`}
                ></span>
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">API Rate Limit</label>
                <p className="text-xs text-gray-500">
                  Requests per minute
                </p>
              </div>
              <input
                type="number"
                value={settings.system.apiRateLimit}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  system: { ...prev.system, apiRateLimit: parseInt(e.target.value) }
                }))}
                className="w-20 px-3 py-1 border border-gray-300 rounded-lg text-sm"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">Session Timeout</label>
                <p className="text-xs text-gray-500">
                  Minutes
                </p>
              </div>
              <input
                type="number"
                value={settings.system.sessionTimeout}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  system: { ...prev.system, sessionTimeout: parseInt(e.target.value) }
                }))}
                className="w-20 px-3 py-1 border border-gray-300 rounded-lg text-sm"
              />
            </div>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Bell className="text-purple-600" size={20} />
            Notification Settings
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">Email Alerts</label>
                <p className="text-xs text-gray-500">
                  Receive email notifications
                </p>
              </div>
              <button
                onClick={() => setSettings(prev => ({
                  ...prev,
                  notifications: { ...prev.notifications, emailAlerts: !prev.notifications.emailAlerts }
                }))}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.notifications.emailAlerts
                    ? 'bg-blue-600'
                    : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${
                    settings.notifications.emailAlerts ? 'translate-x-5' : 'translate-x-0'
                  }`}
                ></span>
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">SMS Alerts</label>
                <p className="text-xs text-gray-500">
                  Receive SMS notifications
                </p>
              </div>
              <button
                onClick={() => setSettings(prev => ({
                  ...prev,
                  notifications: { ...prev.notifications, smsAlerts: !prev.notifications.smsAlerts }
                }))}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.notifications.smsAlerts
                    ? 'bg-blue-600'
                    : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${
                    settings.notifications.smsAlerts ? 'translate-x-5' : 'translate-x-0'
                  }`}
                ></span>
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">Push Notifications</label>
                <p className="text-xs text-gray-500">
                  Browser push notifications
                </p>
              </div>
              <button
                onClick={() => setSettings(prev => ({
                  ...prev,
                  notifications: { ...prev.notifications, pushNotifications: !prev.notifications.pushNotifications }
                }))}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.notifications.pushNotifications
                    ? 'bg-blue-600'
                    : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${
                    settings.notifications.pushNotifications ? 'translate-x-5' : 'translate-x-0'
                  }`}
                ></span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Feature Flags */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Shield className="text-purple-600" size={20} />
            Feature Flags
          </h3>
          <button
            onClick={() => loadFeatureFlags()}
            className="text-sm text-purple-600 hover:text-purple-700"
          >
            Refresh
          </button>
        </div>

        <div className="space-y-3">
          {featureFlags.map((flag) => (
            <div key={flag.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
              <div>
                <div className="font-medium text-gray-900">{flag.name}</div>
                <div className="text-sm text-gray-500">{flag.description}</div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleToggleFeatureFlag(flag.id, !flag.enabled)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    flag.enabled
                      ? 'bg-green-600'
                      : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${
                      flag.enabled ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  ></span>
                </button>
                <span className="text-xs text-gray-500">
                  {flag.enabled ? 'Enabled' : 'Disabled'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Announcements */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Bell className="text-purple-600" size={20} />
            Announcements
          </h3>
          <button
            onClick={() => loadAnnouncements()}
            className="text-sm text-purple-600 hover:text-purple-700"
          >
            Refresh
          </button>
        </div>

        <div className="space-y-3">
          {announcements.map((announcement) => (
            <div
              key={announcement.id}
              className="p-4 border border-gray-200 rounded-lg"
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h4 className="font-medium text-gray-900">{announcement.title}</h4>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    announcement.type === 'critical'
                      ? 'bg-red-100 text-red-700'
                      : announcement.type === 'maintenance'
                      ? 'bg-orange-100 text-orange-700'
                      : announcement.type === 'update'
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-gray-100 text-gray-700'
                  }`}>
                    {announcement.type}
                  </span>
                </div>
                <button
                  onClick={() => handleDeleteAnnouncement(announcement.id)}
                  className="text-red-600 hover:text-red-700"
                  title="Delete announcement"
                >
                  <XCircle size={16} />
                </button>
              </div>
              <p className="text-sm text-gray-600 line-clamp-2">
                {announcement.content}
              </p>
              <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                <span>
                  Scheduled: {new Date(announcement.scheduled_for).toLocaleString()}
                </span>
                {announcement.expires_at && (
                  <span>
                    Expires: {new Date(announcement.expires_at).toLocaleString()}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Security Settings */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Shield className="text-purple-600" size={20} />
          Security Settings
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700">Two-Factor Authentication</label>
              <p className="text-xs text-gray-500">
                Require 2FA for admin access
              </p>
            </div>
            <button
              onClick={() => setSettings(prev => ({
                ...prev,
                security: { ...prev.security, twoFactorAuth: !prev.security.twoFactorAuth }
              }))}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.security.twoFactorAuth
                  ? 'bg-green-600'
                  : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${
                  settings.security.twoFactorAuth ? 'translate-x-5' : 'translate-x-0'
                }`}
              ></span>
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700">Session Timeout</label>
              <p className="text-xs text-gray-500">
                Auto-logout after inactivity
              </p>
            </div>
            <input
              type="number"
              value={settings.security.sessionTimeout}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                security: { ...prev.security, sessionTimeout: parseInt(e.target.value) }
              }))}
              className="w-20 px-3 py-1 border border-gray-300 rounded-lg text-sm"
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700">Password Policy</label>
              <p className="text-xs text-gray-500">
                Minimum password requirements
              </p>
            </div>
            <div className="text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <span className={`px-2 py-1 rounded text-xs ${
                  settings.security.passwordPolicy.minLength >= 8 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                  {settings.security.passwordPolicy.minLength} chars
                </span>
                <span className={`px-2 py-1 rounded text-xs ${
                  settings.security.passwordPolicy.requireUppercase ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                  Uppercase
                </span>
                <span className={`px-2 py-1 rounded text-xs ${
                  settings.security.passwordPolicy.requireNumbers ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                  Numbers
                </span>
                <span className={`px-2 py-1 rounded text-xs ${
                  settings.security.passwordPolicy.requireSpecialChars ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                  Special chars
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
