import React from 'react';
import { AlertTriangle, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { useRealTimeHealthData } from '../hooks/useRealTimeHealthData';

interface Alert {
  id: string;
  type: 'critical' | 'warning' | 'info';
  title: string;
  description: string;
  timestamp: Date;
  value?: number;
  metric?: string;
  recommendation?: string;
  isRead: boolean;
}

interface AlertPanelProps {
  alerts: Alert[];
}

const AlertPanel: React.FC<AlertPanelProps> = ({ alerts }) => {
  const { markAlertAsRead } = useRealTimeHealthData();

  const unreadAlerts = alerts.filter(alert => !alert.isRead);

  if (unreadAlerts.length === 0) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-xl p-6">
        <div className="flex items-center space-x-3">
          <CheckCircle className="h-6 w-6 text-green-600" />
          <div>
            <h3 className="text-lg font-semibold text-green-900">All Systems Normal</h3>
            <p className="text-green-700">No health anomalies detected. Your vitals are within normal ranges.</p>
          </div>
        </div>
      </div>
    );
  }

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'critical':
        return <AlertTriangle className="h-6 w-6 text-red-600" />;
      case 'warning':
        return <AlertCircle className="h-6 w-6 text-yellow-600" />;
      default:
        return <AlertCircle className="h-6 w-6 text-blue-600" />;
    }
  };

  const getAlertStyles = (type: string) => {
    switch (type) {
      case 'critical':
        return 'bg-red-50 border-red-200 text-red-900';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-900';
      default:
        return 'bg-blue-50 border-blue-200 text-blue-900';
    }
  };

  const getTimeAgo = (timestamp: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - timestamp.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
        <AlertTriangle className="h-5 w-5 text-orange-600" />
        <span>Health Alerts ({unreadAlerts.length})</span>
      </h3>
      
      {unreadAlerts.map((alert) => (
        <div
          key={alert.id}
          className={`border rounded-xl p-4 ${getAlertStyles(alert.type)} animate-pulse-once`}
        >
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0 mt-1">
              {getAlertIcon(alert.type)}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-lg">{alert.title}</h4>
                <div className="flex items-center space-x-2 text-sm opacity-75">
                  <Clock className="h-4 w-4" />
                  <span>{getTimeAgo(alert.timestamp)}</span>
                </div>
              </div>
              
              <p className="mb-3">{alert.description}</p>
              
              {alert.value && alert.metric && (
                <div className="mb-3 p-3 bg-white/50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Detected Value:</span>
                    <span className="font-bold text-lg">
                      {alert.value} {alert.metric === 'heart_rate' ? 'bpm' : 
                                     alert.metric === 'blood_oxygen' ? '%' : 
                                     alert.metric === 'blood_pressure' ? 'mmHg' : ''}
                    </span>
                  </div>
                </div>
              )}
              
              {alert.recommendation && (
                <div className="bg-white/50 rounded-lg p-3">
                  <h5 className="font-medium mb-1">AI Recommendation:</h5>
                  <p className="text-sm">{alert.recommendation}</p>
                </div>
              )}
              
              <div className="flex items-center space-x-3 mt-4">
                <button 
                  onClick={() => markAlertAsRead(alert.id)}
                  className="px-4 py-2 bg-white text-gray-800 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Mark as Read
                </button>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
                  View Details
                </button>
                {alert.type === 'critical' && (
                  <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium">
                    Contact Doctor
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AlertPanel;