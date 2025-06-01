import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/context/auth-context";
import { Search, Menu } from "lucide-react";
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
    <header className="bg-background border-b border-border shadow-sm z-10">
      <div className="flex items-center justify-between px-4 py-3">
        {/* Mobile Menu Button */}
        <div className="flex items-center">
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden text-muted-foreground hover:text-foreground">
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
              <h1 className="text-teal-700 dark:text-teal-400 text-sm font-bold leading-tight whitespace-nowrap -ml-3">Ujjivan Small Finance Bank</h1>
              <span className="text-orange-600 dark:text-orange-400 text-xs font-medium leading-tight">Intellect WealthForce</span>
            </div>
          </div>
          
          {/* Ujjivan Logo (visible on desktop) */}
          <div className="hidden md:flex items-center">
            <img src={ujjivanLogo} alt="Ujjivan Small Finance Bank" className="h-10 w-auto" />
            <div className="ml-2 flex flex-col">
              <h1 className="text-teal-700 dark:text-teal-400 text-sm font-bold leading-tight whitespace-nowrap">Ujjivan Small Finance Bank</h1>
              <span className="text-orange-600 dark:text-orange-400 text-xs font-medium leading-tight">Intellect WealthForce</span>
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
                className="block w-full pl-10 pr-3 py-2 border border-border rounded-md leading-5 bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" 
                placeholder="Search clients, prospects, or tasks..." 
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </form>
        </div>
        
        {/* Right Navigation Items */}
        <div className="flex items-center pr-4 ml-8">
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
