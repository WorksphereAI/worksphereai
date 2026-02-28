// backend/functions/send-sms.js
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Africa's Talking SMS configuration
const AT_API_KEY = process.env.AT_API_KEY;
const AT_USERNAME = process.env.AT_USERNAME;
const AT_BASE_URL = 'https://api.africastalking.com/version1/messaging';

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { to, message, from = 'WorkSphereAI' } = req.body;

    // Validate required fields
    if (!to || !message) {
      return res.status(400).json({ error: 'Missing required fields: to, message' });
    }

    // Check if Africa's Talking credentials are configured
    if (!AT_API_KEY || !AT_USERNAME) {
      console.error('Africa\'s Talking credentials not configured');
      return res.status(500).json({ error: 'SMS service not configured' });
    }

    // Send SMS via Africa's Talking API
    const formData = new URLSearchParams({
      username: AT_USERNAME,
      to: to,
      message: message,
      from: from
    });

    const response = await fetch(AT_BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
        'apiKey': AT_API_KEY
      },
      body: formData
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Africa\'s Talking API error:', errorText);
      return res.status(500).json({ error: 'SMS sending failed', details: errorText });
    }

    const result = await response.json();
    console.log('✅ SMS sent successfully:', result);

    // Log SMS to database for analytics
    try {
      await supabase
        .from('sms_logs')
        .insert({
          phone: to,
          message: message,
          status: result.SMSMessageData?.Recipients?.[0]?.status || 'unknown',
          message_id: result.SMSMessageData?.Recipients?.[0]?.messageId,
          cost: result.SMSMessageData?.Recipients?.[0]?.cost,
          created_at: new Date().toISOString()
        });
    } catch (logError) {
      console.error('Error logging SMS:', logError);
      // Don't fail the request if logging fails
    }

    return res.status(200).json({ 
      success: true, 
      data: result,
      messageId: result.SMSMessageData?.Recipients?.[0]?.messageId
    });

  } catch (error) {
    console.error('Error sending SMS:', error);
    return res.status(500).json({ error: 'Failed to send SMS', details: error.message });
  }
}
