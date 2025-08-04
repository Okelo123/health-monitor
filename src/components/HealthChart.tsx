import React, { useMemo } from 'react';
import { HealthDataPoint } from '../hooks/useRealTimeHealthData';

interface HealthChartProps {
  data: HealthDataPoint[];
  metric: keyof Pick<HealthDataPoint, 'heartRate' | 'bloodOxygen' | 'bloodPressureSystolic' | 'bloodPressureDiastolic' | 'activityLevel' | 'sleepQuality'>;
  color: string;
  timeRange: string;
}

const HealthChart: React.FC<HealthChartProps> = ({ data, metric, color, timeRange }) => {
  const chartData = useMemo(() => {
    const now = new Date();
    let startTime: Date;
    
    switch (timeRange) {
      case '1h':
        startTime = new Date(now.getTime() - 60 * 60 * 1000);
        break;
      case '24h':
        startTime = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        startTime = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      default:
        startTime = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    }

    return data.filter(point => point.timestamp >= startTime).slice(-50);
  }, [data, timeRange]);

  const chartHeight = 200;
  const chartWidth = 600;
  const padding = 40;

  const values = chartData.map(point => point[metric]);
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);
  const valueRange = maxValue - minValue || 1;

  const points = chartData.map((point, index) => {
    const x = (index / (chartData.length - 1)) * (chartWidth - 2 * padding) + padding;
    const y = chartHeight - padding - ((point[metric] - minValue) / valueRange) * (chartHeight - 2 * padding);
    return `${x},${y}`;
  }).join(' ');

  const pathD = chartData.map((point, index) => {
    const x = (index / (chartData.length - 1)) * (chartWidth - 2 * padding) + padding;
    const y = chartHeight - padding - ((point[metric] - minValue) / valueRange) * (chartHeight - 2 * padding);
    return index === 0 ? `M ${x} ${y}` : `L ${x} ${y}`;
  }).join(' ');

  const areaD = `${pathD} L ${chartWidth - padding} ${chartHeight - padding} L ${padding} ${chartHeight - padding} Z`;

  return (
    <div className="w-full">
      <svg width="100%" height={chartHeight} viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="overflow-visible">
        <defs>
          <linearGradient id={`gradient-${metric}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style={{ stopColor: color, stopOpacity: 0.3 }} />
            <stop offset="100%" style={{ stopColor: color, stopOpacity: 0.1 }} />
          </linearGradient>
        </defs>
        
        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => {
          const y = chartHeight - padding - ratio * (chartHeight - 2 * padding);
          return (
            <line
              key={index}
              x1={padding}
              y1={y}
              x2={chartWidth - padding}
              y2={y}
              stroke="#e5e7eb"
              strokeWidth="1"
            />
          );
        })}

        {/* Area */}
        <path
          d={areaD}
          fill={`url(#gradient-${metric})`}
          opacity="0.5"
        />

        {/* Line */}
        <path
          d={pathD}
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Data points */}
        {chartData.map((point, index) => {
          const x = (index / (chartData.length - 1)) * (chartWidth - 2 * padding) + padding;
          const y = chartHeight - padding - ((point[metric] - minValue) / valueRange) * (chartHeight - 2 * padding);
          return (
            <circle
              key={index}
              cx={x}
              cy={y}
              r="3"
              fill={color}
              className="opacity-0 hover:opacity-100 transition-opacity cursor-pointer"
            />
          );
        })}

        {/* Y-axis labels */}
        {[0, 0.5, 1].map((ratio, index) => {
          const y = chartHeight - padding - ratio * (chartHeight - 2 * padding);
          const value = Math.round(minValue + ratio * valueRange);
          return (
            <text
              key={index}
              x={padding - 10}
              y={y + 5}
              textAnchor="end"
              fontSize="12"
              fill="#6b7280"
            >
              {value}
            </text>
          );
        })}
      </svg>

      {/* Current value display */}
      <div className="mt-4 text-center">
        <div className="text-2xl font-bold" style={{ color }}>
          {chartData[chartData.length - 1]?.[metric] || 0}
        </div>
        <div className="text-sm text-gray-600 capitalize">
          {metric.replace(/([A-Z])/g, ' $1').trim()}
        </div>
      </div>
    </div>
  );
};

export default HealthChart;