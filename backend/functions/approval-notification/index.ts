import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE',
}

interface ApprovalNotificationRequest {
  request_id: string
  approver_id: string
  type: 'email' | 'push' | 'sms' | 'in_app'
  message?: string
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { request_id, approver_id, type, message }: ApprovalNotificationRequest = await req.json()
    
    if (!request_id || !approver_id || !type) {
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

    // Get approval request details
    const { data: request, error: requestError } = await supabase
      .from('approval_requests')
      .select(`
        *,
        requester:requester_id (full_name, email),
        department:department_id (name)
      `)
      .eq('id', request_id)
      .single()

    if (requestError || !request) {
      return new Response(
        JSON.stringify({ error: 'Approval request not found' }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Get approver details
    const { data: approver, error: approverError } = await supabase
      .from('users')
      .select('full_name, email')
      .eq('id', approver_id)
      .single()

    if (approverError || !approver) {
      return new Response(
        JSON.stringify({ error: 'Approver not found' }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Prepare notification content
    const notificationContent = message || generateNotificationMessage(request, approver)

    // Send notification based on type
    let notificationResult
    
    switch (type) {
      case 'email':
        notificationResult = await sendEmailNotification(approver.email, notificationContent, request)
        break
      case 'push':
        notificationResult = await sendPushNotification(approver_id, notificationContent, request)
        break
      case 'sms':
        notificationResult = await sendSMSNotification(approver.phone, notificationContent, request)
        break
      case 'in_app':
        notificationResult = await createInAppNotification(approver_id, request_id, notificationContent)
        break
      default:
        throw new Error(`Unsupported notification type: ${type}`)
    }

    // Log notification
    await supabase
      .from('approval_notifications')
      .insert({
        request_id,
        user_id: approver_id,
        type,
        content: notificationContent,
        status: notificationResult.success ? 'sent' : 'failed',
        sent_at: notificationResult.success ? new Date().toISOString() : null
      })

    return new Response(
      JSON.stringify({ 
        success: notificationResult.success,
        message: notificationResult.message || 'Notification processed',
        notification_id: notificationResult.notification_id
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Error in approval notification:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})

function generateNotificationMessage(request: any, approver: any): string {
  const requestType = request.type.charAt(0).toUpperCase() + request.type.slice(1)
  
  return `
🎯 Approval Required: ${request.title}

Dear ${approver.full_name},

You have a pending approval request that requires your attention:

📋 Request Details:
• Type: ${requestType}
• Title: ${request.title}
• Requested by: ${request.requester.full_name}
• Department: ${request.department?.name || 'Not specified'}
• Priority: ${request.priority.toUpperCase()}

${request.description ? `• Description: ${request.description}` : ''}

${request.data ? `• Additional Details: ${JSON.stringify(request.data, null, 2)}` : ''}

🔗 Action Required:
Please review and approve or reject this request at your earliest convenience.

Click here to view: https://worksphere.app/approvals/${request.id}

Thank you for your prompt attention.

Best regards,
WorkSphere AI Team
  `.trim()
}

async function sendEmailNotification(email: string, content: string, request: any): Promise<any> {
  try {
    // Integration with email service (Resend, SendGrid, etc.)
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('RESEND_API_KEY')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'noreply@worksphere.app',
        to: [email],
        subject: `🎯 Approval Required: ${request.title}`,
        html: content.replace(/\n/g, '<br>')
      })
    })

    const result = await response.json()
    
    return {
      success: response.ok,
      message: result.id ? 'Email sent successfully' : 'Failed to send email',
      notification_id: result.id
    }
  } catch (error) {
    console.error('Email notification error:', error)
    return { success: false, message: 'Email service unavailable' }
  }
}

async function sendPushNotification(userId: string, content: string, request: any): Promise<any> {
  try {
    // Integration with push notification service (OneSignal, Firebase, etc.)
    const response = await fetch('https://onesignal.com/api/v1/notifications', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${btoa(`${Deno.env.get('ONESIGNAL_APP_ID')}:${Deno.env.get('ONESIGNAL_API_KEY')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        app_id: Deno.env.get('ONESIGNAL_APP_ID'),
        contents: {
          en: content
        },
        headings: {
          en: 'Approval Required'
        },
        include_player_ids: [userId],
        data: {
          request_id: request.id,
          type: 'approval_required'
        }
      })
    })

    const result = await response.json()
    
    return {
      success: response.ok,
      message: result.id ? 'Push notification sent' : 'Failed to send push notification',
      notification_id: result.id
    }
  } catch (error) {
    console.error('Push notification error:', error)
    return { success: false, message: 'Push service unavailable' }
  }
}

async function sendSMSNotification(phone: string, content: string, request: any): Promise<any> {
  try {
    // Integration with SMS service (Twilio, Africa's Talking, etc.)
    const response = await fetch('https://api.twilio.com/2010-04-01/Accounts/' + Deno.env.get('TWILIO_ACCOUNT_SID') + '/Messages.json', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${btoa(`${Deno.env.get('TWILIO_ACCOUNT_SID')}:${Deno.env.get('TWILIO_AUTH_TOKEN')}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        From: Deno.env.get('TWILIO_PHONE_NUMBER'),
        To: phone,
        Body: content
      })
    })

    const result = await response.json()
    
    return {
      success: response.ok,
      message: result.sid ? 'SMS sent successfully' : 'Failed to send SMS',
      notification_id: result.sid
    }
  } catch (error) {
    console.error('SMS notification error:', error)
    return { success: false, message: 'SMS service unavailable' }
  }
}

async function createInAppNotification(userId: string, requestId: string, content: string): Promise<any> {
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const { data, error } = await supabase
      .from('approval_notifications')
      .insert({
        request_id: requestId,
        user_id: userId,
        type: 'in_app',
        content,
        status: 'sent'
      })
      .select()
      .single()

    return {
      success: !error,
      message: error ? 'Failed to create in-app notification' : 'In-app notification created',
      notification_id: data?.id
    }
  } catch (error) {
    console.error('In-app notification error:', error)
    return { success: false, message: 'Failed to create notification' }
  }
}
