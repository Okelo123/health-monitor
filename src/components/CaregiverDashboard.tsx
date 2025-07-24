import React, { useState } from 'react';
import { Users, AlertTriangle, Heart, Activity, Phone, Mail, Shield, Plus } from 'lucide-react';
import { useCaregiverAccess } from '../hooks/useCaregiverAccess';

const CaregiverDashboard: React.FC = () => {
  const {
    patients,
    caregiverAccess,
    loading,
    grantCaregiverAccess,
    revokeCaregiverAccess,
    sendEmergencyAlert,
  } = useCaregiverAccess();

  const [showAddCaregiver, setShowAddCaregiver] = useState(false);
  const [caregiverEmail, setCaregiverEmail] = useState('');
  const [accessLevel, setAccessLevel] = useState<'view' | 'monitor' | 'emergency'>('view');
  const [selectedPatient, setSelectedPatient] = useState<string | null>(null);

  const handleAddCaregiver = async () => {
    const { error } = await grantCaregiverAccess(caregiverEmail, accessLevel);
    if (!error) {
      setShowAddCaregiver(false);
      setCaregiverEmail('');
    }
  };

  const getStatusColor = (lastUpdate: Date) => {
    const now = new Date();
    const diffMinutes = (now.getTime() - lastUpdate.getTime()) / (1000 * 60);
    
    if (diffMinutes < 10) return 'text-green-600';
    if (diffMinutes < 30) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getAlertCount = (alerts: any[]) => {
    return alerts.filter(alert => alert.alert_type === 'critical').length;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Users className="h-8 w-8 text-blue-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Caregiver Dashboard</h2>
              <p className="text-gray-600">Monitor and manage patient health data</p>
            </div>
          </div>
          <button
            onClick={() => setShowAddCaregiver(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Add Caregiver Access</span>
          </button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <Users className="h-6 w-6 text-blue-600" />
              <div>
                <p className="text-sm text-blue-600">Total Patients</p>
                <p className="text-2xl font-bold text-blue-900">{patients.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-red-50 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <AlertTriangle className="h-6 w-6 text-red-600" />
              <div>
                <p className="text-sm text-red-600">Critical Alerts</p>
                <p className="text-2xl font-bold text-red-900">
                  {patients.reduce((sum, patient) => sum + getAlertCount(patient.recentAlerts), 0)}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <Heart className="h-6 w-6 text-green-600" />
              <div>
                <p className="text-sm text-green-600">Active Monitoring</p>
                <p className="text-2xl font-bold text-green-900">
                  {patients.filter(p => {
                    const diffMinutes = (new Date().getTime() - p.lastUpdate.getTime()) / (1000 * 60);
                    return diffMinutes < 30;
                  }).length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-purple-50 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <Shield className="h-6 w-6 text-purple-600" />
              <div>
                <p className="text-sm text-purple-600">Access Granted</p>
                <p className="text-2xl font-bold text-purple-900">{caregiverAccess.length}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Patient List */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-6">Patient Overview</h3>
        
        {patients.length === 0 ? (
          <div className="text-center py-8">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No patients under your care</p>
            <p className="text-sm text-gray-500 mt-1">Patients need to grant you access to their health data</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {patients.map((patient) => (
              <div key={patient.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900">{patient.name}</h4>
                    <p className="text-sm text-gray-600">{patient.email}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${getStatusColor(patient.lastUpdate).replace('text-', 'bg-')}`}></div>
                    <span className={`text-xs font-medium ${getStatusColor(patient.lastUpdate)}`}>
                      {(() => {
                        const diffMinutes = (new Date().getTime() - patient.lastUpdate.getTime()) / (1000 * 60);
                        if (diffMinutes < 10) return 'Live';
                        if (diffMinutes < 60) return `${Math.round(diffMinutes)}m ago`;
                        return `${Math.round(diffMinutes / 60)}h ago`;
                      })()}
                    </span>
                  </div>
                </div>

                {/* Current Metrics */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center space-x-2">
                      <Heart className="h-4 w-4 text-red-500" />
                      <span className="text-sm text-gray-600">Heart Rate</span>
                    </div>
                    <p className="text-lg font-semibold text-gray-900">{patient.currentMetrics.heartRate} bpm</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center space-x-2">
                      <Activity className="h-4 w-4 text-blue-500" />
                      <span className="text-sm text-gray-600">Blood Pressure</span>
                    </div>
                    <p className="text-lg font-semibold text-gray-900">
                      {patient.currentMetrics.bloodPressureSystolic}/{patient.currentMetrics.bloodPressureDiastolic}
                    </p>
                  </div>
                </div>

                {/* Recent Alerts */}
                {patient.recentAlerts.length > 0 && (
                  <div className="mb-4">
                    <h5 className="text-sm font-medium text-gray-700 mb-2">Recent Alerts</h5>
                    <div className="space-y-2">
                      {patient.recentAlerts.slice(0, 2).map((alert, index) => (
                        <div key={index} className={`p-2 rounded-lg text-xs ${
                          alert.alert_type === 'critical' ? 'bg-red-50 text-red-700' :
                          alert.alert_type === 'warning' ? 'bg-yellow-50 text-yellow-700' :
                          'bg-blue-50 text-blue-700'
                        }`}>
                          {alert.title}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex space-x-2">
                  <button
                    onClick={() => setSelectedPatient(patient.id)}
                    className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    View Details
                  </button>
                  <button className="px-3 py-2 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50 transition-colors">
                    <Phone className="h-4 w-4" />
                  </button>
                  <button className="px-3 py-2 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50 transition-colors">
                    <Mail className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Access Management */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-6">Access Management</h3>
        
        {caregiverAccess.length === 0 ? (
          <div className="text-center py-8">
            <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No caregiver access granted</p>
          </div>
        ) : (
          <div className="space-y-4">
            {caregiverAccess.map((access) => (
              <div key={access.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div>
                  <h4 className="font-medium text-gray-900">{access.patientName}</h4>
                  <p className="text-sm text-gray-600">Access Level: {access.accessLevel}</p>
                  <p className="text-xs text-gray-500">Granted: {access.createdAt.toLocaleDateString()}</p>
                </div>
                <button
                  onClick={() => revokeCaregiverAccess(access.id)}
                  className="px-3 py-1 text-sm text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
                >
                  Revoke Access
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Caregiver Modal */}
      {showAddCaregiver && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Grant Caregiver Access</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Caregiver Email</label>
                <input
                  type="email"
                  value={caregiverEmail}
                  onChange={(e) => setCaregiverEmail(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  placeholder="caregiver@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Access Level</label>
                <select
                  value={accessLevel}
                  onChange={(e) => setAccessLevel(e.target.value as 'view' | 'monitor' | 'emergency')}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                >
                  <option value="view">View Only - Can see health data</option>
                  <option value="monitor">Monitor - Can see data and receive alerts</option>
                  <option value="emergency">Emergency - Full access including emergency contacts</option>
                </select>
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowAddCaregiver(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddCaregiver}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Grant Access
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CaregiverDashboard;