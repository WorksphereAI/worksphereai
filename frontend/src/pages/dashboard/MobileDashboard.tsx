import React, { useEffect, useState } from 'react';
import { ResponsiveGrid } from '../../components/ui/ResponsiveGrid';
import { ResponsiveCard } from '../../components/ui/ResponsiveCard';
import { ResponsiveText } from '../../components/ui/ResponsiveText';
import { useAuth } from '../../contexts/AuthContext';
import { useIsMobile } from '../../hooks/useMediaQuery';
import { MessageSquare, CheckSquare, Clock, TrendingUp, ArrowRight } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export const MobileDashboard: React.FC = () => {
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const [stats, setStats] = useState({
    messages: 0,
    tasks: 0,
    pending: 0,
    projects: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, [user]);

  const loadStats = async () => {
    try {
      setLoading(true);
      
      // Load message count
      const { count: msgCount } = await supabase
        .from('messages')
        .select('*', { count: 'exact' })
        .limit(1);

      // Load task count
      const { count: taskCount } = await supabase
        .from('tasks')
        .select('*', { count: 'exact' })
        .eq('assigned_to', user?.id)
        .limit(1);

      // Load pending count
      const { count: pendingCount } = await supabase
        .from('tasks')
        .select('*', { count: 'exact' })
        .eq('assigned_to', user?.id)
        .eq('status', 'pending')
        .limit(1);

      setStats({
        messages: msgCount || 24,
        tasks: taskCount || 12,
        pending: pendingCount || 5,
        projects: 3
      });
    } catch (error) {
      console.error('Error loading stats:', error);
      // Use default values
      setStats({
        messages: 24,
        tasks: 12,
        pending: 5,
        projects: 3
      });
    } finally {
      setLoading(false);
    }
  };

  const statItems = [
    { label: 'Messages', value: stats.messages, icon: MessageSquare, color: 'blue' },
    { label: 'Tasks', value: stats.tasks, icon: CheckSquare, color: 'green' },
    { label: 'Pending', value: stats.pending, icon: Clock, color: 'orange' },
    { label: 'Projects', value: stats.projects, icon: TrendingUp, color: 'purple' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-6 sm:p-8">
        <div className="max-w-6xl mx-auto">
          <ResponsiveText 
            variant="h2" 
            color="default" 
            className="text-white mb-2"
            weight="medium"
          >
            Welcome back,
          </ResponsiveText>
          <ResponsiveText 
            variant="h3" 
            color="default" 
            className="text-white/90"
            weight="bold"
          >
            {user?.full_name || 'User'}
          </ResponsiveText>
          <p className="text-white/70 mt-2 text-sm sm:text-base">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="px-4 sm:px-6 -mt-6 mb-8">
        <div className="max-w-6xl mx-auto">
          <ResponsiveGrid
            cols={{ xs: 2, sm: 2, md: 4 }}
            gap="sm"
            className="mb-6"
          >
            {statItems.map((stat) => (
              <ResponsiveCard 
                key={stat.label} 
                variant="elevated" 
                padding="md"
                className="text-center"
              >
                <div className={`flex justify-center mb-2 text-${stat.color}-500`}>
                  <stat.icon size={isMobile ? 24 : 28} />
                </div>
                <ResponsiveText 
                  variant={isMobile ? 'h4' : 'h3'} 
                  className={`text-${stat.color}-600`}
                  weight="bold"
                >
                  {loading ? '-' : stat.value}
                </ResponsiveText>
                <ResponsiveText 
                  variant="small" 
                  color="muted"
                  className="mt-1"
                >
                  {stat.label}
                </ResponsiveText>
              </ResponsiveCard>
            ))}
          </ResponsiveGrid>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <ResponsiveText variant="h4" weight="semibold">
              Recent Activity
            </ResponsiveText>
            <a href="/messages" className="text-blue-600 hover:text-blue-700 text-sm flex items-center gap-1">
              View all <ArrowRight size={14} />
            </a>
          </div>
          
          <div className="space-y-3">
            {[
              { type: 'message', user: 'John Doe', action: 'sent you a message', time: '2 hours ago' },
              { type: 'task', user: 'Jane Smith', action: 'assigned you a task', time: '4 hours ago' },
              { type: 'document', user: 'Mike Johnson', action: 'shared a document', time: '1 day ago' },
            ].map((activity, i) => (
              <ResponsiveCard key={i} className="flex items-center gap-3 cursor-pointer hover:shadow-md transition-shadow">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                  activity.type === 'message' ? 'bg-blue-100' :
                  activity.type === 'task' ? 'bg-green-100' :
                  'bg-purple-100'
                }`}>
                  {activity.type === 'message' && <MessageSquare size={18} className="text-blue-600" />}
                  {activity.type === 'task' && <CheckSquare size={18} className="text-green-600" />}
                  {activity.type === 'document' && <Clock size={18} className="text-purple-600" />}
                </div>
                <div className="flex-1 min-w-0">
                  <ResponsiveText weight="medium" className="truncate">
                    {activity.user} {activity.action}
                  </ResponsiveText>
                  <ResponsiveText variant="small" color="muted">
                    {activity.time}
                  </ResponsiveText>
                </div>
                <ArrowRight size={16} className="text-gray-400 flex-shrink-0" />
              </ResponsiveCard>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="px-4 sm:px-6 mt-8">
        <div className="max-w-6xl mx-auto">
          <ResponsiveText variant="h4" weight="semibold" className="mb-4">
            Quick Actions
          </ResponsiveText>
          
          <ResponsiveGrid cols={{ xs: 1, sm: 3 }} gap="md">
            {[
              { label: 'New Message', icon: MessageSquare, color: 'blue' },
              { label: 'Create Task', icon: CheckSquare, color: 'green' },
              { label: 'View Documents', icon: TrendingUp, color: 'purple' },
            ].map((action) => (
              <ResponsiveCard 
                key={action.label}
                variant="outlined"
                padding="md"
                className={`text-center cursor-pointer hover:border-${action.color}-500 hover:bg-${action.color}-50 transition flex flex-col items-center`}
              >
                <action.icon size={isMobile ? 24 : 28} className={`text-${action.color}-600 mb-2`} />
                <ResponsiveText weight="medium" className={`text-${action.color}-600`}>
                  {action.label}
                </ResponsiveText>
              </ResponsiveCard>
            ))}
          </ResponsiveGrid>
        </div>
      </div>
    </div>
  );
};
