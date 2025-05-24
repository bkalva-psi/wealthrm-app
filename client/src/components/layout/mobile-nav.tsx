import { useLocation, Link } from "wouter";
import { cn } from "@/lib/utils";
import {
  Home,
  Users,
  Clock,
  BarChart2,
  Menu,
} from "lucide-react";
import ujjivanLogo from "../../assets/ujjivan-logo.png";

const navigationItems = [
  { name: "Home", href: "/", icon: Home },
  { name: "Clients", href: "/clients", icon: Users },
  { name: "Tasks", href: "/tasks", icon: Clock },
  { name: "Analytics", href: "/analytics", icon: BarChart2 },
  { name: "More", href: "#", icon: Menu },
];

export function MobileNav() {
  const [location, navigate] = useLocation();

  const handleMoreClick = (e: React.MouseEvent) => {
    e.preventDefault();
    // This could open a drawer with more menu items
    // For now, navigate to settings
    navigate("/settings");
  };

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-10 safe-area-bottom">
      <div className="grid grid-cols-5 h-16">
        {navigationItems.map((item) => {
          const isActive = item.href === "#" ? false : location === item.href;
          
          return item.href === "#" ? (
            <button
              key={item.name}
              onClick={handleMoreClick}
              className={cn(
                "flex flex-col items-center justify-center space-y-1 p-1",
                isActive ? "text-primary-600" : "text-slate-500"
              )}
            >
              <item.icon className={cn(
                "h-5 w-5 sm:h-6 sm:w-6",
                isActive ? "text-primary-600" : "text-slate-500"
              )} />
              <span className="text-[10px] sm:text-xs">{item.name}</span>
            </button>
          ) : (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center space-y-1 p-1",
                isActive ? "text-primary-600" : "text-slate-500"
              )}
            >
              <item.icon className={cn(
                "h-5 w-5 sm:h-6 sm:w-6",
                isActive ? "text-primary-600" : "text-slate-500"
              )} />
              <span className="text-[10px] sm:text-xs">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
