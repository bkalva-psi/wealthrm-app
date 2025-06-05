import React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface PeerComparisonData {
  metric: string;
  yourValue: string;
  avgValue: string;
  vsAverage: number;
  percentile: number;
}

interface PeerComparisonRadarChartProps {
  data: PeerComparisonData[];
}

const PeerComparisonRadarChart: React.FC<PeerComparisonRadarChartProps> = ({ data }) => {
  // Transform data for radar chart
  const radarData = data.map(item => ({
    metric: item.metric.length > 10 ? item.metric.replace(/\s+/g, '\n') : item.metric, // Better line breaks for long names
    percentile: item.percentile,
    average: 50, // Average line at 50th percentile
    excellence: 100, // 100th percentile line
    fullName: item.metric
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-background border border-border rounded shadow-sm text-xs p-3">
          <p className="font-medium mb-1 text-foreground">{data.fullName}</p>
          <div className="space-y-1">
            <div className="flex justify-between gap-4">
              <span className="text-primary">Your Percentile:</span>
              <span className="font-medium text-foreground">{data.percentile}th</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Average:</span>
              <span className="text-foreground">50th percentile</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full">
      <ResponsiveContainer width="100%" height={320}>
        <RadarChart data={radarData} margin={{ top: 20, right: 50, bottom: 50, left: 50 }}>
          <PolarGrid 
            stroke="hsl(var(--border))" 
            strokeOpacity={0.3} 
          />
          <PolarAngleAxis 
            dataKey="metric" 
            tick={{ fontSize: 9, fill: 'hsl(var(--foreground))', textAnchor: 'middle' }}
            className="text-xs"
          />
          <PolarRadiusAxis 
            angle={90} 
            domain={[0, 100]} 
            tick={{ fontSize: 8, fill: 'hsl(var(--muted-foreground))' }}
            tickCount={6}
          />
          <Radar
            name="Excellence (100th %ile)"
            dataKey="excellence"
            stroke="#10b981"
            fill="transparent"
            strokeWidth={1}
            strokeDasharray="3 3"
            strokeOpacity={0.6}
          />
          <Radar
            name="Average (50th %ile)"
            dataKey="average"
            stroke="#94a3b8"
            fill="#94a3b8"
            fillOpacity={0.1}
            strokeWidth={2}
            strokeDasharray="5 5"
          />
          <Radar
            name="Your Performance"
            dataKey="percentile"
            stroke="#3b82f6"
            fill="#3b82f6"
            fillOpacity={0.2}
            strokeWidth={2}
          />
          <Tooltip content={<CustomTooltip />} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PeerComparisonRadarChart;