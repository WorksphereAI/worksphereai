import React, { useState, useEffect } from 'react'
import { 
  Building2, 
  MessageSquare, 
  CheckSquare, 
  FileText, 
  Users, 
  Bell,
  Search,
  Plus,
  Zap,
  TrendingUp,
  Clock,
  BarChart3
} from 'lucide-react'
import { supabase } from '../lib/supabase'
import { Messaging } from './Messaging'
import { Tasks } from './Tasks'
import { OrganizationStructure } from './OrganizationStructure'
import { Documents } from './Documents'
import { DocumentManager } from './documents/DocumentManager'
import { Approvals } from './Approvals'
import { ExecutiveDashboard } from './analytics/ExecutiveDashboard'

interface DashboardProps {
  user: any
}

export const Dashboard: React.FC<DashboardProps> = ({ user }) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [departments, setDepartments] = useState<any[]>([])
  const [recentMessages, setRecentMessages] = useState<any[]>([])
  const [pendingTasks, setPendingTasks] = useState<any[]>([])
  const [notifications, setNotifications] = useState(0)
  const [currentView, setCurrentView] = useState<'dashboard' | 'messages' | 'tasks' | 'organization' | 'approvals' | 'documents' | 'analytics'>('dashboard')
  const [selectedChannel, setSelectedChannel] = useState<any>(null)

  useEffect(() => {
    loadDashboardData()
  }, [user])

  const loadDashboardData = async () => {
    try {
      // Load departments
      const { data: depts } = await supabase
        .from('departments')
        .select('*')
        .eq('organization_id', user.organization_id)

      // Load recent messages
      const { data: messages } = await supabase
        .from('messages')
        .select(`
          *,
          sender:users(full_name, avatar_url)
        `)
        .or(`recipient_id.eq.${user.id},channel_id.in.(select id from channels where members.cs.{${user.id}})`)
        .order('created_at', { ascending: false })
        .limit(5)

      // Load pending tasks
      const { data: tasks } = await supabase
        .from('tasks')
        .select('*')
        .eq('assigned_to', user.id)
        .neq('status', 'completed')
        .order('due_date', { ascending: true })
        .limit(5)

      setDepartments(depts || [])
      setRecentMessages(messages || [])
      setPendingTasks(tasks || [])
    } catch (error) {
      console.error('Error loading dashboard data:', error)
    }
  }

  const renderRoleBasedView = () => {
    switch (user.role) {
      case 'ceo':
        return <CEOView departments={departments} />
      case 'manager':
        return <ManagerView departments={departments} user={user} />
      case 'employee':
        return <EmployeeView recentMessages={recentMessages} pendingTasks={pendingTasks} />
      default:
        return <EmployeeView recentMessages={recentMessages} pendingTasks={pendingTasks} />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Building2 className="w-8 h-8 text-worksphere-600" />
              <h1 className="text-2xl font-bold text-gray-900">WORKSPHERE</h1>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search everything..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 w-96 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              />
            </div>
            
            {/* Notifications */}
            <button className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors duration-200">
              <Bell className="w-6 h-6" />
              {notifications > 0 && (
                <span className="absolute -top-1 -right-1 bg-error-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {notifications}
                </span>
              )}
            </button>
            
            {/* AI Assistant */}
            <button className="btn btn-primary flex items-center space-x-2">
              <Zap className="w-5 h-5" />
              <span>AI Assistant</span>
            </button>
            
            {/* Profile */}
            <div className="flex items-center space-x-2">
              <img
                src={user.avatar_url || `https://ui-avatars.com/api/?name=${user.full_name}`}
                alt={user.full_name}
                className="w-10 h-10 rounded-full"
              />
              <span className="text-sm font-medium text-gray-900">{user.full_name}</span>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar Navigation */}
        <nav className="sidebar">
          <div className="p-4">
            <ul className="space-y-2">
              <li>
                <button 
                  onClick={() => setCurrentView('dashboard')}
                  className="sidebar-item sidebar-item-active"
                >
                  Dashboard
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setCurrentView('messages')}
                  className="sidebar-item sidebar-item-inactive"
                >
                  <MessageSquare className="w-5 h-5" />
                  <span>Messages</span>
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setCurrentView('tasks')}
                  className="sidebar-item sidebar-item-inactive"
                >
                  <CheckSquare className="w-5 h-5" />
                  <span>Tasks</span>
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setCurrentView('documents')}
                  className="sidebar-item sidebar-item-inactive"
                >
                  <FileText className="w-5 h-5" />
                  <span>Documents</span>
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setCurrentView('approvals')}
                  className="sidebar-item sidebar-item-inactive"
                >
                  <CheckSquare className="w-5 h-5" />
                  <span>Approvals</span>
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setCurrentView('analytics')}
                  className="sidebar-item sidebar-item-inactive"
                >
                  <BarChart3 className="w-5 h-5" />
                  <span>Analytics</span>
                </button>
              </li>
            </ul>
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1">
          {currentView === 'dashboard' && renderRoleBasedView()}
          {currentView === 'messages' && (
            <Messaging 
              user={user} 
              selectedChannel={selectedChannel}
              onChannelSelect={setSelectedChannel}
            />
          )}
          {currentView === 'tasks' && <Tasks user={user} />}
          {currentView === 'documents' && <DocumentManager />}
          {currentView === 'approvals' && <Approvals user={user} />}
          {currentView === 'analytics' && <ExecutiveDashboard />}
          {currentView === 'dashboard' && (
            <>
              {renderRoleBasedView()}
              
              {/* Quick Actions */}
              <div className="mt-8 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                <div className="grid grid-cols-3 gap-4">
                  <button className="bg-white p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                    <Plus className="w-6 h-6 text-worksphere-600 mb-2" />
                    <div className="font-medium">New Message</div>
                  </button>
                  <button className="bg-white p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                    <CheckSquare className="w-6 h-6 text-worksphere-600 mb-2" />
                    <div className="font-medium">Create Task</div>
                  </button>
                  <button className="bg-white p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                    <FileText className="w-6 h-6 text-worksphere-600 mb-2" />
                    <div className="font-medium">Request Approval</div>
                  </button>
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  )
}

// CEO View - Company Overview
const CEOView: React.FC<{ departments: any[] }> = ({ departments }) => (
  <div>
    <h2 className="text-2xl font-bold text-gray-900 mb-6">Company Overview</h2>
    
    <div className="grid grid-cols-3 gap-6 mb-8">
      <div className="bg-white p-6 rounded-lg worksphere-shadow">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Total Employees</p>
            <p className="text-2xl font-bold text-gray-900">47</p>
          </div>
          <Users className="w-8 h-8 text-worksphere-600" />
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-lg worksphere-shadow">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Pending Approvals</p>
            <p className="text-2xl font-bold text-gray-900">12</p>
          </div>
          <Clock className="w-8 h-8 text-orange-500" />
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-lg worksphere-shadow">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Active Projects</p>
            <p className="text-2xl font-bold text-gray-900">8</p>
          </div>
          <TrendingUp className="w-8 h-8 text-green-500" />
        </div>
      </div>
    </div>

    <div className="bg-white rounded-lg worksphere-shadow">
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Department Structure</h3>
      </div>
      <div className="p-6">
        {departments.map((dept) => (
          <div key={dept.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
            <div className="flex items-center space-x-3">
              <Building2 className="w-5 h-5 text-worksphere-600" />
              <span className="font-medium">{dept.name}</span>
            </div>
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <span>12 online</span>
              <span className="text-worksphere-600">3 pending</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
)

// Manager View - Team Focus
const ManagerView: React.FC<{ departments: any[], user: any }> = ({ departments }) => (
  <div>
    <h2 className="text-2xl font-bold text-gray-900 mb-6">Team Management</h2>
    
    <div className="grid grid-cols-2 gap-6 mb-8">
      <div className="bg-white p-6 rounded-lg worksphere-shadow">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Team Members</h3>
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-worksphere-100 rounded-full flex items-center justify-center">
                <span className="text-worksphere-600 font-medium">U{i}</span>
              </div>
              <div className="flex-1">
                <p className="font-medium">Team Member {i}</p>
                <p className="text-sm text-gray-600">Online now</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-lg worksphere-shadow">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Pending Tasks</h3>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center justify-between">
              <div>
                <p className="font-medium">Task {i}</p>
                <p className="text-sm text-gray-600">Due tomorrow</p>
              </div>
              <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">Pending</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
)

// Employee View - Personal Focus
const EmployeeView: React.FC<{ recentMessages: any[], pendingTasks: any[] }> = ({ recentMessages, pendingTasks }) => (
  <div>
    <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Workspace</h2>
    
    <div className="grid grid-cols-2 gap-6">
      <div className="bg-white rounded-lg worksphere-shadow">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Recent Messages</h3>
        </div>
        <div className="p-6">
          {recentMessages.map((message) => (
            <div key={message.id} className="mb-4 last:mb-0">
              <div className="flex items-start space-x-3">
                <img
                  src={message.sender?.avatar_url || `https://ui-avatars.com/api/?name=${message.sender?.full_name}`}
                  alt={message.sender?.full_name}
                  className="w-8 h-8 rounded-full"
                />
                <div className="flex-1">
                  <p className="font-medium text-sm">{message.sender?.full_name}</p>
                  <p className="text-gray-600 text-sm">{message.content}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="bg-white rounded-lg worksphere-shadow">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Your Tasks</h3>
        </div>
        <div className="p-6">
          {pendingTasks.map((task) => (
            <div key={task.id} className="mb-4 last:mb-0">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{task.title}</p>
                  <p className="text-sm text-gray-600">Due {task.due_date}</p>
                </div>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  task.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                  task.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                  'bg-blue-100 text-blue-800'
                }`}>
                  {task.priority}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
)
