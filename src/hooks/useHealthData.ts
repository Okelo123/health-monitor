import { useState, useEffect } from 'react';
import { anomalyDetection } from '../utils/anomalyDetection';

export interface HealthDataPoint {
  timestamp: Date;
  heartRate: number;
  bloodOxygen: number;
  activityLevel: number;
  sleepQuality: number;
}

export interface CurrentMetrics {
  heartRate: number;
  bloodOxygen: number;
  activityLevel: number;
  sleepQuality: number;
}

export interface Anomaly {
  id: string;
  type: 'critical' | 'warning' | 'info';
  title: string;
  description: string;
  timestamp: Date;
  value?: number;
  metric?: string;
  recommendation?: string;
}

export const useHealthData = () => {
  const [currentMetrics, setCurrentMetrics] = useState<CurrentMetrics>({
    heartRate: 72,
    bloodOxygen: 98,
    activityLevel: 8500,
    sleepQuality: 85
  });

  const [healthHistory, setHealthHistory] = useState<HealthDataPoint[]>([]);
  const [anomalies, setAnomalies] = useState<Anomaly[]>([]);

  // Simulate real-time data updates
  useEffect(() => {
    const generateDataPoint = (): HealthDataPoint => {
      const baseHeartRate = 72;
      const heartRateVariation = Math.sin(Date.now() / 10000) * 15 + Math.random() * 10 - 5;
      const heartRate = Math.max(50, Math.min(120, Math.round(baseHeartRate + heartRateVariation)));

      const baseBloodOxygen = 98;
      const oxygenVariation = Math.random() * 4 - 2;
      const bloodOxygen = Math.max(90, Math.min(100, Math.round(baseBloodOxygen + oxygenVariation)));

      const baseActivity = 8500;
      const activityVariation = Math.sin(Date.now() / 20000) * 3000 + Math.random() * 2000 - 1000;
      const activityLevel = Math.max(0, Math.round(baseActivity + activityVariation));

      const baseSleep = 85;
      const sleepVariation = Math.random() * 20 - 10;
      const sleepQuality = Math.max(0, Math.min(100, Math.round(baseSleep + sleepVariation)));

      return {
        timestamp: new Date(),
        heartRate,
        bloodOxygen,
        activityLevel,
        sleepQuality
      };
    };

    // Initialize with historical data
    if (healthHistory.length === 0) {
      const initialData: HealthDataPoint[] = [];
      const now = new Date();
      
      for (let i = 100; i > 0; i--) {
        const timestamp = new Date(now.getTime() - i * 60000); // Every minute for last 100 minutes
        initialData.push({
          timestamp,
          heartRate: Math.round(70 + Math.sin(i / 10) * 15 + Math.random() * 10 - 5),
          bloodOxygen: Math.round(97 + Math.random() * 3),
          activityLevel: Math.round(7000 + Math.sin(i / 20) * 3000 + Math.random() * 1000),
          sleepQuality: Math.round(80 + Math.random() * 20)
        });
      }
      
      setHealthHistory(initialData);
    }

    // Update current metrics and add new data points
    const interval = setInterval(() => {
      const newDataPoint = generateDataPoint();
      
      setCurrentMetrics({
        heartRate: newDataPoint.heartRate,
        bloodOxygen: newDataPoint.bloodOxygen,
        activityLevel: newDataPoint.activityLevel,
        sleepQuality: newDataPoint.sleepQuality
      });

      setHealthHistory(prev => {
        const updated = [...prev.slice(-99), newDataPoint]; // Keep last 100 points
        
        // Check for anomalies
        const detectedAnomalies = anomalyDetection.detectAnomalies(updated);
        setAnomalies(prev => {
          const existingIds = new Set(prev.map(a => a.id));
          const newAnomalies = detectedAnomalies.filter(a => !existingIds.has(a.id));
          return [...prev, ...newAnomalies].slice(-10); // Keep last 10 anomalies
        });
        
        return updated;
      });
    }, 3000); // Update every 3 seconds

    return () => clearInterval(interval);
  }, [healthHistory.length]);

  // Utility functions for data analysis
  const getAverages = (timeRange: string) => {
    const now = new Date();
    let startTime: Date;
    
    switch (timeRange) {
      case '24h':
        startTime = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        startTime = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startTime = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        startTime = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }

    const filteredData = healthHistory.filter(point => point.timestamp >= startTime);
    
    if (filteredData.length === 0) {
      return {
        heartRate: 0,
        bloodOxygen: 0,
        activityLevel: 0,
        sleepQuality: 0
      };
    }

    const totals = filteredData.reduce(
      (acc, point) => ({
        heartRate: acc.heartRate + point.heartRate,
        bloodOxygen: acc.bloodOxygen + point.bloodOxygen,
        activityLevel: acc.activityLevel + point.activityLevel,
        sleepQuality: acc.sleepQuality + point.sleepQuality
      }),
      { heartRate: 0, bloodOxygen: 0, activityLevel: 0, sleepQuality: 0 }
    );

    return {
      heartRate: Math.round(totals.heartRate / filteredData.length),
      bloodOxygen: Math.round(totals.bloodOxygen / filteredData.length),
      activityLevel: Math.round(totals.activityLevel / filteredData.length),
      sleepQuality: Math.round(totals.sleepQuality / filteredData.length)
    };
  };

  const getRange = (timeRange: string) => {
    const now = new Date();
    let startTime: Date;
    
    switch (timeRange) {
      case '24h':
        startTime = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        startTime = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startTime = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        startTime = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }

    const filteredData = healthHistory.filter(point => point.timestamp >= startTime);
    
    if (filteredData.length === 0) {
      return {
        heartRate: { min: 0, max: 0 },
        bloodOxygen: { min: 0, max: 0 },
        activityLevel: { min: 0, max: 0 },
        sleepQuality: { min: 0, max: 0 }
      };
    }

    const heartRates = filteredData.map(p => p.heartRate);
    const bloodOxygens = filteredData.map(p => p.bloodOxygen);
    const activities = filteredData.map(p => p.activityLevel);
    const sleepQualities = filteredData.map(p => p.sleepQuality);

    return {
      heartRate: { min: Math.min(...heartRates), max: Math.max(...heartRates) },
      bloodOxygen: { min: Math.min(...bloodOxygens), max: Math.max(...bloodOxygens) },
      activityLevel: { min: Math.min(...activities), max: Math.max(...activities) },
      sleepQuality: { min: Math.min(...sleepQualities), max: Math.max(...sleepQualities) }
    };
  };

  return {
    currentMetrics,
    healthHistory,
    anomalies,
    getAverages,
    getRange
  };
};