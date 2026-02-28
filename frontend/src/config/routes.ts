// src/config/routes.ts
export const ROUTES = {
  // Public routes - accessible without authentication
  public: {
    home: '/',
    marketing: '/marketing',
    features: '/features',
    pricing: '/pricing',
    about: '/about',
    contact: '/contact',
    blog: '/blog',
    blogPost: '/blog/:slug',
    caseStudies: '/case-studies',
    caseStudy: '/case-studies/:slug',
    documentation: '/docs',
    docs: '/docs/:path*',
    support: '/support',
    
    // Auth related
    signup: '/signup',
    signupType: '/signup/:type',
    login: '/login',
    forgotPassword: '/forgot-password',
    resetPassword: '/reset-password',
    verifyEmail: '/verify-email',
    verifyEmailToken: '/verify-email/:token',
    acceptInvitation: '/accept-invitation/:token',
    
    // Public knowledge base
    knowledgeBase: '/knowledge-base',
    knowledgeBaseArticle: '/knowledge-base/:slug',
    
    // Legal
    terms: '/terms',
    privacy: '/privacy',
    cookies: '/cookies',
  },

  // Protected routes - require authentication
  protected: {
    // User dashboard
    dashboard: '/dashboard',
    profile: '/profile',
    settings: '/settings',
    
    // Core features
    messages: '/messages',
    message: '/messages/:id',
    tasks: '/tasks',
    task: '/tasks/:id',
    documents: '/documents',
    document: '/documents/:id',
    folders: '/folders/:path*',
    approvals: '/approvals',
    approval: '/approvals/:id',
    calendar: '/calendar',
    
    // Organization management
    team: '/team',
    departments: '/departments',
    department: '/departments/:id',
    
    // Analytics
    analytics: '/analytics',
    reports: '/reports',
    report: '/reports/:id',
    
    // Integrations
    integrations: '/integrations',
    integration: '/integrations/:id',
    
    // Customer portal
    customerPortal: '/portal',
    customerTickets: '/portal/tickets',
    customerTicket: '/portal/tickets/:id',
    customerDocuments: '/portal/documents',
    customerMessages: '/portal/messages',
    
    // Admin only
    admin: '/admin',
    adminUsers: '/admin/users',
    adminUser: '/admin/users/:id',
    adminOrganizations: '/admin/organizations',
    adminOrganization: '/admin/organizations/:id',
    adminSubscriptions: '/admin/subscriptions',
    adminAnalytics: '/admin/analytics',
    adminSettings: '/admin/settings',
    adminLogs: '/admin/logs',
    adminAlerts: '/admin/alerts',
    adminFeatureFlags: '/admin/feature-flags',
    adminAnnouncements: '/admin/announcements',
    
    // White label
    whiteLabel: '/white-label',
    whiteLabelSettings: '/white-label/settings',
    whiteLabelTheme: '/white-label/theme',
    whiteLabelDomain: '/white-label/domain',
    
    // Enterprise only
    enterpriseSettings: '/enterprise/settings',
    enterpriseBilling: '/enterprise/billing',
    enterpriseApi: '/enterprise/api',
    enterpriseAudit: '/enterprise/audit',
  },

  // Redirects
  redirects: {
    afterLogin: '/dashboard',
    afterLogout: '/',
    afterSignup: '/onboarding',
    afterEmailVerification: '/dashboard',
    afterPasswordReset: '/login',
  }
};

// Route groups for easier management
export const routeGroups = {
  marketing: [
    ROUTES.public.home,
    ROUTES.public.features,
    ROUTES.public.pricing,
    ROUTES.public.about,
    ROUTES.public.contact,
    ROUTES.public.blog,
    ROUTES.public.caseStudies,
  ],
  
  auth: [
    ROUTES.public.signup,
    ROUTES.public.login,
    ROUTES.public.forgotPassword,
    ROUTES.public.resetPassword,
    ROUTES.public.verifyEmail,
  ],
  
  legal: [
    ROUTES.public.terms,
    ROUTES.public.privacy,
    ROUTES.public.cookies,
  ],
  
  documentation: [
    ROUTES.public.documentation,
    ROUTES.public.docs,
    ROUTES.public.support,
    ROUTES.public.knowledgeBase,
  ],
  
  user: [
    ROUTES.protected.dashboard,
    ROUTES.protected.profile,
    ROUTES.protected.settings,
    ROUTES.protected.messages,
    ROUTES.protected.tasks,
    ROUTES.protected.documents,
    ROUTES.protected.calendar,
  ],
  
  organization: [
    ROUTES.protected.team,
    ROUTES.protected.departments,
    ROUTES.protected.approvals,
    ROUTES.protected.analytics,
  ],
  
  admin: [
    ROUTES.protected.admin,
    ROUTES.protected.adminUsers,
    ROUTES.protected.adminOrganizations,
    ROUTES.protected.adminSubscriptions,
    ROUTES.protected.adminAnalytics,
    ROUTES.protected.adminSettings,
  ],
  
  enterprise: [
    ROUTES.protected.enterpriseSettings,
    ROUTES.protected.enterpriseBilling,
    ROUTES.protected.enterpriseApi,
    ROUTES.protected.enterpriseAudit,
    ROUTES.protected.whiteLabel,
  ],
  
  customer: [
    ROUTES.protected.customerPortal,
    ROUTES.protected.customerTickets,
    ROUTES.protected.customerDocuments,
    ROUTES.protected.customerMessages,
  ],
};
