import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface DeviceWebhookPayload {
  userId: string;
  deviceId: string;
  deviceType: string;
  timestamp: string;
  metrics: {
    heartRate?: number;
    bloodOxygen?: number;
    bloodPressure?: {
      systolic: number;
      diastolic: number;
    };
    steps?: number;
    sleepScore?: number;
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const payload: DeviceWebhookPayload = await req.json();

    // Validate payload
    if (!payload.userId || !payload.deviceId || !payload.metrics) {
      return new Response(
        JSON.stringify({ error: 'Invalid payload' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Insert health data
    const healthData = {
      user_id: payload.userId,
      timestamp: payload.timestamp,
      heart_rate: payload.metrics.heartRate || 0,
      blood_oxygen: payload.metrics.bloodOxygen || 0,
      blood_pressure_systolic: payload.metrics.bloodPressure?.systolic || 0,
      blood_pressure_diastolic: payload.metrics.bloodPressure?.diastolic || 0,
      activity_level: payload.metrics.steps || 0,
      sleep_quality: payload.metrics.sleepScore || 0,
      device_id: payload.deviceId,
      device_type: payload.deviceType,
    };

    const { error: insertError } = await supabase
      .from('health_data')
      .insert(healthData);

    if (insertError) {
      throw insertError;
    }

    // Check for anomalies and create alerts
    const alerts = [];

    // Heart rate anomalies
    if (payload.metrics.heartRate) {
      if (payload.metrics.heartRate > 100) {
        alerts.push({
          user_id: payload.userId,
          alert_type: 'warning',
          title: 'Elevated Heart Rate',
          description: `Heart rate of ${payload.metrics.heartRate} bpm detected from ${payload.deviceType}.`,
          metric: 'heart_rate',
          value: payload.metrics.heartRate,
          recommendation: 'Consider rest and stress management. Contact healthcare provider if persistent.',
        });
      } else if (payload.metrics.heartRate < 60) {
        alerts.push({
          user_id: payload.userId,
          alert_type: 'warning',
          title: 'Low Heart Rate',
          description: `Heart rate of ${payload.metrics.heartRate} bpm detected from ${payload.deviceType}.`,
          metric: 'heart_rate',
          value: payload.metrics.heartRate,
          recommendation: 'Monitor for symptoms. Consult doctor if accompanied by fatigue.',
        });
      }
    }

    // Blood pressure anomalies
    if (payload.metrics.bloodPressure) {
      const { systolic, diastolic } = payload.metrics.bloodPressure;
      if (systolic > 140 || diastolic > 90) {
        alerts.push({
          user_id: payload.userId,
          alert_type: 'critical',
          title: 'High Blood Pressure',
          description: `Blood pressure reading of ${systolic}/${diastolic} mmHg indicates hypertension.`,
          metric: 'blood_pressure',
          value: systolic,
          recommendation: 'Reduce sodium intake, practice relaxation techniques, and consult your healthcare provider immediately.',
        });
      }
    }

    // Blood oxygen anomalies
    if (payload.metrics.bloodOxygen && payload.metrics.bloodOxygen < 95) {
      alerts.push({
        user_id: payload.userId,
        alert_type: 'critical',
        title: 'Low Blood Oxygen',
        description: `Blood oxygen saturation of ${payload.metrics.bloodOxygen}% detected from ${payload.deviceType}.`,
        metric: 'blood_oxygen',
        value: payload.metrics.bloodOxygen,
        recommendation: 'Practice deep breathing exercises. Seek medical attention if levels remain low.',
      });
    }

    // Insert alerts if any
    if (alerts.length > 0) {
      const { error: alertError } = await supabase
        .from('health_alerts')
        .insert(alerts);

      if (alertError) {
        console.error('Error inserting alerts:', alertError);
      }
    }

    // Update device last sync
    await supabase
      .from('connected_devices')
      .update({ last_sync: new Date().toISOString() })
      .eq('device_id', payload.deviceId)
      .eq('user_id', payload.userId);

    return new Response(
      JSON.stringify({ success: true, alertsCreated: alerts.length }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Webhook error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});