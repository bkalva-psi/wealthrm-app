import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/context/auth-context";
import { Search, Menu, User, X } from "lucide-react";
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
import sravanAvatar from "../../assets/sravan-avatar.svg";
import { cn } from "@/lib/utils";

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
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Get unread portfolio alerts count
  const { data: portfolioAlerts } = useQuery({
    queryKey: ['/api/portfolio-alerts?read=false'],
    staleTime: 60000, // 1 minute
  });
  
  const unreadAlertsCount = portfolioAlerts?.length || 0;
  
  // Search clients with dynamic filtering
  const { data: searchResults, isLoading: isSearching } = useQuery({
    queryKey: ['/api/clients/search', searchQuery],
    queryFn: async () => {
      if (!searchQuery.trim() || searchQuery.length < 2) return [];
      
      const response = await fetch(`/api/clients/search?q=${encodeURIComponent(searchQuery.trim())}`);
      if (!response.ok) throw new Error('Search failed');
      return response.json();
    },
    enabled: searchQuery.length >= 2,
    staleTime: 30000, // 30 seconds
  });
  
  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchResults(false);
        setSelectedIndex(-1);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  // Show search results when query changes
  useEffect(() => {
    if (searchQuery.length >= 2 && searchResults) {
      setShowSearchResults(true);
      setSelectedIndex(-1);
    } else {
      setShowSearchResults(false);
    }
  }, [searchQuery, searchResults]);
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedIndex >= 0 && searchResults && searchResults[selectedIndex]) {
      navigateToClient(searchResults[selectedIndex]);
    } else if (searchResults && searchResults.length > 0) {
      navigateToClient(searchResults[0]);
    }
  };
  
  const navigateToClient = (client: any) => {
    window.location.hash = `/clients/${client.id}/personal`;
    setSearchQuery("");
    setShowSearchResults(false);
    setSelectedIndex(-1);
    inputRef.current?.blur();
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSearchResults || !searchResults?.length) return;
    
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < searchResults.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0) {
          navigateToClient(searchResults[selectedIndex]);
        } else if (searchResults.length > 0) {
          navigateToClient(searchResults[0]);
        }
        break;
      case 'Escape':
        setShowSearchResults(false);
        setSelectedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };
  
  const clearSearch = () => {
    setSearchQuery("");
    setShowSearchResults(false);
    setSelectedIndex(-1);
    inputRef.current?.focus();
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
            <div className="ml-2 flex flex-col justify-center">
              <h1 className="text-teal-700 dark:text-teal-400 text-sm font-bold leading-tight whitespace-nowrap m-0 p-0">Ujjivan Small Finance Bank</h1>
              <span className="text-orange-600 dark:text-orange-400 text-xs font-medium leading-tight m-0 p-0">Intellect WealthForce</span>
            </div>
          </div>
          
          {/* Ujjivan Logo (visible on desktop) */}
          <div className="hidden md:flex items-center">
            <img src={ujjivanLogo} alt="Ujjivan Small Finance Bank" className="h-10 w-auto" />
            <div className="ml-2 flex flex-col justify-center">
              <h1 className="text-teal-700 dark:text-teal-400 text-sm font-bold leading-tight whitespace-nowrap m-0 p-0">Ujjivan Small Finance Bank</h1>
              <span className="text-orange-600 dark:text-orange-400 text-xs font-medium leading-tight m-0 p-0">Intellect WealthForce</span>
            </div>
          </div>
        </div>
        
        {/* Search Bar */}
        <div className="flex-1 max-w-lg mx-4 hidden sm:block" ref={searchRef}>
          <form onSubmit={handleSearch}>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-slate-400" />
              </div>
              <input 
                ref={inputRef}
                className="block w-full pl-10 pr-10 py-2 border border-border rounded-md leading-5 bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" 
                placeholder="Search clients by name..." 
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                autoComplete="off"
              />
              {searchQuery && (
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={clearSearch}
                >
                  <X className="h-4 w-4 text-slate-400 hover:text-slate-600" />
                </button>
              )}
              
              {/* Search Results Dropdown */}
              {showSearchResults && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-md shadow-lg z-50 max-h-96 overflow-y-auto">
                  {isSearching ? (
                    <div className="px-4 py-3 text-sm text-muted-foreground">
                      Searching...
                    </div>
                  ) : searchResults && searchResults.length > 0 ? (
                    <>
                      <div className="px-3 py-2 text-xs font-medium text-muted-foreground border-b border-border">
                        Found {searchResults.length} client{searchResults.length === 1 ? '' : 's'}
                      </div>
                      {searchResults.map((client: any, index: number) => (
                        <button
                          key={client.id}
                          className={cn(
                            "w-full px-4 py-3 text-left hover:bg-muted flex items-center gap-3 border-b border-border/50 last:border-b-0",
                            selectedIndex === index && "bg-muted"
                          )}
                          onClick={() => navigateToClient(client)}
                        >
                          <div className="flex-shrink-0">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                              <User className="h-4 w-4 text-primary" />
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-card-foreground truncate">
                              {client.fullName}
                            </div>
                            <div className="text-sm text-muted-foreground flex items-center gap-2">
                              <span>ID: {client.id}</span>
                              {client.tier && (
                                <>
                                  <span>•</span>
                                  <span className={cn(
                                    "px-1.5 py-0.5 text-xs rounded",
                                    client.tier === 'Premium' && "bg-yellow-100 text-yellow-800",
                                    client.tier === 'Gold' && "bg-amber-100 text-amber-800",
                                    client.tier === 'Silver' && "bg-gray-100 text-gray-800"
                                  )}>
                                    {client.tier}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </button>
                      ))}
                    </>
                  ) : searchQuery.length >= 2 ? (
                    <div className="px-4 py-6 text-center text-sm text-muted-foreground">
                      No clients found for "{searchQuery}"
                    </div>
                  ) : null}
                </div>
              )}
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
                  <img 
                    className="h-10 w-10 rounded-full border-2 border-ujjivan-primary shadow-sm" 
                    src={sravanAvatar} 
                    alt={`${user?.fullName} profile`} 
                  />
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
