import React, { useState } from 'react';
import { Settings as SettingsIcon, Bell, Shield, Smartphone, Database, Download, AlertTriangle } from 'lucide-react';

const Settings: React.FC = () => {
  const [settings, setSettings] = useState({
    notifications: {
      healthAlerts: true,
      dailyReports: true,
      anomalyDetection: true,
      goalReminders: true,
      lowBattery: true
    },
    privacy: {
      dataSharing: false,
      analytics: true,
      crashReports: true,
      locationTracking: false
    },
    device: {
      autoSync: true,
      syncInterval: '5min',
      batteryOptimization: true,
      backgroundUpdates: true
    },
    thresholds: {
      heartRateMin: 60,
      heartRateMax: 100,
      bloodOxygenMin: 95,
      stepsGoal: 10000
    }
  });

  const handleSettingChange = (category: string, setting: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [setting]: value
      }
    }));
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-blue-100 rounded-lg">
            <SettingsIcon className="h-8 w-8 text-blue-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Settings</h2>
            <p className="text-gray-600">Customize your health monitoring experience</p>
          </div>
        </div>
      </div>

      {/* Notification Settings */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center space-x-3 mb-6">
          <Bell className="h-6 w-6 text-blue-600" />
          <h3 className="text-xl font-semibold text-gray-900">Notifications</h3>
        </div>
        
        <div className="space-y-4">
          {Object.entries(settings.notifications).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
              <div>
                <h4 className="font-medium text-gray-900 capitalize">
                  {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                </h4>
                <p className="text-sm text-gray-600">
                  {key === 'healthAlerts' && 'Receive alerts for unusual health readings'}
                  {key === 'dailyReports' && 'Get daily summaries of your health data'}
                  {key === 'anomalyDetection' && 'Instant alerts when AI detects anomalies'}
                  {key === 'goalReminders' && 'Reminders to help you meet your health goals'}
                  {key === 'lowBattery' && 'Notifications when device battery is low'}
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={value as boolean}
                  onChange={(e) => handleSettingChange('notifications', key, e.target.checked)}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Privacy Settings */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center space-x-3 mb-6">
          <Shield className="h-6 w-6 text-green-600" />
          <h3 className="text-xl font-semibold text-gray-900">Privacy & Security</h3>
        </div>
        
        <div className="space-y-4">
          {Object.entries(settings.privacy).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
              <div>
                <h4 className="font-medium text-gray-900 capitalize">
                  {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                </h4>
                <p className="text-sm text-gray-600">
                  {key === 'dataSharing' && 'Share anonymized data for research purposes'}
                  {key === 'analytics' && 'Help improve the app by sharing usage analytics'}
                  {key === 'crashReports' && 'Automatically send crash reports to developers'}
                  {key === 'locationTracking' && 'Allow location-based health insights'}
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={value as boolean}
                  onChange={(e) => handleSettingChange('privacy', key, e.target.checked)}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Device Settings */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center space-x-3 mb-6">
          <Smartphone className="h-6 w-6 text-purple-600" />
          <h3 className="text-xl font-semibold text-gray-900">Device & Sync</h3>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-gray-100">
            <div>
              <h4 className="font-medium text-gray-900">Auto Sync</h4>
              <p className="text-sm text-gray-600">Automatically sync data from your wearable device</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={settings.device.autoSync}
                onChange={(e) => handleSettingChange('device', 'autoSync', e.target.checked)}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between py-3 border-b border-gray-100">
            <div>
              <h4 className="font-medium text-gray-900">Sync Interval</h4>
              <p className="text-sm text-gray-600">How often to sync data from your device</p>
            </div>
            <select
              value={settings.device.syncInterval}
              onChange={(e) => handleSettingChange('device', 'syncInterval', e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-1"
            >
              <option value="1min">1 minute</option>
              <option value="5min">5 minutes</option>
              <option value="15min">15 minutes</option>
              <option value="30min">30 minutes</option>
              <option value="1hour">1 hour</option>
            </select>
          </div>

          <div className="flex items-center justify-between py-3 border-b border-gray-100">
            <div>
              <h4 className="font-medium text-gray-900">Battery Optimization</h4>
              <p className="text-sm text-gray-600">Optimize battery usage on your device</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={settings.device.batteryOptimization}
                onChange={(e) => handleSettingChange('device', 'batteryOptimization', e.target.checked)}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between py-3">
            <div>
              <h4 className="font-medium text-gray-900">Background Updates</h4>
              <p className="text-sm text-gray-600">Allow app to update in the background</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={settings.device.backgroundUpdates}
                onChange={(e) => handleSettingChange('device', 'backgroundUpdates', e.target.checked)}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Health Thresholds */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center space-x-3 mb-6">
          <AlertTriangle className="h-6 w-6 text-orange-600" />
          <h3 className="text-xl font-semibold text-gray-900">Health Alert Thresholds</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Heart Rate Range</label>
            <div className="flex items-center space-x-2">
              <input
                type="number"
                value={settings.thresholds.heartRateMin}
                onChange={(e) => handleSettingChange('thresholds', 'heartRateMin', parseInt(e.target.value))}
                className="w-20 border border-gray-300 rounded-lg px-3 py-2"
              />
              <span className="text-sm text-gray-600">-</span>
              <input
                type="number"
                value={settings.thresholds.heartRateMax}
                onChange={(e) => handleSettingChange('thresholds', 'heartRateMax', parseInt(e.target.value))}
                className="w-20 border border-gray-300 rounded-lg px-3 py-2"
              />
              <span className="text-sm text-gray-600">bpm</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Blood Oxygen Minimum</label>
            <div className="flex items-center space-x-2">
              <input
                type="number"
                value={settings.thresholds.bloodOxygenMin}
                onChange={(e) => handleSettingChange('thresholds', 'bloodOxygenMin', parseInt(e.target.value))}
                className="w-20 border border-gray-300 rounded-lg px-3 py-2"
              />
              <span className="text-sm text-gray-600">%</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Daily Steps Goal</label>
            <div className="flex items-center space-x-2">
              <input
                type="number"
                value={settings.thresholds.stepsGoal}
                onChange={(e) => handleSettingChange('thresholds', 'stepsGoal', parseInt(e.target.value))}
                className="w-32 border border-gray-300 rounded-lg px-3 py-2"
              />
              <span className="text-sm text-gray-600">steps</span>
            </div>
          </div>
        </div>
      </div>

      {/* Data Management */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center space-x-3 mb-6">
          <Database className="h-6 w-6 text-gray-600" />
          <h3 className="text-xl font-semibold text-gray-900">Data Management</h3>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-gray-100">
            <div>
              <h4 className="font-medium text-gray-900">Export Health Data</h4>
              <p className="text-sm text-gray-600">Download all your health data as a CSV file</p>
            </div>
            <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <Download className="h-4 w-4" />
              <span>Export</span>
            </button>
          </div>

          <div className="flex items-center justify-between py-3 border-b border-gray-100">
            <div>
              <h4 className="font-medium text-gray-900">Data Retention</h4>
              <p className="text-sm text-gray-600">Keep health data for 2 years automatically</p>
            </div>
            <span className="text-sm text-gray-600">2 years</span>
          </div>

          <div className="flex items-center justify-between py-3">
            <div>
              <h4 className="font-medium text-gray-900 text-red-600">Clear All Data</h4>
              <p className="text-sm text-gray-600">Permanently delete all your health data</p>
            </div>
            <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
              Clear Data
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;