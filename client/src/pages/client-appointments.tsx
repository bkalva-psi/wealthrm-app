import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  CalendarIcon, 
  ChevronLeftIcon, 
  ChevronRightIcon, 
  Clock, 
  MapPin, 
  PlusCircle,
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
  Target
} from 'lucide-react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, parse, isToday } from 'date-fns';

import ClientPageLayout from '@/components/layouts/ClientPageLayout';
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
  const [selectedView, setSelectedView] = useState<'month' | 'day' | 'week'>('month');
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
      return data;
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
        return 'border-blue-500 bg-blue-50';
      case 'call':
        return 'border-green-500 bg-green-50';
      case 'review':
        return 'border-purple-500 bg-purple-50';
      case 'onboarding':
        return 'border-amber-500 bg-amber-50';
      default:
        return 'border-slate-500 bg-slate-50';
    }
  };
  
  const getPriorityColor = (priority: string | null) => {
    switch (priority?.toLowerCase()) {
      case 'high':
        return { 
          bg: 'bg-red-100', 
          text: 'text-red-800', 
          border: 'border-red-200'
        };
      case 'medium':
        return { 
          bg: 'bg-amber-100', 
          text: 'text-amber-800', 
          border: 'border-amber-200'
        };
      default:
        return { 
          bg: 'bg-slate-100', 
          text: 'text-slate-800', 
          border: 'border-slate-200'
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
    dayAppointments.forEach(appointment => {
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
        <div className="bg-white p-4 flex items-center justify-between">
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
        
        <div className="grid grid-cols-7 bg-slate-100">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day} className="text-center text-sm font-medium py-2">
              {day}
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-7 bg-white">
          {emptyDaysBefore.map((_, i) => (
            <div key={`empty-${i}`} className="min-h-[100px] border-b border-r border-slate-200" />
          ))}
          
          {days.map((day) => {
            const dayAppointments = getAppointmentsForDate(day);
            const isCurrentMonth = isSameMonth(day, calendarDate);
            const isSelected = selectedDate ? isSameDay(day, selectedDate) : false;
            
            return (
              <div 
                key={day.toString()}
                className={cn(
                  "min-h-[100px] p-1 border-b border-r border-slate-200 relative",
                  !isCurrentMonth && "bg-slate-50",
                  isToday(day) && "bg-blue-50",
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
                      !isToday(day) && isCurrentMonth && "text-slate-900",
                      !isCurrentMonth && "text-slate-400"
                    )}
                  >
                    {format(day, 'd')}
                  </span>
                </div>
                
                <div className="overflow-y-auto max-h-[70px]">
                  {dayAppointments.slice(0, 3).map((appointment) => (
                    <div
                      key={appointment.id}
                      className={`px-1 py-0.5 mb-1 text-xs rounded truncate border-l-2 ${getAppointmentTypeColor(appointment.type)}`}
                    >
                      {formatTime(appointment.startTime)} {appointment.title}
                    </div>
                  ))}
                  
                  {dayAppointments.length > 3 && (
                    <div className="text-xs text-slate-500 text-center">
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
            <p className="text-slate-500">{formattedDate}</p>
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
        
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {isLoading ? (
            <div className="p-4">
              <Skeleton className="h-12 w-full mb-3" />
              <Skeleton className="h-12 w-full mb-3" />
              <Skeleton className="h-12 w-full mb-3" />
            </div>
          ) : (
            <div className="divide-y divide-slate-200">
              {Object.entries(eventsByHour).map(([time, timeAppointments]) => (
                <div key={time} className="flex">
                  <div className="w-20 py-3 px-4 text-right text-sm text-slate-500 border-r border-slate-200 bg-slate-50">
                    {time}
                  </div>
                  <div className="flex-1 p-2 min-h-[60px]">
                    {timeAppointments.map(appointment => (
                      <div 
                        key={appointment.id} 
                        className={`p-2 mb-1 text-sm rounded border-l-4 ${getAppointmentTypeColor(appointment.type)} cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors`}
                        onClick={() => {
                          setSelectedAppointment(appointment);
                          setIsAppointmentDetailsOpen(true);
                        }}
                      >
                        <div className="font-medium">{appointment.title}</div>
                        {appointment.clientName && (
                          <div className="text-xs text-blue-600 font-medium">{appointment.clientName}</div>
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
            <Button onClick={() => setIsNewAppointmentDialogOpen(true)}>
              <PlusCircle className="h-4 w-4 mr-2" />
              Schedule Appointment
            </Button>
          }
        />
      );
    }
    
    // Sort appointments by date (most recent first)
    const sortedAppointments = [...appointments].sort((a: Appointment, b: Appointment) => {
      return new Date(b.startTime).getTime() - new Date(a.startTime).getTime();
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
            <h3 className="text-sm font-medium text-slate-500 mb-2">
              {isToday(new Date(date)) ? 'Today' : format(new Date(date), 'EEEE, MMMM d, yyyy')}
            </h3>
            <div className="space-y-3">
              {dateAppointments.map((appointment) => {
                const priorityColors = getPriorityColor(appointment.priority);
                
                return (
                  <Card 
                    key={appointment.id} 
                    className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => {
                      setSelectedAppointment(appointment);
                      setIsAppointmentDetailsOpen(true);
                    }}>
                    <CardHeader className={cn(
                      "py-3 border-l-4",
                      getAppointmentTypeColor(appointment.type)
                    )}>
                      <div className="flex justify-between">
                        <CardTitle className="text-base">{appointment.title}</CardTitle>
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
                        <div className="text-sm text-blue-600 font-medium mb-1">
                          Client: {appointment.clientName}
                        </div>
                      )}
                      <CardDescription>
                        {appointment.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pb-3 pt-0">
                      <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-4 text-sm">
                        <div className="flex items-center text-slate-600">
                          <Clock className="h-4 w-4 mr-1" />
                          {formatTime(appointment.startTime)} - {formatTime(appointment.endTime)}
                        </div>
                        {appointment.location && (
                          <div className="flex items-center text-slate-600">
                            <MapPin className="h-4 w-4 mr-1" />
                            {appointment.location}
                          </div>
                        )}
                        {appointment.assignedTo && (
                          <div className="flex items-center text-slate-600">
                            <User className="h-4 w-4 mr-1" />
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
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Schedule New Appointment</DialogTitle>
            <DialogDescription>
              Create a new appointment with this client. Fill in the details below.
            </DialogDescription>
          </DialogHeader>
          
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
            
            {/* Only show client selection when viewing all appointments (calendar view) */}
            {clientId === null && (
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
            )}
            
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
  
  if (isNaN(clientId)) {
    return (
      <div className="p-4">
        <p>Invalid client ID</p>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Harmonized Header Band */}
      <div className={`bg-white shadow-sm border-l-4 ${client ? getTierColor(client.tier) : 'border-slate-300'}`}>
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => window.location.hash = '/clients'}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="h-5 w-5 text-gray-600" />
              </button>
              
              <div className="flex items-center gap-3">
                {/* Client Avatar */}
                {isClientLoading ? (
                  <Skeleton className="h-10 w-10 rounded-full" />
                ) : client ? (
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-blue-100 text-blue-700 font-medium">
                      {getInitials(client.fullName)}
                    </AvatarFallback>
                  </Avatar>
                ) : null}
                
                {/* Client Details */}
                {isClientLoading ? (
                  <div className="space-y-1">
                    <Skeleton className="h-6 w-32" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                ) : client ? (
                  <div className="flex flex-col">
                    <button 
                      onClick={() => window.location.hash = `/clients/${clientId}/personal`}
                      className="text-xl font-semibold text-slate-900 hover:text-blue-600 transition-colors cursor-pointer text-left"
                    >
                      {client.fullName}
                    </button>
                    <div className="flex items-center gap-4 text-sm text-slate-600 mt-1">
                      {client.phone && (
                        <div className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          <span>{client.phone}</span>
                        </div>
                      )}
                      {client.email && (
                        <div className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          <span>{client.email}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-gray-500">Client not found</div>
                )}
              </div>
            </div>
            
            {/* Navigation Icons */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => window.location.hash = `/clients/${clientId}/personal`}
                className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                title="Personal"
              >
                <User className="h-5 w-5" />
              </button>
              <button
                onClick={() => window.location.hash = `/clients/${clientId}/portfolio`}
                className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                title="Portfolio"
              >
                <BarChart4 className="h-5 w-5" />
              </button>
              <button
                onClick={() => window.location.hash = `/clients/${clientId}/transactions`}
                className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                title="Transactions"
              >
                <ArrowUpDown className="h-5 w-5" />
              </button>
              <button
                onClick={() => window.location.hash = `/clients/${clientId}/appointments`}
                className="p-2 text-blue-600 bg-blue-50 rounded-lg transition-colors"
                title="Calendar"
              >
                <Calendar className="h-5 w-5" />
              </button>
              <button
                onClick={() => window.location.hash = `/clients/${clientId}/communications`}
                className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                title="Communications"
              >
                <MessageCircle className="h-5 w-5" />
              </button>
              <button
                onClick={() => window.location.hash = `/clients/${clientId}/reports`}
                className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                title="Reports"
              >
                <FileText className="h-5 w-5" />
              </button>
              <button
                onClick={() => window.location.hash = `/clients/${clientId}/recommendations`}
                className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                title="Recommendations"
              >
                <Target className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">Client Appointments</h2>
              <p className="text-slate-500">
                View and manage appointment schedule for this client
              </p>
            </div>
            
            <Button onClick={() => setIsNewAppointmentDialogOpen(true)}>
              <PlusCircle className="h-4 w-4 mr-2" />
              New Appointment
            </Button>
          </div>
        
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
                  <p className="text-sm font-medium text-slate-500 mb-1">Description</p>
                  <p className="text-slate-900 dark:text-slate-100">{selectedAppointment.description}</p>
                </div>
              )}
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-slate-500 mb-1">Start Time</p>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-2 text-slate-400" />
                    <p className="text-slate-900 dark:text-slate-100">
                      {selectedAppointment && format(new Date(selectedAppointment.startTime), 'MMMM d, yyyy h:mm a')}
                    </p>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500 mb-1">End Time</p>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-2 text-slate-400" />
                    <p className="text-slate-900 dark:text-slate-100">
                      {selectedAppointment && format(new Date(selectedAppointment.endTime), 'MMMM d, yyyy h:mm a')}
                    </p>
                  </div>
                </div>
              </div>
              
              {selectedAppointment?.location && (
                <div>
                  <p className="text-sm font-medium text-slate-500 mb-1">Location</p>
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-2 text-slate-400" />
                    <p className="text-slate-900 dark:text-slate-100">{selectedAppointment.location}</p>
                  </div>
                </div>
              )}
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-slate-500 mb-1">Type</p>
                  <Badge className={cn(
                    "mt-1",
                    getAppointmentTypeColor(selectedAppointment?.type || "meeting")
                  )}>
                    {selectedAppointment?.type || "Meeting"}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500 mb-1">Priority</p>
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