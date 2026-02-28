import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { User, Mail, Building2, Calendar, Shield, Phone, MapPin, LogOut, Settings } from 'lucide-react';
import { ResponsiveCard } from '../../components/ui/ResponsiveCard';
import { ResponsiveText } from '../../components/ui/ResponsiveText';
import { ResponsiveInput } from '../../components/ui/ResponsiveInput';
import { ResponsiveGrid } from '../../components/ui/ResponsiveGrid';
import { useIsMobile } from '../../hooks/useMediaQuery';

export const ResponsiveProfile: React.FC = () => {
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    department: '',
    location: ''
  });

  useEffect(() => {
    loadProfile();
  }, [user?.id]);

  const loadProfile = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;

      setProfile(data);
      setFormData({
        full_name: data.full_name || '',
        email: data.email || '',
        phone: data.phone || '',
        department: data.department || '',
        location: data.location || ''
      });
    } catch (error) {
      console.error('Error loading profile:', error);
      setSaveMessage({ type: 'error', text: 'Failed to load profile' });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!user?.id) return;

    setSaving(true);
    setSaveMessage(null);
    try {
      const { error } = await supabase
        .from('users')
        .update(formData)
        .eq('id', user.id);

      if (error) throw error;

      setProfile({ ...profile, ...formData });
      setSaveMessage({ type: 'success', text: 'Profile updated successfully!' });
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (error) {
      console.error('Error saving profile:', error);
      setSaveMessage({ type: 'error', text: 'Failed to update profile. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Header with Profile Hero */}
      <div className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-4 py-8 sm:p-12">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center gap-6 mb-8">
            {/* Avatar */}
            <div className="relative">
              <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border-4 border-white/30">
                <User className="text-white" size={isMobile ? 48 : 64} />
              </div>
            </div>

            {/* Profile Info */}
            <div className="flex-1 text-center sm:text-left">
              <ResponsiveText variant="h2" color="default" className="text-white mb-2" weight="bold">
                {profile?.full_name || 'User'}
              </ResponsiveText>
              <ResponsiveText color="default" className="text-white/80 mb-4" weight="normal">
                {profile?.role ? profile.role.charAt(0).toUpperCase() + profile.role.slice(1) : 'Member'}
              </ResponsiveText>
              <p className="text-white/60 text-sm">
                Member since {profile?.created_at ? new Date(profile.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long' }) : 'Recently'}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-2 w-full sm:w-auto">
              <button className="px-6 py-2 bg-white text-blue-600 rounded-lg font-medium hover:bg-gray-100 transition-colors">
                <Settings size={18} className="inline mr-2" />
                Account Settings
              </button>
              <button className="px-6 py-2 bg-white/20 text-white rounded-lg font-medium hover:bg-white/30 transition-colors">
                <LogOut size={18} className="inline mr-2" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-6 sm:p-8">
        {/* Status Message */}
        {saveMessage && (
          <div className={`mb-6 p-4 rounded-lg ${
            saveMessage.type === 'success' 
              ? 'bg-green-50 text-green-700 border border-green-200' 
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}>
            {saveMessage.text}
          </div>
        )}

        <ResponsiveGrid cols={{ xs: 1, md: 2 }} gap="md">
          {/* Personal Information */}
          <ResponsiveCard>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <User className="text-blue-600" size={20} />
              </div>
              <ResponsiveText variant="h3" weight="semibold">
                Personal Information
              </ResponsiveText>
            </div>

            <div className="space-y-4">
              <ResponsiveInput
                label="Full Name"
                type="text"
                value={formData.full_name}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, full_name: e.target.value })}
                icon={<User size={20} />}
              />
              <ResponsiveInput
                label="Email Address"
                type="email"
                value={formData.email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, email: e.target.value })}
                icon={<Mail size={20} />}
                disabled
              />
              <ResponsiveInput
                label="Phone Number"
                type="tel"
                value={formData.phone}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, phone: e.target.value })}
                icon={<Phone size={20} />}
              />
              <ResponsiveInput
                label="Location"
                type="text"
                value={formData.location}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, location: e.target.value })}
                icon={<MapPin size={20} />}
              />
            </div>
          </ResponsiveCard>

          {/* Organization & Role */}
          <ResponsiveCard>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Building2 className="text-purple-600" size={20} />
              </div>
              <ResponsiveText variant="h3" weight="semibold">
                Organization & Role
              </ResponsiveText>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <ResponsiveText color="muted" className="text-sm mb-1">
                  Organization
                </ResponsiveText>
                <ResponsiveText weight="semibold">
                  {profile?.organization_id ? 'Active Organization' : 'Not assigned'}
                </ResponsiveText>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <ResponsiveText color="muted" className="text-sm mb-1">
                  Role
                </ResponsiveText>
                <div className="flex items-center gap-2">
                  <Shield className="text-blue-600" size={18} />
                  <ResponsiveText weight="semibold" className="capitalize">
                    {profile?.role || 'Employee'}
                  </ResponsiveText>
                </div>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <ResponsiveText color="muted" className="text-sm mb-1">
                  Department
                </ResponsiveText>
                <ResponsiveText weight="semibold">
                  {formData.department || 'General'}
                </ResponsiveText>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <ResponsiveText color="muted" className="text-sm mb-1">
                  Member Since
                </ResponsiveText>
                <div className="flex items-center gap-2">
                  <Calendar className="text-blue-600" size={18} />
                  <ResponsiveText weight="semibold">
                    {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : 'N/A'}
                  </ResponsiveText>
                </div>
              </div>
            </div>
          </ResponsiveCard>

          {/* Department & Work Info */}
          <ResponsiveCard className="md:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Building2 className="text-green-600" size={20} />
              </div>
              <ResponsiveText variant="h3" weight="semibold">
                Work Information
              </ResponsiveText>
            </div>

            <ResponsiveInput
              label="Department"
              type="text"
              value={formData.department}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, department: e.target.value })}
              icon={<Building2 size={20} />}
            />
          </ResponsiveCard>

          {/* Save Button */}
          <div className="md:col-span-2 flex gap-3">
            <button
              onClick={handleSaveProfile}
              disabled={saving}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              onClick={() => {
                setFormData({
                  full_name: profile?.full_name || '',
                  email: profile?.email || '',
                  phone: profile?.phone || '',
                  department: profile?.department || '',
                  location: profile?.location || ''
                });
                setSaveMessage(null);
              }}
              className="flex-1 px-6 py-3 bg-gray-200 text-gray-800 rounded-lg font-medium hover:bg-gray-300 transition-colors"
            >
              Reset
            </button>
          </div>
        </ResponsiveGrid>

        {/* Danger Zone */}
        <ResponsiveCard className="mt-8 border-red-200 bg-red-50">
          <ResponsiveText variant="h4" weight="semibold" color="error" className="mb-4">
            Danger Zone
          </ResponsiveText>
          <ResponsiveText color="muted" className="text-sm mb-4">
            Irreversible actions
          </ResponsiveText>
          <button className="px-6 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors">
            Delete Account
          </button>
        </ResponsiveCard>
      </div>
    </div>
  );
};
