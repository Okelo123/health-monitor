/*
  # Health Monitoring System Database Schema

  1. New Tables
    - `profiles` - User profile information
    - `health_data` - Real-time health metrics including blood pressure
    - `health_alerts` - AI-generated health alerts and anomalies
    - `health_goals` - User-defined health targets and thresholds
    - `connected_devices` - Wearable devices and integrations
    - `caregiver_access` - Multi-user access control for caregivers

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to access their own data
    - Add policies for caregiver access to patient data
    - Ensure data privacy and HIPAA compliance

  3. Features
    - Real-time health monitoring with blood pressure tracking
    - Multi-user architecture with role-based access
    - Device integration support
    - AI-powered anomaly detection
    - Caregiver dashboard functionality
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text,
  phone text,
  birth_date date,
  location text,
  height text,
  weight text,
  blood_type text,
  emergency_contact text,
  medical_conditions text,
  medications text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create health_data table with blood pressure support
CREATE TABLE IF NOT EXISTS health_data (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  timestamp timestamptz NOT NULL,
  heart_rate integer NOT NULL DEFAULT 0,
  blood_oxygen integer NOT NULL DEFAULT 0,
  blood_pressure_systolic integer NOT NULL DEFAULT 0,
  blood_pressure_diastolic integer NOT NULL DEFAULT 0,
  activity_level integer NOT NULL DEFAULT 0,
  sleep_quality integer NOT NULL DEFAULT 0,
  device_id text,
  device_type text,
  created_at timestamptz DEFAULT now()
);

-- Create health_alerts table
CREATE TABLE IF NOT EXISTS health_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  alert_type text CHECK (alert_type IN ('critical', 'warning', 'info')) NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  metric text,
  value numeric,
  recommendation text,
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Create health_goals table
CREATE TABLE IF NOT EXISTS health_goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  steps_goal integer DEFAULT 10000,
  heart_rate_min integer DEFAULT 60,
  heart_rate_max integer DEFAULT 100,
  blood_pressure_systolic_max integer DEFAULT 120,
  blood_pressure_diastolic_max integer DEFAULT 80,
  sleep_hours_goal integer DEFAULT 8,
  weight_goal text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create connected_devices table
CREATE TABLE IF NOT EXISTS connected_devices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  device_id text NOT NULL,
  device_name text NOT NULL,
  device_type text NOT NULL,
  manufacturer text NOT NULL,
  is_active boolean DEFAULT true,
  last_sync timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Create caregiver_access table for multi-user support
CREATE TABLE IF NOT EXISTS caregiver_access (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  caregiver_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  access_level text CHECK (access_level IN ('view', 'monitor', 'emergency')) NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  UNIQUE(patient_id, caregiver_id)
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE connected_devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE caregiver_access ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can read own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Health data policies
CREATE POLICY "Users can read own health data"
  ON health_data
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own health data"
  ON health_data
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Caregivers can read patient health data"
  ON health_data
  FOR SELECT
  TO authenticated
  USING (
    user_id IN (
      SELECT patient_id FROM caregiver_access 
      WHERE caregiver_id = auth.uid() AND is_active = true
    )
  );

-- Health alerts policies
CREATE POLICY "Users can read own alerts"
  ON health_alerts
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own alerts"
  ON health_alerts
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own alerts"
  ON health_alerts
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Caregivers can read patient alerts"
  ON health_alerts
  FOR SELECT
  TO authenticated
  USING (
    user_id IN (
      SELECT patient_id FROM caregiver_access 
      WHERE caregiver_id = auth.uid() AND is_active = true
    )
  );

-- Health goals policies
CREATE POLICY "Users can manage own health goals"
  ON health_goals
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Connected devices policies
CREATE POLICY "Users can manage own devices"
  ON connected_devices
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Caregiver access policies
CREATE POLICY "Users can manage caregiver access as patient"
  ON caregiver_access
  FOR ALL
  TO authenticated
  USING (auth.uid() = patient_id)
  WITH CHECK (auth.uid() = patient_id);

CREATE POLICY "Users can read caregiver access as caregiver"
  ON caregiver_access
  FOR SELECT
  TO authenticated
  USING (auth.uid() = caregiver_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_health_data_user_timestamp ON health_data(user_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_health_alerts_user_created ON health_alerts(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_caregiver_access_patient ON caregiver_access(patient_id);
CREATE INDEX IF NOT EXISTS idx_caregiver_access_caregiver ON caregiver_access(caregiver_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_health_goals_updated_at
  BEFORE UPDATE ON health_goals
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();