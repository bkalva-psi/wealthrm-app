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
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

// Type definitions
interface FilterOptions {
  minPotentialAum: number;
  maxPotentialAum: number;
  minProbabilityScore: number;
  maxProbabilityScore: number;
  includedStages: string[];
}

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
      onClick={() => {
        window.location.hash = `/prospect-detail/${prospect.id}`;
      }}
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
          <span className="font-medium">Products: </span>
          <span>{prospect.productsOfInterest}</span>
        </div>
      )}
      <div className="text-xs text-slate-500">
        <span className="font-medium">Last Contact: </span>
        <span>{formatRelativeDate(prospect.lastContactDate)}</span>
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

// Funnel Chart Component
interface FunnelChartProps {
  prospects: Prospect[];
  stages: { id: string; title: string }[];
}

function FunnelChart({ prospects, stages }: FunnelChartProps) {
  // Calculate prospect counts for each stage (excluding 'won' and 'lost' for funnel)
  const pipelineStages = stages.filter(stage => !['won', 'lost'].includes(stage.id));
  
  const funnelData = pipelineStages.map((stage, index) => {
    const count = prospects.filter(p => p.stage === stage.id).length;
    
    // Define proper hex colors for each stage
    const getStageHexColor = (stageId: string) => {
      switch (stageId.toLowerCase()) {
        case 'discovery': return '#3b82f6'; // Blue
        case 'qualified': return '#10b981'; // Green
        case 'proposal': return '#f59e0b'; // Orange
        case 'negotiation': return '#8b5cf6'; // Purple
        case 'won': return '#22c55e'; // Success green
        case 'lost': return '#ef4444'; // Red
        default: return '#6b7280'; // Gray
      }
    };
    
    return {
      stage: stage.title,
      stageId: stage.id,
      count,
      color: getStageHexColor(stage.id),
      percentage: prospects.length > 0 ? Math.round((count / prospects.length) * 100) : 0,
      level: index
    };
  });

  // Calculate funnel statistics
  const totalProspects = prospects.length;
  const wonCount = prospects.filter(p => p.stage === 'won').length;
  const lostCount = prospects.filter(p => p.stage === 'lost').length;
  const activeCount = prospects.filter(p => !['won', 'lost'].includes(p.stage)).length;

  return (
    <Card className="mb-6">
      <div className="p-6">
        <h3 className="text-lg font-semibold text-slate-800 mb-6 text-center">Sales Pipeline Funnel</h3>
        
        {funnelData.length === 0 || funnelData.every(item => item.count === 0) ? (
          <div className="text-center py-8 text-slate-500">
            No prospects data available
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row items-center gap-8">
            {/* Funnel Visualization */}
            <div className="flex-1 flex flex-col items-center">
              <div className="relative">
                {/* Funnel Segments */}
                <div className="space-y-1">
                  {funnelData.map((item, index) => {
                    // Calculate width for funnel shape (each level gets smaller)
                    const maxWidth = 320;
                    const minWidth = 120;
                    const widthStep = (maxWidth - minWidth) / Math.max(funnelData.length - 1, 1);
                    const segmentWidth = maxWidth - (index * widthStep);
                    
                    return (
                      <div key={item.stageId} className="flex flex-col items-center">
                        {/* Funnel Segment */}
                        <div
                          className="relative flex items-center justify-center text-white font-medium text-sm py-3 px-4 transition-all duration-300 hover:brightness-110"
                          style={{
                            backgroundColor: item.color,
                            width: `${segmentWidth}px`,
                            clipPath: index === funnelData.length - 1 
                              ? 'polygon(15% 0%, 85% 0%, 70% 100%, 30% 100%)'  // Bottom segment (more narrow)
                              : 'polygon(10% 0%, 90% 0%, 85% 100%, 15% 100%)', // Regular segments
                            minHeight: '50px'
                          }}
                        >
                          <div className="text-center">
                            <div className="font-semibold">{item.stage}</div>
                            <div className="text-xs opacity-90">{item.count} prospects</div>
                          </div>
                        </div>
                        
                        {/* Arrow between segments */}
                        {index < funnelData.length - 1 && (
                          <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-slate-400 my-1"></div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Statistics Panel */}
            <div className="w-full lg:w-80 space-y-4">
              <div className="grid grid-cols-2 lg:grid-cols-1 gap-4">
                {/* Pipeline Summary */}
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{activeCount}</div>
                    <div className="text-sm text-blue-700">Active Prospects</div>
                  </div>
                </div>

                <div className="bg-green-50 rounded-lg p-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{wonCount}</div>
                    <div className="text-sm text-green-700">Won Deals</div>
                  </div>
                </div>

                <div className="bg-red-50 rounded-lg p-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">{lostCount}</div>
                    <div className="text-sm text-red-700">Lost Prospects</div>
                  </div>
                </div>

                <div className="bg-slate-50 rounded-lg p-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-slate-600">{totalProspects}</div>
                    <div className="text-sm text-slate-700">Total Prospects</div>
                  </div>
                </div>
              </div>

              {/* Conversion Rate */}
              {totalProspects > 0 && (
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4">
                  <div className="text-center">
                    <div className="text-lg font-bold text-purple-600">
                      {Math.round((wonCount / totalProspects) * 100)}%
                    </div>
                    <div className="text-sm text-purple-700">Conversion Rate</div>
                  </div>
                </div>
              )}

              {/* Stage Breakdown */}
              <div className="space-y-2">
                <h4 className="font-medium text-slate-700 text-sm">Stage Breakdown</h4>
                {funnelData.map((item) => (
                  <div key={item.stageId} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: item.color }}
                      ></div>
                      <span className="text-slate-600">{item.stage}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-700">
                      <span className="font-medium">{item.count}</span>
                      <span className="text-xs text-slate-500">({item.percentage}%)</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}

function PipelineColumn({ title, prospects, stage, onProspectClick, isMobile = false }: PipelineColumnProps) {
  const [isExpanded, setIsExpanded] = useState(!isMobile);
  const stageColor = getStageColor(stage);

  return (
    <Card className={`${isMobile ? 'mb-4 w-full' : 'w-72 shrink-0'}`}>
      {isMobile ? (
        <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
          <CollapsibleTrigger asChild>
            <div 
              className="flex items-center justify-between p-3 border-b border-slate-200 cursor-pointer"
              style={{ backgroundColor: `${stageColor}20` }}
            >
              <div className="flex items-center">
                <div 
                  className="w-3 h-3 rounded-full mr-2"
                  style={{ backgroundColor: stageColor }}
                ></div>
                <h3 className="font-semibold text-slate-700">{title}</h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium bg-white rounded-full px-2 py-0.5 text-slate-700">
                  {prospects.length}
                </span>
                {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </div>
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="p-3 max-h-[60vh] overflow-auto">
              {prospects.length === 0 ? (
                <div className="text-center py-4 text-sm text-slate-500">
                  No prospects in this stage
                </div>
              ) : (
                <div>
                  {prospects.map(prospect => (
                    <ProspectCard 
                      key={prospect.id} 
                      prospect={prospect} 
                      onClick={onProspectClick} 
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      ) : (
        <>
          <div 
            className="flex items-center justify-between p-3 border-b border-slate-200"
            style={{ backgroundColor: `${stageColor}20` }}
          >
            <div className="flex items-center">
              <div 
                className="w-3 h-3 rounded-full mr-2"
                style={{ backgroundColor: stageColor }}
              ></div>
              <h3 className="font-semibold text-slate-700">{title}</h3>
            </div>
            <span className="text-xs font-medium bg-white rounded-full px-2 py-0.5 text-slate-700">
              {prospects.length}
            </span>
          </div>
          <CardContent className="p-3 h-[calc(100vh-240px)] overflow-auto">
            {prospects.length === 0 ? (
              <div className="text-center py-4 text-sm text-slate-500">
                No prospects in this stage
              </div>
            ) : (
              <div>
                {prospects.map(prospect => (
                  <ProspectCard 
                    key={prospect.id} 
                    prospect={prospect} 
                    onClick={onProspectClick} 
                  />
                ))}
              </div>
            )}
          </CardContent>
        </>
      )}
    </Card>
  );
}

export default function Prospects() {
  // Page state
  const [searchQuery, setSearchQuery] = useState("");
  const [activeProspects, setActiveProspects] = useState<Prospect[]>([]);
  const [draggedItem, setDraggedItem] = useState<Prospect | null>(null);
  
  // Filter state
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState(0);
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    minPotentialAum: 0,
    maxPotentialAum: 10000000,
    minProbabilityScore: 0,
    maxProbabilityScore: 100,
    includedStages: ['discovery', 'qualified', 'proposal', 'negotiation', 'won', 'lost']
  });
  
  // Set page title
  useEffect(() => {
    document.title = "Prospects | Wealth RM";
  }, []);

  // Setup drag sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Fetch prospects data
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
      
      // Calculate active filters
      calculateActiveFilters();
    }
  }, [prospects]);
  
  // Calculate active filters count
  const calculateActiveFilters = () => {
    let count = 0;
    
    if (filterOptions.minPotentialAum > 0) count++;
    if (filterOptions.maxPotentialAum < 10000000) count++;
    if (filterOptions.minProbabilityScore > 0) count++;
    if (filterOptions.maxProbabilityScore < 100) count++;
    if (filterOptions.includedStages.length < 6) count++;
    
    setActiveFilters(count);
  };
  
  // Handle drag start event
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const prospect = activeProspects.find(p => p.id === active.id);
    if (prospect) {
      setDraggedItem(prospect);
    }
  };
  
  // Handle drag end event
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (active && over && active.id !== over.id) {
      setActiveProspects(prospects => {
        const oldIndex = prospects.findIndex(p => p.id === active.id);
        const newIndex = prospects.findIndex(p => p.id === over.id);
        
        return arrayMove(prospects, oldIndex, newIndex);
      });
      
      // In a real application, we would update the database with the new stage
      console.log(`Moving prospect ${active.id} to a new stage`);
    }
  };
  
  const isMobile = useIsMobile();
  
  // Apply filters and search to prospects
  const filteredProspects = activeProspects
    ? activeProspects.filter(prospect => {
        // Apply search filter
        const matchesSearch = !searchQuery || 
          prospect.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          prospect.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (prospect.productsOfInterest && 
            prospect.productsOfInterest.toLowerCase().includes(searchQuery.toLowerCase()));
        
        // Apply stage filter
        const matchesStage = filterOptions.includedStages.includes(prospect.stage);
        
        // Apply potential AUM filter
        const matchesAum = prospect.potentialAumValue >= filterOptions.minPotentialAum && 
                          prospect.potentialAumValue <= filterOptions.maxPotentialAum;
        
        // Apply probability score filter
        const matchesProbability = prospect.probabilityScore >= filterOptions.minProbabilityScore && 
                                  prospect.probabilityScore <= filterOptions.maxProbabilityScore;
        
        return matchesSearch && matchesStage && matchesAum && matchesProbability;
      })
    : [];
    
  // Reset filters function
  const resetFilters = () => {
    setFilterOptions({
      minPotentialAum: 0,
      maxPotentialAum: 10000000,
      minProbabilityScore: 0,
      maxProbabilityScore: 100,
      includedStages: ['discovery', 'qualified', 'proposal', 'negotiation', 'won', 'lost']
    });
  };
  
  // Export prospects to CSV
  const exportProspects = () => {
    if (!filteredProspects || filteredProspects.length === 0) return;
    
    // Create CSV content
    const headers = ['Name', 'Email', 'Phone', 'Potential AUM', 'Probability Score', 'Stage', 'Last Contact', 'Products of Interest', 'Notes'];
    const rows = filteredProspects.map(p => [
      p.fullName,
      p.email || '',
      p.phone || '',
      p.potentialAum,
      `${p.probabilityScore}%`,
      p.stage,
      p.lastContactDate || '',
      p.productsOfInterest || '',
      p.notes || ''
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
  
  // Get prospects for a specific stage
  const getProspectsByStage = (stage: string) => {
    if (!filteredProspects) return [];
    return filteredProspects.filter(prospect => prospect.stage === stage);
  };
  
  // Handle prospect click
  const handleProspectClick = (id: number) => {
    window.location.hash = `/prospects/${id}`;
  };
  
  // Handle add prospect click
  const handleAddProspectClick = () => {
    window.location.hash = "/prospects/new";
  };
  
  if (isLoading) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Prospects</h1>
        <div className="flex justify-center items-center h-64">
          <p className="text-slate-500">Loading prospects...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="p-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6">
        <h1 className="text-2xl font-bold mb-2 sm:mb-0">Prospects</h1>
        <Button 
          onClick={handleAddProspectClick}
          className="flex items-center gap-2"
        >
          <UserPlus className="h-4 w-4" />
          Add Prospect
        </Button>
      </div>
      
      {/* Funnel Chart */}
      <FunnelChart prospects={filteredProspects} stages={stages} />
      
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
            <Input 
              placeholder="Search prospects..." 
              className="pl-10" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
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
      </div>
      
      {filteredProspects.length === 0 ? (
        <div className="bg-white p-6 rounded-md shadow-sm border border-slate-200 text-center">
          <p className="text-slate-500 mb-4">No prospects match your search criteria</p>
          <Button variant="outline" onClick={resetFilters}>
            Reset Filters
          </Button>
        </div>
      ) : (
        isMobile ? (
          <div className="space-y-4">
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
          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <div className="flex gap-4 overflow-x-auto pb-4">
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
            <DragOverlay>
              {draggedItem ? (
                <div className="w-72">
                  <ProspectCard prospect={draggedItem} onClick={() => {}} />
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>
        )
      )}
    </div>
  );
}