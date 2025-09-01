import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Upload, Calendar, Pill, Zap, ChevronRight, Sparkles, X } from "lucide-react";
import { useState } from "react";

export const QuickActions = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  const quickActions = [
    {
      id: "symptom",
      title: "Report Symptom",
      description: "Add a new symptom to your timeline",
      icon: Plus,
      color: "bg-primary text-primary-foreground",
      steps: ["Select symptom", "Rate severity", "Add notes", "Confirm"]
    },
    {
      id: "upload",
      title: "Upload Lab Report",
      description: "Add test results or medical documents", 
      icon: Upload,
      color: "bg-success text-success-foreground",
      steps: ["Choose file", "Auto-extract data", "Review & confirm", "Save"]
    },
    {
      id: "appointment",
      title: "Book Appointment",
      description: "Schedule with your healthcare provider",
      icon: Calendar,
      color: "bg-warning text-warning-foreground", 
      steps: ["Select doctor", "Choose date", "Add reason", "Confirm"]
    },
    {
      id: "refill",
      title: "Request Refill",
      description: "Get prescription refilled quickly",
      icon: Pill,
      color: "bg-destructive text-destructive-foreground",
      steps: ["Select medication", "Choose pharmacy", "Set reminder", "Submit"]
    }
  ];

  const aiSuggestions = [
    "You mentioned fever last week - would you like to add it to your timeline?",
    "Your diabetes medication is due for refill in 3 days.",
    "Consider scheduling your annual physical exam."
  ];

  return (
    <div className="fixed bottom-6 right-6 z-40 max-w-sm max-h-[calc(100vh-3rem)] overflow-y-auto">
      {/* AI Suggestions */}
      {aiSuggestions.length > 0 && (
        <div className="mb-4 space-y-2 max-w-sm">
          {aiSuggestions.slice(0, isExpanded ? 3 : 1).map((suggestion, index) => (
            <div 
              key={index}
              className="p-3 bg-muted border border-border rounded-lg shadow-healthcare-medium animate-healthcare-slide-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-start gap-2">
                <Sparkles className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm text-foreground">{suggestion}</p>
                  <Button size="sm" variant="ghost" className="h-6 px-2 mt-2 text-xs text-primary hover:text-primary-foreground hover:bg-primary">
                    Add now
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Quick Actions Panel */}
      <Card className={`transition-all duration-300 shadow-healthcare-large ${
        isExpanded ? 'w-80 max-w-[calc(100vw-3rem)]' : 'w-16'
      }`}>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center justify-between">
            <div className={`flex items-center gap-2 ${isExpanded ? '' : 'hidden'}`}>
              <Zap className="h-5 w-5 text-primary" />
              Quick Actions
            </div>
            <div className="flex items-center gap-1">
              {isExpanded && (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => setIsExpanded(false)}
                  className="h-8 w-8"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setIsExpanded(!isExpanded)}
                className="healthcare-hover-glow"
              >
                {isExpanded ? (
                  <ChevronRight className="h-5 w-5 rotate-180" />
                ) : (
                  <Zap className="h-5 w-5" />
                )}
              </Button>
            </div>
          </CardTitle>
        </CardHeader>

        {isExpanded && (
          <CardContent className="space-y-3 animate-healthcare-fade-in">
            {quickActions.map((action) => {
              const IconComponent = action.icon;
              
              return (
                <div 
                  key={action.id}
                  className="card-healthcare-interactive p-3 space-y-2 group"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg ${action.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                      <IconComponent className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-foreground">{action.title}</h4>
                      <p className="text-xs text-muted-foreground">{action.description}</p>
                    </div>
                  </div>

                  {/* Action Steps Preview */}
                  <div className="ml-13 space-y-1">
                    {action.steps.map((step, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full bg-muted text-muted-foreground text-xs flex items-center justify-center font-medium">
                          {index + 1}
                        </div>
                        <span className="text-xs text-muted-foreground">{step}</span>
                      </div>
                    ))}
                  </div>

                  {/* Action Button */}
                  <Button size="sm" className="w-full btn-healthcare-primary mt-2">
                    Start {action.title}
                  </Button>
                </div>
              );
            })}

            {/* Emergency Contact */}
            <div className="p-3 bg-destructive-soft border border-destructive rounded-lg">
              <div className="text-center">
                <h4 className="font-semibold text-destructive mb-1">Emergency</h4>
                <p className="text-xs text-destructive mb-2">Need immediate medical attention?</p>
                <Button size="sm" className="bg-destructive text-destructive-foreground hover:opacity-90 w-full">
                  Call 911
                </Button>
              </div>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
};