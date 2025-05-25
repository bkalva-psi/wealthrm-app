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
    
    // Generate 20 points with random variations
    const totalPoints = 20;
    for (let i = 0; i <= totalPoints; i++) {
      const progress = i / totalPoints;
      // Linear progression from start to end with random variation
      const baseY = startValue - (startValue - endValue) * progress;
      
      // Add more variation in the middle, less at the start and end
      const variationFactor = progress * (1 - progress) * 4;
      const variation = (Math.random() * 2 - 1) * variationFactor;
      
      points.push({
        x: i * (100 / totalPoints),
        y: baseY + variation
      });
    }
    
    // Ensure the first and last points are exact
    points[0].y = startValue;
    points[points.length - 1].y = endValue;
    
    return points;
  };
  
  const dataPoints = generateRandomPoints();
  
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
                {/* Polyline for chart */}
                <polyline 
                  points={pointsString}
                  fill="none"
                  stroke="var(--color-primary)"
                  strokeWidth="1.5"
                />
                
                {/* Data points */}
                <circle cx="0" cy={dataPoints[0].y} r="1.5" fill="var(--color-primary)" />
                <circle cx="25" cy={dataPoints[5].y} r="1.5" fill="var(--color-primary)" />
                <circle cx="50" cy={dataPoints[10].y} r="1.5" fill="var(--color-primary)" />
                <circle cx="75" cy={dataPoints[15].y} r="1.5" fill="var(--color-primary)" />
                <circle cx="100" cy={dataPoints[20].y} r="1.5" fill="var(--color-primary)" />
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