import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface FloatingAddButtonProps {
  onClick: () => void;
  label?: string;
  className?: string;
}

export function FloatingAddButton({ onClick, label = "Add New Client", className = "" }: FloatingAddButtonProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Text label that appears on hover */}
      <span 
        className={`bg-popover text-popover-foreground text-sm font-medium px-4 py-2 rounded-lg transition-all duration-300 pointer-events-none whitespace-nowrap shadow-lg ${
          isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-2'
        }`}
      >
        {label}
      </span>
      
      {/* Button with hover effects */}
      <Button
        onClick={onClick}
        size="lg"
        aria-label={label}
        className={`h-14 w-14 rounded-full bg-primary shadow-lg transition-all duration-300 ${
          isHovered 
            ? 'bg-primary/90 hover:bg-primary/80 scale-110 shadow-xl' 
            : 'hover:bg-primary/90 hover:shadow-xl hover:scale-105'
        } active:bg-primary/70 active:scale-105`}
        title={label}
      >
        <Plus 
          className={`h-6 w-6 text-primary-foreground transition-transform duration-300 ${
            isHovered ? 'rotate-90' : ''
          }`} 
        />
        <span className="sr-only">{label}</span>
      </Button>
    </div>
  );
}
