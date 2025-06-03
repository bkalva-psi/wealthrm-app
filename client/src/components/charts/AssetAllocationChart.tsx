import React, { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Sector, Tooltip, Legend } from 'recharts';

interface AssetAllocationChartProps {
  data: Record<string, number>;
  colors?: string[];
}

const UJJIVAL_COLORS = [
  '#0A3B80', // primary
  '#FF8000', // secondary
  '#2A9D49', // success
  '#1B6ABF', // primary-light
  '#FFA64D', // secondary-light
  '#B35A00', // secondary-dark
  '#002966', // primary-dark
  '#4CB963', // success-light
];

const renderActiveShape = (props: any) => {
  const { 
    cx, cy, innerRadius, outerRadius, startAngle, endAngle,
    fill, payload, percent, value, name
  } = props;

  return (
    <g>
      <text x={cx} y={cy} dy={0} textAnchor="middle" fill={fill} className="text-lg font-medium">
        {`${name}`}
      </text>
      <text x={cx} y={cy} dy={20} textAnchor="middle" fill={fill} className="text-sm">
        {`${value.toFixed(1)}%`}
      </text>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 10}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
    </g>
  );
};

const AssetAllocationChart: React.FC<AssetAllocationChartProps> = ({ 
  data, 
  colors = UJJIVAL_COLORS 
}) => {
  const [activeIndex, setActiveIndex] = useState<number | undefined>(undefined);
  
  // Convert the record to an array for Recharts
  const chartData = Object.entries(data).map(([name, value]) => ({
    name,
    value
  }));
  
  const onPieEnter = (_: any, index: number) => {
    setActiveIndex(index);
  };
  
  const onPieLeave = () => {
    setActiveIndex(undefined);
  };
  
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background dark:bg-background p-3 border border-border rounded-lg shadow-sm">
          <p className="font-medium text-foreground">{payload[0].name}</p>
          <p className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">{payload[0].value.toFixed(1)}%</span> of portfolio
          </p>
        </div>
      );
    }
    return null;
  };
  
  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            activeIndex={activeIndex}
            activeShape={renderActiveShape}
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            dataKey="value"
            onMouseEnter={onPieEnter}
            onMouseLeave={onPieLeave}
            animationDuration={800}
            animationBegin={0}
            animationEasing="ease-out"
          >
            {chartData.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={colors[index % colors.length]} 
                stroke="#fff"
                strokeWidth={2}
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend
            layout="horizontal"
            verticalAlign="bottom"
            align="center"
            iconType="circle"
            iconSize={10}
            formatter={(value) => <span className="text-xs">{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default AssetAllocationChart;