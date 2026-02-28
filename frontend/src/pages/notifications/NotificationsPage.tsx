import React, { useEffect, useState } from 'react';
import { ResponsiveCard } from '../../components/ui/ResponsiveCard';
import { ResponsiveText } from '../../components/ui/ResponsiveText';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

interface Notification {
  id: string;
  message: string;
  created_at: string;
  read: boolean;
}

export const NotificationsPage: React.FC = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotifications();
  }, [user?.id]);

  const loadNotifications = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setNotifications(data || []);
    } catch (err) {
      console.error('Failed to fetch notifications', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-6 sm:p-8">
        <div className="max-w-6xl mx-auto">
          <ResponsiveText variant="h2" weight="medium" color="default" className="text-white">
            Notifications
          </ResponsiveText>
        </div>
      </div>
      <div className="max-w-6xl mx-auto px-4 py-6 sm:p-8">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
          </div>
        ) : notifications.length === 0 ? (
          <ResponsiveCard className="text-center py-12">
            <ResponsiveText color="muted">No notifications</ResponsiveText>
          </ResponsiveCard>
        ) : (
          <div className="space-y-4">
            {notifications.map((n) => (
              <ResponsiveCard key={n.id} className="p-4">
                <div className="text-sm text-gray-800">{n.message}</div>
                <div className="text-xs text-gray-500 mt-1">
                  {new Date(n.created_at).toLocaleString()}
                </div>
              </ResponsiveCard>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
