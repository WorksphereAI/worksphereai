import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Users, 
  ChevronRight, 
  ChevronDown, 
  Plus,
  Settings
} from 'lucide-react';
import { supabase } from '../lib/supabase'

interface Department {
  id: string
  name: string
  organization_id: string
  parent_id?: string
  manager_id?: string
  manager?: {
    full_name: string
    avatar_url?: string
  }
  members?: User[]
  sub_departments?: Department[]
  created_at: string
}

interface User {
  id: string
  full_name: string
  email: string
  role: string
  department_id?: string
  avatar_url?: string
  last_active?: string
}

interface OrganizationStructureProps {
  user: any
}

export const OrganizationStructure: React.FC<OrganizationStructureProps> = ({ user }) => {
  const [departments, setDepartments] = useState<Department[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [expandedDepartments, setExpandedDepartments] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newDepartment, setNewDepartment] = useState({
    name: '',
    parent_id: '',
    manager_id: ''
  })

  useEffect(() => {
    loadOrganizationData()
  }, [user])

  const loadOrganizationData = async () => {
    try {
      // Load departments with managers
      const { data: depts } = await supabase
        .from('departments')
        .select(`
          *,
          manager:manager_id (full_name, avatar_url)
        `)
        .eq('organization_id', user.organization_id)
        .is('parent_id', null)
        .order('name')

      // Load all users
      const { data: allUsers } = await supabase
        .from('users')
        .select('*')
        .eq('organization_id', user.organization_id)
        .order('full_name')

      if (depts) {
        // Load sub-departments and members for each department
        const departmentsWithDetails = await Promise.all(
          depts.map(async (dept) => {
            const subDepartments = await loadSubDepartments(dept.id)
            const members = await loadDepartmentMembers(dept.id)
            return { ...dept, sub_departments: subDepartments, members }
          })
        )
        setDepartments(departmentsWithDetails)
      }

      setUsers(allUsers || [])
    } catch (error) {
      console.error('Error loading organization data:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadSubDepartments = async (parentId: string): Promise<Department[]> => {
    try {
      const { data } = await supabase
        .from('departments')
        .select(`
          *,
          manager:manager_id (full_name, avatar_url)
        `)
        .eq('parent_id', parentId)
        .order('name')

      return data || []
    } catch (error) {
      console.error('Error loading sub-departments:', error)
      return []
    }
  }

  const loadDepartmentMembers = async (departmentId: string): Promise<User[]> => {
    try {
      const { data } = await supabase
        .from('users')
        .select('*')
        .eq('department_id', departmentId)
        .order('full_name')

      return data || []
    } catch (error) {
      console.error('Error loading department members:', error)
      return []
    }
  }

  const toggleDepartmentExpansion = (departmentId: string) => {
    const newExpanded = new Set(expandedDepartments)
    if (newExpanded.has(departmentId)) {
      newExpanded.delete(departmentId)
    } else {
      newExpanded.add(departmentId)
    }
    setExpandedDepartments(newExpanded)
  }

  const createDepartment = async () => {
    if (!newDepartment.name.trim()) return

    try {
      const { error } = await supabase
        .from('departments')
        .insert({
          name: newDepartment.name.trim(),
          organization_id: user.organization_id,
          parent_id: newDepartment.parent_id || null,
          manager_id: newDepartment.manager_id || null
        })

      if (error) throw error

      // Reset form and reload data
      setNewDepartment({ name: '', parent_id: '', manager_id: '' })
      setShowCreateModal(false)
      loadOrganizationData()
    } catch (error) {
      console.error('Error creating department:', error)
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'ceo': return 'bg-purple-100 text-purple-800'
      case 'manager': return 'bg-blue-100 text-blue-800'
      case 'employee': return 'bg-green-100 text-green-800'
      case 'customer': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const isUserOnline = (lastActive?: string) => {
    if (!lastActive) return false
    const lastActiveTime = new Date(lastActive)
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000)
    return lastActiveTime > fiveMinutesAgo
  }

  const renderDepartment = (department: Department, level: number = 0) => {
    const isExpanded = expandedDepartments.has(department.id)
    const hasSubDepartments = department.sub_departments && department.sub_departments.length > 0
    const hasMembers = department.members && department.members.length > 0

    return (
      <div key={department.id} className={`${level > 0 ? 'ml-8' : ''}`}>
        <div className="bg-white rounded-lg border border-gray-200 mb-2">
          <div 
            className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50"
            onClick={() => toggleDepartmentExpansion(department.id)}
          >
            <div className="flex items-center space-x-3">
              {(hasSubDepartments || hasMembers) && (
                <button className="p-1">
                  {isExpanded ? (
                    <ChevronDown className="w-4 h-4 text-gray-500" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-gray-500" />
                  )}
                </button>
              )}
              
              <Building2 className="w-5 h-5 text-worksphere-600" />
              
              <div>
                <h3 className="font-medium text-gray-900">{department.name}</h3>
                {department.manager && (
                  <p className="text-sm text-gray-500">
                    Manager: {department.manager.full_name}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {department.members && (
                <span className="text-sm text-gray-500">
                  {department.members.length} members
                </span>
              )}
              
              {user.role === 'ceo' && (
                <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg">
                  <Settings className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {isExpanded && (
            <div className="border-t border-gray-200">
              {/* Department Members */}
              {department.members && department.members.length > 0 && (
                <div className="p-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Team Members</h4>
                  <div className="grid grid-cols-2 gap-3">
                    {department.members.map((member) => (
                      <div key={member.id} className="flex items-center space-x-3 p-2 bg-gray-50 rounded-lg">
                        <div className="relative">
                          <img
                            src={member.avatar_url || `https://ui-avatars.com/api/?name=${member.full_name}`}
                            alt={member.full_name}
                            className="w-8 h-8 rounded-full"
                          />
                          <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${
                            isUserOnline(member.last_active) ? 'bg-green-500' : 'bg-gray-400'
                          }`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {member.full_name}
                          </p>
                          <p className="text-xs text-gray-500">{member.email}</p>
                        </div>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getRoleColor(member.role)}`}>
                          {member.role}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Sub-departments */}
              {department.sub_departments && department.sub_departments.length > 0 && (
                <div className="p-4 pt-0">
                  {department.sub_departments.map((subDept) => 
                    renderDepartment(subDept, level + 1)
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-worksphere-600"></div>
      </div>
    )
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Organization Structure</h1>
          <p className="text-gray-600">View and manage your company's organizational hierarchy</p>
        </div>
        
        {(user.role === 'ceo' || user.role === 'manager') && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-worksphere-600 text-white rounded-lg hover:bg-worksphere-700 flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>Add Department</span>
          </button>
        )}
      </div>

      {/* Organization Overview */}
      <div className="grid grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Departments</p>
              <p className="text-2xl font-bold text-gray-900">{departments.length}</p>
            </div>
            <Building2 className="w-8 h-8 text-worksphere-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Employees</p>
              <p className="text-2xl font-bold text-gray-900">{users.length}</p>
            </div>
            <Users className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Online Now</p>
              <p className="text-2xl font-bold text-gray-900">
                {users.filter(u => isUserOnline(u.last_active)).length}
              </p>
            </div>
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Department Tree */}
      <div className="space-y-2">
        {departments.map((department) => renderDepartment(department))}
      </div>

      {departments.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Building2 className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No departments yet</h3>
          <p className="text-gray-500">
            Create your first department to start building your organization structure
          </p>
        </div>
      )}

      {/* Create Department Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Create New Department</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Department Name *
                </label>
                <input
                  type="text"
                  value={newDepartment.name}
                  onChange={(e) => setNewDepartment({ ...newDepartment, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-worksphere-500"
                  placeholder="Enter department name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Parent Department
                </label>
                <select
                  value={newDepartment.parent_id}
                  onChange={(e) => setNewDepartment({ ...newDepartment, parent_id: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-worksphere-500"
                >
                  <option value="">None (Top Level)</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Department Manager
                </label>
                <select
                  value={newDepartment.manager_id}
                  onChange={(e) => setNewDepartment({ ...newDepartment, manager_id: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-worksphere-500"
                >
                  <option value="">Select manager</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.full_name} ({user.role})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={createDepartment}
                disabled={!newDepartment.name.trim()}
                className="px-4 py-2 bg-worksphere-600 text-white rounded-lg hover:bg-worksphere-700 disabled:opacity-50"
              >
                Create Department
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
