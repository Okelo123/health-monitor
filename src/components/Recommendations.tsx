import React, { useState } from 'react';
import { Brain, Lightbulb, AlertTriangle, CheckCircle, Clock, Target, Zap, Activity } from 'lucide-react';
import { useHealthData } from '../hooks/useHealthData';
import { useRecommendations } from '../hooks/useRecommendations';

const Recommendations: React.FC = () => {
  const { currentMetrics, healthHistory } = useHealthData();
  const { recommendations, insights, predictions } = useRecommendations(currentMetrics, healthHistory);
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { id: 'all', name: 'All Insights', icon: Brain },
    { id: 'immediate', name: 'Immediate Actions', icon: AlertTriangle },
    { id: 'lifestyle', name: 'Lifestyle', icon: Activity },
    { id: 'prevention', name: 'Prevention', icon: CheckCircle },
  ];

  const filteredRecommendations = selectedCategory === 'all' 
    ? recommendations 
    : recommendations.filter(rec => rec.category === selectedCategory);

  return (
    <div className="space-y-8">
      {/* AI Insights Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-lg p-8 text-white">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-white/20 rounded-lg">
            <Brain className="h-8 w-8" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">AI Health Insights</h2>
            <p className="text-blue-100 mt-1">Personalized recommendations based on your health patterns</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <Target className="h-6 w-6 text-green-300" />
              <div>
                <p className="font-semibold">Health Score</p>
                <p className="text-2xl font-bold">{insights.overallScore}/100</p>
              </div>
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <Clock className="h-6 w-6 text-yellow-300" />
              <div>
                <p className="font-semibold">Risk Level</p>
                <p className="text-lg font-bold capitalize">{insights.riskLevel}</p>
              </div>
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <Zap className="h-6 w-6 text-orange-300" />
              <div>
                <p className="font-semibold">Active Alerts</p>
                <p className="text-2xl font-bold">{recommendations.filter(r => r.priority === 'high').length}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex flex-wrap gap-3">
          {categories.map((category) => {
            const IconComponent = category.icon;
            const isActive = selectedCategory === category.id;
            return (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <IconComponent className="h-4 w-4" />
                <span>{category.name}</span>
                <span className={`px-2 py-0.5 text-xs rounded-full ${
                  isActive ? 'bg-blue-500 text-white' : 'bg-gray-300 text-gray-600'
                }`}>
                  {category.id === 'all' 
                    ? recommendations.length 
                    : recommendations.filter(r => r.category === category.id).length}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Predictions */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-6">AI Predictions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {predictions.map((prediction, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <div className={`p-2 rounded-lg ${
                  prediction.confidence > 0.8 ? 'bg-green-100' :
                  prediction.confidence > 0.6 ? 'bg-yellow-100' : 'bg-red-100'
                }`}>
                  <Brain className={`h-5 w-5 ${
                    prediction.confidence > 0.8 ? 'text-green-600' :
                    prediction.confidence > 0.6 ? 'text-yellow-600' : 'text-red-600'
                  }`} />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">{prediction.title}</h4>
                  <p className="text-sm text-gray-600 mt-1">{prediction.description}</p>
                  <div className="flex items-center mt-2">
                    <span className="text-xs text-gray-500">Confidence:</span>
                    <div className="ml-2 flex-1 bg-gray-200 rounded-full h-2 max-w-20">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${prediction.confidence * 100}%` }}
                      ></div>
                    </div>
                    <span className="ml-2 text-xs font-medium">{Math.round(prediction.confidence * 100)}%</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recommendations */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-gray-900">
          {selectedCategory === 'all' ? 'All Recommendations' : `${categories.find(c => c.id === selectedCategory)?.name} Recommendations`}
        </h3>
        
        {filteredRecommendations.map((recommendation, index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start space-x-4">
              <div className={`p-3 rounded-lg ${
                recommendation.priority === 'high' ? 'bg-red-100' :
                recommendation.priority === 'medium' ? 'bg-yellow-100' : 'bg-green-100'
              }`}>
                <Lightbulb className={`h-6 w-6 ${
                  recommendation.priority === 'high' ? 'text-red-600' :
                  recommendation.priority === 'medium' ? 'text-yellow-600' : 'text-green-600'
                }`} />
              </div>
              
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-lg font-semibold text-gray-900">{recommendation.title}</h4>
                  <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                    recommendation.priority === 'high' ? 'bg-red-100 text-red-700' :
                    recommendation.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'
                  }`}>
                    {recommendation.priority} priority
                  </span>
                </div>
                
                <p className="text-gray-600 mb-4">{recommendation.description}</p>
                
                {recommendation.actions && recommendation.actions.length > 0 && (
                  <div>
                    <h5 className="font-medium text-gray-900 mb-2">Suggested Actions:</h5>
                    <ul className="space-y-2">
                      {recommendation.actions.map((action, actionIndex) => (
                        <li key={actionIndex} className="flex items-center space-x-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span className="text-sm text-gray-700">{action}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                  <span className="text-sm text-gray-500">Based on {recommendation.dataPoints} data points</span>
                  <button className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors">
                    Take Action
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Recommendations;