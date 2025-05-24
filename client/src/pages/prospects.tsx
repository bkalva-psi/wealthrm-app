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
import { Slider } from "@/components/ui/slider";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { 
  UserPlus, 
  Search, 
  Filter as FilterIcon, 
  ChevronDown, 
  ChevronUp, 
  Download, 
  X,
  Check
} from "lucide-react";
import { formatCurrency, formatRelativeDate, getStageColor } from "@/lib/utils";
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

interface FilterOptions {
  minPotentialAum: number;
  maxPotentialAum: number;
  minProbabilityScore: number;
  maxProbabilityScore: number;
  includedStages: string[];
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
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState(0);
  
  // Filter options state
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    minPotentialAum: 0,
    maxPotentialAum: 10000000,
    minProbabilityScore: 0,
    maxProbabilityScore: 100,
    includedStages: ['new', 'qualified', 'proposal', 'won', 'lost']
  });
  
  // Set page title
  useEffect(() => {
    document.title = "Prospects | Wealth RM";
  }, []);
  
  const { data: prospects, isLoading } = useQuery({
    queryKey: ['/api/prospects']
  });
  
  // Define the stages for the pipeline and filters
  const stages = [
    { id: 'discovery', title: 'Discovery' },
    { id: 'qualified', title: 'Qualified' },
    { id: 'proposal', title: 'Proposal' },
    { id: 'negotiation', title: 'Negotiation' },
    { id: 'won', title: 'Won' },
    { id: 'lost', title: 'Lost' }
  ];
  
  // Update active prospects when data is loaded
  useEffect(() => {
    if (prospects) {
      console.log("Prospects data loaded:", prospects);
      setActiveProspects(prospects);
      
      // Reset active filters count when prospects data changes
      calculateActiveFilters();
    }
  }, [prospects]);
  
  // Calculate number of active filters
  const calculateActiveFilters = () => {
    let count = 0;
    
    if (filterOptions.minPotentialAum > 0) count++;
    if (filterOptions.maxPotentialAum < 10000000) count++;
    if (filterOptions.minProbabilityScore > 0) count++;
    if (filterOptions.maxProbabilityScore < 100) count++;
    if (filterOptions.includedStages.length < 5) count++;
    
    setActiveFilters(count);
  };
  
  // Reset filters to default values
  const resetFilters = () => {
    setFilterOptions({
      minPotentialAum: 0,
      maxPotentialAum: 10000000,
      minProbabilityScore: 0,
      maxProbabilityScore: 100,
      includedStages: ['new', 'qualified', 'proposal', 'won', 'lost']
    });
    setActiveFilters(0);
  };
  
  // Export prospects to CSV
  const exportProspects = () => {
    if (!prospects || prospects.length === 0) return;
    
    // Filter prospects based on current filters
    const filteredProspects = prospects.filter(prospect => {
      // Apply filters
      const potentialAumInRange = 
        prospect.potentialAumValue >= filterOptions.minPotentialAum && 
        prospect.potentialAumValue <= filterOptions.maxPotentialAum;
      
      const probabilityInRange = 
        prospect.probabilityScore >= filterOptions.minProbabilityScore && 
        prospect.probabilityScore <= filterOptions.maxProbabilityScore;
      
      const stageIncluded = filterOptions.includedStages.includes(prospect.stage);
      
      // Apply search query
      const matchesSearch = searchQuery === "" || 
        prospect.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        prospect.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        prospect.phone.toLowerCase().includes(searchQuery.toLowerCase());
      
      return potentialAumInRange && probabilityInRange && stageIncluded && matchesSearch;
    });
    
    // Create CSV content
    const headers = ['Name', 'Email', 'Phone', 'Potential AUM', 'Probability Score', 'Stage', 'Last Contact', 'Products of Interest', 'Notes'];
    const rows = filteredProspects.map(p => [
      p.fullName,
      p.email,
      p.phone,
      p.potentialAum,
      `${p.probabilityScore}%`,
      p.stage,
      p.lastContactDate,
      p.productsOfInterest,
      p.notes
    ]);
    
    // Combine headers and rows
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
    
    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `prospects_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
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
  
  // Using the stages defined above
  
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
              <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="flex items-center gap-2 relative">
                    <FilterIcon className="h-4 w-4" />
                    Filter
                    {activeFilters > 0 && (
                      <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-primary text-white text-xs flex items-center justify-center">
                        {activeFilters}
                      </span>
                    )}
                    <ChevronDown className="h-4 w-4 ml-1" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-4" align="end">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold">Filter Prospects</h3>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={resetFilters}
                      className="text-xs h-8 px-2"
                    >
                      Reset
                    </Button>
                  </div>
                  
                  <div className="space-y-4">
                    {/* Potential AUM Range */}
                    <div>
                      <Label className="text-sm mb-2 block">Potential AUM Range</Label>
                      <div className="mt-6 px-2">
                        <Slider 
                          defaultValue={[filterOptions.minPotentialAum, filterOptions.maxPotentialAum]}
                          max={10000000}
                          step={100000}
                          onValueChange={(values) => {
                            setFilterOptions(prev => ({
                              ...prev,
                              minPotentialAum: values[0],
                              maxPotentialAum: values[1]
                            }));
                          }}
                        />
                      </div>
                      <div className="flex justify-between mt-2 text-xs text-slate-500">
                        <span>{formatCurrency(filterOptions.minPotentialAum)}</span>
                        <span>{formatCurrency(filterOptions.maxPotentialAum)}</span>
                      </div>
                    </div>
                    
                    {/* Probability Score Range */}
                    <div>
                      <Label className="text-sm mb-2 block">Probability Score Range</Label>
                      <div className="mt-6 px-2">
                        <Slider 
                          defaultValue={[filterOptions.minProbabilityScore, filterOptions.maxProbabilityScore]}
                          max={100}
                          step={5}
                          onValueChange={(values) => {
                            setFilterOptions(prev => ({
                              ...prev,
                              minProbabilityScore: values[0],
                              maxProbabilityScore: values[1]
                            }));
                          }}
                        />
                      </div>
                      <div className="flex justify-between mt-2 text-xs text-slate-500">
                        <span>{filterOptions.minProbabilityScore}%</span>
                        <span>{filterOptions.maxProbabilityScore}%</span>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    {/* Stages */}
                    <div>
                      <Label className="text-sm mb-2 block">Stages</Label>
                      <div className="space-y-2 mt-2">
                        {stages.map(stage => (
                          <div className="flex items-center space-x-2" key={stage.id}>
                            <Checkbox 
                              id={`stage-${stage.id}`} 
                              checked={filterOptions.includedStages.includes(stage.id)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setFilterOptions(prev => ({
                                    ...prev,
                                    includedStages: [...prev.includedStages, stage.id]
                                  }));
                                } else {
                                  setFilterOptions(prev => ({
                                    ...prev,
                                    includedStages: prev.includedStages.filter(s => s !== stage.id)
                                  }));
                                }
                              }}
                            />
                            <Label 
                              htmlFor={`stage-${stage.id}`}
                              className="text-sm font-normal cursor-pointer"
                            >
                              {stage.title}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-end mt-4">
                    <Button 
                      onClick={() => setIsFilterOpen(false)}
                      className="w-full"
                    >
                      Apply Filters
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
              
              <Button 
                variant="outline" 
                onClick={exportProspects}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Export
              </Button>
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
