import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, isSameMonth, addMonths, subMonths, startOfWeek, endOfWeek } from 'date-fns';
import { Calendar, Clock, Plus, ChevronLeft, ChevronRight, ArrowLeft, User, Phone, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';

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

interface Client {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  tier: string;
  riskProfile: string | null;
  aum: string | null;
}

interface ClientAppointmentsProps {
  clientId?: string | number | null;
}

const NewAppointmentDialog = () => {
  return (
    <Dialog>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New Appointment</DialogTitle>
        </DialogHeader>
        <div className="p-4">
          <p>Create new appointment functionality coming soon.</p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const ClientAppointments = ({ clientId: propClientId }: ClientAppointmentsProps = {}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedView, setSelectedView] = useState<'list' | 'month' | 'day'>('list');
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [isAppointmentDetailsOpen, setIsAppointmentDetailsOpen] = useState(false);

  // Extract clientId from URL if not provided as prop
  const urlClientId = typeof window !== 'undefined' ? 
    window.location.hash.match(/\/clients\/(\d+)\/appointments/)?.[1] ||
    new URLSearchParams(window.location.search).get('clientId') || 
    new URLSearchParams(window.location.hash.split('?')[1] || '').get('clientId') : null;
  const clientId = propClientId || urlClientId;

  // Fetch client data if clientId is provided
  const { data: client, isLoading: isClientLoading } = useQuery({
    queryKey: ['/api/clients', clientId],
    queryFn: () => fetch(`/api/clients/${clientId}`).then(res => res.json()),
    enabled: !!clientId,
  });

  // Fetch appointments
  const { data: appointmentsData, isLoading: isAppointmentsLoading } = useQuery({
    queryKey: clientId ? ['/api/appointments', clientId] : ['/api/appointments'],
    queryFn: () => {
      const url = clientId ? `/api/appointments?clientId=${clientId}` : '/api/appointments';
      return fetch(url).then(res => res.json());
    },
  });

  // Ensure appointments is always an array
  const appointments = Array.isArray(appointmentsData) ? appointmentsData : [];

  const getTierColor = (tier: string) => {
    switch (tier?.toLowerCase()) {
      case 'platinum': return 'border-purple-500';
      case 'gold': return 'border-yellow-500';
      case 'silver': return 'border-gray-400';
      case 'bronze': return 'border-orange-500';
      default: return 'border-slate-300';
    }
  };

  const getPriorityColor = (priority: string | null) => {
    switch (priority?.toLowerCase()) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'meeting': return 'bg-blue-100 text-blue-800';
      case 'call': return 'bg-green-100 text-green-800';
      case 'review': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getAppointmentsForDate = (date: Date) => {
    return appointments.filter((appointment: Appointment) => {
      const appointmentDate = new Date(appointment.startTime);
      return isSameDay(appointmentDate, date);
    }).sort((a: Appointment, b: Appointment) => {
      return new Date(a.startTime).getTime() - new Date(b.startTime).getTime();
    });
  };

  const getAppointmentsByHour = (date: Date) => {
    const hourlyAppointments: { [key: number]: Appointment[] } = {};
    
    for (let hour = 9; hour <= 18; hour++) {
      hourlyAppointments[hour] = [];
    }

    const sortedAppointments = [...appointments].sort((a: Appointment, b: Appointment) => {
      return new Date(a.startTime).getTime() - new Date(b.startTime).getTime();
    });

    sortedAppointments.forEach((appointment: Appointment) => {
      const appointmentDate = new Date(appointment.startTime);
      if (isSameDay(appointmentDate, date)) {
        const hour = appointmentDate.getHours();
        if (hour >= 9 && hour <= 18) {
          hourlyAppointments[hour].push(appointment);
        }
      }
    });

    return hourlyAppointments;
  };

  const renderListView = () => {
    const todayAppointments = getAppointmentsForDate(new Date());
    const upcomingAppointments = appointments
      .filter((apt: Appointment) => new Date(apt.startTime) > new Date())
      .sort((a: Appointment, b: Appointment) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
      .slice(0, 10);

    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-4">Today's Appointments</h3>
          {todayAppointments.length === 0 ? (
            <p className="text-gray-500">No appointments scheduled for today.</p>
          ) : (
            <div className="space-y-3">
              {todayAppointments.map((appointment: Appointment) => (
                <div
                  key={appointment.id}
                  className="bg-white p-4 rounded-lg border shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => {
                    setSelectedAppointment(appointment);
                    setIsAppointmentDetailsOpen(true);
                  }}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{appointment.title}</h4>
                      {appointment.clientName && (
                        <p className="text-sm text-gray-600 mt-1">Client: {appointment.clientName}</p>
                      )}
                      <p className="text-sm text-gray-500 mt-1">
                        {format(new Date(appointment.startTime), 'h:mm a')} - {format(new Date(appointment.endTime), 'h:mm a')}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Badge className={getTypeColor(appointment.type)}>
                        {appointment.type}
                      </Badge>
                      {appointment.priority && (
                        <Badge className={getPriorityColor(appointment.priority)}>
                          {appointment.priority}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4">Upcoming Appointments</h3>
          {upcomingAppointments.length === 0 ? (
            <p className="text-gray-500">No upcoming appointments.</p>
          ) : (
            <div className="space-y-3">
              {upcomingAppointments.map((appointment: Appointment) => (
                <div
                  key={appointment.id}
                  className="bg-white p-4 rounded-lg border shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => {
                    setSelectedAppointment(appointment);
                    setIsAppointmentDetailsOpen(true);
                  }}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{appointment.title}</h4>
                      {appointment.clientName && (
                        <p className="text-sm text-gray-600 mt-1">Client: {appointment.clientName}</p>
                      )}
                      <p className="text-sm text-gray-500 mt-1">
                        {format(new Date(appointment.startTime), 'MMM d, h:mm a')}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Badge className={getTypeColor(appointment.type)}>
                        {appointment.type}
                      </Badge>
                      {appointment.priority && (
                        <Badge className={getPriorityColor(appointment.priority)}>
                          {appointment.priority}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderCalendar = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const calendarStart = startOfWeek(monthStart);
    const calendarEnd = endOfWeek(monthEnd);
    const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

    return (
      <div className="bg-white rounded-lg border shadow-sm p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">{format(currentDate, 'MMMM yyyy')}</h3>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentDate(subMonths(currentDate, 1))}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentDate(addMonths(currentDate, 1))}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-2 mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-2">
          {calendarDays.map(day => {
            const dayAppointments = getAppointmentsForDate(day);
            const isCurrentMonth = isSameMonth(day, currentDate);
            const isDayToday = isToday(day);

            return (
              <div
                key={day.toISOString()}
                className={`
                  min-h-[100px] p-2 border rounded-lg cursor-pointer transition-colors
                  ${isCurrentMonth ? 'bg-white hover:bg-gray-50' : 'bg-gray-50 text-gray-400'}
                  ${isDayToday ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}
                `}
                onClick={() => {
                  setSelectedDate(day);
                  setSelectedView('day');
                }}
              >
                <div className={`text-sm font-medium mb-1 ${isDayToday ? 'text-blue-600' : ''}`}>
                  {format(day, 'd')}
                </div>
                <div className="space-y-1">
                  {dayAppointments.slice(0, 2).map((appointment: Appointment) => (
                    <div
                      key={appointment.id}
                      className={`text-xs p-1 rounded ${getTypeColor(appointment.type)} truncate`}
                    >
                      {appointment.title}
                    </div>
                  ))}
                  {dayAppointments.length > 2 && (
                    <div className="text-xs text-gray-500">
                      +{dayAppointments.length - 2} more
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
    const hourlyAppointments = getAppointmentsByHour(selectedDate);

    return (
      <div className="bg-white rounded-lg border shadow-sm">
        <div className="p-4 border-b">
          <h3 className="text-lg font-semibold">{format(selectedDate, 'EEEE, MMMM d, yyyy')}</h3>
        </div>
        <div className="p-4">
          {Object.entries(hourlyAppointments).map(([hour, hourAppointments]) => (
            <div key={hour} className="flex border-b py-4 last:border-b-0">
              <div className="w-20 text-sm text-gray-500">
                {format(new Date().setHours(parseInt(hour), 0, 0, 0), 'h:mm a')}
              </div>
              <div className="flex-1 ml-4">
                {hourAppointments.length === 0 ? (
                  <div className="text-gray-400 text-sm">No appointments</div>
                ) : (
                  <div className="space-y-2">
                    {hourAppointments.map((appointment: Appointment) => (
                      <div
                        key={appointment.id}
                        className="bg-gray-50 p-3 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                        onClick={() => {
                          setSelectedAppointment(appointment);
                          setIsAppointmentDetailsOpen(true);
                        }}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium">{appointment.title}</h4>
                            {appointment.clientName && (
                              <p className="text-sm text-gray-600">Client: {appointment.clientName}</p>
                            )}
                            <p className="text-sm text-gray-500">
                              {format(new Date(appointment.startTime), 'h:mm a')} - {format(new Date(appointment.endTime), 'h:mm a')}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Badge className={getTypeColor(appointment.type)}>
                              {appointment.type}
                            </Badge>
                            {appointment.priority && (
                              <Badge className={getPriorityColor(appointment.priority)}>
                                {appointment.priority}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (isAppointmentsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="space-y-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Customer Information Band - Only show for client-specific view */}
      {clientId && (
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
                  {isClientLoading ? (
                    <div className="space-y-2">
                      <Skeleton className="h-6 w-48" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                  ) : client ? (
                    <div>
                      <h2 className="text-xl font-semibold text-slate-900">{client.fullName || client.name}</h2>
                      <div className="flex flex-col gap-1 mt-1">
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <Phone className="h-4 w-4" />
                          <span>{client.phone || 'Not available'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <Mail className="h-4 w-4" />
                          <span>{client.email || 'Not available'}</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-red-600">Client not found</div>
                  )}
                </div>
              </div>
              
              {client && (
                <div className="flex items-center gap-3">
                  <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                    <User className="h-5 w-5 text-gray-600" />
                  </button>
                  <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                    <Phone className="h-5 w-5 text-gray-600" />
                  </button>
                  <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                    <Mail className="h-5 w-5 text-gray-600" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Calendar className="h-6 w-6 text-blue-600" />
              <h1 className="text-2xl font-bold text-slate-900">
                {clientId ? 'Client Appointments' : 'Calendar'}
              </h1>
            </div>
            <Button>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4 space-y-4">
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
                  <p className="text-slate-900 dark:text-slate-100">{selectedAppointment.location}</p>
                </div>
              )}
              
              <div className="flex gap-2">
                <div>
                  <Badge className={getTypeColor(
                    selectedAppointment?.type || "Meeting"
                  )}>
                    {selectedAppointment?.type || "Meeting"}
                  </Badge>
                </div>
                {selectedAppointment?.priority && (
                  <div>
                    <Badge className={getPriorityColor(
                      selectedAppointment?.priority || "Normal"
                    )}>
                      {selectedAppointment?.priority || "Normal"} Priority
                    </Badge>
                  </div>
                )}
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
  );
};

export default ClientAppointments;