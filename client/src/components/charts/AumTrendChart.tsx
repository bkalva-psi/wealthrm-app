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
  currentValue: number;
  clientSince?: Date;
  showFullPeriod?: boolean;
  title?: string;
}

// Generate realistic AUM trend data based on current value
const generateAumTrendData = (currentValue: number, clientSince?: Date, showFullPeriod: boolean = false) => {
  const data = [];
  const today = new Date();
  
  // Determine start date based on parameters
  let startDate = new Date(today);
  if (showFullPeriod && clientSince instanceof Date && !isNaN(clientSince.getTime())) {
    // If showing full period and we have a valid client since date, use it
    startDate = new Date(clientSince);
  } else {
    // Default to 3 years ago
    startDate.setFullYear(today.getFullYear() - 3);
  }
  
  // Calculate number of quarters between start and now
  const quarterDiff = Math.max(
    1,
    Math.ceil(
      (today.getTime() - startDate.getTime()) / (3 * 30 * 24 * 60 * 60 * 1000)
    )
  );
  
  // Start with a lower value (60-80% of current based on time period)
  const reductionFactor = showFullPeriod ? 0.6 : 0.85; // More reduction for longer periods
  let startValue = currentValue * reductionFactor;
  
  // Generate quarterly data points
  for (let i = 0; i <= quarterDiff; i++) {
    const date = new Date(startDate);
    date.setMonth(startDate.getMonth() + (i * 3));
    
    // Calculate growth with a realistic pattern (faster growth in recent quarters)
    const progress = i / quarterDiff; // 0 to 1 representing progress through the timeline
    
    // Growth rate varies - starts slower and accelerates
    const baseGrowthRate = 0.01;
    const maxGrowthRate = 0.03;
    const growthRate = baseGrowthRate + (progress * maxGrowthRate); 
    
    // Add market cycles - more volatility for longer periods
    const cycleFactor = Math.sin(progress * Math.PI * (showFullPeriod ? 3 : 1.5)) * 0.05;
    
    // Add some randomness to make it realistic
    const randomFactor = 0.98 + (Math.random() * 0.04); // Random factor between 0.98 and 1.02
    
    // Calculate the value for this quarter with growth, cycles and randomness
    const value = startValue * Math.pow(1 + growthRate, i) * (1 + cycleFactor) * randomFactor;
    
    data.push({
      date: date.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }),
      value: i === quarterDiff ? currentValue : value // Ensure the last value is exactly the current AUM
    });
  }
  
  return data;
};

const AumTrendChart: React.FC<AumTrendChartProps> = ({ 
  currentValue, 
  clientSince, 
  showFullPeriod = false,
  title
}) => {
  const data = generateAumTrendData(currentValue, clientSince, showFullPeriod);
  
  const formatTooltipValue = (value: number) => {
    return `₹${(value / 100000).toFixed(2)} L`;
  };
  
  const formatYAxis = (value: number) => {
    return `₹${(value / 100000).toFixed(0)} L`;
  };
  
  return (
    <div>
      {title && <div className="text-sm font-medium mb-2">{title}</div>}
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
            domain={['dataMin - 50000', 'dataMax + 50000']}
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
            stroke="#2563EB"
            strokeWidth={3.75}
            dot={false}
            activeDot={{ r: 6, stroke: "#2563EB", strokeWidth: 2, fill: "white" }}
            animationDuration={1000}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default AumTrendChart;