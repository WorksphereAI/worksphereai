import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE',
}

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
  sql_query?: string
  actions?: Array<{
    type: 'create_task' | 'send_message' | 'schedule_meeting' | 'search_files' | 'execute_sql'
    data: any
  }>
  suggestions?: string[]
  confidence?: number
  metadata?: Record<string, any>
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

    // Process the AI query with enhanced capabilities
    const aiResponse = await processEnhancedAIQuery(query, user, context, supabase)

    return new Response(
      JSON.stringify(aiResponse),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Enhanced AI Assistant error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})

async function processEnhancedAIQuery(
  query: string, 
  user: any, 
  context: any,
  supabase: any
): Promise<AIResponse> {
  const lowerQuery = query.toLowerCase()
  
  // Natural Language to SQL Queries
  if (isSQLQuery(lowerQuery)) {
    return await handleNaturalLanguageToSQL(query, user, supabase)
  }
  
  // Document Summarization
  if (lowerQuery.includes('summarize') && lowerQuery.includes('document')) {
    return await handleDocumentSummarization(query, user, supabase)
  }
  
  // Report Generation
  if (lowerQuery.includes('generate') && (lowerQuery.includes('report') || lowerQuery.includes('analytics'))) {
    return await handleReportGeneration(query, user, supabase)
  }
  
  // Meeting Scheduling
  if (lowerQuery.includes('schedule') && lowerQuery.includes('meeting')) {
    return await handleMeetingScheduling(query, user, supabase)
  }
  
  // Advanced Task Management
  if (lowerQuery.includes('task') && (lowerQuery.includes('overdue') || lowerQuery.includes('priority') || lowerQuery.includes('assign'))) {
    return await handleAdvancedTaskManagement(query, user, supabase)
  }
  
  // Document Search with Natural Language
  if (lowerQuery.includes('find') || lowerQuery.includes('search') || lowerQuery.includes('document')) {
    return await handleAdvancedDocumentSearch(query, user, supabase)
  }
  
  // Approval Workflow Analysis
  if (lowerQuery.includes('approval') && (lowerQuery.includes('pending') || lowerQuery.includes('bottleneck') || lowerQuery.includes('status'))) {
    return await handleApprovalAnalysis(query, user, supabase)
  }
  
  // Productivity Insights
  if (lowerQuery.includes('productivity') || lowerQuery.includes('performance') || lowerQuery.includes('metrics')) {
    return await handleProductivityInsights(query, user, supabase)
  }
  
  // Multi-language Support
  if (containsNonEnglish(query)) {
    return await handleMultiLanguageQuery(query, user, supabase)
  }
  
  // Fallback to original AI assistant
  return await handleBasicAIQuery(query, user, context, supababase)
}

function isSQLQuery(query: string): boolean {
  const sqlKeywords = [
    'select', 'from', 'where', 'join', 'group by', 'order by', 'having',
    'count', 'sum', 'avg', 'min', 'max', 'show me', 'list all', 'how many',
    'total', 'average', 'highest', 'lowest', 'most', 'least'
  ]
  
  return sqlKeywords.some(keyword => query.includes(keyword))
}

async function handleNaturalLanguageToSQL(query: string, user: any, supabase: any): Promise<AIResponse> {
  try {
    // Parse natural language query
    const sqlQuery = parseNaturalLanguageToSQL(query, user)
    
    if (!sqlQuery) {
      return {
        response: "I couldn't understand that query. Please try rephrasing your request.",
        suggestions: [
          'Show me all pending tasks',
          'How many documents were uploaded this week?',
          'List all users in my department',
          'What is the total budget for approved requests?'
        ]
      }
    }
    
    // Execute the SQL query
    const { data, error } = await supabase.rpc('execute_sql', { sql_query: sqlQuery })
    
    if (error) {
      return {
        response: `Error executing query: ${error.message}`,
        sql_query: sqlQuery,
        confidence: 0.3
      }
    }
    
    // Format the response
    const formattedResponse = formatSQLResults(data, query)
    
    return {
      response: formattedResponse,
      sql_query: sqlQuery,
      confidence: 0.9,
      metadata: {
        query_type: 'natural_language_sql',
        result_count: Array.isArray(data) ? data.length : 1
      }
    }
  } catch (error) {
    console.error('Error in natural language to SQL:', error)
    return {
      response: "I had trouble processing that query. Please try again.",
      confidence: 0.2
    }
  }
}

function parseNaturalLanguageToSQL(query: string, user: any): string {
  const lowerQuery = query.toLowerCase()
  
  // Handle count queries
  if (lowerQuery.includes('how many') || lowerQuery.includes('count') || lowerQuery.includes('total')) {
    if (lowerQuery.includes('task')) {
      return `
        SELECT COUNT(*) as total_tasks, 
               COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_tasks,
               COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_tasks
        FROM tasks 
        WHERE assigned_to = '${user.id}'
      `
    }
    
    if (lowerQuery.includes('document')) {
      return `
        SELECT COUNT(*) as total_documents,
               COUNT(CASE WHEN created_at >= NOW() - INTERVAL '7 days' THEN 1 END) as this_week
        FROM files 
        WHERE organization_id = '${user.organization_id}'
      `
    }
    
    if (lowerQuery.includes('user') || lowerQuery.includes('employee')) {
      return `
        SELECT COUNT(*) as total_users,
               COUNT(CASE WHEN last_active >= NOW() - INTERVAL '5 minutes' THEN 1 END) as online_users
        FROM users 
        WHERE organization_id = '${user.organization_id}'
      `
    }
  }
  
  // Handle "show me" or "list all" queries
  if (lowerQuery.includes('show me') || lowerQuery.includes('list all')) {
    if (lowerQuery.includes('pending task')) {
      return `
        SELECT title, priority, due_date, created_at
        FROM tasks 
        WHERE assigned_to = '${user.id}' 
        AND status = 'pending'
        ORDER BY due_date ASC
      `
    }
    
    if (lowerQuery.includes('recent document')) {
      return `
        SELECT name, format, size, created_at, uploaded_by_user.full_name
        FROM files 
        JOIN users uploaded_by_user ON files.uploaded_by = uploaded_by_user.id
        WHERE files.organization_id = '${user.organization_id}'
        ORDER BY files.created_at DESC
        LIMIT 10
      `
    }
    
    if (lowerQuery.includes('approval')) {
      return `
        SELECT title, type, status, priority, created_at, requester.full_name
        FROM approval_requests
        JOIN users requester ON approval_requests.requester_id = requester.id
        WHERE approval_requests.organization_id = '${user.organization_id}'
        ORDER BY approval_requests.created_at DESC
        LIMIT 10
      `
    }
  }
  
  // Handle aggregation queries
  if (lowerQuery.includes('average') || lowerQuery.includes('avg')) {
    if (lowerQuery.includes('task completion')) {
      return `
        SELECT AVG(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) * 100 as completion_rate,
               COUNT(*) as total_tasks
        FROM tasks 
        WHERE organization_id = '${user.organization_id}'
      `
    }
  }
  
  return ''
}

function formatSQLResults(data: any, originalQuery: string): string {
  if (!data) return "No results found."
  
  if (Array.isArray(data)) {
    if (data.length === 0) return "No results found."
    
    const firstResult = data[0]
    const keys = Object.keys(firstResult)
    
    if (keys.length === 1) {
      const value = firstResult[keys[0]]
      return `${keys[0]}: ${typeof value === 'number' ? value.toLocaleString() : value}`
    }
    
    // Format array results
    if (originalQuery.includes('count') || originalQuery.includes('total')) {
      return `Found ${data.length} results matching your query.`
    }
    
    return `Found ${data.length} results. Here's the first result: ${JSON.stringify(firstResult, null, 2)}`
  }
  
  // Single result
  return `Result: ${JSON.stringify(data, null, 2)}`
}

async function handleDocumentSummarization(query: string, user: any, supabase: any): Promise<AIResponse> {
  try {
    // Extract document ID or name from query
    const documentId = extractDocumentId(query)
    
    if (!documentId) {
      return {
        response: "Please specify which document you'd like me to summarize.",
        suggestions: [
          'Summarize the latest budget document',
          'Summarize the Q4 report',
          'Summarize the contract document from last week'
        ]
      }
    }
    
    // Get document details
    const { data: document } = await supabase
      .from('files')
      .select('*')
      .eq('id', documentId)
      .single()
    
    if (!document) {
      return {
        response: "I couldn't find that document.",
        confidence: 0.3
      }
    }
    
    // Generate summary (in a real implementation, this would use an AI service)
    const summary = generateDocumentSummary(document)
    
    return {
      response: summary,
      metadata: {
        document_id: documentId,
        document_name: document.name,
        summary_type: 'auto-generated'
      }
    }
  } catch (error) {
    console.error('Error in document summarization:', error)
    return {
      response: "I had trouble summarizing that document.",
      confidence: 0.2
    }
  }
}

function generateDocumentSummary(document: any): string {
  const fileName = document.name
  const fileSize = document.size ? `${(document.size / 1024 / 1024).toFixed(2)} MB` : 'Unknown size'
  const uploadDate = document.created_at ? new Date(document.created_at).toLocaleDateString() : 'Unknown date'
  
  return `
**Document Summary: ${fileName}**

📄 **File Information:**
- Size: ${fileSize}
- Uploaded: ${uploadDate}
- Type: ${document.format || 'Unknown'}

📝 **Key Points:**
This document appears to be a ${document.format || 'file'} that was uploaded to WorkSphere AI. 

${document.metadata?.description ? `Description: ${document.metadata.description}` : ''}

${document.metadata?.tags ? `Tags: ${document.metadata.tags.join(', ')}` : ''}

**Recommendation:**
This document is ready for review and can be shared with team members who have appropriate permissions.
  `.trim()
}

function extractDocumentId(query: string): string | null {
  // Simple extraction - in a real implementation, this would be more sophisticated
  const match = query.match(/(?:document|file)\s*(?:id|named?)\s*([a-zA-Z0-9-]+)/i)
  return match ? match[1] : null
}

async function handleReportGeneration(query: string, user: any, supabase: any): Promise<AIResponse> {
  try {
    const reportType = extractReportType(query)
    
    if (!reportType) {
      return {
        response: "What type of report would you like me to generate?",
        suggestions: [
          'Generate a weekly productivity report',
          'Create a department performance report',
          'Show me the approval workflow report',
          'Generate a document activity summary'
        ]
      }
    }
    
    // Generate report data
    const reportData = await generateReportData(reportType, user, supabase)
    
    return {
      response: reportData.summary,
      actions: [{
        type: 'create_task' as const,
        data: {
          title: `${reportType} Report`,
          description: reportData.details,
          priority: 'medium'
        }
      }],
      metadata: {
        report_type: reportType,
        generated_at: new Date().toISOString()
      }
    }
  } catch (error) {
    console.error('Error in report generation:', error)
    return {
      response: "I had trouble generating that report.",
      confidence: 0.2
    }
  }
}

function extractReportType(query: string): string | null {
  const types = ['productivity', 'performance', 'approval', 'document', 'weekly', 'monthly', 'department']
  
  for (const type of types) {
    if (query.toLowerCase().includes(type)) {
      return type
    }
  }
  
  return null
}

async function generateReportData(reportType: string, user: any, supabase: any): Promise<any> {
  const organizationId = user.organization_id
  
  switch (reportType) {
    case 'productivity':
      const { data: tasks } = await supabase
        .from('tasks')
        .select('status, created_at, completed_at')
        .eq('organization_id', organizationId)
      
      const completed = tasks?.filter(t => t.status === 'completed').length || 0
      const total = tasks?.length || 0
      const completionRate = total > 0 ? (completed / total * 100).toFixed(1) : '0'
      
      return {
        summary: `📊 **Productivity Report**\n\n**Task Completion Rate:** ${completionRate}%\n**Completed Tasks:** ${completed}/${total}\n**Productivity Status:** ${completionRate >= 70 ? 'Excellent' : completionRate >= 50 ? 'Good' : 'Needs Improvement'}`,
        details: `Your team has completed ${completed} out of ${total} tasks this period.`
      }
      
    case 'approval':
      const { data: approvals } = await supabase
        .from('approval_requests')
        .select('status, created_at, type')
        .eq('organization_id', organizationId)
      
      const pending = approvals?.filter(a => a.status === 'pending').length || 0
      const approved = approvals?.filter(a => a.status === 'approved').length || 0
      const rejected = approvals?.filter(a => a.status === 'rejected').length || 0
      
      return {
        summary: `📋 **Approval Workflow Report**\n\n**Pending Approvals:** ${pending}\n**Approved:** ${approved}\n**Rejected:** ${rejected}\n**Total Processed:** ${approved + rejected}`,
        details: `Your organization has processed ${approved + rejected} approval requests this period.`
      }
      
    default:
      return {
        summary: `📈 **${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report**\n\nReport generated successfully.`,
        details: `This is a ${reportType} report for your organization.`
      }
  }
}

async function handleAdvancedTaskManagement(query: string, user: any, supabase: any): Promise<AIResponse> {
  const lowerQuery = query.toLowerCase()
  
  try {
    if (lowerQuery.includes('overdue')) {
      const { data: overdueTasks } = await supabase
        .from('tasks')
        .select('*')
        .eq('assigned_to', user.id)
        .lt('due_date', new Date().toISOString())
        .neq('status', 'completed')
        .order('due_date', { ascending: true })
      
      if (!overdueTasks || overdueTasks.length === 0) {
        return {
          response: "Great! You don't have any overdue tasks.",
          suggestions: ['Show my upcoming tasks', 'Create a new task', 'View task priorities']
        }
      }
      
      const taskList = overdueTasks.map(task => 
        `• ${task.title} (Due: ${new Date(task.due_date).toLocaleDateString()})`
      ).join('\n')
      
      return {
        response: `⚠️ **Overdue Tasks (${overdueTasks.length})**\n\n${taskList}`,
        actions: overdueTasks.map(task => ({
          type: 'create_task' as const,
          data: { taskId: task.id, action: 'update_priority', priority: 'urgent' }
        }))
      }
    }
    
    if (lowerQuery.includes('priority') && lowerQuery.includes('high')) {
      const { data: highPriorityTasks } = await supabase
        .from('tasks')
        .select('*')
        .eq('assigned_to', user.id)
        .eq('priority', 'high')
        .neq('status', 'completed')
        .order('created_at', { ascending: false })
      
      if (!highPriorityTasks || highPriorityTasks.length === 0) {
        return {
          response: "You don't have any high priority tasks.",
          suggestions: ['Show all tasks', 'Create a high priority task', 'Check overdue tasks']
        }
      }
      
      return {
        response: `🔴 **High Priority Tasks (${highPriorityTasks.length})**\n\n${highPriorityTasks.map(task => `• ${task.title}`).join('\n')}`,
        suggestions: ['Show medium priority tasks', 'Create new task', 'Mark task as completed']
      }
    }
    
    return {
      response: "I can help you with task management. Try asking about overdue tasks, priorities, or task assignment.",
      suggestions: [
        'Show my overdue tasks',
        'List high priority tasks',
        'Create a new task',
        'Assign task to team member'
      ]
    }
  } catch (error) {
    console.error('Error in advanced task management:', error)
    return {
      response: "I had trouble processing that task management request.",
      confidence: 0.2
    }
  }
}

async function handleAdvancedDocumentSearch(query: string, user: any, supabase: any): Promise<AIResponse> {
  const lowerQuery = query.toLowerCase()
  
  try {
    // Parse search criteria
    const searchCriteria = parseSearchCriteria(query)
    
    let dbQuery = supabase
      .from('files')
      .select(`
        *,
        uploaded_by_user:uploaded_by (full_name, avatar_url)
      `)
      .eq('organization_id', user.organization_id)
    
    // Apply filters
    if (searchCriteria.type) {
      dbQuery = dbQuery.ilike('format', `%${searchCriteria.type}%`)
    }
    
    if (searchCriteria.dateRange) {
      const now = new Date()
      let startDate: Date
      
      switch (searchCriteria.dateRange) {
        case 'today':
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
          break
        case 'this week':
          startDate = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000))
          break
        case 'this month':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1)
          break
        case 'last week':
          startDate = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000))
          break
        case 'last month':
          startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1)
          break
      }
      
      dbQuery = dbQuery.gte('created_at', startDate.toISOString())
    }
    
    if (searchCriteria.size) {
      if (searchCriteria.size === 'large') {
        dbQuery = dbQuery.gte('size', 10 * 1024 * 1024) // > 10MB
      } else if (searchCriteria.size === 'small') {
        dbQuery = dbQuery.lt('size', 1024 * 1024) // < 1MB
      }
    }
    
    const { data: documents } = await dbQuery.order('created_at', { ascending: false }).limit(20)
    
    if (!documents || documents.length === 0) {
      return {
        response: "No documents found matching your criteria.",
        suggestions: [
          'Search all documents',
          'Search PDFs only',
          'Search documents from this week'
        ]
      }
    }
    
    const documentList = documents.map(doc => 
      `• ${doc.name} (${doc.format}, ${formatFileSize(doc.size)}) - ${doc.uploaded_by_user?.full_name}`
    ).join('\n')
    
    return {
      response: `📄 **Found Documents (${documents.length})**\n\n${documentList}`,
      actions: documents.map(doc => ({
        type: 'search_files' as const,
        data: { documentId: doc.id, action: 'preview' }
      }))
    }
  } catch (error) {
    console.error('Error in advanced document search:', error)
    return {
      response: "I had trouble searching for documents.",
      confidence: 0.2
    }
  }
}

function parseSearchCriteria(query: string): any {
  const criteria: any = {}
  
  // File type
  const types = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'jpg', 'png', 'mp4']
  for (const type of types) {
    if (query.toLowerCase().includes(type)) {
      criteria.type = type
      break
    }
  }
  
  // Date range
  if (query.toLowerCase().includes('today')) {
    criteria.dateRange = 'today'
  } else if (query.toLowerCase().includes('this week')) {
    criteria.dateRange = 'this week'
  } else if (query.toLowerCase().includes('this month')) {
    criteria.dateRange = 'this month'
  } else if (query.toLowerCase().includes('last week')) {
    criteria.dateRange = 'last week'
  } else if (query.toLowerCase().includes('last month')) {
    criteria.dateRange = 'last month'
  }
  
  // File size
  if (query.toLowerCase().includes('large')) {
    criteria.size = 'large'
  } else if (query.toLowerCase().includes('small')) {
    criteria.size = 'small'
  }
  
  return criteria
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

async function handleApprovalAnalysis(query: string, user: any, supabase: any): Promise<AIResponse> {
  const lowerQuery = query.toLowerCase()
  
  try {
    if (lowerQuery.includes('bottleneck')) {
      // Analyze approval bottlenecks
      const { data: approvals } = await supabase
        .from('approval_requests')
        .select(`
          *,
          requester:requester_id (full_name),
          approver:approver_id (full_name),
          steps:approval_steps (
            SELECT approver_id, status, action_date
            FROM approval_steps 
            WHERE request_id = approval_requests.id
            ORDER BY step_order
          )
        `)
        .eq('organization_id', user.organization_id)
        .eq('status', 'pending')
      
      if (!approvals || approvals.length === 0) {
        return {
          response: "No pending approvals found. Your approval workflow is running smoothly!",
          confidence: 0.8
        }
      }
      
      // Find bottlenecks
      const bottlenecks = approvals.filter(approval => {
        const steps = approval.steps || []
        const pendingSteps = steps.filter(step => step.status === 'pending')
        return pendingSteps.length > 2 // More than 2 pending steps indicates bottleneck
      })
      
      if (bottlenecks.length === 0) {
        return {
          response: "✅ **No Approval Bottlenecks**\n\nAll pending approvals are progressing normally through the workflow.",
          confidence: 0.9
        }
      }
      
      const bottleneckList = bottlenecks.map(approval => 
        `• ${approval.title} (${approval.type}) - ${approval.requester?.full_name} - ${bottlenecks.length} pending steps`
      ).join('\n')
      
      return {
        response: `⚠️ **Approval Bottlenecks Detected**\n\n${bottleneckList}`,
        actions: bottlenecks.map(approval => ({
          type: 'create_task' as const,
          data: {
            title: `Expedite: ${approval.title}`,
            description: `This approval has ${bottlenecks.length} pending steps and may need attention.`,
            priority: 'high'
          }
        }))
      }
    }
    
    if (lowerQuery.includes('status')) {
      const { data: stats } = await supabase
        .from('approval_requests')
        .select('status')
        .eq('organization_id', user.organization_id)
      
      const statusCounts = stats?.reduce((acc, curr) => {
        acc[curr.status] = (acc[curr.status] || 0) + 1
        return acc
      }, {})
      
      const total = Object.values(statusCounts).reduce((sum, count) => sum + count, 0)
      
      return {
        response: `📊 **Approval Status Overview**\n\n**Total Requests:** ${total}\n**Pending:** ${statusCounts.pending || 0}\n**Approved:** ${statusCounts.approved || 0}\n**Rejected:** ${statusCounts.rejected || 0}\n**In Review:** ${statusCounts.in_review || 0}`,
        metadata: {
          total_requests: total,
          status_breakdown: statusCounts
        }
      }
    }
    
    return {
      response: "I can help you analyze approval workflows. Try asking about bottlenecks, status, or specific approvals.",
      suggestions: [
        'Show approval bottlenecks',
        'Check approval status',
        'List pending approvals',
        'Show approval turnaround time'
      ]
    }
  } catch (error) {
    console.error('Error in approval analysis:', error)
    return {
      response: "I had trouble analyzing the approval data.",
      confidence: 0.2
    }
  }
}

async function handleProductivityInsights(query: string, user: any, supabase: any): Promise<AIResponse> {
  try {
    const organizationId = user.organization_id
    
    // Get comprehensive productivity metrics
    const [
      tasksResult,
      messagesResult,
      approvalsResult,
      documentsResult
    ] = await Promise.all([
      supabase.from('tasks').select('status, created_at, completed_at, assigned_to').eq('organization_id', organizationId),
      supabase.from('messages').select('created_at, sender_id').eq('organization_id', organizationId),
      supabase.from('approval_requests').select('status, created_at').eq('organization_id', organizationId),
      supabase.from('files').select('created_at, uploaded_by').eq('organization_id', organizationId)
    ])
    
    const tasks = tasksResult.data || []
    const messages = messagesResult.data || []
    const approvals = approvalsResult.data || []
    const documents = documentsResult.data || []
    
    // Calculate metrics
    const totalTasks = tasks.length
    const completedTasks = tasks.filter(t => t.status === 'completed').length
    const taskCompletionRate = totalTasks > 0 ? (completedTasks / totalTasks * 100).toFixed(1) : '0'
    
    const messagesToday = messages.filter(m => {
      const messageDate = new Date(m.created_at)
      const today = new Date()
      return messageDate.toDateString() === today.toDateString()
    }).length
    
    const pendingApprovals = approvals.filter(a => a.status === 'pending').length
    const documentsThisWeek = documents.filter(d => {
      const docDate = new Date(d.created_at)
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      return docDate >= weekAgo
    }).length
    
    // Generate insights
    const insights = generateProductivityInsights({
      taskCompletionRate: parseFloat(taskCompletionRate),
      messagesToday,
      pendingApprovals,
      documentsThisWeek,
      totalTasks,
      completedTasks,
      userRole: user.role
    })
    
    return {
      response: insights.summary,
      metadata: insights.metrics
    }
  } catch (error) {
    console.error('Error in productivity insights:', error)
    return {
      response: "I had trouble generating productivity insights.",
      confidence: 0.2
    }
  }
}

function generateProductivityInsights(metrics: any): { summary: string; metrics: any } {
  const { taskCompletionRate, messagesToday, pendingApprovals, documentsThisWeek, userRole } = metrics
  
  let summary = `📊 **Productivity Insights**\n\n`
  
  // Task performance
  if (taskCompletionRate >= 80) {
    summary += `✅ **Excellent Task Performance:** ${taskCompletionRate}% completion rate\n`
  } else if (taskCompletionRate >= 60) {
    summary += `👍 **Good Task Performance:** ${taskCompletionRate}% completion rate\n`
  } else {
    summary += `⚠️ **Task Performance Needs Attention:** ${taskCompletionRate}% completion rate\n`
  }
  
  // Communication
  if (messagesToday >= 10) {
    summary += `💬 **High Communication Activity:** ${messagesToday} messages today\n`
  } else if (messagesToday >= 5) {
    summary += `💬 **Moderate Communication:** ${messagesToday} messages today\n`
  } else {
    summary += `💬 **Low Communication Activity:** ${messagesToday} messages today\n`
  }
  
  // Approvals
  if (pendingApprovals === 0) {
    summary += `✅ **No Pending Approvals:** Workflow is clear\n`
  } else if (pendingApprovals <= 3) {
    summary += `⚠️ **${pendingApprovals} Pending Approvals:** Manageable workload\n`
  } else {
    summary += `🚨 **${pendingApprovals} Pending Approvals:** High workload detected\n`
  }
  
  // Documents
  if (documentsThisWeek >= 5) {
    summary += `📁 **Active Document Management:** ${documentsThisWeek} documents this week\n`
  } else {
    summary += `📁 **Document Activity:** ${documentsThisWeek} documents this week\n`
  }
  
  // Role-specific insights
  if (userRole === 'ceo') {
    summary += `\n👑 **CEO View:** Overall team productivity is ${taskCompletionRate >= 70 ? 'excellent' : 'needs improvement'}`
  } else if (userRole === 'manager') {
    summary += `\n👥 **Manager View:** Your team's task completion rate is ${taskCompletionRate}%`
  } else {
    summary += `\n👤 **Employee View:** Your personal task completion rate is ${taskCompletionRate}%`
  }
  
  return {
    summary,
    metrics: {
      task_completion_rate: parseFloat(taskCompletionRate),
      messages_today: messagesToday,
      pending_approvals: pendingApprovals,
      documents_this_week: documentsThisWeek,
      total_tasks: metrics.totalTasks,
      completed_tasks: metrics.completedTasks
    }
  }
}

function containsNonEnglish(text: string): boolean {
  // Simple check for non-English characters
  const nonEnglishPattern = /[^\x00-\x7F]/
  return nonEnglishPattern.test(text)
}

async function handleMultiLanguageQuery(query: string, user: any, supabase: any): Promise<AIResponse> {
  // Simple multi-language support
  const greetings: Record<string, string> = {
    'bonjour': 'Hello! How can I help you today?',
    'bonjour!': 'Hello! How can I help you today?',
    'hola': '¡Hola! ¿Cómo puedo ayudarte hoy?',
    'hola!': '¡Hola! ¿Cómo puedo ayudarte hoy?',
    'murakaza': 'Murakaza! Nigute uguze kuri?',
    'murakaza!': 'Murakaza! Nigute uguze kuri?'
  }
  
  const lowerQuery = query.toLowerCase().trim()
  
  for (const [greeting, response] of Object.entries(greetings)) {
    if (lowerQuery === greeting) {
      return {
        response,
        suggestions: [
          'Show my tasks',
          'Check pending approvals',
          'View documents',
          'Send a message'
        ]
      }
    }
  }
  
  // Default response for unrecognized non-English
  return {
    response: "I understand you're communicating in a different language. I currently support English, French, and basic Kinyarwanda. How can I help you?",
    suggestions: [
      'Show my tasks',
      'Check pending approvals', 
      'View documents',
      'Send a message'
    ]
  }
}

async function handleBasicAIQuery(query: string, user: any, context: any, supabase: any): Promise<AIResponse> {
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
    response: `I understand you're asking about "${query}". As WorkSphere AI, I can help you with tasks, messages, files, approvals, meetings, and more. Could you be more specific about what you need?`,
    suggestions: [
      'Show my pending tasks',
      'Summarize unread messages',
      'Find recent files',
      'Check pending approvals',
      'Schedule team meeting',
      'Show productivity metrics'
    ]
  }
}

// Reuse existing functions from basic AI assistant
async function handleTaskQuery(query: string, user: any, supabase: any): Promise<AIResponse> {
  const { data: tasks } = await supabase
    .from('tasks')
    .select(`
      *,
      assigned_by_user:assigned_by (full_name, avatar_url),
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
    .limit(10)

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

  if (myRequests.length > 0) {
    response += `\n\n${myRequests.length} pending your response.`
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

async function handleMeetingScheduling(query: string, user: any, supabase: any): Promise<AIResponse> {
  // This would integrate with calendar APIs
  return {
    response: "I can help you schedule meetings! Here's what I can do:\n\n• Schedule team meetings with availability check\n• Set up 1-on-1 conversations\n• Book client calls\n• Sync with Google/Outlook calendars\n• Send meeting reminders\n• Create recurring meetings",
    actions: [
      {
        type: 'schedule_meeting' as const,
        data: { type: 'team', duration: 60 }
      },
      {
        type: 'schedule_meeting' as const,
        data: { type: 'one-on-one', duration: 30 }
      },
      {
        type: 'schedule_meeting' as const,
        data: { type: 'client', duration: 45 }
      }
    ],
    suggestions: [
      'Schedule team standup for tomorrow',
      'Book meeting with John',
      'Set up weekly team sync',
      'Create recurring project meeting'
    ]
  }
}
