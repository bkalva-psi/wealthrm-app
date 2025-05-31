import { createContext, useContext, useState, ReactNode } from 'react';

interface NavigationContextType {
  previousPage: string | null;
  setPreviousPage: (page: string) => void;
  navigateWithHistory: (to: string, from?: string) => void;
  goBack: () => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export function NavigationProvider({ children }: { children: ReactNode }) {
  const [previousPage, setPreviousPage] = useState<string | null>(null);

  const navigateWithHistory = (to: string, from?: string) => {
    const currentFrom = from || window.location.hash.replace('#', '') || '/';
    setPreviousPage(currentFrom);
    window.location.hash = to;
  };

  const goBack = () => {
    if (previousPage) {
      window.location.hash = previousPage;
      setPreviousPage(null);
    } else {
      window.location.hash = '/';
    }
  };

  return (
    <NavigationContext.Provider value={{
      previousPage,
      setPreviousPage,
      navigateWithHistory,
      goBack
    }}>
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigation() {
  const context = useContext(NavigationContext);
  if (context === undefined) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
}