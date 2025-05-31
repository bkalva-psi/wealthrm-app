import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isToday, isSameMonth, startOfWeek, endOfWeek, startOfDay, endOfDay, addDays, isSameWeek, startOfToday } from 'date-fns';
import { Calendar as CalendarIcon, Clock, MapPin, Phone, Video, Users, Plus, ChevronLeft, ChevronRight, Filter, Search } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';

// Types
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

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  appointments: Appointment[];
}

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [view, setView] = useState<'month' | 'list'>('month');

  // Set page title
  useEffect(() => {
    document.title = "Calendar | Wealth RM";
  }, []);

  // Fetch all appointments
  const { data: appointments, isLoading } = useQuery<Appointment[]>({
    queryKey: ['/api/appointments'],
  });

  // Helper functions
  const getAppointmentIcon = (type: string) => {
    switch (type) {
      case 'call':
        return <Phone className="h-3 w-3" />;
      case 'video_call':
        return <Video className="h-3 w-3" />;
      case 'meeting':
        return <Users className="h-3 w-3" />;
      default:
        return <CalendarIcon className="h-3 w-3" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Filter appointments
  const filteredAppointments = React.useMemo(() => {
    if (!appointments) return [];
    
    return appointments.filter((appointment) => {
      const appointmentDate = new Date(appointment.startTime);
      const today = startOfToday();
      
      const matchesSearch = searchQuery === '' || 
        appointment.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        appointment.clientName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        appointment.description?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesType = filterType === 'all' || appointment.type === filterType;
      const matchesPriority = filterPriority === 'all' || appointment.priority === filterPriority;
      
      let matchesDate = true;
      if (dateFilter === 'today') {
        matchesDate = appointmentDate >= startOfDay(today) && appointmentDate <= endOfDay(today);
      } else if (dateFilter === 'week') {
        matchesDate = isSameWeek(appointmentDate, today, { weekStartsOn: 0 });
      }
      
      return matchesSearch && matchesType && matchesPriority && matchesDate;
    });
  }, [appointments, searchQuery, filterType, filterPriority, dateFilter]);

  // Generate calendar days
  const generateCalendarDays = (): CalendarDay[] => {
    const start = startOfWeek(startOfMonth(currentDate));
    const end = endOfWeek(endOfMonth(currentDate));
    const days = eachDayOfInterval({ start, end });

    return days.map(date => {
      const dayAppointments = filteredAppointments.filter(apt => {
        const aptDate = new Date(apt.startTime);
        return aptDate.toDateString() === date.toDateString();
      });

      return {
        date,
        isCurrentMonth: isSameMonth(date, currentDate),
        appointments: dayAppointments
      };
    });
  };

  const calendarDays = generateCalendarDays();

  // Navigation functions
  const goToPreviousMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <Skeleton className="h-8 w-48 mb-6" />
          <div className="grid grid-cols-7 gap-4 mb-4">
            {Array(7).fill(0).map((_, i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-2xl font-bold text-gray-900">Calendar</h1>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={goToToday}>
              Today
            </Button>
            <Button variant="outline" size="sm" onClick={() => setView(view === 'month' ? 'list' : 'month')}>
              {view === 'month' ? 'List View' : 'Month View'}
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="mt-4 flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-48">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search appointments..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
          
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
          
          <Select value={dateFilter} onValueChange={setDateFilter}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Date" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Dates</SelectItem>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="p-6">
        {view === 'month' ? (
          // Month View
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">
                  {format(currentDate, 'MMMM yyyy')}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={goToPreviousMonth}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={goToNextMonth}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
                    {day}
                  </div>
                ))}
              </div>
              
              <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((day, index) => (
                  <div
                    key={index}
                    className={`min-h-24 p-2 border border-gray-200 ${
                      !day.isCurrentMonth ? 'bg-gray-50 text-gray-400' : 'bg-white'
                    } ${isToday(day.date) ? 'ring-2 ring-blue-500' : ''}`}
                  >
                    <div className="text-sm font-medium mb-1">
                      {format(day.date, 'd')}
                    </div>
                    
                    <div className="space-y-1">
                      {day.appointments.slice(0, 2).map((appointment) => (
                        <div
                          key={appointment.id}
                          className="text-xs p-1 rounded bg-blue-100 text-blue-800 truncate cursor-pointer hover:bg-blue-200"
                          title={`${appointment.title} - ${appointment.clientName}`}
                        >
                          <div className="flex items-center gap-1">
                            {getAppointmentIcon(appointment.type)}
                            <span className="truncate">{appointment.title}</span>
                          </div>
                        </div>
                      ))}
                      
                      {day.appointments.length > 2 && (
                        <div className="text-xs text-gray-500">
                          +{day.appointments.length - 2} more
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ) : (
          // List View
          <div className="space-y-4">
            {filteredAppointments.length > 0 ? (
              filteredAppointments.map((appointment) => (
                <Card key={appointment.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {getAppointmentIcon(appointment.type)}
                          <h3 className="font-medium text-gray-900">{appointment.title}</h3>
                          <Badge variant="outline" className={getPriorityColor(appointment.priority)}>
                            {appointment.priority}
                          </Badge>
                        </div>
                        
                        {appointment.description && (
                          <p className="text-sm text-gray-600 mb-2">{appointment.description}</p>
                        )}
                        
                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {format(new Date(appointment.startTime), 'MMM dd, yyyy • h:mm a')}
                          </div>
                          
                          {appointment.location && (
                            <div className="flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              {appointment.location}
                            </div>
                          )}
                          
                          {appointment.clientName && (
                            <div className="flex items-center gap-1">
                              <Users className="h-4 w-4" />
                              {appointment.clientName}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <CalendarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No appointments found</h3>
                  <p className="text-gray-500">
                    {searchQuery || filterType !== 'all' || filterPriority !== 'all' 
                      ? "No appointments match your current filters."
                      : "No appointments scheduled."}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}