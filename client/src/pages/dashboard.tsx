import { useEffect } from "react";
import { useAuth } from "@/context/auth-context";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { AgendaCard } from "@/components/dashboard/agenda-card";
import { TasksCard } from "@/components/dashboard/tasks-card";
import { PortfolioAlerts } from "@/components/dashboard/portfolio-alerts";
import { RecentClients } from "@/components/dashboard/recent-clients";
import { PerformanceMetrics } from "@/components/dashboard/performance-metrics";
import { SalesPipeline } from "@/components/dashboard/sales-pipeline";
import { format } from "date-fns";

export default function Dashboard() {
  const { user } = useAuth();
  
  // Set page title
  useEffect(() => {
    document.title = "Dashboard | Wealth RM";
  }, []);
  
  return (
    <div>
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-800">Welcome back, {user?.fullName.split(' ')[0]}</h1>
        <p className="text-sm text-slate-600">Here's what's happening with your clients today</p>
      </div>
      
      {/* Quick Actions Strip */}
      <QuickActions />
      
      {/* Grid Layout for Dashboard Content - Responsive for all device sizes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Column 1: Today's Agenda and Tasks */}
        <div className="space-y-4 sm:space-y-6">
          <AgendaCard />
          <TasksCard />
        </div>
        
        {/* Column 2: Portfolio Alerts & Recent Clients */}
        <div className="space-y-4 sm:space-y-6">
          <PortfolioAlerts />
          <RecentClients />
        </div>
        
        {/* Column 3: Performance Metrics & Pipeline */}
        <div className="space-y-4 sm:space-y-6 md:col-span-2 lg:col-span-1">
          <PerformanceMetrics />
          <SalesPipeline />
        </div>
      </div>
    </div>
  );
}
