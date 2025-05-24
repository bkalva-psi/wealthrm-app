import React, { useEffect, useState } from 'react';
import { Home, Users, Phone, Calendar, Menu } from 'lucide-react';
import { useMediaQuery } from '@/hooks/use-media-query';

interface BottomNavigationProps {
  className?: string;
}

const BottomNavigation: React.FC<BottomNavigationProps> = ({ className = '' }) => {
  const [currentPath, setCurrentPath] = useState<string>('');
  const isMobile = useMediaQuery('(max-width: 768px)');
  
  useEffect(() => {
    // Initialize with current hash path
    const hash = window.location.hash.replace(/^#/, '') || '/';
    setCurrentPath(hash);
    
    // Listen for hash changes
    const handleHashChange = () => {
      const path = window.location.hash.replace(/^#/, '') || '/';
      setCurrentPath(path);
    };
    
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);
  
  const isActive = (path: string): boolean => {
    if (path === '/' && currentPath === '/') return true;
    if (path === '/clients' && (currentPath === '/clients' || currentPath.startsWith('/clients/'))) return true;
    if (path === '/prospects' && (currentPath === '/prospects' || currentPath.startsWith('/prospect'))) return true;
    if (path === '/calendar' && currentPath === '/calendar') return true;
    if (path === '/menu' && (
      currentPath === '/settings' || 
      currentPath === '/tasks' || 
      currentPath === '/analytics' || 
      currentPath === '/products'
    )) return true;
    
    return false;
  };
  
  const navigateTo = (path: string) => {
    window.location.hash = path;
  };
  
  if (!isMobile) {
    return null; // Don't render on non-mobile screens
  }
  
  return (
    <div className={`fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around items-center h-16 z-50 ${className}`}>
      <button 
        onClick={() => navigateTo('/')}
        className={`flex flex-col items-center justify-center w-full h-full ${isActive('/') ? 'text-primary' : 'text-gray-500'}`}
        aria-label="Home"
      >
        <Home size={24} />
        <span className="text-xs mt-1">Home</span>
      </button>
      
      <button 
        onClick={() => navigateTo('/clients')}
        className={`flex flex-col items-center justify-center w-full h-full ${isActive('/clients') ? 'text-primary' : 'text-gray-500'}`}
        aria-label="Clients"
      >
        <Users size={24} />
        <span className="text-xs mt-1">Clients</span>
      </button>
      
      <button 
        onClick={() => navigateTo('/prospects')}
        className={`flex flex-col items-center justify-center w-full h-full ${isActive('/prospects') ? 'text-primary' : 'text-gray-500'}`}
        aria-label="Prospects"
      >
        <Phone size={24} />
        <span className="text-xs mt-1">Prospects</span>
      </button>
      
      <button 
        onClick={() => navigateTo('/calendar')}
        className={`flex flex-col items-center justify-center w-full h-full ${isActive('/calendar') ? 'text-primary' : 'text-gray-500'}`}
        aria-label="Calendar"
      >
        <Calendar size={24} />
        <span className="text-xs mt-1">Calendar</span>
      </button>
      
      <button 
        onClick={() => navigateTo('/settings')}
        className={`flex flex-col items-center justify-center w-full h-full ${isActive('/menu') ? 'text-primary' : 'text-gray-500'}`}
        aria-label="More"
      >
        <Menu size={24} />
        <span className="text-xs mt-1">More</span>
      </button>
    </div>
  );
};

export default BottomNavigation;