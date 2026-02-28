import React, { useState, useEffect } from 'react'
import {
  CheckCircle,
  Clock,
  Calendar,
  FileText,
  Filter,
  User,
  Building2,
  Eye,
  XCircle
} from 'lucide-react'
import { supabase } from '../lib/supabase'

interface ApprovalRequest {
  id: string
  type: 'leave' | 'budget' | 'document' | 'expense' | 'procurement'
  title: string
  description?: string
  requester_id: string
  organization_id: string
  status: 'pending' | 'approved' | 'rejected'
  priority: 'low' | 'medium' | 'high'
  amount?: number
  created_at: string
  updated_at: string
  data?: any
  requester?: {
    full_name: string
    avatar_url?: string
  }
  department?: {
    name: string
  }
}

interface ApprovalsProps {
  user: any
}

export const Approvals: React.FC<ApprovalsProps> = ({ user }) => {
  const [requests, setRequests] = useState<ApprovalRequest[]>([])
  const [myApprovals, setMyApprovals] = useState<ApprovalRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState<ApprovalRequest | null>(null)

  useEffect(() => {
    loadApprovalRequests()
    subscribeToApprovalUpdates()
  }, [user])

  const loadApprovalRequests = async () => {
    try {
      // Load requests I've made
      const { data: myRequests } = await supabase
        .from('approval_requests')
        .select(`
          *,
          requester:requester_id (full_name, avatar_url),
          department:department_id (name)
        `)
        .eq('requester_id', user.id)
        .order('created_at', { ascending: false })

      // Load requests assigned to me for approval
      const { data: assignedRequests } = await supabase
        .from('approval_requests')
        .select(`
          *,
          requester:requester_id (full_name, avatar_url),
          department:department_id (name)
        `)
        .in('id', 
          (await supabase
            .from('approval_steps')
            .select('request_id')
            .eq('approver_id', user.id)
          ).data?.map(step => step.request_id) || []
        )
        .order('created_at', { ascending: false })

      setMyApprovals(assignedRequests || [])
      setRequests(myRequests || [])
    } catch (error) {
      console.error('Error loading approval requests:', error)
    } finally {
      setLoading(false)
    }
  }

  const subscribeToApprovalUpdates = () => {
    // Subscribe to approval requests I've made
    const subscription1 = supabase
      .channel(`my-approvals:${user.id}`)
      .on('postgres_changes',
        { 
          event: '*',
          schema: 'public',
          table: 'approval_requests',
          filter: `requester_id=eq.${user.id}`
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setRequests(prev => [payload.new as any, ...prev])
          } else if (payload.eventType === 'UPDATE') {
            setRequests(prev => prev.map(req => 
              req.id === payload.new.id ? payload.new as any : req
            ))
          } else if (payload.eventType === 'DELETE') {
            setRequests(prev => prev.filter(req => req.id !== payload.old.id))
          }
        }
      )
      .subscribe()

    // Subscribe to approvals assigned to me
    const subscription2 = supabase
      .channel(`assigned-approvals:${user.id}`)
      .on('postgres_changes',
        { 
          event: '*',
          schema: 'public',
          table: 'approval_requests',
          filter: `id=in.(${supabase
            .from('approval_steps')
            .select('request_id')
            .eq('approver_id', user.id)
          })`
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setMyApprovals(prev => [payload.new as any, ...prev])
          } else if (payload.eventType === 'UPDATE') {
            setMyApprovals(prev => prev.map(req => 
              req.id === payload.new.id ? payload.new as any : req
            ))
          } else if (payload.eventType === 'DELETE') {
            setMyApprovals(prev => prev.filter(req => req.id !== payload.old.id))
          }
        }
      )
      .subscribe()

    return () => {
      subscription1.unsubscribe()
      subscription2.unsubscribe()
    }
  }

  const createApprovalRequest = async (formData: any) => {
    try {
      const { error } = await supabase
        .from('approval_requests')
        .insert({
          ...formData,
          requester_id: user.id,
          organization_id: user.organization_id,
          department_id: user.department_id
        })

      if (error) throw error

      setShowCreateModal(false)
    } catch (error) {
      console.error('Error creating approval request:', error)
    }
  }

  const updateApprovalStatus = async (requestId: string, status: string, comments?: string) => {
    try {
      // Update the approval step
      const { error: stepError } = await supabase
        .from('approval_steps')
        .update({
          status,
          comments,
          action_date: status === 'approved' ? new Date().toISOString() : null
        })
        .eq('request_id', requestId)
        .eq('approver_id', user.id)

      if (stepError) throw stepError

      // Check if all steps are complete
      const { data: steps } = await supabase
        .from('approval_steps')
        .select('status')
        .eq('request_id', requestId)

      const allCompleted = steps?.every(step => 
        step.status === 'approved' || step.status === 'skipped'
      )

      if (allCompleted) {
        // Update the main request status
        const finalStatus = steps?.some(step => step.status === 'rejected') ? 'rejected' : 'approved'
        
        await supabase
          .from('approval_requests')
          .update({ status: finalStatus })
          .eq('id', requestId)
      }
    } catch (error) {
      console.error('Error updating approval:', error)
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'leave': return <Calendar className="w-4 h-4" />
      case 'budget': return <FileText className="w-4 h-4" />
      case 'document': return <FileText className="w-4 h-4" />
      case 'expense': return <FileText className="w-4 h-4" />
      case 'procurement': return <FileText className="w-4 h-4" />
      default: return <FileText className="w-4 h-4" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'in_review': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'approved': return 'bg-green-100 text-green-800 border-green-200'
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200'
      case 'cancelled': return 'bg-gray-100 text-gray-800 border-gray-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200'
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'medium': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'low': return 'bg-gray-100 text-gray-800 border-gray-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const filteredRequests = requests.filter(req => {
    const matchesFilter = filter === 'all' || req.status === filter
    const matchesType = typeFilter === 'all' || req.type === typeFilter
    return matchesFilter && matchesType
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
          <h1 className="text-2xl font-bold text-gray-900">Approvals</h1>
          <p className="text-gray-600">Manage and track approval workflows</p>
        </div>
        
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn btn-primary flex items-center space-x-2"
        >
          <FileText className="w-4 h-4" />
          <span>New Request</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
            >
              <option value="all">All Types</option>
              <option value="leave">Leave</option>
              <option value="budget">Budget</option>
              <option value="document">Document</option>
              <option value="expense">Expense</option>
              <option value="procurement">Procurement</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setFilter('all')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              filter === 'all'
                ? 'border-brand-600 text-brand-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            My Requests ({requests.length})
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              filter === 'pending'
                ? 'border-brand-600 text-brand-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Pending My Approval ({myApprovals.filter(req => req.status === 'pending').length})
          </button>
        </nav>
      </div>

      {/* Content */}
      <div className="space-y-4">
        {filteredRequests.map((request) => (
          <div key={request.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-3">
                  {getTypeIcon(request.type)}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">{request.title}</h3>
                    <p className="text-sm text-gray-500">
                      {request.type.charAt(0).toUpperCase() + request.type.slice(1)} • {formatDate(request.created_at)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2 mb-3">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(request.status)}`}>
                    {request.status.replace('_', ' ')}
                  </span>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getPriorityColor(request.priority)}`}>
                    {request.priority}
                  </span>
                </div>

                {request.description && (
                  <p className="text-gray-600 mb-3">{request.description}</p>
                )}

                {request.data && Object.keys(request.data).length > 0 && (
                  <div className="bg-gray-50 rounded-lg p-3 mb-3">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Request Details:</h4>
                    {Object.entries(request.data).map(([key, value]) => (
                      <div key={key} className="flex justify-between py-1">
                        <span className="text-sm text-gray-600 capitalize">{key.replace('_', ' ')}:</span>
                        <span className="text-sm font-medium">
                          {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <div className="flex items-center space-x-2">
                    <User className="w-4 h-4" />
                    <span>{request.requester?.full_name}</span>
                  </div>
                  {request.department && (
                    <div className="flex items-center space-x-2">
                      <Building2 className="w-4 h-4" />
                      <span>{request.department.name}</span>
                    </div>
                  )}
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4" />
                    <span>{formatDate(request.created_at)}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setSelectedRequest(request)}
                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
                >
                  <Eye className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {filteredRequests.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No approval requests found</h3>
            <p className="text-gray-500">
              {filter === 'all' 
                ? 'You haven\'t created any approval requests yet'
                : `No ${filter} approval requests found`
              }
            </p>
          </div>
        )}
      </div>

      {/* Create Request Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Create Approval Request</h2>
            
            <form onSubmit={(e) => {
              e.preventDefault()
              const formData = new FormData(e.currentTarget)
              createApprovalRequest(Object.fromEntries(formData))
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Request Type</label>
                  <select
                    name="type"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-worksphere-500"
                  >
                    <option value="">Select type</option>
                    <option value="leave">Leave Request</option>
                    <option value="budget">Budget Approval</option>
                    <option value="document">Document Approval</option>
                    <option value="expense">Expense Reimbursement</option>
                    <option value="procurement">Procurement Request</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <input
                    type="text"
                    name="title"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-worksphere-500"
                    placeholder="Enter request title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    name="description"
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-worksphere-500"
                    placeholder="Describe your request..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                  <select
                    name="priority"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-worksphere-500"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                >
                  Create Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Request Detail Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Approval Request Details</h2>
              <button
                onClick={() => setSelectedRequest(null)}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-medium text-gray-900 mb-3">{selectedRequest.title}</h3>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <span className="text-sm text-gray-600">Type:</span>
                    <p className="font-medium capitalize">{selectedRequest.type}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Priority:</span>
                    <p className="font-medium capitalize">{selectedRequest.priority}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Status:</span>
                    <p className="font-medium capitalize">{selectedRequest.status.replace('_', ' ')}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Created:</span>
                    <p className="font-medium">{formatDate(selectedRequest.created_at)}</p>
                  </div>
                </div>

                {selectedRequest.description && (
                  <div>
                    <span className="text-sm text-gray-600">Description:</span>
                    <p className="mt-1">{selectedRequest.description}</p>
                  </div>
                )}

                {selectedRequest.data && Object.keys(selectedRequest.data).length > 0 && (
                  <div>
                    <span className="text-sm text-gray-600">Request Details:</span>
                    <div className="mt-2 space-y-2">
                      {Object.entries(selectedRequest.data).map(([key, value]) => (
                        <div key={key} className="flex justify-between py-2 border-b border-gray-200">
                          <span className="text-sm font-medium capitalize">{key.replace('_', ' ')}:</span>
                          <span className="text-sm">
                            {typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Approval Actions */}
              {filter === 'pending' && myApprovals.some(req => req.id === selectedRequest.id) && (
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Approval Actions</h3>
                  <div className="flex space-x-3">
                    <button
                      onClick={() => updateApprovalStatus(selectedRequest.id, 'approved')}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center space-x-2"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>Approve</span>
                    </button>
                    <button
                      onClick={() => updateApprovalStatus(selectedRequest.id, 'rejected')}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center space-x-2"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>Reject</span>
                    </button>
                  </div>
                  
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Comments</label>
                    <textarea
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-worksphere-500"
                      placeholder="Add comments for your decision..."
                      onChange={(_e) => {
                        // Store comments for approval
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
