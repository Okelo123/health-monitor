import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';

export interface ConnectedDevice {
  id: string;
  deviceId: string;
  deviceName: string;
  deviceType: string;
  manufacturer: string;
  isActive: boolean;
  lastSync: Date | null;
}

export interface DeviceData {
  heartRate?: number;
  bloodOxygen?: number;
  bloodPressure?: { systolic: number; diastolic: number };
  steps?: number;
  sleepScore?: number;
  timestamp: Date;
}

export const useDeviceIntegration = () => {
  const { user } = useAuth();
  const [connectedDevices, setConnectedDevices] = useState<ConnectedDevice[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [availableDevices, setAvailableDevices] = useState<any[]>([]);

  // Load connected devices
  useEffect(() => {
    if (!user) return;

    const loadDevices = async () => {
      const { data, error } = await supabase
        .from('connected_devices')
        .select('*')
        .eq('user_id', user.id);

      if (data && !error) {
        const devices: ConnectedDevice[] = data.map(device => ({
          id: device.id,
          deviceId: device.device_id,
          deviceName: device.device_name,
          deviceType: device.device_type,
          manufacturer: device.manufacturer,
          isActive: device.is_active,
          lastSync: device.last_sync ? new Date(device.last_sync) : null,
        }));
        setConnectedDevices(devices);
      }
    };

    loadDevices();
  }, [user]);

  // Simulate device scanning (in real implementation, this would use Web Bluetooth API)
  const scanForDevices = async () => {
    setIsScanning(true);
    
    // Simulate scanning delay
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Mock available devices
    const mockDevices = [
      {
        id: 'apple-watch-001',
        name: 'Apple Watch Series 9',
        type: 'smartwatch',
        manufacturer: 'Apple',
        capabilities: ['heart_rate', 'blood_oxygen', 'activity', 'sleep'],
      },
      {
        id: 'fitbit-sense-002',
        name: 'Fitbit Sense 2',
        type: 'fitness_tracker',
        manufacturer: 'Fitbit',
        capabilities: ['heart_rate', 'blood_oxygen', 'activity', 'sleep', 'stress'],
      },
      {
        id: 'omron-bp-003',
        name: 'Omron HeartGuide',
        type: 'blood_pressure_monitor',
        manufacturer: 'Omron',
        capabilities: ['blood_pressure', 'heart_rate'],
      },
      {
        id: 'garmin-vivosmart-004',
        name: 'Garmin Vivosmart 5',
        type: 'fitness_tracker',
        manufacturer: 'Garmin',
        capabilities: ['heart_rate', 'activity', 'sleep', 'stress'],
      },
    ];

    setAvailableDevices(mockDevices);
    setIsScanning(false);
  };

  // Connect a device
  const connectDevice = async (device: any) => {
    if (!user) return;

    const { error } = await supabase.from('connected_devices').insert({
      user_id: user.id,
      device_id: device.id,
      device_name: device.name,
      device_type: device.type,
      manufacturer: device.manufacturer,
      is_active: true,
    });

    if (!error) {
      const newDevice: ConnectedDevice = {
        id: device.id,
        deviceId: device.id,
        deviceName: device.name,
        deviceType: device.type,
        manufacturer: device.manufacturer,
        isActive: true,
        lastSync: new Date(),
      };
      setConnectedDevices(prev => [...prev, newDevice]);
      
      // Start data sync for this device
      startDeviceSync(device.id);
    }
  };

  // Disconnect a device
  const disconnectDevice = async (deviceId: string) => {
    if (!user) return;

    const { error } = await supabase
      .from('connected_devices')
      .update({ is_active: false })
      .eq('device_id', deviceId)
      .eq('user_id', user.id);

    if (!error) {
      setConnectedDevices(prev =>
        prev.map(device =>
          device.deviceId === deviceId ? { ...device, isActive: false } : device
        )
      );
    }
  };

  // Simulate device data sync
  const startDeviceSync = (deviceId: string) => {
    // In real implementation, this would establish connection with actual device APIs
    console.log(`Starting sync for device: ${deviceId}`);
    
    // Update last sync time
    supabase
      .from('connected_devices')
      .update({ last_sync: new Date().toISOString() })
      .eq('device_id', deviceId);
  };

  // Fitbit API integration (mock)
  const connectFitbit = async () => {
    // In real implementation, this would use Fitbit Web API
    const authUrl = `https://www.fitbit.com/oauth2/authorize?response_type=code&client_id=YOUR_CLIENT_ID&redirect_uri=${window.location.origin}/auth/fitbit&scope=activity%20heartrate%20location%20nutrition%20profile%20settings%20sleep%20social%20weight`;
    window.open(authUrl, '_blank');
  };

  // Apple Health integration (mock)
  const connectAppleHealth = async () => {
    // In real implementation, this would use HealthKit through a native app
    alert('Apple Health integration requires a native iOS app. This is a web demo.');
  };

  // Google Fit integration (mock)
  const connectGoogleFit = async () => {
    // In real implementation, this would use Google Fit REST API
    const authUrl = `https://accounts.google.com/oauth2/authorize?client_id=YOUR_CLIENT_ID&redirect_uri=${window.location.origin}/auth/google-fit&scope=https://www.googleapis.com/auth/fitness.activity.read&response_type=code`;
    window.open(authUrl, '_blank');
  };

  // Manual data entry
  const addManualReading = async (data: DeviceData) => {
    if (!user) return;

    const healthData = {
      user_id: user.id,
      timestamp: data.timestamp.toISOString(),
      heart_rate: data.heartRate || 0,
      blood_oxygen: data.bloodOxygen || 0,
      blood_pressure_systolic: data.bloodPressure?.systolic || 0,
      blood_pressure_diastolic: data.bloodPressure?.diastolic || 0,
      activity_level: data.steps || 0,
      sleep_quality: data.sleepScore || 0,
      device_id: 'manual-entry',
      device_type: 'manual',
    };

    const { error } = await supabase.from('health_data').insert(healthData);
    return { error };
  };

  return {
    connectedDevices,
    availableDevices,
    isScanning,
    scanForDevices,
    connectDevice,
    disconnectDevice,
    connectFitbit,
    connectAppleHealth,
    connectGoogleFit,
    addManualReading,
  };
};