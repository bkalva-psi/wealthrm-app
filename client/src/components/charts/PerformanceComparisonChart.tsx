import React, { useState } from 'react';
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
      <h3 className="text-sm font-medium text-slate-500 mb-3">{getChartTitle()}</h3>
      <ResponsiveContainer width="100%" height={timeframe === 'overall' ? 160 : 240}>
        <BarChart
          data={chartData}
          margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
          barGap={0}
          barCategoryGap={timeframe === 'overall' ? 30 : 15}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          <XAxis 
            dataKey="name" 
            tick={{ fontSize: 12 }} 
            axisLine={{ stroke: '#e2e8f0' }}
            tickLine={false}
          />
          <YAxis 
            tickFormatter={(value) => `${value}%`}
            tick={{ fontSize: 11 }}
            axisLine={{ stroke: '#e2e8f0' }}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            iconType="circle"
            wrapperStyle={{ fontSize: 12, paddingTop: 10 }}
          />
          <ReferenceLine y={0} stroke="#cbd5e1" />
          <Bar dataKey="Portfolio" fill={colors.portfolio} name="Portfolio" radius={[2, 2, 0, 0]} />
          <Bar dataKey="Benchmark" fill={colors.benchmark} name="Benchmark" radius={[2, 2, 0, 0]} />
          <Bar 
            dataKey="Alpha" 
            name="Alpha (Excess Return)" 
            radius={[2, 2, 0, 0]}
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