import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/empty-state';
import { FileText, Download, ExternalLink, AlertTriangle } from 'lucide-react';
import { Document } from '../../types/order.types';
import { apiRequest } from '@/lib/queryClient';

interface DocumentsOverlayProps {
  productId: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function DocumentsOverlay({ productId, open, onOpenChange }: DocumentsOverlayProps) {
  const { data: documents, isLoading, error } = useQuery<Document[]>({
    queryKey: ['/api/order-management/documents', productId],
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/order-management/documents/${productId}`);
      const data = await response.json();
      // Ensure we always return an array
      return Array.isArray(data) ? data : [];
    },
    enabled: open && !!productId,
  });

  const handleDownload = (document: Document) => {
    window.open(document.url, '_blank');
  };

  // Ensure documents is always an array
  const documentsArray = Array.isArray(documents) ? documents : [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl sm:text-2xl">Scheme Documents</DialogTitle>
          <DialogDescription className="text-sm sm:text-base">Download scheme-related documents</DialogDescription>
        </DialogHeader>

        <div className="mt-4">
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-destructive/10 border border-destructive/20 rounded-md">
                <AlertTriangle className="h-4 w-4 text-destructive" />
                <p className="text-sm font-medium text-destructive">Failed to load documents. Please try again.</p>
              </div>
            </div>
          ) : documentsArray.length === 0 ? (
            <EmptyState
              icon={<FileText className="h-12 w-12 text-muted-foreground" />}
              title="No documents available"
              description="Documents for this scheme are not available at this time."
            />
          ) : (
            <div className="space-y-3">
              {documentsArray.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium text-foreground">{doc.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {doc.type} • {new Date(doc.uploadedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownload(doc)}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => window.open(doc.url, '_blank')}
                      aria-label={`Open ${doc.name} in new tab`}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

