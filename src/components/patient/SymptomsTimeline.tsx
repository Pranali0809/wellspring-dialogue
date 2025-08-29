import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Plus, AlertTriangle } from "lucide-react";
import { useState } from "react";

interface Symptom {
  id: string;
  name: string;
  date: Date;
  severity: "low" | "medium" | "high";
  duration: string;
  notes?: string;
}

export const SymptomsTimeline = () => {
  const [symptoms] = useState<Symptom[]>([
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
          <Button size="sm" className="btn-healthcare-primary">
            <Plus className="h-4 w-4 mr-2" />
            Add Symptom
          </Button>
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
                <Tooltip key={symptom.id}>
                  <TooltipTrigger asChild>
                    <div className="flex flex-col items-center cursor-pointer group">
                      {/* Dot */}
                      <div className={`w-4 h-4 rounded-full border-2 border-background z-10 transition-all duration-200 group-hover:scale-125 ${getSeverityColor(symptom.severity)}`}></div>
                      
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
                  <TooltipContent className="max-w-64">
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
              ))}
            </div>
          </TooltipProvider>
        </div>

        {/* Quick Add Section */}
        <div className="mt-6 p-4 bg-primary-soft rounded-lg border border-primary-light">
          <p className="text-sm text-primary-foreground mb-2">Quick symptom entry:</p>
          <div className="flex gap-2 flex-wrap">
            {["Headache", "Nausea", "Fatigue", "Pain", "Fever"].map((symptom) => (
              <Button key={symptom} variant="ghost" size="sm" className="text-xs bg-background hover:bg-hover">
                {symptom}
              </Button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};