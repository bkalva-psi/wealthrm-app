import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { 
  User, Phone, Mail, FileText, PieChart, Wallet, MessageCircle, 
  ArrowLeft, Calendar, Clock, MapPin
} from 'lucide-react';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatDate } from '@/lib/utils';

interface ClientPageLayoutProps {
  children: React.ReactNode;
  clientId: number;
  currentTab: string;
}

const ClientPageLayout: React.FC<ClientPageLayoutProps> = ({
  children,
  clientId,
  currentTab
}) => {
  // Fetch client data
  const { data: client, isLoading } = useQuery({
    queryKey: [`/api/clients/${clientId}`],
    enabled: !!clientId
  });

  return (
    <div className="container mx-auto p-4 md:p-6">
      <div className="mb-6">
        <Button 
          variant="ghost" 
          onClick={() => window.location.hash = "/clients"}
          className="flex items-center"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Clients
        </Button>
      </div>

      {/* Client Header Card */}
      <Card className="mb-6 p-4">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
          {/* Client Avatar and Name */}
          <div className="flex items-center gap-4">
            {isLoading ? (
              <Skeleton className="h-16 w-16 rounded-full" />
            ) : (
              <Avatar className="h-16 w-16 border-2 border-primary">
                <AvatarFallback className="text-lg">
                  {client?.initials || client?.fullName?.substring(0, 2)}
                </AvatarFallback>
              </Avatar>
            )}
            
            <div>
              {isLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-4 w-24" />
                </div>
              ) : (
                <>
                  <h1 className="text-2xl font-bold">{client?.fullName}</h1>
                  <div className="flex items-center text-sm text-muted-foreground">
                    {client?.tier && (
                      <span className="capitalize mr-2 px-2 py-0.5 bg-primary/10 text-primary rounded">
                        {client.tier} Tier
                      </span>
                    )}
                    <span>Client since {client?.createdAt ? formatDate(new Date(client.createdAt)) : 'N/A'}</span>
                  </div>
                </>
              )}
            </div>
          </div>
          
          {/* Client Quick Info */}
          <div className="flex flex-wrap gap-4 md:ml-auto">
            {isLoading ? (
              <div className="grid grid-cols-2 gap-4">
                <Skeleton className="h-10 w-32" />
                <Skeleton className="h-10 w-32" />
              </div>
            ) : (
              <>
                {client?.phone && (
                  <div className="flex items-center">
                    <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>{client.phone}</span>
                  </div>
                )}
                {client?.email && (
                  <div className="flex items-center">
                    <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>{client.email}</span>
                  </div>
                )}
                {client?.address && (
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="truncate max-w-xs">{client.address}</span>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </Card>
      
      {/* Tabs Navigation */}
      <Tabs defaultValue={currentTab} className="mb-6">
        <TabsList className="mb-4 flex overflow-x-auto pb-1">
          <TabsTrigger value="personal">
            <Button 
              variant={currentTab === 'personal' ? 'default' : 'ghost'} 
              className="mr-1"
              onClick={() => window.location.hash = `/clients/${clientId}/personal`}
            >
              <User className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Personal Info</span>
              <span className="sm:hidden">Personal</span>
            </Button>
          </TabsTrigger>
          <TabsTrigger value="portfolio">
            <Button 
              variant={currentTab === 'portfolio' ? 'default' : 'ghost'} 
              className="mr-1"
              onClick={() => window.location.hash = `/clients/${clientId}/portfolio`}
            >
              <PieChart className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Portfolio</span>
              <span className="sm:hidden">Portfolio</span>
            </Button>
          </TabsTrigger>
          <TabsTrigger value="transactions">
            <Button 
              variant={currentTab === 'transactions' ? 'default' : 'ghost'} 
              className="mr-1"
              onClick={() => window.location.hash = `/clients/${clientId}/transactions`}
            >
              <Wallet className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Transactions</span>
              <span className="sm:hidden">Txns</span>
            </Button>
          </TabsTrigger>
          <TabsTrigger value="communications">
            <Button 
              variant={currentTab === 'communications' ? 'default' : 'ghost'} 
              className="mr-1"
              onClick={() => window.location.hash = `/clients/${clientId}/communications`}
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Communications</span>
              <span className="sm:hidden">Comms</span>
            </Button>
          </TabsTrigger>
          <TabsTrigger value="documents">
            <Button 
              variant={currentTab === 'documents' ? 'default' : 'ghost'} 
              className="mr-1"
              onClick={() => window.location.hash = `/clients/${clientId}/documents`}
            >
              <FileText className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Documents</span>
              <span className="sm:hidden">Docs</span>
            </Button>
          </TabsTrigger>
          <TabsTrigger value="calendar">
            <Button 
              variant={currentTab === 'calendar' ? 'default' : 'ghost'} 
              className="mr-1"
              onClick={() => window.location.hash = `/clients/${clientId}/calendar`}
            >
              <Calendar className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Appointments</span>
              <span className="sm:hidden">Appts</span>
            </Button>
          </TabsTrigger>
        </TabsList>
      </Tabs>
      
      {/* Page Content */}
      {children}
    </div>
  );
};

export default ClientPageLayout;