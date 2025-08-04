import React, { useState, useEffect } from 'react';
import { Heart, Droplets, Activity, AlertTriangle, TrendingUp, Clock, Gauge } from 'lucide-react';
import { useRealTimeHealthData } from '../hooks/useRealTimeHealthData';
import HealthChart from './HealthChart';
import AlertPanel from './AlertPanel';

const Dashboard: React.FC = () => {
  const { currentMetrics, healthHistory, alerts, isConnected } = useRealTimeHealthData();
  const [timeRange, setTimeRange] = useState('24h');

  const metrics = [
    {
      title: 'Heart Rate',
      value: currentMetrics.heartRate,
      unit: 'bpm',
      icon: Heart,
      color: 'text-red-500',
      bgColor: 'bg-red-50',
      status: currentMetrics.heartRate > 100 || currentMetrics.heartRate < 60 ? 'warning' : 'normal',
      trend: '+2.3%'
    },
    {
      title: 'Blood Pressure',
      value: `${currentMetrics.bloodPressureSystolic}/${currentMetrics.bloodPressureDiastolic}`,
      unit: 'mmHg',
      icon: Gauge,
      color: 'text-purple-500',
      bgColor: 'bg-purple-50',
      status: currentMetrics.bloodPressureSystolic > 140 || currentMetrics.bloodPressureDiastolic > 90 ? 'critical' : 'normal',
      trend: '+1.2%'
    },
    {
      title: 'Blood Oxygen',
      value: currentMetrics.bloodOxygen,
      unit: '%',
      icon: Droplets,
      color: 'text-blue-500',
      bgColor: 'bg-blue-50',
      status: currentMetrics.bloodOxygen < 95 ? 'critical' : 'normal',
      trend: '-0.5%'
    },
    {
      title: 'Activity Level',
      value: currentMetrics.activityLevel,
      unit: 'steps',
      icon: Activity,
      color: 'text-green-500',
      bgColor: 'bg-green-50',
      status: 'normal',
      trend: '+15.2%'
    },
    {
      title: 'Sleep Quality',
      value: currentMetrics.sleepQuality,
      unit: '/100',
      icon: Clock,
      color: 'text-purple-500',
      bgColor: 'bg-purple-50',
      status: currentMetrics.sleepQuality < 70 ? 'warning' : 'normal',
      trend: '+5.1%'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Real-time Status */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Real-time Health Status</h2>
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full animate-pulse ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="text-sm text-gray-600">
              {isConnected ? 'Live monitoring active' : 'Device disconnected'}
            </span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {metrics.map((metric, index) => {
            const IconComponent = metric.icon;
            return (
              <div key={index} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div className={`p-2 ${metric.bgColor} rounded-lg`}>
                    <IconComponent className={`h-5 w-5 ${metric.color}`} />
                  </div>
                  <div className="flex items-center space-x-1">
                    <TrendingUp className="h-4 w-4 text-green-500" />
                    <span className="text-sm font-medium text-green-600">{metric.trend}</span>
                  </div>
                </div>
                <div className="mt-3">
                  <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
                  <p className="text-sm text-gray-600">{metric.title}</p>
                  <div className="flex items-center mt-2">
                    <span className="text-xs text-gray-500">{metric.unit}</span>
                    {metric.status === 'warning' && (
                      <AlertTriangle className="h-4 w-4 text-yellow-500 ml-2" />
                    )}
                    {metric.status === 'critical' && (
                      <AlertTriangle className="h-4 w-4 text-red-500 ml-2" />
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Alert Panel */}
      <AlertPanel alerts={alerts} />

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Heart Rate Trends</h3>
            <select 
              value={timeRange} 
              onChange={(e) => setTimeRange(e.target.value)}
              className="text-sm border border-gray-300 rounded-lg px-3 py-1"
            >
              <option value="1h">Last Hour</option>
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
            </select>
          </div>
          <HealthChart 
            data={healthHistory}
            metric="heartRate"
            color="#ef4444"
            timeRange={timeRange}
          />
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Blood Pressure Trends</h3>
            <select 
              value={timeRange} 
              onChange={(e) => setTimeRange(e.target.value)}
              className="text-sm border border-gray-300 rounded-lg px-3 py-1"
            >
              <option value="1h">Last Hour</option>
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
            </select>
          </div>
          <HealthChart 
            data={healthHistory}
            metric="bloodPressureSystolic"
            color="#8b5cf6"
            timeRange={timeRange}
          />
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Blood Oxygen Levels</h3>
            <select 
              value={timeRange} 
              onChange={(e) => setTimeRange(e.target.value)}
              className="text-sm border border-gray-300 rounded-lg px-3 py-1"
            >
              <option value="1h">Last Hour</option>
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
            </select>
          </div>
          <HealthChart 
            data={healthHistory}
            metric="bloodOxygen"
            color="#3b82f6"
            timeRange={timeRange}
          />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="flex items-center justify-center space-x-2 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <Heart className="h-5 w-5 text-red-500" />
            <span className="font-medium">Manual BP Check</span>
          </button>
          <button className="flex items-center justify-center space-x-2 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <Activity className="h-5 w-5 text-green-500" />
            <span className="font-medium">Start Activity Tracking</span>
          </button>
          <button className="flex items-center justify-center space-x-2 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <Clock className="h-5 w-5 text-purple-500" />
            <span className="font-medium">Sleep Mode</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;