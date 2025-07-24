import { HealthDataPoint } from '../hooks/useHealthData';

interface AnomalyResult {
  id: string;
  type: 'critical' | 'warning' | 'info';
  title: string;
  description: string;
  timestamp: Date;
  value?: number;
  metric?: string;
  recommendation?: string;
}

export const anomalyDetection = {
  detectAnomalies(data: HealthDataPoint[]): AnomalyResult[] {
    if (data.length < 5) return [];

    const anomalies: AnomalyResult[] = [];
    const latest = data[data.length - 1];
    const recent = data.slice(-10);

    // Heart rate anomaly detection
    const heartRateStats = this.calculateStats(recent.map(d => d.heartRate));
    if (this.isOutlier(latest.heartRate, heartRateStats)) {
      const severity = this.getSeverity(latest.heartRate, heartRateStats);
      
      anomalies.push({
        id: `hr-anomaly-${latest.timestamp.getTime()}`,
        type: latest.heartRate > 110 || latest.heartRate < 50 ? 'critical' : 'warning',
        title: latest.heartRate > heartRateStats.mean ? 'Elevated Heart Rate Alert' : 'Low Heart Rate Alert',
        description: `Heart rate of ${latest.heartRate} bpm detected, which is ${severity} outside normal patterns.`,
        timestamp: latest.timestamp,
        value: latest.heartRate,
        metric: 'heartRate',
        recommendation: latest.heartRate > heartRateStats.mean 
          ? 'Consider rest, hydration, and stress management. Contact healthcare provider if persistent.'
          : 'Monitor for symptoms. Ensure adequate activity level. Consult doctor if accompanied by fatigue.'
      });
    }

    // Blood oxygen anomaly detection
    const oxygenStats = this.calculateStats(recent.map(d => d.bloodOxygen));
    if (this.isOutlier(latest.bloodOxygen, oxygenStats)) {
      anomalies.push({
        id: `o2-anomaly-${latest.timestamp.getTime()}`,
        type: latest.bloodOxygen < 94 ? 'critical' : 'warning',
        title: 'Blood Oxygen Level Alert',
        description: `Blood oxygen saturation of ${latest.bloodOxygen}% is below normal patterns.`,
        timestamp: latest.timestamp,
        value: latest.bloodOxygen,
        metric: 'bloodOxygen',
        recommendation: 'Practice deep breathing exercises. Ensure proper posture. Seek medical attention if levels remain low.'
      });
    }

    // Activity level anomaly detection (sudden drop)
    const activityStats = this.calculateStats(recent.map(d => d.activityLevel));
    if (latest.activityLevel < activityStats.mean - 2 * activityStats.stdDev && latest.activityLevel < 3000) {
      anomalies.push({
        id: `activity-anomaly-${latest.timestamp.getTime()}`,
        type: 'info',
        title: 'Low Activity Level Detected',
        description: `Activity level of ${latest.activityLevel} steps is significantly below your recent average.`,
        timestamp: latest.timestamp,
        value: latest.activityLevel,
        metric: 'activityLevel',
        recommendation: 'Consider light physical activity if feeling well. Take regular movement breaks.'
      });
    }

    // Pattern-based anomalies
    const patternAnomalies = this.detectPatterns(data);
    anomalies.push(...patternAnomalies);

    return anomalies.slice(-5); // Return most recent 5 anomalies
  },

  calculateStats(values: number[]) {
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);
    
    return { mean, stdDev, min: Math.min(...values), max: Math.max(...values) };
  },

  isOutlier(value: number, stats: { mean: number; stdDev: number }) {
    const zScore = Math.abs(value - stats.mean) / stats.stdDev;
    return zScore > 2; // Values more than 2 standard deviations away
  },

  getSeverity(value: number, stats: { mean: number; stdDev: number }) {
    const zScore = Math.abs(value - stats.mean) / stats.stdDev;
    if (zScore > 3) return 'significantly';
    if (zScore > 2.5) return 'considerably';
    return 'moderately';
  },

  detectPatterns(data: HealthDataPoint[]): AnomalyResult[] {
    const anomalies: AnomalyResult[] = [];
    
    if (data.length < 20) return anomalies;

    const recent20 = data.slice(-20);
    const latest = recent20[recent20.length - 1];

    // Sustained high heart rate pattern
    const recentHighHR = recent20.slice(-5).filter(d => d.heartRate > 100);
    if (recentHighHR.length >= 4) {
      anomalies.push({
        id: `sustained-hr-${latest.timestamp.getTime()}`,
        type: 'warning',
        title: 'Sustained Elevated Heart Rate',
        description: 'Heart rate has remained elevated for an extended period.',
        timestamp: latest.timestamp,
        recommendation: 'Take time to rest and practice stress reduction techniques. Monitor for other symptoms.'
      });
    }

    // Declining oxygen trend
    const last5O2 = recent20.slice(-5).map(d => d.bloodOxygen);
    const prev5O2 = recent20.slice(-10, -5).map(d => d.bloodOxygen);
    
    if (last5O2.length === 5 && prev5O2.length === 5) {
      const lastAvg = last5O2.reduce((sum, val) => sum + val, 0) / 5;
      const prevAvg = prev5O2.reduce((sum, val) => sum + val, 0) / 5;
      
      if (lastAvg < prevAvg - 2 && lastAvg < 96) {
        anomalies.push({
          id: `declining-o2-${latest.timestamp.getTime()}`,
          type: 'warning',
          title: 'Declining Blood Oxygen Trend',
          description: 'Blood oxygen levels have been gradually decreasing.',
          timestamp: latest.timestamp,
          recommendation: 'Ensure good ventilation and consider breathing exercises. Monitor closely.'
        });
      }
    }

    // Irregular heart rate variability
    const heartRates = recent20.slice(-10).map(d => d.heartRate);
    const hrVariability = this.calculateVariability(heartRates);
    
    if (hrVariability > 15) {
      anomalies.push({
        id: `hr-variability-${latest.timestamp.getTime()}`,
        type: 'info',
        title: 'High Heart Rate Variability',
        description: 'Unusual variation in heart rate patterns detected.',
        timestamp: latest.timestamp,
        recommendation: 'This could indicate stress or irregular rhythm. Consider relaxation techniques.'
      });
    }

    return anomalies;
  },

  calculateVariability(values: number[]): number {
    if (values.length < 2) return 0;
    
    const differences = values.slice(1).map((val, i) => Math.abs(val - values[i]));
    return differences.reduce((sum, diff) => sum + diff, 0) / differences.length;
  }
};