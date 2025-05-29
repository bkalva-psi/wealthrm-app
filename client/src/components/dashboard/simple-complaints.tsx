import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle } from "lucide-react";

export function SimpleComplaints() {
  const { data: complaints, isLoading } = useQuery({
    queryKey: ['/api/complaints'],
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="px-4 py-3">
          <h3 className="text-sm font-medium">Client Complaints</h3>
        </CardHeader>
        <CardContent className="px-4 py-3">
          <p className="text-sm text-slate-500">Loading...</p>
        </CardContent>
      </Card>
    );
  }

  if (!complaints || complaints.length === 0) {
    return (
      <Card>
        <CardHeader className="px-4 py-3">
          <h3 className="text-sm font-medium">Client Complaints</h3>
        </CardHeader>
        <CardContent className="px-4 py-3">
          <p className="text-sm text-slate-500">No complaints</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="px-4 py-3 border-b">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-red-500" />
          <h3 className="text-sm font-medium">Client Complaints</h3>
          <Badge variant="destructive" className="text-xs">
            {complaints.length}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {complaints.slice(0, 3).map((complaint: any) => (
          <div key={complaint.id} className="px-4 py-3 border-b last:border-b-0">
            <p className="text-sm font-medium text-slate-900">{complaint.title}</p>
            <p className="text-xs text-slate-500 mt-1">{complaint.clientName}</p>
            <div className="flex gap-2 mt-2">
              <Badge variant="outline" className="text-xs">
                {complaint.severity}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {complaint.status}
              </Badge>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}