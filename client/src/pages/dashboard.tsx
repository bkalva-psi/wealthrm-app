import { useEffect } from "react";
import { useAuth } from "@/context/auth-context";
import { ActionItemsPriorities } from "@/components/dashboard/action-items-priorities";
import { TalkingPointsCard } from "@/components/dashboard/talking-points-card";
import { AnnouncementsCard } from "@/components/dashboard/announcements-card";
import { PerformanceCard } from "@/components/dashboard/performance-card";
import { BusinessSnapshotStructured } from "@/components/dashboard/business-snapshot-structured";
import { ThemeSwitcher } from "@/components/theme-switcher";



import { PerformanceMetrics } from "@/components/dashboard/performance-metrics";

import { format } from "date-fns";

export default function Dashboard() {
  const { user } = useAuth();
  
  // Set page title
  useEffect(() => {
    document.title = "Dashboard | Wealth RM";
  }, []);
  
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Enhanced Page Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                Welcome back, {user?.fullName.split(' ')[0]}
              </h1>
              <p className="text-muted-foreground text-lg">
                {format(new Date(), "EEEE, MMMM d, yyyy")}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <ThemeSwitcher />
            </div>
          </div>
        </div>
        
        {/* Business Snapshot with Enhanced Spacing */}
        <div className="mb-10">
          <BusinessSnapshotStructured />
        </div>
        
        {/* Enhanced Grid Layout with Improved Spacing */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 lg:gap-10">
          {/* Left Column: Priority Actions - Takes more space */}
          <div className="xl:col-span-1 animate-stagger-1">
            <ActionItemsPriorities />
          </div>
          
          {/* Right Columns: Market Insights & Updates */}
          <div className="xl:col-span-2 grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
            <div className="animate-stagger-2">
              <TalkingPointsCard />
            </div>
            <div className="animate-stagger-3">
              <AnnouncementsCard />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
