// src/components/admin/MetricsOverview.tsx
import React from 'react';
import {
  Users,
  Building2,
  CreditCard,
  TrendingUp,
  DollarSign,
  Activity,
  Clock,
  AlertCircle
} from 'lucide-react';
import type { AdminMetrics } from '../../services/adminService';

interface MetricsOverviewProps {
  metrics: AdminMetrics;
}

export const MetricsOverview: React.FC<MetricsOverviewProps> = ({ metrics }) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-RW', {
      style: 'currency',
      currency: 'RWF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat().format(value);
  };

  const cards = [
    {
      title: 'Total Users',
      value: formatNumber(metrics.overview.totalUsers),
      change: '+12%',
      icon: <Users className="text-blue-600" size={24} />,
      bg: 'bg-blue-50'
    },
    {
      title: 'Active Organizations',
      value: formatNumber(metrics.overview.totalOrganizations),
      change: '+8%',
      icon: <Building2 className="text-green-600" size={24} />,
      bg: 'bg-green-50'
    },
    {
      title: 'Monthly Revenue',
      value: formatCurrency(metrics.overview.mrr),
      change: '+15%',
      icon: <DollarSign className="text-purple-600" size={24} />,
      bg: 'bg-purple-50'
    },
    {
      title: 'Paid Organizations',
      value: formatNumber(metrics.overview.paidOrganizations),
      change: '+10%',
      icon: <CreditCard className="text-orange-600" size={24} />,
      bg: 'bg-orange-50'
    },
    {
      title: 'Trial Organizations',
      value: formatNumber(metrics.overview.trialOrganizations),
      change: '+5%',
      icon: <Clock className="text-yellow-600" size={24} />,
      bg: 'bg-yellow-50'
    },
    {
      title: 'Churn Rate',
      value: `${metrics.overview.churnRate.toFixed(1)}%`,
      change: '-2%',
      icon: <TrendingUp className="text-red-600" size={24} />,
      bg: 'bg-red-50',
      inverse: true
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {cards.map((card, index) => (
        <div key={index} className={`${card.bg} rounded-lg p-4`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600 text-sm">{card.title}</span>
            {card.icon}
          </div>
          <div className="text-2xl font-bold text-gray-900">{card.value}</div>
          <div className={`text-sm mt-1 ${
            card.change.startsWith('+') 
              ? card.inverse ? 'text-red-500' : 'text-green-500'
              : 'text-red-500'
          }`}>
            {card.change} from last month
          </div>
        </div>
      ))}
    </div>
  );
};
