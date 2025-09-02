import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from "@/components/ui/context-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Plus, AlertTriangle, CalendarIcon, Search, Edit, Trash2 } from "lucide-react";
import { useState } from "react";
import { format } from "date-fns";

interface Symptom {
  id: string;
  name: string;
  date: Date;
  severity: "low" | "medium" | "high";
  duration: string;
  notes?: string;
}

export const SymptomsTimeline = () => {
  const [symptoms, setSymptoms] = useState<Symptom[]>([
    {
      id: "1",
      name: "Headache",
      date: new Date("2024-03-01"),
      severity: "medium",
      duration: "2 hours",
      notes: "Started after lunch, possibly stress-related"
    },
    {
      id: "2", 
      name: "Fatigue",
      date: new Date("2024-03-03"),
      severity: "low",
      duration: "All day",
      notes: "Feeling tired throughout the day"
    },
    {
      id: "3",
      name: "Nausea",
      date: new Date("2024-03-05"),
      severity: "high",
      duration: "30 minutes",
      notes: "After taking medication on empty stomach"
    },
    {
      id: "4",
      name: "Dizziness",
      date: new Date("2024-03-08"),
      severity: "medium",
      duration: "10 minutes",
      notes: "When standing up quickly"
    },
    {
      id: "5",
      name: "Chest Pain",
      date: new Date("2024-03-10"),
      severity: "high", 
      duration: "5 minutes",
      notes: "Sharp pain, resolved quickly"
    }
  ]);

  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [searchQuery, setSearchQuery] = useState("");
  const [editingSymptom, setEditingSymptom] = useState<Symptom | null>(null);

  const commonSymptoms = [
    "Headache", "Nausea", "Fatigue", "Pain", "Fever", "Dizziness", "Cough", 
    "Chest Pain", "Abdominal Pain", "Back Pain", "Joint Pain", "Shortness of Breath"
  ];

  const filteredSymptoms = commonSymptoms.filter(symptom =>
    symptom.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const addSymptom = (symptomName: string, date: Date = new Date()) => {
    const newSymptom: Symptom = {
      id: Date.now().toString(),
      name: symptomName,
      date,
      severity: "medium",
      duration: "Ongoing",
      notes: ""
    };
    setSymptoms([...symptoms, newSymptom].sort((a, b) => a.date.getTime() - b.date.getTime()));
  };

  const deleteSymptom = (id: string) => {
    setSymptoms(symptoms.filter(s => s.id !== id));
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high": return "bg-destructive text-destructive-foreground";
      case "medium": return "bg-warning text-warning-foreground";
      case "low": return "bg-success text-success-foreground";
      default: return "bg-muted text-muted-foreground";
    }
  };

  return (
    <Card className="card-healthcare">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-primary" />
            Symptoms Timeline
          </div>
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button size="sm" className="btn-healthcare-primary">
                <Plus className="h-4 w-4 mr-2" />
                Add Symptom
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Add New Symptom</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Date</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {selectedDate ? format(selectedDate, "PPP") : "Select date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        initialFocus
                        className="p-3 pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Search Symptoms</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search for symptoms..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <div className="max-h-48 overflow-y-auto space-y-1">
                    {filteredSymptoms.map((symptom) => (
                      <Button
                        key={symptom}
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start"
                        onClick={() => {
                          addSymptom(symptom, selectedDate || new Date());
                          setShowAddDialog(false);
                          setSelectedDate(undefined);
                          setSearchQuery("");
                        }}
                      >
                        {symptom}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Timeline Strip */}
        <div className="relative">
          {/* Timeline Line */}
          <div className="absolute top-6 left-0 right-0 h-0.5 bg-border"></div>
          
          {/* Symptom Dots */}
          <TooltipProvider>
            <div className="flex items-center justify-between relative">
              {symptoms.map((symptom, index) => (
                <ContextMenu key={symptom.id}>
                  <ContextMenuTrigger>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex flex-col items-center cursor-pointer group hover:bg-white hover:rounded-lg hover:p-2 hover:-m-2 transition-all duration-200">
                          {/* Dot */}
                          <div className="w-4 h-4 rounded-full border-2 border-background z-10 transition-all duration-200 group-hover:scale-125 bg-primary text-primary-foreground"></div>
                          
                          {/* Label */}
                          <div className="mt-3 text-center">
                            <p className="text-xs font-medium text-foreground truncate max-w-16">
                              {symptom.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {symptom.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </p>
                          </div>
                        </div>
                      </TooltipTrigger>
                  <TooltipContent className="max-w-64 bg-white border border-border shadow-lg">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold">{symptom.name}</h4>
                        <Badge variant="secondary" className={getSeverityColor(symptom.severity)}>
                          {symptom.severity}
                        </Badge>
                      </div>
                      <p className="text-sm">
                        <strong>Date:</strong> {symptom.date.toLocaleDateString()}
                      </p>
                      <p className="text-sm">
                        <strong>Duration:</strong> {symptom.duration}
                      </p>
                      {symptom.notes && (
                        <p className="text-sm">
                          <strong>Notes:</strong> {symptom.notes}
                        </p>
                      )}
                    </div>
                  </TooltipContent>
                </Tooltip>
                  </ContextMenuTrigger>
                  <ContextMenuContent>
                    <ContextMenuItem 
                      className="text-destructive focus:text-destructive"
                      onClick={() => deleteSymptom(symptom.id)}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete Symptom
                    </ContextMenuItem>
                  </ContextMenuContent>
                </ContextMenu>
              ))}
            </div>
          </TooltipProvider>
        </div>

        {/* Quick Add Section */}
        <div className="mt-6 p-4 bg-muted rounded-lg border border-border">
          <p className="text-sm text-foreground mb-2">Quick symptom entry:</p>
          <div className="flex gap-2 flex-wrap">
            {["Headache", "Nausea", "Fatigue", "Pain", "Fever"].map((symptom) => (
              <Button 
                key={symptom} 
                variant="ghost" 
                size="sm" 
                className="text-xs bg-background hover:bg-hover"
                onClick={() => addSymptom(symptom, new Date())}
              >
                {symptom}
              </Button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};