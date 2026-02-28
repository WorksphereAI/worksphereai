export const userDashboardButtons = [
  // Sidebar Navigation
  {
    id: 'user-nav-dashboard',
    component: 'UserSidebar',
    text: 'Dashboard',
    action: 'navigate to dashboard',
    expectedBehavior: 'Should navigate to /dashboard'
  },
  {
    id: 'user-nav-messages',
    component: 'UserSidebar',
    text: 'Messages',
    action: 'navigate to messages',
    expectedBehavior: 'Should navigate to /messages',
    badge: true
  },
  {
    id: 'user-nav-tasks',
    component: 'UserSidebar',
    text: 'Tasks',
    action: 'navigate to tasks',
    expectedBehavior: 'Should navigate to /tasks',
    badge: true
  },
  {
    id: 'user-nav-documents',
    component: 'UserSidebar',
    text: 'Documents',
    action: 'navigate to documents',
    expectedBehavior: 'Should navigate to /documents'
  },
  {
    id: 'user-nav-approvals',
    component: 'UserSidebar',
    text: 'Approvals',
    action: 'navigate to approvals',
    expectedBehavior: 'Should navigate to /approvals',
    badge: true
  },
  {
    id: 'user-nav-calendar',
    component: 'UserSidebar',
    text: 'Calendar',
    action: 'navigate to calendar',
    expectedBehavior: 'Should navigate to /calendar'
  },
  {
    id: 'user-nav-profile',
    component: 'UserSidebar',
    text: 'Profile',
    action: 'navigate to profile',
    expectedBehavior: 'Should navigate to /profile'
  },
  {
    id: 'user-nav-settings',
    component: 'UserSidebar',
    text: 'Settings',
    action: 'navigate to settings',
    expectedBehavior: 'Should navigate to /settings'
  },

  // Dashboard Actions
  {
    id: 'dashboard-create-task',
    component: 'DashboardWidget',
    text: 'Create Task',
    action: 'open task creation modal',
    expectedBehavior: 'Should open modal to create new task',
    apiEndpoint: '/api/tasks'
  },
  {
    id: 'dashboard-send-message',
    component: 'DashboardWidget',
    text: 'New Message',
    action: 'open new message modal',
    expectedBehavior: 'Should open modal to send new message',
    apiEndpoint: '/api/messages'
  },
  {
    id: 'dashboard-upload-document',
    component: 'DashboardWidget',
    text: 'Upload',
    action: 'open file upload',
    expectedBehavior: 'Should open file picker for upload',
    apiEndpoint: '/api/documents/upload'
  },
  {
    id: 'dashboard-view-all-tasks',
    component: 'DashboardWidget',
    text: 'View All',
    action: 'navigate to all tasks',
    expectedBehavior: 'Should navigate to /tasks'
  },
  {
    id: 'dashboard-view-all-messages',
    component: 'DashboardWidget',
    text: 'View All',
    action: 'navigate to all messages',
    expectedBehavior: 'Should navigate to /messages'
  },

  // Messages Page
  {
    id: 'messages-compose',
    component: 'MessagesPage',
    text: 'New Message',
    action: 'compose new message',
    expectedBehavior: 'Should open compose message modal',
    apiEndpoint: '/api/messages'
  },
  {
    id: 'messages-search',
    component: 'MessagesPage',
    text: 'Search',
    action: 'search messages',
    expectedBehavior: 'Should filter messages based on search query'
  },
  {
    id: 'messages-reply',
    component: 'MessageThread',
    text: 'Reply',
    action: 'reply to message',
    expectedBehavior: 'Should send reply and update thread',
    apiEndpoint: '/api/messages/[id]/reply'
  },
  {
    id: 'messages-forward',
    component: 'MessageThread',
    text: 'Forward',
    action: 'forward message',
    expectedBehavior: 'Should open forward message modal',
    apiEndpoint: '/api/messages/[id]/forward'
  },
  {
    id: 'messages-delete',
    component: 'MessageThread',
    text: 'Delete',
    action: 'delete message',
    expectedBehavior: 'Should show confirmation and delete message',
    apiEndpoint: '/api/messages/[id]'
  },
  {
    id: 'messages-attach-file',
    component: 'MessageCompose',
    text: 'Attach',
    action: 'attach file',
    expectedBehavior: 'Should open file picker and attach file',
    apiEndpoint: '/api/upload'
  },

  // Tasks Page
  {
    id: 'tasks-create',
    component: 'TasksPage',
    text: 'New Task',
    action: 'create new task',
    expectedBehavior: 'Should open task creation modal',
    apiEndpoint: '/api/tasks'
  },
  {
    id: 'tasks-edit',
    component: 'TaskDetail',
    text: 'Edit',
    action: 'edit task',
    expectedBehavior: 'Should open task edit modal',
    apiEndpoint: '/api/tasks/[id]'
  },
  {
    id: 'tasks-delete',
    component: 'TaskDetail',
    text: 'Delete',
    action: 'delete task',
    expectedBehavior: 'Should show confirmation and delete task',
    apiEndpoint: '/api/tasks/[id]'
  },
  {
    id: 'tasks-complete',
    component: 'TaskItem',
    text: 'Mark Complete',
    action: 'complete task',
    expectedBehavior: 'Should mark task as completed',
    apiEndpoint: '/api/tasks/[id]/complete'
  },
  {
    id: 'tasks-assign',
    component: 'TaskDetail',
    text: 'Assign',
    action: 'assign task',
    expectedBehavior: 'Should open user selection modal',
    apiEndpoint: '/api/tasks/[id]/assign'
  },
  {
    id: 'tasks-filter',
    component: 'TasksPage',
    text: 'Filter',
    action: 'filter tasks',
    expectedBehavior: 'Should show filter options and apply filters'
  },
  {
    id: 'tasks-sort',
    component: 'TasksPage',
    text: 'Sort',
    action: 'sort tasks',
    expectedBehavior: 'Should change task sorting order'
  },

  // Documents Page
  {
    id: 'documents-upload',
    component: 'DocumentsPage',
    text: 'Upload',
    action: 'upload document',
    expectedBehavior: 'Should open file upload modal',
    apiEndpoint: '/api/documents/upload'
  },
  {
    id: 'documents-create-folder',
    component: 'DocumentsPage',
    text: 'New Folder',
    action: 'create folder',
    expectedBehavior: 'Should create new folder',
    apiEndpoint: '/api/documents/folders'
  },
  {
    id: 'documents-download',
    component: 'DocumentItem',
    text: 'Download',
    action: 'download document',
    expectedBehavior: 'Should download file',
    apiEndpoint: '/api/documents/[id]/download'
  },
  {
    id: 'documents-share',
    component: 'DocumentItem',
    text: 'Share',
    action: 'share document',
    expectedBehavior: 'Should open sharing modal',
    apiEndpoint: '/api/documents/[id]/share'
  },
  {
    id: 'documents-delete',
    component: 'DocumentItem',
    text: 'Delete',
    action: 'delete document',
    expectedBehavior: 'Should show confirmation and delete',
    apiEndpoint: '/api/documents/[id]'
  },
  {
    id: 'documents-move',
    component: 'DocumentItem',
    text: 'Move',
    action: 'move document',
    expectedBehavior: 'Should open folder selection modal',
    apiEndpoint: '/api/documents/[id]/move'
  },
  {
    id: 'documents-rename',
    component: 'DocumentItem',
    text: 'Rename',
    action: 'rename document',
    expectedBehavior: 'Should open rename modal',
    apiEndpoint: '/api/documents/[id]/rename'
  },

  // Approvals Page
  {
    id: 'approvals-create',
    component: 'ApprovalsPage',
    text: 'New Request',
    action: 'create approval request',
    expectedBehavior: 'Should open request creation modal',
    apiEndpoint: '/api/approvals'
  },
  {
    id: 'approvals-approve',
    component: 'ApprovalItem',
    text: 'Approve',
    action: 'approve request',
    expectedBehavior: 'Should approve request and update status',
    apiEndpoint: '/api/approvals/[id]/approve'
  },
  {
    id: 'approvals-reject',
    component: 'ApprovalItem',
    text: 'Reject',
    action: 'reject request',
    expectedBehavior: 'Should show rejection reason modal',
    apiEndpoint: '/api/approvals/[id]/reject'
  },
  {
    id: 'approvals-comment',
    component: 'ApprovalItem',
    text: 'Add Comment',
    action: 'add comment',
    expectedBehavior: 'Should add comment to request',
    apiEndpoint: '/api/approvals/[id]/comments'
  },
  {
    id: 'approvals-view-details',
    component: 'ApprovalItem',
    text: 'View Details',
    action: 'view request details',
    expectedBehavior: 'Should open detailed view'
  },

  // Profile Page
  {
    id: 'profile-edit',
    component: 'ProfilePage',
    text: 'Edit Profile',
    action: 'edit profile',
    expectedBehavior: 'Should enable edit mode'
  },
  {
    id: 'profile-save',
    component: 'ProfilePage',
    text: 'Save Changes',
    action: 'save profile changes',
    expectedBehavior: 'Should save profile and show success',
    apiEndpoint: '/api/users/profile'
  },
  {
    id: 'profile-cancel',
    component: 'ProfilePage',
    text: 'Cancel',
    action: 'cancel editing',
    expectedBehavior: 'Should discard changes and exit edit mode'
  },
  {
    id: 'profile-change-password',
    component: 'ProfilePage',
    text: 'Change Password',
    action: 'change password',
    expectedBehavior: 'Should open password change modal',
    apiEndpoint: '/api/users/password'
  },
  {
    id: 'profile-upload-avatar',
    component: 'ProfilePage',
    text: 'Upload Photo',
    action: 'upload avatar',
    expectedBehavior: 'Should open file picker and upload',
    apiEndpoint: '/api/users/avatar'
  },

  // Settings Page
  {
    id: 'settings-notifications',
    component: 'SettingsPage',
    text: 'Save Notification Settings',
    action: 'save notification preferences',
    expectedBehavior: 'Should save notification settings',
    apiEndpoint: '/api/users/settings/notifications'
  },
  {
    id: 'settings-theme',
    component: 'SettingsPage',
    text: 'Apply Theme',
    action: 'change theme',
    expectedBehavior: 'Should apply selected theme'
  },
  {
    id: 'settings-language',
    component: 'SettingsPage',
    text: 'Change Language',
    action: 'change language',
    expectedBehavior: 'Should change app language'
  },
  {
    id: 'settings-export-data',
    component: 'SettingsPage',
    text: 'Export My Data',
    action: 'export user data',
    expectedBehavior: 'Should download user data',
    apiEndpoint: '/api/users/export'
  },
  {
    id: 'settings-delete-account',
    component: 'SettingsPage',
    text: 'Delete Account',
    action: 'delete account',
    expectedBehavior: 'Should show confirmation and delete account',
    apiEndpoint: '/api/users'
  }
];
