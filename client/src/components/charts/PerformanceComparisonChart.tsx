import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell, ReferenceLine } from 'recharts';

interface PerformancePeriod {
  label: string;
  value: number;
  benchmark: number;
  alpha: number;
}

interface PerformanceComparisonChartProps {
  data: PerformancePeriod[];
  timeframe: 'monthly' | 'yearly' | 'overall';
}

const PerformanceComparisonChart: React.FC<PerformanceComparisonChartProps> = ({ 
  data,
  timeframe
}) => {
  // Format data for the chart
  const chartData = data.map(period => ({
    name: period.label,
    Portfolio: period.value,
    Benchmark: period.benchmark,
    Alpha: period.alpha
  }));
  
  // Define colors
  const colors = {
    portfolio: '#3b82f6', // blue
    benchmark: '#64748b', // slate
    positiveAlpha: '#10b981', // green
    negativeAlpha: '#ef4444'  // red
  };
  
  // Determine the label based on timeframe
  const getChartTitle = () => {
    switch(timeframe) {
      case 'monthly':
        return 'Monthly Performance';
      case 'yearly':
        return 'Yearly Performance';
      case 'overall':
        return 'Overall Performance';
      default:
        return 'Performance Comparison';
    }
  };

  // Determine height based on timeframe and data length
  const getChartHeight = () => {
    const baseHeight = 70; // Base height per item
    const itemCount = data.length;
    const minHeight = 180; // Consistent minimum height for all charts
    return Math.max(itemCount * baseHeight, minHeight);
  };

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-slate-200 rounded shadow-sm text-xs">
          <p className="font-medium mb-1">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={`tooltip-${index}`} className="flex justify-between gap-4 items-center">
              <span style={{ color: entry.color }}>{entry.name}:</span>
              <span className={`font-medium ${entry.value >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {entry.value > 0 ? '+' : ''}{entry.value.toFixed(1)}%
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-full">
      <h3 className="text-sm font-medium text-slate-500 mb-3 text-left">{getChartTitle()}</h3>
      <ResponsiveContainer width="100%" height={getChartHeight()}>
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 5, right: 30, left: 30, bottom: 5 }}
          barGap={2}
          barSize={10} // Thinner bars
        >
          <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
          <XAxis 
            type="number"
            tickFormatter={(value) => `${value}%`}
            domain={['dataMin - 1', 'dataMax + 1']}
            tick={{ fontSize: 11 }}
            axisLine={{ stroke: '#e2e8f0' }}
            tickLine={false}
          />
          <YAxis 
            type="category"
            dataKey="name"
            tick={{ fontSize: 12 }}
            axisLine={{ stroke: '#e2e8f0' }}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            iconType="circle"
            wrapperStyle={{ fontSize: 12, paddingTop: 10, textAlign: 'left' }}
            align="left"
          />
          <ReferenceLine x={0} stroke="#cbd5e1" />
          <Bar dataKey="Portfolio" fill={colors.portfolio} name="Portfolio" radius={[0, 2, 2, 0]} />
          <Bar dataKey="Benchmark" fill={colors.benchmark} name="Benchmark" radius={[0, 2, 2, 0]} />
          <Bar 
            dataKey="Alpha" 
            name="Alpha (Excess Return)" 
            radius={[0, 2, 2, 0]}
          >
            {chartData.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={entry.Alpha >= 0 ? colors.positiveAlpha : colors.negativeAlpha} 
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PerformanceComparisonChart;