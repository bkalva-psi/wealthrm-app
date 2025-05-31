import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { UserPlus, Calendar, Edit, Phone, Mail, FolderPlus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

export function QuickActions() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [activeDialog, setActiveDialog] = useState<string | null>(null);
  const [selectedClientId, setSelectedClientId] = useState<string>("");

  // Fetch clients for the dropdown
  const { data: clients = [] } = useQuery({
    queryKey: ['/api/clients'],
  });
  
  const handleDialogClose = () => {
    setActiveDialog(null);
    setSelectedClientId(""); // Reset client selection
  };
  
  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Note added",
      description: "Your note has been successfully saved.",
    });
    handleDialogClose();
  };
  
  const handleScheduleMeeting = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Meeting scheduled",
      description: "Your meeting has been scheduled successfully.",
    });
    handleDialogClose();
  };
  
  const quickActions = [
    {
      id: "add-prospect",
      icon: UserPlus,
      label: "Add Prospect",
      action: () => {
        window.location.hash = "/prospects/new";
      },
    },
    {
      id: "schedule",
      icon: Calendar,
      label: "Schedule",
      action: () => setActiveDialog("schedule"),
    },
    {
      id: "add-note",
      icon: Edit,
      label: "Add Note",
      action: () => setActiveDialog("note"),
    },

    {
      id: "email",
      icon: Mail,
      label: "Email",
      action: () => setActiveDialog("email"),
    },
    {
      id: "new-task",
      icon: FolderPlus,
      label: "New Task",
      action: () => {
        window.location.hash = "/tasks/new";
      },
    },
  ];
  
  return (
    <>
      <Card className="mb-4">
        <CardContent className="pt-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium text-slate-700">Quick Actions</h2>
          </div>
          <div className="mt-3 flex items-center gap-2">
            {quickActions.map((action) => (
              <Button
                key={action.id}
                variant="outline"
                size="sm"
                className="flex items-center justify-center p-2 bg-slate-50 hover:bg-slate-100 transition-colors"
                onClick={action.action}
                title={action.label}
              >
                <action.icon className="h-5 w-5 text-primary-600" />
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
      
      {/* Add Note Dialog */}
      <Dialog open={activeDialog === "note"} onOpenChange={(open) => !open && handleDialogClose()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add a Note</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddNote} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="client">Client</Label>
              <Input id="client" placeholder="Select or type client name" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="note">Note Content</Label>
              <Textarea id="note" placeholder="Enter your note here..." rows={4} />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" type="button" onClick={handleDialogClose}>
                Cancel
              </Button>
              <Button type="submit">Save Note</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* Schedule Meeting Dialog */}
      <Dialog open={activeDialog === "schedule"} onOpenChange={(open) => !open && handleDialogClose()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Schedule a Meeting</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleScheduleMeeting} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="meeting-title">Meeting Title</Label>
              <Input id="meeting-title" placeholder="Enter meeting title" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="meeting-client">Client</Label>
              <Select value={selectedClientId} onValueChange={setSelectedClientId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select or type client name" />
                </SelectTrigger>
                <SelectContent>
                  {(clients as any[]).map((client: any) => (
                    <SelectItem key={client.id} value={client.id.toString()}>
                      {client.fullName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="meeting-date">Date</Label>
                <Input id="meeting-date" type="date" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="meeting-time">Time</Label>
                <Input id="meeting-time" type="time" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="meeting-location">Location</Label>
              <Input id="meeting-location" placeholder="Enter location" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="meeting-notes">Notes</Label>
              <Textarea id="meeting-notes" placeholder="Any additional notes..." rows={2} />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" type="button" onClick={handleDialogClose}>
                Cancel
              </Button>
              <Button type="submit">Schedule</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* Call Client Dialog */}
      <Dialog open={activeDialog === "call"} onOpenChange={(open) => !open && handleDialogClose()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Call Client</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="call-client">Select Client</Label>
              <Input id="call-client" placeholder="Type client name" />
            </div>
            <div className="flex justify-center py-4">
              <div className="rounded-full bg-primary-600 p-4">
                <Phone className="h-8 w-8 text-white" />
              </div>
            </div>
            <div className="flex justify-center space-x-2">
              <Button variant="outline" onClick={handleDialogClose}>
                Cancel
              </Button>
              <Button>
                Call Now
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Email Dialog */}
      <Dialog open={activeDialog === "email"} onOpenChange={(open) => !open && handleDialogClose()}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Send Email</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email-to">To</Label>
              <Input id="email-to" placeholder="Enter recipient email" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email-subject">Subject</Label>
              <Input id="email-subject" placeholder="Enter email subject" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email-body">Message</Label>
              <Textarea id="email-body" placeholder="Type your message here..." rows={6} />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={handleDialogClose}>
                Cancel
              </Button>
              <Button>
                Send Email
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
