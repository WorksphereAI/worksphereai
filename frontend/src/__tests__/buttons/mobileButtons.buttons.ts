export const mobileButtons = [
  {
    id: 'mobile-hamburger-menu',
    component: 'MobileNavigation',
    text: 'Menu',
    action: 'open mobile menu',
    expectedBehavior: 'Should slide open navigation menu'
  },
  {
    id: 'mobile-close-menu',
    component: 'MobileNavigation',
    text: 'Close',
    action: 'close mobile menu',
    expectedBehavior: 'Should slide close navigation menu'
  },
  {
    id: 'mobile-back-button',
    component: 'MobileHeader',
    text: 'Back',
    action: 'go back',
    expectedBehavior: 'Should navigate to previous page'
  },
  {
    id: 'mobile-search',
    component: 'MobileHeader',
    text: 'Search',
    action: 'open search',
    expectedBehavior: 'Should open search overlay'
  },
  {
    id: 'mobile-fab-create',
    component: 'MobileDashboard',
    text: 'Create',
    action: 'open create menu',
    expectedBehavior: 'Should show floating action menu'
  },
  {
    id: 'mobile-bottom-nav-home',
    component: 'BottomNavigation',
    text: 'Home',
    action: 'navigate home',
    expectedBehavior: 'Should navigate to home'
  },
  {
    id: 'mobile-bottom-nav-messages',
    component: 'BottomNavigation',
    text: 'Messages',
    action: 'navigate to messages',
    expectedBehavior: 'Should navigate to messages',
    badge: true
  },
  {
    id: 'mobile-bottom-nav-tasks',
    component: 'BottomNavigation',
    text: 'Tasks',
    action: 'navigate to tasks',
    expectedBehavior: 'Should navigate to tasks',
    badge: true
  },
  {
    id: 'mobile-bottom-nav-profile',
    component: 'BottomNavigation',
    text: 'Profile',
    action: 'navigate to profile',
    expectedBehavior: 'Should navigate to profile'
  },
  {
    id: 'mobile-pull-to-refresh',
    component: 'MobileList',
    text: 'Pull to Refresh',
    action: 'refresh data',
    expectedBehavior: 'Should reload data when pulled down',
    apiEndpoint: '/api/refresh'
  },
  {
    id: 'mobile-swipe-to-delete',
    component: 'MobileList',
    text: 'Swipe to Delete',
    action: 'delete item',
    expectedBehavior: 'Should show delete option on swipe',
    apiEndpoint: '/api/items/[id]'
  },
  {
    id: 'mobile-long-press',
    component: 'MobileList',
    text: 'Long Press',
    action: 'show context menu',
    expectedBehavior: 'Should show context menu on long press'
  }
];
