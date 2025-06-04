import React from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

interface DataPoint {
  name: string;
  risk: number;
  return: number;
  allocation: number;
  type: string;
}

interface PortfolioEfficiencyChartProps {
  holdings?: { name: string; type: string; value: number; allocation: number; gain: number }[];
}

const PortfolioEfficiencyChart: React.FC<PortfolioEfficiencyChartProps> = ({ 
  holdings = [] 
}) => {
  // Generate risk values based on asset type
  const getRiskLevel = (type: string, returns: number): number => {
    const baseRisks: {[key: string]: number} = {
      'Cash': 1,
      'Fixed Income': 4,
      'Debt': 4,
      'Gold': 16,
      'Equity': 20,
      'Direct Equity': 25
    };
    
    let baseRisk = 12;
    for (const assetClass in baseRisks) {
      if (type.includes(assetClass)) {
        baseRisk = baseRisks[assetClass];
        break;
      }
    }
    
    // Adjust risk based on returns
    const returnAdjustment = Math.abs(returns) / 8;
    return Math.max(1, baseRisk + returnAdjustment + (Math.random() * 3 - 1.5));
  };

  // Process data points
  const dataPoints: DataPoint[] = holdings.length > 0 
    ? holdings.map(holding => ({
        name: holding.name,
        risk: getRiskLevel(holding.type, holding.gain),
        return: holding.gain,
        allocation: holding.allocation,
        type: holding.type
      }))
    : [
        { name: "HDFC Top 100 Fund", risk: 18.2, return: 15.4, allocation: 25, type: "Mutual Fund - Equity" },
        { name: "SBI Bluechip Fund", risk: 19.5, return: 13.2, allocation: 20, type: "Mutual Fund - Equity" },
        { name: "ICICI Debt Fund", risk: 5.2, return: 7.1, allocation: 15, type: "Mutual Fund - Debt" },
        { name: "Gold ETF", risk: 16.8, return: 11.5, allocation: 12, type: "ETF - Gold" },
        { name: "Bank FD", risk: 1.5, return: 6.5, allocation: 18, type: "Fixed Income" },
        { name: "Reliance Growth Fund", risk: 21.3, return: 16.8, allocation: 10, type: "Mutual Fund - Equity" }
      ];

  // Calculate portfolio position
  const portfolioRisk = dataPoints.reduce((acc, point) => acc + (point.risk * point.allocation), 0) / 100;
  const portfolioReturn = dataPoints.reduce((acc, point) => acc + (point.return * point.allocation), 0) / 100;

  // Add portfolio point
  const allPoints = [
    ...dataPoints,
    { 
      name: "Current Portfolio", 
      risk: portfolioRisk, 
      return: portfolioReturn, 
      allocation: 100, 
      type: "Portfolio" 
    }
  ];

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div 
          className="rounded-lg border shadow-lg p-3 text-xs"
          style={{
            backgroundColor: 'hsl(var(--background))',
            borderColor: 'hsl(var(--border))',
            color: 'hsl(var(--foreground))'
          }}
        >
          <div className="font-semibold mb-1">{data.name}</div>
          <div className="text-muted-foreground text-[10px] mb-2">{data.type}</div>
          <div className="space-y-1">
            <div>Risk: <span className="font-medium">{data.risk.toFixed(1)}%</span></div>
            <div>Return: <span className={`font-medium ${data.return >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {data.return > 0 ? '+' : ''}{data.return.toFixed(1)}%
            </span></div>
            <div>Allocation: <span className="font-medium">{data.allocation.toFixed(1)}%</span></div>
          </div>
        </div>
      );
    }
    return null;
  };

  // Custom dot
  const renderDot = (props: any) => {
    const { cx, cy, payload } = props;
    const isPortfolio = payload.name === "Current Portfolio";
    const radius = isPortfolio ? 7 : Math.max(4, Math.sqrt(payload.allocation) * 2);
    
    let color = '#8b5cf6';
    if (isPortfolio) color = '#ef4444';
    else if (payload.type.includes('Equity')) color = '#3b82f6';
    else if (payload.type.includes('Debt')) color = '#10b981';
    else if (payload.type.includes('Gold')) color = '#f59e0b';
    else if (payload.type.includes('Fixed Income')) color = '#6b7280';
    
    return (
      <circle
        cx={cx}
        cy={cy}
        r={radius}
        fill={color}
        stroke="#ffffff"
        strokeWidth={isPortfolio ? 2 : 1}
        opacity="0.8"
      />
    );
  };

  return (
    <div className="w-full">
      <div className="mb-3 text-xs text-muted-foreground">
        <span className="font-medium">Portfolio Risk: </span>
        <span>{portfolioRisk.toFixed(1)}%</span>
        <span className="mx-2">|</span>
        <span className="font-medium">Portfolio Return: </span>
        <span className={portfolioReturn >= 0 ? 'text-green-600' : 'text-red-600'}>
          {portfolioReturn > 0 ? '+' : ''}{portfolioReturn.toFixed(1)}%
        </span>
      </div>

      <div style={{ width: '100%', height: '220px' }}>
        <ResponsiveContainer>
          <ScatterChart margin={{ top: 20, right: 30, bottom: 40, left: 50 }}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
            <XAxis 
              type="number" 
              dataKey="risk"
              domain={['dataMin - 1', 'dataMax + 1']}
              tickFormatter={(value) => `${value.toFixed(0)}%`}
              tick={{ fontSize: 10 }}
              label={{ 
                value: 'Risk (Standard Deviation %)', 
                position: 'insideBottom', 
                offset: -5, 
                style: { textAnchor: 'middle', fontSize: '10px' } 
              }}
            />
            <YAxis 
              type="number" 
              dataKey="return"
              domain={['dataMin - 1', 'dataMax + 1']}
              tickFormatter={(value) => `${value.toFixed(0)}%`}
              tick={{ fontSize: 10 }}
              label={{ 
                value: 'Return (%)', 
                angle: -90, 
                position: 'insideLeft', 
                style: { textAnchor: 'middle', fontSize: '10px' } 
              }}
            />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine x={0} stroke="hsl(var(--muted-foreground))" opacity={0.5} />
            <ReferenceLine y={0} stroke="hsl(var(--muted-foreground))" opacity={0.5} />
            <Scatter data={allPoints} shape={renderDot} />
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      <div className="flex justify-center gap-4 text-xs mt-2 text-muted-foreground">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <span>Portfolio</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-blue-500"></div>
          <span>Equity</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
          <span>Debt</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-amber-500"></div>
          <span>Gold</span>
        </div>
      </div>
    </div>
  );
};

export default PortfolioEfficiencyChart;