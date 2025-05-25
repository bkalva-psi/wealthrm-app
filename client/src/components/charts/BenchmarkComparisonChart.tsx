import React, { useState, useMemo } from 'react';

interface BenchmarkComparisonChartProps {
  aumValue: number;
}

type TimeRange = '3m' | '6m' | '1y' | '3y';

/**
 * Chart comparing portfolio performance with benchmark (both normalized to base 100)
 */
const BenchmarkComparisonChart: React.FC<BenchmarkComparisonChartProps> = ({ aumValue }) => {
  // State for time range filter
  const [timeRange, setTimeRange] = useState<TimeRange>('1y');
  
  const [tooltipInfo, setTooltipInfo] = useState<{
    visible: boolean;
    x: number;
    y: number;
    portfolioValue: number;
    benchmarkValue: number;
    date: string;
  }>({
    visible: false,
    x: 0,
    y: 0,
    portfolioValue: 0,
    benchmarkValue: 0,
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
  
  // Generate consistent random points for both portfolio and benchmark
  const generatePoints = () => {
    // Get date range info based on selected time frame
    const { startDate, endDate, pointCount } = getDateRangeInfo(timeRange);
    
    // Seed for consistent randomness
    const seed = aumValue.toString().slice(-4);
    let seedValue = parseInt(seed) || 12345;
    
    // Simple pseudo-random function with seed
    const random = () => {
      seedValue = (seedValue * 9301 + 49297) % 233280;
      return seedValue / 233280;
    };
    
    // Number of data points based on selected range
    const totalPoints = pointCount;
    
    // Initialize arrays for portfolio and benchmark data
    const portfolioData = [];
    const benchmarkData = [];
    
    // First point is 100 for both (base index)
    portfolioData.push(100);
    benchmarkData.push(100);
    
    // Generate subsequent points
    for (let i = 1; i <= totalPoints; i++) {
      // Portfolio usually outperforms benchmark (weighted random)
      const portfolioChange = (random() * 4 - 1.2) * (timeRange === '3m' ? 0.5 : 1); // -1.2% to +2.8% change
      const benchmarkChange = (random() * 3 - 1.3) * (timeRange === '3m' ? 0.5 : 1); // -1.3% to +1.7% change
      
      // Calculate new values based on previous point
      const newPortfolioValue = portfolioData[i-1] * (1 + portfolioChange/100);
      const newBenchmarkValue = benchmarkData[i-1] * (1 + benchmarkChange/100);
      
      portfolioData.push(newPortfolioValue);
      benchmarkData.push(newBenchmarkValue);
    }
    
    // Format dates and prepare chart points
    const chartPoints = [];
    
    for (let i = 0; i <= totalPoints; i++) {
      // Calculate the date for this point
      const pointDate = new Date(startDate);
      if (timeRange === '3m' || timeRange === '6m') {
        // Weekly for short timeframes
        pointDate.setDate(startDate.getDate() + (i * 7));
      } else {
        // Monthly for longer timeframes
        pointDate.setMonth(startDate.getMonth() + i);
      }
      
      // Format date
      const dateString = pointDate.toLocaleDateString('en-US', { 
        month: 'short', 
        year: 'numeric' 
      });
      
      // Calculate x-coordinate
      const xCoord = i * (100 / totalPoints);
      
      // Calculate y-coordinates (SVG y=0 is top)
      // Find min and max values for proper scaling
      const allValues = [...portfolioData, ...benchmarkData];
      const minValue = Math.min(...allValues) * 0.98; // Add 2% padding at bottom
      const maxValue = Math.max(...allValues) * 1.02; // Add 2% padding at top
      
      const portfolioYCoord = 40 - ((portfolioData[i] - minValue) / (maxValue - minValue) * 40);
      const benchmarkYCoord = 40 - ((benchmarkData[i] - minValue) / (maxValue - minValue) * 40);
      
      chartPoints.push({
        date: dateString,
        x: xCoord,
        portfolioValue: portfolioData[i],
        portfolioY: portfolioYCoord,
        benchmarkValue: benchmarkData[i],
        benchmarkY: benchmarkYCoord,
      });
    }
    
    return chartPoints;
  };
  
  // Generate data points using memoization to keep them consistent between renders
  const chartPoints = useMemo(() => generatePoints(), [aumValue, timeRange]);
  
  // Get time range label for display
  const { rangeLabel } = getDateRangeInfo(timeRange);
  
  // Create SVG points strings for polylines
  const portfolioPointsString = chartPoints.map(p => `${p.x},${p.portfolioY}`).join(' ');
  const benchmarkPointsString = chartPoints.map(p => `${p.x},${p.benchmarkY}`).join(' ');
  
  // Handle mouse movement over the chart
  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const svgRect = e.currentTarget.getBoundingClientRect();
    const xPosition = (e.clientX - svgRect.left) / svgRect.width * 100;
    
    // Find the closest point
    let closestPoint = chartPoints[0];
    let minDistance = Math.abs(closestPoint.x - xPosition);
    
    for (const point of chartPoints) {
      const distance = Math.abs(point.x - xPosition);
      if (distance < minDistance) {
        minDistance = distance;
        closestPoint = point;
      }
    }
    
    // Show tooltip with both portfolio and benchmark values
    setTooltipInfo({
      visible: true,
      x: closestPoint.x,
      y: Math.min(closestPoint.portfolioY, closestPoint.benchmarkY) - 5, // Position above highest line
      portfolioValue: closestPoint.portfolioValue,
      benchmarkValue: closestPoint.benchmarkValue,
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
  
  // Calculate final performance values for display
  const portfolioFinalValue = chartPoints[chartPoints.length-1].portfolioValue;
  const benchmarkFinalValue = chartPoints[chartPoints.length-1].benchmarkValue;
  const outperformance = (portfolioFinalValue - benchmarkFinalValue).toFixed(1);
  
  return (
    <div className="w-full h-full">
      <div className="flex flex-col h-full">
        <div className="flex justify-between items-start mb-3">
          <div className="grid grid-cols-2 gap-x-4 gap-y-1">
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground font-medium">Portfolio</span>
              <span className="text-xs font-medium text-blue-600">{portfolioFinalValue.toFixed(1)}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground font-medium">Benchmark</span>
              <span className="text-xs font-medium text-gray-600">{benchmarkFinalValue.toFixed(1)}</span>
            </div>
          </div>
          
          <div className="flex text-xs rounded-md overflow-hidden border">
            <button 
              onClick={() => handleTimeRangeChange('3m')}
              className={`px-2 py-0.5 ${timeRange === '3m' ? 'bg-blue-100 text-blue-800' : 'bg-white hover:bg-gray-50'}`}
            >
              3M
            </button>
            <button 
              onClick={() => handleTimeRangeChange('6m')}
              className={`px-2 py-0.5 ${timeRange === '6m' ? 'bg-blue-100 text-blue-800' : 'bg-white hover:bg-gray-50'}`}
            >
              6M
            </button>
            <button 
              onClick={() => handleTimeRangeChange('1y')}
              className={`px-2 py-0.5 ${timeRange === '1y' ? 'bg-blue-100 text-blue-800' : 'bg-white hover:bg-gray-50'}`}
            >
              1Y
            </button>
            <button 
              onClick={() => handleTimeRangeChange('3y')}
              className={`px-2 py-0.5 ${timeRange === '3y' ? 'bg-blue-100 text-blue-800' : 'bg-white hover:bg-gray-50'}`}
            >
              3Y
            </button>
          </div>
        </div>
        
        <div className="relative pt-2">
          {/* Chart legend */}
          <div className="flex items-center justify-center gap-6 text-xs">
            <div className="flex items-center">
              <div className="w-3 h-1 bg-blue-600 mr-1"></div>
              <span>Portfolio</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-1 bg-gray-600 mr-1"></div>
              <span>Benchmark</span>
            </div>
          </div>
          
          {/* Visual trend lines */}
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
                
                {/* Start line at base 100 */}
                <line x1="0" y1="40" x2="100" y2="40" stroke="#e0e0e0" strokeWidth="1" strokeDasharray="2,2" />
                
                {/* Benchmark line */}
                <polyline 
                  points={benchmarkPointsString}
                  fill="none"
                  stroke="#666666" 
                  strokeWidth="1.25"
                  strokeLinejoin="round"
                  strokeLinecap="round"
                />
                
                {/* Portfolio line (on top) */}
                <polyline 
                  points={portfolioPointsString}
                  fill="none"
                  stroke="#1e40af"
                  strokeWidth="1.25"
                  strokeLinejoin="round"
                  strokeLinecap="round"
                />
                
                {/* Tooltip indicator circles */}
                {tooltipInfo.visible && (
                  <>
                    <circle 
                      cx={tooltipInfo.x} 
                      cy={chartPoints.find(p => p.x === tooltipInfo.x)?.benchmarkY || 0} 
                      r="3" 
                      fill="#666666"
                      stroke="#ffffff" 
                      strokeWidth="1.5"
                    />
                    <circle 
                      cx={tooltipInfo.x} 
                      cy={chartPoints.find(p => p.x === tooltipInfo.x)?.portfolioY || 0} 
                      r="3" 
                      fill="#1e40af"
                      stroke="#ffffff" 
                      strokeWidth="1.5"
                    />
                  </>
                )}
              </svg>
              
              {/* Tooltip */}
              {tooltipInfo.visible && (
                <div 
                  className="absolute bg-white border border-gray-200 rounded-md shadow-sm px-2 py-1 text-xs"
                  style={{ 
                    left: `${tooltipInfo.x}%`, 
                    top: `${tooltipInfo.y}px`,
                    transform: 'translate(-50%, -100%)'
                  }}
                >
                  <div className="font-medium">{tooltipInfo.date}</div>
                  <div className="flex justify-between gap-3">
                    <span className="text-blue-600">Portfolio: {tooltipInfo.portfolioValue.toFixed(1)}</span>
                    <span className="text-gray-600">Benchmark: {tooltipInfo.benchmarkValue.toFixed(1)}</span>
                  </div>
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
        
        <div className="text-center mt-4 text-sm font-medium text-blue-600">
          Outperforming benchmark by {outperformance}% over {rangeLabel}
        </div>
      </div>
    </div>
  );
};

export default BenchmarkComparisonChart;