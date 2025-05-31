import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/context/auth-context";
import { AccessibilityProvider } from "@/context/AccessibilityContext";
import { NavigationProvider } from "@/context/navigation-context";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { MobileNav } from "@/components/layout/mobile-nav";
import BottomNavigation from "@/components/mobile/BottomNavigation";
import SwipeableView from "@/components/mobile/SwipeableView";
import { useState, useEffect } from "react";
import { isOnline, saveToCache, getFromCache, CACHE_KEYS } from "@/lib/offlineCache";

import Dashboard from "@/pages/dashboard";
import Clients from "@/pages/clients";
import Prospects from "@/pages/prospects";
import AddProspect from "@/pages/add-prospect";
import ProspectDetail from "@/pages/prospect-detail";


import Analytics from "@/pages/analytics";
import Products from "@/pages/products";
import Settings from "@/pages/settings";
import TalkingPoints from "@/pages/talking-points";
import Announcements from "@/pages/announcements";
import NotFound from "@/pages/not-found";
import ClientActions from "@/pages/client-actions";
import ClientPersonal from "@/pages/client-personal";
import ClientPortfolio from "@/pages/client-portfolio";
import ClientInteractions from "@/pages/client-interactions";
import ClientTransactions from "@/pages/client-transactions";
import ClientCommunications from "@/pages/client-communications";
import ClientAppointments from "@/pages/client-appointments";
import ClientTasks from "@/pages/client-tasks";
import ClientInsights from "@/pages/client-insights";
import TasksUpdated from "@/pages/tasks-updated";
import { Loader2 } from "lucide-react";

// Custom router implementation using hash-based routing
function useHashRouter() {
  const [currentRoute, setCurrentRoute] = useState(() => {
    // Always ensure we start with hash-based routing
    const hash = window.location.hash.replace(/^#/, '');
    const pathname = window.location.pathname;
    
    // If we have a pathname but no hash, move the pathname to hash
    if (pathname && pathname !== '/' && !hash) {
      window.location.replace('#' + pathname);
      return pathname;
    }
    
    return hash || '/';
  });
  
  useEffect(() => {
    // Disable scroll restoration for hash navigation
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }
    
    // Set initial hash if it's empty
    if (!window.location.hash) {
      window.location.hash = '/';
    }
    
    const handleHashChange = () => {
      const path = window.location.hash.replace(/^#/, '') || '/';
      console.log('Hash changed to:', path);
      
      // Scroll both window and main container
      const scrollToTop = () => {
        window.scrollTo(0, 0);
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
        const mainContent = document.getElementById('main-content');
        if (mainContent) {
          mainContent.scrollTop = 0;
        }
      };
      
      // Immediate scroll
      scrollToTop();
      
      setCurrentRoute(path);
      
      // Multiple delayed attempts to override any browser restoration
      setTimeout(scrollToTop, 10);
      setTimeout(scrollToTop, 50);
      setTimeout(scrollToTop, 100);
      setTimeout(scrollToTop, 200);
    };
    
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);
  
  return currentRoute;
}

function AuthenticatedApp() {
  const currentRoute = useHashRouter();
  const [isOffline, setIsOffline] = useState(!isOnline());
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Log current route for debugging
  console.log('Current route:', currentRoute);
  
  // Setup offline detection
  useEffect(() => {
    const handleOnlineStatus = () => {
      setIsOffline(!navigator.onLine);
    };
    
    window.addEventListener('online', handleOnlineStatus);
    window.addEventListener('offline', handleOnlineStatus);
    
    return () => {
      window.removeEventListener('online', handleOnlineStatus);
      window.removeEventListener('offline', handleOnlineStatus);
    };
  }, []);
  
  // Cache critical client data for offline use
  useEffect(() => {
    // Only cache data when online
    if (!isOffline) {
      // Set up automatic caching of critical data
      const cacheClients = async () => {
        try {
          const response = await fetch('/api/clients');
          if (response.ok) {
            const clients = await response.json();
            saveToCache(clients, { key: CACHE_KEYS.CLIENTS, expiryInMinutes: 120 });
          }
        } catch (error) {
          console.error('Failed to cache clients:', error);
        }
      };
      
      cacheClients();
    }
  }, [isOffline]);
  
  // Function to handle swipe navigation
  const handleSwipeLeft = () => {
    // Determine next route based on current route
    switch (true) {
      case currentRoute === '/':
        window.location.hash = '/clients';
        break;
      case currentRoute === '/clients':
        window.location.hash = '/prospects';
        break;
      case currentRoute === '/prospects':
        window.location.hash = '/calendar';
        break;
      // Add more cases as needed
    }
  };
  
  const handleSwipeRight = () => {
    // Determine previous route based on current route
    switch (true) {
      case currentRoute === '/clients':
        window.location.hash = '/';
        break;
      case currentRoute === '/prospects':
        window.location.hash = '/clients';
        break;
      case currentRoute === '/calendar':
        window.location.hash = '/prospects';
        break;
      // Add more cases as needed
    }
  };
  
  // Function to render the appropriate component based on the route
  const renderComponent = () => {
    console.log('Rendering component for route:', currentRoute);
    
    // Force scroll to top when rendering any component
    setTimeout(() => {
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    }, 0);
    
    switch(true) {
      case currentRoute === '/':
        return <Dashboard />;
      case currentRoute === '/clients':
        return <Clients />;
      case currentRoute === '/prospects':
        return <Prospects />;
      case currentRoute === '/prospects/new':
        return <AddProspect />;
      case /^\/prospect-detail\/\d+$/.test(currentRoute):
        const prospectId = parseInt(currentRoute.split('/')[2]);
        return <AddProspect prospectId={prospectId} readOnly={true} />;
      case /^\/prospect-edit\/\d+$/.test(currentRoute):
        const editProspectId = parseInt(currentRoute.split('/')[2]);
        return <AddProspect prospectId={editProspectId} readOnly={false} />;
        
      // Client detail pages
      case /^\/clients\/\d+$/.test(currentRoute):
        // When clicking a client, default to personal info page
        return <ClientPersonal />;
      case /^\/clients\/\d+\/actions$/.test(currentRoute):
        return <ClientActions />;
      case /^\/clients\/\d+\/personal$/.test(currentRoute):
        return <ClientPersonal />;
      case /^\/clients\/\d+\/portfolio$/.test(currentRoute):
        return <ClientPortfolio />;
      case /^\/clients\/\d+\/interactions$/.test(currentRoute):
        return <ClientInteractions />;
      case /^\/clients\/\d+\/transactions$/.test(currentRoute):
        return <ClientTransactions />;
      case /^\/clients\/\d+\/communications$/.test(currentRoute):
        return <ClientCommunications />;
      case /^\/clients\/\d+\/appointments$/.test(currentRoute):
        return <ClientAppointments />;
      case /^\/clients\/\d+\/tasks$/.test(currentRoute):
        return <ClientTasks />;
      case /^\/clients\/\d+\/insights$/.test(currentRoute):
        return <ClientInsights />;
      case /^\/clients\/\d+\/portfolio-report$/.test(currentRoute):
        // Extract client ID and open portfolio report
        const clientIdMatch = currentRoute.match(/\/clients\/(\d+)\/portfolio-report/);
        if (clientIdMatch) {
          const clientId = clientIdMatch[1];
          window.open(`/api/clients/${clientId}/portfolio-report`, '_blank');
          // Navigate back to portfolio page
          setTimeout(() => {
            window.location.hash = `/clients/${clientId}/portfolio`;
          }, 100);
        }
        return <ClientPortfolio />;
      
      case currentRoute === '/calendar':
        return <ClientAppointments clientId="all" />;
      case currentRoute === '/appointments':
        return <ClientAppointments clientId="all" />;
      case currentRoute === '/tasks':
        return <TasksUpdated />;
      case currentRoute === '/communications':
        return <ClientCommunications />;
      case currentRoute === '/talking-points':
        return <TalkingPoints />;
      case currentRoute === '/announcements':
        return <Announcements />;
      case currentRoute === '/analytics':
        return <Analytics />;
      case currentRoute === '/products':
        return <Products />;
      case currentRoute === '/settings':
        return <Settings />;
      default:
        return <NotFound />;
    }
  };
  
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header 
          isMobileMenuOpen={isMobileMenuOpen}
          setIsMobileMenuOpen={setIsMobileMenuOpen}
        />
        
        {/* Offline indicator */}
        {isOffline && (
          <div className="bg-amber-500 text-white p-2 text-center text-sm font-medium">
            You are currently offline. Some features may be limited.
          </div>
        )}
        
        <main className="flex-1 overflow-y-auto bg-slate-50 pb-mobile-nav" id="main-content">
          {renderComponent()}
        </main>
        
        <BottomNavigation 
          onMoreClick={() => setIsMobileMenuOpen(true)}
        />
      </div>
    </div>
  );
}

function LoginPage() {
  const { login, authError, isAuthenticating } = useAuth();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    login("priya.krishnan", "password");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-primary-600">Wealth RM</h1>
          <p className="mt-2 text-sm text-slate-600">
            Relationship Manager Portal
          </p>
        </div>
        <div className="rounded-lg bg-white p-6 shadow-md">
          <form onSubmit={handleLogin}>
            <div className="mb-6">
              <h2 className="mb-4 text-xl font-semibold text-slate-800">
                Sign In
              </h2>
              {authError && (
                <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-800">
                  {authError}
                </div>
              )}
              <div className="mb-4">
                <label
                  htmlFor="username"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Username
                </label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  className="block w-full rounded-md border border-slate-300 px-3 py-2 placeholder-slate-400 focus:border-primary-500 focus:outline-none focus:ring-primary-500 sm:text-sm"
                  defaultValue="rahul.sharma"
                  disabled={isAuthenticating}
                />
              </div>
              <div className="mb-6">
                <label
                  htmlFor="password"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  className="block w-full rounded-md border border-slate-300 px-3 py-2 placeholder-slate-400 focus:border-primary-500 focus:outline-none focus:ring-primary-500 sm:text-sm"
                  defaultValue="password123"
                  disabled={isAuthenticating}
                />
              </div>
              <button
                type="submit"
                className="w-full rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                disabled={isAuthenticating}
              >
                {isAuthenticating ? (
                  <span className="flex items-center justify-center">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </span>
                ) : (
                  "Sign In"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

function App() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary-600" />
          <p className="mt-4 text-slate-600">Loading application...</p>
        </div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AccessibilityProvider>
          <NavigationProvider>
            <Toaster />
            {user ? <AuthenticatedApp /> : <LoginPage />}
          </NavigationProvider>
        </AccessibilityProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
