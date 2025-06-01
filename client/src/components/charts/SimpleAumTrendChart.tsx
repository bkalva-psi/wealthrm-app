import React, { useState, useMemo } from 'react';

interface SimpleAumTrendChartProps {
  aumValue: number;
}

type TimeRange = '3m' | '6m' | '1y' | '3y';

/**
 * A simple SVG-based AUM trend chart component with tooltip on hover and time range filtering
 */
const SimpleAumTrendChart: React.FC<SimpleAumTrendChartProps> = ({ aumValue }) => {
  // State for time range filter
  const [timeRange, setTimeRange] = useState<TimeRange>('3y');
  
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
  
  // Calculate date ranges based on selected time frame
  const getDateRangeInfo = (selectedRange: TimeRange) => {
    const today = new Date();
    let startDate: Date;
    let rangeLabel: string;
    let pointCount: number;
    
    switch (selectedRange) {
      case '3m':
        startDate = new Date(today);
        startDate.setMonth(today.getMonth() - 3);
        rangeLabel = '3 months';
        pointCount = 12; // Weekly data points
        break;
      case '6m':
        startDate = new Date(today);
        startDate.setMonth(today.getMonth() - 6);
        rangeLabel = '6 months';
        pointCount = 24; // Weekly data points
        break;
      case '1y':
        startDate = new Date(today);
        startDate.setFullYear(today.getFullYear() - 1);
        rangeLabel = '1 year';
        pointCount = 12; // Monthly data points
        break;
      case '3y':
      default:
        startDate = new Date(today);
        startDate.setFullYear(today.getFullYear() - 3);
        rangeLabel = '3 years';
        pointCount = 36; // Monthly data points
        break;
    }
    
    return { startDate, endDate: today, rangeLabel, pointCount };
  };
  
  // Create consistent random points for the line chart based on selected time range
  const generatePoints = () => {
    // Get date range info based on selected time frame
    const { startDate, endDate, pointCount } = getDateRangeInfo(timeRange);
    
    // Create data points with dates and values
    const points = [];
    
    // Calculate start and end values - shorter timeframes have less growth
    let startValue: number;
    const endValue = aumValue;
    
    // Adjust starting value based on time range - less time means less growth
    switch (timeRange) {
      case '3m':
        startValue = aumValue * 0.95; // 5% growth in 3 months
        break;
      case '6m':
        startValue = aumValue * 0.90; // 10% growth in 6 months
        break;
      case '1y':
        startValue = aumValue * 0.85; // 15% growth in 1 year
        break;
      case '3y':
      default:
        startValue = aumValue * 0.75; // 25% growth in 3 years
        break;
    }
    
    // Number of data points based on selected range
    const totalPoints = pointCount;
    
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
  // Include timeRange in dependency array to recalculate when it changes
  const dataPoints = useMemo(() => generatePoints(), [aumValue, timeRange]);
  
  // Get time range label for display
  const { rangeLabel } = getDateRangeInfo(timeRange);
  
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
  
  // Handle time range selection
  const handleTimeRangeChange = (range: TimeRange) => {
    setTimeRange(range);
  };
  
  // Calculate growth percentage
  const growthPercentage = ((dataPoints[dataPoints.length-1].value / dataPoints[0].value - 1) * 100).toFixed(1);
  
  return (
    <div className="w-full h-full">
      <div className="flex flex-col h-full">
        <div className="flex justify-between items-start mb-3">
          <div className="grid grid-cols-2 gap-x-4 gap-y-1">
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground font-medium">Start</span>
              <span className="text-xs">₹{(dataPoints[0].value / 100000).toFixed(1)}L</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground font-medium">Current</span>
              <span className="text-xs">₹{(dataPoints[dataPoints.length-1].value / 100000).toFixed(1)}L</span>
            </div>
          </div>
          
          <div className="flex text-xs rounded-md overflow-hidden border border-border">
            <button 
              onClick={() => handleTimeRangeChange('3m')}
              className={`px-2 py-0.5 transition-colors ${timeRange === '3m' ? 'bg-primary text-primary-foreground' : 'bg-background hover:bg-muted text-foreground'}`}
            >
              3M
            </button>
            <button 
              onClick={() => handleTimeRangeChange('6m')}
              className={`px-2 py-0.5 transition-colors ${timeRange === '6m' ? 'bg-primary text-primary-foreground' : 'bg-background hover:bg-muted text-foreground'}`}
            >
              6M
            </button>
            <button 
              onClick={() => handleTimeRangeChange('1y')}
              className={`px-2 py-0.5 transition-colors ${timeRange === '1y' ? 'bg-primary text-primary-foreground' : 'bg-background hover:bg-muted text-foreground'}`}
            >
              1Y
            </button>
            <button 
              onClick={() => handleTimeRangeChange('3y')}
              className={`px-2 py-0.5 transition-colors ${timeRange === '3y' ? 'bg-primary text-primary-foreground' : 'bg-background hover:bg-muted text-foreground'}`}
            >
              3Y
            </button>
          </div>
        </div>
        
        <div className="relative pt-2">
          
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
          
          {/* Dynamic date markers based on selected time range */}
          <div className="absolute w-full bottom-1 left-0 grid grid-cols-4">
            {timeRange === '3m' && (
              <>
                <span className="text-xs text-center">{new Date(new Date().setMonth(new Date().getMonth() - 3)).toLocaleDateString('en-US', {month: 'short'})}</span>
                <span className="text-xs text-center">{new Date(new Date().setMonth(new Date().getMonth() - 2)).toLocaleDateString('en-US', {month: 'short'})}</span>
                <span className="text-xs text-center">{new Date(new Date().setMonth(new Date().getMonth() - 1)).toLocaleDateString('en-US', {month: 'short'})}</span>
                <span className="text-xs text-center">{new Date().toLocaleDateString('en-US', {month: 'short'})}</span>
              </>
            )}
            {timeRange === '6m' && (
              <>
                <span className="text-xs text-center">{new Date(new Date().setMonth(new Date().getMonth() - 6)).toLocaleDateString('en-US', {month: 'short'})}</span>
                <span className="text-xs text-center">{new Date(new Date().setMonth(new Date().getMonth() - 4)).toLocaleDateString('en-US', {month: 'short'})}</span>
                <span className="text-xs text-center">{new Date(new Date().setMonth(new Date().getMonth() - 2)).toLocaleDateString('en-US', {month: 'short'})}</span>
                <span className="text-xs text-center">{new Date().toLocaleDateString('en-US', {month: 'short'})}</span>
              </>
            )}
            {timeRange === '1y' && (
              <>
                <span className="text-xs text-center">{new Date(new Date().setFullYear(new Date().getFullYear() - 1)).toLocaleDateString('en-US', {month: 'short'})}</span>
                <span className="text-xs text-center">{new Date(new Date().setMonth(new Date().getMonth() - 8)).toLocaleDateString('en-US', {month: 'short'})}</span>
                <span className="text-xs text-center">{new Date(new Date().setMonth(new Date().getMonth() - 4)).toLocaleDateString('en-US', {month: 'short'})}</span>
                <span className="text-xs text-center">{new Date().toLocaleDateString('en-US', {month: 'short'})}</span>
              </>
            )}
            {timeRange === '3y' && (
              <>
                <span className="text-xs text-center">Y-3</span>
                <span className="text-xs text-center">Y-2</span>
                <span className="text-xs text-center">Y-1</span>
                <span className="text-xs text-center">Now</span>
              </>
            )}
          </div>
        </div>
        
        <div className="text-center mt-4 text-sm font-medium text-green-600">
          +{growthPercentage}% growth over {rangeLabel}
        </div>
      </div>
    </div>
  );
};

export default SimpleAumTrendChart;