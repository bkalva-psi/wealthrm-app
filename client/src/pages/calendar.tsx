import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  CalendarIcon, 
  ChevronLeftIcon, 
  ChevronRightIcon, 
  Clock, 
  MapPin, 
  Plus,
  User,
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
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, parse, isToday } from 'date-fns';

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
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
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

export default function CalendarPage() {
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [selectedView, setSelectedView] = useState<'list' | 'month' | 'day' | 'week'>('list');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isNewAppointmentDialogOpen, setIsNewAppointmentDialogOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [isAppointmentDetailsOpen, setIsAppointmentDetailsOpen] = useState(false);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch all appointments (no client filter)
  const { data: appointments, isLoading, refetch } = useQuery({
    queryKey: ['/api/appointments'],
    queryFn: async () => {
      console.log('Appointments API called with query: {}');
      const response = await fetch('/api/appointments');
      if (!response.ok) {
        throw new Error('Failed to fetch appointments');
      }
      const data = await response.json();
      return data;
    }
  });

  // Fetch clients for the dropdown
  const { data: clients, isLoading: isClientsLoading } = useQuery({
    queryKey: ['/api/clients']
  });

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startDate: '',
    startTime: '',
    endTime: '',
    location: '',
    clientId: '',
    priority: 'medium',
    type: 'meeting'
  });

  const handleStartTimeChange = (newStartTime: string) => {
    setFormData(prev => {
      const updatedData = { ...prev, startTime: newStartTime };
      
      // Auto-set end time to one hour after start time
      if (newStartTime) {
        const [hours, minutes] = newStartTime.split(':');
        const startHour = parseInt(hours);
        const endHour = startHour + 1;
        const endTime = `${endHour.toString().padStart(2, '0')}:${minutes}`;
        updatedData.endTime = endTime;
      }
      
      return updatedData;
    });
  };

  const createAppointmentMutation = useMutation({
    mutationFn: async (appointmentData: any) => {
      console.log('Received appointment data:', appointmentData);
      return apiRequest('/api/appointments', 'POST', appointmentData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/appointments'] });
      setIsNewAppointmentDialogOpen(false);
      setFormData({
        title: '',
        description: '',
        startDate: '',
        startTime: '',
        endTime: '',
        location: '',
        clientId: '',
        priority: 'medium',
        type: 'meeting'
      });
      toast({
        title: "Success",
        description: "Appointment created successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create appointment",
        variant: "destructive",
      });
    }
  });

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    
    if (!formData.title || !formData.startDate || !formData.startTime || !formData.endTime) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const startDateTime = new Date(`${formData.startDate}T${formData.startTime}`);
    const endDateTime = new Date(`${formData.startDate}T${formData.endTime}`);

    if (endDateTime <= startDateTime) {
      toast({
        title: "Error",
        description: "End time must be after start time",
        variant: "destructive",
      });
      return;
    }

    const appointmentData = {
      title: formData.title,
      description: formData.description,
      startTime: startDateTime.toISOString(),
      endTime: endDateTime.toISOString(),
      location: formData.location,
      clientId: formData.clientId ? parseInt(formData.clientId) : null,
      priority: formData.priority,
      type: formData.type,
    };

    createAppointmentMutation.mutate(appointmentData);
  };

  const isFormValid = formData.title && formData.startDate && formData.startTime && formData.endTime;

  const openCreateDialog = (selectedDate?: Date) => {
    const dateToUse = selectedDate || new Date();
    setFormData(prev => ({
      ...prev,
      startDate: format(dateToUse, 'yyyy-MM-dd'),
    }));
    setIsNewAppointmentDialogOpen(true);
  };

  const getAppointmentsForDate = (date: Date) => {
    if (!appointments) return [];
    
    return appointments.filter((appointment: any) => {
      const appointmentDate = new Date(appointment.startTime);
      return isSameDay(appointmentDate, date);
    });
  };

  const getPriorityColor = (priority: string | null) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'meeting':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'call':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'review':
        return 'bg-indigo-100 text-indigo-800 border-indigo-300';
      case 'follow-up':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const formatTime = (dateString: string) => {
    return format(new Date(dateString), 'h:mm a');
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMM d, yyyy');
  };

  const renderMonthView = () => {
    const monthStart = startOfMonth(calendarDate);
    const monthEnd = endOfMonth(calendarDate);
    const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

    // Create a grid that includes some days from previous/next month for complete weeks
    const startDate = monthStart;
    const endDate = monthEnd;

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">{format(calendarDate, 'MMMM yyyy')}</h3>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCalendarDate(subMonths(calendarDate, 1))}
            >
              <ChevronLeftIcon className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCalendarDate(addMonths(calendarDate, 1))}
            >
              <ChevronRightIcon className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={openCreateDialog}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day} className="p-2 text-center text-sm font-medium text-gray-500 border-b">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {monthDays.map((day) => {
            const dayAppointments = getAppointmentsForDate(day);
            const isCurrentMonth = isSameMonth(day, calendarDate);
            const isSelected = selectedDate && isSameDay(day, selectedDate);
            const isCurrentDay = isToday(day);

            return (
              <div
                key={day.toISOString()}
                className={cn(
                  "min-h-[100px] p-1 border cursor-pointer hover:bg-gray-50",
                  !isCurrentMonth && "text-gray-400 bg-gray-50",
                  isSelected && "bg-blue-50 border-blue-200",
                  isCurrentDay && "bg-yellow-50 border-yellow-200"
                )}
                onClick={() => setSelectedDate(day)}
              >
                <div className="flex items-center justify-between">
                  <span className={cn(
                    "text-sm font-medium",
                    isCurrentDay && "text-yellow-800",
                    !isCurrentMonth && "text-gray-400"
                  )}>
                    {format(day, 'd')}
                  </span>
                  {dayAppointments.length > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-5 w-5 p-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        openCreateDialog(day);
                      }}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  )}
                </div>
                
                <div className="space-y-1 mt-1">
                  {dayAppointments.slice(0, 3).map((appointment: any) => (
                    <div
                      key={appointment.id}
                      className="text-xs p-1 rounded bg-blue-100 text-blue-800 truncate cursor-pointer hover:bg-blue-200"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedAppointment(appointment);
                        setIsAppointmentDetailsOpen(true);
                      }}
                    >
                      {formatTime(appointment.startTime)} {appointment.title}
                    </div>
                  ))}
                  {dayAppointments.length > 3 && (
                    <div className="text-xs text-gray-500">
                      +{dayAppointments.length - 3} more
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

  const renderDayView = () => {
    const currentDate = selectedDate || new Date();
    const dayAppointments = getAppointmentsForDate(currentDate);

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">{format(currentDate, 'EEEE, MMMM d, yyyy')}</h3>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const newDate = new Date(currentDate);
                newDate.setDate(newDate.getDate() - 1);
                setSelectedDate(newDate);
              }}
            >
              <ChevronLeftIcon className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const newDate = new Date(currentDate);
                newDate.setDate(newDate.getDate() + 1);
                setSelectedDate(newDate);
              }}
            >
              <ChevronRightIcon className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => openCreateDialog(currentDate)}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add
            </Button>
          </div>
        </div>

        <ScrollArea className="h-[500px]">
          {dayAppointments.length === 0 ? (
            <EmptyState
              icon={Calendar}
              title="No appointments scheduled"
              description={`No appointments found for ${format(currentDate, 'MMMM d, yyyy')}`}
              action={
                <Button onClick={() => openCreateDialog(currentDate)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Schedule Appointment
                </Button>
              }
            />
          ) : (
            <div className="space-y-3">
              {dayAppointments.map((appointment: any) => (
                <Card key={appointment.id} className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h4 className="font-medium">{appointment.title}</h4>
                          <Badge variant="outline" className={getPriorityColor(appointment.priority)}>
                            {appointment.priority || 'medium'}
                          </Badge>
                          <Badge variant="outline" className={getTypeColor(appointment.type)}>
                            {appointment.type}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-1" />
                            {formatTime(appointment.startTime)} - {formatTime(appointment.endTime)}
                          </div>
                          {appointment.location && (
                            <div className="flex items-center">
                              <MapPin className="h-4 w-4 mr-1" />
                              {appointment.location}
                            </div>
                          )}
                          {appointment.clientName && (
                            <div className="flex items-center">
                              <User className="h-4 w-4 mr-1" />
                              {appointment.clientName}
                            </div>
                          )}
                        </div>
                        
                        {appointment.description && (
                          <p className="text-sm text-gray-600">{appointment.description}</p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </ScrollArea>
      </div>
    );
  };

  const renderWeekView = () => {
    const currentDate = selectedDate || new Date();
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
    
    const weekDays = Array.from({ length: 7 }, (_, i) => {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      return day;
    });

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">
            {format(weekDays[0], 'MMM d')} - {format(weekDays[6], 'MMM d, yyyy')}
          </h3>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const newDate = new Date(currentDate);
                newDate.setDate(newDate.getDate() - 7);
                setSelectedDate(newDate);
              }}
            >
              <ChevronLeftIcon className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const newDate = new Date(currentDate);
                newDate.setDate(newDate.getDate() + 7);
                setSelectedDate(newDate);
              }}
            >
              <ChevronRightIcon className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={openCreateDialog}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-4">
          {weekDays.map((day) => {
            const dayAppointments = getAppointmentsForDate(day);
            const isCurrentDay = isToday(day);

            return (
              <div key={day.toISOString()} className="space-y-2">
                <div className={cn(
                  "text-center p-2 rounded",
                  isCurrentDay ? "bg-yellow-100 text-yellow-800" : "bg-gray-50"
                )}>
                  <div className="text-sm font-medium">{format(day, 'EEE')}</div>
                  <div className="text-lg">{format(day, 'd')}</div>
                </div>
                
                <div className="space-y-1 min-h-[200px]">
                  {dayAppointments.map((appointment: any) => (
                    <div
                      key={appointment.id}
                      className="text-xs p-2 rounded bg-blue-100 text-blue-800 cursor-pointer hover:bg-blue-200"
                      onClick={() => {
                        setSelectedAppointment(appointment);
                        setIsAppointmentDetailsOpen(true);
                      }}
                    >
                      <div className="font-medium truncate">{appointment.title}</div>
                      <div>{formatTime(appointment.startTime)}</div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderListView = () => {
    if (!appointments || appointments.length === 0) {
      return (
        <EmptyState
          icon={Calendar}
          title="No appointments scheduled"
          description="Get started by creating your first appointment"
          action={
            <Button onClick={openCreateDialog}>
              <Plus className="h-4 w-4 mr-2" />
              Create Appointment
            </Button>
          }
        />
      );
    }

    // Group appointments by date
    const groupedAppointments = appointments.reduce((groups: any, appointment: any) => {
      const date = format(new Date(appointment.startTime), 'yyyy-MM-dd');
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(appointment);
      return groups;
    }, {});

    // Sort dates
    const sortedDates = Object.keys(groupedAppointments).sort((a, b) => 
      new Date(a).getTime() - new Date(b).getTime()
    );

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">All Appointments</h3>
          <Button onClick={openCreateDialog}>
            <Plus className="h-4 w-4 mr-2" />
            Create Appointment
          </Button>
        </div>

        <ScrollArea className="h-[600px]">
          {sortedDates.map((date) => {
            const dateAppointments = groupedAppointments[date];
            const dateObj = new Date(date);
            
            return (
              <div key={date} className="mb-6">
                <h4 className="text-md font-medium text-gray-900 mb-3 sticky top-0 bg-white py-2">
                  {format(dateObj, 'EEEE, MMMM d, yyyy')}
                  <span className="ml-2 text-sm text-gray-500">
                    ({dateAppointments.length} appointment{dateAppointments.length !== 1 ? 's' : ''})
                  </span>
                </h4>
                
                <div className="space-y-3">
                  {dateAppointments.map((appointment: any) => (
                    <Card key={appointment.id} className="cursor-pointer hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <h5 className="font-medium">{appointment.title}</h5>
                              <Badge variant="outline" className={getPriorityColor(appointment.priority)}>
                                {appointment.priority || 'medium'}
                              </Badge>
                              <Badge variant="outline" className={getTypeColor(appointment.type)}>
                                {appointment.type}
                              </Badge>
                            </div>
                            
                            <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                              <div className="flex items-center">
                                <Clock className="h-4 w-4 mr-1" />
                                {formatTime(appointment.startTime)} - {formatTime(appointment.endTime)}
                              </div>
                              {appointment.location && (
                                <div className="flex items-center">
                                  <MapPin className="h-4 w-4 mr-1" />
                                  {appointment.location}
                                </div>
                              )}
                              {appointment.clientName && (
                                <div className="flex items-center">
                                  <User className="h-4 w-4 mr-1" />
                                  {appointment.clientName}
                                </div>
                              )}
                            </div>
                            
                            {appointment.description && (
                              <p className="text-sm text-gray-600">{appointment.description}</p>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            );
          })}
        </ScrollArea>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-10 w-24" />
        </div>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Calendar</h1>
        <div className="flex items-center space-x-2">
          <Tabs value={selectedView} onValueChange={(value: any) => setSelectedView(value)}>
            <TabsList>
              <TabsTrigger value="list">List</TabsTrigger>
              <TabsTrigger value="month">Month</TabsTrigger>
              <TabsTrigger value="week">Week</TabsTrigger>
              <TabsTrigger value="day">Day</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      <Card>
        <CardContent className="p-6">
          {selectedView === 'list' && renderListView()}
          {selectedView === 'month' && renderMonthView()}
          {selectedView === 'day' && renderDayView()}
          {selectedView === 'week' && renderWeekView()}
        </CardContent>
      </Card>

      {/* Create Appointment Dialog */}
      <Dialog open={isNewAppointmentDialogOpen} onOpenChange={setIsNewAppointmentDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create New Appointment</DialogTitle>
            <DialogDescription>
              Schedule a new appointment with a client or prospect
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right">
                Title *
              </Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="col-span-3"
                placeholder="Meeting title"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="type" className="text-right">
                Type *
              </Label>
              <Select value={formData.type} onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="meeting">Meeting</SelectItem>
                  <SelectItem value="call">Call</SelectItem>
                  <SelectItem value="review">Review</SelectItem>
                  <SelectItem value="follow-up">Follow-up</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="client" className="text-right">
                Client
              </Label>
              <Select value={formData.clientId} onValueChange={(value) => setFormData(prev => ({ ...prev, clientId: value }))}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select client (optional)" />
                </SelectTrigger>
                <SelectContent>
                  {clients?.map((client: any) => (
                    <SelectItem key={client.id} value={client.id.toString()}>
                      {client.fullName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="startDate" className="text-right">
                Date *
              </Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="startTime" className="text-right">
                Start Time *
              </Label>
              <Input
                id="startTime"
                type="time"
                value={formData.startTime}
                onChange={(e) => handleStartTimeChange(e.target.value)}
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="endTime" className="text-right">
                End Time *
              </Label>
              <Input
                id="endTime"
                type="time"
                value={formData.endTime}
                onChange={(e) => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="location" className="text-right">
                Location
              </Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                className="col-span-3"
                placeholder="Meeting location"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="priority" className="text-right">
                Priority *
              </Label>
              <Select value={formData.priority} onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value }))}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="description" className="text-right">
                Description
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="col-span-3"
                placeholder="Appointment details"
                rows={3}
              />
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => setIsNewAppointmentDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                type="submit"
                disabled={!isFormValid || createAppointmentMutation.isPending}
              >
                {createAppointmentMutation.isPending ? "Creating..." : "Create Appointment"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Appointment Details Dialog */}
      <Dialog open={isAppointmentDetailsOpen} onOpenChange={setIsAppointmentDetailsOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{selectedAppointment?.title}</DialogTitle>
            <DialogDescription>
              Appointment Details
            </DialogDescription>
          </DialogHeader>
          
          {selectedAppointment && (
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Badge variant="outline" className={getPriorityColor(selectedAppointment.priority)}>
                  {selectedAppointment.priority || 'medium'}
                </Badge>
                <Badge variant="outline" className={getTypeColor(selectedAppointment.type)}>
                  {selectedAppointment.type}
                </Badge>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span>{formatDate(selectedAppointment.startTime)}</span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <span>
                    {formatTime(selectedAppointment.startTime)} - {formatTime(selectedAppointment.endTime)}
                  </span>
                </div>
                
                {selectedAppointment.location && (
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    <span>{selectedAppointment.location}</span>
                  </div>
                )}
                
                {selectedAppointment.clientName && (
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-gray-500" />
                    <span>{selectedAppointment.clientName}</span>
                  </div>
                )}
                
                {selectedAppointment.description && (
                  <div className="space-y-1">
                    <Label className="text-sm font-medium">Description</Label>
                    <p className="text-sm text-gray-600">{selectedAppointment.description}</p>
                  </div>
                )}
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAppointmentDetailsOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}