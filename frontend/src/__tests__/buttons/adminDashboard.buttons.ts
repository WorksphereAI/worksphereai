export const adminDashboardButtons = [
  {
    id: 'admin-nav-users',
    component: 'AdminSidebar',
    text: 'Users',
    action: 'navigate to users management',
    expectedBehavior: 'Should navigate to /admin/users',
    requiredRole: ['ceo', 'admin']
  },
  {
    id: 'admin-nav-organizations',
    component: 'AdminSidebar',
    text: 'Organizations',
    action: 'navigate to organizations management',
    expectedBehavior: 'Should navigate to /admin/organizations',
    requiredRole: ['ceo', 'admin']
  },
  {
    id: 'admin-nav-subscriptions',
    component: 'AdminSidebar',
    text: 'Subscriptions',
    action: 'navigate to subscriptions',
    expectedBehavior: 'Should navigate to /admin/subscriptions',
    requiredRole: ['ceo', 'admin']
  },
  {
    id: 'admin-user-edit',
    component: 'UsersTable',
    text: 'Edit',
    action: 'open user edit modal',
    expectedBehavior: 'Should open modal with user details for editing',
    requiredRole: ['ceo', 'admin'],
    apiEndpoint: '/api/admin/users/[id]'
  },
  {
    id: 'admin-user-delete',
    component: 'UsersTable',
    text: 'Delete',
    action: 'delete user',
    expectedBehavior: 'Should show confirmation dialog, then delete user',
    requiredRole: ['ceo', 'admin'],
    apiEndpoint: '/api/admin/users/[id]'
  },
  {
    id: 'admin-user-suspend',
    component: 'UsersTable',
    text: 'Suspend',
    action: 'suspend user account',
    expectedBehavior: 'Should suspend user and update status',
    requiredRole: ['ceo', 'admin'],
    apiEndpoint: '/api/admin/users/[id]/suspend'
  },
  {
    id: 'admin-org-approve',
    component: 'OrganizationsTable',
    text: 'Approve',
    action: 'approve organization',
    expectedBehavior: 'Should approve pending organization',
    requiredRole: ['ceo', 'admin'],
    apiEndpoint: '/api/admin/organizations/[id]/approve'
  },
  {
    id: 'admin-org-reject',
    component: 'OrganizationsTable',
    text: 'Reject',
    action: 'reject organization',
    expectedBehavior: 'Should reject organization with reason',
    requiredRole: ['ceo', 'admin'],
    apiEndpoint: '/api/admin/organizations/[id]/reject'
  },
  {
    id: 'admin-subscription-upgrade',
    component: 'SubscriptionsTable',
    text: 'Upgrade',
    action: 'upgrade subscription',
    expectedBehavior: 'Should open upgrade plan modal',
    requiredRole: ['ceo', 'admin'],
    apiEndpoint: '/api/admin/subscriptions/[id]/upgrade'
  },
  {
    id: 'admin-subscription-cancel',
    component: 'SubscriptionsTable',
    text: 'Cancel',
    action: 'cancel subscription',
    expectedBehavior: 'Should show cancellation confirmation',
    requiredRole: ['ceo', 'admin'],
    apiEndpoint: '/api/admin/subscriptions/[id]/cancel'
  },
  {
    id: 'admin-export-csv',
    component: 'AdminDashboard',
    text: 'Export CSV',
    action: 'export data to CSV',
    expectedBehavior: 'Should download CSV file',
    requiredRole: ['ceo', 'admin']
  },
  {
    id: 'admin-refresh-data',
    component: 'AdminDashboard',
    text: 'Refresh dashboard data',
    expectedBehavior: 'Should reload all dashboard data',
    requiredRole: ['ceo', 'admin'],
    apiEndpoint: '/api/admin/dashboard'
  },
  {
    id: 'admin-settings-save',
    component: 'AdminSettings',
    text: 'Save Settings',
    action: 'save admin settings',
    expectedBehavior: 'Should save all settings and show success message',
    requiredRole: ['ceo', 'admin'],
    apiEndpoint: '/api/admin/settings'
  }
];
