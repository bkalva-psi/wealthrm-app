import { useLocation } from "wouter";
import { cn } from "@/lib/utils";
import {
  Home,
  Users,
  Clock,
  BarChart2,
  Menu,
} from "lucide-react";

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
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-10">
      <div className="grid grid-cols-5 h-16">
        {navigationItems.map((item) => {
          const isActive = item.href === "#" ? false : location === item.href;
          
          return (
            <button
              key={item.name}
              onClick={(e) => {
                if (item.href === "#") {
                  handleMoreClick(e);
                } else {
                  navigate(item.href);
                }
              }}
              className={cn(
                "flex flex-col items-center justify-center space-y-1",
                isActive ? "text-primary-600" : "text-slate-500"
              )}
            >
              <item.icon className="h-6 w-6" />
              <span className="text-xs">{item.name}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
