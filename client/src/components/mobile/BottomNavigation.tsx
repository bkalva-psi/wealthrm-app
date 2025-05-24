import React from 'react';
import { useLocation, Link } from 'wouter';
import { 
  Home, 
  Users, 
  UserPlus, 
  BarChart2, 
  CalendarDays,
  Menu 
} from 'lucide-react';

interface NavItem {
  icon: React.ReactNode;
  label: string;
  href: string;
}

const BottomNavigation: React.FC = () => {
  const [location] = useLocation();
  
  const navItems: NavItem[] = [
    {
      icon: <Home size={20} />,
      label: 'Home',
      href: '/'
    },
    {
      icon: <Users size={20} />,
      label: 'Clients',
      href: '/clients'
    },
    {
      icon: <UserPlus size={20} />,
      label: 'Prospects',
      href: '/prospects'
    },
    {
      icon: <BarChart2 size={20} />,
      label: 'Analytics',
      href: '/analytics'
    },
    {
      icon: <Menu size={20} />,
      label: 'More',
      href: '#more'
    }
  ];
  
  const isActive = (href: string): boolean => {
    return location === href || location.startsWith(`${href}/`);
  };

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item, index) => (
          <Link key={index} href={item.href}>
            <a className={`flex flex-col items-center justify-center w-full h-full transition-colors ${
              isActive(item.href) 
                ? 'text-primary' 
                : 'text-gray-500 hover:text-primary'
            }`}>
              {item.icon}
              <span className="text-xs mt-1">{item.label}</span>
            </a>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default BottomNavigation;