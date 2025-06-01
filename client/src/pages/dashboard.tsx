import { useEffect } from "react";
import { useAuth } from "@/context/auth-context";
import { ActionItemsPriorities } from "@/components/dashboard/action-items-priorities";
import { TalkingPointsCard } from "@/components/dashboard/talking-points-card";
import { AnnouncementsCard } from "@/components/dashboard/announcements-card";
import { PerformanceCard } from "@/components/dashboard/performance-card";
import { BusinessSnapshotStructured } from "@/components/dashboard/business-snapshot-structured";
import { PortfolioAlertsClean } from "@/components/dashboard/portfolio-alerts-clean";
import { SimpleComplaints } from "@/components/dashboard/simple-complaints";

import { PerformanceMetrics } from "@/components/dashboard/performance-metrics";

import { format } from "date-fns";

export default function Dashboard() {
  const { user } = useAuth();
  
  // Set page title
  useEffect(() => {
    document.title = "Dashboard | Wealth RM";
  }, []);
  
  return (
    <div className="p-6">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-800">Welcome back, {user?.fullName.split(' ')[0]}</h1>
        <p className="text-sm text-slate-600">Here's what's happening with your clients today</p>
      </div>
      
      {/* Business Snapshot at Top */}
      <BusinessSnapshotStructured />
      
      {/* Action Items & Priorities */}
      <div className="mt-4">
        <ActionItemsPriorities />
      </div>
      
      {/* Improved 2-Column Layout for Better Information Hierarchy */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {/* Left Column: Priority Actions & Agenda */}
        <div className="space-y-6">
          <ActionItemsPriorities />
          <PortfolioAlertsClean />
          <SimpleComplaints />
        </div>
        
        {/* Right Column: Performance Insights & Updates */}
        <div className="space-y-6">
          <TalkingPointsCard />
          <AnnouncementsCard />
        </div>
      </div>
    </div>
  );
}
