import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

interface AIRequest {
  query: string
  userId: string
  organizationId: string
  context?: {
    departmentId?: string
    channelId?: string
    taskId?: string
  }
}

interface AIResponse {
  response: string
  actions?: Array<{
    type: 'create_task' | 'send_message' | 'schedule_meeting' | 'search_files'
    data: any
  }>
  suggestions?: string[]
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { query, userId, organizationId, context }: AIRequest = await req.json()

    if (!query || !userId || !organizationId) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Get user information and permissions
    const { data: user } = await supabase
      .from('users')
      .select(`
        *,
        organizations:organization_id (*),
        departments:department_id (*)
      `)
      .eq('id', userId)
      .single()

    if (!user) {
      return new Response(
        JSON.stringify({ error: 'User not found' }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Process the AI query
    const aiResponse = await processAIQuery(query, user, context, supabase)

    return new Response(
      JSON.stringify(aiResponse),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('AI Assistant error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})

async function processAIQuery(
  query: string, 
  user: any, 
  context: any,
  supabase: any
): Promise<AIResponse> {
  const lowerQuery = query.toLowerCase()
  
  // Task-related queries
  if (lowerQuery.includes('task') || lowerQuery.includes('todo') || lowerQuery.includes('pending')) {
    return await handleTaskQuery(lowerQuery, user, supabase)
  }
  
  // Message-related queries
  if (lowerQuery.includes('message') || lowerQuery.includes('chat') || lowerQuery.includes('unread')) {
    return await handleMessageQuery(lowerQuery, user, supabase)
  }
  
  // File-related queries
  if (lowerQuery.includes('file') || lowerQuery.includes('document') || lowerQuery.includes('find')) {
    return await handleFileQuery(lowerQuery, user, supabase)
  }
  
  // Approval-related queries
  if (lowerQuery.includes('approval') || lowerQuery.includes('approve') || lowerQuery.includes('pending')) {
    return await handleApprovalQuery(lowerQuery, user, supabase)
  }
  
  // Meeting/schedule queries
  if (lowerQuery.includes('meeting') || lowerQuery.includes('schedule') || lowerQuery.includes('calendar')) {
    return await handleMeetingQuery(lowerQuery, user, supabase)
  }
  
  // Summary/overview queries
  if (lowerQuery.includes('summary') || lowerQuery.includes('overview') || lowerQuery.includes('status')) {
    return await handleSummaryQuery(lowerQuery, user, supabase)
  }
  
  // Default response
  return {
    response: `I understand you're asking about "${query}". As WorkSphere AI, I can help you with tasks, messages, files, approvals, and meetings. Could you be more specific about what you need?`,
    suggestions: [
      'Show my pending tasks',
      'Summarize unread messages',
      'Find recent files',
      'Check pending approvals',
      'Schedule team meeting'
    ]
  }
}

async function handleTaskQuery(query: string, user: any, supabase: any): Promise<AIResponse> {
  const { data: tasks } = await supabase
    .from('tasks')
    .select(`
      *,
      assigned_by_user:assigned_by (full_name),
      department:department_id (name)
    `)
    .eq('assigned_to', user.id)
    .neq('status', 'completed')
    .order('due_date', { ascending: true })
    .limit(10)

  if (!tasks || tasks.length === 0) {
    return {
      response: "You don't have any pending tasks. Great job staying on top of your work!",
      suggestions: ['Create a new task', 'View completed tasks', 'Check team tasks']
    }
  }

  const taskList = tasks.map(task => 
    `• ${task.title} (${task.priority} priority${task.due_date ? `, due ${new Date(task.due_date).toLocaleDateString()}` : ''})`
  ).join('\n')

  return {
    response: `You have ${tasks.length} pending tasks:\n\n${taskList}`,
    actions: tasks.map(task => ({
      type: 'create_task' as const,
      data: { taskId: task.id, action: 'complete' }
    }))
  }
}

async function handleMessageQuery(query: string, user: any, supabase: any): Promise<AIResponse> {
  const { data: messages } = await supabase
    .from('messages')
    .select(`
      *,
      sender:sender_id (full_name, avatar_url),
      channel:channel_id (name, type)
    `)
    .or(`recipient_id.eq.${user.id},channel_id.in.(select id from channels where members.cs.{${user.id}})`)
    .is('read_by', 'null')
    .order('created_at', { ascending: false })
    .limit(10)

  if (!messages || messages.length === 0) {
    return {
      response: "You don't have any unread messages. Your inbox is clean!",
      suggestions: ['View recent messages', 'Start new conversation', 'Check team channels']
    }
  }

  const messageSummary = messages.slice(0, 5).map(msg => 
    `• ${msg.sender?.full_name}: ${msg.content?.substring(0, 50)}${msg.content && msg.content.length > 50 ? '...' : ''}`
  ).join('\n')

  return {
    response: `You have ${messages.length} unread messages:\n\n${messageSummary}`,
    actions: [{
      type: 'send_message' as const,
      data: { action: 'mark_all_read' }
    }]
  }
}

async function handleFileQuery(query: string, user: any, supabase: any): Promise<AIResponse> {
  const { data: files } = await supabase
    .from('files')
    .select(`
      *,
      uploaded_by_user:uploaded_by (full_name)
    `)
    .eq('organization_id', user.organization_id)
    .order('created_at', { ascending: false })
    .limit(10)

  if (!files || files.length === 0) {
    return {
      response: "No files found in your organization.",
      suggestions: ['Upload a file', 'Check shared documents', 'Search by filename']
    }
  }

  const fileList = files.slice(0, 5).map(file => 
    `• ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB, uploaded by ${file.uploaded_by_user?.full_name})`
  ).join('\n')

  return {
    response: `Recent files in your organization:\n\n${fileList}`,
    actions: files.map(file => ({
      type: 'search_files' as const,
      data: { fileId: file.id, action: 'preview' }
    }))
  }
}

async function handleApprovalQuery(query: string, user: any, supabase: any): Promise<AIResponse> {
  const { data: approvals } = await supabase
    .from('approvals')
    .select(`
      *,
      requester:requester_id (full_name),
      approver:approver_id (full_name)
    `)
    .or(`requester_id.eq.${user.id},approver_id.eq.${user.id}`)
    .eq('status', 'pending')
    .order('created_at', { ascending: false })

  if (!approvals || approvals.length === 0) {
    return {
      response: "You don't have any pending approvals.",
      suggestions: ['View approval history', 'Create approval request', 'Check team approvals']
    }
  }

  const approvalList = approvals.map(approval => 
    `• ${approval.type} request from ${approval.requester?.full_name} (${new Date(approval.created_at).toLocaleDateString()})`
  ).join('\n')

  const myApprovals = approvals.filter(a => a.approver_id === user.id)
  const myRequests = approvals.filter(a => a.requester_id === user.id)

  let response = `Found ${approvals.length} pending approvals:\n\n${approvalList}`
  
  if (myApprovals.length > 0) {
    response += `\n\n${myApprovals.length} require your action.`
  }

  return {
    response,
    actions: myApprovals.map(approval => ({
      type: 'create_task' as const,
      data: { approvalId: approval.id, action: 'review' }
    }))
  }
}

async function handleMeetingQuery(query: string, user: any, supabase: any): Promise<AIResponse> {
  // This would integrate with a calendar system
  // For now, provide a helpful response
  return {
    response: "I can help you schedule meetings. Would you like me to:\n\n• Schedule a team meeting\n• Set up a 1-on-1\n• Book a client call\n• Check your calendar",
    actions: [
      {
        type: 'schedule_meeting' as const,
        data: { type: 'team', duration: 60 }
      },
      {
        type: 'schedule_meeting' as const,
        data: { type: 'one-on-one', duration: 30 }
      }
    ],
    suggestions: [
      'Schedule team standup',
      'Book meeting room',
      'Send calendar invite',
      'Check availability'
    ]
  }
}

async function handleSummaryQuery(query: string, user: any, supabase: any): Promise<AIResponse> {
  // Get comprehensive summary
  const [tasksResult, messagesResult, approvalsResult] = await Promise.all([
    supabase.from('tasks').select('count').eq('assigned_to', user.id).neq('status', 'completed'),
    supabase.from('messages').select('count').or(`recipient_id.eq.${user.id},channel_id.in.(select id from channels where members.cs.{${user.id}})`).is('read_by', 'null'),
    supabase.from('approvals').select('count').or(`requester_id.eq.${user.id},approver_id.eq.${user.id}`).eq('status', 'pending')
  ])

  const pendingTasks = tasksResult.data?.[0]?.count || 0
  const unreadMessages = messagesResult.data?.[0]?.count || 0
  const pendingApprovals = approvalsResult.data?.[0]?.count || 0

  let summary = `📊 **Your WorkSphere Summary**\n\n`
  summary += `🎯 **Tasks**: ${pendingTasks} pending\n`
  summary += `💬 **Messages**: ${unreadMessages} unread\n`
  summary += `✅ **Approvals**: ${pendingApprovals} pending\n`

  if (user.role === 'ceo' || user.role === 'manager') {
    const { data: teamMembers } = await supabase
      .from('users')
      .select('count')
      .eq('organization_id', user.organization_id)
      .eq('department_id', user.department_id)

    summary += `👥 **Team Members**: ${teamMembers?.[0]?.count || 0}\n`
  }

  summary += `\n📈 **Productivity**: ${pendingTasks === 0 ? 'Excellent' : pendingTasks < 3 ? 'Good' : 'Needs attention'}`

  return {
    response: summary,
    suggestions: [
      'Focus on high-priority tasks',
      'Clear unread messages',
      'Review pending approvals',
      'Check team status'
    ]
  }
}
