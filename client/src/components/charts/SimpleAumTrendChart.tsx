import React from 'react';

interface SimpleAumTrendChartProps {
  aumValue: number;
}

/**
 * A simple SVG-based AUM trend chart component
 */
const SimpleAumTrendChart: React.FC<SimpleAumTrendChartProps> = ({ aumValue }) => {
  // Create random points for the line chart
  const generateRandomPoints = () => {
    // Create fixed points array with random variation
    const points: {x: number, y: number}[] = [];
    
    // Start at 85% of current AUM value
    const startValue = 34; // 85% (in our SVG coordinate system)
    const endValue = 0;    // 100% (in our SVG coordinate system)
    
    // Generate 100 points with stronger random variations for a more natural market pattern
    const totalPoints = 100;
    
    // Previous point value to create realistic oscillations
    let prevY = startValue;
    
    for (let i = 0; i <= totalPoints; i++) {
      const progress = i / totalPoints;
      
      // Overall downward trend from startValue to endValue (remember in SVG, 0 is top)
      const trendValue = startValue - (startValue - endValue) * progress;
      
      // Create realistic market movements with small changes between points
      // Use a random walk pattern with trend reversion
      const randomWalk = (Math.random() * 2 - 1) * 0.8; // Random movement between -0.8 and +0.8
      const reversion = (trendValue - prevY) * 0.2; // Pull back to trend line
      
      // Calculate next point with more randomness for mid-range
      const variationAmplitude = progress * (1 - progress) * 6; // More variation in the middle
      const variation = randomWalk * variationAmplitude + reversion;
      
      // New Y value with limit to prevent extreme variations
      const newY = Math.max(0, Math.min(40, prevY + variation));
      prevY = newY;
      
      points.push({
        x: i * (100 / totalPoints),
        y: newY
      });
    }
    
    // Force the first and last points to be exact
    points[0].y = startValue;
    points[points.length - 1].y = endValue;
    
    return points;
  };
  
  // Generate points once, not on every render, using React.useMemo
  const dataPoints = React.useMemo(() => generateRandomPoints(), [aumValue]);
  
  // Convert points array to SVG polyline points string
  const pointsString = dataPoints.map(p => `${p.x},${p.y}`).join(' ');
  
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
            ₹{(aumValue / 100000).toFixed(1)}L
          </div>
          <div className="absolute bottom-0 left-0 text-xs text-muted-foreground">
            ₹{(aumValue * 0.85 / 100000).toFixed(1)}L
          </div>
          
          {/* Visual trend line */}
          <div className="h-40 w-full relative flex items-end mt-4">
            <div className="absolute w-full h-[1px] bg-gray-200 top-0"></div>
            <div className="absolute w-full h-[1px] bg-gray-200 bottom-0"></div>
            
            <div className="w-full h-full flex items-end">
              <svg viewBox="0 0 100 40" preserveAspectRatio="none" className="w-full h-full">
                {/* Smooth line chart without visible points */}
                <polyline 
                  points={pointsString}
                  fill="none"
                  stroke="var(--color-primary)"
                  strokeWidth="2"
                  strokeLinejoin="round"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>
          
          {/* Date markers */}
          <div className="flex justify-between mt-2">
            <span className="text-xs">Q2'22</span>
            <span className="text-xs">Q2'23</span>
            <span className="text-xs">Q2'24</span>
            <span className="text-xs">Q2'25</span>
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