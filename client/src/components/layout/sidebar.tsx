import { useLocation } from "wouter";
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
} from "lucide-react";
import ujjivanLogo from "../../assets/ujjivan_logo.png";

const navigationItems = [
  { name: "Dashboard", href: "/", icon: Home },
  { name: "Clients", href: "/clients", icon: Users },
  { name: "Prospects", href: "/prospects", icon: TrendingUp },
  { name: "Calendar", href: "/calendar", icon: Calendar },
  { name: "Tasks", href: "/tasks", icon: CheckSquare },
  { name: "Analytics", href: "/analytics", icon: BarChart2 },
  { name: "Products", href: "/products", icon: Package },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const [location] = useLocation();
  const { user } = useAuth();

  return (
    <aside className="hidden md:flex md:flex-shrink-0">
      <div className="flex flex-col w-64 border-r border-slate-200 bg-white">
        <div className="flex items-center justify-center h-16 bg-white border-b border-slate-200">
          <div className="flex items-center space-x-2">
            <img src={ujjivanLogo} alt="Ujjivan Small Finance Bank" className="h-12 w-auto" />
            <div className="flex flex-col">
              <h1 className="text-ujjivan-primary text-lg font-bold leading-tight">Ujjivan SFB</h1>
              <span className="text-ujjivan-secondary text-sm font-medium leading-tight">Wealth RM</span>
            </div>
          </div>
        </div>
        
        {/* User Profile Summary */}
        <div className="flex items-center px-4 py-3 border-b border-slate-200">
          {user?.avatarUrl ? (
            <img 
              className="h-10 w-10 rounded-full" 
              src={user.avatarUrl} 
              alt={`${user.fullName} profile`} 
            />
          ) : (
            <div className="h-10 w-10 rounded-full bg-primary-600 flex items-center justify-center text-white text-sm">
              {user?.fullName.split(' ').map(n => n[0]).join('').toUpperCase()}
            </div>
          )}
          <div className="ml-3">
            <p className="text-sm font-medium text-slate-900">{user?.fullName}</p>
            <p className="text-xs text-slate-500">{user?.jobTitle}</p>
          </div>
        </div>
        
        {/* Navigation Links */}
        <nav className="flex-1 px-2 py-4 bg-white space-y-1 overflow-y-auto">
          {navigationItems.map((item) => {
            const isActive = location === item.href;
            
            return (
              <a
                key={item.name}
                href={item.href}
                className={cn(
                  "group flex items-center px-2 py-2 text-sm font-medium rounded-md",
                  isActive
                    ? "bg-primary-50 text-primary-600"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                )}
              >
                <item.icon
                  className={cn(
                    "mr-3 h-5 w-5",
                    isActive ? "text-primary-600" : "text-slate-400 group-hover:text-slate-500"
                  )}
                />
                {item.name}
              </a>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
