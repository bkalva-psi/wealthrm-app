import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

interface AumTrendChartProps {
  aumValue: number;
}

// Generate realistic AUM trend data based on current value
const generateAumTrendData = (currentValue: number) => {
  const data = [];
  const today = new Date();
  
  // Create data for the last 3 years with realistic growth patterns
  let startDate = new Date(today);
  startDate.setFullYear(today.getFullYear() - 3);
  
  // Start with a lower value (85% of current)
  let startValue = currentValue * 0.85;
  
  // Generate quarterly data points
  for (let i = 0; i <= 12; i++) {
    const date = new Date(startDate);
    date.setMonth(startDate.getMonth() + (i * 3));
    
    // Calculate growth with a realistic pattern (faster growth in recent quarters)
    const progress = i / 12; // 0 to 1 representing progress through the timeline
    const growthRate = 0.01 + (progress * 0.03); // Growth rate increases over time
    
    // Add some randomness to make it realistic
    const randomFactor = 0.98 + (Math.random() * 0.04); // Random factor between 0.98 and 1.02
    
    // Calculate the value for this quarter
    const value = startValue * Math.pow(1 + growthRate, i) * randomFactor;
    
    data.push({
      date: date.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }),
      value: i === 12 ? currentValue : value // Ensure the last value is exactly the current AUM
    });
  }
  
  return data;
};

const AumTrendChart: React.FC<AumTrendChartProps> = ({ aumValue }) => {
  const data = generateAumTrendData(aumValue);
  
  const formatTooltipValue = (value: number) => {
    return `₹${(value / 100000).toFixed(2)} L`;
  };
  
  const formatYAxis = (value: number) => {
    return `₹${(value / 100000).toFixed(0)} L`;
  };
  
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart
        data={data}
        margin={{ top: 5, right: 20, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 12 }}
          axisLine={{ stroke: '#E5E7EB' }}
          tickLine={false}
        />
        <YAxis
          tickFormatter={formatYAxis}
          tick={{ fontSize: 12 }}
          axisLine={{ stroke: '#E5E7EB' }}
          tickLine={false}
          width={60}
        />
        <Tooltip
          formatter={(value: number) => [formatTooltipValue(value), 'AUM']}
          labelFormatter={(label) => `Date: ${label}`}
          contentStyle={{ 
            backgroundColor: 'white', 
            border: '1px solid #e5e7eb',
            borderRadius: '6px',
            padding: '8px'
          }}
        />
        <Line
          type="monotone"
          dataKey="value"
          stroke="var(--color-primary)"
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 6, stroke: "var(--color-primary)", strokeWidth: 2, fill: "white" }}
          animationDuration={1000}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default AumTrendChart;