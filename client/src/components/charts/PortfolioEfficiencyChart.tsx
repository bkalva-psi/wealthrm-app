import React, { useState } from 'react';

interface DataPoint {
  name: string;
  risk: number;
  return: number;
  size: number;
  type: string;
}

interface PortfolioEfficiencyChartProps {
  holdings?: { name: string; type: string; value: number; allocation: number; gain: number }[];
}

const PortfolioEfficiencyChart: React.FC<PortfolioEfficiencyChartProps> = ({ 
  holdings = [] 
}) => {
  const [hoveredPoint, setHoveredPoint] = useState<DataPoint | null>(null);
  
  // Generate realistic risk values based on asset type and returns
  const getEstimatedRisk = (type: string, returns: number): number => {
    // Base risk levels by asset class
    const baseRisks: {[key: string]: number} = {
      'Cash': 0.5,
      'Fixed Income': 3,
      'Debt': 3,
      'Gold': 15,
      'Equity': 18,
      'Direct Equity': 22
    };
    
    // Find the matching asset class
    let baseRisk = 10; // Default risk if type not found
    
    for (const assetClass in baseRisks) {
      if (type.includes(assetClass)) {
        baseRisk = baseRisks[assetClass];
        break;
      }
    }
    
    // Add some variation based on returns
    // Higher returns typically come with higher risk
    const returnFactor = Math.abs(returns) / 10;
    
    // Random factor to make the points more scattered
    const randomFactor = (Math.random() * 4) - 2; // -2 to +2
    
    return Math.max(0.5, baseRisk + returnFactor + randomFactor);
  };
  
  // Process holdings data to create scatter plot points
  const processData = (): DataPoint[] => {
    if (!holdings.length) {
      // Return sample data if no holdings provided
      return [
        { name: "HDFC Top 100 Fund", risk: 15.2, return: 15.4, size: 25, type: "Mutual Fund - Equity" },
        { name: "SBI Small Cap Fund", risk: 18.6, return: 22.8, size: 17.5, type: "Mutual Fund - Equity" },
        { name: "ICICI Prudential Bond Fund", risk: 3.8, return: 7.2, size: 20, type: "Mutual Fund - Debt" },
        { name: "Reliance Industries", risk: 19.8, return: 18.7, size: 12.5, type: "Direct Equity" },
        { name: "HDFC Bank", risk: 17.3, return: 9.8, size: 10, type: "Direct Equity" },
        { name: "Gold ETF", risk: 14.1, return: 11.2, size: 7.5, type: "Gold ETF" },
        { name: "Savings Account", risk: 0.8, return: 3.5, size: 7.5, type: "Cash" }
      ];
    }
    
    return holdings.map(holding => ({
      name: holding.name,
      risk: getEstimatedRisk(holding.type, holding.gain),
      return: holding.gain,
      size: holding.allocation,
      type: holding.type
    }));
  };
  
  // Generate data points
  const dataPoints = processData();
  
  // Calculate portfolio risk and return (weighted average)
  const portfolioStats = dataPoints.reduce(
    (acc, point) => {
      acc.risk += (point.risk * point.size / 100);
      acc.return += (point.return * point.size / 100);
      return acc;
    },
    { risk: 0, return: 0 }
  );
  
  // Create efficient frontier points
  const generateEfficientFrontier = () => {
    const points = [];
    const minRisk = Math.min(...dataPoints.map(p => p.risk)) * 0.8;
    const maxRisk = Math.max(...dataPoints.map(p => p.risk)) * 1.2;
    
    // Efficient frontier is approximated as a curved line showing optimal return for given risk
    for (let risk = minRisk; risk <= maxRisk; risk += (maxRisk - minRisk) / 20) {
      // Approximation of efficient frontier: return = a * sqrt(risk) + b
      // Parameters a and b are chosen to create a realistic curve
      const optimalReturn = 2.5 * Math.sqrt(risk) + 2;
      points.push({ risk, return: optimalReturn });
    }
    
    return points;
  };
  
  const efficientFrontier = generateEfficientFrontier();
  
  // Calculate SVG coordinates with proper spacing
  const margin = { top: 20, right: 20, bottom: 50, left: 60 };
  const width = 450 - margin.left - margin.right;
  const height = 280 - margin.top - margin.bottom;
  
  // Find min and max values for scaling
  const minRisk = Math.min(...dataPoints.map(p => p.risk)) * 0.8;
  const maxRisk = Math.max(...dataPoints.map(p => p.risk)) * 1.2;
  const minReturn = Math.min(...dataPoints.map(p => p.return)) * 0.8;
  const maxReturn = Math.max(...dataPoints.map(p => p.return)) * 1.2;
  
  // Scaling functions
  const xScale = (risk: number) => (risk - minRisk) / (maxRisk - minRisk) * width;
  const yScale = (ret: number) => height - (ret - minReturn) / (maxReturn - minReturn) * height;
  
  // Color function based on individual security name with some common mappings
  const getColor = (name: string, type: string) => {
    // First try to match by specific security name if name is provided
    if (name) {
      if (name.includes('HDFC')) return '#3b82f6'; // blue
      if (name.includes('SBI')) return '#8b5cf6'; // purple
      if (name.includes('ICICI')) return '#10b981'; // green
      if (name.includes('Reliance')) return '#f59e0b'; // amber
      if (name.includes('Gold')) return '#f59e0b'; // amber
      if (name.includes('Savings')) return '#6b7280'; // gray
    }
    
    // Fall back to asset type
    if (type.includes('Equity')) return '#ef4444'; // red
    if (type.includes('Debt') || type.includes('Fixed Income')) return '#84cc16'; // lime
    if (type.includes('Gold')) return '#f59e0b'; // amber
    if (type.includes('Cash')) return '#6b7280'; // gray
    
    // Default color
    return '#8b5cf6'; // purple
  };
  
  // Handle mouse events
  const handleMouseEnter = (point: DataPoint) => {
    setHoveredPoint(point);
  };
  
  const handleMouseLeave = () => {
    setHoveredPoint(null);
  };
  
  // Format efficient frontier as SVG path
  const efficientFrontierPath = efficientFrontier
    .map((point, i) => 
      `${i === 0 ? 'M' : 'L'} ${xScale(point.risk)} ${yScale(point.return)}`
    )
    .join(' ');
  
  return (
    <div className="h-full w-full flex flex-col">
      <div className="text-xs text-muted-foreground mb-1">
        <span className="font-medium">Portfolio Risk: </span>
        <span>{portfolioStats.risk.toFixed(1)}%</span>
        <span className="mx-2">|</span>
        <span className="font-medium">Portfolio Return: </span>
        <span className="text-green-600">{portfolioStats.return > 0 ? '+' : ''}{portfolioStats.return.toFixed(1)}%</span>
      </div>
      
      <div className="relative" style={{ height: "280px", width: "100%" }}>
        <svg 
          width="100%" 
          height="100%" 
          viewBox={`0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`}
          className="overflow-visible"
          preserveAspectRatio="xMidYMid meet"
        >
          <g transform={`translate(${margin.left}, ${margin.top})`}>
            {/* X and Y axis */}
            <line x1="0" y1={height} x2={width} y2={height} stroke="#e5e7eb" strokeWidth="1" />
            <line x1="0" y1="0" x2="0" y2={height} stroke="#e5e7eb" strokeWidth="1" />
            
            {/* X axis ticks and labels */}
            {[0, 5, 10, 15, 20, 25].map(tick => {
              if (tick < minRisk || tick > maxRisk) return null;
              const x = xScale(tick);
              return (
                <g key={`x-tick-${tick}`}>
                  <line 
                    x1={x} 
                    y1={height} 
                    x2={x} 
                    y2={height + 5} 
                    stroke="#9ca3af" 
                    strokeWidth="1" 
                  />
                  <text 
                    x={x} 
                    y={height + 20} 
                    textAnchor="middle" 
                    fontSize="10" 
                    fill="#6b7280"
                  >
                    {tick}%
                  </text>
                </g>
              );
            })}
            
            {/* Y axis ticks and labels */}
            {[0, 5, 10, 15, 20, 25].map(tick => {
              if (tick < minReturn || tick > maxReturn) return null;
              const y = yScale(tick);
              return (
                <g key={`y-tick-${tick}`}>
                  <line 
                    x1="-5" 
                    y1={y} 
                    x2="0" 
                    y2={y} 
                    stroke="#9ca3af" 
                    strokeWidth="1" 
                  />
                  <text 
                    x="-15" 
                    y={y + 3} 
                    textAnchor="end" 
                    fontSize="10" 
                    fill="#6b7280"
                  >
                    {tick}%
                  </text>
                </g>
              );
            })}
            
            {/* Efficient frontier line */}
            <path 
              d={efficientFrontierPath} 
              fill="none" 
              stroke="#8b5cf6" 
              strokeWidth="2" 
              strokeDasharray="5,3" 
              opacity="0.7" 
            />
            
            {/* Data points */}
            {dataPoints.map((point, i) => (
              <circle
                key={`point-${i}`}
                cx={xScale(point.risk)}
                cy={yScale(point.return)}
                r={Math.max(3, Math.sqrt(point.size) * 1.5)}
                fill={getColor(point.name, point.type)}
                opacity="0.8"
                stroke="#ffffff"
                strokeWidth="1"
                onMouseEnter={() => handleMouseEnter(point)}
                onMouseLeave={handleMouseLeave}
                style={{ cursor: 'pointer' }}
              />
            ))}
            
            {/* Portfolio point */}
            <circle
              cx={xScale(portfolioStats.risk)}
              cy={yScale(portfolioStats.return)}
              r="6"
              fill="#ef4444"
              stroke="#ffffff"
              strokeWidth="2"
              opacity="0.9"
              onMouseEnter={() => handleMouseEnter({
                name: "Current Portfolio",
                risk: portfolioStats.risk,
                return: portfolioStats.return,
                size: 100,
                type: "Portfolio"
              })}
              onMouseLeave={handleMouseLeave}
              style={{ cursor: 'pointer' }}
            />
            
            {/* Axis labels */}
            <text 
              x={width/2} 
              y={height + 35} 
              textAnchor="middle" 
              fontSize="11" 
              fontWeight="500" 
              fill="#4b5563"
            >
              Risk (Standard Deviation %)
            </text>
            
            <text 
              x="-45" 
              y={height/2} 
              textAnchor="middle" 
              transform={`rotate(-90, -45, ${height/2})`} 
              fontSize="11" 
              fontWeight="500" 
              fill="#4b5563"
            >
              Return (%)
            </text>
          </g>
        </svg>
        
        {/* Fixed Tooltip - positioned at top of chart with theme support */}
        {hoveredPoint && (
          <div 
            className="absolute bg-background border border-border rounded-md shadow-lg px-3 py-2 text-xs z-10 backdrop-blur-sm"
            style={{ 
              left: '50%', 
              top: '10px',
              transform: 'translateX(-50%)',
              width: '180px',
              backgroundColor: 'hsl(var(--background))',
              borderColor: 'hsl(var(--border))'
            }}
          >
            <div className="font-medium truncate text-foreground">{hoveredPoint.name}</div>
            <div className="text-muted-foreground text-[10px]">{hoveredPoint.type}</div>
            <div className="grid grid-cols-2 gap-x-4 mt-1 text-foreground">
              <div>Risk: <span className="font-medium">{hoveredPoint.risk.toFixed(1)}%</span></div>
              <div>Return: <span className={`font-medium ${hoveredPoint.return >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {hoveredPoint.return > 0 ? '+' : ''}{hoveredPoint.return.toFixed(1)}%
              </span></div>
              <div className="col-span-2">Allocation: <span className="font-medium">{hoveredPoint.size.toFixed(1)}%</span></div>
            </div>
          </div>
        )}
      </div>
      
      <div className="mt-1 flex justify-center gap-6 text-xs">
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-red-500 mr-1"></div>
          <span>Portfolio</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-0 border-t-2 border-dashed border-purple-500 mr-1"></div>
          <span>Efficient Frontier</span>
        </div>
      </div>
    </div>
  );
};

export default PortfolioEfficiencyChart;