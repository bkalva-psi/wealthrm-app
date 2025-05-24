import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  DndContext, 
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent
} from '@dnd-kit/core';
import { arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { UserPlus, Search, Filter, ChevronDown, ChevronUp } from "lucide-react";
import { formatRelativeDate, getStageColor } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

interface Prospect {
  id: number;
  fullName: string;
  initials: string;
  potentialAum: string;
  potentialAumValue: number;
  email: string;
  phone: string;
  stage: string;
  lastContactDate: string;
  probabilityScore: number;
  productsOfInterest: string;
  notes: string;
}

interface ProspectCardProps {
  prospect: Prospect;
  onClick: (id: number) => void;
}

function ProspectCard({ prospect, onClick }: ProspectCardProps) {
  return (
    <div 
      className="bg-white p-3 rounded-md shadow-sm mb-2 cursor-pointer border border-slate-200 hover:border-primary-300 hover:shadow-md transition-all"
      onClick={() => onClick(prospect.id)}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center">
          <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-medium text-xs">
            {prospect.initials}
          </div>
          <h3 className="text-sm font-medium text-slate-800 ml-2">{prospect.fullName}</h3>
        </div>
        <span className="text-xs font-medium bg-primary-50 text-primary-600 px-2 py-0.5 rounded-full">
          {prospect.probabilityScore}%
        </span>
      </div>
      <div className="text-xs text-slate-600 mb-1">
        <span className="font-medium">Potential: </span>
        <span>{prospect.potentialAum}</span>
      </div>
      {prospect.productsOfInterest && (
        <div className="text-xs text-slate-600 mb-1">
          <span className="font-medium">Interest: </span>
          <span>{prospect.productsOfInterest}</span>
        </div>
      )}
      <div className="flex justify-between items-center mt-2 text-xs text-slate-500">
        <span>Last contact: {prospect.lastContactDate ? formatRelativeDate(prospect.lastContactDate) : 'Not available'}</span>
      </div>
    </div>
  );
}

interface PipelineColumnProps {
  title: string;
  prospects: Prospect[];
  stage: string;
  onProspectClick: (id: number) => void;
  isMobile?: boolean;
}

function PipelineColumn({ title, prospects, stage, onProspectClick, isMobile = false }: PipelineColumnProps) {
  const [isOpen, setIsOpen] = useState(false);
  const stageColors = getStageColor(stage);
  
  if (isMobile) {
    return (
      <Collapsible 
        open={isOpen} 
        onOpenChange={setIsOpen}
        className="w-full mb-4 border border-slate-200 rounded-md overflow-hidden"
      >
        <CollapsibleTrigger className="w-full flex items-center justify-between p-3 bg-white">
          <div className="flex items-center">
            <h3 className="font-medium text-sm text-slate-700">{title}</h3>
            <span className="ml-2 bg-slate-100 text-slate-700 text-xs px-2 py-0.5 rounded-full">
              {prospects.length}
            </span>
          </div>
          {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className={`p-3 ${stageColors.bg} max-h-[400px] overflow-y-auto`}>
            {prospects.length > 0 ? prospects.map((prospect) => (
              <ProspectCard 
                key={prospect.id} 
                prospect={prospect} 
                onClick={() => onProspectClick(prospect.id)} 
              />
            )) : (
              <div className="text-center p-4 text-slate-400 text-sm">
                No prospects in this stage
              </div>
            )}
          </div>
        </CollapsibleContent>
      </Collapsible>
    );
  }
  
  return (
    <div className="flex-1 min-w-[250px]">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-medium text-sm text-slate-700">{title}</h3>
        <span className="bg-slate-100 text-slate-700 text-xs px-2 py-0.5 rounded-full">
          {prospects.length}
        </span>
      </div>
      <div className={`${stageColors.bg} p-3 rounded-md min-h-[400px] max-h-[500px] overflow-y-auto`}>
        {prospects.length > 0 ? prospects.map((prospect) => (
          <ProspectCard 
            key={prospect.id} 
            prospect={prospect} 
            onClick={() => onProspectClick(prospect.id)} 
          />
        )) : (
          <div className="text-center p-4 text-slate-400 text-sm">
            No prospects in this stage
          </div>
        )}
      </div>
    </div>
  );
}

export default function Prospects() {
  // Using hash-based navigation
  const [searchQuery, setSearchQuery] = useState("");
  const [activeProspects, setActiveProspects] = useState<Prospect[]>([]);
  const [draggedItem, setDraggedItem] = useState<Prospect | null>(null);
  
  // Set page title
  useEffect(() => {
    document.title = "Prospects | Wealth RM";
  }, []);
  
  const { data: prospects, isLoading } = useQuery({
    queryKey: ['/api/prospects']
  });
  
  // Update active prospects when data is loaded
  useEffect(() => {
    if (prospects) {
      console.log("Prospects data loaded:", prospects);
      setActiveProspects(prospects);
    }
  }, [prospects]);
  
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );
  
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const draggedProspect = activeProspects.find(p => p.id === active.id);
    if (draggedProspect) {
      setDraggedItem(draggedProspect);
    }
  };
  
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setDraggedItem(null);
    
    if (over && active.id !== over.id) {
      // In a real app, this would update the prospect's stage
      console.log(`Moving prospect ${active.id} to a new stage`);
    }
  };
  
  const isMobile = useIsMobile();
  
  const filteredProspects = activeProspects && searchQuery 
    ? activeProspects.filter(prospect => 
        prospect.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        prospect.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        prospect.productsOfInterest?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : activeProspects;
  
  const getProspectsByStage = (stage: string) => {
    if (!filteredProspects) return [];
    return filteredProspects.filter(prospect => prospect.stage === stage);
  };
  
  const handleProspectClick = (id: number) => {
    window.location.hash = `/prospects/${id}`;
  };
  
  // Pipeline stages configuration
  const stages = [
    { id: 'new', title: 'New Leads' },
    { id: 'qualified', title: 'Qualified' },
    { id: 'proposal', title: 'Proposal' },
    { id: 'won', title: 'Won' },
    { id: 'lost', title: 'Lost' }
  ];
  
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800">Prospect Pipeline</h1>
          <p className="text-sm text-slate-600">Manage your sales opportunities</p>
        </div>
        <Button
          onClick={() => {
            window.location.hash = "/prospects/new";
          }}
          className="flex items-center gap-2"
        >
          <UserPlus className="h-4 w-4" />
          Add Prospect
        </Button>
      </div>
      
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4 md:items-center justify-between">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search prospects by name, email, or products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Filter
                <ChevronDown className="h-4 w-4" />
              </Button>
              <Button variant="outline">Export</Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {isLoading ? (
        <div className="bg-white p-8 rounded-lg shadow-sm text-center">
          <p className="text-slate-500">Loading prospect pipeline...</p>
        </div>
      ) : (
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            {isMobile ? (
              // Mobile view with expandable vertical sections
              <div className="flex flex-col w-full">
                {stages.map(stage => (
                  <PipelineColumn
                    key={stage.id}
                    title={stage.title}
                    prospects={getProspectsByStage(stage.id)}
                    stage={stage.id}
                    onProspectClick={handleProspectClick}
                    isMobile={true}
                  />
                ))}
              </div>
            ) : (
              // Desktop view with horizontal columns
              <div className="flex gap-4 overflow-x-auto pb-2">
                {stages.map(stage => (
                  <PipelineColumn
                    key={stage.id}
                    title={stage.title}
                    prospects={getProspectsByStage(stage.id)}
                    stage={stage.id}
                    onProspectClick={handleProspectClick}
                  />
                ))}
              </div>
            )}
            
            <DragOverlay>
              {draggedItem ? (
                <div className="bg-white p-3 rounded-md shadow-md border border-primary-300 w-[250px]">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-medium text-xs">
                        {draggedItem.initials}
                      </div>
                      <h3 className="text-sm font-medium text-slate-800 ml-2">{draggedItem.fullName}</h3>
                    </div>
                    <span className="text-xs font-medium bg-primary-50 text-primary-600 px-2 py-0.5 rounded-full">
                      {draggedItem.probabilityScore}%
                    </span>
                  </div>
                  <div className="text-xs text-slate-600">
                    <span className="font-medium">Potential: </span>
                    <span>{draggedItem.potentialAum}</span>
                  </div>
                  {draggedItem.lastContactDate && (
                    <div className="text-xs text-slate-500 mt-1">
                      Last contact: {formatRelativeDate(draggedItem.lastContactDate)}
                    </div>
                  )}
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>
        </div>
      )}
    </div>
  );
}
