import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";
import { ReactNode, useState } from "react";

interface StandardCardProps {
  // Header section
  title: string;
  subtitle?: string;
  status?: {
    label: string;
    variant?: "default" | "secondary" | "destructive" | "outline";
    color?: string;
  };
  headerActions?: ReactNode;
  
  // Summary section (always visible)
  summary: ReactNode;
  
  // Detailed section (expandable)
  details?: ReactNode;
  expandable?: boolean;
  defaultExpanded?: boolean;
  
  // Footer actions
  actions?: ReactNode;
  
  // Card styling
  className?: string;
  featured?: boolean;
}

export function StandardCard({
  title,
  subtitle,
  status,
  headerActions,
  summary,
  details,
  expandable = !!details,
  defaultExpanded = false,
  actions,
  className = "",
  featured = false
}: StandardCardProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  const toggleExpanded = () => {
    if (expandable && details) {
      setIsExpanded(!isExpanded);
    }
  };

  return (
    <Card 
      className={`
        transition-all duration-200 hover:shadow-lg 
        ${featured ? 'ring-2 ring-primary/20 bg-primary/5' : ''} 
        ${className}
      `}
    >
      {/* Header Section */}
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-lg text-card-foreground break-words">
                {title}
              </h3>
              {status && (
                <Badge 
                  variant={status.variant || "secondary"}
                  className={status.color ? `bg-${status.color}-100 text-${status.color}-800 dark:bg-${status.color}-900/20 dark:text-${status.color}-400` : ''}
                >
                  {status.label}
                </Badge>
              )}
            </div>
            {subtitle && (
              <p className="text-sm text-muted-foreground">
                {subtitle}
              </p>
            )}
          </div>
          
          <div className="flex items-center gap-2 ml-4">
            {headerActions}
            {expandable && details && (
              <Button
                variant="ghost"
                size="sm"
                className="p-1 h-auto w-auto"
                onClick={toggleExpanded}
              >
                <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform duration-300 ease-in-out ${
                  isExpanded ? 'rotate-180' : 'rotate-0'
                }`} />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {/* Summary Section - Always Visible, Clickable for expansion */}
        <div 
          className={`mb-4 ${expandable && details ? 'cursor-pointer hover:bg-muted/50 rounded-md p-2 -m-2 transition-colors' : ''}`}
          onClick={expandable && details ? toggleExpanded : undefined}
        >
          {summary}
        </div>

        {/* Detailed Section - Expandable with Animation */}
        <div 
          className={`overflow-hidden transition-all duration-300 ease-in-out ${
            details && isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          {details && (
            <div className="border-t border-border pt-4 mb-4">
              <div className="space-y-3">
                {details}
              </div>
            </div>
          )}
        </div>

        {/* Actions Section */}
        {actions && (
          <div className="border-t border-border pt-4">
            {actions}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Predefined card variants for common use cases
export function ClientCard({ client, onViewDetails, onContact }: any) {
  return (
    <StandardCard
      title={client.fullName}
      subtitle={`${client.tier || 'Standard'} Client • AUM: ${client.totalAum || 'N/A'}`}
      status={
        client.riskProfile
          ? {
              label: client.riskProfile,
              variant: client.riskProfile === 'Conservative' ? 'secondary' : 
                      client.riskProfile === 'Moderate' ? 'default' : 'outline'
            }
          : undefined
      }
      summary={
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Email</p>
            <p className="font-medium">{client.email}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Phone</p>
            <p className="font-medium">{client.phone}</p>
          </div>
        </div>
      }
      details={
        client.address && (
          <div className="space-y-2 text-sm">
            <div>
              <p className="text-muted-foreground">Address</p>
              <p>{client.address}</p>
            </div>
            {client.occupation && (
              <div>
                <p className="text-muted-foreground">Occupation</p>
                <p>{client.occupation}</p>
              </div>
            )}
          </div>
        )
      }
      actions={
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => onViewDetails?.(client)}>
            View Details
          </Button>
          <Button variant="default" size="sm" onClick={() => onContact?.(client)}>
            Contact
          </Button>
        </div>
      }
    />
  );
}

export function ProductCard({ product, onDownload, onShare, onViewDetails }: any) {
  return (
    <StandardCard
      title={product.name}
      subtitle={`${product.productCode} • ${product.category}`}
      status={
        product.featured
          ? { label: 'Featured', variant: 'default', color: 'blue' }
          : undefined
      }
      featured={product.featured}
      summary={
        <div className="space-y-2 text-sm">
          <p className="text-muted-foreground line-clamp-2">
            {product.description}
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-muted-foreground">Min Investment</p>
              <p className="font-medium">{product.minInvestment}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Risk Level</p>
              <p className="font-medium">{product.riskLevel}</p>
            </div>
          </div>
        </div>
      }
      details={
        <div className="space-y-3 text-sm">
          {product.keyFeatures && (
            <div>
              <p className="text-muted-foreground mb-2">Key Features</p>
              <ul className="list-disc list-inside space-y-1">
                {product.keyFeatures.slice(0, 3).map((feature: string, index: number) => (
                  <li key={index}>{feature}</li>
                ))}
              </ul>
            </div>
          )}
          {product.expectedReturns && (
            <div>
              <p className="text-muted-foreground">Expected Returns</p>
              <p className="font-medium">{product.expectedReturns}</p>
            </div>
          )}
          {product.lockInPeriod && (
            <div>
              <p className="text-muted-foreground">Lock-in Period</p>
              <p className="font-medium">{product.lockInPeriod} months</p>
            </div>
          )}
        </div>
      }
      actions={
        <div className="flex gap-1">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1 text-xs"
            onClick={() => onDownload?.(product)}
          >
            Download
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1 text-xs"
            onClick={() => onShare?.(product)}
          >
            Share
          </Button>
          <Button 
            variant="default" 
            size="sm" 
            className="flex-1 text-xs"
            onClick={() => onViewDetails?.(product)}
          >
            Details
          </Button>
        </div>
      }
    />
  );
}

export function TaskCard({ task, onComplete, onEdit, onView }: any) {
  return (
    <StandardCard
      title={task.title}
      subtitle={task.dueDate ? `Due: ${new Date(task.dueDate).toLocaleDateString()}` : undefined}
      summary={
        <div className="space-y-2">
          {task.assignedTo && (
            <p className="text-sm">
              <span className="text-muted-foreground">Assigned to:</span> {task.assignedTo}
            </p>
          )}
          {task.clientName && (
            <p className="text-sm">
              <span className="text-muted-foreground">Client:</span> {task.clientName}
            </p>
          )}
        </div>
      }
      details={
        <div className="space-y-3 text-sm">
          {task.description && (
            <div>
              <p className="text-muted-foreground mb-2">Description</p>
              <p className="whitespace-pre-wrap">{task.description}</p>
            </div>
          )}
          <div>
            <p className="text-muted-foreground mb-1">Status</p>
            <p className="capitalize">{task.status === 'completed' ? 'Completed' : 
                                      task.status === 'overdue' ? 'Overdue' : 'Pending'}</p>
          </div>
          {task.priority && (
            <div>
              <p className="text-muted-foreground mb-1">Priority</p>
              <p className="capitalize">{task.priority}</p>
            </div>
          )}
          {task.notes && (
            <div>
              <p className="text-muted-foreground mb-2">Notes</p>
              <p className="whitespace-pre-wrap">{task.notes}</p>
            </div>
          )}
        </div>
      }
      expandable={true}
      defaultExpanded={false}
      actions={
        <div className="flex gap-2">
          {!task.completed && task.status !== 'completed' && (
            <Button 
              variant="default" 
              size="sm" 
              onClick={(e) => {
                e.stopPropagation();
                onComplete?.(task);
              }}
            >
              Complete
            </Button>
          )}
          <Button 
            variant="outline" 
            size="sm" 
            onClick={(e) => {
              e.stopPropagation();
              onEdit?.(task);
            }}
          >
            Edit
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={(e) => {
              e.stopPropagation();
              onView?.(task);
            }}
          >
            View
          </Button>
        </div>
      }
    />
  );
}