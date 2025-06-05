import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  CalendarIcon, 
  ChevronLeftIcon, 
  ChevronRightIcon, 
  Clock, 
  MapPin, 
  Plus,
  User,
  ArrowLeft,
  Phone,
  Mail,
  BarChart4,
  Wallet,
  ArrowUpDown,
  Calendar,
  MessageCircle,
  FileText,
  Target,
  PieChart,
  Receipt,
  FileBarChart,
  Lightbulb
} from 'lucide-react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, parse, isToday, startOfDay } from 'date-fns';

import { ClientPageLayout } from '@/components/layout/ClientPageLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn, getTierColor, getInitials } from '@/lib/utils';
// Import the EmptyState component
import EmptyState from '@/components/empty-state';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

interface Appointment {
  id: number;
  title: string;
  description: string | null;
  startTime: string;
  endTime: string;
  location: string | null;
  clientId: number | null;
  prospectId: number | null;
  assignedTo: number | null;
  priority: string | null;
  type: string;
  createdAt: string | null;
  clientName?: string;
}

interface ClientAppointmentsProps {
  clientId?: string | number | null;
}

const ClientAppointments = ({ clientId: propClientId }: ClientAppointmentsProps = {}) => {
  // Handle different ways clientId can be passed
  const clientId = propClientId === "all" 
    ? null 
    : propClientId 
    ? (typeof propClientId === "string" ? parseInt(propClientId) : propClientId)
    : parseInt(window.location.hash.split('/')[2]);
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [selectedView, setSelectedView] = useState<'list' | 'month' | 'day' | 'week'>('list');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isNewAppointmentDialogOpen, setIsNewAppointmentDialogOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [isAppointmentDetailsOpen, setIsAppointmentDetailsOpen] = useState(false);
  
  // Fetch client data when we have a specific clientId
  const { data: client, isLoading: isClientLoading } = useQuery({
    queryKey: [`/api/clients/${clientId}`],
    enabled: !!clientId && !isNaN(clientId)
  });

  // Fetch appointments (all or client-specific)
  const { data: appointments, isLoading, refetch } = useQuery({
    queryKey: ['/api/appointments', clientId],
    queryFn: async () => {
      console.log('Fetching appointments for clientId:', clientId);
      // If clientId is null, fetch all appointments without filter
      const url = clientId === null ? '/api/appointments' : `/api/appointments?clientId=${clientId}`;
      console.log('API URL:', url);
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch appointments');
      }
      const data = await response.json();
      console.log('Received appointments:', data);
      // Sort appointments by date and time
      return data.sort((a: Appointment, b: Appointment) => {
        const dateA = new Date(a.startTime);
        const dateB = new Date(b.startTime);
        return dateA.getTime() - dateB.getTime();
      });
    }
  });
  
  // Format time (e.g., "9:00 AM")
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, 'h:mm a');
  };
  
  const nextMonth = () => setCalendarDate(addMonths(calendarDate, 1));
  const prevMonth = () => setCalendarDate(subMonths(calendarDate, 1));
  
  const getAppointmentTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'meeting':
        return 'border-blue-500 bg-blue-50 dark:bg-blue-950/30';
      case 'call':
        return 'border-green-500 bg-green-50 dark:bg-green-950/30';
      case 'review':
        return 'border-purple-500 bg-purple-50 dark:bg-purple-950/30';
      case 'onboarding':
        return 'border-amber-500 bg-amber-50 dark:bg-amber-950/30';
      default:
        return 'border-slate-500 bg-muted';
    }
  };
  
  const getPriorityColor = (priority: string | null) => {
    switch (priority?.toLowerCase()) {
      case 'high':
        return { 
          bg: 'bg-red-100 dark:bg-red-950/30', 
          text: 'text-red-800 dark:text-red-200', 
          border: 'border-red-200 dark:border-red-800'
        };
      case 'medium':
        return { 
          bg: 'bg-amber-100 dark:bg-amber-950/30', 
          text: 'text-amber-800 dark:text-amber-200', 
          border: 'border-amber-200 dark:border-amber-800'
        };
      default:
        return { 
          bg: 'bg-muted', 
          text: 'text-foreground', 
          border: 'border-border'
        };
    }
  };
  
  // Get appointments for a specific date
  const getAppointmentsForDate = (date: Date) => {
    if (!appointments) return [];
    
    return appointments.filter((appointment: Appointment) => {
      const appointmentDate = new Date(appointment.startTime);
      return isSameDay(appointmentDate, date);
    }).sort((a: Appointment, b: Appointment) => {
      return new Date(a.startTime).getTime() - new Date(b.startTime).getTime();
    });
  };
  
  // Group appointments by hour for day view
  const getAppointmentsByHour = (date: Date) => {
    const dayAppointments = getAppointmentsForDate(date);
    const hours: Record<string, Appointment[]> = {};
    
    // Initialize hours from 9 AM to 5 PM
    for (let i = 9; i <= 17; i++) {
      const hourKey = i < 12 ? `${i} AM` : i === 12 ? `${i} PM` : `${i-12} PM`;
      hours[hourKey] = [];
    }
    
    // Group appointments by hour
    dayAppointments.forEach((appointment: Appointment) => {
      const date = new Date(appointment.startTime);
      const hour = date.getHours();
      const hourKey = hour < 12 ? `${hour} AM` : hour === 12 ? `${hour} PM` : `${hour-12} PM`;
      
      if (hours[hourKey]) {
        hours[hourKey].push(appointment);
      } else {
        hours[hourKey] = [appointment];
      }
    });
    
    return hours;
  };
  
  // Calendar rendering
  const renderCalendar = () => {
    const monthStart = startOfMonth(calendarDate);
    const monthEnd = endOfMonth(calendarDate);
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
    
    // Calculate calendar grid
    const dayOfWeek = monthStart.getDay();
    const emptyDaysBefore = Array(dayOfWeek).fill(null);
    
    return (
      <div className="rounded-lg overflow-hidden">
        <div className="bg-card p-4 flex items-center justify-between">
          <h2 className="font-semibold text-lg">
            {format(calendarDate, 'MMMM yyyy')}
          </h2>
          <div className="flex space-x-2">
            <Button variant="outline" size="icon" onClick={prevMonth}>
              <ChevronLeftIcon className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={nextMonth}>
              <ChevronRightIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-7 bg-muted">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day} className="text-center text-sm font-medium py-2">
              {day}
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-7 bg-card">
          {emptyDaysBefore.map((_, i) => (
            <div key={`empty-${i}`} className="min-h-[100px] border-b border-r border-border" />
          ))}
          
          {days.map((day) => {
            const dayAppointments = getAppointmentsForDate(day);
            const isCurrentMonth = isSameMonth(day, calendarDate);
            const isSelected = selectedDate ? isSameDay(day, selectedDate) : false;
            
            return (
              <div 
                key={day.toString()}
                className={cn(
                  "min-h-[100px] p-1 border-b border-r border-border relative",
                  !isCurrentMonth && "bg-muted/50",
                  isToday(day) && "bg-blue-50 dark:bg-blue-950/30",
                  isSelected && "ring-2 ring-primary ring-inset"
                )}
                onClick={() => {
                  setSelectedDate(day);
                  setSelectedView('day');
                }}
              >
                <div className="text-right mb-1">
                  <span
                    className={cn(
                      "inline-block rounded-full w-7 h-7 text-center leading-7 text-sm",
                      isToday(day) && "bg-primary text-white",
                      !isToday(day) && isCurrentMonth && "text-foreground",
                      !isCurrentMonth && "text-muted-foreground"
                    )}
                  >
                    {format(day, 'd')}
                  </span>
                </div>
                
                <div className="overflow-y-auto max-h-[70px]">
                  {dayAppointments.slice(0, 3).map((appointment: Appointment) => (
                    <div
                      key={appointment.id}
                      className={`px-1 py-0.5 mb-1 text-xs rounded truncate border-l-2 ${getAppointmentTypeColor(appointment.type)}`}
                    >
                      {formatTime(appointment.startTime)} {appointment.title}
                    </div>
                  ))}
                  
                  {dayAppointments.length > 3 && (
                    <div className="text-xs text-muted-foreground text-center">
                      + {dayAppointments.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };
  
  // Day view rendering
  const renderDayView = () => {
    const currentDate = selectedDate || new Date();
    const dayName = format(currentDate, 'EEEE');
    const formattedDate = format(currentDate, 'MMMM d, yyyy');
    const eventsByHour = getAppointmentsByHour(currentDate);
    
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">{dayName}</h2>
            <p className="text-muted-foreground">{formattedDate}</p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setSelectedDate(new Date(currentDate.setDate(currentDate.getDate() - 1)))}
            >
              <ChevronLeftIcon className="h-4 w-4 mr-1" />
              Previous Day
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setSelectedDate(new Date(currentDate.setDate(currentDate.getDate() + 1)))}
            >
              Next Day
              <ChevronRightIcon className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
        
        <div className="bg-card rounded-lg shadow overflow-hidden">
          {isLoading ? (
            <div className="p-4">
              <Skeleton className="h-12 w-full mb-3" />
              <Skeleton className="h-12 w-full mb-3" />
              <Skeleton className="h-12 w-full mb-3" />
            </div>
          ) : (
            <div className="divide-y divide-border">
              {Object.entries(eventsByHour).map(([time, timeAppointments]) => (
                <div key={time} className="flex">
                  <div className="w-20 py-3 px-4 text-right text-sm text-muted-foreground border-r border-border bg-muted/50">
                    {time}
                  </div>
                  <div className="flex-1 p-2 min-h-[60px]">
                    {timeAppointments.map(appointment => (
                      <div 
                        key={appointment.id} 
                        className={`p-2 mb-1 text-sm rounded border-l-4 ${getAppointmentTypeColor(appointment.type)} cursor-pointer hover:bg-muted/50 transition-colors`}
                        onClick={() => {
                          setSelectedAppointment(appointment);
                          setIsAppointmentDetailsOpen(true);
                        }}
                      >
                        <div className="font-medium">{appointment.title}</div>
                        {appointment.clientName && (
                          <div className="text-xs text-blue-600 dark:text-blue-400 font-medium">{appointment.clientName}</div>
                        )}
                        <div className="text-xs mt-1 flex justify-between">
                          <span>{formatTime(appointment.startTime)} - {formatTime(appointment.endTime)}</span>
                          <span>{appointment.location}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };
  
  // List view rendering
  const renderListView = () => {
    if (isLoading) {
      return (
        <Card>
          <CardContent className="p-4">
            <Skeleton className="h-12 w-full mb-3" />
            <Skeleton className="h-12 w-full mb-3" />
            <Skeleton className="h-12 w-full mb-3" />
          </CardContent>
        </Card>
      );
    }
    
    if (!appointments?.length) {
      return (
        <EmptyState
          title="No appointments"
          description="There are no appointments scheduled with this client."
          icon={<CalendarIcon className="h-12 w-12 text-slate-300" />}
          action={
            <Button 
              size="icon" 
              className="rounded-full"
              onClick={() => setIsNewAppointmentDialogOpen(true)}
            >
              <Plus className="h-4 w-4" />
            </Button>
          }
        />
      );
    }
    
    // Filter to show only today's and upcoming appointments
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const filteredAppointments = appointments.filter((appointment: Appointment) => {
      const appointmentDate = new Date(appointment.startTime);
      return appointmentDate >= today;
    });
    
    // Sort appointments by date (earliest first for upcoming view)
    const sortedAppointments = [...filteredAppointments].sort((a: Appointment, b: Appointment) => {
      return new Date(a.startTime).getTime() - new Date(b.startTime).getTime();
    });
    
    // Group appointments by date
    const appointmentsByDate: Record<string, Appointment[]> = {};
    
    sortedAppointments.forEach((appointment: Appointment) => {
      const date = format(new Date(appointment.startTime), 'yyyy-MM-dd');
      if (!appointmentsByDate[date]) {
        appointmentsByDate[date] = [];
      }
      appointmentsByDate[date].push(appointment);
    });
    
    return (
      <div className="space-y-6">
        {Object.entries(appointmentsByDate).map(([date, dateAppointments]) => (
          <div key={date}>
            <h3 className="text-sm font-medium text-muted-foreground mb-2">
              {isToday(new Date(date)) ? 'Today' : format(new Date(date), 'EEEE, MMMM d, yyyy')}
            </h3>
            <div className="space-y-3">
              {dateAppointments.map((appointment) => {
                const priorityColors = getPriorityColor(appointment.priority);
                
                return (
                  <Card 
                    key={appointment.id} 
                    className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow bg-card dark:bg-card border-border shadow-sm"
                    onClick={() => {
                      setSelectedAppointment(appointment);
                      setIsAppointmentDetailsOpen(true);
                    }}>
                    <CardHeader className={cn(
                      "py-3 border-l-4",
                      getAppointmentTypeColor(appointment.type)
                    )}>
                      <div className="flex justify-between">
                        <CardTitle className="text-base text-card-foreground">{appointment.title}</CardTitle>
                        <Badge variant="outline" className={cn(
                          priorityColors.bg,
                          priorityColors.text,
                          "border",
                          priorityColors.border
                        )}>
                          {appointment.priority || 'Normal'} Priority
                        </Badge>
                      </div>
                      {appointment.clientName && (
                        <div className="text-sm text-blue-600 dark:text-blue-400 font-medium mb-1">
                          Client: {appointment.clientName}
                        </div>
                      )}
                      <CardDescription className="text-card-foreground/70">
                        {appointment.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pb-0 pt-0">
                      <div className="bg-muted/50 dark:bg-muted/30 px-3 py-2 -mx-6 -mb-4 mt-3 flex flex-col space-y-1 sm:flex-row sm:space-y-0 sm:space-x-4 text-sm border-t border-border">
                        <div className="flex items-center text-sm text-foreground/80">
                          <Clock className="h-4 w-4 mr-1 text-primary" />
                          {formatTime(appointment.startTime)} - {formatTime(appointment.endTime)}
                        </div>
                        {appointment.location && (
                          <div className="flex items-center text-sm text-foreground/80">
                            <MapPin className="h-4 w-4 mr-1 text-primary" />
                            {appointment.location}
                          </div>
                        )}
                        {appointment.assignedTo && (
                          <div className="flex items-center text-sm text-foreground/80">
                            <User className="h-4 w-4 mr-1 text-primary" />
                            RM: {appointment.assignedTo}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    );
  };
  
  // New Appointment Form
  const NewAppointmentDialog = () => {
    // Fetch clients for dropdown
    const { data: clients = [] } = useQuery({
      queryKey: ['/api/clients'],
    });
    
    const [formData, setFormData] = useState({
      title: '',
      description: '',
      clientId: clientId ? clientId.toString() : '',
      startDate: format(new Date(), 'yyyy-MM-dd'),
      startTime: '09:00',
      endTime: '10:00',
      location: '',
      priority: 'medium',
      type: 'meeting'
    });
    
    const handleChange = (field: string, value: string) => {
      setFormData(prev => ({ ...prev, [field]: value }));
    };
    
    const handleSubmit = async () => {
      // Convert form data to appointment object
      const startDateTime = parse(
        `${formData.startDate} ${formData.startTime}`,
        'yyyy-MM-dd HH:mm',
        new Date()
      );
      
      const endDateTime = parse(
        `${formData.startDate} ${formData.endTime}`,
        'yyyy-MM-dd HH:mm',
        new Date()
      );
      
      // Validate required fields before submission
      if (!formData.title.trim()) {
        console.error('Title is required');
        return;
      }
      
      if (!formData.clientId && clientId === null) {
        console.error('Client selection is required');
        return;
      }
      
      const clientIdNumber = parseInt(formData.clientId);
      if (isNaN(clientIdNumber)) {
        console.error('Invalid client ID');
        return;
      }
      
      const appointmentData = {
        title: formData.title.trim(),
        description: formData.description || null,
        startTime: startDateTime.toISOString(),
        endTime: endDateTime.toISOString(),
        location: formData.location || null,
        clientId: clientIdNumber,
        priority: formData.priority,
        type: formData.type
      };
      
      console.log('Sending appointment data:', appointmentData);
      
      try {
        const response = await fetch('/api/appointments', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(appointmentData)
        });
        
        if (response.ok) {
          setIsNewAppointmentDialogOpen(false);
          refetch();
          // Reset form
          setFormData({
            title: '',
            description: '',
            clientId: clientId ? clientId.toString() : '',
            startDate: format(new Date(), 'yyyy-MM-dd'),
            startTime: '09:00',
            endTime: '10:00',
            location: '',
            priority: 'medium',
            type: 'meeting'
          });
        } else {
          const errorData = await response.json();
          console.error('Failed to create appointment:', errorData);
          alert('Failed to create appointment: ' + (errorData.message || 'Unknown error'));
        }
      } catch (error) {
        console.error('Error creating appointment:', error);
      }
    };
    
    return (
      <Dialog open={isNewAppointmentDialogOpen} onOpenChange={setIsNewAppointmentDialogOpen}>
        <DialogContent className="sm:max-w-[500px] max-h-[95vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>Schedule New Appointment</DialogTitle>
            <DialogDescription>
              Create a new appointment with this client. Fill in the details below.
            </DialogDescription>
          </DialogHeader>
          
          <div className="overflow-y-auto max-h-[calc(95vh-200px)] pr-2">
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
              <Input 
                id="title" 
                value={formData.title} 
                onChange={(e) => handleChange('title', e.target.value)}
                placeholder="Appointment title"
              />
            </div>
            
            {/* Client selection dropdown - always shown */}
            <div className="space-y-2">
              <Label htmlFor="clientId">Client</Label>
              <Select 
                value={formData.clientId} 
                onValueChange={(value) => handleChange('clientId', value)}
              >
                <SelectTrigger id="clientId">
                  <SelectValue placeholder="Select client" />
                </SelectTrigger>
                <SelectContent>
                  {(clients as any[]).map((client: any) => (
                    <SelectItem key={client.id} value={client.id.toString()}>
                      {client.fullName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea 
                id="description" 
                value={formData.description} 
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Enter appointment details"
              />
            </div>
            
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="startDate">Date</Label>
                <Input 
                  id="startDate" 
                  type="date" 
                  value={formData.startDate}
                  onChange={(e) => handleChange('startDate', e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="startTime">Start Time</Label>
                <Input 
                  id="startTime" 
                  type="time" 
                  value={formData.startTime}
                  onChange={(e) => handleChange('startTime', e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="endTime">End Time</Label>
                <Input 
                  id="endTime" 
                  type="time" 
                  value={formData.endTime}
                  onChange={(e) => handleChange('endTime', e.target.value)}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input 
                  id="location" 
                  value={formData.location}
                  onChange={(e) => handleChange('location', e.target.value)}
                  placeholder="Meeting location"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="type">Type</Label>
                <Select 
                  value={formData.type} 
                  onValueChange={(value) => handleChange('type', value)}
                >
                  <SelectTrigger id="type">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="meeting">Meeting</SelectItem>
                    <SelectItem value="call">Call</SelectItem>
                    <SelectItem value="review">Review</SelectItem>
                    <SelectItem value="onboarding">Onboarding</SelectItem>
                    <SelectItem value="followup">Follow-up</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select 
                  value={formData.priority} 
                  onValueChange={(value) => handleChange('priority', value)}
                >
                  <SelectTrigger id="priority">
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsNewAppointmentDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>Save Appointment</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  };
  
  if (clientId !== null && isNaN(clientId as number)) {
    return (
      <div className="p-4">
        <p>Invalid client ID</p>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
      {/* Enhanced Customer Information Band */}
      <div className={`bg-card shadow-sm border-l-4 ${client ? getTierColor((client as any)?.tier) : 'border-border'} animate-in slide-in-from-top-4 duration-500`}>
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => window.location.hash = '/clients'}
                className="p-2 hover:bg-muted rounded-lg transition-all duration-200 hover:scale-105 focus-visible:ring-2 focus-visible:ring-primary/50"
              >
                <ArrowLeft className="h-5 w-5 text-foreground" />
              </button>
              
              <div className="flex items-center gap-3">
                {/* Client Details - No Avatar */}
                {isClientLoading ? (
                  <div className="space-y-1">
                    <Skeleton className="h-6 w-32" />
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                ) : client ? (
                  <div className="flex flex-col">
                    {/* Line 1: Client Name */}
                    <button 
                      onClick={() => window.location.hash = `/clients/${clientId}/personal`}
                      className="text-xl font-semibold text-foreground hover:text-blue-600 transition-colors cursor-pointer text-left"
                    >
                      {(client as any)?.fullName}
                    </button>
                    
                    {/* Line 2: Phone Number */}
                    {(client as any)?.phone && (
                      <div className="mt-1 flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <a 
                          href={`tel:${(client as any)?.phone}`}
                          className="text-sm text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                          title="Call client"
                        >
                          {(client as any)?.phone}
                        </a>
                      </div>
                    )}
                    
                    {/* Line 3: Email */}
                    {(client as any)?.email && (
                      <div className="mt-1 flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <a 
                          href={`mailto:${(client as any)?.email}`}
                          className="text-sm text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                          title="Send email to client"
                        >
                          {(client as any)?.email}
                        </a>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-gray-500">Client not found</div>
                )}
              </div>
            </div>
            

          </div>
        </div>
      </div>

      {/* Enhanced Page Title Band with Navigation */}
      <div className="bg-card border-b border-border px-1 py-4 animate-in slide-in-from-top-6 duration-700">
        <div className="flex justify-between items-center px-5 mb-3">
          <h2 className="text-2xl font-bold text-foreground tracking-tight">Appointments</h2>
          <Button 
            size="icon" 
            className="rounded-full hover:scale-105 transition-all duration-200 focus-visible:ring-2 focus-visible:ring-primary/50"
            onClick={() => setIsNewAppointmentDialogOpen(true)}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Enhanced Navigation Icons */}
        <div className="grid grid-cols-7 gap-1 px-1">
          <button 
            className="flex items-center justify-center px-1 py-2 rounded-lg hover:bg-muted transition-all duration-200 hover:scale-105 focus-visible:ring-2 focus-visible:ring-primary/50 h-12 w-full"
            onClick={() => window.location.hash = `/clients/${clientId}/personal`}
            title="Personal Profile"
          >
            <User className="h-6 w-6 text-muted-foreground" />
          </button>
          
          <button 
            className="flex items-center justify-center px-1 py-2 rounded-lg hover:bg-muted transition-colors h-12 w-full"
            onClick={() => window.location.hash = `/clients/${clientId}/portfolio`}
            title="Portfolio"
          >
            <PieChart className="h-6 w-6 text-gray-600" />
          </button>
          
          <button 
            className="flex items-center justify-center px-1 py-2 rounded-lg hover:bg-gray-100 transition-colors h-12 w-full"
            onClick={() => window.location.hash = `/clients/${clientId}/transactions`}
            title="Transactions"
          >
            <Receipt className="h-6 w-6 text-gray-600" />
          </button>
          
          <button 
            className="flex items-center justify-center px-1 py-2 rounded-lg bg-blue-50 border border-blue-200 h-12 w-full"
            title="Appointments"
          >
            <Calendar className="h-6 w-6 text-blue-600" />
          </button>
          
          <button 
            className="flex items-center justify-center px-1 py-2 rounded-lg hover:bg-gray-100 transition-colors h-12 w-full"
            onClick={() => window.location.hash = `/clients/${clientId}/communications`}
            title="Notes"
          >
            <FileText className="h-6 w-6 text-gray-600" />
          </button>
          
          <button 
            className="flex items-center justify-center px-1 py-2 rounded-lg hover:bg-gray-100 transition-colors h-12 w-full"
            onClick={() => window.location.hash = `/clients/${clientId}/portfolio-report`}
            title="Portfolio Report"
          >
            <FileBarChart className="h-6 w-6 text-gray-600" />
          </button>
          
          <button 
            className="flex items-center justify-center px-1 py-2 rounded-lg hover:bg-gray-100 transition-colors h-12 w-full"
            onClick={() => window.location.hash = `/clients/${clientId}/insights`}
            title="Investment Ideas"
          >
            <Lightbulb className="h-6 w-6 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4 space-y-4">
        <div className="space-y-4">
        
        <Tabs defaultValue="list" value={selectedView} onValueChange={(v) => setSelectedView(v as any)}>
          <TabsList>
            <TabsTrigger value="list">List View</TabsTrigger>
            <TabsTrigger value="month">Month View</TabsTrigger>
            <TabsTrigger value="day">Day View</TabsTrigger>
          </TabsList>
          
          <TabsContent value="list" className="mt-4">
            <ScrollArea className="h-[600px]">
              {renderListView()}
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="month" className="mt-4">
            {renderCalendar()}
          </TabsContent>
          
          <TabsContent value="day" className="mt-4">
            {renderDayView()}
          </TabsContent>
        </Tabs>
        
        {/* New Appointment Dialog */}
        <NewAppointmentDialog />
        
        {/* Appointment Details Dialog */}
        <Dialog open={isAppointmentDetailsOpen} onOpenChange={setIsAppointmentDetailsOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-xl">{selectedAppointment?.title}</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4 py-3">
              {selectedAppointment?.description && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Description</p>
                  <p className="text-foreground dark:text-slate-100">{selectedAppointment.description}</p>
                </div>
              )}
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Start Time</p>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                    <p className="text-foreground dark:text-slate-100">
                      {selectedAppointment && format(new Date(selectedAppointment.startTime), 'MMMM d, yyyy h:mm a')}
                    </p>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">End Time</p>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                    <p className="text-foreground dark:text-slate-100">
                      {selectedAppointment && format(new Date(selectedAppointment.endTime), 'MMMM d, yyyy h:mm a')}
                    </p>
                  </div>
                </div>
              </div>
              
              {selectedAppointment?.location && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Location</p>
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                    <p className="text-foreground dark:text-slate-100">{selectedAppointment.location}</p>
                  </div>
                </div>
              )}
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Type</p>
                  <Badge className={cn(
                    "mt-1",
                    getAppointmentTypeColor(selectedAppointment?.type || "meeting")
                  )}>
                    {selectedAppointment?.type || "Meeting"}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Priority</p>
                  <Badge variant="outline" className={cn(
                    "mt-1",
                    selectedAppointment && getPriorityColor(selectedAppointment.priority).bg,
                    selectedAppointment && getPriorityColor(selectedAppointment.priority).text,
                    "border",
                    selectedAppointment && getPriorityColor(selectedAppointment.priority).border
                  )}>
                    {selectedAppointment?.priority || "Normal"} Priority
                  </Badge>
                </div>
              </div>
            </div>
            
            <DialogFooter className="sm:justify-end">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setIsAppointmentDetailsOpen(false)}
              >
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        </div>
      </div>
    </div>
  );
};

export default ClientAppointments;