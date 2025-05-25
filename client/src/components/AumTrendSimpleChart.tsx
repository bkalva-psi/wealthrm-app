import React from 'react';
import { Card } from "@/components/ui/card";

// Simple component to display AUM trend
const AumTrendSimpleChart: React.FC<{ aumValue: number }> = ({ aumValue }) => {
  // Generate data points for visual representation
  const generateDataPoints = () => {
    const points = [];
    // Start with 85% of current value and gradually increase
    const startValue = aumValue * 0.85;
    
    for (let i = 0; i <= 12; i++) {
      // Calculate position and height for each point
      const progress = i / 12;
      const growth = startValue * (1 + progress * 0.18);
      const height = (growth / aumValue) * 80; // Scale to max height of 80px
      
      points.push({
        value: growth,
        height: `${height}px`,
        label: getQuarterLabel(i)
      });
    }
    
    return points;
  };
  
  // Generate quarter labels for the chart
  const getQuarterLabel = (quarterIndex: number) => {
    const today = new Date();
    let year = today.getFullYear() - 3;
    let quarter = Math.floor(today.getMonth() / 3) + 1;
    
    // Move forward by the specified number of quarters
    for (let i = 0; i < quarterIndex; i++) {
      quarter++;
      if (quarter > 4) {
        quarter = 1;
        year++;
      }
    }
    
    return `Q${quarter} ${year}`;
  };
  
  const dataPoints = generateDataPoints();
  
  return (
    <div className="w-full h-full">
      <div className="flex flex-col h-full">
        <div className="flex justify-between mb-2">
          <span className="text-xs text-gray-500">₹{(aumValue * 0.85 / 100000).toFixed(1)}L</span>
          <span className="text-xs text-gray-500">₹{(aumValue / 100000).toFixed(1)}L</span>
        </div>
        
        <div className="flex items-end h-80 justify-between">
          {dataPoints.map((point, index) => (
            <div key={index} className="flex flex-col items-center">
              <div 
                className="w-4 rounded-t bg-primary" 
                style={{ height: point.height }}
                title={`₹${(point.value / 100000).toFixed(2)}L - ${point.label}`}
              ></div>
              {index % 3 === 0 && (
                <span className="text-xs mt-1 transform -rotate-45 origin-top-left">
                  {point.label}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AumTrendSimpleChart;