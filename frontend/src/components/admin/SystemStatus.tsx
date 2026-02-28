// src/components/admin/SystemStatus.tsx
import React, { useState } from 'react';
import {
  Activity,
  Server,
  Database,
  Globe,
  Shield,
  Clock,
  CheckCircle,
  AlertTriangle,
  XCircle
} from 'lucide-react';
import type { SystemHealth } from '../../services/adminService';

interface SystemStatusProps {
  health: SystemHealth;
}

export const SystemStatus: React.FC<SystemStatusProps> = ({ health }) => {
  const [expanded, setExpanded] = useState(false);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle size={16} className="text-green-500" />;
      case 'degraded':
        return <AlertTriangle size={16} className="text-yellow-500" />;
      case 'down':
        return <XCircle size={16} className="text-red-500" />;
      default:
        return <AlertTriangle size={16} className="text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'text-green-600 bg-green-50';
      case 'degraded':
        return 'text-yellow-600 bg-yellow-50';
      case 'down':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold flex items-center gap-2">
          <Activity size={18} className="text-purple-600" />
          System Status
        </h3>
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-sm text-purple-600 hover:text-purple-700"
        >
          {expanded ? 'Show Less' : 'View Details'}
        </button>
      </div>

      {/* Overall Status */}
      <div className={`p-4 rounded-lg mb-4 ${getStatusColor(health.status)}`}>
        <div className="flex items-center justify-between">
          <div>
            <div className="font-medium capitalize">System {health.status}</div>
            <div className="text-sm opacity-75 mt-1">
              {health.services.filter(s => s.status === 'healthy').length} of {health.services.length} services operational
            </div>
          </div>
          {getStatusIcon(health.status)}
        </div>
      </div>

      {/* Service List */}
      <div className="space-y-3">
        {health.services.slice(0, expanded ? undefined : 3).map((service, index) => (
          <div key={index} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {service.name === 'API' && <Globe size={14} className="text-gray-400" />}
              {service.name === 'Database' && <Database size={14} className="text-gray-400" />}
              {service.name === 'Storage' && <Server size={14} className="text-gray-400" />}
              {service.name === 'Auth' && <Shield size={14} className="text-gray-400" />}
              {service.name === 'Realtime' && <Clock size={14} className="text-gray-400" />}
              <span className="text-sm">{service.name}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-gray-500">{service.latency}ms</span>
              {getStatusIcon(service.status)}
            </div>
          </div>
        ))}
      </div>

      {/* Active Alerts */}
      {health.alerts.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center gap-2 text-sm text-red-600 mb-2">
            <AlertTriangle size={14} />
            <span className="font-medium">Active Alerts ({health.alerts.length})</span>
          </div>
          <div className="space-y-2">
            {health.alerts.slice(0, 2).map(alert => (
              <div key={alert.id} className="text-xs bg-red-50 text-red-700 p-2 rounded">
                <div className="font-medium">{alert.title}</div>
                <div className="text-red-500 mt-1">{new Date(alert.timestamp).toLocaleTimeString()}</div>
              </div>
            ))}
            {health.alerts.length > 2 && (
              <div className="text-xs text-gray-500 text-center">
                +{health.alerts.length - 2} more alerts
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
