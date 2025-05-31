import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { ArrowLeft, MessageCircle, Phone, Mail, Video, FileText, Clock, Paperclip, Calendar, CheckCircle2, AlertCircle, Filter, BarChart4, Wallet, Target, User, ArrowUpDown, Users, CheckSquare, MessageSquare, Plus, Search, ChevronDown, ChevronUp, PieChart, Receipt, FileBarChart, Lightbulb } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

// Utility functions
const getInitials = (name: string): string => {
  return name.split(' ').map(n => n[0]).join('').toUpperCase();
};

const generateAvatar = (initials: string): string => {
  const colors = [
    { bg: '#3B82F6', text: 'white' },
    { bg: '#EF4444', text: 'white' },
    { bg: '#10B981', text: 'white' },
    { bg: '#F59E0B', text: 'white' },
    { bg: '#8B5CF6', text: 'white' },
    { bg: '#06B6D4', text: 'white' },
    { bg: '#EC4899', text: 'white' },
    { bg: '#84CC16', text: 'white' }
  ];
  
  const colorIndex = initials.charCodeAt(0) % colors.length;
  const color = colors[colorIndex];
  
  return `<svg width="40" height="40" xmlns="http://www.w3.org/2000/svg">
    <rect width="40" height="40" fill="${color.bg}"/>
    <text x="20" y="25" text-anchor="middle" fill="${color.text}" font-family="Arial, sans-serif" font-size="14" font-weight="bold">${initials}</text>
  </svg>`;
};

const svgToDataURL = (svg: string): string => {
  return `data:image/svg+xml;base64,${btoa(svg)}`;
};

const getTierColor = (tier: string) => {
  switch (tier?.toLowerCase()) {
    case 'platinum':
      return { 
        bg: 'bg-purple-100 dark:bg-purple-900/30', 
        text: 'text-purple-800 dark:text-purple-400',
        border: 'border-purple-300 dark:border-purple-700'
      };
    case 'gold':
      return { 
        bg: 'bg-yellow-100 dark:bg-yellow-900/30', 
        text: 'text-yellow-800 dark:text-yellow-400',
        border: 'border-yellow-300 dark:border-yellow-700'
      };
    case 'silver':
      return { 
        bg: 'bg-gray-100 dark:bg-gray-800', 
        text: 'text-gray-800 dark:text-gray-300',
        border: 'border-gray-300 dark:border-gray-600'
      };
    default:
      return { 
        bg: 'bg-blue-100 dark:bg-blue-900/30', 
        text: 'text-blue-800 dark:text-blue-400',
        border: 'border-blue-300 dark:border-blue-700'
      };
  }
};

// Interface definitions
interface Communication {
  id: number;
  client_id: number;
  initiated_by: number;
  start_time: string;
  end_time: string | null;
  duration: number | null;
  communication_type: string;
  channel: string;
  direction: string;
  subject: string | null;
  summary: string | null;
  notes: string | null;
  sentiment: string | null;
  tags: string[];
  follow_up_required: boolean;
  next_steps: string | null;
  action_item_count: number;
  attachment_count: number;
  // Additional fields for global view
  client_name?: string;
  client_initials?: string;
  client_tier?: string;
}

interface CommunicationPreference {
  client_id: number;
  preferred_channels: string[];
  preferred_frequency: string;
  preferred_days: string[];
  preferred_time_slots: string[];
  preferred_language: string;
  opt_in_marketing: boolean;
  do_not_contact: boolean;
  last_updated: string;
}

interface ActionItem {
  id: number;
  communication_id: number;
  title: string;
  description: string | null;
  assigned_to: number;
  due_date: string;
  priority: string;
  status: string;
  completed_at: string | null;
  action_type: string;
  deal_value: number | null;
  expected_close_date: string | null;
}

interface Attachment {
  id: number;
  communication_id: number;
  file_name: string;
  file_type: string;
  file_size: number;
  file_url: string;
  description: string | null;
  uploaded_by: number;
  created_at: string;
}

interface Template {
  id: number;
  name: string;
  category: string;
  subject: string;
  content: string;
  variables: string[];
  is_global: boolean;
  created_by: number;
  is_active: boolean;
}

const ClientCommunications: React.FC = () => {
  const params = useParams();
  
  // Extract clientId from URL hash like /clients/:id/communications
  const getClientIdFromUrl = (): number | null => {
    const hash = window.location.hash.replace(/^#/, '');
    const match = hash.match(/\/clients\/(\d+)\/communications/);
    return match ? parseInt(match[1]) : null;
  };
  
  const clientId = getClientIdFromUrl();
  const isGlobalView = !clientId;
  const { toast } = useToast();
  
  // State hooks
  const [selectedCommunication, setSelectedCommunication] = useState<Communication | null>(null);
  const [activeTab, setActiveTab] = useState<string>('details');
  const [selectedCustomer, setSelectedCustomer] = useState<string | null>(null);
  const [showAll, setShowAll] = useState<boolean>(false);
  const [expandedNotes, setExpandedNotes] = useState<Set<number>>(new Set());
  const [filtersExpanded, setFiltersExpanded] = useState<boolean>(false);
  
  const toggleNoteExpansion = (noteId: number) => {
    const newExpanded = new Set(expandedNotes);
    if (newExpanded.has(noteId)) {
      newExpanded.delete(noteId);
    } else {
      newExpanded.add(noteId);
    }
    setExpandedNotes(newExpanded);
  };
  
  const [filters, setFilters] = useState({
    noteType: 'all',
    channel: 'all',
    dateRange: 'all'
  });
  
  // New note dialog state
  const [isNewNoteDialogOpen, setIsNewNoteDialogOpen] = useState(false);
  const [newNoteData, setNewNoteData] = useState({
    communication_type: 'quarterly_review',
    channel: 'phone',
    direction: 'outbound',
    subject: '',
    summary: '',
    notes: '',
    outcome: 'completed',
    duration_minutes: 15,
    location: '',
    tags: [] as string[]
  });
  
  // Query client for cache invalidation
  const queryClient = useQueryClient();

  // Filter functions

  const handleClearFilters = () => {
    setFilters({
      noteType: 'all',
      channel: 'all',
      dateRange: 'all'
    });
  };

  // Queries
  const { data: client, isLoading: isClientLoading } = useQuery({
    queryKey: [`/api/clients/${clientId}`],
    enabled: !isGlobalView && !!clientId,
  });

  const { data: communications, isLoading, refetch: refetchCommunications } = useQuery({
    queryKey: isGlobalView ? ['/api/communications'] : [`/api/communications/${clientId}`],
    enabled: isGlobalView || !!clientId,
  });

  // Filter communications
  const filteredCommunications = React.useMemo(() => {
    if (!communications || !Array.isArray(communications)) return [];
    
    return communications.filter((comm: any) => {
      
      // Note type filter
      const matchesNoteType = filters.noteType === 'all' || 
        comm.communication_type === filters.noteType;
      
      // Channel filter
      const matchesChannel = filters.channel === 'all' || 
        comm.channel === filters.channel;
      
      // Date filter
      const commDate = new Date(comm.start_time);
      const now = new Date();
      const dateFilter = filters.dateRange || 'all';
      const matchesDate = dateFilter === 'all' || 
        (dateFilter === '7days' && (now.getTime() - commDate.getTime()) <= 7 * 24 * 60 * 60 * 1000) ||
        (dateFilter === '30days' && (now.getTime() - commDate.getTime()) <= 30 * 24 * 60 * 60 * 1000) ||
        (dateFilter === '3months' && (now.getTime() - commDate.getTime()) <= 90 * 24 * 60 * 60 * 1000) ||
        (dateFilter === '6months' && (now.getTime() - commDate.getTime()) <= 180 * 24 * 60 * 60 * 1000);
      
      return matchesSearch && matchesNoteType && matchesChannel && matchesDate;
    }).sort((a: any, b: any) => new Date(b.start_time).getTime() - new Date(a.start_time).getTime());
  }, [communications, searchText, filters]);

  // Mutation for creating new note
  const createNoteMutation = useMutation({
    mutationFn: async (noteData: any) => {
      const payload = {
        clientId: clientId,
        initiatedBy: 1, // Current user ID - would be from auth context
        communicationType: noteData.communication_type,
        direction: noteData.direction,
        subject: noteData.subject,
        summary: noteData.summary,
        details: noteData.notes,
        startTime: new Date().toISOString(),
        endTime: new Date(Date.now() + (noteData.duration_minutes * 60 * 1000)).toISOString(),
        duration: noteData.duration_minutes,
        channel: noteData.channel,
        sentiment: 'neutral',
        followupRequired: false,
        hasAttachments: false,
        tags: noteData.tags,
        status: 'completed'
      };
      
      return apiRequest('POST', '/api/communications', payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: isGlobalView ? ['/api/communications'] : [`/api/communications/${clientId}`] 
      });
      setIsNewNoteDialogOpen(false);
      setNewNoteData({
        communication_type: 'quarterly_review',
        channel: 'phone',
        direction: 'outbound',
        subject: '',
        summary: '',
        notes: '',
        outcome: 'completed',
        duration_minutes: 15,
        location: '',
        tags: [] as string[]
      });
      toast({
        title: "Note created",
        description: "Your note has been saved successfully."
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create note. Please try again.",
        variant: "destructive"
      });
    }
  });

  // Main component return
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Client Header - Only show for client-specific view */}
      {!isGlobalView && (
        <div className={`bg-white shadow-sm border-l-4 ${client ? getTierColor(client.tier).border.replace('border-', 'border-l-') : 'border-l-slate-300'}`}>
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
                        className="text-xl font-semibold text-slate-900 hover:text-blue-600 transition-colors cursor-pointer text-left"
                      >
                        {client.fullName}
                      </button>
                      
                      {/* Line 2: Phone Number */}
                      {client.phone && (
                        <div className="mt-1 flex items-center gap-2">
                          <Phone className="h-4 w-4 text-slate-400" />
                          <a 
                            href={`tel:${client.phone}`}
                            className="text-sm text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                            title="Call client"
                          >
                            {client.phone}
                          </a>
                        </div>
                      )}
                      
                      {/* Line 3: Email */}
                      {client.email && (
                        <div className="mt-1 flex items-center gap-2">
                          <Mail className="h-4 w-4 text-slate-400" />
                          <a 
                            href={`mailto:${client.email}`}
                            className="text-sm text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                            title="Send email to client"
                          >
                            {client.email}
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
      )}

      {/* Page Title Band with Navigation */}
      <div className="bg-white border-b border-gray-200 px-1 py-4">
        <div className="flex justify-between items-center px-5 mb-3">
          <h2 className="text-2xl font-bold text-gray-900">Notes</h2>
          {!isGlobalView && (
            <Button 
              size="sm" 
              onClick={() => setIsNewNoteDialogOpen(true)}
              className="h-8 w-8 p-0 rounded-full"
            >
              <Plus className="h-4 w-4" />
            </Button>
          )}
        </div>
        
        {/* Navigation Icons */}
        <div className="grid grid-cols-7 gap-1 px-1">
          <button 
            className="flex items-center justify-center px-1 py-2 rounded-lg hover:bg-gray-100 transition-colors h-12 w-full"
            onClick={() => window.location.hash = `/clients/${clientId}/personal`}
            title="Personal Profile"
          >
            <User className="h-6 w-6 text-gray-600" />
          </button>
          
          <button 
            className="flex items-center justify-center px-1 py-2 rounded-lg hover:bg-gray-100 transition-colors h-12 w-full"
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
            className="flex items-center justify-center px-1 py-2 rounded-lg hover:bg-gray-100 transition-colors h-12 w-full"
            onClick={() => window.location.hash = `/clients/${clientId}/appointments`}
            title="Appointments"
          >
            <Calendar className="h-6 w-6 text-gray-600" />
          </button>
          
          <button 
            className="flex items-center justify-center px-1 py-2 rounded-lg bg-blue-50 border border-blue-200 h-12 w-full"
            title="Notes"
          >
            <FileText className="h-6 w-6 text-blue-600" />
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
            onClick={() => window.location.hash = `/clients/${clientId}/recommendations`}
            title="Investment Ideas"
          >
            <Lightbulb className="h-6 w-6 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4 space-y-4">
        {/* Filter Controls - Collapsible */}
        <Card className="overflow-hidden">
          <div 
            className="p-4 bg-gray-50 border-b cursor-pointer hover:bg-gray-100 transition-colors"
            onClick={() => setFiltersExpanded(!filtersExpanded)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Filter className="h-5 w-5 text-gray-600" />
                <span className="font-medium text-gray-900">Filters</span>
                {(filters.noteType !== 'all' || filters.channel !== 'all' || filters.dateRange !== 'all') && (
                  <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                    Active
                  </span>
                )}
              </div>
              <ChevronDown 
                className={`h-5 w-5 text-gray-400 transition-transform ${filtersExpanded ? 'rotate-180' : ''}`}
              />
            </div>
          </div>
          
          {filtersExpanded && (
            <div className="p-4 space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Note Type</label>
                <Select value={filters.noteType} onValueChange={(value) => setFilters(prev => ({...prev, noteType: value}))}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select note type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="quarterly_review">Quarterly Review</SelectItem>
                    <SelectItem value="portfolio_health_check">Portfolio Health Check</SelectItem>
                    <SelectItem value="risk_assessment">Risk Assessment</SelectItem>
                    <SelectItem value="product_discussion">Product Discussion</SelectItem>
                    <SelectItem value="complaint_resolution">Complaint Resolution</SelectItem>
                    <SelectItem value="general_inquiry">General Inquiry</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Channel</label>
                <Select value={filters.channel} onValueChange={(value) => setFilters(prev => ({...prev, channel: value}))}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select channel" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Channels</SelectItem>
                    <SelectItem value="phone">Phone</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="video">Video</SelectItem>
                    <SelectItem value="in_person">In Person</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Date Range</label>
                <Select value={filters.dateRange} onValueChange={(value) => setFilters(prev => ({...prev, dateRange: value}))}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select date range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Time</SelectItem>
                    <SelectItem value="7days">Last 7 Days</SelectItem>
                    <SelectItem value="30days">Last 30 Days</SelectItem>
                    <SelectItem value="3months">Last 3 Months</SelectItem>
                    <SelectItem value="6months">Last 6 Months</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {(filters.noteType !== 'all' || filters.channel !== 'all' || filters.dateRange !== 'all') && (
                <div className="pt-2">
                  <Button onClick={handleClearFilters} variant="outline" className="w-full">
                    Clear All Filters
                  </Button>
                </div>
              )}
            </div>
          )}
        </Card>

        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="p-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-5 w-48" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              </Card>
            ))}
          </div>
        ) : filteredCommunications && filteredCommunications.length > 0 ? (
          <div className="space-y-3">
            {filteredCommunications.map((communication: Communication) => {
              const isExpanded = expandedNotes.has(communication.id);
              const communicationType = communication.communication_type?.replace('_', ' ')?.toUpperCase() || 'NOTE';
              const channel = communication.channel?.toUpperCase() || 'UNKNOWN';
              const date = new Date(communication.start_time).toLocaleDateString();
              
              return (
                <Card key={communication.id} className="overflow-hidden">
                  {/* Summary Band - Always Visible */}
                  <div 
                    className="p-4 bg-gray-50 border-b cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => toggleNoteExpansion(communication.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                            {communicationType}
                          </span>
                          <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded">
                            {channel}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600">
                          {date}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {communication.follow_up_required && (
                          <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded">
                            Follow-up Required
                          </span>
                        )}
                        <ChevronDown 
                          className={`h-5 w-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                        />
                      </div>
                    </div>
                    
                    {/* Show subject/title in summary if available */}
                    {communication.subject && (
                      <div className="mt-2">
                        <p className="text-sm font-medium text-gray-900 line-clamp-1">
                          {communication.subject}
                        </p>
                      </div>
                    )}
                  </div>
                  
                  {/* Expandable Content */}
                  {isExpanded && (
                    <div className="p-4 space-y-4">
                      {/* Summary */}
                      {communication.summary && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-900 mb-2">Summary</h4>
                          <p className="text-sm text-gray-700">
                            {communication.summary}
                          </p>
                        </div>
                      )}
                      
                      {/* Notes/Details */}
                      {communication.notes && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-900 mb-2">Notes</h4>
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <p className="text-sm text-gray-700">
                              {communication.notes}
                            </p>
                          </div>
                        </div>
                      )}
                      
                      {/* Tags */}
                      {communication.tags && communication.tags.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-900 mb-2">Tags</h4>
                          <div className="flex flex-wrap gap-1">
                            {communication.tags.map((tag, index) => (
                              <span key={index} className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* Additional Details */}
                      <div className="pt-2 border-t border-gray-100">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-500">Direction:</span>
                            <span className="ml-2 text-gray-900">{communication.direction}</span>
                          </div>
                          {communication.duration && (
                            <div>
                              <span className="text-gray-500">Duration:</span>
                              <span className="ml-2 text-gray-900">{communication.duration} min</span>
                            </div>
                          )}
                          {communication.sentiment && (
                            <div>
                              <span className="text-gray-500">Sentiment:</span>
                              <span className="ml-2 text-gray-900">{communication.sentiment}</span>
                            </div>
                          )}
                          {communication.action_item_count > 0 && (
                            <div>
                              <span className="text-gray-500">Action Items:</span>
                              <span className="ml-2 text-gray-900">{communication.action_item_count}</span>
                            </div>
                          )}
                        </div>
                        
                        {communication.next_steps && (
                          <div className="mt-3">
                            <h4 className="text-sm font-medium text-gray-900 mb-1">Next Steps</h4>
                            <p className="text-sm text-gray-700">
                              {communication.next_steps}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        ) : (
          <Card className="p-8 text-center">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No notes found</h3>
            <p className="text-gray-500">
              {clientId ? "No communication records found for this client." : "No communication records found."}
            </p>
          </Card>
        )}
      </div>

      {/* New Note Dialog */}
      <Dialog open={isNewNoteDialogOpen} onOpenChange={setIsNewNoteDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Add New Note</DialogTitle>
            <DialogDescription>
              Record a new communication or note for this client.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={(e) => {
            e.preventDefault();
            createNoteMutation.mutate(newNoteData);
          }}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="communication_type">Type</Label>
                  <Select 
                    value={newNoteData.communication_type} 
                    onValueChange={(value) => setNewNoteData(prev => ({ ...prev, communication_type: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="quarterly_review">Quarterly Portfolio Review</SelectItem>
                      <SelectItem value="portfolio_diagnosis">Portfolio Health Check</SelectItem>
                      <SelectItem value="risk_assessment">Risk Profile Assessment</SelectItem>
                      <SelectItem value="goal_planning">Financial Goal Planning</SelectItem>
                      <SelectItem value="product_discussion">Product Discussion</SelectItem>
                      <SelectItem value="investment_advisory">Investment Advisory Session</SelectItem>
                      <SelectItem value="market_update">Market Update Discussion</SelectItem>
                      <SelectItem value="onboarding">Client Onboarding</SelectItem>
                      <SelectItem value="complaint_resolution">Complaint Resolution</SelectItem>
                      <SelectItem value="general_note">General Note</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="channel">Channel</Label>
                  <Select 
                    value={newNoteData.channel} 
                    onValueChange={(value) => setNewNoteData(prev => ({ ...prev, channel: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select channel" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="phone">Phone</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="in_person">In Person</SelectItem>
                      <SelectItem value="video_call">Video Call</SelectItem>
                      <SelectItem value="whatsapp">WhatsApp</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="direction">Direction</Label>
                  <Select 
                    value={newNoteData.direction} 
                    onValueChange={(value) => setNewNoteData(prev => ({ ...prev, direction: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select direction" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="outbound">Outbound</SelectItem>
                      <SelectItem value="inbound">Inbound</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="duration_minutes">Duration (minutes)</Label>
                  <Input
                    id="duration_minutes"
                    type="number"
                    value={newNoteData.duration_minutes}
                    onChange={(e) => setNewNoteData(prev => ({ ...prev, duration_minutes: parseInt(e.target.value) || 15 }))}
                    min="1"
                    max="300"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  value={newNoteData.subject}
                  onChange={(e) => setNewNoteData(prev => ({ ...prev, subject: e.target.value }))}
                  placeholder="Brief subject or title"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="summary">Summary</Label>
                <Textarea
                  id="summary"
                  value={newNoteData.summary}
                  onChange={(e) => setNewNoteData(prev => ({ ...prev, summary: e.target.value }))}
                  placeholder="Brief summary of the communication"
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Detailed Notes</Label>
                <Textarea
                  id="notes"
                  value={newNoteData.notes}
                  onChange={(e) => setNewNoteData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Detailed notes and observations"
                  rows={4}
                  required
                />
              </div>

              {newNoteData.channel === 'in_person' && (
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={newNoteData.location || ''}
                    onChange={(e) => setNewNoteData(prev => ({ ...prev, location: e.target.value }))}
                    placeholder="Meeting location"
                  />
                </div>
              )}
            </div>
            
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setIsNewNoteDialogOpen(false)}
                disabled={createNoteMutation.isPending}
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                disabled={createNoteMutation.isPending || !newNoteData.notes.trim()}
              >
                {createNoteMutation.isPending ? "Saving..." : "Save Note"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ClientCommunications;