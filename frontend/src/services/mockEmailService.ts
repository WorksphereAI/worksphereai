// src/services/mockEmailService.ts
// Mock email service for testing without Resend API key

export interface EmailTemplate {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

class MockEmailService {
  private readonly fromEmail = 'noreply@worksphere.ai';

  async sendVerificationEmail(email: string, verificationToken: string, userType: string): Promise<void> {
    const verificationUrl = `${import.meta.env.VITE_APP_URL || 'http://localhost:5173'}/verify-email?token=${verificationToken}`;
    
    console.log('📧 MOCK EMAIL - Verification Email');
    console.log('To:', email);
    console.log('Subject: Verify your WorkSphere AI account');
    console.log('Verification URL:', verificationUrl);
    console.log('User Type:', userType);
    
    // In a real implementation, this would send via Resend
    // For now, we just log it to the console
    console.log('✅ Mock email sent successfully');
  }

  async sendWelcomeEmail(email: string, name: string, userType: string): Promise<void> {
    console.log('📧 MOCK EMAIL - Welcome Email');
    console.log('To:', email);
    console.log('Subject: 🎉 Welcome to WorkSphere AI!');
    console.log('User Type:', userType);
    console.log('Personalized greeting for:', name);
    
    console.log('✅ Mock welcome email sent successfully');
  }

  async sendOnboardingCompleteEmail(email: string, name: string, organizationName: string): Promise<void> {
    console.log('📧 MOCK EMAIL - Onboarding Complete Email');
    console.log('To:', email);
    console.log('Subject: 🎊 Setup Complete! Welcome to WorkSphere AI');
    console.log('Organization:', organizationName);
    console.log('User:', name);
    
    console.log('✅ Mock onboarding email sent successfully');
  }

  async sendInvitationEmail(
    email: string, 
    invitationToken: string, 
    inviterName: string, 
    organizationName: string,
    role: string
  ): Promise<void> {
    const invitationUrl = `${import.meta.env.VITE_APP_URL || 'http://localhost:5173'}/accept-invitation?token=${invitationToken}`;
    
    console.log('📧 MOCK EMAIL - Invitation Email');
    console.log('To:', email);
    console.log('Subject: You\'re invited to join ' + organizationName + ' on WorkSphere AI');
    console.log('Invited by:', inviterName);
    console.log('Role:', role);
    console.log('Invitation URL:', invitationUrl);
    
    console.log('✅ Mock invitation email sent successfully');
  }

  async sendPasswordResetEmail(email: string, resetToken: string): Promise<void> {
    const resetUrl = `${import.meta.env.VITE_APP_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}`;
    
    console.log('📧 MOCK EMAIL - Password Reset Email');
    console.log('To:', email);
    console.log('Subject: Reset your WorkSphere AI password');
    console.log('Reset URL:', resetUrl);
    
    console.log('✅ Mock password reset email sent successfully');
  }

  async sendTeamInvitationAcceptedEmail(
    adminEmail: string, 
    newMemberName: string, 
    organizationName: string
  ): Promise<void> {
    console.log('📧 MOCK EMAIL - Team Invitation Accepted');
    console.log('To:', adminEmail);
    console.log('Subject: 🎉 ' + newMemberName + ' joined ' + organizationName + '!');
    console.log('New member:', newMemberName);
    console.log('Organization:', organizationName);
    
    console.log('✅ Mock team notification sent successfully');
  }

  async sendAccountSuspendedEmail(email: string, name: string, reason: string): Promise<void> {
    console.log('📧 MOCK EMAIL - Account Suspended');
    console.log('To:', email);
    console.log('Subject: ⚠️ Important: Your WorkSphere AI Account Status');
    console.log('User:', name);
    console.log('Reason:', reason);
    
    console.log('✅ Mock suspension email sent successfully');
  }

  // Mock method to simulate email sending for testing
  async sendEmail(template: EmailTemplate): Promise<boolean> {
    console.log('📧 MOCK EMAIL - Generic Email');
    console.log('To:', template.to);
    console.log('Subject:', template.subject);
    console.log('From:', template.from || this.fromEmail);
    console.log('HTML Length:', template.html.length, 'characters');
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    console.log('✅ Mock email sent successfully');
    return true;
  }

  // Helper method to display email content in console
  displayEmailContent(email: string, subject: string, content: string): void {
    console.log('\n' + '='.repeat(50));
    console.log('📧 EMAIL CONTENT PREVIEW');
    console.log('='.repeat(50));
    console.log('To:', email);
    console.log('Subject:', subject);
    console.log('Content Length:', content.length, 'characters');
    console.log('Preview:');
    console.log(content.substring(0, 200) + (content.length > 200 ? '...' : ''));
    console.log('='.repeat(50) + '\n');
  }
}

export const mockEmailService = new MockEmailService();
