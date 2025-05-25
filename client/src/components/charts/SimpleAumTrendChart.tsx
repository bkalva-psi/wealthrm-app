import React, { useState } from 'react';

interface SimpleAumTrendChartProps {
  aumValue: number;
}

/**
 * A simple SVG-based AUM trend chart component with tooltip on hover
 */
const SimpleAumTrendChart: React.FC<SimpleAumTrendChartProps> = ({ aumValue }) => {
  const [tooltipInfo, setTooltipInfo] = useState<{
    visible: boolean;
    x: number;
    y: number;
    value: number;
    date: string;
  }>({
    visible: false,
    x: 0,
    y: 0,
    value: 0,
    date: ''
  });
  
  // Create consistent random points for the line chart
  const generatePoints = () => {
    // Create data points with dates and values
    const points = [];
    const startDate = new Date(2022, 4, 1); // May 2022
    const endDate = new Date(2025, 4, 1);   // May 2025
    const startValue = aumValue * 0.85;
    const endValue = aumValue;
    
    // Number of data points
    const totalPoints = 36; // Monthly data for 3 years
    
    // Seed for consistent randomness
    const seed = aumValue.toString().slice(-4);
    let seedValue = parseInt(seed) || 12345;
    
    // Simple pseudo-random function with seed
    const random = () => {
      seedValue = (seedValue * 9301 + 49297) % 233280;
      return seedValue / 233280;
    };
    
    // Start with the initial value
    let prevValue = startValue;
    
    // Store all values to find min and max
    const allValues = [];
    
    // First pass - generate all the raw values
    for (let i = 0; i <= totalPoints; i++) {
      // Calculate the date for this point
      const pointDate = new Date(startDate);
      pointDate.setMonth(startDate.getMonth() + i);
      
      // Format date as MMM YYYY
      const dateString = pointDate.toLocaleDateString('en-US', { 
        month: 'short', 
        year: 'numeric' 
      });
      
      // Calculate progress through the timeline
      const progress = i / totalPoints;
      
      // Trend line value (linear progression from start to end)
      const trendValue = startValue + (endValue - startValue) * progress;
      
      // Random walk with trend reversion
      const volatility = 0.03; // 3% volatility
      const randomFactor = (random() * 2 - 1) * volatility; // Between -3% and +3%
      const reversion = (trendValue - prevValue) * 0.3; // 30% reversion to trend
      
      // New value with random fluctuation
      let newValue = prevValue * (1 + randomFactor) + reversion;
      
      // More volatility in the middle of the time period
      const extraVolatility = progress * (1 - progress) * 0.1; // Up to 10% extra in middle
      newValue = newValue * (1 + (random() * 2 - 1) * extraVolatility);
      
      allValues.push(newValue);
      prevValue = newValue;
    }
    
    // Make sure start and end values are as expected
    allValues[0] = startValue;
    allValues[allValues.length - 1] = endValue;
    
    // Find actual min and max from the generated data
    const minValue = Math.min(...allValues) * 0.98; // Add 2% padding at bottom
    const maxValue = Math.max(...allValues) * 1.02; // Add 2% padding at top
    
    // Reset for second pass
    prevValue = startValue;
    seedValue = parseInt(seed) || 12345;
    
    // Second pass - now we know min and max, so we can properly scale the y-coordinates
    for (let i = 0; i <= totalPoints; i++) {
      // Calculate the date for this point
      const pointDate = new Date(startDate);
      pointDate.setMonth(startDate.getMonth() + i);
      
      // Format date as MMM YYYY
      const dateString = pointDate.toLocaleDateString('en-US', { 
        month: 'short', 
        year: 'numeric' 
      });
      
      // Calculate progress through the timeline
      const progress = i / totalPoints;
      
      // Trend line value (linear progression from start to end)
      const trendValue = startValue + (endValue - startValue) * progress;
      
      // Random walk with trend reversion
      const volatility = 0.03; // 3% volatility
      const randomFactor = (random() * 2 - 1) * volatility; // Between -3% and +3%
      const reversion = (trendValue - prevValue) * 0.3; // 30% reversion to trend
      
      // New value with random fluctuation
      let newValue = prevValue * (1 + randomFactor) + reversion;
      
      // More volatility in the middle of the time period
      const extraVolatility = progress * (1 - progress) * 0.1; // Up to 10% extra in middle
      newValue = newValue * (1 + (random() * 2 - 1) * extraVolatility);
      
      // Adjust the first and last values
      if (i === 0) newValue = startValue;
      if (i === totalPoints) newValue = endValue;
      
      // Scale to full SVG height (40 units)
      // Note: In SVG, y=0 is the top, so we invert the calculation
      const yCoord = 40 - ((newValue - minValue) / (maxValue - minValue) * 40);
      
      points.push({
        date: dateString,
        value: newValue,
        x: i * (100 / totalPoints),
        y: yCoord
      });
      
      prevValue = newValue;
    }
    
    return points;
  };
  
  // Generate data points using memoization to keep them consistent between renders
  const dataPoints = React.useMemo(() => generatePoints(), [aumValue]);
  
  // Create SVG points string for polyline
  const pointsString = dataPoints.map(p => `${p.x},${p.y}`).join(' ');
  
  // Handle mouse movement over the chart
  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const svgRect = e.currentTarget.getBoundingClientRect();
    const xPosition = (e.clientX - svgRect.left) / svgRect.width * 100;
    
    // Find the closest point
    let closestPoint = dataPoints[0];
    let minDistance = Math.abs(closestPoint.x - xPosition);
    
    for (const point of dataPoints) {
      const distance = Math.abs(point.x - xPosition);
      if (distance < minDistance) {
        minDistance = distance;
        closestPoint = point;
      }
    }
    
    // Show tooltip with the point's information
    setTooltipInfo({
      visible: true,
      x: closestPoint.x,
      y: closestPoint.y,
      value: closestPoint.value,
      date: closestPoint.date
    });
  };
  
  const handleMouseLeave = () => {
    setTooltipInfo({ ...tooltipInfo, visible: false });
  };
  
  return (
    <div className="w-full h-full">
      <div className="flex flex-col h-full">
        <div className="flex justify-between mb-2">
          <span className="text-xs text-muted-foreground">
            May 2022
          </span>
          <span className="text-xs text-muted-foreground">
            May 2025
          </span>
        </div>
        
        <div className="relative pt-5">
          <div className="absolute top-0 left-0 text-xs text-muted-foreground">
            ₹{(dataPoints[0].value * 1.02 / 100000).toFixed(1)}L
          </div>
          <div className="absolute bottom-0 left-0 text-xs text-muted-foreground">
            ₹{(Math.min(...dataPoints.map(p => p.value)) * 0.98 / 100000).toFixed(1)}L
          </div>
          
          {/* Visual trend line */}
          <div className="h-40 w-full relative flex items-end mt-4">
            <div className="absolute w-full h-[1px] bg-gray-200 top-0"></div>
            <div className="absolute w-full h-[1px] bg-gray-200 bottom-0"></div>
            
            <div className="w-full h-full flex items-end">
              <svg 
                viewBox="0 0 100 40" 
                preserveAspectRatio="none" 
                className="w-full h-full"
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
              >
                {/* Background grid */}
                <line x1="0" y1="10" x2="100" y2="10" stroke="#f0f0f0" strokeWidth="1" />
                <line x1="0" y1="20" x2="100" y2="20" stroke="#f0f0f0" strokeWidth="1" />
                <line x1="0" y1="30" x2="100" y2="30" stroke="#f0f0f0" strokeWidth="1" />
                
                {/* Smooth line chart */}
                <polyline 
                  points={pointsString}
                  fill="none"
                  stroke="#1e40af" /* Deep blue color that should be clearly visible */
                  strokeWidth="1.25"
                  strokeLinejoin="round"
                  strokeLinecap="round"
                />
                
                {/* Tooltip indicator circle */}
                {tooltipInfo.visible && (
                  <circle 
                    cx={tooltipInfo.x} 
                    cy={tooltipInfo.y} 
                    r="4" 
                    fill="#1e40af"
                    stroke="#ffffff" 
                    strokeWidth="1.5"
                  />
                )}
              </svg>
              
              {/* Tooltip */}
              {tooltipInfo.visible && (
                <div 
                  className="absolute bg-white border border-gray-200 rounded-md shadow-sm px-2 py-1 text-xs"
                  style={{ 
                    left: `${tooltipInfo.x}%`, 
                    top: `${tooltipInfo.y}px`,
                    transform: 'translate(-50%, -120%)'
                  }}
                >
                  <div className="font-medium">{tooltipInfo.date}</div>
                  <div>₹{(tooltipInfo.value / 100000).toFixed(2)} L</div>
                </div>
              )}
            </div>
          </div>
          
          {/* Date markers - using text-center to prevent overlap */}
          <div className="grid grid-cols-4 mt-2">
            <span className="text-xs text-center">Q2'22</span>
            <span className="text-xs text-center">Q2'23</span>
            <span className="text-xs text-center">Q2'24</span>
            <span className="text-xs text-center">Q2'25</span>
          </div>
        </div>
        
        <div className="text-center mt-4 text-sm font-medium text-green-600">
          +{((aumValue / (aumValue * 0.85) - 1) * 100).toFixed(1)}% growth over 3 years
        </div>
      </div>
    </div>
  );
};

export default SimpleAumTrendChart;