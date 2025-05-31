import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Area, AreaChart } from 'recharts';

interface RetirementProjectionChartProps {
  currentAge: number;
  retirementAge: number;
  currentCorpus: number;
  monthlyContribution: number;
  expectedReturn: number;
  monthlyExpenseAfterRetirement: number;
  inflationRate: number;
}

export function RetirementProjectionChart({
  currentAge = 35,
  retirementAge = 60,
  currentCorpus = 3750000, // ₹37.5L
  monthlyContribution = 25000, // ₹25K per month
  expectedReturn = 0.12, // 12% annual return
  monthlyExpenseAfterRetirement = 85000, // ₹85K per month
  inflationRate = 0.06 // 6% inflation
}: RetirementProjectionChartProps) {
  
  // Generate data points for the chart
  const generateProjectionData = () => {
    const data = [];
    let corpus = currentCorpus;
    
    // Accumulation phase (current age to retirement)
    for (let age = currentAge; age <= retirementAge; age++) {
      data.push({
        age,
        corpus: Math.round(corpus),
        phase: 'accumulation',
        formattedCorpus: `₹${(corpus / 10000000).toFixed(1)}Cr`
      });
      
      // Calculate growth for next year (only if not the last year)
      if (age < retirementAge) {
        const annualContribution = monthlyContribution * 12;
        corpus = corpus * (1 + expectedReturn) + annualContribution;
      }
    }
    
    // Depletion phase (retirement to corpus exhaustion)
    let retirementCorpus = corpus;
    let monthlyExpense = monthlyExpenseAfterRetirement;
    
    for (let age = retirementAge + 1; age <= 85; age++) {
      // Adjust expense for inflation from previous year
      monthlyExpense = monthlyExpense * (1 + inflationRate);
      const annualExpense = monthlyExpense * 12;
      
      // Corpus earns returns but reduces by expenses
      retirementCorpus = retirementCorpus * (1 + expectedReturn) - annualExpense;
      
      // Stop if corpus is exhausted
      if (retirementCorpus <= 0) {
        data.push({
          age,
          corpus: 0,
          phase: 'depletion',
          formattedCorpus: '₹0Cr'
        });
        break;
      }
      
      data.push({
        age,
        corpus: Math.round(retirementCorpus),
        phase: 'depletion',
        formattedCorpus: `₹${(retirementCorpus / 10000000).toFixed(1)}Cr`
      });
    }
    
    return data;
  };

  const data = generateProjectionData();
  const peakCorpus = Math.max(...data.map(d => d.corpus));
  
  // Split data into accumulation and depletion phases
  const accumulationData = data.filter(d => d.phase === 'accumulation');
  const depletionData = data.filter(d => d.phase === 'depletion');
  
  // Add the retirement point to depletion data for continuity
  if (accumulationData.length > 0 && depletionData.length > 0) {
    const retirementPoint = accumulationData[accumulationData.length - 1];
    depletionData.unshift(retirementPoint);
  }
  
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const phase = data.phase === 'accumulation' ? 'Accumulation Phase' : 'Retirement Phase';
      
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-medium">{`Age: ${label} years`}</p>
          <p className="text-sm text-slate-600">{phase}</p>
          <p className="font-medium text-blue-600">{`Corpus: ${data.formattedCorpus}`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-60">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
          <defs>
            <linearGradient id="accumulationGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#10b981" stopOpacity={0.05}/>
            </linearGradient>
            <linearGradient id="depletionGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.05}/>
            </linearGradient>
          </defs>
          
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis 
            dataKey="age" 
            stroke="#64748b"
            fontSize={12}
            tickFormatter={(value) => `${value}`}
          />
          <YAxis 
            stroke="#64748b"
            fontSize={12}
            tickFormatter={(value) => `₹${(value / 10000000).toFixed(1)}Cr`}
          />
          <Tooltip content={<CustomTooltip />} />
          
          {/* Reference line at retirement age */}
          <ReferenceLine 
            x={retirementAge} 
            stroke="#ef4444" 
            strokeDasharray="5 5"
            label={{ value: "Retirement", position: "top" }}
          />
          
          {/* Accumulation phase area - green growing */}
          <Area
            data={accumulationData}
            type="monotone"
            dataKey="corpus"
            stroke="#10b981"
            strokeWidth={2}
            fill="url(#accumulationGradient)"
            connectNulls={false}
          />
          
          {/* Depletion phase area - orange declining */}
          <Area
            data={depletionData}
            type="monotone"
            dataKey="corpus"
            stroke="#f59e0b"
            strokeWidth={2}
            fill="url(#depletionGradient)"
            connectNulls={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}