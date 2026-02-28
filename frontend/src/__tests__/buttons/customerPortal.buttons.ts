export const customerPortalButtons = [
  {
    id: 'customer-new-ticket',
    component: 'CustomerDashboard',
    text: 'New Ticket',
    action: 'create support ticket',
    expectedBehavior: 'Should open ticket creation form',
    apiEndpoint: '/api/customer/tickets'
  },
  {
    id: 'customer-view-ticket',
    component: 'TicketList',
    text: 'View Details',
    action: 'view ticket details',
    expectedBehavior: 'Should open ticket detail view'
  },
  {
    id: 'customer-reply-ticket',
    component: 'TicketDetail',
    text: 'Reply',
    action: 'reply to ticket',
    expectedBehavior: 'Should add reply to ticket',
    apiEndpoint: '/api/customer/tickets/[id]/reply'
  },
  {
    id: 'customer-close-ticket',
    component: 'TicketDetail',
    text: 'Close Ticket',
    action: 'close ticket',
    expectedBehavior: 'Should close ticket',
    apiEndpoint: '/api/customer/tickets/[id]/close'
  },
  {
    id: 'customer-download-invoice',
    component: 'InvoicesList',
    text: 'Download',
    action: 'download invoice',
    expectedBehavior: 'Should download invoice PDF',
    apiEndpoint: '/api/customer/invoices/[id]/download'
  },
  {
    id: 'customer-view-document',
    component: 'DocumentsList',
    text: 'View',
    action: 'view document',
    expectedBehavior: 'Should open document viewer'
  },
  {
    id: 'customer-search-knowledge',
    component: 'KnowledgeBase',
    text: 'Search',
    action: 'search knowledge base',
    expectedBehavior: 'Should search and display results'
  },
  {
    id: 'customer-rate-article',
    component: 'KnowledgeBaseArticle',
    text: 'Helpful',
    action: 'rate article helpful',
    expectedBehavior: 'Should mark article as helpful',
    apiEndpoint: '/api/customer/kb/[id]/rate'
  }
];
