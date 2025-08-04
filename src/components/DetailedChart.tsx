import React, { useMemo } from 'react';
import { HealthDataPoint } from '../hooks/useHealthData';

interface DetailedChartProps {
  data: HealthDataPoint[];
  metric: string;
  color: string;
  dateRange: string;
}

const DetailedChart: React.FC<DetailedChartProps> = ({ data, metric, color, dateRange }) => {
  const chartData = useMemo(() => {
    const now = new Date();
    let startTime: Date;
    
    switch (dateRange) {
      case '24h':
        startTime = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        startTime = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startTime = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startTime = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        startTime = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    }

    return data.filter(point => point.timestamp >= startTime);
  }, [data, dateRange]);

  const chartHeight = 300;
  const chartWidth = 800;
  const padding = 60;

  const values = chartData.map(point => point[metric as keyof HealthDataPoint] as number);
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);
  const valueRange = maxValue - minValue || 1;

  const pathD = chartData.map((point, index) => {
    const x = (index / (chartData.length - 1)) * (chartWidth - 2 * padding) + padding;
    const y = chartHeight - padding - ((point[metric as keyof HealthDataPoint] as number - minValue) / valueRange) * (chartHeight - 2 * padding);
    return index === 0 ? `M ${x} ${y}` : `L ${x} ${y}`;
  }).join(' ');

  const areaD = `${pathD} L ${chartWidth - padding} ${chartHeight - padding} L ${padding} ${chartHeight - padding} Z`;

  const colorMap: Record<string, string> = {
    red: '#ef4444',
    blue: '#3b82f6',
    green: '#10b981',
    purple: '#8b5cf6'
  };

  const strokeColor = colorMap[color] || '#3b82f6';

  return (
    <div className="w-full">
      <svg width="100%" height={chartHeight} viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="overflow-visible">
        <defs>
          <linearGradient id={`detailed-gradient-${metric}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style={{ stopColor: strokeColor, stopOpacity: 0.2 }} />
            <stop offset="100%" style={{ stopColor: strokeColor, stopOpacity: 0.05 }} />
          </linearGradient>
          <filter id={`shadow-${metric}`}>
            <dropShadow dx="0" dy="2" stdDeviation="4" floodColor={strokeColor} floodOpacity="0.1"/>
          </filter>
        </defs>
        
        {/* Grid lines */}
        {[0, 0.2, 0.4, 0.6, 0.8, 1].map((ratio, index) => {
          const y = chartHeight - padding - ratio * (chartHeight - 2 * padding);
          return (
            <line
              key={index}
              x1={padding}
              y1={y}
              x2={chartWidth - padding}
              y2={y}
              stroke="#f3f4f6"
              strokeWidth="1"
            />
          );
        })}

        {/* Vertical grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => {
          const x = padding + ratio * (chartWidth - 2 * padding);
          return (
            <line
              key={index}
              x1={x}
              y1={padding}
              x2={x}
              y2={chartHeight - padding}
              stroke="#f9fafb"
              strokeWidth="1"
            />
          );
        })}

        {/* Area */}
        <path
          d={areaD}
          fill={`url(#detailed-gradient-${metric})`}
        />

        {/* Line */}
        <path
          d={pathD}
          fill="none"
          stroke={strokeColor}
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter={`url(#shadow-${metric})`}
        />

        {/* Data points */}
        {chartData.map((point, index) => {
          const x = (index / (chartData.length - 1)) * (chartWidth - 2 * padding) + padding;
          const y = chartHeight - padding - ((point[metric as keyof HealthDataPoint] as number - minValue) / valueRange) * (chartHeight - 2 * padding);
          return (
            <g key={index}>
              <circle
                cx={x}
                cy={y}
                r="4"
                fill="white"
                stroke={strokeColor}
                strokeWidth="2"
                className="opacity-0 hover:opacity-100 transition-opacity cursor-pointer"
              />
              <circle
                cx={x}
                cy={y}
                r="8"
                fill="transparent"
                className="cursor-pointer"
              >
                <title>{`${point[metric as keyof HealthDataPoint]} at ${point.timestamp.toLocaleTimeString()}`}</title>
              </circle>
            </g>
          );
        })}

        {/* Y-axis labels */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => {
          const y = chartHeight - padding - ratio * (chartHeight - 2 * padding);
          const value = Math.round(minValue + ratio * valueRange);
          return (
            <text
              key={index}
              x={padding - 15}
              y={y + 5}
              textAnchor="end"
              fontSize="12"
              fill="#6b7280"
              fontWeight="500"
            >
              {value}
            </text>
          );
        })}

        {/* X-axis labels */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => {
          const x = padding + ratio * (chartWidth - 2 * padding);
          const pointIndex = Math.floor(ratio * (chartData.length - 1));
          const point = chartData[pointIndex];
          if (!point) return null;
          
          const timeLabel = dateRange === '24h' 
            ? point.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            : point.timestamp.toLocaleDateString([], { month: 'short', day: 'numeric' });
            
          return (
            <text
              key={index}
              x={x}
              y={chartHeight - padding + 20}
              textAnchor="middle"
              fontSize="12"
              fill="#6b7280"
              fontWeight="500"
            >
              {timeLabel}
            </text>
          );
        })}
      </svg>

      {/* Statistics */}
      <div className="mt-6 grid grid-cols-4 gap-4">
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <div className="text-lg font-semibold text-gray-900">
            {values[values.length - 1] || 0}
          </div>
          <div className="text-sm text-gray-600">Current</div>
        </div>
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <div className="text-lg font-semibold text-gray-900">
            {Math.round(values.reduce((a, b) => a + b, 0) / values.length) || 0}
          </div>
          <div className="text-sm text-gray-600">Average</div>
        </div>
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <div className="text-lg font-semibold text-gray-900">
            {Math.max(...values) || 0}
          </div>
          <div className="text-sm text-gray-600">Maximum</div>
        </div>
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <div className="text-lg font-semibold text-gray-900">
            {Math.min(...values) || 0}
          </div>
          <div className="text-sm text-gray-600">Minimum</div>
        </div>
      </div>
    </div>
  );
};

export default DetailedChart;