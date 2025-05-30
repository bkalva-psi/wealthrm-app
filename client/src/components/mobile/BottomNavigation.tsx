import React, { useEffect, useState } from 'react';
import { Home, Calendar, CheckSquare, Lightbulb, Menu } from 'lucide-react';
import { useMediaQuery } from '@/hooks/use-media-query';
import { useQuery } from '@tanstack/react-query';

interface BottomNavigationProps {
  className?: string;
}

const BottomNavigation: React.FC<BottomNavigationProps> = ({ className = '' }) => {
  const [currentPath, setCurrentPath] = useState<string>('');
  const isMobile = useMediaQuery('(max-width: 768px)');

  // Fetch data for notification dots
  const { data: appointments } = useQuery({
    queryKey: ['/api/appointments/today'],
    staleTime: 5 * 60 * 1000,
  });

  const { data: tasks } = useQuery({
    queryKey: ['/api/tasks'],
    staleTime: 5 * 60 * 1000,
  });

  const { data: talkingPoints } = useQuery({
    queryKey: ['/api/talking-points'],
    staleTime: 5 * 60 * 1000,
  });

  // Calculate notification indicators
  const hasAppointmentsToday = Array.isArray(appointments) && appointments.length > 0;
  const hasOverdueTasks = Array.isArray(tasks) && tasks.some((task: any) => {
    const dueDate = new Date(task.dueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return dueDate <= today && task.status !== 'completed';
  });
  const hasRecentTalkingPoints = Array.isArray(talkingPoints) && talkingPoints.some((point: any) => {
    const createdDate = new Date(point.created_at);
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
    return createdDate >= threeDaysAgo && point.is_active;
  });
  
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
    if (path === '/calendar' && currentPath === '/calendar') return true;
    if (path === '/tasks' && currentPath === '/tasks') return true;
    if (path === '/talking-points' && currentPath === '/talking-points') return true;
    if (path === '/menu' && (
      currentPath === '/settings' || 
      currentPath === '/clients' || 
      currentPath === '/prospects' ||
      currentPath === '/announcements' ||
      currentPath === '/analytics' || 
      currentPath === '/products' ||
      currentPath === '/communications'
    )) return true;
    
    return false;
  };
  
  const navigateTo = (path: string) => {
    window.location.hash = path;
  };
  
  if (!isMobile) {
    return null; // Don't render on non-mobile screens
  }
  
  // Notification dot component
  const NotificationDot = ({ show, className = '' }: { show: boolean; className?: string }) => {
    if (!show) return null;
    return (
      <div className={`absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full ${className}`} />
    );
  };

  return (
    <div className={`fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around items-center h-16 z-50 ${className}`}>
      <button 
        onClick={() => navigateTo('/')}
        className={`flex flex-col items-center justify-center w-full h-full ${isActive('/') ? 'text-ujjivan-primary' : 'text-gray-500'} relative`}
        aria-label="Home"
      >
        <Home size={24} />
        <span className="text-xs mt-1">Home</span>
      </button>
      
      <button 
        onClick={() => navigateTo('/calendar')}
        className={`flex flex-col items-center justify-center w-full h-full ${isActive('/calendar') ? 'text-ujjivan-primary' : 'text-gray-500'} relative`}
        aria-label="Calendar"
      >
        <Calendar size={24} />
        <span className="text-xs mt-1">Calendar</span>
        <NotificationDot show={Boolean(hasAppointmentsToday)} />
      </button>
      
      <button 
        onClick={() => navigateTo('/tasks')}
        className={`flex flex-col items-center justify-center w-full h-full ${isActive('/tasks') ? 'text-ujjivan-primary' : 'text-gray-500'} relative`}
        aria-label="Tasks"
      >
        <CheckSquare size={24} />
        <span className="text-xs mt-1">Tasks</span>
        <NotificationDot show={Boolean(hasOverdueTasks)} />
      </button>
      
      <button 
        onClick={() => navigateTo('/talking-points')}
        className={`flex flex-col items-center justify-center w-full h-full ${isActive('/talking-points') ? 'text-ujjivan-primary' : 'text-gray-500'} relative`}
        aria-label="Talking Points"
      >
        <Lightbulb size={24} />
        <span className="text-xs mt-1">Points</span>
        <NotificationDot show={Boolean(hasRecentTalkingPoints)} className="bg-blue-500" />
      </button>
      
      <button 
        onClick={() => navigateTo('/settings')}
        className={`flex flex-col items-center justify-center w-full h-full ${isActive('/menu') ? 'text-ujjivan-primary' : 'text-gray-500'} relative`}
        aria-label="More"
      >
        <Menu size={24} />
        <span className="text-xs mt-1">More</span>
      </button>
    </div>
  );
};

export default BottomNavigation;