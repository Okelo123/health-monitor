export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          phone: string | null;
          birth_date: string | null;
          location: string | null;
          height: string | null;
          weight: string | null;
          blood_type: string | null;
          emergency_contact: string | null;
          medical_conditions: string | null;
          medications: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          phone?: string | null;
          birth_date?: string | null;
          location?: string | null;
          height?: string | null;
          weight?: string | null;
          blood_type?: string | null;
          emergency_contact?: string | null;
          medical_conditions?: string | null;
          medications?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          phone?: string | null;
          birth_date?: string | null;
          location?: string | null;
          height?: string | null;
          weight?: string | null;
          blood_type?: string | null;
          emergency_contact?: string | null;
          medical_conditions?: string | null;
          medications?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      health_data: {
        Row: {
          id: string;
          user_id: string;
          timestamp: string;
          heart_rate: number;
          blood_oxygen: number;
          blood_pressure_systolic: number;
          blood_pressure_diastolic: number;
          activity_level: number;
          sleep_quality: number;
          device_id: string | null;
          device_type: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          timestamp: string;
          heart_rate: number;
          blood_oxygen: number;
          blood_pressure_systolic: number;
          blood_pressure_diastolic: number;
          activity_level: number;
          sleep_quality: number;
          device_id?: string | null;
          device_type?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          timestamp?: string;
          heart_rate?: number;
          blood_oxygen?: number;
          blood_pressure_systolic?: number;
          blood_pressure_diastolic?: number;
          activity_level?: number;
          sleep_quality?: number;
          device_id?: string | null;
          device_type?: string | null;
          created_at?: string;
        };
      };
      health_alerts: {
        Row: {
          id: string;
          user_id: string;
          alert_type: 'critical' | 'warning' | 'info';
          title: string;
          description: string;
          metric: string | null;
          value: number | null;
          recommendation: string | null;
          is_read: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          alert_type: 'critical' | 'warning' | 'info';
          title: string;
          description: string;
          metric?: string | null;
          value?: number | null;
          recommendation?: string | null;
          is_read?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          alert_type?: 'critical' | 'warning' | 'info';
          title?: string;
          description?: string;
          metric?: string | null;
          value?: number | null;
          recommendation?: string | null;
          is_read?: boolean;
          created_at?: string;
        };
      };
      health_goals: {
        Row: {
          id: string;
          user_id: string;
          steps_goal: number;
          heart_rate_min: number;
          heart_rate_max: number;
          blood_pressure_systolic_max: number;
          blood_pressure_diastolic_max: number;
          sleep_hours_goal: number;
          weight_goal: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          steps_goal?: number;
          heart_rate_min?: number;
          heart_rate_max?: number;
          blood_pressure_systolic_max?: number;
          blood_pressure_diastolic_max?: number;
          sleep_hours_goal?: number;
          weight_goal?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          steps_goal?: number;
          heart_rate_min?: number;
          heart_rate_max?: number;
          blood_pressure_systolic_max?: number;
          blood_pressure_diastolic_max?: number;
          sleep_hours_goal?: number;
          weight_goal?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      connected_devices: {
        Row: {
          id: string;
          user_id: string;
          device_id: string;
          device_name: string;
          device_type: string;
          manufacturer: string;
          is_active: boolean;
          last_sync: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          device_id: string;
          device_name: string;
          device_type: string;
          manufacturer: string;
          is_active?: boolean;
          last_sync?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          device_id?: string;
          device_name?: string;
          device_type?: string;
          manufacturer?: string;
          is_active?: boolean;
          last_sync?: string | null;
          created_at?: string;
        };
      };
      caregiver_access: {
        Row: {
          id: string;
          patient_id: string;
          caregiver_id: string;
          access_level: 'view' | 'monitor' | 'emergency';
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          patient_id: string;
          caregiver_id: string;
          access_level: 'view' | 'monitor' | 'emergency';
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          patient_id?: string;
          caregiver_id?: string;
          access_level?: 'view' | 'monitor' | 'emergency';
          is_active?: boolean;
          created_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}