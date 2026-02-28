import React, { useEffect, useState } from 'react';
import { 
  TrendingUp, Users, MessageSquare, CheckCircle, 
  Clock, FileText, Download, Calendar 
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, Cell 
} from 'recharts';

interface DashboardMetrics {
  activeUsers: number;
  totalMessages: number;
  tasksCompleted: number;
  approvalsPending: number;
  documentsUploaded: number;
  avgResponseTime: number;
  userGrowth: { date: string; count: number }[];
  departmentActivity: { name: string; messages: number; tasks: number }[];
}

interface KPICardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  trend: number;
  inverse?: boolean;
}

export const ExecutiveDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [timeRange, setTimeRange] = useState<'today' | 'week' | 'month'>('week');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMetrics();
    subscribeToUpdates();
  }, [timeRange]);

  const fetchMetrics = async () => {
    try {
      const { data, error } = await supabase
        .rpc('get_executive_dashboard', { time_range: time_range });
      
      if (!error && data) {
        setMetrics(data);
      }
    } catch (error) {
      console.error('Error fetching metrics:', error);
    }
    setLoading(false);
  };

  const subscribeToUpdates = () => {
    const subscription = supabase
      .channel('analytics-updates')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'analytics_events' 
        },
        (payload) => {
          // Update metrics incrementally
          updateMetricsIncrementally(payload.new);
        }
      )
      .subscribe();
    
    return () => subscription.unsubscribe();
  };

  const updateMetricsIncrementally = (newEvent: any) => {
    if (!metrics) return;
    
    // Update metrics based on event type
    switch (newEvent.event_type) {
      case 'login':
        // Update active users count
        setMetrics(prev => ({
          ...prev,
          activeUsers: (prev?.activeUsers || 0) + 1
        }));
        break;
      case 'message_sent':
        // Update message count
        setMetrics(prev => ({
          ...prev,
          totalMessages: (prev?.totalMessages || 0) + 1
        }));
        break;
      case 'task_completed':
        // Update tasks completed
        setMetrics(prev => ({
          ...prev,
          tasksCompleted: (prev?.tasksCompleted || 0) + 1
        }));
        break;
      case 'approval_completed':
        // Update pending approvals (decrement)
        setMetrics(prev => ({
          ...prev,
          approvalsPending: Math.max(0, (prev?.approvalsPending || 0) - 1)
        }));
        break;
      case 'document_uploaded':
        // Update documents uploaded
        setMetrics(prev => ({
          ...prev,
          documentsUploaded: (prev?.documentsUploaded || 0) + 1
        }));
        break;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="spinner w-8 h-8"></div>
        <span className="ml-2 text-gray-600">Loading analytics...</span>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Executive Dashboard</h1>
        <div className="flex gap-2">
          <button 
            onClick={() => setTimeRange('today')}
            className={`px-3 py-1 rounded ${
              timeRange === 'today' ? 'bg-brand-600 text-white' : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            Today
          </button>
          <button 
            onClick={() => setTimeRange('week')}
            className={`px-3 py-1 rounded ${
              timeRange === 'week' ? 'bg-brand-600 text-white' : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            This Week
          </button>
          <button 
            onClick={() => setTimeRange('month')}
            className={`px-3 py-1 rounded ${
              timeRange === 'month' ? 'bg-brand-600 text-white' : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            This Month
          </button>
          <button className="p-2 bg-gray-100 rounded hover:bg-gray-200">
            <Download size={18} />
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Active Users"
          value={metrics?.activeUsers || 0}
          icon={<Users className="text-blue-500" />}
          trend={12}
        />
        <KPICard
          title="Messages"
          value={metrics?.totalMessages || 0}
          icon={<MessageSquare className="text-green-500" />}
          trend={8}
        />
        <KPICard
          title="Tasks Completed"
          value={metrics?.tasksCompleted || 0}
          icon={<CheckCircle className="text-purple-500" />}
          trend={15}
        />
        <KPICard
          title="Pending Approvals"
          value={metrics?.approvalsPending || 0}
          icon={<Clock className="text-orange-500" />}
          trend={-5}
          inverse
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Growth Chart */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="font-semibold mb-4">User Growth</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={metrics?.userGrowth || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="count" 
                stroke="#3B82F6" 
                strokeWidth={2}
                dot={{ fill: '#3B82F6' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Department Activity */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="font-semibold mb-4">Department Activity</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={metrics?.departmentActivity || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="messages" fill="#3B82F6" />
              <Bar dataKey="tasks" fill="#10B981" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Real-time Activity Feed */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="font-semibold mb-4">Live Activity</h3>
        <div className="space-y-3">
          {[
            { icon: <MessageSquare className="text-green-500" />, text: 'New message from John Doe', time: '2 minutes ago' },
            { icon: <CheckCircle className="text-purple-500" />, text: 'Task "Q4 Report" completed by Sarah', time: '5 minutes ago' },
            { icon: <FileText className="text-blue-500" />, text: 'Budget proposal uploaded', time: '10 minutes ago' },
            { icon: <TrendingUp className="text-orange-500" />, text: 'New user registration: Jane Smith', time: '15 minutes ago' },
            { icon: <Users className="text-blue-500" />, text: 'Team meeting scheduled', time: '30 minutes ago' }
          ].map((activity, index) => (
            <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              {activity.icon}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">{activity.text}</p>
                <p className="text-xs text-gray-500">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const KPICard: React.FC<KPICardProps> = ({ title, value, icon, trend, inverse }) => (
  <div className="bg-white p-4 rounded-lg shadow">
    <div className="flex items-center justify-between mb-2">
      <span className="text-gray-500 text-sm">{title}</span>
      {icon}
    </div>
    <div className="text-2xl font-bold">{value.toLocaleString()}</div>
    <div className={`text-sm ${
      trend > 0 ? (inverse ? 'text-red-500' : 'text-green-500') : 'text-red-500'
    }`}>
      {trend > 0 ? '+' : ''}{trend}% from last period
    </div>
  </div>
);
