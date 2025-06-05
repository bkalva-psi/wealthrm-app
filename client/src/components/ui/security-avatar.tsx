import { useState } from "react";
import { useSecurityLogo } from "@/lib/logoService";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface SecurityAvatarProps {
  securityName: string;
  securityType: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function SecurityAvatar({ 
  securityName, 
  securityType, 
  size = "md", 
  className = "" 
}: SecurityAvatarProps) {
  const [imageError, setImageError] = useState(false);
  const { url, fallback, onError } = useSecurityLogo(securityName, securityType);
  
  const sizeClasses = {
    sm: "h-6 w-6",
    md: "h-8 w-8", 
    lg: "h-10 w-10"
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    setImageError(true);
    onError(e);
  };

  return (
    <Avatar className={`${sizeClasses[size]} ${className}`}>
      {url && !imageError ? (
        <AvatarImage 
          src={url} 
          alt={`${securityName} logo`}
          onError={handleImageError}
        />
      ) : null}
      <AvatarFallback>
        <img 
          src={fallback} 
          alt={`${securityName} initials`}
          className="w-full h-full object-cover"
        />
      </AvatarFallback>
    </Avatar>
  );
}