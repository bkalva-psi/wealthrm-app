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
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
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
  const [searchText, setSearchText] = useState<string>('');
  const [dateRangeFilter, setDateRangeFilter] = useState<string>('all');
  const [selectedCustomer, setSelectedCustomer] = useState<string | null>(null);
  const [showAll, setShowAll] = useState<boolean>(false);
  const [expandedNotes, setExpandedNotes] = useState<Set<number>>(new Set());

  // Queries
  const { data: client, isLoading: isClientLoading } = useQuery({
    queryKey: [`/api/clients/${clientId}`],
    enabled: !isGlobalView && !!clientId,
  });

  const { data: communications, isLoading, refetch: refetchCommunications } = useQuery({
    queryKey: isGlobalView ? ['/api/communications'] : [`/api/communications/${clientId}`],
    enabled: isGlobalView || !!clientId,
  });

  const toggleNoteExpansion = (id: number) => {
    setExpandedNotes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const handleClearFilters = () => {
    setSearchText('');
    setSelectedCustomer(null);
    setDateRangeFilter('all');
  };

  // Main component return
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Client Header - Only show for client-specific view */}
      {!isGlobalView && (
        <div className={`bg-white border rounded-lg p-3 sm:p-4 mb-4 sm:mb-6 shadow-sm border-l-4 ${client ? getTierColor(client.tier).border.replace('border-', 'border-l-') : 'border-l-slate-300'}`}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
            {/* Left side - Back arrow and client name */}
            <div className="flex items-center min-w-0 flex-1">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => window.location.hash = `/clients`}
                className="mr-2 sm:mr-4 p-1 sm:p-2 flex-shrink-0"
              >
                <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
              
              <div className="min-w-0 flex-1">
                {isClientLoading ? (
                  <div className="space-y-1">
                    <Skeleton className="h-5 sm:h-6 w-24 sm:w-32" />
                    <Skeleton className="h-3 sm:h-4 w-20 sm:w-24" />
                    <Skeleton className="h-3 sm:h-4 w-20 sm:w-24" />
                    <Skeleton className="h-3 sm:h-4 w-20 sm:w-24" />
                  </div>
                ) : client ? (
                  <>
                    {/* Line 1: Client Name */}
                    <button 
                      onClick={() => window.location.hash = `/clients/${clientId}/personal`}
                      className="text-left truncate hover:text-blue-600 transition-colors"
                    >
                      <h1 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100 truncate">
                        {client.fullName}
                      </h1>
                    </button>
                    
                    {/* Line 2: Client Tier */}
                    <div className="mt-1">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getTierColor(client.tier).bg} ${getTierColor(client.tier).text}`}>
                        {client.tier}
                      </span>
                    </div>

                    {/* Line 3: Phone */}
                    {client.phone && (
                      <div className="mt-1">
                        <a 
                          href={`tel:${client.phone}`}
                          className="text-sm text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center"
                        >
                          <Phone className="h-3 w-3 mr-1" />
                          {client.phone}
                        </a>
                      </div>
                    )}

                    {/* Line 4: Email */}
                    {client.email && (
                      <div className="mt-1">
                        <a 
                          href={`mailto:${client.email}`}
                          className="text-sm text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center"
                        >
                          <Mail className="h-3 w-3 mr-1" />
                          {client.email}
                        </a>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-gray-500">Client not found</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Page Title Band with Navigation */}
      <div className="bg-white border-b border-gray-200 px-1 py-4">
        <div className="flex justify-between items-center px-5 mb-3">
          <h2 className="text-2xl font-bold text-gray-900">Notes</h2>
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
        ) : communications && communications.length > 0 ? (
          <div className="space-y-4">
            {communications.map((communication: Communication) => (
              <Card key={communication.id} className="p-4 hover:shadow-md transition-shadow">
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">
                        {communication.subject || `${communication.communication_type.replace('_', ' ')} - ${communication.channel}`}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {communication.channel} • {communication.direction}
                      </p>
                    </div>
                    <div className="text-sm text-gray-500">
                      {new Date(communication.start_time).toLocaleDateString()}
                    </div>
                  </div>
                  
                  {communication.summary && (
                    <p className="text-sm text-gray-700 line-clamp-2">
                      {communication.summary}
                    </p>
                  )}
                  
                  {communication.notes && (
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-sm text-gray-700">
                        {communication.notes}
                      </p>
                    </div>
                  )}
                  
                  {communication.tags && communication.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {communication.tags.map((tag, index) => (
                        <span key={index} className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </Card>
            ))}
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
    </div>
  );
};

export default ClientCommunications;