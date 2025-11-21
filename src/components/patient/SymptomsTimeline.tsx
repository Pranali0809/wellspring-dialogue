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
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { symptomsApi } from "@/lib/api";

interface Symptom {
  id: string;
  name: string;
  date: Date;
  severity: "low" | "medium" | "high";
  duration: string;
  notes?: string;
}

export const SymptomsTimeline = () => {
  const patientId = "patient_1";
  const [symptoms, setSymptoms] = useState<Symptom[]>([]);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [searchQuery, setSearchQuery] = useState("");
  const [editingSymptom, setEditingSymptom] = useState<Symptom | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await symptomsApi.getSymptoms(patientId);
        setSymptoms(data.symptoms.map((s: any) => ({
          ...s,
          date: new Date(s.date)
        })));
      } catch (error) {
        console.error("Failed to fetch symptoms:", error);
      }
    };
    fetchData();
  }, []);

  const commonSymptoms = [
    "Headache", "Nausea", "Fatigue", "Pain", "Fever", "Dizziness", "Cough", 
    "Chest Pain", "Abdominal Pain", "Back Pain", "Joint Pain", "Shortness of Breath"
  ];

  const filteredSymptoms = commonSymptoms.filter(symptom =>
    symptom.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const addSymptom = async (symptomName: string, date: Date = new Date()) => {
    try {
      const newSymptom = {
        name: symptomName,
        date: date.toISOString(),
        severity: "medium",
        duration: "Ongoing",
        notes: ""
      };
      
      await symptomsApi.createSymptom(patientId, newSymptom);
      const data = await symptomsApi.getSymptoms(patientId);
      setSymptoms(data.symptoms.map((s: any) => ({
        ...s,
        date: new Date(s.date)
      })));
    } catch (error) {
      console.error("Failed to add symptom:", error);
    }
  };

  const deleteSymptom = async (id: string) => {
    try {
      await symptomsApi.deleteSymptom(patientId, id);
      setSymptoms(symptoms.filter(s => s.id !== id));
    } catch (error) {
      console.error("Failed to delete symptom:", error);
    }
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