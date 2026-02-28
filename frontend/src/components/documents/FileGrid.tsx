import React, { useState, useEffect } from 'react';
import { 
  File, FileText, Image, FileSpreadsheet, 
  MoreVertical, Download, Share2, Lock
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface FileItem {
  id: string;
  name: string;
  url: string;
  format: string;
  size: number;
  created_at: string;
  uploaded_by: string;
  folder_id: string | null;
  version: number;
  is_locked: boolean;
  metadata: any;
}

interface FileGridProps {
  folderId: string | null;
  searchQuery: string;
  onFileSelect: (file: FileItem) => void;
}

export const FileGrid: React.FC<FileGridProps> = ({ 
  folderId, 
  searchQuery,
  onFileSelect 
}) => {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [viewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    fetchFiles();
  }, [folderId, searchQuery]);

  const fetchFiles = async () => {
    let query = supabase
      .from('files')
      .select('*')
      .order('created_at', { ascending: false });

    if (folderId) {
      query = query.eq('folder_id', folderId);
    }

    if (searchQuery) {
      query = query.ilike('name', `%${searchQuery}%`);
    }

    const { data, error } = await query;

    if (!error && data) {
      setFiles(data);
    }
    setLoading(false);
  };

  const getFileIcon = (format: string) => {
    if (format?.startsWith('image/')) return <Image size={24} className="text-blue-500" />;
    if (format?.includes('pdf')) return <FileText size={24} className="text-red-500" />;
    if (format?.includes('spreadsheet') || format?.includes('excel')) 
      return <FileSpreadsheet size={24} className="text-green-500" />;
    return <File size={24} className="text-gray-500" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const toggleFileSelection = (fileId: string) => {
    const newSelected = new Set(selectedFiles);
    if (newSelected.has(fileId)) {
      newSelected.delete(fileId);
    } else {
      newSelected.add(fileId);
    }
    setSelectedFiles(newSelected);
  };

  if (loading) {
    return <div className="flex-1 p-4">Loading...</div>;
  }

  if (viewMode === 'grid') {
    return (
      <div className="flex-1 p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {files.map(file => (
            <div
              key={file.id}
              className={`border rounded-lg p-3 hover:shadow-md transition cursor-pointer group ${
                selectedFiles.has(file.id) ? 'border-blue-500 bg-blue-50' : ''
              }`}
              onClick={() => toggleFileSelection(file.id)}
              onDoubleClick={() => onFileSelect(file)}
            >
              <div className="flex items-center justify-between mb-2">
                {getFileIcon(file.format)}
                {file.is_locked && <Lock size={14} className="text-gray-400" />}
              </div>
              
              <h4 className="font-medium text-sm truncate" title={file.name}>
                {file.name}
              </h4>
              
              <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                <span>{formatFileSize(file.size)}</span>
                <span>•</span>
                <span>v{file.version}</span>
              </div>
              
              <div className="text-xs text-gray-400 mt-1">
                {new Date(file.created_at).toLocaleDateString()}
              </div>
              
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 flex gap-1">
                <button className="p-1 hover:bg-gray-100 rounded">
                  <Download size={14} />
                </button>
                <button className="p-1 hover:bg-gray-100 rounded">
                  <Share2 size={14} />
                </button>
                <button className="p-1 hover:bg-gray-100 rounded">
                  <MoreVertical size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // List view
  return (
    <div className="flex-1 p-4">
      <table className="w-full">
        <thead className="bg-gray-50 text-xs text-gray-500">
          <tr>
            <th className="px-4 py-2 text-left">Name</th>
            <th className="px-4 py-2 text-left">Size</th>
            <th className="px-4 py-2 text-left">Modified</th>
            <th className="px-4 py-2 text-left">Version</th>
            <th className="px-4 py-2 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {files.map(file => (
            <tr key={file.id} className="border-b hover:bg-gray-50">
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  {getFileIcon(file.format)}
                  <span className="text-sm">{file.name}</span>
                </div>
              </td>
              <td className="px-4 py-3 text-sm">{formatFileSize(file.size)}</td>
              <td className="px-4 py-3 text-sm">
                {new Date(file.created_at).toLocaleDateString()}
              </td>
              <td className="px-4 py-3 text-sm">v{file.version}</td>
              <td className="px-4 py-3 text-right">
                <button className="p-1 hover:bg-gray-200 rounded mx-1">
                  <Download size={16} />
                </button>
                <button className="p-1 hover:bg-gray-200 rounded mx-1">
                  <Share2 size={16} />
                </button>
                <button className="p-1 hover:bg-gray-200 rounded mx-1">
                  <MoreVertical size={16} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
