import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format, startOfDay, endOfDay, isSameWeek, startOfToday } from 'date-fns';
import { Calendar as CalendarIcon, Clock, Phone, Video, Users, Search, Plus } from 'lucide-react';

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
  const [dateFilter, setDateFilter] = useState<string>('all');
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

  // Helper functions
  const getAppointmentIcon = (type: string) => {
    switch (type) {
      case 'call':
        return <Phone className="h-4 w-4" />;
      case 'video_call':
        return <Video className="h-4 w-4" />;
      case 'meeting':
        return <Users className="h-4 w-4" />;
      default:
        return <CalendarIcon className="h-4 w-4" />;
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
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Calendar</h1>
          <Dialog open={isNewAppointmentDialogOpen} onOpenChange={setIsNewAppointmentDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                New Appointment
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
                    value={newAppointment.startTime}
                    onChange={(e) => setNewAppointment({ ...newAppointment, startTime: e.target.value })}
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
                    value={newAppointment.endTime}
                    onChange={(e) => setNewAppointment({ ...newAppointment, endTime: e.target.value })}
                    className="col-span-3"
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

        {/* Filters */}
        <div className="mt-4 flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-48">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
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
        <div className="space-y-4">
          {filteredAppointments.length > 0 ? (
            filteredAppointments.map((appointment) => (
              <Card key={appointment.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {getAppointmentIcon(appointment.type)}
                        <h3 className="text-lg font-medium text-foreground">{appointment.title}</h3>
                        <Badge variant="outline" className={getPriorityColor(appointment.priority)}>
                          {appointment.priority}
                        </Badge>
                      </div>
                      
                      {appointment.description && (
                        <p className="text-sm text-muted-foreground mb-2">{appointment.description}</p>
                      )}
                      
                      <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {format(new Date(appointment.startTime), 'MMM dd, yyyy • h:mm a')}
                        </div>
                        
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
                <CalendarIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">No appointments found</h3>
                <p className="text-muted-foreground">
                  {searchQuery || filterType !== 'all' || filterPriority !== 'all' || dateFilter !== 'all'
                    ? "No appointments match your current filters."
                    : "No appointments scheduled."}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}