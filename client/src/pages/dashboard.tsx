import { useEffect } from "react";
import { useAuth } from "@/context/auth-context";
import { AgendaCard } from "@/components/dashboard/agenda-card-new";
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
    <div className="animate-fade-in">
      {/* Page Header */}
      <div className="mb-6 mt-6 animate-slide-down">
        <div className="welcome-header">
          <h1 className="text-2xl font-semibold heading-modern text-gradient-primary text-balance">
            Welcome back, {user?.fullName.split(' ')[0]}
          </h1>
          <p className="text-sm text-muted-foreground mt-2">
            Here's what's happening with your clients today
          </p>
        </div>
      </div>
      
      {/* Grid Layout for Dashboard Content - Responsive for all device sizes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Column 1: Today's Agenda */}
        <div className="space-y-4 sm:space-y-6 animate-slide-left animate-stagger-1">
          <AgendaCard />
        </div>
        
        {/* Column 2: Performance + Business Snapshot */}
        <div className="space-y-4 sm:space-y-6 animate-slide-up animate-stagger-2">
          <PerformanceCard />
          <BusinessSnapshotStructured />
        </div>
        
        {/* Column 3: Talking Points + Announcements */}
        <div className="space-y-4 sm:space-y-6 animate-slide-right animate-stagger-3">
          <TalkingPointsCard />
          <AnnouncementsCard />
        </div>
      </div>
    </div>
  );
}
