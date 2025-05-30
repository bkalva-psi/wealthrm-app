import { useAuth } from "@/context/auth-context";
import { cn } from "@/lib/utils";
import {
  Home,
  Users,
  TrendingUp,
  Calendar,
  CheckSquare,
  BarChart2,
  Package,
  Settings,
  FileText,
  Lightbulb,
  Megaphone,
} from "lucide-react";
import ujjivanLogo from "../../assets/ujjivan_logo.png";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";

const navigationItems = [
  { name: "Dashboard", href: "/", icon: Home },
  { name: "Clients", href: "/clients", icon: Users },
  { name: "Prospects", href: "/prospects", icon: TrendingUp },
  { name: "Calendar", href: "/calendar", icon: Calendar },
  { name: "Tasks", href: "/tasks", icon: CheckSquare },
  { name: "Notes", href: "/communications", icon: FileText },
  { name: "Talking Points", href: "/talking-points", icon: Lightbulb },
  { name: "Announcements", href: "/announcements", icon: Megaphone },
  { name: "Analytics", href: "/analytics", icon: BarChart2 },
  { name: "Products", href: "/products", icon: Package },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar({ mobile = false, onNavigate }: { mobile?: boolean; onNavigate?: () => void }) {
  const { user } = useAuth();
  const [currentPath, setCurrentPath] = useState(window.location.hash.replace(/^#/, '') || '/');

  // Fetch data for notification dots
  const { data: appointments } = useQuery({
    queryKey: ['/api/appointments/today'],
    staleTime: 5 * 60 * 1000,
  });

  const { data: tasks } = useQuery({
    queryKey: ['/api/tasks'],
    staleTime: 5 * 60 * 1000,
  });

  const { data: talkingPoints } = useQuery({
    queryKey: ['/api/talking-points'],
    staleTime: 5 * 60 * 1000,
  });

  const { data: announcements } = useQuery({
    queryKey: ['/api/announcements'],
    staleTime: 5 * 60 * 1000,
  });

  // Calculate notification indicators
  const hasAppointmentsToday = Array.isArray(appointments) && appointments.length > 0;
  const hasOverdueTasks = Array.isArray(tasks) && tasks.some((task: any) => {
    const dueDate = new Date(task.dueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return dueDate <= today && task.status !== 'completed';
  });
  const hasRecentTalkingPoints = Array.isArray(talkingPoints) && talkingPoints.some((point: any) => {
    const createdDate = new Date(point.created_at);
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
    return createdDate >= threeDaysAgo && point.is_active;
  });
  const hasRecentAnnouncements = Array.isArray(announcements) && announcements.some((announcement: any) => {
    const createdDate = new Date(announcement.created_at);
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
    return createdDate >= threeDaysAgo && announcement.is_active;
  });

  // Notification dot helper function
  const getNotificationStatus = (href: string) => {
    switch (href) {
      case '/calendar':
        return hasAppointmentsToday;
      case '/tasks':
        return hasOverdueTasks;
      case '/talking-points':
        return hasRecentTalkingPoints;
      case '/announcements':
        return hasRecentAnnouncements;
      default:
        return false;
    }
  };
  
  // Update currentPath when hash changes
  useEffect(() => {
    const handleHashChange = () => {
      setCurrentPath(window.location.hash.replace(/^#/, '') || '/');
    };
    
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);
  
  const handleNavigation = (path: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    window.location.hash = path;
    // Close mobile menu if callback is provided
    if (onNavigate) {
      onNavigate();
    }
  };
  
  const sidebarContent = (
    <div className={cn("flex flex-col w-full md:w-64 border-r border-slate-200 bg-white h-full")}>
      {/* Only show logo in the sidebar when it's not mobile view, as mobile view already has logo in the Sheet header */}
      {!mobile && (
        <div className="flex items-center justify-center h-16 bg-white border-b border-slate-200">
          <div className="flex items-center space-x-2">
            <img src={ujjivanLogo} alt="Ujjivan Small Finance Bank" className="h-12 w-auto" />
            <div className="flex flex-col">
              <h1 className="text-ujjivan-primary text-lg font-bold leading-tight">Ujjivan SFB</h1>
              <span className="text-ujjivan-secondary text-sm font-medium leading-tight">Wealth RM</span>
            </div>
          </div>
        </div>
      )}
      
      {/* Navigation Links */}
      <nav className="flex-1 px-2 py-4 bg-white space-y-1 overflow-y-auto">
        {navigationItems.map((item) => {
          const isActive = currentPath === item.href;
          const hasNotification = getNotificationStatus(item.href);
          
          return (
            <a
              key={item.name}
              href={`#${item.href}`}
              onClick={handleNavigation(item.href)}
              className={cn(
                "group flex items-center justify-between px-2 py-2 text-sm font-medium rounded-md relative",
                isActive
                  ? "bg-ujjivan-primary text-white font-semibold"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              <div className="flex items-center">
                <item.icon
                  className={cn(
                    "mr-3 h-5 w-5",
                    isActive ? "text-white" : "text-slate-400 group-hover:text-slate-500"
                  )}
                />
                {item.name}
              </div>
              {hasNotification && (
                <div className={cn(
                  "w-2 h-2 rounded-full",
                  item.href === '/talking-points' || item.href === '/announcements' 
                    ? "bg-blue-500" 
                    : "bg-red-500"
                )} />
              )}
            </a>
          );
        })}
      </nav>
    </div>
  );
  
  // If it's for mobile, just return the content
  if (mobile) {
    return sidebarContent;
  }
  
  // For desktop, wrap it in the aside element with the appropriate classes
  return (
    <aside className="hidden md:flex md:flex-shrink-0">
      {sidebarContent}
    </aside>
  );
}
