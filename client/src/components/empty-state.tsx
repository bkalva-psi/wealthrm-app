import React from 'react';
import { AlertCircle } from 'lucide-react';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  icon = <AlertCircle className="h-10 w-10 text-muted-foreground" />,
  title,
  description,
  action
}) => {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 space-y-4">
      <div className="text-muted-foreground">
        {icon}
      </div>
      <h3 className="font-medium text-lg">{title}</h3>
      <p className="text-muted-foreground max-w-md">
        {description}
      </p>
      {action && (
        <div className="mt-4">
          {action}
        </div>
      )}
    </div>
  );
};

export default EmptyState;