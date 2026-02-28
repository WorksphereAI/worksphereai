import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl) {
  throw new Error('VITE_SUPABASE_URL is required. Please check your .env file.')
}

if (!supabaseAnonKey) {
  throw new Error('VITE_SUPABASE_ANON_KEY is required. Please check your .env file.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface User {
  id: string
  email: string
  full_name: string
  role: 'ceo' | 'manager' | 'employee' | 'customer'
  organization_id: string
  department_id?: string
  avatar_url?: string
  last_active?: string
  settings?: Record<string, any>
  created_at: string
}

export interface Organization {
  id: string
  name: string
  slug: string
  settings?: Record<string, any>
  created_at: string
}

export interface Department {
  id: string
  name: string
  organization_id: string
  parent_id?: string
  manager_id?: string
  settings?: Record<string, any>
  created_at: string
}

export interface Message {
  id: string
  content?: string
  sender_id: string
  channel_id?: string
  recipient_id?: string
  reply_to_id?: string
  file_urls?: string[]
  file_types?: string[]
  is_deleted?: boolean
  read_by?: string[]
  created_at: string
}

export interface Task {
  id: string
  title: string
  description?: string
  assigned_to: string
  assigned_by: string
  department_id?: string
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  due_date?: string
  completed_at?: string
  attachments?: string[]
  created_at: string
}

export interface Approval {
  id: string
  type: 'leave' | 'budget' | 'document' | 'expense'
  requester_id: string
  approver_id: string
  status: 'pending' | 'approved' | 'rejected'
  data?: Record<string, any>
  comments?: string
  approved_at?: string
  created_at: string
}

export interface Channel {
  id: string
  name: string
  type: 'department' | 'project' | 'direct' | 'announcement'
  organization_id: string
  department_id?: string
  members?: string[]
  settings?: Record<string, any>
  created_at: string
}
