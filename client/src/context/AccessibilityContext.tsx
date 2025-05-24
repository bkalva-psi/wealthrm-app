import React, { createContext, useContext, useState, useEffect } from 'react';

interface AccessibilityContextType {
  highContrastMode: boolean;
  toggleHighContrastMode: () => void;
  screenReaderOptimized: boolean;
  toggleScreenReaderOptimized: () => void;
}

const AccessibilityContext = createContext<AccessibilityContextType>({
  highContrastMode: false,
  toggleHighContrastMode: () => {},
  screenReaderOptimized: false,
  toggleScreenReaderOptimized: () => {}
});

export const useAccessibility = () => useContext(AccessibilityContext);

export const AccessibilityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [highContrastMode, setHighContrastMode] = useState(false);
  const [screenReaderOptimized, setScreenReaderOptimized] = useState(false);
  
  // Initialize state from localStorage on mount
  useEffect(() => {
    const savedHighContrast = localStorage.getItem('ujjival_high_contrast');
    const savedScreenReader = localStorage.getItem('ujjival_screen_reader');
    
    if (savedHighContrast) {
      setHighContrastMode(savedHighContrast === 'true');
    }
    
    if (savedScreenReader) {
      setScreenReaderOptimized(savedScreenReader === 'true');
    }
  }, []);
  
  // Apply high contrast mode to the document body
  useEffect(() => {
    if (highContrastMode) {
      document.documentElement.classList.add('high-contrast');
    } else {
      document.documentElement.classList.remove('high-contrast');
    }
    
    // Save preference to localStorage
    localStorage.setItem('ujjival_high_contrast', String(highContrastMode));
  }, [highContrastMode]);
  
  // Apply screen reader optimizations
  useEffect(() => {
    if (screenReaderOptimized) {
      document.documentElement.classList.add('screen-reader-optimized');
    } else {
      document.documentElement.classList.remove('screen-reader-optimized');
    }
    
    // Save preference to localStorage
    localStorage.setItem('ujjival_screen_reader', String(screenReaderOptimized));
  }, [screenReaderOptimized]);
  
  const toggleHighContrastMode = () => {
    setHighContrastMode(prev => !prev);
  };
  
  const toggleScreenReaderOptimized = () => {
    setScreenReaderOptimized(prev => !prev);
  };
  
  return (
    <AccessibilityContext.Provider 
      value={{ 
        highContrastMode, 
        toggleHighContrastMode,
        screenReaderOptimized,
        toggleScreenReaderOptimized
      }}
    >
      {children}
    </AccessibilityContext.Provider>
  );
};