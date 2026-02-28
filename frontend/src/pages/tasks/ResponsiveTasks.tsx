import React, { useEffect, useState } from 'react';
import { ResponsiveGrid } from '../../components/ui/ResponsiveGrid';
import { ResponsiveCard } from '../../components/ui/ResponsiveCard';
import { ResponsiveText } from '../../components/ui/ResponsiveText';
import { useAuth } from '../../contexts/AuthContext';
import { useIsMobile } from '../../hooks/useMediaQuery';
import { useNavigate } from 'react-router-dom';
import { CheckSquare, Clock, AlertCircle, Plus, Calendar } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface Task {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  due_date: string;
  assigned_to: string;
}

export const ResponsiveTasks: React.FC = () => {
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'in-progress' | 'completed'>('all');

  useEffect(() => {
    loadTasks();
  }, [user?.id]);

  useEffect(() => {
    filterTasks();
  }, [tasks, filter]);

  const loadTasks = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('assigned_to', user.id)
        .order('due_date', { ascending: true });

      if (error) throw error;

      setTasks(data || []);
    } catch (error) {
      console.error('Error loading tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterTasks = () => {
    if (filter === 'all') {
      setFilteredTasks(tasks);
    } else {
      setFilteredTasks(tasks.filter(task => task.status === filter));
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-700 border-red-300';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'low':
        return 'bg-green-100 text-green-700 border-green-300';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckSquare className="text-green-600" size={18} />;
      case 'in-progress':
        return <Clock className="text-blue-600" size={18} />;
      case 'pending':
        return <AlertCircle className="text-orange-600" size={18} />;
      default:
        return null;
    }
  };

  const taskStats = {
    total: tasks.length,
    pending: tasks.filter(t => t.status === 'pending').length,
    inProgress: tasks.filter(t => t.status === 'in-progress').length,
    completed: tasks.filter(t => t.status === 'completed').length,
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
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-4 py-6 sm:p-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div>
              <ResponsiveText variant="h2" color="default" className="text-white mb-2" weight="medium">
                Tasks
              </ResponsiveText>
              <ResponsiveText color="default" className="text-white/80" weight="normal">
                Stay organized and on track
              </ResponsiveText>
            </div>
            <button
              onClick={() => navigate('/tasks/new')}
              className="p-3 bg-white/20 hover:bg-white/30 rounded-lg transition-colors" aria-label="Create new task">
              <Plus size={20} />
            </button>
          </div>

          {/* Stats */}
          <ResponsiveGrid cols={{ xs: 2, sm: 2, md: 4 }} gap="sm" className="mt-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
              <div className="text-2xl font-bold">{taskStats.total}</div>
              <div className="text-sm text-white/70">Total Tasks</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
              <div className="text-2xl font-bold">{taskStats.pending}</div>
              <div className="text-sm text-white/70">Pending</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
              <div className="text-2xl font-bold">{taskStats.inProgress}</div>
              <div className="text-sm text-white/70">In Progress</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
              <div className="text-2xl font-bold">{taskStats.completed}</div>
              <div className="text-sm text-white/70">Completed</div>
            </div>
          </ResponsiveGrid>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-6 sm:p-8">
        {/* Filters */}
        <div className="mb-6 flex flex-wrap gap-2">
          {(['all', 'pending', 'in-progress', 'completed'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                filter === f
                  ? 'bg-emerald-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-200 hover:border-emerald-600'
              }`}
            >
              {f === 'all' ? 'All' : f === 'in-progress' ? 'In Progress' : f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {/* Desktop Table View */}
        {!isMobile && filteredTasks.length > 0 && (
          <ResponsiveCard>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Task</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Due Date</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Priority</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTasks.map((task) => (
                    <tr key={task.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div>
                          <div className="font-medium text-gray-900">{task.title}</div>
                          <div className="text-sm text-gray-500">{task.description}</div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar size={16} />
                          {new Date(task.due_date).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getPriorityColor(task.priority)}`}>
                          {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(task.status)}
                          <span className="text-sm text-gray-700 capitalize">{task.status.replace('-', ' ')}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </ResponsiveCard>
        )}

        {/* Mobile Card View */}
        {isMobile && filteredTasks.length > 0 && (
          <ResponsiveGrid cols={{ xs: 1 }} gap="md">
            {filteredTasks.map((task) => (
              <ResponsiveCard key={task.id} variant="outlined" className="hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <ResponsiveText variant="h4" weight="semibold" className="mb-1">
                      {task.title}
                    </ResponsiveText>
                    <ResponsiveText color="muted" className="text-sm">
                      {task.description}
                    </ResponsiveText>
                  </div>
                  {getStatusIcon(task.status)}
                </div>

                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar size={16} />
                    {new Date(task.due_date).toLocaleDateString()}
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(task.priority)}`}>
                    {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                  </span>
                </div>

                <div className="mt-3 pt-3 border-t border-gray-200">
                  <ResponsiveText color="muted" className="text-xs">
                    Status: <span className="capitalize font-medium text-gray-700">{task.status.replace('-', ' ')}</span>
                  </ResponsiveText>
                </div>
              </ResponsiveCard>
            ))}
          </ResponsiveGrid>
        )}

        {/* Empty State */}
        {filteredTasks.length === 0 && (
          <ResponsiveCard className="text-center py-12">
            <CheckSquare size={48} className="mx-auto text-gray-300 mb-4" />
            <ResponsiveText variant="h4" weight="semibold" color="muted" className="mb-2">
              No tasks
            </ResponsiveText>
            <ResponsiveText color="muted">
              {filter === 'all' ? 'You have no tasks yet.' : `No ${filter.replace('-', ' ')} tasks.`}
            </ResponsiveText>
            <button
              onClick={() => navigate('/tasks/new')}
              className="mt-4 px-6 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors">
              Create Task
            </button>
          </ResponsiveCard>
        )}
      </div>
    </div>
  );
};
