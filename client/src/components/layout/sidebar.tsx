import { useLocation, Link } from "wouter";
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

export function Sidebar({ mobile = false }: { mobile?: boolean }) {
  const [location] = useLocation();
  const { user } = useAuth();
  
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
          const isActive = location === item.href;
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "group flex items-center px-2 py-2 text-sm font-medium rounded-md",
                isActive
                  ? "bg-ujjivan-primary text-white font-semibold"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              <item.icon
                className={cn(
                  "mr-3 h-5 w-5",
                  isActive ? "text-white" : "text-slate-400 group-hover:text-slate-500"
                )}
              />
              {item.name}
            </Link>
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
