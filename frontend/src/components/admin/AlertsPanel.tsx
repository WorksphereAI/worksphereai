// src/components/admin/AlertsPanel.tsx
import React, { useState, useEffect } from 'react';
import {
  Bell,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Info,
  Clock,
  Check,
  Eye
} from 'lucide-react';
import { adminService } from '../../services/adminService';

export const AlertsPanel: React.FC = () => {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAlerts();
  }, []);

  const loadAlerts = async () => {
    try {
      const data = await adminService.getAlerts({ status: 'active' });
      setAlerts(data);
    } catch (error) {
      console.error('Error loading alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  const getAlertIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <XCircle size={16} className="text-red-500" />;
      case 'error':
        return <AlertTriangle size={16} className="text-orange-500" />;
      case 'warning':
        return <AlertTriangle size={16} className="text-yellow-500" />;
      default:
        return <Info size={16} className="text-blue-500" />;
    }
  };

  const getAlertColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-50 border-red-200';
      case 'error':
        return 'bg-orange-50 border-orange-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      default:
        return 'bg-blue-50 border-blue-200';
    }
  };

  const handleAcknowledge = async (alertId: string) => {
    await adminService.acknowledgeAlert(alertId);
    loadAlerts();
  };

  const handleResolve = async (alertId: string) => {
    await adminService.resolveAlert(alertId);
    loadAlerts();
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-12 bg-gray-100 rounded"></div>
            <div className="h-12 bg-gray-100 rounded"></div>
            <div className="h-12 bg-gray-100 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold flex items-center gap-2">
          <Bell size={18} className="text-purple-600" />
          Active Alerts
          {alerts.length > 0 && (
            <span className="px-2 py-0.5 bg-red-100 text-red-600 text-xs rounded-full">
              {alerts.length}
            </span>
          )}
        </h3>
        <button className="text-sm text-purple-600 hover:text-purple-700">
          View All
        </button>
      </div>

      {alerts.length === 0 ? (
        <div className="text-center py-8">
          <CheckCircle size={32} className="mx-auto text-green-500 mb-2" />
          <p className="text-gray-500">No active alerts</p>
          <p className="text-xs text-gray-400 mt-1">All systems are operating normally</p>
        </div>
      ) : (
        <div className="space-y-3">
          {alerts.slice(0, 5).map(alert => (
            <div
              key={alert.id}
              className={`p-3 rounded-lg border ${getAlertColor(alert.severity)}`}
            >
              <div className="flex items-start gap-2">
                {getAlertIcon(alert.severity)}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium">{alert.title}</h4>
                    <span className="text-xs text-gray-500">
                      {new Date(alert.created_at).toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                    {alert.description}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    {alert.status === 'active' && (
                      <>
                        <button
                          onClick={() => handleAcknowledge(alert.id)}
                          className="text-xs px-2 py-1 bg-white rounded border hover:bg-gray-50 flex items-center gap-1"
                        >
                          <Check size={12} />
                          Acknowledge
                        </button>
                        <button
                          onClick={() => handleResolve(alert.id)}
                          className="text-xs px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                        >
                          Resolve
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {alerts.length > 5 && (
            <div className="text-center text-sm text-gray-500 pt-2">
              +{alerts.length - 5} more alerts
            </div>
          )}
        </div>
      )}
    </div>
  );
};
