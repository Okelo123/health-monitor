import React, { useState } from 'react';
import { Smartphone, Watch, Activity, Wifi, WifiOff, Plus, Settings, Trash2, RefreshCw } from 'lucide-react';
import { useDeviceIntegration } from '../hooks/useDeviceIntegration';

const DeviceManager: React.FC = () => {
  const {
    connectedDevices,
    availableDevices,
    isScanning,
    scanForDevices,
    connectDevice,
    disconnectDevice,
    connectFitbit,
    connectAppleHealth,
    connectGoogleFit,
    addManualReading,
  } = useDeviceIntegration();

  const [showManualEntry, setShowManualEntry] = useState(false);
  const [manualData, setManualData] = useState({
    heartRate: '',
    bloodOxygen: '',
    systolic: '',
    diastolic: '',
    steps: '',
  });

  const getDeviceIcon = (type: string) => {
    switch (type) {
      case 'smartwatch':
        return Watch;
      case 'fitness_tracker':
        return Activity;
      case 'blood_pressure_monitor':
        return Activity;
      default:
        return Smartphone;
    }
  };

  const handleManualEntry = async () => {
    const data = {
      heartRate: parseInt(manualData.heartRate) || undefined,
      bloodOxygen: parseInt(manualData.bloodOxygen) || undefined,
      bloodPressure: manualData.systolic && manualData.diastolic ? {
        systolic: parseInt(manualData.systolic),
        diastolic: parseInt(manualData.diastolic),
      } : undefined,
      steps: parseInt(manualData.steps) || undefined,
      timestamp: new Date(),
    };

    const { error } = await addManualReading(data);
    
    if (!error) {
      setShowManualEntry(false);
      setManualData({
        heartRate: '',
        bloodOxygen: '',
        systolic: '',
        diastolic: '',
        steps: '',
      });
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Device Management</h2>
            <p className="text-gray-600 mt-1">Connect and manage your health monitoring devices</p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowManualEntry(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>Manual Entry</span>
            </button>
            <button
              onClick={scanForDevices}
              disabled={isScanning}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${isScanning ? 'animate-spin' : ''}`} />
              <span>{isScanning ? 'Scanning...' : 'Scan Devices'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Connected Devices */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-6">Connected Devices</h3>
        
        {connectedDevices.length === 0 ? (
          <div className="text-center py-8">
            <Smartphone className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No devices connected yet</p>
            <p className="text-sm text-gray-500 mt-1">Scan for devices or connect manually</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {connectedDevices.map((device) => {
              const IconComponent = getDeviceIcon(device.deviceType);
              return (
                <div key={device.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${device.isActive ? 'bg-green-100' : 'bg-gray-100'}`}>
                        <IconComponent className={`h-6 w-6 ${device.isActive ? 'text-green-600' : 'text-gray-400'}`} />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">{device.deviceName}</h4>
                        <p className="text-sm text-gray-600">{device.manufacturer}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1">
                      {device.isActive ? (
                        <Wifi className="h-4 w-4 text-green-500" />
                      ) : (
                        <WifiOff className="h-4 w-4 text-gray-400" />
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Status:</span>
                      <span className={device.isActive ? 'text-green-600 font-medium' : 'text-gray-500'}>
                        {device.isActive ? 'Connected' : 'Disconnected'}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Last Sync:</span>
                      <span className="text-gray-900">
                        {device.lastSync ? device.lastSync.toLocaleTimeString() : 'Never'}
                      </span>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <button className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                      <Settings className="h-4 w-4" />
                      <span className="text-sm">Settings</span>
                    </button>
                    <button
                      onClick={() => disconnectDevice(device.deviceId)}
                      className="flex items-center justify-center px-3 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Available Devices */}
      {availableDevices.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Available Devices</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {availableDevices.map((device) => {
              const IconComponent = getDeviceIcon(device.type);
              return (
                <div key={device.id} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <IconComponent className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{device.name}</h4>
                      <p className="text-sm text-gray-600">{device.manufacturer}</p>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <p className="text-sm text-gray-600 mb-2">Capabilities:</p>
                    <div className="flex flex-wrap gap-1">
                      {device.capabilities.map((capability: string) => (
                        <span
                          key={capability}
                          className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                        >
                          {capability.replace('_', ' ')}
                        </span>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => connectDevice(device)}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Connect Device
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Platform Integrations */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-6">Platform Integrations</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <button
            onClick={connectFitbit}
            className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
          >
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Activity className="h-6 w-6 text-green-600" />
            </div>
            <div className="text-left">
              <h4 className="font-semibold text-gray-900">Fitbit</h4>
              <p className="text-sm text-gray-600">Connect your Fitbit account</p>
            </div>
          </button>

          <button
            onClick={connectAppleHealth}
            className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
          >
            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
              <Heart className="h-6 w-6 text-gray-600" />
            </div>
            <div className="text-left">
              <h4 className="font-semibold text-gray-900">Apple Health</h4>
              <p className="text-sm text-gray-600">Sync with Apple Health app</p>
            </div>
          </button>

          <button
            onClick={connectGoogleFit}
            className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
          >
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Activity className="h-6 w-6 text-blue-600" />
            </div>
            <div className="text-left">
              <h4 className="font-semibold text-gray-900">Google Fit</h4>
              <p className="text-sm text-gray-600">Connect Google Fit data</p>
            </div>
          </button>
        </div>
      </div>

      {/* Manual Entry Modal */}
      {showManualEntry && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Manual Health Data Entry</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Heart Rate (bpm)</label>
                <input
                  type="number"
                  value={manualData.heartRate}
                  onChange={(e) => setManualData({ ...manualData, heartRate: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  placeholder="72"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Blood Oxygen (%)</label>
                <input
                  type="number"
                  value={manualData.bloodOxygen}
                  onChange={(e) => setManualData({ ...manualData, bloodOxygen: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  placeholder="98"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Systolic BP</label>
                  <input
                    type="number"
                    value={manualData.systolic}
                    onChange={(e) => setManualData({ ...manualData, systolic: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    placeholder="120"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Diastolic BP</label>
                  <input
                    type="number"
                    value={manualData.diastolic}
                    onChange={(e) => setManualData({ ...manualData, diastolic: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    placeholder="80"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Steps</label>
                <input
                  type="number"
                  value={manualData.steps}
                  onChange={(e) => setManualData({ ...manualData, steps: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  placeholder="8500"
                />
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowManualEntry(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleManualEntry}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Add Reading
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeviceManager;