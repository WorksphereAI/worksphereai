// backend/functions/verify-phone.js
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { phone, userId } = req.body;

    // Validate required fields
    if (!phone) {
      return res.status(400).json({ error: 'Missing required field: phone' });
    }

    // Generate verification code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 minutes

    // Delete existing pending verifications for this phone
    await supabase
      .from('phone_verifications')
      .delete()
      .eq('phone', phone)
      .eq('status', 'pending');

    // Store verification in database
    const { data: verification, error: insertError } = await supabase
      .from('phone_verifications')
      .insert({
        phone,
        code,
        user_id: userId,
        status: 'pending',
        attempts: 0,
        max_attempts: 5,
        expires_at: expiresAt
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error storing phone verification:', insertError);
      return res.status(500).json({ error: 'Failed to create phone verification' });
    }

    // Send SMS with verification code
    try {
      const smsResponse = await fetch(`${process.env.VERCEL_URL || 'http://localhost:3000'}/api/send-sms`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: phone,
          message: `Your WorkSphere AI verification code is: ${code}. This code expires in 10 minutes. Do not share this code with anyone.`
        })
      });

      if (!smsResponse.ok) {
        const smsError = await smsResponse.json();
        console.error('Error sending verification SMS:', smsError);
        // Don't fail the whole request if SMS fails, just log it
      }

    } catch (smsError) {
      console.error('Error sending verification SMS:', smsError);
      // Don't fail the whole request if SMS fails, just log it
    }

    console.log('✅ Phone verification created:', { phone, verificationId: verification.id });

    return res.status(200).json({ 
      success: true, 
      verificationId: verification.id,
      expiresAt: verification.expires_at
    });

  } catch (error) {
    console.error('Error creating phone verification:', error);
    return res.status(500).json({ error: 'Failed to create phone verification', details: error.message });
  }
}
