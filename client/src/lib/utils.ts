import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, isToday, isYesterday, differenceInDays } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number): string {
  if (value >= 10000000) {
    return `₹${(value / 10000000).toFixed(1)} Cr`;
  } else if (value >= 100000) {
    return `₹${(value / 100000).toFixed(1)} L`;
  } else if (value >= 1000) {
    return `₹${(value / 1000).toFixed(1)} K`;
  }
  return `₹${value}`;
}

export function getTierColor(tier: string): { bg: string, text: string } {
  switch (tier.toLowerCase()) {
    case 'platinum':
      return { bg: 'bg-green-100', text: 'text-green-800' };
    case 'gold':
      return { bg: 'bg-amber-100', text: 'text-amber-800' };
    case 'silver':
      return { bg: 'bg-slate-100', text: 'text-slate-800' };
    default:
      return { bg: 'bg-slate-100', text: 'text-slate-800' };
  }
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(part => part.charAt(0))
    .join('')
    .toUpperCase()
    .substring(0, 2);
}

export function formatRelativeDate(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isToday(dateObj)) {
    return 'Today';
  }
  
  if (isYesterday(dateObj)) {
    return 'Yesterday';
  }
  
  const daysDiff = differenceInDays(new Date(), dateObj);
  
  if (daysDiff < 7) {
    return `${daysDiff} days ago`;
  }
  
  if (daysDiff < 30) {
    const weeks = Math.floor(daysDiff / 7);
    return `${weeks} ${weeks === 1 ? 'week' : 'weeks'} ago`;
  }
  
  return format(dateObj, 'MMM d, yyyy');
}

export function formatTime(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return format(dateObj, 'h:mm a');
}

export function formatDate(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return format(dateObj, 'EEEE, MMMM d');
}

export function formatDateShort(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return format(dateObj, 'MMM d');
}

export function getSeverityColor(severity: string): { bg: string, text: string, border: string } {
  switch (severity.toLowerCase()) {
    case 'critical':
      return { 
        bg: 'bg-red-50', 
        text: 'text-slate-800', 
        border: 'border-error' 
      };
    case 'warning':
      return { 
        bg: 'bg-white', 
        text: 'text-slate-800', 
        border: 'border-transparent' 
      };
    case 'info':
      return { 
        bg: 'bg-white', 
        text: 'text-slate-800', 
        border: 'border-transparent' 
      };
    default:
      return { 
        bg: 'bg-white', 
        text: 'text-slate-800', 
        border: 'border-transparent' 
      };
  }
}

export function getPercentageChangeColor(change: number): string {
  return change >= 0 ? 'text-success' : 'text-error';
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^\+?\d{10,14}$/;
  return phoneRegex.test(phone);
}

export function formatPhoneNumber(phone: string): string {
  // Basic formatting for Indian phone numbers
  if (phone.startsWith('+91') && phone.length === 13) {
    return `${phone.substring(0, 3)} ${phone.substring(3, 8)} ${phone.substring(8)}`;
  }
  return phone;
}

export function getStageColor(stage: string): { bg: string, text: string } {
  switch (stage.toLowerCase()) {
    case 'new':
    case 'new_leads':
      return { bg: 'bg-primary-100', text: 'text-primary-600' };
    case 'qualified':
      return { bg: 'bg-primary-100', text: 'text-primary-500' };
    case 'proposal':
      return { bg: 'bg-teal-100', text: 'text-teal-600' };
    case 'closed':
    case 'won':
      return { bg: 'bg-green-100', text: 'text-green-800' };
    case 'lost':
      return { bg: 'bg-red-100', text: 'text-red-800' };
    default:
      return { bg: 'bg-slate-100', text: 'text-slate-800' };
  }
}

export function getPriorityColor(priority: string): { bg: string, text: string } {
  switch (priority.toLowerCase()) {
    case 'high':
      return { bg: 'bg-amber-100', text: 'text-amber-800' };
    case 'medium':
      return { bg: 'bg-blue-100', text: 'text-blue-800' };
    case 'low':
      return { bg: 'bg-green-100', text: 'text-green-800' };
    default:
      return { bg: 'bg-slate-100', text: 'text-slate-800' };
  }
}
