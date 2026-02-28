import React, { useState } from 'react';
import { 
  Search, Grid, List, Plus, Filter, 
  Upload, FolderPlus, Download, Share2, Trash2 
} from 'lucide-react';
import { FolderTree } from './FolderTree';
import { FileGrid } from './FileGrid';

export const DocumentManager: React.FC = () => {
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());

  const handleFileSelect = (file: any) => {
    // Open file preview or download
    window.open(file.url, '_blank');
  };

  return (
    <div className="flex h-full">
      {/* Left Sidebar - Folder Tree */}
      <FolderTree 
        onSelectFolder={(folder) => setSelectedFolder(folder?.id || null)}
        selectedFolderId={selectedFolder}
        onNewFolder={() => {
          // Handle new folder creation
          console.log('Create new folder in:', selectedFolder);
        }}
      />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Toolbar */}
        <div className="border-b p-4 flex items-center justify-between">
          <div className="flex items-center gap-4 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search files..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded ${viewMode === 'grid' ? 'bg-gray-100' : ''}`}
              title="Grid view"
            >
              <Grid size={18} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded ${viewMode === 'list' ? 'bg-gray-100' : ''}`}
              title="List view"
            >
              <List size={18} />
            </button>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              title="Upload files"
            >
              <Upload size={18} />
              Upload
            </button>
            
            <button
              className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50"
              title="Create new folder"
            >
              <FolderPlus size={18} />
              New Folder
            </button>
            
            {selectedFiles.size > 0 && (
              <>
                <button className="p-2 hover:bg-gray-100 rounded" title="Download selected">
                  <Download size={18} />
                </button>
                <button className="p-2 hover:bg-gray-100 rounded" title="Share selected">
                  <Share2 size={18} />
                </button>
                <button className="p-2 hover:bg-gray-100 rounded text-red-500" title="Delete selected">
                  <Trash2 size={18} />
                </button>
              </>
            )}
          </div>
        </div>
        
        {/* File Grid/List */}
        <FileGrid 
          folderId={selectedFolder}
          searchQuery={searchQuery}
          onFileSelect={handleFileSelect}
        />
      </div>
    </div>
  );
};
