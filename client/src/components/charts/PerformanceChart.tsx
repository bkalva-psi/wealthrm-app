import React, { useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceArea
} from 'recharts';

interface DataPoint {
  date: string;
  value: number;
  benchmark?: number;
}

interface PerformanceChartProps {
  data: DataPoint[];
  title?: string;
  showBenchmark?: boolean;
  height?: number;
  periodFilter?: boolean;
}

const PERIODS = [
  { label: '1M', days: 30 },
  { label: '3M', days: 90 },
  { label: '6M', days: 180 },
  { label: 'YTD', ytd: true },
  { label: '1Y', days: 365 },
  { label: '3Y', days: 1095 },
  { label: 'ALL', all: true }
];

const PerformanceChart: React.FC<PerformanceChartProps> = ({
  data,
  title,
  showBenchmark = true,
  height = 300,
  periodFilter = true
}) => {
  const [activePeriod, setActivePeriod] = useState('1Y');
  const [hoveredData, setHoveredData] = useState<any | null>(null);
  
  const filterDataByPeriod = (period: string) => {
    const selectedPeriod = PERIODS.find(p => p.label === period);
    if (!selectedPeriod) return data;
    
    const now = new Date();
    
    if (selectedPeriod.all) return data;
    
    if (selectedPeriod.ytd) {
      const startOfYear = new Date(now.getFullYear(), 0, 1);
      return data.filter(d => new Date(d.date) >= startOfYear);
    }
    
    const cutoffDate = new Date();
    cutoffDate.setDate(now.getDate() - selectedPeriod.days!);
    return data.filter(d => new Date(d.date) >= cutoffDate);
  };
  
  const filteredData = filterDataByPeriod(activePeriod);
  
  const formatTooltipDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };
  
  const formatYAxis = (value: number) => {
    return `${value}%`;
  };
  
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-slate-200 rounded-lg shadow-sm">
          <p className="text-sm font-medium mb-1">{formatTooltipDate(label)}</p>
          <div className="space-y-1">
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-primary mr-2"></div>
              <p className="text-xs">
                Portfolio: <span className="font-medium">{payload[0].value}%</span>
              </p>
            </div>
            {showBenchmark && payload[1] && (
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-secondary mr-2"></div>
                <p className="text-xs">
                  Benchmark: <span className="font-medium">{payload[1].value}%</span>
                </p>
              </div>
            )}
          </div>
        </div>
      );
    }
    return null;
  };
  
  const handleMouseMove = (props: any) => {
    if (props && props.activePayload) {
      setHoveredData(props.activePayload[0].payload);
    }
  };
  
  const handleMouseLeave = () => {
    setHoveredData(null);
  };
  
  // Calculate the min and max values for better Y-axis scaling
  const allValues = filteredData.flatMap(d => [d.value, d.benchmark].filter(Boolean) as number);
  const minValue = Math.floor(Math.min(...allValues) - 2);
  const maxValue = Math.ceil(Math.max(...allValues) + 2);
  
  return (
    <div className="w-full">
      {title && <h3 className="text-sm font-medium mb-2">{title}</h3>}
      
      {periodFilter && (
        <div className="flex flex-wrap gap-2 mb-4">
          {PERIODS.map((period) => (
            <button
              key={period.label}
              className={`px-3 py-1 text-xs rounded-full transition-colors ${
                activePeriod === period.label
                  ? 'bg-primary text-white'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
              onClick={() => setActivePeriod(period.label)}
            >
              {period.label}
            </button>
          ))}
        </div>
      )}
      
      <div className="relative">
        {/* Performance summary display */}
        {hoveredData && (
          <div className="absolute top-0 left-0 z-10 bg-white/80 p-2 rounded-lg border border-slate-200">
            <p className="text-xs text-slate-500">{formatTooltipDate(hoveredData.date)}</p>
            <p className="text-sm font-medium">
              {hoveredData.value > 0 ? '+' : ''}{hoveredData.value}%
            </p>
          </div>
        )}
        
        <ResponsiveContainer width="100%" height={height}>
          <LineChart
            data={filteredData}
            margin={{ top: 20, right: 20, left: 10, bottom: 10 }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
            <XAxis
              dataKey="date"
              tickFormatter={(date) => {
                const d = new Date(date);
                return d.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' });
              }}
              tick={{ fontSize: 11 }}
              axisLine={{ stroke: '#E5E7EB' }}
              tickLine={false}
            />
            <YAxis
              tickFormatter={formatYAxis}
              domain={[minValue, maxValue]}
              tick={{ fontSize: 11 }}
              axisLine={{ stroke: '#E5E7EB' }}
              tickLine={false}
              width={40}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend verticalAlign="top" height={36} />
            
            {/* Zero reference line */}
            {minValue < 0 && maxValue > 0 && (
              <ReferenceArea y1={0} y2={0} stroke="#E5E7EB" strokeWidth={1} />
            )}
            
            <Line
              type="monotone"
              dataKey="value"
              name="Portfolio"
              stroke="var(--color-primary)"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 6, stroke: "var(--color-primary)", strokeWidth: 2, fill: "white" }}
              animationDuration={1000}
            />
            
            {showBenchmark && (
              <Line
                type="monotone"
                dataKey="benchmark"
                name="Benchmark"
                stroke="var(--color-secondary)"
                strokeWidth={2}
                dot={false}
                strokeDasharray="5 5"
                activeDot={{ r: 6, stroke: "var(--color-secondary)", strokeWidth: 2, fill: "white" }}
                animationDuration={1000}
                animationBegin={300}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default PerformanceChart;