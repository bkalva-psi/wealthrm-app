import { useState } from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { HelpCircle, Info, Lightbulb, Target, TrendingUp, Users, DollarSign } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FeatureTooltipProps {
  feature: string;
  children: React.ReactNode;
  side?: 'top' | 'right' | 'bottom' | 'left';
  align?: 'start' | 'center' | 'end';
  className?: string;
  showIcon?: boolean;
  iconType?: 'help' | 'info' | 'lightbulb' | 'target' | 'trending' | 'users' | 'dollar';
}

// Feature explanations database
const FEATURE_EXPLANATIONS = {
  // Dashboard Features
  'business-snapshot': {
    title: 'Business Snapshot',
    description: 'Real-time overview of your key business metrics including AUM, client count, revenue, and pipeline value. All data is fetched directly from authentic database sources.',
    tips: ['Click on any metric to see detailed breakdowns', 'Data updates automatically every few minutes'],
    icon: TrendingUp
  },
  'performance-metrics': {
    title: 'Performance vs Targets',
    description: 'Track your progress against monthly, quarterly, and yearly targets. Compare your performance with peer RMs.',
    tips: ['Toggle between different time periods', 'View detailed peer comparisons', 'See historical performance trends'],
    icon: Target
  },
  'agenda-today': {
    title: "Today's Agenda",
    description: 'Your scheduled appointments, pending tasks, and important reminders for today.',
    tips: ['Click on appointments to view details', 'Mark tasks as complete', 'Add new appointments directly'],
    icon: Users
  },
  'talking-points': {
    title: 'Market Talking Points',
    description: 'Curated market insights and conversation starters for client discussions. Updated daily by research team.',
    tips: ['Use these during client calls', 'Points are ranked by relevance', 'New insights added daily'],
    icon: Lightbulb
  },
  'portfolio-alerts': {
    title: 'Portfolio Alerts',
    description: 'Important alerts about client portfolios including significant movements, rebalancing needs, and risk warnings.',
    tips: ['Review alerts before client meetings', 'Alerts are prioritized by urgency', 'Click to see detailed analysis'],
    icon: Info
  },
  
  // Client Management Features
  'client-tier-system': {
    title: 'Client Tier System',
    description: 'Clients are categorized as Platinum, Gold, or Silver based on AUM, relationship tenure, and engagement level.',
    tips: ['Platinum: >₹2Cr AUM', 'Gold: ₹50L-₹2Cr AUM', 'Silver: <₹50L AUM'],
    icon: Users
  },
  'aum-tracking': {
    title: 'AUM Tracking',
    description: 'Assets Under Management calculated from actual client transactions and portfolio valuations.',
    tips: ['Updated after each transaction', 'Includes all investment products', 'Historical trending available'],
    icon: DollarSign
  },
  'client-insights': {
    title: 'Client Insights',
    description: 'AI-powered insights about client behavior, preferences, and potential opportunities.',
    tips: ['Based on transaction patterns', 'Updated monthly', 'Includes next best actions'],
    icon: Lightbulb
  },
  
  // Communication Features
  'communication-tracking': {
    title: 'Communication Log',
    description: 'Complete history of all client interactions including calls, emails, meetings, and their outcomes.',
    tips: ['Log every client touchpoint', 'Track follow-up actions', 'Monitor communication frequency'],
    icon: Info
  },
  'sentiment-analysis': {
    title: 'Communication Sentiment',
    description: 'AI analysis of communication tone and client satisfaction based on interaction summaries.',
    tips: ['Helps identify relationship health', 'Flags potential issues early', 'Tracks satisfaction trends'],
    icon: TrendingUp
  },
  
  // Task Management
  'task-prioritization': {
    title: 'Smart Task Prioritization',
    description: 'Tasks are automatically prioritized based on client tier, deal value, and deadlines.',
    tips: ['High-tier clients get priority', 'Overdue tasks highlighted', 'Deal value influences ranking'],
    icon: Target
  },
  'task-automation': {
    title: 'Automated Task Creation',
    description: 'System automatically creates follow-up tasks based on communication outcomes and schedules.',
    tips: ['Follow-ups from meetings', 'Reminder tasks for reviews', 'Compliance-driven tasks'],
    icon: Info
  },

  // Prospects & Pipeline
  'prospect-stages': {
    title: 'Prospect Pipeline Stages',
    description: 'Lead → Qualified → Proposal → Negotiation → Closed. Drag and drop to move prospects between stages.',
    tips: ['Each stage has specific criteria', 'Conversion rates tracked', 'Time in stage monitored'],
    icon: Target
  },
  'deal-probability': {
    title: 'Deal Probability Scoring',
    description: 'AI-calculated probability of closing based on stage, engagement level, and historical patterns.',
    tips: ['Updates based on activities', 'Higher scores = better focus', 'Historical accuracy tracked'],
    icon: TrendingUp
  },

  // Reports & Analytics
  'portfolio-report': {
    title: 'Client Portfolio Report',
    description: 'Comprehensive PDF report showing client holdings, performance, and recommendations. Data matches main application exactly.',
    tips: ['Generated from live data', 'Customizable sections', 'Professional formatting for client meetings'],
    icon: Info
  },
  'business-analytics': {
    title: 'Business Analytics',
    description: 'Deep dive into your business performance with drill-down capabilities across all metrics.',
    tips: ['Click charts for details', 'Filter by time periods', 'Export data for presentations'],
    icon: TrendingUp
  }
};

const getIconComponent = (iconType: string) => {
  switch (iconType) {
    case 'help': return HelpCircle;
    case 'info': return Info;
    case 'lightbulb': return Lightbulb;
    case 'target': return Target;
    case 'trending': return TrendingUp;
    case 'users': return Users;
    case 'dollar': return DollarSign;
    default: return HelpCircle;
  }
};

export function FeatureTooltip({ 
  feature, 
  children, 
  side = 'top', 
  align = 'center',
  className,
  showIcon = false,
  iconType = 'help'
}: FeatureTooltipProps) {
  const [isOpen, setIsOpen] = useState(false);
  const explanation = FEATURE_EXPLANATIONS[feature as keyof typeof FEATURE_EXPLANATIONS];
  
  if (!explanation) {
    return <>{children}</>;
  }

  const IconComponent = explanation.icon || getIconComponent(iconType);

  return (
    <TooltipProvider>
      <Tooltip open={isOpen} onOpenChange={setIsOpen} delayDuration={300}>
        <TooltipTrigger asChild>
          <div className={cn("inline-flex items-center gap-1", className)}>
            {children}
            {showIcon && (
              <IconComponent className="h-4 w-4 text-slate-400 hover:text-slate-600 transition-colors cursor-help" />
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent 
          side={side} 
          align={align}
          className="max-w-sm p-4 bg-white border border-slate-200 shadow-lg"
          sideOffset={8}
        >
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <IconComponent className="h-4 w-4 text-blue-600" />
              <h4 className="font-semibold text-sm text-slate-900">{explanation.title}</h4>
            </div>
            
            <p className="text-xs text-slate-600 leading-relaxed">
              {explanation.description}
            </p>
            
            {explanation.tips && explanation.tips.length > 0 && (
              <div className="pt-2 border-t border-slate-100">
                <p className="text-xs font-medium text-slate-700 mb-1">Pro Tips:</p>
                <ul className="space-y-1">
                  {explanation.tips.map((tip, index) => (
                    <li key={index} className="text-xs text-slate-600 flex items-start gap-1">
                      <span className="text-blue-500 mt-0.5">•</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// Wrapper for quick feature explanations
export function QuickTip({ 
  title, 
  description, 
  children, 
  side = 'top',
  iconType = 'info' 
}: {
  title: string;
  description: string;
  children: React.ReactNode;
  side?: 'top' | 'right' | 'bottom' | 'left';
  iconType?: 'help' | 'info' | 'lightbulb' | 'target' | 'trending' | 'users' | 'dollar';
}) {
  const IconComponent = getIconComponent(iconType);
  
  return (
    <TooltipProvider>
      <Tooltip delayDuration={300}>
        <TooltipTrigger asChild>
          {children}
        </TooltipTrigger>
        <TooltipContent 
          side={side}
          className="max-w-xs p-3 bg-white border border-slate-200 shadow-lg"
          sideOffset={8}
        >
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <IconComponent className="h-3 w-3 text-blue-600" />
              <h4 className="font-medium text-xs text-slate-900">{title}</h4>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">{description}</p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}