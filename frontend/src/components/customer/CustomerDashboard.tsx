// src/components/customer/CustomerDashboard.tsx
import React, { useState, useEffect } from 'react';
import {
  Clock,
  Search,
  Plus,
  User,
  LogOut,
  Ticket,
  CheckCircle,
  FileText,
  MessageSquare,
  BookOpen
} from 'lucide-react';
import { customerPortal, type SupportTicket, type KnowledgeBaseArticle } from '../../services/customerPortalService';
import { supabase } from '../../lib/supabase';

export const CustomerDashboard: React.FC = () => {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'tickets' | 'messages' | 'documents' | 'knowledge'>('tickets');
  const [searchQuery, setSearchQuery] = useState('');
  const [stats, setStats] = useState({
    openTickets: 0,
    resolvedTickets: 0,
    avgResponseTime: 'N/A',
    documents: 0
  });
  const [knowledgeArticles, setKnowledgeArticles] = useState<KnowledgeBaseArticle[]>([]);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    loadDashboardData();
    getCurrentUser();
  }, []);

  const getCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
  };

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [ticketsData, dashboardStats, articles] = await Promise.all([
        customerPortal.getTickets(),
        customerPortal.getDashboardStats(),
        customerPortal.searchKnowledgeBase('') // Get all articles
      ]);

      setTickets(ticketsData);
      setStats({
        openTickets: dashboardStats.openTickets,
        resolvedTickets: dashboardStats.resolvedTickets,
        avgResponseTime: dashboardStats.avgResponseTime,
        documents: dashboardStats.documents
      });
      setKnowledgeArticles(articles);

    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/customer/login';
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      open: 'bg-blue-100 text-blue-700',
      in_progress: 'bg-yellow-100 text-yellow-700',
      waiting: 'bg-purple-100 text-purple-700',
      resolved: 'bg-green-100 text-green-700',
      closed: 'bg-gray-100 text-gray-700'
    };
    return styles[status as keyof typeof styles] || styles.open;
  };

  const getPriorityBadge = (priority: string) => {
    const styles = {
      low: 'bg-gray-100 text-gray-700',
      medium: 'bg-blue-100 text-blue-700',
      high: 'bg-orange-100 text-orange-700',
      urgent: 'bg-red-100 text-red-700'
    };
    return styles[priority as keyof typeof styles] || styles.medium;
  };

  const filteredTickets = tickets.filter(ticket =>
    ticket.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ticket.ticket_number.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredArticles = knowledgeArticles.filter(article =>
    article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    article.excerpt.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">WS</span>
              </div>
              <h1 className="text-xl font-semibold text-gray-900">Customer Portal</h1>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                  <User size={16} className="text-gray-600" />
                </div>
                <span className="text-sm text-gray-700">{user?.email}</span>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
                title="Logout"
              >
                <LogOut size={18} />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={<Ticket className="text-blue-600" />}
            label="Open Tickets"
            value={stats.openTickets}
            bgColor="bg-blue-50"
          />
          <StatCard
            icon={<CheckCircle className="text-green-600" />}
            label="Resolved"
            value={stats.resolvedTickets}
            bgColor="bg-green-50"
          />
          <StatCard
            icon={<Clock className="text-purple-600" />}
            label="Avg Response"
            value={stats.avgResponseTime}
            bgColor="bg-purple-50"
          />
          <StatCard
            icon={<FileText className="text-orange-600" />}
            label="Documents"
            value={stats.documents}
            bgColor="bg-orange-50"
          />
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="flex gap-6">
            <TabButton
              active={activeTab === 'tickets'}
              onClick={() => setActiveTab('tickets')}
              icon={<Ticket size={18} />}
              label="Tickets"
            />
            <TabButton
              active={activeTab === 'messages'}
              onClick={() => setActiveTab('messages')}
              icon={<MessageSquare size={18} />}
              label="Messages"
            />
            <TabButton
              active={activeTab === 'documents'}
              onClick={() => setActiveTab('documents')}
              icon={<FileText size={18} />}
              label="Documents"
            />
            <TabButton
              active={activeTab === 'knowledge'}
              onClick={() => setActiveTab('knowledge')}
              icon={<BookOpen size={18} />}
              label="Knowledge Base"
            />
          </nav>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder={`Search ${activeTab}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Content Area */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <>
            {/* Tickets Tab */}
            {activeTab === 'tickets' && (
              <div className="bg-white rounded-lg shadow">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-900">Support Tickets</h2>
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2">
                      <Plus size={18} />
                      New Ticket
                    </button>
                  </div>
                </div>
                
                {filteredTickets.length === 0 ? (
                  <div className="text-center py-12">
                    <Ticket size={48} className="mx-auto text-gray-300 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No tickets found</h3>
                    <p className="text-gray-500 mb-4">Create your first support ticket to get help</p>
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                      Create Ticket
                    </button>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-200">
                    {filteredTickets.map(ticket => (
                      <div key={ticket.id} className="p-6 hover:bg-gray-50 cursor-pointer">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="font-medium text-gray-900">{ticket.subject}</h3>
                            <p className="text-sm text-gray-500">#{ticket.ticket_number}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(ticket.status)}`}>
                              {ticket.status.replace('_', ' ').toUpperCase()}
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityBadge(ticket.priority)}`}>
                              {ticket.priority.toUpperCase()}
                            </span>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{ticket.description}</p>
                        <div className="flex items-center gap-4 text-xs text-gray-400">
                          <span>Created {new Date(ticket.created_at).toLocaleDateString()}</span>
                          <span>•</span>
                          <span>Last updated {new Date(ticket.updated_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Messages Tab */}
            {activeTab === 'messages' && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Messages</h2>
                <div className="text-center py-12">
                  <MessageSquare size={48} className="mx-auto text-gray-300 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No direct messages</h3>
                  <p className="text-gray-500">Your communication happens through support tickets</p>
                </div>
              </div>
            )}

            {/* Documents Tab */}
            {activeTab === 'documents' && (
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">Documents</h2>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2">
                    <Plus size={18} />
                    Upload Document
                  </button>
                </div>
                <div className="text-center py-12">
                  <FileText size={48} className="mx-auto text-gray-300 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No documents yet</h3>
                  <p className="text-gray-500 mb-4">Upload documents to share with support team</p>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    Upload Document
                  </button>
                </div>
              </div>
            )}

            {/* Knowledge Base Tab */}
            {activeTab === 'knowledge' && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Knowledge Base</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredArticles.slice(0, 8).map(article => (
                    <KnowledgeBaseCard
                      key={article.id}
                      title={article.title}
                      excerpt={article.excerpt}
                      category={article.category}
                      helpful={article.helpful_count}
                      views={article.views}
                    />
                  ))}
                </div>
                
                {filteredArticles.length === 0 && (
                  <div className="text-center py-12">
                    <BookOpen size={48} className="mx-auto text-gray-300 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No articles found</h3>
                    <p className="text-gray-500">Try searching for different keywords</p>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

// Helper Components
const StatCard: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string | number;
  bgColor: string;
}> = ({ icon, label, value, bgColor }) => (
  <div className={`${bgColor} rounded-lg p-6`}>
    <div className="flex items-center justify-between mb-2">
      <span className="text-gray-600 text-sm">{label}</span>
      {icon}
    </div>
    <div className="text-2xl font-bold text-gray-900">{value}</div>
  </div>
);

const TabButton: React.FC<{
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}> = ({ active, onClick, icon, label }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-4 py-2 border-b-2 transition ${
      active
        ? 'border-blue-600 text-blue-600'
        : 'border-transparent text-gray-500 hover:text-gray-700'
    }`}
  >
    {icon}
    <span className="text-sm font-medium">{label}</span>
  </button>
);

const KnowledgeBaseCard: React.FC<{
  title: string;
  excerpt: string;
  category: string;
  helpful: number;
  views: number;
}> = ({ title, excerpt, category, helpful, views }) => (
  <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition cursor-pointer">
    <div className="flex items-center gap-2 mb-2">
      <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded">
        {category}
      </span>
    </div>
    <h3 className="font-medium text-gray-900 mb-1">{title}</h3>
    <p className="text-sm text-gray-600 mb-3">{excerpt}</p>
    <div className="flex items-center justify-between text-xs text-gray-500">
      <span>{views} views</span>
      <span>{helpful} found helpful</span>
    </div>
  </div>
);
