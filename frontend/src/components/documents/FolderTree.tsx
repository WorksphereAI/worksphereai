import React, { useState, useEffect } from 'react';
import { ChevronRight, ChevronDown, Folder, FolderOpen, MoreVertical, Plus } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface Folder {
  id: string;
  name: string;
  parent_id: string | null;
  children?: Folder[];
}

interface FolderTreeProps {
  onSelectFolder: (folder: Folder | null) => void;
  selectedFolderId: string | null;
  onNewFolder: (parentId: string | null) => void;
}

export const FolderTree: React.FC<FolderTreeProps> = ({ 
  onSelectFolder, 
  selectedFolderId,
  onNewFolder 
}) => {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFolders();
  }, []);

  const fetchFolders = async () => {
    const { data, error } = await supabase
      .from('folders')
      .select('*')
      .order('name');

    if (!error && data) {
      const folderMap = new Map();
      const rootFolders: Folder[] = [];

      data.forEach(folder => {
        folderMap.set(folder.id, { ...folder, children: [] });
      });

      data.forEach(folder => {
        const folderWithChildren = folderMap.get(folder.id);
        if (folder.parent_id) {
          const parent = folderMap.get(folder.parent_id);
          if (parent) {
            parent.children.push(folderWithChildren);
          }
        } else {
          rootFolders.push(folderWithChildren);
        }
      });

      setFolders(rootFolders);
    }
    setLoading(false);
  };

  const toggleFolder = (folderId: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(folderId)) {
      newExpanded.delete(folderId);
    } else {
      newExpanded.add(folderId);
    }
    setExpandedFolders(newExpanded);
  };

  const renderFolder = (folder: Folder, level: number = 0) => {
    const isExpanded = expandedFolders.has(folder.id);
    const hasChildren = folder.children && folder.children.length > 0;

    return (
      <div key={folder.id}>
        <div
          className={`flex items-center py-1 px-2 hover:bg-gray-100 rounded cursor-pointer ${
            selectedFolderId === folder.id ? 'bg-blue-50 text-blue-600' : ''
          }`}
          style={{ paddingLeft: `${level * 20 + 8}px` }}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleFolder(folder.id);
            }}
            className="w-5 h-5 flex items-center justify-center"
          >
            {hasChildren ? (
              isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />
            ) : null}
          </button>
          
          <div
            className="flex items-center flex-1 gap-2"
            onClick={() => onSelectFolder(folder)}
          >
            {isExpanded ? 
              <FolderOpen size={18} className="text-yellow-500" /> : 
              <Folder size={18} className="text-yellow-500" />
            }
            <span className="text-sm">{folder.name}</span>
          </div>
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              onNewFolder(folder.id);
            }}
            className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-200 rounded"
          >
            <Plus size={14} />
          </button>
        </div>
        
        {isExpanded && folder.children?.map(child => renderFolder(child, level + 1))}
      </div>
    );
  };

  return (
    <div className="w-64 border-r bg-white p-2">
      <div className="flex items-center justify-between mb-2 px-2">
        <h3 className="font-semibold text-sm">Files</h3>
        <button
          onClick={() => onNewFolder(null)}
          className="p-1 hover:bg-gray-100 rounded"
        >
          <Plus size={16} />
        </button>
      </div>
      
      <div
        className={`py-1 px-2 mb-1 hover:bg-gray-100 rounded cursor-pointer ${
          selectedFolderId === null ? 'bg-blue-50 text-blue-600' : ''
        }`}
        onClick={() => onSelectFolder(null)}
      >
        <div className="flex items-center gap-2">
          <Folder size={18} className="text-gray-500" />
          <span className="text-sm">All Files</span>
        </div>
      </div>
      
      {folders.map(folder => renderFolder(folder))}
    </div>
  );
};
