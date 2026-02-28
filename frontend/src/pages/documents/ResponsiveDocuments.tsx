import React, { useEffect, useState } from 'react';
import { ResponsiveGrid } from '../../components/ui/ResponsiveGrid';
import { ResponsiveCard } from '../../components/ui/ResponsiveCard';
import { ResponsiveText } from '../../components/ui/ResponsiveText';
import { useAuth } from '../../contexts/AuthContext';
import { useIsMobile } from '../../hooks/useMediaQuery';
import { FileText, Upload, Search, Grid3x3, List, Download, Eye, Trash2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface Document {
  id: string;
  name: string;
  type: string;
  size: number;
  created_at: string;
  updated_at: string;
  category: string;
}

export const ResponsiveDocuments: React.FC = () => {
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    loadDocuments();
  }, [user?.id]);

  const loadDocuments = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('organization_id', user.organization_id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setDocuments(data || []);
    } catch (error) {
      console.error('Error loading documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || doc.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = Array.from(new Set(documents.map(d => d.category)));
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
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
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-6 sm:p-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div>
              <ResponsiveText variant="h2" color="default" className="text-white mb-2" weight="medium">
                Documents
              </ResponsiveText>
              <ResponsiveText color="default" className="text-white/80" weight="normal">
                Manage and organize your files
              </ResponsiveText>
            </div>
            <button className="p-3 bg-white/20 hover:bg-white/30 rounded-lg transition-colors flex items-center gap-2">
              <Upload size={20} />
              {!isMobile && <span>Upload</span>}
            </button>
          </div>

          {/* Stats */}
          <ResponsiveGrid cols={{ xs: 3, sm: 3, md: 3 }} gap="sm" className="mt-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
              <div className="text-2xl font-bold">{documents.length}</div>
              <div className="text-sm text-white/70">Total Files</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
              <div className="text-2xl font-bold">{categories.length}</div>
              <div className="text-sm text-white/70">Categories</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
              <div className="text-2xl font-bold">{formatFileSize(documents.reduce((acc, doc) => acc + doc.size, 0))}</div>
              <div className="text-sm text-white/70">Total Size</div>
            </div>
          </ResponsiveGrid>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-6 sm:p-8">
        {/* Search & Filters */}
        <div className="mb-6 flex flex-col gap-4">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search documents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            {!isMobile && (
              <div className="flex gap-2 bg-white border border-gray-200 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded ${viewMode === 'grid' ? 'bg-indigo-100 text-indigo-600' : 'text-gray-600'}`}
                  aria-label="Grid view"
                >
                  <Grid3x3 size={18} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded ${viewMode === 'list' ? 'bg-indigo-100 text-indigo-600' : 'text-gray-600'}`}
                  aria-label="List view"
                >
                  <List size={18} />
                </button>
              </div>
            )}
          </div>

          {/* Category Filter */}
          {categories.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedCategory(null)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedCategory === null
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-200 hover:border-indigo-600'
                }`}
              >
                All Categories
              </button>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedCategory === cat
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white text-gray-700 border border-gray-200 hover:border-indigo-600'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Grid View */}
        {(isMobile || viewMode === 'grid') && filteredDocuments.length > 0 && (
          <ResponsiveGrid cols={{ xs: 1, sm: 2, md: 3, lg: 4 }} gap="md">
            {filteredDocuments.map((doc) => (
              <ResponsiveCard key={doc.id} variant="outlined" className="hover:shadow-lg transition-all">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                    <FileText className="text-indigo-600" size={20} />
                  </div>
                  <div className="flex gap-1">
                    <button className="p-2 hover:bg-gray-100 rounded transition-colors" aria-label="View">
                      <Eye size={16} className="text-gray-600" />
                    </button>
                    <button className="p-2 hover:bg-gray-100 rounded transition-colors" aria-label="Delete">
                      <Trash2 size={16} className="text-red-600" />
                    </button>
                  </div>
                </div>
                <ResponsiveText variant="h4" weight="semibold" className="mb-1 truncate">
                  {doc.name}
                </ResponsiveText>
                <ResponsiveText color="muted" className="text-xs mb-3">
                  {formatFileSize(doc.size)}
                </ResponsiveText>
                <div className="pt-3 border-t border-gray-100">
                  <ResponsiveText color="muted" className="text-xs">
                    {new Date(doc.created_at).toLocaleDateString()}
                  </ResponsiveText>
                </div>
              </ResponsiveCard>
            ))}
          </ResponsiveGrid>
        )}

        {/* List View (Desktop only) */}
        {!isMobile && viewMode === 'list' && filteredDocuments.length > 0 && (
          <ResponsiveCard>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Name</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Category</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Size</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Created</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDocuments.map((doc) => (
                    <tr key={doc.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <FileText className="text-indigo-600" size={18} />
                          <span className="font-medium text-gray-900">{doc.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">{doc.category}</td>
                      <td className="py-3 px-4 text-sm text-gray-600">{formatFileSize(doc.size)}</td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {new Date(doc.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex gap-2 justify-end">
                          <button className="p-2 hover:bg-gray-100 rounded transition-colors" aria-label="Download">
                            <Download size={16} className="text-blue-600" />
                          </button>
                          <button className="p-2 hover:bg-gray-100 rounded transition-colors" aria-label="View">
                            <Eye size={16} className="text-gray-600" />
                          </button>
                          <button className="p-2 hover:bg-gray-100 rounded transition-colors" aria-label="Delete">
                            <Trash2 size={16} className="text-red-600" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </ResponsiveCard>
        )}

        {/* Empty State */}
        {filteredDocuments.length === 0 && (
          <ResponsiveCard className="text-center py-12">
            <FileText size={48} className="mx-auto text-gray-300 mb-4" />
            <ResponsiveText variant="h4" weight="semibold" color="muted" className="mb-2">
              No documents found
            </ResponsiveText>
            <ResponsiveText color="muted">
              {documents.length === 0 ? 'Start by uploading your first document.' : 'Try adjusting your search or filters.'}
            </ResponsiveText>
            <button className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors flex items-center gap-2 mx-auto">
              <Upload size={18} />
              Upload Document
            </button>
          </ResponsiveCard>
        )}
      </div>
    </div>
  );
};
