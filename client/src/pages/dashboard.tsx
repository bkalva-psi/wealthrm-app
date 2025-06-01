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
      <div className="max-w-8xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 xl:px-10 py-4 sm:py-6 lg:py-8">
        {/* Optimized Page Header */}
        <div className="mb-6 sm:mb-8 lg:mb-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-0">
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-1 sm:mb-2 leading-tight">
                Welcome back, {user?.fullName.split(' ')[0]}
              </h1>
              <p className="text-muted-foreground text-sm sm:text-base lg:text-lg">
                {format(new Date(), "EEEE, MMMM d, yyyy")}
              </p>
            </div>
            <div className="flex items-center gap-3 sm:gap-4 self-start sm:self-center">
              <ThemeSwitcher />
            </div>
          </div>
        </div>
        
        {/* Business Snapshot with Optimized Spacing */}
        <div className="mb-6 sm:mb-8 lg:mb-12">
          <BusinessSnapshotStructured />
        </div>
        
        {/* Optimized Responsive Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 lg:gap-8 xl:gap-10">
          {/* Action Items Section - Optimized proportions */}
          <div className="lg:col-span-5 xl:col-span-4 animate-stagger-1">
            <ActionItemsPriorities />
          </div>
          
          {/* Market Insights & Updates - Better proportions for content */}
          <div className="lg:col-span-7 xl:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
            <div className="animate-stagger-2">
              <TalkingPointsCard />
            </div>
            <div className="animate-stagger-3">
              <AnnouncementsCard />
            </div>
          </div>
        </div>
        
        {/* Additional spacing for mobile scroll */}
        <div className="pb-6 sm:pb-8 lg:pb-12"></div>
      </div>
    </div>
  );
}
