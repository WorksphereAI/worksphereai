import React, { useState, useEffect } from 'react'
import { 
  Folder, 
  File, 
  Upload, 
  Search, 
  Download, 
  MoreVertical, 
  Plus, 
  Grid, 
  List, 
  Filter,
  Eye,
  Edit,
  Trash2,
  Clock,
  Users,
  Share2,
  Star,
  History,
  Tag
} from 'lucide-react'
import { supabase } from '../lib/supabase'
import { uploadFile } from '../lib/cloudinary'

interface Document {
  id: string
  name: string
  url: string
  public_id: string
  format: string
  size: number
  uploaded_by: string
  organization_id: string
  department_id?: string
  folder_id?: string
  version: number
  metadata: Record<string, any>
  permissions: Record<string, any>
  created_at: string
  updated_at: string
  uploaded_by_user?: {
    full_name: string
    avatar_url?: string
  }
}

interface Folder {
  id: string
  name: string
  parent_id?: string
  organization_id: string
  department_id?: string
  created_by: string
  permissions: Record<string, any>
  created_at: string
  updated_at: string
  document_count?: number
  children?: Folder[]
}

interface DocumentsProps {
  user: any
}

export const Documents: React.FC<DocumentsProps> = ({ user }) => {
  const [documents, setDocuments] = useState<Document[]>([])
  const [folders, setFolders] = useState<Folder[]>([])
  const [currentFolder, setCurrentFolder] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'size'>('date')
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [showCreateFolderModal, setShowCreateFolderModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([])
  const [showVersionHistory, setShowVersionHistory] = useState<Document | null>(null)

  useEffect(() => {
    loadDocuments()
    loadFolders()
    subscribeToRealtimeUpdates()
  }, [user, currentFolder])

  const loadDocuments = async () => {
    try {
      let query = supabase
        .from('files')
        .select(`
          *,
          uploaded_by_user:uploaded_by (full_name, avatar_url)
        `)
        .eq('organization_id', user.organization_id)
        .order('updated_at', { ascending: false })

      if (currentFolder) {
        query = query.eq('folder_id', currentFolder)
      }

      if (user.department_id) {
        query = query.eq('department_id', user.department_id)
      }

      const { data, error } = await query

      if (error) throw error
      setDocuments(data || [])
    } catch (error) {
      console.error('Error loading documents:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadFolders = async () => {
    try {
      const { data, error } = await supabase
        .from('folders')
        .select('*')
        .eq('organization_id', user.organization_id)
        .is('parent_id', null)
        .order('name', { ascending: true })

      if (error) throw error
      setFolders(data || [])
    } catch (error) {
      console.error('Error loading folders:', error)
    }
  }

  const subscribeToRealtimeUpdates = () => {
    // Subscribe to document changes
    const subscription = supabase
      .channel(`documents:${user.organization_id}`)
      .on('postgres_changes',
        { 
          event: '*',
          schema: 'public',
          table: 'files',
          filter: `organization_id=eq.${user.organization_id}`
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setDocuments(prev => [payload.new, ...prev])
          } else if (payload.eventType === 'UPDATE') {
            setDocuments(prev => prev.map(doc => 
              doc.id === payload.new.id ? payload.new : doc
            ))
          } else if (payload.eventType === 'DELETE') {
            setDocuments(prev => prev.filter(doc => doc.id !== payload.old.id))
          }
        }
      )
      .subscribe()

    return () => subscription.unsubscribe()
  }

  const handleFileUpload = async (files: FileList) => {
    try {
      for (const file of Array.from(files)) {
        const url = await uploadFile(file)
        
        await supabase
          .from('files')
          .insert({
            name: file.name,
            url,
            public_id: url.split('/').pop()?.split('.')[0] || '',
            format: file.type,
            size: file.size,
            uploaded_by: user.id,
            organization_id: user.organization_id,
            department_id: user.department_id,
            folder_id: currentFolder,
            version: 1,
            metadata: {
              original_name: file.name,
              uploaded_at: new Date().toISOString()
            }
          })
      }

      setShowUploadModal(false)
      loadDocuments() // Refresh document list
    } catch (error) {
      console.error('Error uploading files:', error)
    }
  }

  const createFolder = async (folderName: string) => {
    try {
      const { error } = await supabase
        .from('folders')
        .insert({
          name: folderName,
          organization_id: user.organization_id,
          department_id: user.department_id,
          parent_id: currentFolder,
          created_by: user.id,
          permissions: {
            can_read: true,
            can_write: true,
            can_delete: true,
            can_share: true
          }
        })

      if (error) throw error

      setShowCreateFolderModal(false)
      loadFolders()
    } catch (error) {
      console.error('Error creating folder:', error)
    }
  }

  const deleteDocument = async (documentId: string) => {
    try {
      const { error } = await supabase
        .from('files')
        .delete()
        .eq('id', documentId)

      if (error) throw error

      loadDocuments()
    } catch (error) {
      console.error('Error deleting document:', error)
    }
  }

  const createNewVersion = async (documentId: string, newFile: File) => {
    try {
      // Get current document to increment version
      const { data: currentDoc } = await supabase
        .from('files')
        .select('version')
        .eq('id', documentId)
        .single()

      const newVersion = (currentDoc?.version || 0) + 1
      const url = await uploadFile(newFile)

      // Create new version
      await supabase
        .from('files')
        .insert({
          ...currentDoc,
          id: crypto.randomUUID(),
          url,
          public_id: url.split('/').pop()?.split('.')[0] || '',
          format: newFile.type,
          size: newFile.size,
          version: newVersion,
          metadata: {
            ...currentDoc?.metadata,
            previous_version: currentDoc?.version,
            uploaded_at: new Date().toISOString()
          }
        })

      // Update original document with reference to new version
      await supabase
        .from('files')
        .update({
          metadata: {
            ...currentDoc?.metadata,
            latest_version: newVersion,
            updated_at: new Date().toISOString()
          }
        })
        .eq('id', documentId)

      loadDocuments()
    } catch (error) {
      console.error('Error creating new version:', error)
    }
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getFileIcon = (format: string): string => {
    const extension = format.toLowerCase().split('.').pop()
    const iconMap: Record<string, string> = {
      pdf: '📄',
      doc: '📝',
      docx: '📝',
      xls: '📊',
      xlsx: '📊',
      ppt: '📊',
      pptx: '📊',
      jpg: '🖼️',
      jpeg: '🖼️',
      png: '🖼️',
      gif: '🖼️',
      mp4: '🎥',
      avi: '🎥',
      mov: '🎥',
      zip: '📦',
      rar: '📦',
      txt: '📄',
      md: '📄'
    }
    return iconMap[extension] || '📄'
  }

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = filterType === 'all' || doc.format.includes(filterType)
    return matchesSearch && matchesType
  })

  const sortedDocuments = [...filteredDocuments].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name)
      case 'date':
        return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
      case 'size':
        return b.size - a.size
      default:
        return 0
    }
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="spinner w-8 h-8"></div>
      </div>
    )
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Documents</h1>
          <p className="text-gray-600">Manage and organize your files</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowUploadModal(true)}
            className="btn btn-primary flex items-center space-x-2"
          >
            <Upload className="w-4 h-4" />
            <span>Upload</span>
          </button>
          
          <button
            onClick={() => setShowCreateFolderModal(true)}
            className="btn btn-secondary flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>New Folder</span>
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="card p-4 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          {/* Search */}
          <div className="flex-1 min-w-64">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search documents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Filters */}
          <div className="flex items-center space-x-2">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
            >
              <option value="all">All Files</option>
              <option value="pdf">PDFs</option>
              <option value="doc">Documents</option>
              <option value="xls">Spreadsheets</option>
              <option value="ppt">Presentations</option>
              <option value="jpg">Images</option>
              <option value="mp4">Videos</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
            >
              <option value="date">Date Modified</option>
              <option value="name">Name</option>
              <option value="size">Size</option>
            </select>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors duration-200"
              >
                {viewMode === 'grid' ? <List className="w-4 h-4" /> : <Grid className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Folder Navigation */}
      <div className="flex space-x-6 mb-6">
        <div className="w-64">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Folders</h3>
          <div className="space-y-2">
            <button
              onClick={() => setCurrentFolder(null)}
              className={`w-full text-left px-3 py-2 rounded-lg flex items-center space-x-2 transition-colors duration-200 ${
                currentFolder === null
                  ? 'bg-brand-50 text-brand-700'
                  : 'hover:bg-gray-50 text-gray-700'
              }`}
            >
              <Folder className="w-4 h-4" />
              <span>All Documents</span>
            </button>
            
            {folders.map((folder) => (
              <button
                key={folder.id}
                onClick={() => setCurrentFolder(folder.id)}
                className={`w-full text-left px-3 py-2 rounded-lg flex items-center space-x-2 transition-colors duration-200 ${
                  currentFolder === folder.id
                    ? 'bg-brand-50 text-brand-700'
                    : 'hover:bg-gray-50 text-gray-700'
                }`}
              >
                <Folder className="w-4 h-4" />
                <span>{folder.name}</span>
                <span className="text-xs text-gray-500">({folder.document_count || 0})</span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1">
          <h3 className="text-sm font-medium text-gray-700 mb-3">
            {currentFolder ? folders.find(f => f.id === currentFolder)?.name : 'All Documents'}
          </h3>
        </div>
      </div>

      {/* Documents Grid/List */}
      <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4' : 'space-y-2'}>
        {sortedDocuments.map((document) => (
          <div key={document.id} className={viewMode === 'grid' ? 'card p-4 card-hover' : 'card p-4'}>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <input
                    type="checkbox"
                    checked={selectedDocuments.includes(document.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedDocuments(prev => [...prev, document.id])
                      } else {
                        setSelectedDocuments(prev => prev.filter(id => id !== document.id))
                      }
                    }}
                    className="rounded border-gray-200 text-brand-600 focus:ring-brand-500"
                  />
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl">{getFileIcon(document.format)}</span>
                    <div>
                      <h4 className="font-medium text-gray-900 truncate">{document.name}</h4>
                      <p className="text-sm text-gray-500">
                        {formatFileSize(document.size)} • {formatDate(document.updated_at)}
                      </p>
                    </div>
                  </div>
                </div>

                {document.metadata?.description && (
                  <p className="text-sm text-gray-600 mb-2">{document.metadata.description}</p>
                )}

                {document.metadata?.tags && (
                  <div className="flex flex-wrap gap-1 mb-2">
                    {document.metadata.tags.map((tag: string) => (
                      <span key={tag} className="px-2 py-1 bg-brand-50 text-brand-700 text-xs rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4" />
                  <span>{document.uploaded_by_user?.full_name}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4" />
                  <span>{formatDate(document.created_at)}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => window.open(document.url, '_blank')}
                className="p-2 text-worksphere-600 hover:text-worksphere-700 hover:bg-worksphere-50 rounded-lg"
              >
                <Eye className="w-4 h-4" />
              </button>
              
              <button
                onClick={() => window.open(document.url, '_blank')}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors duration-200"
              >
                <Download className="w-4 h-4" />
              </button>
              
              <button
                onClick={() => setShowVersionHistory(document)}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors duration-200"
              >
                <History className="w-4 h-4" />
              </button>
              
              <button
                onClick={() => deleteDocument(document.id)}
                className="p-2 text-red-600 hover:text-red-900 hover:bg-red-50 rounded-lg"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}

        {sortedDocuments.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <File className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No documents found</h3>
            <p className="text-gray-500">
              {searchQuery 
                ? 'No documents match your search'
                : currentFolder 
                  ? 'This folder is empty'
                  : 'No documents uploaded yet'
              }
            </p>
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Upload Documents</h2>
            
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
              <input
                type="file"
                multiple
                onChange={(e) => {
                  if (e.target.files) {
                    handleFileUpload(e.target.files)
                  }
                }}
                className="w-full"
              />
            </div>

            <div className="flex justify-end space-x-3 mt-4">
              <button
                onClick={() => setShowUploadModal(false)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Folder Modal */}
      {showCreateFolderModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Create New Folder</h2>
            
            <form onSubmit={(e) => {
              e.preventDefault()
              const formData = new FormData(e.currentTarget)
              createFolder(formData.get('name') as string)
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Folder Name</label>
                  <input
                    type="text"
                    name="name"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-worksphere-500"
                    placeholder="Enter folder name"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowCreateFolderModal(false)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-worksphere-600 text-white rounded-lg hover:bg-worksphere-700"
                >
                  Create Folder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Version History Modal */}
      {showVersionHistory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Version History</h2>
              <button
                onClick={() => setShowVersionHistory(null)}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors duration-200"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-medium text-gray-900 mb-3">{showVersionHistory.name}</h3>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <span className="text-sm text-gray-600">Current Version:</span>
                    <p className="font-medium">v{showVersionHistory.version}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Created:</span>
                    <p className="font-medium">{formatDate(showVersionHistory.created_at)}</p>
                  </div>
                </div>

                {showVersionHistory.metadata?.previous_version && (
                  <div className="text-sm text-gray-600">
                    Previous Version: v{showVersionHistory.metadata.previous_version}
                  </div>
                )}

                {showVersionHistory.metadata?.description && (
                  <div>
                    <span className="text-sm text-gray-600">Description:</span>
                    <p className="mt-1">{showVersionHistory.metadata.description}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Create New Version</h3>
              
              <input
                type="file"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    createNewVersion(showVersionHistory.id, e.target.files[0])
                  }
                }}
                className="w-full"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
