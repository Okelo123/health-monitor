import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';
import { v4 as uuidv4 } from 'uuid';

export interface HealthDataPoint {
  id: string;
  timestamp: Date;
  heartRate: number;
  bloodOxygen: number;
  bloodPressureSystolic: number;
  bloodPressureDiastolic: number;
  activityLevel: number;
  sleepQuality: number;
  deviceId?: string;
  deviceType?: string;
}

export interface CurrentMetrics {
  heartRate: number;
  bloodOxygen: number;
  bloodPressureSystolic: number;
  bloodPressureDiastolic: number;
  activityLevel: number;
  sleepQuality: number;
}

export interface HealthAlert {
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

export const useRealTimeHealthData = () => {
  const { user } = useAuth();
  const [currentMetrics, setCurrentMetrics] = useState<CurrentMetrics>({
    heartRate: 72,
    bloodOxygen: 98,
    bloodPressureSystolic: 120,
    bloodPressureDiastolic: 80,
    activityLevel: 8500,
    sleepQuality: 85
  });

  const [healthHistory, setHealthHistory] = useState<HealthDataPoint[]>([]);
  const [alerts, setAlerts] = useState<HealthAlert[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  // Load historical data
  useEffect(() => {
    if (!user) return;

    const loadHealthData = async () => {
      const { data, error } = await supabase
        .from('health_data')
        .select('*')
        .eq('user_id', user.id)
        .order('timestamp', { ascending: true })
        .limit(100);

      if (data && !error) {
        const formattedData: HealthDataPoint[] = data.map(item => ({
          id: item.id,
          timestamp: new Date(item.timestamp),
          heartRate: item.heart_rate,
          bloodOxygen: item.blood_oxygen,
          bloodPressureSystolic: item.blood_pressure_systolic,
          bloodPressureDiastolic: item.blood_pressure_diastolic,
          activityLevel: item.activity_level,
          sleepQuality: item.sleep_quality,
          deviceId: item.device_id || undefined,
          deviceType: item.device_type || undefined,
        }));
        setHealthHistory(formattedData);

        // Set current metrics from latest data
        if (formattedData.length > 0) {
          const latest = formattedData[formattedData.length - 1];
          setCurrentMetrics({
            heartRate: latest.heartRate,
            bloodOxygen: latest.bloodOxygen,
            bloodPressureSystolic: latest.bloodPressureSystolic,
            bloodPressureDiastolic: latest.bloodPressureDiastolic,
            activityLevel: latest.activityLevel,
            sleepQuality: latest.sleepQuality,
          });
        }
      }
    };

    const loadAlerts = async () => {
      const { data, error } = await supabase
        .from('health_alerts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (data && !error) {
        const formattedAlerts: HealthAlert[] = data.map(alert => ({
          id: alert.id,
          type: alert.alert_type,
          title: alert.title,
          description: alert.description,
          timestamp: new Date(alert.created_at),
          value: alert.value || undefined,
          metric: alert.metric || undefined,
          recommendation: alert.recommendation || undefined,
          isRead: alert.is_read,
        }));
        setAlerts(formattedAlerts);
      }
    };

    loadHealthData();
    loadAlerts();
  }, [user]);

  // Real-time subscriptions
  useEffect(() => {
    if (!user) return;

    // Subscribe to new health data
    const healthDataSubscription = supabase
      .channel('health_data_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'health_data',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const newData = payload.new as any;
          const formattedData: HealthDataPoint = {
            id: newData.id,
            timestamp: new Date(newData.timestamp),
            heartRate: newData.heart_rate,
            bloodOxygen: newData.blood_oxygen,
            bloodPressureSystolic: newData.blood_pressure_systolic,
            bloodPressureDiastolic: newData.blood_pressure_diastolic,
            activityLevel: newData.activity_level,
            sleepQuality: newData.sleep_quality,
            deviceId: newData.device_id || undefined,
            deviceType: newData.device_type || undefined,
          };

          setHealthHistory(prev => [...prev.slice(-99), formattedData]);
          setCurrentMetrics({
            heartRate: formattedData.heartRate,
            bloodOxygen: formattedData.bloodOxygen,
            bloodPressureSystolic: formattedData.bloodPressureSystolic,
            bloodPressureDiastolic: formattedData.bloodPressureDiastolic,
            activityLevel: formattedData.activityLevel,
            sleepQuality: formattedData.sleepQuality,
          });
        }
      )
      .subscribe();

    // Subscribe to new alerts
    const alertsSubscription = supabase
      .channel('alerts_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'health_alerts',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const newAlert = payload.new as any;
          const formattedAlert: HealthAlert = {
            id: newAlert.id,
            type: newAlert.alert_type,
            title: newAlert.title,
            description: newAlert.description,
            timestamp: new Date(newAlert.created_at),
            value: newAlert.value || undefined,
            metric: newAlert.metric || undefined,
            recommendation: newAlert.recommendation || undefined,
            isRead: newAlert.is_read,
          };

          setAlerts(prev => [formattedAlert, ...prev.slice(0, 19)]);
        }
      )
      .subscribe();

    return () => {
      healthDataSubscription.unsubscribe();
      alertsSubscription.unsubscribe();
    };
  }, [user]);

  // Simulate device data (in real implementation, this would come from actual devices)
  useEffect(() => {
    if (!user) return;

    const simulateDeviceData = async () => {
      const generateDataPoint = () => {
        const baseHeartRate = 72;
        const heartRateVariation = Math.sin(Date.now() / 10000) * 15 + Math.random() * 10 - 5;
        const heartRate = Math.max(50, Math.min(120, Math.round(baseHeartRate + heartRateVariation)));

        const baseBloodOxygen = 98;
        const oxygenVariation = Math.random() * 4 - 2;
        const bloodOxygen = Math.max(90, Math.min(100, Math.round(baseBloodOxygen + oxygenVariation)));

        const baseSystolic = 120;
        const systolicVariation = Math.random() * 20 - 10;
        const bloodPressureSystolic = Math.max(90, Math.min(180, Math.round(baseSystolic + systolicVariation)));

        const baseDiastolic = 80;
        const diastolicVariation = Math.random() * 15 - 7;
        const bloodPressureDiastolic = Math.max(60, Math.min(120, Math.round(baseDiastolic + diastolicVariation)));

        const baseActivity = 8500;
        const activityVariation = Math.sin(Date.now() / 20000) * 3000 + Math.random() * 2000 - 1000;
        const activityLevel = Math.max(0, Math.round(baseActivity + activityVariation));

        const baseSleep = 85;
        const sleepVariation = Math.random() * 20 - 10;
        const sleepQuality = Math.max(0, Math.min(100, Math.round(baseSleep + sleepVariation)));

        return {
          user_id: user.id,
          timestamp: new Date().toISOString(),
          heart_rate: heartRate,
          blood_oxygen: bloodOxygen,
          blood_pressure_systolic: bloodPressureSystolic,
          blood_pressure_diastolic: bloodPressureDiastolic,
          activity_level: activityLevel,
          sleep_quality: sleepQuality,
          device_id: 'sim-device-001',
          device_type: 'smartwatch',
        };
      };

      // Insert new data point
      const dataPoint = generateDataPoint();
      const { error } = await supabase.from('health_data').insert(dataPoint);

      if (!error) {
        setIsConnected(true);
        
        // Check for anomalies and create alerts
        await checkForAnomalies(dataPoint);
      }
    };

    const checkForAnomalies = async (dataPoint: any) => {
      const alerts = [];

      // Heart rate anomalies
      if (dataPoint.heart_rate > 100) {
        alerts.push({
          user_id: user.id,
          alert_type: 'warning' as const,
          title: 'Elevated Heart Rate',
          description: `Heart rate of ${dataPoint.heart_rate} bpm detected, which is above normal resting range.`,
          metric: 'heart_rate',
          value: dataPoint.heart_rate,
          recommendation: 'Consider rest, hydration, and stress management. Contact healthcare provider if persistent.',
        });
      } else if (dataPoint.heart_rate < 60) {
        alerts.push({
          user_id: user.id,
          alert_type: 'warning' as const,
          title: 'Low Heart Rate',
          description: `Heart rate of ${dataPoint.heart_rate} bpm detected, which is below normal resting range.`,
          metric: 'heart_rate',
          value: dataPoint.heart_rate,
          recommendation: 'Monitor for symptoms. Ensure adequate activity level. Consult doctor if accompanied by fatigue.',
        });
      }

      // Blood pressure anomalies
      if (dataPoint.blood_pressure_systolic > 140 || dataPoint.blood_pressure_diastolic > 90) {
        alerts.push({
          user_id: user.id,
          alert_type: 'critical' as const,
          title: 'High Blood Pressure',
          description: `Blood pressure reading of ${dataPoint.blood_pressure_systolic}/${dataPoint.blood_pressure_diastolic} mmHg indicates hypertension.`,
          metric: 'blood_pressure',
          value: dataPoint.blood_pressure_systolic,
          recommendation: 'Reduce sodium intake, practice relaxation techniques, and consult your healthcare provider immediately.',
        });
      }

      // Blood oxygen anomalies
      if (dataPoint.blood_oxygen < 95) {
        alerts.push({
          user_id: user.id,
          alert_type: 'critical' as const,
          title: 'Low Blood Oxygen',
          description: `Blood oxygen saturation of ${dataPoint.blood_oxygen}% is below normal range.`,
          metric: 'blood_oxygen',
          value: dataPoint.blood_oxygen,
          recommendation: 'Practice deep breathing exercises. Ensure proper posture. Seek medical attention if levels remain low.',
        });
      }

      // Insert alerts
      if (alerts.length > 0) {
        await supabase.from('health_alerts').insert(alerts);
      }
    };

    // Start simulation
    const interval = setInterval(simulateDeviceData, 5000); // Every 5 seconds

    return () => clearInterval(interval);
  }, [user]);

  const markAlertAsRead = async (alertId: string) => {
    const { error } = await supabase
      .from('health_alerts')
      .update({ is_read: true })
      .eq('id', alertId);

    if (!error) {
      setAlerts(prev => 
        prev.map(alert => 
          alert.id === alertId ? { ...alert, isRead: true } : alert
        )
      );
    }
  };

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
        bloodPressureSystolic: 0,
        bloodPressureDiastolic: 0,
        activityLevel: 0,
        sleepQuality: 0
      };
    }

    const totals = filteredData.reduce(
      (acc, point) => ({
        heartRate: acc.heartRate + point.heartRate,
        bloodOxygen: acc.bloodOxygen + point.bloodOxygen,
        bloodPressureSystolic: acc.bloodPressureSystolic + point.bloodPressureSystolic,
        bloodPressureDiastolic: acc.bloodPressureDiastolic + point.bloodPressureDiastolic,
        activityLevel: acc.activityLevel + point.activityLevel,
        sleepQuality: acc.sleepQuality + point.sleepQuality
      }),
      { heartRate: 0, bloodOxygen: 0, bloodPressureSystolic: 0, bloodPressureDiastolic: 0, activityLevel: 0, sleepQuality: 0 }
    );

    return {
      heartRate: Math.round(totals.heartRate / filteredData.length),
      bloodOxygen: Math.round(totals.bloodOxygen / filteredData.length),
      bloodPressureSystolic: Math.round(totals.bloodPressureSystolic / filteredData.length),
      bloodPressureDiastolic: Math.round(totals.bloodPressureDiastolic / filteredData.length),
      activityLevel: Math.round(totals.activityLevel / filteredData.length),
      sleepQuality: Math.round(totals.sleepQuality / filteredData.length)
    };
  };

  return {
    currentMetrics,
    healthHistory,
    alerts,
    isConnected,
    markAlertAsRead,
    getAverages,
  };
};