import { createContext, useContext, useCallback, ReactNode, useState, useEffect } from 'react';

interface NavigationContextType {
  navigate: (path: string) => void;
  currentPath: string;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export function NavigationProvider({ children }: { children: ReactNode }) {
  const [currentPath, setCurrentPath] = useState<string>(
    window.location.hash.replace(/^#/, '') || '/'
  );

  // Listen for hash changes to update the current path
  useEffect(() => {
    const handleHashChange = () => {
      setCurrentPath(window.location.hash.replace(/^#/, '') || '/');
    };

    // Set up event listener
    window.addEventListener('hashchange', handleHashChange);

    // Clean up
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  // Navigation function that updates the URL hash
  const navigate = useCallback((path: string) => {
    window.location.hash = path;
  }, []);

  return (
    <NavigationContext.Provider value={{ navigate, currentPath }}>
      {children}
    </NavigationContext.Provider>
  );
}

// Custom hook for using the navigation context
export function useNavigation() {
  const context = useContext(NavigationContext);
  if (context === undefined) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
}