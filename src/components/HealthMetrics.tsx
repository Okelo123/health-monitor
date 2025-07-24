import React, { useState } from 'react';
import { Heart, Droplets, Activity, Clock, Calendar, TrendingUp, Download } from 'lucide-react';
import { useHealthData } from '../hooks/useHealthData';
import DetailedChart from './DetailedChart';

const HealthMetrics: React.FC = () => {
  const { healthHistory, getAverages, getRange } = useHealthData();
  const [selectedMetric, setSelectedMetric] = useState('heartRate');
  const [dateRange, setDateRange] = useState('7d');

  const metrics = [
    {
      id: 'heartRate',
      title: 'Heart Rate',
      icon: Heart,
      color: 'red',
      unit: 'bpm',
      current: healthHistory[healthHistory.length - 1]?.heartRate || 0,
      average: getAverages(dateRange).heartRate,
      range: getRange(dateRange).heartRate
    },
    {
      id: 'bloodOxygen',
      title: 'Blood Oxygen',
      icon: Droplets,
      color: 'blue',
      unit: '%',
      current: healthHistory[healthHistory.length - 1]?.bloodOxygen || 0,
      average: getAverages(dateRange).bloodOxygen,
      range: getRange(dateRange).bloodOxygen
    },
    {
      id: 'activityLevel',
      title: 'Activity Level',
      icon: Activity,
      color: 'green',
      unit: 'steps',
      current: healthHistory[healthHistory.length - 1]?.activityLevel || 0,
      average: getAverages(dateRange).activityLevel,
      range: getRange(dateRange).activityLevel
    },
    {
      id: 'sleepQuality',
      title: 'Sleep Quality',
      icon: Clock,
      color: 'purple',
      unit: '/100',
      current: healthHistory[healthHistory.length - 1]?.sleepQuality || 0,
      average: getAverages(dateRange).sleepQuality,
      range: getRange(dateRange).sleepQuality
    }
  ];

  const selectedMetricData = metrics.find(m => m.id === selectedMetric);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Detailed Health Metrics</h2>
            <p className="text-gray-600 mt-1">Comprehensive analysis of your health data</p>
          </div>
          <div className="flex items-center space-x-4 mt-4 md:mt-0">
            <select 
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="border border-gray-300 rounded-lg px-4 py-2 text-sm"
            >
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 3 Months</option>
            </select>
            <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <Download className="h-4 w-4" />
              <span>Export Data</span>
            </button>
          </div>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {metrics.map((metric) => {
            const IconComponent = metric.icon;
            const isSelected = selectedMetric === metric.id;
            return (
              <div
                key={metric.id}
                onClick={() => setSelectedMetric(metric.id)}
                className={`cursor-pointer p-6 border-2 rounded-xl transition-all hover:shadow-md ${
                  isSelected 
                    ? `border-${metric.color}-500 bg-${metric.color}-50` 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 bg-${metric.color}-100 rounded-lg`}>
                    <IconComponent className={`h-6 w-6 text-${metric.color}-600`} />
                  </div>
                  <TrendingUp className={`h-5 w-5 text-${metric.color}-500`} />
                </div>
                <div className="space-y-2">
                  <h3 className="font-semibold text-gray-900">{metric.title}</h3>
                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">Current</span>
                      <span className="font-semibold">{metric.current} {metric.unit}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">Average</span>
                      <span className="font-medium">{metric.average} {metric.unit}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">Range</span>
                      <span className="text-sm">{metric.range.min}-{metric.range.max} {metric.unit}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Detailed Chart */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-900">
            {selectedMetricData?.title} Analysis
          </h3>
          <div className="flex items-center space-x-4">
            <Calendar className="h-5 w-5 text-gray-400" />
            <span className="text-sm text-gray-600">
              {dateRange === '24h' ? 'Last 24 Hours' : 
               dateRange === '7d' ? 'Last 7 Days' :
               dateRange === '30d' ? 'Last 30 Days' : 'Last 3 Months'}
            </span>
          </div>
        </div>
        <DetailedChart 
          data={healthHistory}
          metric={selectedMetric}
          color={selectedMetricData?.color || 'blue'}
          dateRange={dateRange}
        />
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h4 className="font-semibold text-gray-900 mb-4">Daily Averages</h4>
          <div className="space-y-3">
            {metrics.map((metric) => (
              <div key={metric.id} className="flex justify-between items-center">
                <span className="text-sm text-gray-600">{metric.title}</span>
                <span className="font-medium">{metric.average} {metric.unit}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <h4 className="font-semibold text-gray-900 mb-4">Peak Values</h4>
          <div className="space-y-3">
            {metrics.map((metric) => (
              <div key={metric.id} className="flex justify-between items-center">
                <span className="text-sm text-gray-600">{metric.title}</span>
                <span className="font-medium text-red-600">{metric.range.max} {metric.unit}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <h4 className="font-semibold text-gray-900 mb-4">Health Score</h4>
          <div className="text-center">
            <div className="text-4xl font-bold text-green-600 mb-2">87</div>
            <div className="text-sm text-gray-600 mb-4">Overall Health Score</div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-green-600 h-2 rounded-full" style={{ width: '87%' }}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HealthMetrics;