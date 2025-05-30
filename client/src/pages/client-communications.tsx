import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { ArrowLeft, MessageCircle, Phone, Mail, Video, FileText, Clock, Paperclip, Calendar, CheckCircle2, AlertCircle, Filter, BarChart4, Wallet, Target, User, ArrowUpDown, Users, CheckSquare, MessageSquare, Plus, Search, ChevronDown, ChevronUp } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { apiRequest } from '@/lib/queryClient';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getInitials, getTierColor } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import EmptyState from '@/components/empty-state';
import { generateAvatar, svgToDataURL } from '@/lib/avatarGenerator';

// Type definitions for communications data
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

// Component for displaying individual communication items
const CommunicationItem: React.FC<{ 
  communication: Communication, 
  isSelected: boolean, 
  onClick: () => void,
  isGlobalView?: boolean
}> = ({ communication, isSelected, onClick, isGlobalView = false }) => {
  const channelIcon = () => {
    switch (communication.channel) {
      case 'phone':
        return <Phone className="h-4 w-4" />;
      case 'email':
        return <Mail className="h-4 w-4" />;
      case 'in_person':
        return <MessageCircle className="h-4 w-4" />;
      case 'video':
        return <Video className="h-4 w-4" />;
      default:
        return <MessageCircle className="h-4 w-4" />;
    }
  };

  return (
    <Card 
      className={`mb-3 cursor-pointer hover:bg-muted/50 transition-colors ${isSelected ? 'border-primary bg-muted/50' : ''}`} 
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2">
            <div className="bg-primary/10 p-2 rounded-full">
              {channelIcon()}
            </div>
            <div>
              {isGlobalView && communication.client_name && (
                <div className="flex items-center gap-2 mb-1">
                  <Avatar className="h-6 w-6">
                    <AvatarImage 
                      src={svgToDataURL(generateAvatar(communication.client_initials || getInitials(communication.client_name)))} 
                      alt={communication.client_name} 
                    />
                    <AvatarFallback>{communication.client_initials || getInitials(communication.client_name)}</AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium text-slate-700">{communication.client_name}</span>
                  {communication.client_tier && (
                    <div className={`w-2 h-2 rounded-full ${getTierColor(communication.client_tier).bg}`}></div>
                  )}
                </div>
              )}
              <h4 className="font-medium">
                {communication.subject || 
                 `${communication.communication_type.replace('_', ' ')} (${format(new Date(communication.start_time), 'dd MMM yyyy')})`}
              </h4>
              <p className="text-sm text-muted-foreground">
                {format(new Date(communication.start_time), 'dd MMM yyyy, h:mm a')}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {communication.follow_up_required && (
              <Badge variant="outline" className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400">
                Follow Up
              </Badge>
            )}
            {communication.action_item_count > 0 && (
              <Badge variant="outline" className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400">
                {communication.action_item_count} {communication.action_item_count === 1 ? 'Action' : 'Actions'}
              </Badge>
            )}
          </div>
        </div>
        
        {communication.summary && (
          <p className="mt-2 text-sm line-clamp-2">{communication.summary}</p>
        )}
        
        <div className="mt-2 flex items-center gap-2">
          {communication.tags && communication.tags.length > 0 && communication.tags.slice(0, 3).map((tag, i) => (
            <Badge key={i} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
          {communication.tags && communication.tags.length > 3 && (
            <Badge variant="secondary" className="text-xs">
              +{communication.tags.length - 3} more
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

// Component for displaying action items
const ActionItems: React.FC<{ communicationId: number }> = ({ communicationId }) => {
  const { data: actionItems, isLoading } = useQuery({
    queryKey: [`/api/communications/${communicationId}/action-items`],
    enabled: !!communicationId
  });
  
  const queryClient = useQueryClient();
  
  const updateActionItemMutation = useMutation({
    mutationFn: (data: { id: number, status: string }) => 
      apiRequest(`/api/action-items/${data.id}`, {
        method: 'PUT',
        body: JSON.stringify({ 
          status: data.status,
          completedAt: data.status === 'completed' ? new Date().toISOString() : null
        })
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/communications/${communicationId}/action-items`] });
      toast({
        title: "Action item updated",
        description: "The action item status has been updated successfully."
      });
    }
  });
  
  const handleStatusChange = (id: number, status: string) => {
    updateActionItemMutation.mutate({ id, status });
  };
  
  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    );
  }
  
  if (!actionItems || actionItems.length === 0) {
    return (
      <EmptyState 
        icon={<CheckCircle2 className="h-10 w-10 text-muted-foreground" />}
        title="No action items"
        description="There are no action items for this communication."
      />
    );
  }
  
  return (
    <div className="space-y-3">
      {actionItems.map((item: ActionItem) => (
        <Card key={item.id}>
          <CardContent className="p-4">
            <div className="flex justify-between">
              <div>
                <h4 className="font-medium">{item.title}</h4>
                {item.description && (
                  <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                )}
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant={item.status === 'completed' ? 'secondary' : 'outline'}>
                    {item.status}
                  </Badge>
                  <Badge variant="outline" className={
                    item.priority === 'high' ? 'text-red-500 border-red-200 bg-red-50 dark:bg-red-950/30' :
                    item.priority === 'medium' ? 'text-yellow-500 border-yellow-200 bg-yellow-50 dark:bg-yellow-950/30' :
                    'text-green-500 border-green-200 bg-green-50 dark:bg-green-950/30'
                  }>
                    {item.priority}
                  </Badge>
                  <span className="text-xs flex items-center gap-1">
                    <Clock className="h-3 w-3" /> 
                    Due: {format(new Date(item.due_date), 'dd MMM yyyy')}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {item.status !== 'completed' ? (
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleStatusChange(item.id, 'completed')}
                  >
                    Mark Complete
                  </Button>
                ) : (
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleStatusChange(item.id, 'pending')}
                  >
                    Reopen
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

// Component for displaying attachments
const Attachments: React.FC<{ communicationId: number }> = ({ communicationId }) => {
  const { data: attachments, isLoading } = useQuery({
    queryKey: [`/api/communications/${communicationId}/attachments`],
    enabled: !!communicationId
  });
  
  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    );
  }
  
  if (!attachments || attachments.length === 0) {
    return (
      <EmptyState 
        icon={<Paperclip className="h-10 w-10 text-muted-foreground" />}
        title="No attachments"
        description="There are no attachments for this communication."
      />
    );
  }
  
  return (
    <div className="space-y-3">
      {attachments.map((attachment: Attachment) => (
        <Card key={attachment.id}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 p-2 rounded-full">
                  <FileText className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="font-medium">{attachment.file_name}</h4>
                  <p className="text-sm text-muted-foreground">
                    {(attachment.file_size / 1024 / 1024).toFixed(2)} MB • {attachment.file_type}
                  </p>
                </div>
              </div>
              <Button variant="outline" asChild>
                <a href={attachment.file_url} target="_blank" rel="noopener noreferrer">
                  Download
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

// Component for displaying client preferences
const ClientPreferences: React.FC<{ clientId: number }> = ({ clientId }) => {
  const { data: preferences, isLoading } = useQuery({
    queryKey: [`/api/communications/preferences/${clientId}`],
    enabled: !!clientId
  });
  
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<CommunicationPreference>>({});
  
  useEffect(() => {
    if (preferences) {
      setFormData(preferences);
    }
  }, [preferences]);
  
  const queryClient = useQueryClient();
  
  const updatePreferencesMutation = useMutation({
    mutationFn: (data: Partial<CommunicationPreference>) => 
      apiRequest(`/api/communications/preferences/${clientId}`, {
        method: 'PUT',
        body: JSON.stringify(data)
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/communications/preferences/${clientId}`] });
      setIsEditing(false);
      toast({
        title: "Preferences updated",
        description: "Communication preferences have been updated successfully."
      });
    }
  });
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updatePreferencesMutation.mutate(formData);
  };
  
  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };
  
  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-6 w-40 mt-4" />
        <Skeleton className="h-20 w-full" />
      </div>
    );
  }
  
  if (!preferences) {
    return (
      <EmptyState 
        icon={<AlertCircle className="h-10 w-10 text-muted-foreground" />}
        title="No preferences found"
        description="Communication preferences have not been set for this client."
        action={
          <Button onClick={() => setIsEditing(true)}>
            Set Preferences
          </Button>
        }
      />
    );
  }
  
  if (isEditing) {
    return (
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div>
            <Label>Preferred Communication Channels</Label>
            <div className="grid grid-cols-2 gap-2 mt-2 sm:grid-cols-4">
              {['email', 'phone', 'in_person', 'video'].map(channel => (
                <Button
                  key={channel}
                  type="button"
                  variant={formData.preferred_channels?.includes(channel) ? "default" : "outline"}
                  onClick={() => {
                    const channels = formData.preferred_channels || [];
                    if (channels.includes(channel)) {
                      handleChange('preferred_channels', channels.filter(c => c !== channel));
                    } else {
                      handleChange('preferred_channels', [...channels, channel]);
                    }
                  }}
                  className="justify-start"
                >
                  {channel === 'email' && <Mail className="h-4 w-4 mr-2" />}
                  {channel === 'phone' && <Phone className="h-4 w-4 mr-2" />}
                  {channel === 'in_person' && <MessageCircle className="h-4 w-4 mr-2" />}
                  {channel === 'video' && <Video className="h-4 w-4 mr-2" />}
                  {channel.replace('_', ' ')}
                </Button>
              ))}
            </div>
          </div>
          
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="frequency">Preferred Frequency</Label>
              <Select 
                value={formData.preferred_frequency} 
                onValueChange={(value) => handleChange('preferred_frequency', value)}
              >
                <SelectTrigger id="frequency" className="mt-2">
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="bi-weekly">Bi-Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="quarterly">Quarterly</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="language">Preferred Language</Label>
              <Select 
                value={formData.preferred_language} 
                onValueChange={(value) => handleChange('preferred_language', value)}
              >
                <SelectTrigger id="language" className="mt-2">
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="English">English</SelectItem>
                  <SelectItem value="Hindi">Hindi</SelectItem>
                  <SelectItem value="Tamil">Tamil</SelectItem>
                  <SelectItem value="Telugu">Telugu</SelectItem>
                  <SelectItem value="Kannada">Kannada</SelectItem>
                  <SelectItem value="Malayalam">Malayalam</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div>
            <Label>Preferred Days</Label>
            <div className="grid grid-cols-3 gap-2 mt-2 sm:grid-cols-7">
              {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                <Button
                  key={day}
                  type="button"
                  variant={formData.preferred_days?.includes(day) ? "default" : "outline"}
                  onClick={() => {
                    const days = formData.preferred_days || [];
                    if (days.includes(day)) {
                      handleChange('preferred_days', days.filter(d => d !== day));
                    } else {
                      handleChange('preferred_days', [...days, day]);
                    }
                  }}
                  size="sm"
                >
                  {day.substring(0, 3)}
                </Button>
              ))}
            </div>
          </div>
          
          <div>
            <Label>Preferred Time Slots</Label>
            <div className="grid grid-cols-2 gap-2 mt-2 sm:grid-cols-4">
              {['Morning', 'Afternoon', 'Evening', 'Night'].map(slot => (
                <Button
                  key={slot}
                  type="button"
                  variant={formData.preferred_time_slots?.includes(slot) ? "default" : "outline"}
                  onClick={() => {
                    const slots = formData.preferred_time_slots || [];
                    if (slots.includes(slot)) {
                      handleChange('preferred_time_slots', slots.filter(s => s !== slot));
                    } else {
                      handleChange('preferred_time_slots', [...slots, slot]);
                    }
                  }}
                >
                  {slot}
                </Button>
              ))}
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center space-x-2">
              <input 
                type="checkbox" 
                id="marketing" 
                className="form-checkbox h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" 
                checked={!!formData.opt_in_marketing}
                onChange={(e) => handleChange('opt_in_marketing', e.target.checked)}
              />
              <Label htmlFor="marketing" className="cursor-pointer">Opt-in Marketing</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <input 
                type="checkbox" 
                id="doNotContact" 
                className="form-checkbox h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" 
                checked={!!formData.do_not_contact}
                onChange={(e) => handleChange('do_not_contact', e.target.checked)}
              />
              <Label htmlFor="doNotContact" className="cursor-pointer">Do Not Contact</Label>
            </div>
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={updatePreferencesMutation.isPending}>
              {updatePreferencesMutation.isPending ? "Saving..." : "Save Preferences"}
            </Button>
          </div>
        </div>
      </form>
    );
  }
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle>Communication Preferences</CardTitle>
          <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
            Edit
          </Button>
        </div>
        <CardDescription>
          Last updated: {format(new Date(preferences.last_updated), 'dd MMM yyyy')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-medium mb-1">Preferred Channels</h4>
            <div className="flex flex-wrap gap-2">
              {preferences.preferred_channels && preferences.preferred_channels.map((channel: string) => (
                <Badge key={channel} variant="outline">
                  {channel === 'email' && <Mail className="h-3 w-3 mr-1" />}
                  {channel === 'phone' && <Phone className="h-3 w-3 mr-1" />}
                  {channel === 'in_person' && <MessageCircle className="h-3 w-3 mr-1" />}
                  {channel === 'video' && <Video className="h-3 w-3 mr-1" />}
                  {channel.replace('_', ' ')}
                </Badge>
              ))}
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-medium mb-1">Frequency</h4>
              <p className="text-sm">{preferences.preferred_frequency.replace('-', ' ')}</p>
            </div>
            
            <div>
              <h4 className="text-sm font-medium mb-1">Language</h4>
              <p className="text-sm">{preferences.preferred_language}</p>
            </div>
          </div>
          
          <div>
            <h4 className="text-sm font-medium mb-1">Preferred Days</h4>
            <div className="flex flex-wrap gap-2">
              {preferences.preferred_days && preferences.preferred_days.map((day: string) => (
                <Badge key={day} variant="outline">
                  {day}
                </Badge>
              ))}
            </div>
          </div>
          
          <div>
            <h4 className="text-sm font-medium mb-1">Preferred Time Slots</h4>
            <div className="flex flex-wrap gap-2">
              {preferences.preferred_time_slots && preferences.preferred_time_slots.map((slot: string) => (
                <Badge key={slot} variant="outline">
                  {slot}
                </Badge>
              ))}
            </div>
          </div>
          
          <div className="flex flex-wrap gap-4">
            <Badge 
              variant={preferences.opt_in_marketing ? "default" : "destructive"}
              className={preferences.opt_in_marketing ? "" : "opacity-75"}
            >
              {preferences.opt_in_marketing ? "Marketing: Opted In" : "Marketing: Opted Out"}
            </Badge>
            
            {preferences.do_not_contact && (
              <Badge variant="destructive">
                Do Not Contact
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// New Communication Dialog Component
const NewCommunicationDialog: React.FC<{ 
  clientId: number,
  onSuccess: () => void
}> = ({ clientId, onSuccess }) => {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    clientId,
    initiatedBy: 1, // Assuming current user ID is 1
    startTime: new Date().toISOString().substring(0, 16),
    communicationType: '',
    channel: '',
    direction: 'outbound',
    subject: '',
    summary: '',
    notes: '',
    sentiment: 'neutral',
    tags: [] as string[],
    followUpRequired: false
  });
  
  const queryClient = useQueryClient();
  
  const createCommunicationMutation = useMutation({
    mutationFn: (data: any) => 
      apiRequest('/api/communications', {
        method: 'POST',
        body: JSON.stringify(data)
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/communications/${clientId}`] });
      setOpen(false);
      onSuccess();
      toast({
        title: "Communication added",
        description: "The communication has been added successfully."
      });
    }
  });
  
  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createCommunicationMutation.mutate(formData);
  };
  
  const { data: templates } = useQuery({
    queryKey: ['/api/communication-templates'],
    enabled: open
  });
  
  const handleSelectTemplate = (template: Template) => {
    setFormData(prev => ({
      ...prev,
      subject: template.subject,
      summary: template.content.replace(/\{\{.*?\}\}/g, '___')
    }));
  };
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <MessageCircle className="h-4 w-4 mr-2" />
          New Communication
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Log New Communication</DialogTitle>
          <DialogDescription>
            Record details about your communication with the client.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="communicationType">Type</Label>
                <Select 
                  value={formData.communicationType} 
                  onValueChange={(value) => handleChange('communicationType', value)}
                  required
                >
                  <SelectTrigger id="communicationType">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="portfolio_review">Portfolio Review</SelectItem>
                    <SelectItem value="market_update">Market Update</SelectItem>
                    <SelectItem value="investment_advice">Investment Advice</SelectItem>
                    <SelectItem value="onboarding">Onboarding</SelectItem>
                    <SelectItem value="complaint_handling">Complaint Handling</SelectItem>
                    <SelectItem value="relationship_building">Relationship Building</SelectItem>
                    <SelectItem value="service_request">Service Request</SelectItem>
                    <SelectItem value="product_information">Product Information</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="channel">Channel</Label>
                <Select 
                  value={formData.channel} 
                  onValueChange={(value) => handleChange('channel', value)}
                  required
                >
                  <SelectTrigger id="channel">
                    <SelectValue placeholder="Select channel" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="phone">Phone</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="in_person">In Person</SelectItem>
                    <SelectItem value="video">Video Call</SelectItem>
                    <SelectItem value="chat">Chat</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="direction">Direction</Label>
                <Select 
                  value={formData.direction} 
                  onValueChange={(value) => handleChange('direction', value)}
                >
                  <SelectTrigger id="direction">
                    <SelectValue placeholder="Select direction" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="inbound">Inbound</SelectItem>
                    <SelectItem value="outbound">Outbound</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="startTime">Date & Time</Label>
                <Input 
                  id="startTime" 
                  type="datetime-local" 
                  value={formData.startTime}
                  onChange={(e) => handleChange('startTime', e.target.value)}
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label htmlFor="subject">Subject</Label>
                {templates && templates.length > 0 && (
                  <Select 
                    onValueChange={(value) => {
                      const template = templates.find((t: Template) => t.id.toString() === value);
                      if (template) handleSelectTemplate(template);
                    }}
                  >
                    <SelectTrigger id="template" className="w-[180px]">
                      <SelectValue placeholder="Use Template" />
                    </SelectTrigger>
                    <SelectContent>
                      {templates.map((template: Template) => (
                        <SelectItem key={template.id} value={template.id.toString()}>
                          {template.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
              <Input 
                id="subject" 
                value={formData.subject}
                onChange={(e) => handleChange('subject', e.target.value)}
                placeholder="Enter subject"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="summary">Summary</Label>
              <Textarea 
                id="summary" 
                value={formData.summary}
                onChange={(e) => handleChange('summary', e.target.value)}
                placeholder="Enter a summary of the communication"
                rows={3}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea 
                id="notes" 
                value={formData.notes}
                onChange={(e) => handleChange('notes', e.target.value)}
                placeholder="Enter detailed notes"
                rows={3}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="tags">Tags (comma separated)</Label>
              <Input 
                id="tags" 
                value={formData.tags.join(', ')}
                onChange={(e) => handleChange('tags', e.target.value.split(',').map(tag => tag.trim()).filter(Boolean))}
                placeholder="Enter tags"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <input 
                type="checkbox" 
                id="followUpRequired" 
                className="form-checkbox h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" 
                checked={formData.followUpRequired}
                onChange={(e) => handleChange('followUpRequired', e.target.checked)}
              />
              <Label htmlFor="followUpRequired" className="cursor-pointer">Follow Up Required</Label>
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createCommunicationMutation.isPending}>
              {createCommunicationMutation.isPending ? "Saving..." : "Save Communication"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

// Main ClientCommunications component
const ClientCommunications: React.FC = () => {
  const params = useParams();
  
  // Always declare state hooks first
  const [selectedCommunication, setSelectedCommunication] = useState<Communication | null>(null);
  const [activeTab, setActiveTab] = useState<string>('details');
  const [filterType, setFilterType] = useState<string | null>(null);
  const [filterChannel, setFilterChannel] = useState<string | null>(null);
  const [showAll, setShowAll] = useState<boolean>(false);
  const [expandedNotes, setExpandedNotes] = useState<Set<number>>(new Set());

  // ActionItemsDisplay component
  const ActionItemsDisplay = ({ communicationId }: { communicationId: number }) => {
    const { data: actionItems, isLoading } = useQuery({
      queryKey: [`/api/communications/${communicationId}/action-items`],
      enabled: !!communicationId,
    });

    if (isLoading) return <div className="text-sm text-gray-500">Loading action items...</div>;
    if (!actionItems || actionItems.length === 0) return null;

    // Filter out blank/empty action items - only show items with actual content
    const validActionItems = actionItems.filter((item: any) => 
      item && 
      item.title && 
      item.title.trim() !== '' && 
      item.title !== 'undefined' &&
      item.title !== 'null'
    );

    if (validActionItems.length === 0) return null;

    return (
      <div>
        <h5 className="text-sm font-medium text-gray-700 mb-2">Action Items</h5>
        <div className="space-y-2">
          {validActionItems.map((item: ActionItem) => (
            <div key={item.id} className="p-3 bg-white border border-gray-200 rounded-lg">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h6 className="text-sm font-medium text-gray-900">{item.title}</h6>
                  {item.description && (
                    <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                  )}
                  <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                    <span>Due: {(() => {
                      try {
                        return item.due_date ? format(new Date(item.due_date), 'MMM dd, yyyy') : 'No due date';
                      } catch (error) {
                        return 'Invalid date';
                      }
                    })()}</span>
                    <span className={`px-2 py-0.5 rounded-full ${
                      item.priority === 'high' ? 'bg-red-100 text-red-800' :
                      item.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {item.priority}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full ${
                      item.status === 'completed' ? 'bg-green-100 text-green-800' :
                      item.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {item.status ? item.status.replace('_', ' ') : 'pending'}
                    </span>
                  </div>
                </div>
                {item.status === 'completed' && (
                  <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // AttachmentsDisplay component
  const AttachmentsDisplay = ({ communicationId }: { communicationId: number }) => {
    const { data: attachments, isLoading } = useQuery({
      queryKey: ['/api/communications', communicationId, 'attachments'],
      enabled: !!communicationId,
    });

    if (isLoading) return <div className="text-sm text-gray-500">Loading attachments...</div>;
    if (!attachments || attachments.length === 0) return null;

    return (
      <div>
        <h5 className="text-sm font-medium text-gray-700 mb-2">Attachments</h5>
        <div className="space-y-2">
          {attachments.map((attachment: Attachment) => (
            <div key={attachment.id} className="p-3 bg-white border border-gray-200 rounded-lg">
              <div className="flex items-center gap-3">
                <Paperclip className="h-4 w-4 text-gray-400 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{attachment.file_name}</p>
                  <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                    <span>{attachment.file_type.toUpperCase()}</span>
                    <span>{(attachment.file_size / 1024).toFixed(1)} KB</span>
                    <span>{format(new Date(attachment.created_at), 'MMM dd, yyyy')}</span>
                  </div>
                  {attachment.description && (
                    <p className="text-sm text-gray-600 mt-1">{attachment.description}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };
  
  // Determine if we're viewing all communications or client-specific communications
  const currentPath = window.location.hash.replace('#', '');
  const isGlobalView = currentPath === '/communications';
  
  // Extract client ID only if we're not in global view
  const id = isGlobalView ? null : (params.id || window.location.hash.split('/')[2]);
  const clientId = id ? parseInt(id as string) : null;
  
  // Always call useQuery hooks, but control them with enabled
  const { data: client, isLoading: isClientLoading } = useQuery({
    queryKey: [`/api/clients/${clientId}`],
    enabled: !!clientId && !isGlobalView && !isNaN(clientId!)
  });

  // Query to fetch communications - either all or client-specific
  const { 
    data: communications, 
    isLoading,
    refetch: refetchCommunications
  } = useQuery({
    queryKey: isGlobalView ? ['/api/communications'] : [`/api/communications/${clientId}`],
    enabled: isGlobalView || (!!clientId && !isNaN(clientId!))
  });
  
  // Query to fetch client data - removed duplicate declaration
  
  // Reset selected communication when clientId changes
  useEffect(() => {
    setSelectedCommunication(null);
  }, [clientId]);
  
  // Select first communication when data loads if none selected
  useEffect(() => {
    if (communications && communications.length > 0 && !selectedCommunication) {
      setSelectedCommunication(communications[0]);
    }
  }, [communications, selectedCommunication]);
  
  // Filter communications based on selected filters
  const filteredCommunications = React.useMemo(() => {
    if (!communications) return [];
    
    return communications.filter((comm: Communication) => {
      if (filterType && filterType !== "all_types" && comm.communication_type !== filterType) return false;
      if (filterChannel && filterChannel !== "all_channels" && comm.channel !== filterChannel) return false;
      return true;
    });
  }, [communications, filterType, filterChannel]);

  // Apply show more/less logic
  const displayedCommunications = React.useMemo(() => {
    if (!filteredCommunications) return [];
    const limit = showAll ? filteredCommunications.length : 5;
    return filteredCommunications.slice(0, limit);
  }, [filteredCommunications, showAll]);
  
  const handleClearFilters = () => {
    setFilterType(null);
    setFilterChannel(null);
  };

  const toggleNoteExpansion = (noteId: number) => {
    const newExpanded = new Set(expandedNotes);
    if (newExpanded.has(noteId)) {
      newExpanded.delete(noteId);
    } else {
      newExpanded.add(noteId);
    }
    setExpandedNotes(newExpanded);
  };
  
  // Don't show error for global view when there's no client ID
  if (!isGlobalView && (isNaN(clientId) || !clientId)) {
    return (
      <div className="p-4">
        <p>Invalid client ID</p>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Set page title */}
      {React.useEffect(() => {
        document.title = isGlobalView ? 'All Communications | Wealth RM' : `${client?.fullName || 'Client'} - Communications | Wealth RM`;
      }, [client?.fullName, isGlobalView])}

      {/* Harmonized header band - Mobile Optimized - Only show for client-specific view */}
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
                </div>
              ) : client ? (
                <>
                  <button 
                    onClick={() => window.location.hash = `/clients/${clientId}/personal`}
                    className="text-lg sm:text-xl font-semibold text-slate-900 hover:text-blue-600 transition-colors cursor-pointer truncate block w-full text-left"
                  >
                    {client.fullName}
                  </button>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-xs sm:text-sm text-slate-600 mt-1">
                    {client.phone && (
                      <div className="flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        <a 
                          href={`tel:${client.phone}`}
                          className="truncate text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                          title="Call client"
                        >
                          {client.phone}
                        </a>
                      </div>
                    )}
                    {client.email && (
                      <div className="flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        <a 
                          href={`mailto:${client.email}`}
                          className="truncate text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                          title="Send email to client"
                        >
                          {client.email}
                        </a>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="text-gray-500">Client not found</div>
              )}
            </div>
          </div>

          {/* Right side - Navigation icons */}
          <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
            <Button
              variant="ghost"
              size="sm"
              className="p-2"
              title="Personal Profile"
              onClick={() => window.location.hash = `/clients/${clientId}/personal`}
            >
              <BarChart4 className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.location.hash = `/clients/${clientId}/portfolio`}
              className="p-2"
              title="Portfolio"
            >
              <Wallet className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.location.hash = `/clients/${clientId}/transactions`}
              className="p-2"
              title="Transactions"
            >
              <ArrowUpDown className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.location.hash = `/clients/${clientId}/appointments`}
              className="p-2"
              title="Appointments"
            >
              <Calendar className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.location.hash = `/clients/${clientId}/communications`}
              className="p-2 bg-blue-50"
              title="Communications"
            >
              <MessageCircle className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="p-2"
              title="Portfolio Report"
            >
              <FileText className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="p-2"
              title="Investment Recommendations"
            >
              <Target className="h-5 w-5" />
            </Button>
          </div>
        </div>
        </div>
      )}

      {/* Page Description - Mobile Optimized */}
      <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-3 sm:py-4">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-0">
          <div className="min-w-0 flex-1">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
              {isGlobalView ? 'All Notes' : 'Notes'}
            </h2>
            <p className="text-sm sm:text-base text-gray-600 mt-1">
              {isGlobalView 
                ? 'View all client notes and interaction history across your portfolio'
                : 'Track all client notes and interaction history'
              }
            </p>
          </div>
          
          {!isGlobalView && (
            <div className="flex-shrink-0">
              <NewCommunicationDialog 
                clientId={clientId!}
                onSuccess={refetchCommunications}
              />
            </div>
          )}
        </div>
      </div>

      <div className="container mx-auto py-6">        
        <div className="max-w-4xl mx-auto">
          <div>
            <Card className="mb-4">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-center">
                  <CardTitle>Communications</CardTitle>
                  
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Filter className="h-4 w-4 mr-2" />
                        Filter
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle>Filter Communications</DialogTitle>
                      </DialogHeader>
                      <div className="py-4 space-y-4">
                        <div className="space-y-2">
                          <Label>Communication Type</Label>
                          <Select 
                            value={filterType || ""} 
                            onValueChange={(value) => setFilterType(value || null)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="All Types" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all_types">All Types</SelectItem>
                              <SelectItem value="portfolio_review">Portfolio Review</SelectItem>
                              <SelectItem value="market_update">Market Update</SelectItem>
                              <SelectItem value="investment_advice">Investment Advice</SelectItem>
                              <SelectItem value="onboarding">Onboarding</SelectItem>
                              <SelectItem value="complaint_handling">Complaint Handling</SelectItem>
                              <SelectItem value="relationship_building">Relationship Building</SelectItem>
                              <SelectItem value="service_request">Service Request</SelectItem>
                              <SelectItem value="product_information">Product Information</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="space-y-2">
                          <Label>Channel</Label>
                          <Select 
                            value={filterChannel || ""} 
                            onValueChange={(value) => setFilterChannel(value || null)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="All Channels" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all_channels">All Channels</SelectItem>
                              <SelectItem value="phone">Phone</SelectItem>
                              <SelectItem value="email">Email</SelectItem>
                              <SelectItem value="in_person">In Person</SelectItem>
                              <SelectItem value="video">Video Call</SelectItem>
                              <SelectItem value="chat">Chat</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={handleClearFilters}>
                          Clear Filters
                        </Button>
                        <DialogTrigger asChild>
                          <Button>Apply</Button>
                        </DialogTrigger>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
                
                {(filterType || filterChannel) && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {filterType && (
                      <Badge variant="secondary" className="flex items-center gap-1">
                        Type: {filterType.replace('_', ' ')}
                        <button 
                          onClick={() => setFilterType(null)}
                          className="ml-1 hover:bg-muted-foreground/20 rounded-full h-4 w-4 inline-flex items-center justify-center"
                        >
                          ×
                        </button>
                      </Badge>
                    )}
                    {filterChannel && (
                      <Badge variant="secondary" className="flex items-center gap-1">
                        Channel: {filterChannel.replace('_', ' ')}
                        <button 
                          onClick={() => setFilterChannel(null)}
                          className="ml-1 hover:bg-muted-foreground/20 rounded-full h-4 w-4 inline-flex items-center justify-center"
                        >
                          ×
                        </button>
                      </Badge>
                    )}
                  </div>
                )}
              </CardHeader>
              <CardContent className="pt-0">
                <ScrollArea className="h-[600px] pr-4">
                  {isLoading ? (
                    <div className="space-y-3">
                      <Skeleton className="h-24 w-full" />
                      <Skeleton className="h-24 w-full" />
                      <Skeleton className="h-24 w-full" />
                    </div>
                  ) : filteredCommunications.length === 0 ? (
                    <EmptyState 
                      icon={<MessageCircle className="h-10 w-10 text-muted-foreground" />}
                      title="No notes"
                      description={
                        filterType || filterChannel 
                          ? "No notes match your filters."
                          : "No notes found for this client."
                      }
                      action={
                        filterType || filterChannel ? (
                          <Button onClick={handleClearFilters}>
                            Clear Filters
                          </Button>
                        ) : null
                      }
                    />
                  ) : (
                    <div className="space-y-0">
                      {displayedCommunications.map((communication: Communication) => (
                        <div
                          key={communication.id}
                          className={`border-b border-gray-100 cursor-pointer transition-colors hover:bg-gray-50 ${
                            expandedNotes.has(communication.id) ? 'bg-blue-50 border-blue-200' : ''
                          }`}
                          onClick={() => toggleNoteExpansion(communication.id)}
                        >
                          {/* Brief view */}
                          <div className="p-4">
                            {/* Title and date on same row */}
                            <div className="flex items-start justify-between mb-1">
                              <div className="font-medium text-gray-900 text-sm line-clamp-1 flex-1 pr-4">
                                {communication.subject || `${communication.communication_type.replace('_', ' ')} - ${communication.channel}`}
                              </div>
                              
                              <div className="flex items-center gap-2 flex-shrink-0">
                                <span className="text-sm text-gray-500">
                                  {format(new Date(communication.start_time), 'MMM dd, yyyy')}
                                </span>
                                {expandedNotes.has(communication.id) ? (
                                  <ChevronUp className="h-4 w-4 text-gray-400" />
                                ) : (
                                  <ChevronDown className="h-4 w-4 text-gray-400" />
                                )}
                              </div>
                            </div>
                            
                            {/* Client name row - exact same positioning as title */}
                            {isGlobalView && communication.client_name && (
                              <div className="text-sm text-gray-600">
                                {communication.client_name}
                              </div>
                            )}
                          </div>

                          {/* Expanded details */}
                          {expandedNotes.has(communication.id) && (
                            <div className="px-4 pb-4 border-t border-gray-100 bg-gray-50">
                              <div className="pt-4 space-y-4">
                                {/* Communication details */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div>
                                    <h5 className="text-sm font-medium text-gray-700 mb-2">Communication Details</h5>
                                    <div className="space-y-2 text-sm">
                                      <div className="flex items-center gap-2">
                                        {communication.channel === 'phone' && <Phone className="h-4 w-4 text-blue-600" />}
                                        {communication.channel === 'email' && <Mail className="h-4 w-4 text-blue-600" />}
                                        {communication.channel === 'video' && <Video className="h-4 w-4 text-blue-600" />}
                                        {communication.channel === 'in_person' && <Users className="h-4 w-4 text-blue-600" />}
                                        <span className="capitalize">{communication.channel.replace('_', ' ')}</span>
                                        <span className={`px-2 py-0.5 text-xs rounded-full ${
                                          communication.direction === 'outbound' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                                        }`}>
                                          {communication.direction}
                                        </span>
                                      </div>
                                      <div>
                                        <span className="text-gray-500">Type:</span> {communication.communication_type.replace('_', ' ')}
                                      </div>
                                      <div>
                                        <span className="text-gray-500">Duration:</span> {communication.duration ? `${Math.round(communication.duration / 60)} min` : 'N/A'}
                                      </div>
                                    </div>
                                  </div>
                                  
                                  <div>
                                    <h5 className="text-sm font-medium text-gray-700 mb-2">Status</h5>
                                    <div className="space-y-2 text-sm">
                                      {communication.sentiment && (
                                        <div>
                                          <span className="text-gray-500">Sentiment:</span> 
                                          <span className={`ml-1 px-2 py-0.5 text-xs rounded-full ${
                                            communication.sentiment === 'positive' ? 'bg-green-100 text-green-800' :
                                            communication.sentiment === 'negative' ? 'bg-red-100 text-red-800' :
                                            'bg-gray-100 text-gray-800'
                                          }`}>
                                            {communication.sentiment}
                                          </span>
                                        </div>
                                      )}
                                      {communication.follow_up_required && (
                                        <div className="flex items-center gap-1 text-amber-600">
                                          <AlertCircle className="h-4 w-4" />
                                          <span>Follow-up required</span>
                                        </div>
                                      )}
                                      <div className="flex items-center gap-3">
                                        {communication.action_item_count > 0 && (
                                          <div className="flex items-center gap-1">
                                            <CheckSquare className="h-4 w-4 text-blue-600" />
                                            <span>{communication.action_item_count} tasks</span>
                                          </div>
                                        )}
                                        {communication.attachment_count > 0 && (
                                          <div className="flex items-center gap-1">
                                            <Paperclip className="h-4 w-4 text-gray-600" />
                                            <span>{communication.attachment_count} files</span>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                {/* Summary and Notes */}
                                {(communication.summary || communication.notes) && (
                                  <div>
                                    <h5 className="text-sm font-medium text-gray-700 mb-2">Summary & Notes</h5>
                                    {communication.summary && (
                                      <div className="mb-2">
                                        <span className="text-xs text-gray-500 uppercase tracking-wide">Summary</span>
                                        <p className="text-sm text-gray-700 mt-1">{communication.summary}</p>
                                      </div>
                                    )}
                                    {communication.notes && (
                                      <div>
                                        <span className="text-xs text-gray-500 uppercase tracking-wide">Notes</span>
                                        <p className="text-sm text-gray-700 mt-1">{communication.notes}</p>
                                      </div>
                                    )}
                                  </div>
                                )}

                                {/* Next Steps */}
                                {communication.next_steps && (
                                  <div>
                                    <h5 className="text-sm font-medium text-gray-700 mb-2">Next Steps</h5>
                                    <p className="text-sm text-gray-700">{communication.next_steps}</p>
                                  </div>
                                )}

                                {/* Action Items - Only show if there are actual action items */}
                                {communication.action_item_count > 0 && (
                                  <ActionItemsDisplay communicationId={communication.id} />
                                )}



                                {/* Tags */}
                                {communication.tags && communication.tags.length > 0 && (
                                  <div>
                                    <h5 className="text-sm font-medium text-gray-700 mb-2">Tags</h5>
                                    <div className="flex flex-wrap gap-1">
                                      {communication.tags.map((tag, index) => (
                                        <span key={index} className="px-2 py-0.5 text-xs bg-blue-100 text-blue-800 rounded-full">
                                          {tag}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}

                      {/* Show More/Less Button */}
                      {filteredCommunications.length > 5 && (
                        <div className="p-4 border-b border-gray-100">
                          <Button
                            variant="ghost"
                            onClick={() => setShowAll(!showAll)}
                            className="w-full text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                          >
                            {showAll ? (
                              <>
                                <ChevronUp className="h-4 w-4 mr-2" />
                                Show Less
                              </>
                            ) : (
                              <>
                                <ChevronDown className="h-4 w-4 mr-2" />
                                Show More ({filteredCommunications.length - 5} more notes)
                              </>
                            )}
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
            
            {!isGlobalView && <ClientPreferences clientId={clientId!} />}
          </div>
        </div>

      </div>
    </div>
  );
};

export default ClientCommunications;