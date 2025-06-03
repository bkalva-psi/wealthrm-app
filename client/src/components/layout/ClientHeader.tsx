import { ArrowLeft, Phone, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getTierColor } from "@/lib/utils";

interface ClientHeaderProps {
  client?: {
    id: number;
    fullName: string;
    phone?: string | null;
    email?: string | null;
    tier: string;
  } | null;
  isLoading?: boolean;
  onBackClick: () => void;
  onClientNameClick: (clientId: number) => void;
}

export function ClientHeader({ client, isLoading, onBackClick, onClientNameClick }: ClientHeaderProps) {
  return (
    <div className={`bg-card border rounded-lg p-4 mb-6 shadow-sm border-l-4 ${client ? getTierColor(client.tier).border.replace('border-', 'border-l-') : 'border-l-slate-300'}`}>
      <div className="flex items-center justify-between">
        {/* Left side - Back arrow and client info */}
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onBackClick}
            className="mr-4 p-2"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          
          <div>
            {isLoading ? (
              <div className="space-y-1">
                <Skeleton className="h-6 w-40" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-32" />
              </div>
            ) : client ? (
              <>
                {/* Line 1: Client Name */}
                <button 
                  onClick={() => onClientNameClick(client.id)}
                  className="text-xl font-semibold text-foreground hover:text-primary transition-colors cursor-pointer"
                >
                  {client.fullName}
                </button>
                
                {/* Line 2: Phone Number */}
                {client.phone && (
                  <div className="mt-1 flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <a 
                      href={`tel:${client.phone}`}
                      className="text-sm text-primary hover:text-primary/80 hover:underline transition-colors"
                      title="Call client"
                    >
                      {client.phone}
                    </a>
                  </div>
                )}
                
                {/* Line 3: Email */}
                {client.email && (
                  <div className="mt-1 flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <a 
                      href={`mailto:${client.email}`}
                      className="text-sm text-primary hover:text-primary/80 hover:underline transition-colors"
                      title="Send email to client"
                    >
                      {client.email}
                    </a>
                  </div>
                )}
              </>
            ) : (
              <div className="text-muted-foreground">Client not found</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}