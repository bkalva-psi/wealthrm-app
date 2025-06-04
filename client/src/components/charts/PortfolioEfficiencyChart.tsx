import React from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Line, ReferenceLine } from 'recharts';

interface DataPoint {
  name: string;
  risk: number;
  return: number;
  size: number;
  type: string;
  color?: string;
}

interface PortfolioEfficiencyChartProps {
  holdings?: { name: string; type: string; value: number; allocation: number; gain: number }[];
}

const PortfolioEfficiencyChart: React.FC<PortfolioEfficiencyChartProps> = ({ 
  holdings = [] 
}) => {
  // Generate realistic risk values based on asset type and returns
  const getEstimatedRisk = (type: string, returns: number): number => {
    const baseRisks: {[key: string]: number} = {
      'Cash': 0.5,
      'Fixed Income': 3,
      'Debt': 3,
      'Gold': 15,
      'Equity': 18,
      'Direct Equity': 22
    };
    
    let baseRisk = 10;
    for (const assetClass in baseRisks) {
      if (type.includes(assetClass)) {
        baseRisk = baseRisks[assetClass];
        break;
      }
    }
    
    const returnFactor = Math.abs(returns) / 10;
    const randomFactor = (Math.random() * 4) - 2;
    
    return Math.max(0.5, baseRisk + returnFactor + randomFactor);
  };

  // Process holdings data
  const processData = (): DataPoint[] => {
    if (!holdings.length) {
      return [
        { name: "HDFC Top 100 Fund", risk: 15.2, return: 15.4, size: 25, type: "Mutual Fund - Equity", color: "#3b82f6" },
        { name: "SBI Bluechip Fund", risk: 16.8, return: 13.2, size: 20, type: "Mutual Fund - Equity", color: "#8b5cf6" },
        { name: "ICICI Prudential Debt Fund", risk: 4.5, return: 7.1, size: 15, type: "Mutual Fund - Debt", color: "#10b981" },
        { name: "Gold ETF", risk: 18.3, return: 11.5, size: 12, type: "ETF - Gold", color: "#f59e0b" },
        { name: "Bank Fixed Deposits", risk: 1.2, return: 6.5, size: 18, type: "Fixed Income", color: "#6b7280" },
        { name: "Reliance Growth Fund", risk: 19.4, return: 16.8, size: 10, type: "Mutual Fund - Equity", color: "#ef4444" }
      ];
    }

    return holdings.map((holding, index) => ({
      name: holding.name,
      risk: getEstimatedRisk(holding.type, holding.gain),
      return: holding.gain,
      size: holding.allocation,
      type: holding.type,
      color: getColor(holding.name, holding.type)
    }));
  };

  // Color function
  const getColor = (name: string, type: string) => {
    if (name.includes('HDFC')) return '#3b82f6';
    if (name.includes('SBI')) return '#8b5cf6';
    if (name.includes('ICICI')) return '#10b981';
    if (name.includes('Reliance')) return '#f59e0b';
    if (name.includes('Gold')) return '#f59e0b';
    if (name.includes('Savings')) return '#6b7280';
    
    if (type.includes('Equity')) return '#ef4444';
    if (type.includes('Debt') || type.includes('Fixed Income')) return '#84cc16';
    if (type.includes('Gold')) return '#f59e0b';
    if (type.includes('Cash')) return '#6b7280';
    
    return '#8b5cf6';
  };

  const dataPoints = processData();

  // Portfolio statistics
  const portfolioStats = {
    risk: dataPoints.reduce((acc, point) => acc + (point.risk * point.size), 0) / 100,
    return: dataPoints.reduce((acc, point) => acc + (point.return * point.size), 0) / 100
  };

  // Add portfolio point to data
  const allDataPoints = [
    ...dataPoints,
    {
      name: "Current Portfolio",
      risk: portfolioStats.risk,
      return: portfolioStats.return,
      size: 100,
      type: "Portfolio",
      color: "#ef4444"
    }
  ];

  // Generate efficient frontier line data
  const generateEfficientFrontier = () => {
    const points = [];
    const minRisk = Math.min(...dataPoints.map(p => p.risk)) * 0.8;
    const maxRisk = Math.max(...dataPoints.map(p => p.risk)) * 1.2;
    
    for (let risk = minRisk; risk <= maxRisk; risk += (maxRisk - minRisk) / 20) {
      const optimalReturn = 2.5 * Math.sqrt(risk) + 2;
      points.push({ risk, return: optimalReturn });
    }
    
    return points;
  };

  const efficientFrontier = generateEfficientFrontier();

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-md shadow-lg px-3 py-2 text-xs">
          <div className="font-semibold text-gray-900 dark:text-gray-100">{data.name}</div>
          <div className="text-gray-500 dark:text-gray-400 text-[10px] mb-1">{data.type}</div>
          <div className="grid grid-cols-2 gap-x-3 text-gray-700 dark:text-gray-300">
            <div className="text-[11px]">Risk: <span className="font-medium">{data.risk.toFixed(1)}%</span></div>
            <div className="text-[11px]">Return: <span className={`font-medium ${data.return >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              {data.return > 0 ? '+' : ''}{data.return.toFixed(1)}%
            </span></div>
            <div className="col-span-2 text-[11px] mt-1">Allocation: <span className="font-medium">{data.size.toFixed(1)}%</span></div>
          </div>
        </div>
      );
    }
    return null;
  };

  // Custom dot component
  const CustomDot = (props: any) => {
    const { cx, cy, payload } = props;
    const radius = payload.name === "Current Portfolio" ? 6 : Math.max(3, Math.sqrt(payload.size) * 1.5);
    
    return (
      <circle
        cx={cx}
        cy={cy}
        r={radius}
        fill={payload.color}
        stroke="#ffffff"
        strokeWidth={payload.name === "Current Portfolio" ? 2 : 1}
        opacity="0.8"
        style={{ cursor: 'pointer' }}
      />
    );
  };

  return (
    <div className="w-full h-full">
      <div className="text-xs text-muted-foreground mb-2">
        <span className="font-medium">Portfolio Risk: </span>
        <span>{portfolioStats.risk.toFixed(1)}%</span>
        <span className="mx-2">|</span>
        <span className="font-medium">Portfolio Return: </span>
        <span className="text-green-600">{portfolioStats.return > 0 ? '+' : ''}{portfolioStats.return.toFixed(1)}%</span>
      </div>
      
      <div style={{ width: '100%', height: '280px' }}>
        <ResponsiveContainer>
          <ScatterChart margin={{ top: 20, right: 20, bottom: 50, left: 60 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis 
              type="number" 
              dataKey="risk"
              domain={['dataMin - 1', 'dataMax + 1']}
              tickFormatter={(value) => `${value.toFixed(1)}%`}
              tick={{ fontSize: 10 }}
              axisLine={{ stroke: '#e2e8f0' }}
              tickLine={false}
            />
            <YAxis 
              type="number" 
              dataKey="return"
              domain={['dataMin - 1', 'dataMax + 1']}
              tickFormatter={(value) => `${value.toFixed(1)}%`}
              tick={{ fontSize: 10 }}
              axisLine={{ stroke: '#e2e8f0' }}
              tickLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine x={0} stroke="#cbd5e1" />
            <ReferenceLine y={0} stroke="#cbd5e1" />
            
            {/* Efficient frontier line */}
            <Scatter 
              data={efficientFrontier} 
              line={{ stroke: '#8b5cf6', strokeWidth: 2, strokeDasharray: '5 3' }}
              lineType="joint"
              shape={() => null}
            />
            
            {/* Data points */}
            <Scatter 
              data={allDataPoints} 
              shape={<CustomDot />}
            />
          </ScatterChart>
        </ResponsiveContainer>
      </div>
      
      {/* Axis labels */}
      <div className="flex justify-center mt-2">
        <span className="text-xs font-medium text-muted-foreground">Risk (Standard Deviation %)</span>
      </div>
      <div className="absolute left-0 top-1/2 transform -rotate-90 origin-center">
        <span className="text-xs font-medium text-muted-foreground">Return (%)</span>
      </div>
      
      <div className="mt-2 flex justify-center gap-6 text-xs">
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