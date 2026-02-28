// src/components/admin/QuickActions.tsx
import React from 'react';
import {
  Users,
  CreditCard,
  Bell,
  Shield,
  Settings,
  Mail,
  FileText,
  BarChart3,
  Download,
  RefreshCw,
  PlusCircle,
  AlertTriangle
} from 'lucide-react';

export const QuickActions: React.FC = () => {
  const actions = [
    {
      label: 'Add Customer',
      icon: <Users size={18} />,
      color: 'bg-blue-500',
      onClick: () => console.log('Add customer')
    },
    {
      label: 'Create Invoice',
      icon: <CreditCard size={18} />,
      color: 'bg-green-500',
      onClick: () => console.log('Create invoice')
    },
    {
      label: 'Send Announcement',
      icon: <Mail size={18} />,
      color: 'bg-purple-500',
      onClick: () => console.log('Send announcement')
    },
    {
      label: 'System Check',
      icon: <Shield size={18} />,
      color: 'bg-orange-500',
      onClick: () => console.log('System check')
    },
    {
      label: 'Generate Report',
      icon: <BarChart3 size={18} />,
      color: 'bg-indigo-500',
      onClick: () => console.log('Generate report')
    },
    {
      label: 'Maintenance Mode',
      icon: <Settings size={18} />,
      color: 'bg-gray-500',
      onClick: () => console.log('Maintenance mode')
    }
  ];

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="font-semibold mb-4">Quick Actions</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {actions.map((action, index) => (
          <button
            key={index}
            onClick={action.onClick}
            className="flex flex-col items-center p-4 rounded-lg border border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition group"
            title={action.label}
          >
            <div className={`w-10 h-10 ${action.color} rounded-lg flex items-center justify-center text-white mb-2 group-hover:scale-110 transition`}>
              {action.icon}
            </div>
            <span className="text-xs text-gray-600 group-hover:text-purple-600">
              {action.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};
