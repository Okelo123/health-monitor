import React, { useState } from 'react';
import { Activity, Heart, Brain, Settings as SettingsIcon, User, Smartphone, Users, LogOut } from 'lucide-react';
import { useAuth } from './hooks/useAuth';
import AuthForm from './components/AuthForm';
import Dashboard from './components/Dashboard';
import HealthMetrics from './components/HealthMetrics';
import Recommendations from './components/Recommendations';
import Settings from './components/Settings';
import Profile from './components/Profile';
import DeviceManager from './components/DeviceManager';
import CaregiverDashboard from './components/CaregiverDashboard';

function App() {
  const { user, loading, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading HealthAI Monitor...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthForm onSuccess={() => {}} />;
  }

  const tabs = [
    { id: 'dashboard', name: 'Dashboard', icon: Activity },
    { id: 'metrics', name: 'Metrics', icon: Heart },
    { id: 'recommendations', name: 'AI Insights', icon: Brain },
    { id: 'devices', name: 'Devices', icon: Smartphone },
    { id: 'caregiver', name: 'Caregivers', icon: Users },
    { id: 'profile', name: 'Profile', icon: User },
    { id: 'settings', name: 'Settings', icon: SettingsIcon },
  ];

  const renderActiveComponent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'metrics':
        return <HealthMetrics />;
      case 'recommendations':
        return <Recommendations />;
      case 'devices':
        return <DeviceManager />;
      case 'caregiver':
        return <CaregiverDashboard />;
      case 'profile':
        return <Profile />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-green-500 rounded-lg">
                <Heart className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                  HealthAI Monitor
                </h1>
                <p className="text-sm text-gray-500">AI-Powered Health Intelligence</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 px-3 py-1.5 bg-green-100 rounded-full">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-green-700">
                  {user.user_metadata?.full_name || user.email}
                </span>
              </div>
              <button
                onClick={signOut}
                className="flex items-center space-x-2 px-3 py-1.5 text-gray-600 hover:text-gray-800 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span className="text-sm">Sign Out</span>
              </button>
            
            </div>
          </div>
         </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8 overflow-x-auto">
            {tabs.map((tab) => {
              const IconComponent = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-2 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <IconComponent className="h-4 w-4" />
                  <span>{tab.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderActiveComponent()}
      </main>
    </div>
  );
}

export default App;

