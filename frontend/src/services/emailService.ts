// src/services/emailService.ts
import { Resend } from 'resend';

const resend = new Resend(import.meta.env.VITE_RESEND_API_KEY);

export interface EmailTemplate {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

class EmailService {
  private readonly fromEmail = 'noreply@worksphere.ai';

  // ============================================
  // VERIFICATION EMAILS
  // ============================================

  async sendVerificationEmail(email: string, verificationToken: string, userType: string): Promise<void> {
    const verificationUrl = `${import.meta.env.VITE_APP_URL || 'http://localhost:5173'}/verify-email?token=${verificationToken}`;
    
    const template = this.getVerificationTemplate(email, verificationUrl, userType);
    
    try {
      await resend.emails.send({
        from: this.fromEmail,
        ...template
      });
    } catch (error) {
      console.error('Error sending verification email:', error);
      throw new Error('Failed to send verification email');
    }
  }

  async resendVerificationEmail(email: string, verificationToken: string, userType: string): Promise<void> {
    // Same as verification email, but with different subject
    const verificationUrl = `${import.meta.env.VITE_APP_URL || 'http://localhost:5173'}/verify-email?token=${verificationToken}`;
    
    const template = this.getResendVerificationTemplate(email, verificationUrl, userType);
    
    try {
      await resend.emails.send({
        from: this.fromEmail,
        ...template
      });
    } catch (error) {
      console.error('Error resending verification email:', error);
      throw new Error('Failed to resend verification email');
    }
  }

  // ============================================
  // INVITATION EMAILS
  // ============================================

  async sendInvitationEmail(
    email: string, 
    invitationToken: string, 
    inviterName: string, 
    organizationName: string,
    role: string
  ): Promise<void> {
    const invitationUrl = `${import.meta.env.VITE_APP_URL || 'http://localhost:5173'}/accept-invitation?token=${invitationToken}`;
    
    const template = this.getInvitationTemplate(email, invitationUrl, inviterName, organizationName, role);
    
    try {
      await resend.emails.send({
        from: this.fromEmail,
        ...template
      });
    } catch (error) {
      console.error('Error sending invitation email:', error);
      throw new Error('Failed to send invitation email');
    }
  }

  // ============================================
  // WELCOME EMAILS
  // ============================================

  async sendWelcomeEmail(email: string, name: string, userType: string): Promise<void> {
    const template = this.getWelcomeTemplate(email, name, userType);
    
    try {
      await resend.emails.send({
        from: this.fromEmail,
        ...template
      });
    } catch (error) {
      console.error('Error sending welcome email:', error);
      throw new Error('Failed to send welcome email');
    }
  }

  async sendOnboardingCompleteEmail(email: string, name: string, organizationName: string): Promise<void> {
    const template = this.getOnboardingCompleteTemplate(email, name, organizationName);
    
    try {
      await resend.emails.send({
        from: this.fromEmail,
        ...template
      });
    } catch (error) {
      console.error('Error sending onboarding complete email:', error);
      throw new Error('Failed to send onboarding complete email');
    }
  }

  // ============================================
  // PASSWORD RESET EMAILS
  // ============================================

  async sendPasswordResetEmail(email: string, resetToken: string): Promise<void> {
    const resetUrl = `${import.meta.env.VITE_APP_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}`;
    
    const template = this.getPasswordResetTemplate(email, resetUrl);
    
    try {
      await resend.emails.send({
        from: this.fromEmail,
        ...template
      });
    } catch (error) {
      console.error('Error sending password reset email:', error);
      throw new Error('Failed to send password reset email');
    }
  }

  // ============================================
  // NOTIFICATION EMAILS
  // ============================================

  async sendTeamInvitationAcceptedEmail(
    adminEmail: string, 
    newMemberName: string, 
    organizationName: string
  ): Promise<void> {
    const template = this.getInvitationAcceptedTemplate(adminEmail, newMemberName, organizationName);
    
    try {
      await resend.emails.send({
        from: this.fromEmail,
        ...template
      });
    } catch (error) {
      console.error('Error sending invitation accepted email:', error);
      throw new Error('Failed to send invitation accepted email');
    }
  }

  async sendAccountSuspendedEmail(email: string, name: string, reason: string): Promise<void> {
    const template = this.getAccountSuspendedTemplate(email, name, reason);
    
    try {
      await resend.emails.send({
        from: this.fromEmail,
        ...template
      });
    } catch (error) {
      console.error('Error sending account suspended email:', error);
      throw new Error('Failed to send account suspended email');
    }
  }

  // ============================================
  // EMAIL TEMPLATES
  // ============================================

  private getVerificationTemplate(email: string, verificationUrl: string, userType: string): EmailTemplate {
    const isEnterprise = userType === 'enterprise';
    const isIndividual = userType === 'individual';
    const isCustomer = userType === 'customer';

    return {
      to: email,
      subject: 'Verify your WorkSphere AI account',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Verify your WorkSphere AI account</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { text-align: center; padding: 40px 0; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border-radius: 12px 12px 0 0; }
            .content { background: white; padding: 40px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
            .button { display: inline-block; padding: 12px 24px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; border-radius: 8px; margin: 20px 0; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
            .feature { padding: 10px 0; border-bottom: 1px solid #eee; }
            .feature:last-child { border-bottom: none; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🚀 Welcome to WorkSphere AI</h1>
              <p>${isEnterprise ? 'Transform your enterprise operations' : isIndividual ? 'Boost your productivity' : 'Access your customer portal'}</p>
            </div>
            
            <div class="content">
              <h2>Verify your email address</h2>
              <p>Thank you for signing up for WorkSphere AI! To complete your registration, please verify your email address by clicking the button below:</p>
              
              <div style="text-align: center;">
                <a href="${verificationUrl}" class="button">Verify Email Address</a>
              </div>
              
              <p><strong>What happens next?</strong></p>
              ${isEnterprise ? `
                <div class="feature">
                  <strong>🏢 Company Setup:</strong> Configure your organization profile and settings
                </div>
                <div class="feature">
                  <strong>👥 Team Invitation:</strong> Invite your colleagues to join the workspace
                </div>
                <div class="feature">
                  <strong>🔗 Tool Integration:</strong> Connect your existing tools and workflows
                </div>
              ` : isIndividual ? `
                <div class="feature">
                  <strong>🎯 Personal Dashboard:</strong> Access your personalized workspace
                </div>
                <div class="feature">
                  <strong>📊 Analytics:</strong> Track your productivity and insights
                </div>
                <div class="feature">
                  <strong>🤝 Collaboration:</strong> Connect with teams and projects
                </div>
              ` : `
                <div class="feature">
                  <strong>📋 Customer Portal:</strong> Access your account and billing information
                </div>
                <div class="feature">
                  <strong>💳 Invoice Management:</strong> View and pay your invoices
                </div>
                <div class="feature">
                  <strong>🎫 Support Tickets:</strong> Get help from our support team
                </div>
              `}
              
              <p style="margin-top: 30px; padding: 15px; background: #f8f9fa; border-radius: 8px;">
                <strong>⏰ This link expires in 24 hours</strong><br>
                If you didn't create an account with WorkSphere AI, you can safely ignore this email.
              </p>
            </div>
            
            <div class="footer">
              <p>WorkSphere AI • Intelligent Corporate Operating System</p>
              <p style="font-size: 12px; color: #999;">
                If you're having trouble clicking the verification button, copy and paste this URL into your browser:<br>
                <span style="word-break: break-all;">${verificationUrl}</span>
              </p>
            </div>
          </div>
        </body>
        </html>
      `
    };
  }

  private getResendVerificationTemplate(email: string, verificationUrl: string, userType: string): EmailTemplate {
    return {
      to: email,
      subject: 'New verification link for WorkSphere AI',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>New verification link</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { text-align: center; padding: 30px 0; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border-radius: 12px 12px 0 0; }
            .content { background: white; padding: 30px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
            .button { display: inline-block; padding: 12px 24px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; border-radius: 8px; margin: 20px 0; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔄 New Verification Link</h1>
              <p>Here's your fresh verification link</p>
            </div>
            
            <div class="content">
              <h2>You requested a new verification link</h2>
              <p>No problem! Here's your new verification link for WorkSphere AI. This link will expire in 24 hours:</p>
              
              <div style="text-align: center;">
                <a href="${verificationUrl}" class="button">Verify Email Address</a>
              </div>
              
              <p style="margin-top: 30px; padding: 15px; background: #f8f9fa; border-radius: 8px;">
                <strong>🔒 Security note:</strong> If you didn't request this new link, please secure your account and contact support.
              </p>
            </div>
            
            <div class="footer">
              <p>WorkSphere AI • Intelligent Corporate Operating System</p>
              <p style="font-size: 12px; color: #999;">
                If you're having trouble clicking the verification button, copy and paste this URL into your browser:<br>
                <span style="word-break: break-all;">${verificationUrl}</span>
              </p>
            </div>
          </div>
        </body>
        </html>
      `
    };
  }

  private getInvitationTemplate(
    email: string, 
    invitationUrl: string, 
    inviterName: string, 
    organizationName: string,
    role: string
  ): EmailTemplate {
    const roleDescription = {
      admin: 'administrative access',
      manager: 'management privileges',
      employee: 'team member access'
    }[role] || 'access';

    return {
      to: email,
      subject: `You're invited to join ${organizationName} on WorkSphere AI`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Invitation to WorkSphere AI</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { text-align: center; padding: 40px 0; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border-radius: 12px 12px 0 0; }
            .content { background: white; padding: 40px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
            .button { display: inline-block; padding: 12px 24px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; border-radius: 8px; margin: 20px 0; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
            .invitation-card { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 You're Invited!</h1>
              <p>Join ${organizationName} on WorkSphere AI</p>
            </div>
            
            <div class="content">
              <h2>${inviterName} invited you to collaborate</h2>
              <p>You've been invited to join <strong>${organizationName}</strong> on WorkSphere AI with ${roleDescription}.</p>
              
              <div class="invitation-card">
                <h3>🏢 ${organizationName}</h3>
                <p><strong>Role:</strong> ${role.charAt(0).toUpperCase() + role.slice(1)}</p>
                <p><strong>Invited by:</strong> ${inviterName}</p>
              </div>
              
              <div style="text-align: center;">
                <a href="${invitationUrl}" class="button">Accept Invitation</a>
              </div>
              
              <p><strong>What is WorkSphere AI?</strong></p>
              <p>WorkSphere AI is an intelligent corporate operating system that helps teams collaborate, manage projects, and boost productivity with AI-powered tools and automation.</p>
              
              <p style="margin-top: 30px; padding: 15px; background: #f8f9fa; border-radius: 8px;">
                <strong>⏰ This invitation expires in 7 days</strong><br>
                If you don't accept by then, you'll need to request a new invitation.
              </p>
            </div>
            
            <div class="footer">
              <p>WorkSphere AI • Intelligent Corporate Operating System</p>
              <p style="font-size: 12px; color: #999;">
                If you're having trouble clicking the invitation button, copy and paste this URL into your browser:<br>
                <span style="word-break: break-all;">${invitationUrl}</span>
              </p>
            </div>
          </div>
        </body>
        </html>
      `
    };
  }

  private getWelcomeTemplate(email: string, name: string, userType: string): EmailTemplate {
    const isEnterprise = userType === 'enterprise';
    const dashboardUrl = `${import.meta.env.VITE_APP_URL || 'http://localhost:5173'}/dashboard`;

    return {
      to: email,
      subject: '🎉 Welcome to WorkSphere AI!',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome to WorkSphere AI</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { text-align: center; padding: 40px 0; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border-radius: 12px 12px 0 0; }
            .content { background: white; padding: 40px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
            .button { display: inline-block; padding: 12px 24px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; border-radius: 8px; margin: 20px 0; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
            .checklist { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .checklist-item { padding: 8px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Welcome to WorkSphere AI!</h1>
              <p>Your journey to intelligent operations starts now</p>
            </div>
            
            <div class="content">
              <h2>Hi ${name},</h2>
              <p>Welcome to WorkSphere AI! We're thrilled to have you aboard. Your account has been successfully verified and you're ready to transform the way you work.</p>
              
              <div style="text-align: center;">
                <a href="${dashboardUrl}" class="button">Go to Dashboard</a>
              </div>
              
              <h3>🚀 What's next?</h3>
              <div class="checklist">
                <div class="checklist-item">✅ <strong>Account Verified:</strong> Your email is confirmed</div>
                ${isEnterprise ? `
                  <div class="checklist-item">🏢 <strong>Complete Setup:</strong> Finish your organization profile</div>
                  <div class="checklist-item">👥 <strong>Invite Team:</strong> Bring your colleagues onboard</div>
                  <div class="checklist-item">🔗 <strong>Connect Tools:</strong> Integrate your existing workflows</div>
                ` : `
                  <div class="checklist-item">🎯 <strong>Explore Features:</strong> Discover what you can do</div>
                  <div class="checklist-item">📊 <strong>View Analytics:</strong> Track your progress</div>
                  <div class="checklist-item">⚙️ <strong>Customize Settings:</strong> Make it your own</div>
                `}
              </div>
              
              <h3>💡 Pro Tips</h3>
              <ul>
                <li>Complete your profile to get personalized recommendations</li>
                <li>Check out our video tutorials in the Help Center</li>
                <li>Join our community forum to connect with other users</li>
              </ul>
              
              <p style="margin-top: 30px; padding: 15px; background: #f8f9fa; border-radius: 8px;">
                <strong>Need help?</strong> Our support team is here for you. Reply to this email or visit our Help Center.
              </p>
            </div>
            
            <div class="footer">
              <p>WorkSphere AI • Intelligent Corporate Operating System</p>
              <p style="font-size: 12px; color: #999;">
                You're receiving this email because you signed up for WorkSphere AI.<br>
                <a href="#" style="color: #666;">Unsubscribe</a> • <a href="#" style="color: #666;">Privacy Policy</a>
              </p>
            </div>
          </div>
        </body>
        </html>
      `
    };
  }

  private getOnboardingCompleteTemplate(email: string, name: string, organizationName: string): EmailTemplate {
    const dashboardUrl = `${import.meta.env.VITE_APP_URL || 'http://localhost:5173'}/dashboard`;

    return {
      to: email,
      subject: '🎊 Setup Complete! Welcome to WorkSphere AI',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Setup Complete</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { text-align: center; padding: 40px 0; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border-radius: 12px 12px 0 0; }
            .content { background: white; padding: 40px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
            .button { display: inline-block; padding: 12px 24px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; border-radius: 8px; margin: 20px 0; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
            .success-box { background: #d4edda; border: 1px solid #c3e6cb; color: #155724; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .feature-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 20px 0; }
            .feature { padding: 15px; background: #f8f9fa; border-radius: 8px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎊 You're All Set!</h1>
              <p>Your WorkSphere AI workspace is ready</p>
            </div>
            
            <div class="content">
              <h2>Congratulations, ${name}!</h2>
              <div class="success-box">
                <h3>✅ Setup Complete!</h3>
                <p>Your organization <strong>${organizationName}</strong> is now fully configured and ready to use WorkSphere AI.</p>
              </div>
              
              <div style="text-align: center;">
                <a href="${dashboardUrl}" class="button">Go to Dashboard</a>
              </div>
              
              <h3>🚀 What you can do now</h3>
              <div class="feature-grid">
                <div class="feature">
                  <h4>📊 Dashboard</h4>
                  <p>View your organization's overview and key metrics</p>
                </div>
                <div class="feature">
                  <h4>👥 Team Management</h4>
                  <p>Manage team members and permissions</p>
                </div>
                <div class="feature">
                  <h4>📁 Projects</h4>
                  <p>Create and manage projects and tasks</p>
                </div>
                <div class="feature">
                  <h4>🤖 AI Tools</h4>
                  <p>Access AI-powered productivity tools</p>
                </div>
              </div>
              
              <h3>💡 Next Steps</h3>
              <ol>
                <li>Explore your dashboard and familiarize yourself with the interface</li>
                <li>Create your first project or invite team members</li>
                <li>Check out our <a href="#" style="color: #667eea;">video tutorials</a> for advanced features</li>
                <li>Join our <a href="#" style="color: #667eea;">community forum</a> to connect with other users</li>
              </ol>
              
              <p style="margin-top: 30px; padding: 15px; background: #f8f9fa; border-radius: 8px;">
                <strong>🎯 Need help?</strong> Our support team is just an email away. Reply to this message or visit our Help Center.
              </p>
            </div>
            
            <div class="footer">
              <p>WorkSphere AI • Intelligent Corporate Operating System</p>
              <p style="font-size: 12px; color: #999;">
                You're receiving this email because you completed setup for WorkSphere AI.<br>
                <a href="#" style="color: #666;">Help Center</a> • <a href="#" style="color: #666;">Community</a>
              </p>
            </div>
          </div>
        </body>
        </html>
      `
    };
  }

  private getPasswordResetTemplate(email: string, resetUrl: string): EmailTemplate {
    return {
      to: email,
      subject: 'Reset your WorkSphere AI password',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Reset Password</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { text-align: center; padding: 40px 0; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border-radius: 12px 12px 0 0; }
            .content { background: white; padding: 40px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
            .button { display: inline-block; padding: 12px 24px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; border-radius: 8px; margin: 20px 0; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
            .warning { background: #fff3cd; border: 1px solid #ffeaa7; color: #856404; padding: 15px; border-radius: 8px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔐 Reset Your Password</h1>
              <p>Secure your WorkSphere AI account</p>
            </div>
            
            <div class="content">
              <h2>Password Reset Request</h2>
              <p>We received a request to reset the password for your WorkSphere AI account. Click the button below to create a new password:</p>
              
              <div style="text-align: center;">
                <a href="${resetUrl}" class="button">Reset Password</a>
              </div>
              
              <div class="warning">
                <strong>⚠️ Security Notice:</strong><br>
                This link expires in 1 hour for security reasons. If you didn't request this reset, please ignore this email and your password will remain unchanged.
              </div>
              
              <p><strong>What to do if you didn't request this:</strong></p>
              <ul>
                <li>Your account is secure - no changes have been made</li>
                <li>Someone may have entered your email by mistake</li>
                <li>If you're concerned, contact our support team</li>
              </ul>
            </div>
            
            <div class="footer">
              <p>WorkSphere AI • Intelligent Corporate Operating System</p>
              <p style="font-size: 12px; color: #999;">
                If you're having trouble clicking the reset button, copy and paste this URL into your browser:<br>
                <span style="word-break: break-all;">${resetUrl}</span>
              </p>
            </div>
          </div>
        </body>
        </html>
      `
    };
  }

  private getInvitationAcceptedTemplate(adminEmail: string, newMemberName: string, organizationName: string): EmailTemplate {
    const dashboardUrl = `${import.meta.env.VITE_APP_URL || 'http://localhost:5173'}/dashboard`;

    return {
      to: adminEmail,
      subject: `🎉 ${newMemberName} joined ${organizationName}!`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>New Team Member</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { text-align: center; padding: 40px 0; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border-radius: 12px 12px 0 0; }
            .content { background: white; padding: 40px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
            .button { display: inline-block; padding: 12px 24px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; border-radius: 8px; margin: 20px 0; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
            .success-box { background: #d4edda; border: 1px solid #c3e6cb; color: #155724; padding: 20px; border-radius: 8px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 New Team Member!</h1>
              <p>Your team is growing</p>
            </div>
            
            <div class="content">
              <h2>Great news!</h2>
              <div class="success-box">
                <h3>✅ ${newMemberName} has joined ${organizationName}</h3>
                <p>Your invitation has been accepted and they're now ready to collaborate on WorkSphere AI.</p>
              </div>
              
              <div style="text-align: center;">
                <a href="${dashboardUrl}" class="button">View Team</a>
              </div>
              
              <h3>👋 Welcome your new team member</h3>
              <p>Here are some suggestions to help ${newMemberName} get started:</p>
              <ul>
                <li>Send them a welcome message</li>
                <li>Add them to relevant projects</li>
                <li>Schedule a quick orientation call</li>
                <li>Share important resources and documentation</li>
              </ul>
              
              <p style="margin-top: 30px; padding: 15px; background: #f8f9fa; border-radius: 8px;">
                <strong>💡 Tip:</strong> You can manage team permissions and roles in the Team Settings section of your dashboard.
              </p>
            </div>
            
            <div class="footer">
              <p>WorkSphere AI • Intelligent Corporate Operating System</p>
              <p style="font-size: 12px; color: #999;">
                You're receiving this email because you're an admin of ${organizationName}.<br>
                <a href="#" style="color: #666;">Team Settings</a>
              </p>
            </div>
          </div>
        </body>
        </html>
      `
    };
  }

  private getAccountSuspendedTemplate(email: string, name: string, reason: string): EmailTemplate {
    return {
      to: email,
      subject: '⚠️ Important: Your WorkSphere AI Account Status',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Account Status Notice</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { text-align: center; padding: 40px 0; background: linear-gradient(135deg, #dc3545 0%, #c82333 100%); color: white; border-radius: 12px 12px 0 0; }
            .content { background: white; padding: 40px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
            .button { display: inline-block; padding: 12px 24px; background: linear-gradient(135deg, #dc3545 0%, #c82333 100%); color: white; text-decoration: none; border-radius: 8px; margin: 20px 0; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
            .warning { background: #f8d7da; border: 1px solid #f5c6cb; color: #721c24; padding: 20px; border-radius: 8px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>⚠️ Account Status Update</h1>
              <p>Important information about your account</p>
            </div>
            
            <div class="content">
              <h2>Hi ${name},</h2>
              <div class="warning">
                <h3>🚫 Your account has been suspended</h3>
                <p><strong>Reason:</strong> ${reason}</p>
                <p>This action was taken to ensure the security and integrity of our platform.</p>
              </div>
              
              <h3>What this means</h3>
              <ul>
                <li>You cannot access your WorkSphere AI account</li>
                <li>Your team members may have limited access</li>
                <li>Your data remains safe and secure</li>
              </ul>
              
              <h3>Next steps</h3>
              <p>To resolve this issue:</p>
              <ol>
                <li>Review the reason for suspension above</li>
                <li>Contact our support team for assistance</li>
                <li>Provide any additional information requested</li>
              </ol>
              
              <div style="text-align: center;">
                <a href="mailto:support@worksphere.ai" class="button">Contact Support</a>
              </div>
              
              <p style="margin-top: 30px; padding: 15px; background: #f8f9fa; border-radius: 8px;">
                <strong>📧 We're here to help:</strong> Our support team is ready to assist you in resolving this matter quickly.
              </p>
            </div>
            
            <div class="footer">
              <p>WorkSphere AI • Intelligent Corporate Operating System</p>
              <p style="font-size: 12px; color: #999;">
                This is an automated message regarding your account status.<br>
                <a href="#" style="color: #666;">Privacy Policy</a> • <a href="#" style="color: #666;">Terms of Service</a>
              </p>
            </div>
          </div>
        </body>
        </html>
      `
    };
  }
}

export const emailService = new EmailService();
