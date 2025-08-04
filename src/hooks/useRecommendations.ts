import { useMemo } from 'react';
import { CurrentMetrics, HealthDataPoint } from './useHealthData';

interface Recommendation {
  id: string;
  title: string;
  description: string;
  category: 'immediate' | 'lifestyle' | 'prevention';
  priority: 'high' | 'medium' | 'low';
  actions?: string[];
  dataPoints: number;
}

interface HealthInsight {
  overallScore: number;
  riskLevel: 'low' | 'medium' | 'high';
  trends: {
    heartRate: 'increasing' | 'decreasing' | 'stable';
    bloodOxygen: 'increasing' | 'decreasing' | 'stable';
    activity: 'increasing' | 'decreasing' | 'stable';
  };
}

interface Prediction {
  title: string;
  description: string;
  confidence: number;
  timeframe: string;
}

export const useRecommendations = (currentMetrics: CurrentMetrics, healthHistory: HealthDataPoint[]) => {
  const recommendations = useMemo<Recommendation[]>(() => {
    const recs: Recommendation[] = [];

    // Heart rate analysis
    if (currentMetrics.heartRate > 100) {
      recs.push({
        id: 'high-heart-rate',
        title: 'Elevated Heart Rate Detected',
        description: 'Your current heart rate is above the normal resting range. This could indicate stress, caffeine intake, or physical activity.',
        category: 'immediate',
        priority: 'high',
        actions: [
          'Take slow, deep breaths for 2-3 minutes',
          'Sit down and rest for 10-15 minutes',
          'Avoid caffeine for the next few hours',
          'Consider meditation or relaxation techniques'
        ],
        dataPoints: 15
      });
    } else if (currentMetrics.heartRate < 60) {
      recs.push({
        id: 'low-heart-rate',
        title: 'Low Heart Rate Observed',
        description: 'Your heart rate is below the typical resting range. While this can be normal for athletes, monitor for any symptoms.',
        category: 'immediate',
        priority: 'medium',
        actions: [
          'Note any symptoms like dizziness or fatigue',
          'Ensure adequate hydration',
          'Consider gentle movement or stretching'
        ],
        dataPoints: 12
      });
    }

    // Blood oxygen analysis
    if (currentMetrics.bloodOxygen < 95) {
      recs.push({
        id: 'low-oxygen',
        title: 'Low Blood Oxygen Level',
        description: 'Blood oxygen saturation below 95% may indicate respiratory issues or poor circulation.',
        category: 'immediate',
        priority: 'high',
        actions: [
          'Practice deep breathing exercises',
          'Ensure good posture and airway clearance',
          'Move to fresh air if in a stuffy environment',
          'Contact healthcare provider if persistent'
        ],
        dataPoints: 20
      });
    }

    // Activity level analysis
    const avgActivity = healthHistory.slice(-24).reduce((sum, point) => sum + point.activityLevel, 0) / 24;
    if (avgActivity < 5000) {
      recs.push({
        id: 'low-activity',
        title: 'Increase Daily Activity',
        description: 'Your recent activity levels are below recommended guidelines. Regular movement is crucial for cardiovascular health.',
        category: 'lifestyle',
        priority: 'medium',
        actions: [
          'Aim for at least 10,000 steps daily',
          'Take walking breaks every hour',
          'Use stairs instead of elevators',
          'Try a 10-minute morning walk'
        ],
        dataPoints: 48
      });
    }

    // Sleep quality analysis
    if (currentMetrics.sleepQuality < 70) {
      recs.push({
        id: 'poor-sleep',
        title: 'Improve Sleep Quality',
        description: 'Your sleep quality score indicates room for improvement. Quality sleep is essential for recovery and overall health.',
        category: 'lifestyle',
        priority: 'medium',
        actions: [
          'Establish a consistent bedtime routine',
          'Avoid screens 1 hour before bed',
          'Keep bedroom cool and dark',
          'Limit caffeine after 2 PM'
        ],
        dataPoints: 30
      });
    }

    // Trend-based recommendations
    const recentHistory = healthHistory.slice(-10);
    const olderHistory = healthHistory.slice(-20, -10);
    
    if (recentHistory.length > 0 && olderHistory.length > 0) {
      const recentAvgHR = recentHistory.reduce((sum, p) => sum + p.heartRate, 0) / recentHistory.length;
      const olderAvgHR = olderHistory.reduce((sum, p) => sum + p.heartRate, 0) / olderHistory.length;
      
      if (recentAvgHR > olderAvgHR + 5) {
        recs.push({
          id: 'increasing-hr-trend',
          title: 'Rising Heart Rate Trend',
          description: 'Your heart rate has been gradually increasing. This could indicate increasing stress levels or changes in fitness.',
          category: 'prevention',
          priority: 'low',
          actions: [
            'Monitor stress levels and practice relaxation',
            'Review recent lifestyle changes',
            'Consider cardiovascular exercise to improve fitness',
            'Track patterns with daily activities'
          ],
          dataPoints: 20
        });
      }
    }

    // Preventive recommendations
    recs.push({
      id: 'hydration-reminder',
      title: 'Stay Hydrated',
      description: 'Proper hydration supports optimal heart function and blood oxygen transport.',
      category: 'prevention',
      priority: 'low',
      actions: [
        'Drink 8-10 glasses of water daily',
        'Monitor urine color for hydration status',
        'Increase intake during physical activity',
        'Consider electrolyte balance during exercise'
      ],
      dataPoints: 5
    });

    recs.push({
      id: 'nutrition-focus',
      title: 'Heart-Healthy Nutrition',
      description: 'A balanced diet rich in omega-3 fatty acids and antioxidants supports cardiovascular health.',
      category: 'lifestyle',
      priority: 'low',
      actions: [
        'Include fatty fish 2-3 times per week',
        'Eat plenty of fruits and vegetables',
        'Limit processed foods and excess sodium',
        'Consider Mediterranean-style eating patterns'
      ],
      dataPoints: 10
    });

    return recs;
  }, [currentMetrics, healthHistory]);

  const insights = useMemo<HealthInsight>(() => {
    // Calculate overall health score
    let score = 100;
    
    // Heart rate scoring
    if (currentMetrics.heartRate < 60 || currentMetrics.heartRate > 100) {
      score -= 15;
    } else if (currentMetrics.heartRate > 90 || currentMetrics.heartRate < 65) {
      score -= 5;
    }

    // Blood oxygen scoring
    if (currentMetrics.bloodOxygen < 95) {
      score -= 20;
    } else if (currentMetrics.bloodOxygen < 97) {
      score -= 10;
    }

    // Activity scoring
    if (currentMetrics.activityLevel < 5000) {
      score -= 15;
    } else if (currentMetrics.activityLevel < 8000) {
      score -= 5;
    }

    // Sleep quality scoring
    if (currentMetrics.sleepQuality < 70) {
      score -= 10;
    } else if (currentMetrics.sleepQuality < 80) {
      score -= 5;
    }

    score = Math.max(0, Math.min(100, score));

    // Determine risk level
    let riskLevel: 'low' | 'medium' | 'high' = 'low';
    if (score < 60) riskLevel = 'high';
    else if (score < 80) riskLevel = 'medium';

    // Calculate trends
    const recent10 = healthHistory.slice(-10);
    const previous10 = healthHistory.slice(-20, -10);
    
    const trends = {
      heartRate: 'stable' as 'increasing' | 'decreasing' | 'stable',
      bloodOxygen: 'stable' as 'increasing' | 'decreasing' | 'stable',
      activity: 'stable' as 'increasing' | 'decreasing' | 'stable'
    };

    if (recent10.length > 0 && previous10.length > 0) {
      const recentHR = recent10.reduce((sum, p) => sum + p.heartRate, 0) / recent10.length;
      const previousHR = previous10.reduce((sum, p) => sum + p.heartRate, 0) / previous10.length;
      
      if (recentHR > previousHR + 3) trends.heartRate = 'increasing';
      else if (recentHR < previousHR - 3) trends.heartRate = 'decreasing';

      const recentO2 = recent10.reduce((sum, p) => sum + p.bloodOxygen, 0) / recent10.length;
      const previousO2 = previous10.reduce((sum, p) => sum + p.bloodOxygen, 0) / previous10.length;
      
      if (recentO2 > previousO2 + 1) trends.bloodOxygen = 'increasing';
      else if (recentO2 < previousO2 - 1) trends.bloodOxygen = 'decreasing';

      const recentActivity = recent10.reduce((sum, p) => sum + p.activityLevel, 0) / recent10.length;
      const previousActivity = previous10.reduce((sum, p) => sum + p.activityLevel, 0) / previous10.length;
      
      if (recentActivity > previousActivity + 500) trends.activity = 'increasing';
      else if (recentActivity < previousActivity - 500) trends.activity = 'decreasing';
    }

    return {
      overallScore: Math.round(score),
      riskLevel,
      trends
    };
  }, [currentMetrics, healthHistory]);

  const predictions = useMemo<Prediction[]>(() => {
    const preds: Prediction[] = [];

    // Heart rate trend prediction
    if (insights.trends.heartRate === 'increasing') {
      preds.push({
        title: 'Heart Rate Trend',
        description: 'Based on current patterns, your resting heart rate may continue to increase over the next few days.',
        confidence: 0.75,
        timeframe: '3-5 days'
      });
    }

    // Activity prediction
    const recentActivity = healthHistory.slice(-7).reduce((sum, p) => sum + p.activityLevel, 0) / 7;
    if (recentActivity > 9000) {
      preds.push({
        title: 'Fitness Improvement',
        description: 'Your consistent high activity levels suggest improved cardiovascular fitness in the coming weeks.',
        confidence: 0.85,
        timeframe: '2-3 weeks'
      });
    }

    // Sleep quality prediction
    if (currentMetrics.sleepQuality > 80 && insights.trends.activity === 'increasing') {
      preds.push({
        title: 'Enhanced Recovery',
        description: 'Good sleep quality combined with increased activity suggests optimal recovery patterns.',
        confidence: 0.72,
        timeframe: '1-2 weeks'
      });
    }

    // Risk prediction
    if (insights.riskLevel === 'high') {
      preds.push({
        title: 'Health Risk Alert',
        description: 'Current health patterns indicate potential risks. Following recommendations could improve outcomes.',
        confidence: 0.68,
        timeframe: 'Immediate attention needed'
      });
    }

    return preds;
  }, [currentMetrics, healthHistory, insights]);

  return {
    recommendations,
    insights,
    predictions
  };
};