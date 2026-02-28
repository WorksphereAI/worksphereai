import React, { useEffect, useState } from 'react';
import { ResponsiveGrid } from '../../components/ui/ResponsiveGrid';
import { ResponsiveCard } from '../../components/ui/ResponsiveCard';
import { ResponsiveText } from '../../components/ui/ResponsiveText';
import { useAuth } from '../../contexts/AuthContext';
import { useIsMobile } from '../../hooks/useMediaQuery';
import { CheckCircle, XCircle, Clock, User, Filter } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface Approval {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'approved' | 'rejected';
  requestor_id: string;
  created_at: string;
  requested_by?: {
    full_name: string;
  };
}

export const ResponsiveApprovals: React.FC = () => {
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const [approvals, setApprovals] = useState<Approval[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');

  useEffect(() => {
    loadApprovals();
  }, [user?.id]);

  const loadApprovals = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('approvals')
        .select(`
          *,
          requested_by:requestor_id(full_name)
        `)
        .eq('reviewer_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setApprovals(data || []);
    } catch (error) {
      console.error('Error loading approvals:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredApprovals = filter === 'all' 
    ? approvals 
    : approvals.filter(a => a.status === filter);

  const stats = {
    total: approvals.length,
    pending: approvals.filter(a => a.status === 'pending').length,
    approved: approvals.filter(a => a.status === 'approved').length,
    rejected: approvals.filter(a => a.status === 'rejected').length,
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="text-green-600" size={20} />;
      case 'rejected':
        return <XCircle className="text-red-600" size={20} />;
      case 'pending':
        return <Clock className="text-orange-600" size={20} />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-50 border-green-200';
      case 'rejected':
        return 'bg-red-50 border-red-200';
      case 'pending':
        return 'bg-orange-50 border-orange-200';
      default:
        return 'bg-gray-50';
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
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-600 to-red-600 text-white px-4 py-6 sm:p-8">
        <div className="max-w-6xl mx-auto">
          <ResponsiveText variant="h2" color="default" className="text-white mb-2" weight="medium">
            Approvals
          </ResponsiveText>
          <ResponsiveText color="default" className="text-white/80" weight="normal">
            Review and manage approval requests
          </ResponsiveText>

          {/* Stats */}
          <ResponsiveGrid cols={{ xs: 2, sm: 2, md: 4 }} gap="sm" className="mt-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
              <div className="text-2xl font-bold">{stats.total}</div>
              <div className="text-sm text-white/70">Total Requests</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
              <div className="text-2xl font-bold">{stats.pending}</div>
              <div className="text-sm text-white/70">Pending</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
              <div className="text-2xl font-bold">{stats.approved}</div>
              <div className="text-sm text-white/70">Approved</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
              <div className="text-2xl font-bold">{stats.rejected}</div>
              <div className="text-sm text-white/70">Rejected</div>
            </div>
          </ResponsiveGrid>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-6 sm:p-8">
        {/* Filters */}
        <div className="mb-6 flex flex-wrap gap-2">
          {(['pending', 'approved', 'rejected', 'all'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors flex items-center gap-2 ${
                filter === f
                  ? 'bg-orange-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-200 hover:border-orange-600'
              }`}
            >
              {f === 'pending' && <Clock size={18} />}
              {f === 'approved' && <CheckCircle size={18} />}
              {f === 'rejected' && <XCircle size={18} />}
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {/* Approvals List */}
        <ResponsiveGrid cols={{ xs: 1 }} gap="md">
          {filteredApprovals.map((approval) => (
            <ResponsiveCard 
              key={approval.id} 
              variant="outlined"
              className={`${getStatusColor(approval.status)} hover:shadow-md transition-all`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-start gap-3">
                    {getStatusIcon(approval.status)}
                    <div className="flex-1">
                      <ResponsiveText variant="h4" weight="semibold" className="mb-1">
                        {approval.title}
                      </ResponsiveText>
                      <ResponsiveText color="muted" className="text-sm mb-2">
                        {approval.description}
                      </ResponsiveText>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <User size={16} />
                        <span>Requested by: {approval.requested_by?.full_name || 'Unknown'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 pt-4 border-t border-gray-200">
                {approval.status === 'pending' && (
                  <>
                    <button className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors">
                      Approve
                    </button>
                    <button className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors">
                      Reject
                    </button>
                  </>
                )}
                {approval.status === 'approved' && (
                  <div className="text-center text-green-700 font-medium py-2">
                    ✓ Approved on {new Date(approval.created_at).toLocaleDateString()}
                  </div>
                )}
                {approval.status === 'rejected' && (
                  <div className="text-center text-red-700 font-medium py-2">
                    ✕ Rejected on {new Date(approval.created_at).toLocaleDateString()}
                  </div>
                )}
              </div>
            </ResponsiveCard>
          ))}
        </ResponsiveGrid>

        {/* Empty State */}
        {filteredApprovals.length === 0 && (
          <ResponsiveCard className="text-center py-12">
            <CheckCircle size={48} className="mx-auto text-gray-300 mb-4" />
            <ResponsiveText variant="h4" weight="semibold" color="muted" className="mb-2">
              No approvals
            </ResponsiveText>
            <ResponsiveText color="muted">
              {filter === 'pending' ? 'You have no pending approval requests.' : `No ${filter} approvals.`}
            </ResponsiveText>
          </ResponsiveCard>
        )}
      </div>
    </div>
  );
};
