import React, { useState } from 'react';
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell
} from 'recharts';

interface BarChartProps {
  data: Record<string, number>;
  title?: string;
  color?: string;
  layout?: 'vertical' | 'horizontal';
  height?: number;
  maxBars?: number;
  showLegend?: boolean;
}

// Ujjival primary and secondary colors
const PRIMARY_COLOR = '#0A3B80';
const SECONDARY_COLOR = '#FF8000';
const SUCCESS_COLOR = '#2A9D49';

const BarChart: React.FC<BarChartProps> = ({
  data,
  title,
  color = PRIMARY_COLOR,
  layout = 'vertical',
  height = 300,
  maxBars = 10,
  showLegend = false
}) => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  // Convert record to array and sort by value
  const chartData = Object.entries(data)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, maxBars);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-slate-200 rounded-lg shadow-sm">
          <p className="font-medium">{payload[0].payload.name}</p>
          <p className="text-sm">
            <span className="font-medium">{payload[0].value.toFixed(1)}%</span> of portfolio
          </p>
        </div>
      );
    }
    return null;
  };

  const handleMouseEnter = (_: any, index: number) => {
    setActiveIndex(index);
  };

  const handleMouseLeave = () => {
    setActiveIndex(null);
  };

  // Generate lighter shades of the base color for the bars
  const getBarColor = (index: number, isActive: boolean) => {
    if (isActive) return color;

    // Calculate opacity based on index
    const opacity = 1 - (index * 0.5) / chartData.length;
    return `${color}${Math.round(opacity * 255).toString(16).padStart(2, '0')}`;
  };

  if (layout === 'vertical') {
    return (
      <div className="w-full">
        {title && <h3 className="text-sm font-medium mb-2">{title}</h3>}
        <ResponsiveContainer width="100%" height={height}>
          <RechartsBarChart
            layout="vertical"
            data={chartData}
            margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
            <XAxis
              type="number"
              domain={[0, 'dataMax']}
              tickFormatter={(value) => `${value}%`}
              tick={{ fontSize: 12 }}
            />
            <YAxis
              type="category"
              dataKey="name"
              tick={{ fontSize: 12 }}
              width={80}
            />
            <Tooltip content={<CustomTooltip />} />
            {showLegend && <Legend />}
            <Bar
              dataKey="value"
              animationDuration={1000}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={getBarColor(index, activeIndex === index)}
                  cursor="pointer"
                />
              ))}
            </Bar>
          </RechartsBarChart>
        </ResponsiveContainer>
      </div>
    );
  }

  return (
    <div className="w-full">
      {title && <h3 className="text-sm font-medium mb-2">{title}</h3>}
      <ResponsiveContainer width="100%" height={height}>
        <RechartsBarChart
          data={chartData}
          margin={{ top: 5, right: 30, left: 20, bottom: 30 }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 11, angle: -45, textAnchor: 'end' }}
            height={50}
          />
          <YAxis
            tickFormatter={(value) => `${value}%`}
            domain={[0, 'dataMax']}
            tick={{ fontSize: 11 }}
          />
          <Tooltip content={<CustomTooltip />} />
          {showLegend && <Legend />}
          <Bar
            dataKey="value"
            animationDuration={1000}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={getBarColor(index, activeIndex === index)}
                cursor="pointer"
              />
            ))}
          </Bar>
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default BarChart;