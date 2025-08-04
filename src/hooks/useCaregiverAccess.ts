import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';

export interface CaregiverAccess {
  id: string;
  patientId: string;
  caregiverId: string;
  patientName: string;
  caregiverName: string;
  accessLevel: 'view' | 'monitor' | 'emergency';
  isActive: boolean;
  createdAt: Date;
}

export interface PatientData {
  id: string;
  name: string;
  email: string;
  currentMetrics: any;
  recentAlerts: any[];
  lastUpdate: Date;
}

export const useCaregiverAccess = () => {
  const { user } = useAuth();
  const [caregiverAccess, setCaregiverAccess] = useState<CaregiverAccess[]>([]);
  const [patients, setPatients] = useState<PatientData[]>([]);
  const [loading, setLoading] = useState(true);

  // Load caregiver access relationships
  useEffect(() => {
    if (!user) return;

    const loadCaregiverData = async () => {
      // Get patients I'm caring for
      const { data: caregiverData, error: caregiverError } = await supabase
        .from('caregiver_access')
        .select(`
          *,
          patient:profiles!caregiver_access_patient_id_fkey(full_name, email)
        `)
        .eq('caregiver_id', user.id)
        .eq('is_active', true);

      // Get caregivers who have access to me
      const { data: patientData, error: patientError } = await supabase
        .from('caregiver_access')
        .select(`
          *,
          caregiver:profiles!caregiver_access_caregiver_id_fkey(full_name, email)
        `)
        .eq('patient_id', user.id)
        .eq('is_active', true);

      if (caregiverData && !caregiverError) {
        const formattedAccess: CaregiverAccess[] = caregiverData.map(item => ({
          id: item.id,
          patientId: item.patient_id,
          caregiverId: item.caregiver_id,
          patientName: (item as any).patient?.full_name || 'Unknown',
          caregiverName: user.user_metadata?.full_name || 'Me',
          accessLevel: item.access_level,
          isActive: item.is_active,
          createdAt: new Date(item.created_at),
        }));
        setCaregiverAccess(formattedAccess);

        // Load patient health data
        await loadPatientsHealthData(formattedAccess);
      }

      setLoading(false);
    };

    loadCaregiverData();
  }, [user]);

  const loadPatientsHealthData = async (accessList: CaregiverAccess[]) => {
    const patientsData: PatientData[] = [];

    for (const access of accessList) {
      // Get latest health data for each patient
      const { data: healthData } = await supabase
        .from('health_data')
        .select('*')
        .eq('user_id', access.patientId)
        .order('timestamp', { ascending: false })
        .limit(1);

      // Get recent alerts
      const { data: alertsData } = await supabase
        .from('health_alerts')
        .select('*')
        .eq('user_id', access.patientId)
        .eq('is_read', false)
        .order('created_at', { ascending: false })
        .limit(5);

      if (healthData && healthData.length > 0) {
        const latest = healthData[0];
        patientsData.push({
          id: access.patientId,
          name: access.patientName,
          email: '', // Would be loaded from profiles
          currentMetrics: {
            heartRate: latest.heart_rate,
            bloodOxygen: latest.blood_oxygen,
            bloodPressureSystolic: latest.blood_pressure_systolic,
            bloodPressureDiastolic: latest.blood_pressure_diastolic,
            activityLevel: latest.activity_level,
            sleepQuality: latest.sleep_quality,
          },
          recentAlerts: alertsData || [],
          lastUpdate: new Date(latest.timestamp),
        });
      }
    }

    setPatients(patientsData);
  };

  const grantCaregiverAccess = async (caregiverEmail: string, accessLevel: 'view' | 'monitor' | 'emergency') => {
    if (!user) return { error: 'User not authenticated' };

    // Find caregiver by email
    const { data: caregiverData, error: caregiverError } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', caregiverEmail)
      .single();

    if (caregiverError || !caregiverData) {
      return { error: 'Caregiver not found' };
    }

    // Grant access
    const { error } = await supabase.from('caregiver_access').insert({
      patient_id: user.id,
      caregiver_id: caregiverData.id,
      access_level: accessLevel,
      is_active: true,
    });

    return { error };
  };

  const revokeCaregiverAccess = async (accessId: string) => {
    const { error } = await supabase
      .from('caregiver_access')
      .update({ is_active: false })
      .eq('id', accessId);

    if (!error) {
      setCaregiverAccess(prev =>
        prev.map(access =>
          access.id === accessId ? { ...access, isActive: false } : access
        )
      );
    }

    return { error };
  };

  const sendEmergencyAlert = async (patientId: string, message: string) => {
    // In real implementation, this would send SMS/email/push notifications
    const { error } = await supabase.from('health_alerts').insert({
      user_id: patientId,
      alert_type: 'critical',
      title: 'Emergency Alert from Caregiver',
      description: message,
      recommendation: 'Contact emergency services if needed.',
    });

    return { error };
  };

  return {
    caregiverAccess,
    patients,
    loading,
    grantCaregiverAccess,
    revokeCaregiverAccess,
    sendEmergencyAlert,
  };
};