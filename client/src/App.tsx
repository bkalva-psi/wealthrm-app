import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/context/auth-context";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { MobileNav } from "@/components/layout/mobile-nav";
import { useState, useEffect } from "react";

import Dashboard from "@/pages/dashboard";
import Clients from "@/pages/clients";
import Prospects from "@/pages/prospects";
import AddProspect from "@/pages/add-prospect";
import ProspectDetail from "@/pages/prospect-detail";
import Calendar from "@/pages/calendar";
import Tasks from "@/pages/tasks";
import Analytics from "@/pages/analytics";
import Products from "@/pages/products";
import Settings from "@/pages/settings";
import NotFound from "@/pages/not-found";
import { Loader2 } from "lucide-react";

// Custom router implementation using hash-based routing
function useHashRouter() {
  const [currentRoute, setCurrentRoute] = useState(
    window.location.hash.replace(/^#/, '') || '/'
  );
  
  useEffect(() => {
    // Set initial hash if it's empty
    if (!window.location.hash) {
      window.location.hash = '/';
    }
    
    const handleHashChange = () => {
      const path = window.location.hash.replace(/^#/, '') || '/';
      console.log('Hash changed to:', path);
      setCurrentRoute(path);
    };
    
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);
  
  return currentRoute;
}

function AuthenticatedApp() {
  const currentRoute = useHashRouter();
  
  // Log current route for debugging
  console.log('Current route:', currentRoute);
  
  // Function to render the appropriate component based on the route
  const renderComponent = () => {
    console.log('Rendering component for route:', currentRoute);
    
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
      case currentRoute === '/calendar':
        return <Calendar />;
      case currentRoute === '/tasks':
        return <Tasks />;
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
        <Header />
        <main className="flex-1 overflow-y-auto bg-slate-50 p-4 md:p-6">
          {renderComponent()}
        </main>
        <MobileNav />
      </div>
    </div>
  );
}

function LoginPage() {
  const { login, authError, isAuthenticating } = useAuth();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    login("rahul.sharma", "password123");
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
        <Toaster />
        {user ? <AuthenticatedApp /> : <LoginPage />}
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
