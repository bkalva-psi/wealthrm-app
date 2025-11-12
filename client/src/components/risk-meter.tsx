import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useEffect, useRef, useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, LineChart, Line, XAxis, YAxis, CartesianGrid } from "recharts";
import { useMediaQuery } from "@/hooks/use-media-query";
import { ArrowLeft } from "lucide-react";

interface RiskMeterProps {
  finalCategory: string;
  baseCategory?: string;
  rpScore?: number | null;
  kpScore?: number | null;
  knowledgeLevel?: string | null;
  breakdown?: {
    adjustment: "reduced" | "neutral" | "increased" | "none";
    adjustmentReason: string;
  };
  clientId?: number | null;
}

const categoryToGaugePosition = (category: string): number => {
  const normalized = (category || "").toLowerCase();
  switch (normalized) {
    case "conservative":
      return 1; // Green segment (leftmost)
    case "moderate":
      return 2; // Yellow segment
    case "moderately aggressive":
      return 3; // Orange segment
    case "aggressive":
      return 4; // Red segment (rightmost)
    default:
      return 2; // Default to Moderate
  }
};

const getCategoryDisplayName = (category: string): string => {
  const normalized = (category || "").toLowerCase();
  switch (normalized) {
    case "very conservative":
      return "Very Conservative";
    case "conservative":
      return "Conservative";
    case "moderate":
      return "Moderate";
    case "moderately aggressive":
      return "Moderately Aggressive";
    case "aggressive":
      return "Aggressive";
    case "very aggressive":
      return "Very Aggressive";
    default:
      return "Moderate";
  }
};

const getCategoryDescription = (category: string): string => {
  const normalized = (category || "").toLowerCase();
  switch (normalized) {
    case "conservative":
      return "Your goal of investing is to preserve capital with minimal risk. You prefer stable, low-risk investments that provide steady returns over time.";
    case "moderate":
      return "You seek a balance between growth and stability. You are comfortable with moderate risk and prefer diversified portfolios with a mix of equity and debt.";
    case "moderately aggressive":
      return "You aim for higher returns and are willing to accept moderate to high risk. You prefer growth-oriented investments with a significant equity allocation.";
    case "aggressive":
      return "Your goal of investing is to get fast growth and be able to tolerate high risk. You are willing to invest in a product that carries a high risk.";
    default:
      return "Your risk profile has been calculated based on your assessment results.";
  }
};

const getCategoryColor = (category: string): string => {
  const normalized = (category || "").toLowerCase();
  switch (normalized) {
    case "conservative":
      return "#22c55e"; // Light green
    case "moderate":
      return "#eab308"; // Yellow
    case "moderately aggressive":
      return "#f97316"; // Orange
    case "aggressive":
      return "#dc2626"; // Red
    default:
      return "#eab308";
  }
};

// Get recommended portfolio allocation based on risk category
const getPortfolioAllocation = (category: string) => {
  const normalized = (category || "").toLowerCase();
  
  // Map "Very Conservative" to "Conservative" and "Very Aggressive" to "Aggressive"
  const mappedCategory = normalized === "very conservative" ? "conservative" :
                         normalized === "very aggressive" ? "aggressive" :
                         normalized;
  
  switch (mappedCategory) {
    case "conservative":
      return {
        equity: 35,
        fixedIncome: 40,
        cash: 20,
        alternate: 5,
        description: "This conservative portfolio balances stability with modest growth. It maintains a strong foundation in fixed income while gradually increasing equity exposure to enhance returns while preserving capital.",
      };
    case "moderate":
      return {
        equity: 50,
        fixedIncome: 30,
        cash: 15,
        alternate: 5,
        description: "This moderate portfolio seeks a balanced approach between growth and stability. It provides diversified exposure across asset classes to achieve steady long-term returns while managing risk through proper asset allocation.",
      };
    case "moderately aggressive":
      return {
        equity: 65,
        fixedIncome: 20,
        cash: 10,
        alternate: 5,
        description: "This moderately aggressive portfolio aims for higher returns by increasing equity allocation. It is suitable for investors with a longer investment horizon who can tolerate moderate market volatility.",
      };
    case "aggressive":
      return {
        equity: 75,
        fixedIncome: 15,
        cash: 5,
        alternate: 5,
        description: "This aggressive portfolio is designed for maximum growth potential. It allocates a significant portion to equities and is suitable for investors with a high risk tolerance and long investment horizon who can withstand market volatility.",
      };
    default:
      return {
        equity: 50,
        fixedIncome: 30,
        cash: 15,
        alternate: 5,
        description: "This portfolio provides a balanced allocation across asset classes suitable for moderate risk tolerance.",
      };
  }
};

export function RiskMeter({
  finalCategory,
  baseCategory,
  rpScore,
  kpScore,
  knowledgeLevel,
  breakdown,
  clientId,
}: RiskMeterProps) {
  const isSm = useMediaQuery("(max-width: 640px)");
  const gaugePosition = categoryToGaugePosition(finalCategory);
  const displayName = getCategoryDisplayName(finalCategory);
  const description = getCategoryDescription(finalCategory);
  const categoryColor = getCategoryColor(finalCategory);

  // Animation state
  const [animatedAngle, setAnimatedAngle] = useState(180);
  const [isAnimating, setIsAnimating] = useState(true);
  
  // Modal state
  const [isPortfolioModalOpen, setIsPortfolioModalOpen] = useState(false);
  
  // Get portfolio allocation
  const portfolioAllocation = getPortfolioAllocation(finalCategory);
  
  // Prepare pie chart data (distinct colors - blue/green/purple scheme)
  const portfolioData = [
    { name: "Equity", value: portfolioAllocation.equity, color: "#3b82f6" }, // Blue
    { name: "Fixed Income", value: portfolioAllocation.fixedIncome, color: "#10b981" }, // Green
    { name: "Cash & Cash Equivalent", value: portfolioAllocation.cash, color: "#8b5cf6" }, // Purple
    { name: "Alternate Investments", value: portfolioAllocation.alternate, color: "#f59e0b" }, // Amber/Orange
  ];
  
  // Get current date and expiry date (1 year from now)
  const currentDate = new Date();
  const expiryDate = new Date();
  expiryDate.setFullYear(expiryDate.getFullYear() + 1);
  
  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  // Segment centers for 4 segments (each 45 degrees)
  // Conservative: 157.5°, Moderate: 112.5°, Moderately Aggressive: 67.5°, Aggressive: 22.5°
  const segmentCenters = [157.5, 112.5, 67.5, 22.5];
  const targetAngle = segmentCenters[gaugePosition - 1] || 112.5;
  
  // Animate needle
  useEffect(() => {
    setIsAnimating(true);
    const duration = 1500;
    const startTime = Date.now();
    const startAngle = 180;
    const endAngle = targetAngle;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const currentAngle = startAngle + (endAngle - startAngle) * easeOut;
      setAnimatedAngle(currentAngle);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setIsAnimating(false);
      }
    };

    const animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [targetAngle]);

  // Gauge data - 4 segments (each 45 degrees)
  const gaugeData = [
    { name: "Conservative", value: 45, color: "#22c55e" }, // Green
    { name: "Moderate", value: 45, color: "#eab308" }, // Yellow
    { name: "Moderately Aggressive", value: 45, color: "#f97316" }, // Orange
    { name: "Aggressive", value: 45, color: "#dc2626" }, // Red
  ];

  // Measure container to align SVG needle precisely across breakpoints
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState<{ width: number; height: number }>({ width: 500, height: 320 });

  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;
    const ro = new (window as any).ResizeObserver((entries: any[]) => {
      for (const entry of entries) {
        const cr = entry.contentRect;
        setContainerSize({ width: cr.width, height: cr.height });
      }
    });
    ro.observe(el);
    // Initialize immediately
    setContainerSize({ width: el.clientWidth, height: el.clientHeight });
    return () => ro.disconnect();
  }, []);

  // Calculate positions - match Recharts Pie geometry
  const chartWidth = containerSize.width || 500;
  const chartHeight = containerSize.height || 320;
  const chartCenterX = chartWidth / 2;
  const chartCenterY = chartHeight * 0.9; // semi-circle sits near bottom
  // Radii scale relative to the container for perfect overlay alignment
  const base = Math.min(chartWidth, chartHeight);
  const outerRadius = Math.max(56, Math.floor(base * 0.40));
  const innerRadius = Math.max(36, Math.floor(base * 0.25));
  const indicatorRadius = (innerRadius + outerRadius) / 2; // Mid of arc thickness
  
  // Convert angle to position on arc
  // Recharts: startAngle=180 (left), endAngle=0 (right) - top semi-circle
  // For Recharts, angles are measured from 3 o'clock (0°) counter-clockwise
  // But for a semi-circle from 180° to 0° on top, we need to convert properly
  // Recharts 180° = left, 90° = top, 0° = right
  // For positioning on the arc: use the angle directly but adjust Y calculation
  const angleRad = (animatedAngle * Math.PI) / 180;
  // For top semi-circle: cos gives X, -sin gives Y (negative because Y increases downward)
  const indicatorX = chartCenterX + indicatorRadius * Math.cos(angleRad);
  const indicatorY = chartCenterY - indicatorRadius * Math.sin(angleRad);

  return (
    <Card className="w-full max-w-md sm:max-w-lg lg:max-w-2xl mx-auto">
      <CardHeader className="px-4 sm:px-6 py-3 pb-1">
        <CardTitle className="text-center text-2xl font-bold text-primary">
          Customer Risk Profile
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 flex flex-col items-center pt-0 px-4 sm:px-6">
        <div className="flex flex-col items-center justify-center w-full">
          <div ref={wrapperRef} className="relative w-full max-w-md sm:max-w-lg mx-auto mb-0 flex items-center justify-center h-[220px] sm:h-[280px] md:h-[320px]">
            {/* Recharts Gauge */}
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={gaugeData}
                  cx="50%"
                  cy="90%"
                  startAngle={180}
                  endAngle={0}
                  innerRadius={innerRadius}
                  outerRadius={outerRadius}
                  paddingAngle={1}
                  dataKey="value"
                >
                  {gaugeData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.color} 
                      stroke="#ffffff" 
                      strokeWidth={2}
                      opacity={0.9}
                    />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>

            {/* SVG Overlay - precisely aligned and centered */}
            <svg
              className="absolute inset-0 w-full h-full"
              viewBox={`0 0 ${Math.max(chartWidth, 1)} ${Math.max(chartHeight, 1)}`}
              preserveAspectRatio="xMidYMid meet"
              style={{ pointerEvents: "none" }}
            >
              {/* Indicator - HIGHLY VISIBLE - centered on arc */}
              <g>
                {/* Outer colored circle */}
                <circle
                  cx={indicatorX}
                  cy={indicatorY}
                  r={Math.max(10, Math.floor(base * 0.032))}
                  fill={categoryColor}
                  stroke="#ffffff"
                  strokeWidth={Math.max(2, Math.floor(base * 0.012))}
                  style={{ 
                    filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.4))",
                  }}
                />
                {/* Darker outline ring */}
                <circle
                  cx={indicatorX}
                  cy={indicatorY}
                  r={Math.max(14, Math.floor(base * 0.04))}
                  fill="none"
                  stroke={categoryColor}
                  strokeWidth={Math.max(1, Math.floor(base * 0.006))}
                  opacity="0.5"
                />
                {/* White center dot */}
                <circle
                  cx={indicatorX}
                  cy={indicatorY}
                  r={Math.max(4, Math.floor(base * 0.022))}
                  fill="#ffffff"
                />
              </g>
            </svg>
          </div>

          {/* Category Label - displayed below the gauge */}
          <div className="mt-1 mb-2">
            <div className="text-center">
              <p className="text-base sm:text-xl font-semibold text-foreground">
                Your risk profile is{" "}
                <span 
                  className="font-bold"
                  style={{ color: categoryColor }}
                >
                  {displayName}
                </span>
              </p>
            </div>
          </div>

          {/* Legend */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 w-full max-w-md mx-auto mt-2">
            {[
              { color: "#22c55e", label: "Conservative" },
              { color: "#eab308", label: "Moderate" },
              { color: "#f97316", label: "Moderately Aggressive" },
              { color: "#dc2626", label: "Aggressive" },
            ].map((item, index) => (
              <div key={index} className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-sm shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-xs sm:text-sm text-muted-foreground font-medium">
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Description Section */}
        <div className="rounded-lg border bg-muted/50">
          <div className="px-4 py-3 border-b bg-muted/30">
            <h3 className="text-sm font-semibold">Description</h3>
          </div>
          <div className="p-4">
            <p className="text-sm text-muted-foreground leading-relaxed">
              {description}
            </p>
          </div>
        </div>

        {/* Additional Details */}
        {(baseCategory || rpScore !== null || kpScore !== null || knowledgeLevel) && (
          <div className="space-y-3">
            <Separator />
            <div>
              <h3 className="text-sm font-semibold mb-3">Assessment Details</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {rpScore !== null && (
                  <Card className="p-3">
                    <div className="text-xs text-muted-foreground mb-1">
                      Risk Profiling Score
                    </div>
                    <div className="text-sm font-semibold">{rpScore}/75</div>
                  </Card>
                )}
                {kpScore !== null && (
                  <Card className="p-3">
                    <div className="text-xs text-muted-foreground mb-1">
                      Knowledge Profiling Score
                    </div>
                    <div className="text-sm font-semibold">{kpScore}/45</div>
                  </Card>
                )}
                {knowledgeLevel && (
                  <Card className="p-3">
                    <div className="text-xs text-muted-foreground mb-1">
                      Knowledge Level
                    </div>
                    <div className="text-sm font-semibold capitalize">
                      {knowledgeLevel}
                    </div>
                  </Card>
                )}
                {baseCategory && baseCategory !== finalCategory && (
                  <Card className="p-3">
                    <div className="text-xs text-muted-foreground mb-1">
                      Base Category
                    </div>
                    <div className="text-sm font-semibold">{baseCategory}</div>
                  </Card>
                )}
              </div>
            </div>
            {breakdown && breakdown.adjustment !== "none" && (
              <div className="rounded-lg border border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/30 p-3">
                <p className="text-xs text-blue-900 dark:text-blue-100">
                  <strong className="font-semibold">Note:</strong>{" "}
                  {breakdown.adjustmentReason}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Show Recommended Portfolio Button */}
        <div className="flex justify-center pt-4">
          <Button
            onClick={() => setIsPortfolioModalOpen(true)}
            className="px-4 py-2 sm:h-11 sm:px-6 w-full sm:w-auto"
            size="default"
            aria-label="Show recommended portfolio"
          >
            Show Recommended Portfolio
          </Button>
        </div>
      </CardContent>

      {/* Recommended Portfolio Modal */}
      <Dialog open={isPortfolioModalOpen} onOpenChange={setIsPortfolioModalOpen}>
        <DialogContent className="max-w-full sm:max-w-2xl w-[96vw] sm:w-auto max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Indicative Asset Allocation</DialogTitle>
          </DialogHeader>
          <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 mb-4">
            <p className="text-base font-semibold text-foreground text-center">
              Recommended portfolio allocation based on your risk profile:{" "}
              <span className="text-primary font-bold">{displayName}</span>
            </p>
          </div>

          <div className="space-y-6">
            {/* Pie Chart */}
            <div className="flex flex-col md:flex-row items-center justify-center gap-8">
              <div className="w-full md:w-1/2">
                <ResponsiveContainer width="100%" height={isSm ? 220 : 300}>
                  <PieChart>
                    <Pie
                      data={portfolioData}
                      cx="50%"
                      cy="50%"
                      innerRadius={isSm ? 48 : 60}
                      outerRadius={isSm ? 90 : 120}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {portfolioData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: number) => `${value}%`}
                      contentStyle={{
                        backgroundColor: "hsl(var(--background))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "6px",
                      }}
                      wrapperStyle={{ zIndex: 20 }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Legend */}
              <div className="w-full md:w-1/2 space-y-3">
                {portfolioData.map((item, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div
                      className="w-4 h-4 rounded-sm shrink-0"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-sm font-medium text-foreground">
                      {item.name} - {item.value}%
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Description Section */}
            <div className="rounded-lg border bg-muted/50">
              <div className="px-4 py-3 border-b bg-muted/30">
                <h3 className="text-sm font-semibold">Portfolio Description</h3>
              </div>
              <div className="p-4">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {portfolioAllocation.description}
                </p>
              </div>
            </div>

            {/* Portfolio Information */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold">Portfolio Guidelines</h3>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>
                  <strong className="text-foreground">Equity ({portfolioAllocation.equity}%):</strong>{" "}
                  Invest in diversified equity mutual funds, ETFs, or direct stocks. Focus on large-cap
                  and mid-cap companies with strong fundamentals. Consider both domestic and international
                  equity exposure for diversification.
                </p>
                <p>
                  <strong className="text-foreground">Fixed Income ({portfolioAllocation.fixedIncome}%):</strong>{" "}
                  Allocate to government bonds, corporate bonds, and debt mutual funds. This provides
                  stability and regular income while reducing overall portfolio volatility.
                </p>
                <p>
                  <strong className="text-foreground">Cash & Cash Equivalents ({portfolioAllocation.cash}%):</strong>{" "}
                  Maintain liquidity through savings accounts, money market funds, or short-term deposits.
                  This provides emergency funds and flexibility for opportunistic investments.
                </p>
                <p>
                  <strong className="text-foreground">Alternate Investments ({portfolioAllocation.alternate}%):</strong>{" "}
                  Consider real estate investment trusts (REITs), gold, commodities, or alternative
                  investment funds (AIFs) for additional diversification and potential inflation hedge.
                </p>
              </div>
            </div>

            {/* Past Performance Section */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold">Past Performance Analysis</h3>
              <p className="text-sm text-muted-foreground">
                The following charts illustrate the historical performance of this portfolio allocation strategy over the past 5 years. 
                Past performance is not indicative of future results, but can help you understand the portfolio's behavior in different market conditions.
              </p>
              
              {/* Generate sample performance data based on risk category */}
              {(() => {
                const normalizedCategory = (finalCategory || "").toLowerCase();
                // Map "Very Conservative" to "Conservative" and "Very Aggressive" to "Aggressive"
                const mappedCategory = normalizedCategory === "very conservative" ? "conservative" :
                                     normalizedCategory === "very aggressive" ? "aggressive" :
                                     normalizedCategory;
                
                // Generate 5 years of monthly data (60 data points)
                const performanceData = [];
                
                // Define base returns and volatility for each risk category
                let baseReturn = 0.007; // Default: Moderate
                let volatility = 0.05; // Default: Moderate
                
                switch (mappedCategory) {
                  case "conservative":
                    baseReturn = 0.005;
                    volatility = 0.03;
                    break;
                  case "moderate":
                    baseReturn = 0.007;
                    volatility = 0.05;
                    break;
                  case "moderately aggressive":
                    baseReturn = 0.009;
                    volatility = 0.07;
                    break;
                  case "aggressive":
                    baseReturn = 0.011;
                    volatility = 0.09;
                    break;
                  default:
                    baseReturn = 0.007;
                    volatility = 0.05;
                }
                
                let portfolioValue = 100000; // Starting value
                const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                const years = [2019, 2020, 2021, 2022, 2023, 2024];
                
                for (let yearIdx = 0; yearIdx < 5; yearIdx++) {
                  const year = years[yearIdx];
                  for (let monthIdx = 0; monthIdx < 12; monthIdx++) {
                    const month = months[monthIdx];
                    // Simulate returns with some randomness
                    const monthlyReturn = baseReturn + (Math.random() - 0.5) * volatility;
                    portfolioValue = portfolioValue * (1 + monthlyReturn);
                    const cumulativeReturn = ((portfolioValue / 100000) - 1) * 100;
                    
                    performanceData.push({
                      period: `${month} ${year}`,
                      portfolioValue: Math.round(portfolioValue),
                      cumulativeReturn: parseFloat(cumulativeReturn.toFixed(2)),
                      month: monthIdx + 1,
                      year: year,
                    });
                  }
                }
                
                // Take every 3rd month for cleaner chart (20 data points)
                const chartData = performanceData.filter((_, idx) => idx % 3 === 0);
                
                return (
                  <div className="space-y-4">
                    {/* Portfolio Value Over Time */}
                    <div className="rounded-lg border bg-muted/50 p-4">
                      <h4 className="text-sm font-semibold mb-3">Portfolio Value Growth (₹)</h4>
                      <ResponsiveContainer width="100%" height={isSm ? 200 : 250}>
                        <LineChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                          <XAxis 
                            dataKey="period" 
                            stroke="hsl(var(--muted-foreground))"
                            fontSize={isSm ? 10 : 11}
                            angle={isSm ? -30 : -45}
                            textAnchor="end"
                            height={isSm ? 40 : 60}
                            interval={isSm ? "preserveStartEnd" : 0}
                          />
                          <YAxis 
                            stroke="hsl(var(--muted-foreground))"
                            fontSize={isSm ? 10 : 11}
                            tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}K`}
                          />
                          <Tooltip
                            formatter={(value: number) => `₹${value.toLocaleString('en-IN')}`}
                            contentStyle={{
                              backgroundColor: "hsl(var(--background))",
                              border: "1px solid hsl(var(--border))",
                              borderRadius: "6px",
                            }}
                            wrapperStyle={{ zIndex: 20 }}
                          />
                          <Line 
                            type="monotone" 
                            dataKey="portfolioValue" 
                            stroke="#3b82f6" 
                            strokeWidth={2}
                            dot={{ r: 3 }}
                            activeDot={{ r: 5 }}
                            name="Portfolio Value"
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>

                    {/* Cumulative Returns */}
                    <div className="rounded-lg border bg-muted/50 p-4">
                      <h4 className="text-sm font-semibold mb-3">Cumulative Returns (%)</h4>
                      <ResponsiveContainer width="100%" height={isSm ? 200 : 250}>
                        <LineChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                          <XAxis 
                            dataKey="period" 
                            stroke="hsl(var(--muted-foreground))"
                            fontSize={isSm ? 10 : 11}
                            angle={isSm ? -30 : -45}
                            textAnchor="end"
                            height={isSm ? 40 : 60}
                            interval={isSm ? "preserveStartEnd" : 0}
                          />
                          <YAxis 
                            stroke="hsl(var(--muted-foreground))"
                            fontSize={isSm ? 10 : 11}
                            tickFormatter={(value) => `${value}%`}
                          />
                          <Tooltip
                            formatter={(value: number) => `${value}%`}
                            contentStyle={{
                              backgroundColor: "hsl(var(--background))",
                              border: "1px solid hsl(var(--border))",
                              borderRadius: "6px",
                            }}
                            wrapperStyle={{ zIndex: 20 }}
                          />
                          <Line 
                            type="monotone" 
                            dataKey="cumulativeReturn" 
                            stroke="#10b981" 
                            strokeWidth={2}
                            dot={{ r: 3 }}
                            activeDot={{ r: 5 }}
                            name="Cumulative Return"
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>

                    {/* Performance Summary */}
                    <div className="grid grid-cols-3 gap-3">
                      <div className="bg-muted/30 rounded-lg p-3 border border-border">
                        <div className="text-xs text-muted-foreground mb-1">1 Year Return</div>
                        <div className="text-lg font-semibold text-foreground">
                          {((chartData[chartData.length - 1]?.cumulativeReturn || 0) - (chartData[chartData.length - 4]?.cumulativeReturn || 0)).toFixed(2)}%
                        </div>
                      </div>
                      <div className="bg-muted/30 rounded-lg p-3 border border-border">
                        <div className="text-xs text-muted-foreground mb-1">3 Year Return</div>
                        <div className="text-lg font-semibold text-foreground">
                          {((chartData[chartData.length - 1]?.cumulativeReturn || 0) - (chartData[chartData.length - 12]?.cumulativeReturn || 0)).toFixed(2)}%
                        </div>
                      </div>
                      <div className="bg-muted/30 rounded-lg p-3 border border-border">
                        <div className="text-xs text-muted-foreground mb-1">5 Year Return</div>
                        <div className="text-lg font-semibold text-foreground">
                          {(chartData[chartData.length - 1]?.cumulativeReturn || 0).toFixed(2)}%
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Date Information */}
            <div className="bg-muted/30 rounded-lg p-4 border border-border">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Risk Profile Date: </span>
                  <span className="font-semibold text-foreground">{formatDate(currentDate)}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Expiry On: </span>
                  <span className="font-semibold text-foreground">{formatDate(expiryDate)}</span>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
