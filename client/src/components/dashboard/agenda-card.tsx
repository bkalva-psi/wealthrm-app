import { format } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { MoreVertical } from "lucide-react";
import { cn, formatTime, getPriorityColor } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function AgendaCard() {
  const today = new Date();
  const formattedDate = format(today, "EEEE, MMMM d");
  
  const { data: appointments, isLoading } = useQuery({
    queryKey: ['/api/appointments/today'],
  });
  
  return (
    <Card className="overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-200 bg-white">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium text-slate-700">Today's Agenda</h2>
          <span className="text-xs text-slate-500">{formattedDate}</span>
        </div>
      </div>
      
      <div className="divide-y divide-slate-200">
        {isLoading ? (
          Array(3).fill(0).map((_, index) => (
            <div key={index} className="px-4 py-3">
              <div className="flex justify-between items-start">
                <div className="space-y-2 w-full">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/3" />
                  <div className="flex gap-2 mt-1">
                    <Skeleton className="h-5 w-24" />
                    <Skeleton className="h-5 w-24" />
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : appointments && appointments.length > 0 ? (
          appointments.map((appointment) => {
            const priorityColors = getPriorityColor(appointment.priority);
            const isPriorityHigh = appointment.priority === "high";
            
            return (
              <div 
                key={appointment.id} 
                className={cn(
                  "px-4 py-3",
                  isPriorityHigh ? "bg-amber-50 border-l-4 border-amber-500" : ""
                )}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-slate-800">{appointment.title}</p>
                    <p className="text-xs text-slate-500 mt-1">
                      {formatTime(appointment.startTime)} - {formatTime(appointment.endTime)}
                    </p>
                    <div className="flex items-center mt-2">
                      <span className={cn(
                        "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium",
                        priorityColors.bg,
                        priorityColors.text
                      )}>
                        {isPriorityHigh ? "High Priority" : appointment.priority === "medium" ? "Follow-up" : "Regular"}
                      </span>
                      <span className="ml-2 text-xs text-slate-500">{appointment.description}</span>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-400 hover:text-slate-500">
                        <span className="sr-only">Open menu</span>
                        <MoreVertical className="h-5 w-5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>View Details</DropdownMenuItem>
                      <DropdownMenuItem>Edit</DropdownMenuItem>
                      <DropdownMenuItem>Reschedule</DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600">Cancel</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            );
          })
        ) : (
          <div className="px-4 py-6 text-center">
            <p className="text-sm text-slate-500">No appointments scheduled for today</p>
          </div>
        )}
      </div>
      
      <CardFooter className="px-4 py-3 bg-slate-50 flex justify-center">
        <Button variant="link" size="sm" className="text-xs font-medium text-primary-600 hover:text-primary-700">
          View Full Calendar
        </Button>
      </CardFooter>
    </Card>
  );
}
