import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay,
  addMonths,
  subMonths,
  startOfWeek,
  endOfWeek,
  addDays
} from "date-fns";
import { cn, formatTime } from "@/lib/utils";

interface Appointment {
  id: number;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  location: string;
  clientId?: number;
  prospectId?: number;
  priority: string;
  type: string;
  clientName?: string;
}

export default function CalendarPage() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedView, setSelectedView] = useState<string>("month");
  const [calendarDate, setCalendarDate] = useState<Date>(new Date());
  
  // Set page title
  useEffect(() => {
    document.title = "Calendar | Wealth RM";
  }, []);
  
  // Format date for API query
  const formattedSelectedDate = format(selectedDate, "yyyy-MM-dd");
  
  const { data: appointments, isLoading } = useQuery({
    queryKey: ['/api/appointments', { date: formattedSelectedDate }],
  });
  
  const nextMonth = () => {
    setCalendarDate(addMonths(calendarDate, 1));
  };
  
  const prevMonth = () => {
    setCalendarDate(subMonths(calendarDate, 1));
  };
  
  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
    }
  };
  
  const getAppointmentsForDate = (date: Date) => {
    if (!appointments) return [];
    
    return appointments.filter((appointment: Appointment) => {
      const appointmentDate = new Date(appointment.startTime);
      return isSameDay(appointmentDate, date);
    });
  };
  
  const getEventsByHour = () => {
    const events: Record<string, Appointment[]> = {};
    const selectedAppointments = getAppointmentsForDate(selectedDate);
    
    // Create time slots
    for (let i = 8; i <= 20; i++) {
      const hour = i < 10 ? `0${i}:00` : `${i}:00`;
      events[hour] = [];
    }
    
    // Assign appointments to time slots
    selectedAppointments.forEach(appointment => {
      const startHour = format(new Date(appointment.startTime), "HH:00");
      if (events[startHour]) {
        events[startHour].push(appointment);
      } else {
        events["08:00"].push(appointment); // Default fallback
      }
    });
    
    return events;
  };
  
  const getDaysForWeekView = () => {
    const start = startOfWeek(selectedDate, { weekStartsOn: 1 });
    const end = endOfWeek(selectedDate, { weekStartsOn: 1 });
    return eachDayOfInterval({ start, end });
  };
  
  const getAppointmentTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'meeting':
        return 'bg-primary-100 border-primary-500 text-primary-700';
      case 'call':
        return 'bg-green-100 border-green-500 text-green-700';
      case 'email':
        return 'bg-amber-100 border-amber-500 text-amber-700';
      default:
        return 'bg-slate-100 border-slate-500 text-slate-700';
    }
  };
  
  const renderDayView = () => {
    const eventsByHour = getEventsByHour();
    
    return (
      <div className="mt-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-slate-800">
            {format(selectedDate, "EEEE, MMMM d, yyyy")}
          </h2>
          <Button variant="outline" size="sm" className="flex items-center gap-1">
            <Plus className="h-4 w-4" />
            Add Event
          </Button>
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
                        className={`p-2 mb-1 text-sm rounded border-l-4 ${getAppointmentTypeColor(appointment.type)}`}
                      >
                        <div className="font-medium">{appointment.title}</div>
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
  
  const renderWeekView = () => {
    const days = getDaysForWeekView();
    
    return (
      <div className="mt-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-slate-800">
            {format(days[0], "MMMM d")} - {format(days[6], "MMMM d, yyyy")}
          </h2>
          <Button variant="outline" size="sm" className="flex items-center gap-1">
            <Plus className="h-4 w-4" />
            Add Event
          </Button>
        </div>
        
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="grid grid-cols-7 border-b border-slate-200">
            {days.map((day, i) => (
              <div 
                key={i} 
                className={cn(
                  "p-2 text-center text-sm font-medium",
                  isSameDay(day, new Date()) && "bg-primary-50"
                )}
              >
                <div className="text-slate-500">{format(day, "EEE")}</div>
                <div className={cn(
                  "inline-flex h-8 w-8 items-center justify-center rounded-full",
                  isSameDay(day, new Date()) && "bg-primary-500 text-white"
                )}>
                  {format(day, "d")}
                </div>
              </div>
            ))}
          </div>
          
          {isLoading ? (
            <div className="p-4">
              <Skeleton className="h-40 w-full" />
            </div>
          ) : (
            <div className="grid grid-cols-7 min-h-[400px]">
              {days.map((day, i) => {
                const dayAppointments = getAppointmentsForDate(day);
                return (
                  <div 
                    key={i} 
                    className={cn(
                      "p-1 border-r border-slate-200 last:border-r-0",
                      !isSameMonth(day, calendarDate) && "bg-slate-50",
                      isSameDay(day, new Date()) && "bg-primary-50"
                    )}
                  >
                    {dayAppointments.map(appointment => (
                      <div 
                        key={appointment.id} 
                        className={`p-1 mb-1 text-xs rounded border-l-2 ${getAppointmentTypeColor(appointment.type)}`}
                      >
                        <div className="font-medium truncate">{appointment.title}</div>
                        {appointment.clientName && (
                          <div className="text-blue-600 font-medium truncate">{appointment.clientName}</div>
                        )}
                        <div className="truncate">{formatTime(appointment.startTime)}</div>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  };
  
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800">Calendar</h1>
          <p className="text-sm text-slate-600">Manage your meetings and appointments</p>
        </div>
        <Button
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          New Appointment
        </Button>
      </div>
      
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4 sm:items-center justify-between">
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="icon"
                onClick={prevMonth}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="min-w-[150px] justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(calendarDate, "MMMM yyyy")}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <CalendarComponent
                    mode="single"
                    selected={selectedDate}
                    onSelect={handleDateSelect}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <Button
                variant="outline"
                size="icon"
                onClick={nextMonth}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex items-center space-x-2">
              <Select 
                defaultValue={selectedView}
                onValueChange={setSelectedView}
              >
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="View" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="day">Day</SelectItem>
                  <SelectItem value="week">Week</SelectItem>
                  <SelectItem value="month">Month</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="default">Today</Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {selectedView === "month" && (
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="grid grid-cols-7 gap-px bg-slate-200">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
              <div key={day} className="p-2 text-center text-sm font-medium text-slate-700 bg-slate-50">
                {day}
              </div>
            ))}
            
            {eachDayOfInterval({
              start: startOfWeek(startOfMonth(calendarDate), { weekStartsOn: 1 }),
              end: endOfWeek(endOfMonth(calendarDate), { weekStartsOn: 1 }),
            }).map((date, i) => {
              const isCurrentMonth = isSameMonth(date, calendarDate);
              const isToday = isSameDay(date, new Date());
              const isSelected = isSameDay(date, selectedDate);
              const dayAppointments = getAppointmentsForDate(date);
              
              return (
                <div
                  key={i}
                  className={cn(
                    "min-h-[100px] p-2 bg-white",
                    !isCurrentMonth && "bg-slate-50 text-slate-400",
                    isToday && !isSelected && "bg-primary-50",
                    isSelected && "bg-primary-100",
                    "hover:bg-slate-100 cursor-pointer"
                  )}
                  onClick={() => handleDateSelect(date)}
                >
                  <div className="flex justify-between items-start">
                    <span
                      className={cn(
                        "text-sm font-medium",
                        isToday && "text-primary-600"
                      )}
                    >
                      {format(date, "d")}
                    </span>
                  </div>
                  <div className="mt-1 space-y-1">
                    {isLoading ? (
                      <>
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-2/3" />
                      </>
                    ) : (
                      dayAppointments.slice(0, 3).map((appointment) => (
                        <div
                          key={appointment.id}
                          className={`px-1 py-0.5 text-xs rounded ${getAppointmentTypeColor(appointment.type)}`}
                        >
                          <div className="font-medium truncate">{appointment.title}</div>
                          {appointment.clientName && (
                            <div className="text-blue-600 font-medium truncate">{appointment.clientName}</div>
                          )}
                          <div className="truncate">{formatTime(appointment.startTime)}</div>
                        </div>
                      ))
                    )}
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
      )}
      
      {selectedView === "day" && renderDayView()}
      {selectedView === "week" && renderWeekView()}
    </div>
  );
}
