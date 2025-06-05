import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format, startOfDay, endOfDay, isSameWeek, startOfToday, addMonths, subMonths, addDays, subDays, isSameDay, isToday, startOfMonth, endOfMonth, eachDayOfInterval, startOfWeek, endOfWeek } from 'date-fns';
import { Calendar as CalendarIcon, Clock, Phone, Video, Users, Search, Plus, ChevronLeft, ChevronRight, List, Calendar as CalendarViewIcon } from 'lucide-react';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface Appointment {
  id: number;
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  location?: string;
  clientId?: number;
  clientName?: string;
  assignedTo: number;
  priority: 'low' | 'medium' | 'high';
  type: 'call' | 'meeting' | 'video_call';
  createdAt: string;
}

export default function CalendarPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [selectedView, setSelectedView] = useState<'list' | 'month' | 'day'>('list');
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isNewAppointmentDialogOpen, setIsNewAppointmentDialogOpen] = useState(false);
  const [newAppointment, setNewAppointment] = useState({
    title: '',
    description: '',
    clientId: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    startTime: '',
    endTime: '',
    type: 'meeting',
    priority: 'medium',
    location: ''
  });
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Set page title
  useEffect(() => {
    document.title = "Calendar | Wealth RM";
  }, []);

  // Fetch all appointments
  const { data: appointments, isLoading } = useQuery<Appointment[]>({
    queryKey: ['/api/appointments'],
  });

  // Helper functions
  const nextMonth = () => {
    if (selectedView === 'day' && selectedDate) {
      setSelectedDate(addDays(selectedDate, 1));
    } else {
      setCalendarDate(addMonths(calendarDate, 1));
    }
  };
  
  const prevMonth = () => {
    if (selectedView === 'day' && selectedDate) {
      setSelectedDate(subDays(selectedDate, 1));
    } else {
      setCalendarDate(subMonths(calendarDate, 1));
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, 'h:mm a');
  };

  const getAppointmentTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'meeting':
        return 'border-l-blue-500 bg-blue-50/80 dark:bg-blue-950/30';
      case 'call':
        return 'border-l-green-500 bg-green-50/80 dark:bg-green-950/30';
      case 'video_call':
        return 'border-l-purple-500 bg-purple-50/80 dark:bg-purple-950/30';
      default:
        return 'border-l-slate-500 bg-slate-50/80 dark:bg-slate-800/30';
    }
  };

  const getAppointmentTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'meeting':
        return <Users className="h-4 w-4" />;
      case 'call':
        return <Phone className="h-4 w-4" />;
      case 'video_call':
        return <Video className="h-4 w-4" />;
      default:
        return <CalendarIcon className="h-4 w-4" />;
    }
  };

  // Fetch clients for dropdown
  const { data: clients } = useQuery({
    queryKey: ['/api/clients'],
  });

  // Create appointment mutation
  const createAppointmentMutation = useMutation({
    mutationFn: async (appointmentData: any) => {
      return await apiRequest('POST', '/api/appointments', appointmentData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/appointments'] });
      setIsNewAppointmentDialogOpen(false);
      setNewAppointment({
        title: '',
        description: '',
        clientId: '',
        date: format(new Date(), 'yyyy-MM-dd'),
        startTime: '',
        endTime: '',
        type: 'meeting',
        priority: 'medium',
        location: ''
      });
      toast({
        title: "Success",
        description: "Appointment created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create appointment",
        variant: "destructive",
      });
    },
  });

  // Auto-populate end time when start time changes
  const handleStartTimeChange = (startTime: string) => {
    setNewAppointment(prev => {
      const newState = { ...prev, startTime };
      
      // Auto-populate end time (1 hour after start time)
      if (startTime && !prev.endTime) {
        const [hours, minutes] = startTime.split(':');
        const startDate = new Date();
        startDate.setHours(parseInt(hours), parseInt(minutes));
        startDate.setHours(startDate.getHours() + 1);
        
        const endTime = `${startDate.getHours().toString().padStart(2, '0')}:${startDate.getMinutes().toString().padStart(2, '0')}`;
        newState.endTime = endTime;
      }
      
      return newState;
    });
  };

  const handleCreateAppointment = () => {
    if (!newAppointment.title || !newAppointment.clientId || !newAppointment.date || !newAppointment.startTime || !newAppointment.endTime) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const startDateTime = `${newAppointment.date}T${newAppointment.startTime}:00`;
    const endDateTime = `${newAppointment.date}T${newAppointment.endTime}:00`;

    createAppointmentMutation.mutate({
      title: newAppointment.title,
      description: newAppointment.description,
      clientId: parseInt(newAppointment.clientId),
      startTime: startDateTime,
      endTime: endDateTime,
      type: newAppointment.type,
      priority: newAppointment.priority,
      location: newAppointment.location,
      assignedTo: 1 // Sravan's user ID
    });
  };

  // Helper functions are already defined above

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200 border-red-200 dark:border-red-800';
      case 'medium':
        return 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200 border-yellow-200 dark:border-yellow-800';
      case 'low':
        return 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200 border-green-200 dark:border-green-800';
      default:
        return 'bg-gray-100 dark:bg-gray-800/50 text-gray-800 dark:text-gray-200 border-gray-200 dark:border-gray-700';
    }
  };

  // Filter and sort appointments
  const filteredAppointments = React.useMemo(() => {
    if (!appointments) return [];
    
    let filtered = appointments.filter((appointment) => {
      const appointmentDate = new Date(appointment.startTime);
      const today = startOfToday();
      
      const matchesSearch = searchQuery === '' || 
        appointment.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        appointment.clientName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        appointment.description?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesType = filterType === 'all' || appointment.type === filterType;
      const matchesPriority = filterPriority === 'all' || appointment.priority === filterPriority;
      
      // For list view, only show today and future appointments
      let matchesDate = true;
      if (selectedView === 'list') {
        matchesDate = appointmentDate >= startOfDay(today);
      } else if (selectedView === 'day' && selectedDate) {
        // For day view, filter by selected date (can show past dates when specifically selected)
        matchesDate = isSameDay(appointmentDate, selectedDate);
      }
      
      return matchesSearch && matchesType && matchesPriority && matchesDate;
    });

    // Sort by date and time
    return filtered.sort((a, b) => {
      const dateA = new Date(a.startTime);
      const dateB = new Date(b.startTime);
      return dateA.getTime() - dateB.getTime();
    });
  }, [appointments, searchQuery, filterType, filterPriority, selectedView, selectedDate]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-6 transition-colors duration-300">
        <div className="max-w-7xl mx-auto">
          <div className="h-8 w-48 bg-muted/50 rounded-lg mb-6 animate-pulse" />
          <div className="space-y-4">
            {Array(5).fill(0).map((_, i) => (
              <div key={i} className="h-24 bg-muted/50 rounded-xl animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
      {/* Enhanced Header */}
      <div className="sticky top-0 z-10 bg-card/80 backdrop-blur-sm border-b border-border/50 px-6 py-4 shadow-sm animate-in slide-in-from-top-4 duration-500">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-foreground tracking-tight">Calendar</h1>
            
            <Dialog open={isNewAppointmentDialogOpen} onOpenChange={setIsNewAppointmentDialogOpen}>
              <DialogTrigger asChild>
                <Button 
                  size="icon" 
                  className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full hover:scale-105 transition-all duration-200 focus-visible:ring-2 focus-visible:ring-primary/50"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                <DialogTitle>Create New Appointment</DialogTitle>
                <DialogDescription>
                  Schedule a new appointment with a client
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="title" className="text-right">
                    Title *
                  </Label>
                  <Input
                    id="title"
                    value={newAppointment.title}
                    onChange={(e) => setNewAppointment({ ...newAppointment, title: e.target.value })}
                    className="col-span-3"
                    placeholder="Appointment title"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="client" className="text-right">
                    Client *
                  </Label>
                  <Select
                    value={newAppointment.clientId}
                    onValueChange={(value) => setNewAppointment({ ...newAppointment, clientId: value })}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select a client" />
                    </SelectTrigger>
                    <SelectContent>
                      {clients && Array.isArray(clients) ? clients.map((client: any) => (
                        <SelectItem key={client.id} value={client.id.toString()}>
                          {client.fullName}
                        </SelectItem>
                      )) : null}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="date" className="text-right">
                    Date *
                  </Label>
                  <Input
                    id="date"
                    type="date"
                    value={newAppointment.date}
                    onChange={(e) => setNewAppointment({ ...newAppointment, date: e.target.value })}
                    className="col-span-3 [&::-webkit-calendar-picker-indicator]:dark:invert [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="startTime" className="text-right">
                    Start Time *
                  </Label>
                  <Input
                    id="startTime"
                    type="time"
                    value={newAppointment.startTime}
                    onChange={(e) => handleStartTimeChange(e.target.value)}
                    className="col-span-3 [&::-webkit-calendar-picker-indicator]:dark:invert [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="endTime" className="text-right">
                    End Time *
                  </Label>
                  <Input
                    id="endTime"
                    type="time"
                    value={newAppointment.endTime}
                    onChange={(e) => setNewAppointment({ ...newAppointment, endTime: e.target.value })}
                    className="col-span-3 [&::-webkit-calendar-picker-indicator]:dark:invert [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="type" className="text-right">
                    Type
                  </Label>
                  <Select
                    value={newAppointment.type}
                    onValueChange={(value) => setNewAppointment({ ...newAppointment, type: value })}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="meeting">Meeting</SelectItem>
                      <SelectItem value="call">Call</SelectItem>
                      <SelectItem value="video_call">Video Call</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="priority" className="text-right">
                    Priority
                  </Label>
                  <Select
                    value={newAppointment.priority}
                    onValueChange={(value) => setNewAppointment({ ...newAppointment, priority: value })}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="location" className="text-right">
                    Location
                  </Label>
                  <Input
                    id="location"
                    value={newAppointment.location}
                    onChange={(e) => setNewAppointment({ ...newAppointment, location: e.target.value })}
                    className="col-span-3"
                    placeholder="Meeting location"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="description" className="text-right">
                    Description
                  </Label>
                  <Textarea
                    id="description"
                    value={newAppointment.description}
                    onChange={(e) => setNewAppointment({ ...newAppointment, description: e.target.value })}
                    className="col-span-3"
                    placeholder="Appointment description"
                    rows={3}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsNewAppointmentDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={handleCreateAppointment}
                  disabled={createAppointmentMutation.isPending}
                >
                  {createAppointmentMutation.isPending ? "Creating..." : "Create Appointment"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          </div>
          
          {/* View Toggle */}
          <div className="flex items-center bg-muted rounded-lg p-1 w-fit">
            <Button
              variant={selectedView === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setSelectedView('list')}
              className="h-8 px-3"
            >
              <List className="h-4 w-4 mr-1" />
              List
            </Button>
            <Button
              variant={selectedView === 'day' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => {
                setSelectedView('day');
                if (!selectedDate) setSelectedDate(new Date());
              }}
              className="h-8 px-3"
            >
              <Clock className="h-4 w-4 mr-1" />
              Day
            </Button>
            <Button
              variant={selectedView === 'month' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setSelectedView('month')}
              className="h-8 px-3"
            >
              <CalendarViewIcon className="h-4 w-4 mr-1" />
              Month
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="mt-4 space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search appointments..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          
          <div className="flex items-center gap-4">
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="call">Call</SelectItem>
                <SelectItem value="meeting">Meeting</SelectItem>
                <SelectItem value="video_call">Video Call</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={filterPriority} onValueChange={setFilterPriority}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Date Navigation for Day and Month Views */}
        {(selectedView === 'day' || selectedView === 'month') && (
          <div className="flex items-center justify-between mb-6">
            <Button
              variant="outline"
              size="sm"
              onClick={prevMonth}
              className="flex items-center gap-2"
            >
              <ChevronLeft className="h-4 w-4" />
              {selectedView === 'day' ? 'Previous Day' : 'Previous Month'}
            </Button>
            
            <h2 className="text-lg font-semibold">
              {selectedView === 'day' && selectedDate
                ? format(selectedDate, 'EEEE, MMMM d, yyyy')
                : format(calendarDate, 'MMMM yyyy')
              }
            </h2>
            
            <Button
              variant="outline"
              size="sm"
              onClick={nextMonth}
              className="flex items-center gap-2"
            >
              {selectedView === 'day' ? 'Next Day' : 'Next Month'}
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* List View */}
        {selectedView === 'list' && (
          <div className="space-y-4">
            {filteredAppointments.length > 0 ? (
              filteredAppointments.map((appointment) => (
                <Card key={appointment.id} className={`border-l-4 ${getAppointmentTypeColor(appointment.type)} bg-card dark:bg-card border-border shadow-sm hover:shadow-md transition-shadow`}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {getAppointmentTypeIcon(appointment.type)}
                          <h3 className="text-lg font-medium text-card-foreground">{appointment.title}</h3>
                          <Badge variant="outline" className={getPriorityColor(appointment.priority)}>
                            {appointment.priority}
                          </Badge>
                        </div>
                        
                        {appointment.description && (
                          <p className="text-sm text-card-foreground/70 mb-2">{appointment.description}</p>
                        )}
                      </div>
                    </div>
                    
                    {/* Theme-aware bottom information bar */}
                    <div className="bg-muted/50 dark:bg-muted/30 px-4 py-3 -mx-4 -mb-4 mt-4 flex flex-col space-y-1 sm:flex-row sm:space-y-0 sm:space-x-4 text-sm border-t border-border">
                      <div className="flex items-center text-sm text-foreground/80">
                        <Clock className="h-4 w-4 mr-1 text-primary" />
                        {formatTime(appointment.startTime)} - {formatTime(appointment.endTime)}
                      </div>
                      {appointment.location && (
                        <div className="flex items-center text-sm text-foreground/80">
                          <span className="h-4 w-4 mr-1 text-primary">📍</span>
                          {appointment.location}
                        </div>
                      )}
                      {appointment.clientName && (
                        <div className="flex items-center text-sm text-foreground/80">
                          <Users className="h-4 w-4 mr-1 text-primary" />
                          {appointment.clientName}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <CalendarIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">No appointments found</h3>
                  <p className="text-sm text-muted-foreground">
                    {searchQuery || filterType !== 'all' || filterPriority !== 'all'
                      ? 'Try adjusting your filters to see more appointments.'
                      : 'You have no appointments. Create a new one to get started.'
                    }
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Day View */}
        {selectedView === 'day' && (
          <div className="space-y-4">
            <div className="grid gap-4">
              {selectedDate && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="h-5 w-5" />
                      {format(selectedDate, 'EEEE, MMMM d, yyyy')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {filteredAppointments.length > 0 ? (
                      <div className="space-y-3">
                        {filteredAppointments.map((appointment) => (
                          <div
                            key={appointment.id}
                            className={`p-3 rounded-lg border-l-4 ${getAppointmentTypeColor(appointment.type)} bg-card dark:bg-card border-border shadow-sm hover:shadow-md transition-shadow`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                {getAppointmentTypeIcon(appointment.type)}
                                <h4 className="font-medium text-card-foreground">{appointment.title}</h4>
                                <Badge variant="outline" className={getPriorityColor(appointment.priority)}>
                                  {appointment.priority}
                                </Badge>
                              </div>
                              <div className="text-sm text-card-foreground/60">
                                {formatTime(appointment.startTime)} - {formatTime(appointment.endTime)}
                              </div>
                            </div>
                            {appointment.description && (
                              <p className="text-sm text-card-foreground/70 mt-1">{appointment.description}</p>
                            )}
                            {appointment.clientName && (
                              <p className="text-sm text-card-foreground/70 mt-1">Client: {appointment.clientName}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <CalendarIcon className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">No appointments scheduled for this day</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}

        {/* Month View */}
        {selectedView === 'month' && (
          <div className="space-y-4">
            <Card>
              <CardContent className="p-6">
                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-1 mb-4">
                  {/* Day Headers */}
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                    <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">
                      {day}
                    </div>
                  ))}
                  
                  {/* Calendar Days */}
                  {eachDayOfInterval({
                    start: startOfWeek(startOfMonth(calendarDate)),
                    end: endOfWeek(endOfMonth(calendarDate))
                  }).map((day) => {
                    const dayAppointments = appointments?.filter(apt => 
                      isSameDay(new Date(apt.startTime), day)
                    ) || [];
                    
                    return (
                      <div
                        key={day.toISOString()}
                        className={`
                          p-2 min-h-[80px] border rounded-lg cursor-pointer transition-colors
                          ${isSameDay(day, calendarDate) ? 'bg-primary/10 border-primary' : 'hover:bg-muted/50'}
                          ${isToday(day) ? 'bg-accent border-accent-foreground' : ''}
                        `}
                        onClick={() => {
                          setSelectedDate(day);
                          setSelectedView('day');
                        }}
                      >
                        <div className={`text-sm ${isSameDay(day, calendarDate) ? 'font-semibold' : ''}`}>
                          {format(day, 'd')}
                        </div>
                        {dayAppointments.length > 0 && (
                          <div className="mt-1 space-y-1">
                            {dayAppointments.slice(0, 2).map((apt) => (
                              <div
                                key={apt.id}
                                className={`text-xs p-1 rounded truncate ${getAppointmentTypeColor(apt.type)} bg-card dark:bg-card border-border shadow-sm text-card-foreground`}
                              >
                                {apt.title}
                              </div>
                            ))}
                            {dayAppointments.length > 2 && (
                              <div className="text-xs text-muted-foreground">
                                +{dayAppointments.length - 2} more
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}