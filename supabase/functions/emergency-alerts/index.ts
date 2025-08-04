import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface EmergencyAlertPayload {
  patientId: string;
  alertType: 'critical' | 'emergency';
  message: string;
  metrics?: {
    heartRate?: number;
    bloodPressure?: string;
    bloodOxygen?: number;
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

    const payload: EmergencyAlertPayload = await req.json();

    // Get patient profile and emergency contacts
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('full_name, emergency_contact, email')
      .eq('id', payload.patientId)
      .single();

    if (profileError || !profile) {
      throw new Error('Patient not found');
    }

    // Get all caregivers with emergency access
    const { data: caregivers, error: caregiversError } = await supabase
      .from('caregiver_access')
      .select(`
        caregiver_id,
        access_level,
        caregiver:profiles!caregiver_access_caregiver_id_fkey(email, full_name)
      `)
      .eq('patient_id', payload.patientId)
      .eq('is_active', true)
      .in('access_level', ['monitor', 'emergency']);

    if (caregiversError) {
      console.error('Error fetching caregivers:', caregiversError);
    }

    // Create emergency alert in database
    const { error: alertError } = await supabase
      .from('health_alerts')
      .insert({
        user_id: payload.patientId,
        alert_type: 'critical',
        title: 'EMERGENCY ALERT',
        description: payload.message,
        recommendation: 'Immediate medical attention required. Contact emergency services.',
      });

    if (alertError) {
      console.error('Error creating alert:', alertError);
    }

    // In a real implementation, this would send:
    // 1. SMS notifications to emergency contacts
    // 2. Email alerts to caregivers
    // 3. Push notifications to mobile apps
    // 4. Integration with emergency services APIs

    const notifications = [];

    // Mock emergency contact notification
    if (profile.emergency_contact) {
      notifications.push({
        type: 'sms',
        recipient: profile.emergency_contact,
        message: `EMERGENCY: ${profile.full_name} needs immediate medical attention. ${payload.message}`,
      });
    }

    // Mock caregiver notifications
    if (caregivers) {
      for (const caregiver of caregivers) {
        notifications.push({
          type: 'email',
          recipient: (caregiver as any).caregiver.email,
          subject: `EMERGENCY ALERT: ${profile.full_name}`,
          message: `Emergency alert for patient ${profile.full_name}: ${payload.message}`,
        });
      }
    }

    // Log notifications (in real implementation, actually send them)
    console.log('Emergency notifications to send:', notifications);

    return new Response(
      JSON.stringify({ 
        success: true, 
        notificationsSent: notifications.length,
        message: 'Emergency alert processed successfully'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Emergency alert error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});