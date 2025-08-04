import React, { useState } from 'react';
import { User, Edit, Save, Calendar, MapPin, Phone, Mail, Heart, Activity, Target } from 'lucide-react';

const Profile: React.FC = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+1 (555) 123-4567',
    birthDate: '1990-01-15',
    location: 'San Francisco, CA',
    height: '5\'10"',
    weight: '170 lbs',
    bloodType: 'O+',
    emergencyContact: 'Jane Doe - (555) 987-6543',
    medicalConditions: 'None',
    medications: 'None',
    healthGoals: {
      steps: 10000,
      heartRate: { min: 60, max: 100 },
      sleepHours: 8,
      weight: '165 lbs'
    }
  });

  const handleSave = () => {
    setIsEditing(false);
    // Save profile logic would go here
  };

  const healthStats = [
    { label: 'Days Active', value: '127', icon: Activity, color: 'green' },
    { label: 'Avg Heart Rate', value: '72 bpm', icon: Heart, color: 'red' },
    { label: 'Goals Met', value: '85%', icon: Target, color: 'blue' },
  ];

  return (
    <div className="space-y-8">
      {/* Profile Header */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-blue-500 to-purple-600"></div>
        <div className="px-6 pb-6">
          <div className="flex items-end -mt-16 mb-6">
            <div className="w-32 h-32 bg-white rounded-full p-2 shadow-lg">
              <div className="w-full h-full bg-gray-200 rounded-full flex items-center justify-center">
                <User className="h-16 w-16 text-gray-500" />
              </div>
            </div>
            <div className="ml-6 flex-1">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{profile.name}</h2>
                  <p className="text-gray-600">{profile.email}</p>
                </div>
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {isEditing ? <Save className="h-4 w-4" /> : <Edit className="h-4 w-4" />}
                  <span>{isEditing ? 'Save Changes' : 'Edit Profile'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Health Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {healthStats.map((stat, index) => {
              const IconComponent = stat.icon;
              return (
                <div key={index} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 bg-${stat.color}-100 rounded-lg`}>
                      <IconComponent className={`h-5 w-5 text-${stat.color}-600`} />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">{stat.label}</p>
                      <p className="text-lg font-semibold text-gray-900">{stat.value}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Personal Information */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-6">Personal Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
              {isEditing ? (
                <input
                  type="text"
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              ) : (
                <p className="text-gray-900">{profile.name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              {isEditing ? (
                <input
                  type="email"
                  value={profile.email}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              ) : (
                <p className="text-gray-900 flex items-center">
                  <Mail className="h-4 w-4 mr-2 text-gray-500" />
                  {profile.email}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
              {isEditing ? (
                <input
                  type="tel"
                  value={profile.phone}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              ) : (
                <p className="text-gray-900 flex items-center">
                  <Phone className="h-4 w-4 mr-2 text-gray-500" />
                  {profile.phone}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Birth Date</label>
              {isEditing ? (
                <input
                  type="date"
                  value={profile.birthDate}
                  onChange={(e) => setProfile({ ...profile, birthDate: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              ) : (
                <p className="text-gray-900 flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                  {new Date(profile.birthDate).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
              {isEditing ? (
                <input
                  type="text"
                  value={profile.location}
                  onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              ) : (
                <p className="text-gray-900 flex items-center">
                  <MapPin className="h-4 w-4 mr-2 text-gray-500" />
                  {profile.location}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Height</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={profile.height}
                    onChange={(e) => setProfile({ ...profile, height: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  />
                ) : (
                  <p className="text-gray-900">{profile.height}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Weight</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={profile.weight}
                    onChange={(e) => setProfile({ ...profile, weight: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  />
                ) : (
                  <p className="text-gray-900">{profile.weight}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Blood Type</label>
              {isEditing ? (
                <select
                  value={profile.bloodType}
                  onChange={(e) => setProfile({ ...profile, bloodType: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                >
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </select>
              ) : (
                <p className="text-gray-900">{profile.bloodType}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Emergency Contact</label>
              {isEditing ? (
                <input
                  type="text"
                  value={profile.emergencyContact}
                  onChange={(e) => setProfile({ ...profile, emergencyContact: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              ) : (
                <p className="text-gray-900">{profile.emergencyContact}</p>
              )}
            </div>
          </div>
        </div>

        {isEditing && (
          <div className="flex justify-end mt-6">
            <button
              onClick={handleSave}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Save Changes
            </button>
          </div>
        )}
      </div>

      {/* Health Goals */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-6">Health Goals</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Daily Steps Goal</label>
              <div className="flex items-center space-x-4">
                <input
                  type="number"
                  value={profile.healthGoals.steps}
                  onChange={(e) => setProfile({
                    ...profile,
                    healthGoals: { ...profile.healthGoals, steps: parseInt(e.target.value) }
                  })}
                  disabled={!isEditing}
                  className="w-32 border border-gray-300 rounded-lg px-3 py-2 disabled:bg-gray-50"
                />
                <span className="text-sm text-gray-600">steps/day</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sleep Goal</label>
              <div className="flex items-center space-x-4">
                <input
                  type="number"
                  value={profile.healthGoals.sleepHours}
                  onChange={(e) => setProfile({
                    ...profile,
                    healthGoals: { ...profile.healthGoals, sleepHours: parseInt(e.target.value) }
                  })}
                  disabled={!isEditing}
                  className="w-32 border border-gray-300 rounded-lg px-3 py-2 disabled:bg-gray-50"
                />
                <span className="text-sm text-gray-600">hours/night</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Heart Rate Range</label>
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  value={profile.healthGoals.heartRate.min}
                  onChange={(e) => setProfile({
                    ...profile,
                    healthGoals: { 
                      ...profile.healthGoals, 
                      heartRate: { ...profile.healthGoals.heartRate, min: parseInt(e.target.value) }
                    }
                  })}
                  disabled={!isEditing}
                  className="w-20 border border-gray-300 rounded-lg px-3 py-2 disabled:bg-gray-50"
                />
                <span className="text-sm text-gray-600">-</span>
                <input
                  type="number"
                  value={profile.healthGoals.heartRate.max}
                  onChange={(e) => setProfile({
                    ...profile,
                    healthGoals: { 
                      ...profile.healthGoals, 
                      heartRate: { ...profile.healthGoals.heartRate, max: parseInt(e.target.value) }
                    }
                  })}
                  disabled={!isEditing}
                  className="w-20 border border-gray-300 rounded-lg px-3 py-2 disabled:bg-gray-50"
                />
                <span className="text-sm text-gray-600">bpm</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Weight Goal</label>
              <input
                type="text"
                value={profile.healthGoals.weight}
                onChange={(e) => setProfile({
                  ...profile,
                  healthGoals: { ...profile.healthGoals, weight: e.target.value }
                })}
                disabled={!isEditing}
                className="w-32 border border-gray-300 rounded-lg px-3 py-2 disabled:bg-gray-50"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;