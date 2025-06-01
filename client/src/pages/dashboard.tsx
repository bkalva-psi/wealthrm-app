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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Enhanced Page Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                Welcome back, {user?.fullName.split(' ')[0]}
              </h1>
              <p className="text-slate-600 dark:text-slate-400 text-lg">
                {format(new Date(), "EEEE, MMMM d, yyyy")}
              </p>
            </div>
            <div className="hidden md:flex items-center gap-4">
              <ThemeSwitcher />
              <div className="bg-white dark:bg-slate-800 rounded-xl px-6 py-3 shadow-sm border border-slate-200 dark:border-slate-700">
                <div className="text-sm text-slate-500 dark:text-slate-400">Current Time</div>
                <div className="text-lg font-semibold text-slate-800 dark:text-slate-200">
                  {format(new Date(), "h:mm a")}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Business Snapshot with Enhanced Spacing */}
        <div className="mb-8">
          <BusinessSnapshotStructured />
        </div>
        
        {/* Enhanced Grid Layout with Staggered Animations */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8">
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
