import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/context/auth-context";
import { Search, Bell, Menu } from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Sidebar } from "./sidebar";
import ujjivanLogo from "../../assets/ujjivan_logo.png";

interface HeaderProps {
  isMobileMenuOpen?: boolean;
  setIsMobileMenuOpen?: (open: boolean) => void;
}

export function Header({ 
  isMobileMenuOpen = false, 
  setIsMobileMenuOpen = () => {} 
}: HeaderProps = {}) {
  const { user, logout } = useAuth();
  const [, navigate] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  
  // Get unread portfolio alerts count
  const { data: portfolioAlerts } = useQuery({
    queryKey: ['/api/portfolio-alerts?read=false'],
    staleTime: 60000, // 1 minute
  });
  
  const unreadAlertsCount = portfolioAlerts?.length || 0;
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Implement search functionality
    console.log("Search query:", searchQuery);
  };
  
  return (
    <header className="bg-white shadow-sm z-10">
      <div className="flex items-center justify-between px-4 py-3">
        {/* Mobile Menu Button */}
        <div className="flex items-center">
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden text-slate-500 hover:text-slate-600">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Open menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-[280px] sm:w-[320px]">
              <div className="flex items-center h-16 px-4 border-b border-slate-200">
                <img src={ujjivanLogo} alt="Ujjivan Small Finance Bank" className="h-10 w-auto" />
                <div className="ml-2 flex flex-col">
                  <h1 className="text-ujjivan-primary text-sm font-bold leading-tight whitespace-nowrap">Ujjivan Small Finance Bank</h1>
                  <span className="text-ujjivan-secondary text-xs font-medium leading-tight">Wealth RM Pro</span>
                </div>
              </div>
              <Sidebar mobile={true} onNavigate={() => setIsMobileMenuOpen(false)} />
            </SheetContent>
          </Sheet>
          
          {/* Ujjivan Logo (visible on mobile) */}
          <div className="flex items-center md:hidden ml-2">
            <img src={ujjivanLogo} alt="Ujjivan Small Finance Bank" className="h-10 w-auto" />
            <div className="ml-1 flex flex-col">
              <h1 className="text-ujjivan-primary text-sm font-bold leading-tight whitespace-nowrap -ml-3">Ujjivan Small Finance Bank</h1>
              <span className="text-ujjivan-secondary text-xs font-medium leading-tight">Wealth RM Pro</span>
            </div>
          </div>
        </div>
        
        {/* Search Bar */}
        <div className="flex-1 max-w-lg mx-4 hidden sm:block">
          <form onSubmit={handleSearch}>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-slate-400" />
              </div>
              <input 
                className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-md leading-5 bg-white placeholder-slate-500 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm" 
                placeholder="Search clients, prospects, or tasks..." 
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </form>
        </div>
        
        {/* Right Navigation Items */}
        <div className="flex items-center space-x-2 pr-6">
          {/* Notification Bell */}
          <div className="relative">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative p-1 text-slate-500 rounded-full hover:bg-slate-100 focus:outline-none">
                  <Bell className="h-6 w-6" />
                  {unreadAlertsCount > 0 && (
                    <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-error pulse-animation"></span>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {unreadAlertsCount > 0 ? (
                  <>
                    <DropdownMenuItem className="cursor-pointer">
                      <div className="flex flex-col space-y-1">
                        <span className="font-medium">Portfolio Deviation - Gupta Family</span>
                        <span className="text-xs text-slate-500">1 hour ago</span>
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="cursor-pointer">
                      <div className="flex flex-col space-y-1">
                        <span className="font-medium">Risk Profile Update - Sanjay Kapoor</span>
                        <span className="text-xs text-slate-500">3 hours ago</span>
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      className="cursor-pointer text-primary-600"
                      onClick={() => navigate("/alerts")}
                    >
                      View all notifications
                    </DropdownMenuItem>
                  </>
                ) : (
                  <div className="py-2 px-4 text-center text-sm text-slate-500">
                    No new notifications
                  </div>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          {/* Profile Dropdown */}
          <div className="relative">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center focus:outline-none">
                  <span className="hidden md:block mr-2 text-sm font-medium text-slate-700">{user?.fullName}</span>
                  {user?.avatarUrl ? (
                    <img 
                      className="h-10 w-10 rounded-full border-2 border-ujjivan-primary" 
                      src={user.avatarUrl} 
                      alt={`${user.fullName} profile`} 
                    />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-ujjivan-primary flex items-center justify-center text-white text-sm border-2 border-ujjivan-secondary">
                      {user?.fullName.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </div>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate("/profile")}>Profile</DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/settings")}>Settings</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => logout()}>Logout</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}
