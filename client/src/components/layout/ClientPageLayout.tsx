import { ReactNode } from "react";
import { ClientHeader } from "./ClientHeader";

interface ClientPageLayoutProps {
  children: ReactNode;
  client?: {
    id: number;
    fullName: string;
    phone?: string | null;
    email?: string | null;
    tier: string;
  } | null;
  isLoading?: boolean;
  clientId: number;
}

export function ClientPageLayout({ children, client, isLoading, clientId }: ClientPageLayoutProps) {
  const handleBackClick = () => {
    window.location.hash = "/clients";
  };

  const handleClientNameClick = (id: number) => {
    window.location.hash = `/clients/${id}/personal`;
  };

  return (
    <div className="px-4 py-4 pb-20 md:pb-6">
      <ClientHeader
        client={client}
        isLoading={isLoading}
        onBackClick={handleBackClick}
        onClientNameClick={handleClientNameClick}
      />
      {children}
    </div>
  );
}