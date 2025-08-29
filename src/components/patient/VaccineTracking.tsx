import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Shield, Calendar, CheckCircle, AlertCircle, Clock } from "lucide-react";

interface Vaccine {
  id: string;
  name: string;
  status: "completed" | "due" | "scheduled" | "overdue";
  lastDate?: Date;
  nextDate?: Date;
  location?: string;
}

export const VaccineTracking = () => {
  const vaccines: Vaccine[] = [
    {
      id: "1",
      name: "COVID-19 Booster",
      status: "completed",
      lastDate: new Date("2024-01-15"),
      nextDate: new Date("2024-07-15")
    },
    {
      id: "2",
      name: "Flu Shot",
      status: "due",
      nextDate: new Date("2024-03-20")
    },
    {
      id: "3",
      name: "Tetanus",
      status: "scheduled",
      nextDate: new Date("2024-04-10"),
      location: "City Medical Center"
    },
    {
      id: "4",
      name: "Hepatitis B",
      status: "completed",
      lastDate: new Date("2023-06-12"),
      nextDate: new Date("2025-06-12")
    },
    {
      id: "5",
      name: "Pneumonia",
      status: "overdue",
      nextDate: new Date("2024-02-01")
    }
  ];

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "completed":
        return {
          icon: CheckCircle,
          color: "bg-success-soft text-success",
          bgColor: "bg-success-light"
        };
      case "due":
        return {
          icon: Calendar,
          color: "bg-warning-soft text-warning",
          bgColor: "bg-warning-soft"
        };
      case "scheduled":
        return {
          icon: Clock,
          color: "bg-primary-soft text-primary",
          bgColor: "bg-primary-light"
        };
      case "overdue":
        return {
          icon: AlertCircle,
          color: "bg-destructive-soft text-destructive",
          bgColor: "bg-destructive-soft"
        };
      default:
        return {
          icon: Calendar,
          color: "bg-muted text-muted-foreground",
          bgColor: "bg-muted"
        };
    }
  };

  const upcomingVaccines = vaccines.filter(v => v.status === "due" || v.status === "overdue");

  return (
    <Card className="card-healthcare">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          Vaccine Tracking
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Next Due Highlight */}
        {upcomingVaccines.length > 0 && (
          <div className="p-4 bg-warning-soft rounded-lg border border-warning">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-warning">Next Due: {upcomingVaccines[0].name}</h4>
                <p className="text-sm text-warning">
                  {upcomingVaccines[0].nextDate?.toLocaleDateString()}
                </p>
              </div>
              <Button size="sm" className="btn-healthcare-primary">
                Schedule Now
              </Button>
            </div>
          </div>
        )}

        {/* Vaccine Status Grid */}
        <div className="grid grid-cols-1 gap-3">
          {vaccines.map((vaccine) => {
            const config = getStatusConfig(vaccine.status);
            const StatusIcon = config.icon;
            
            return (
              <div 
                key={vaccine.id} 
                className={`p-3 rounded-lg border transition-all duration-200 hover:shadow-md ${config.bgColor}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <StatusIcon className="h-5 w-5 text-inherit" />
                    <div>
                      <h4 className="font-semibold text-foreground">{vaccine.name}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        {vaccine.lastDate && (
                          <span className="text-xs text-muted-foreground">
                            Last: {vaccine.lastDate.toLocaleDateString()}
                          </span>
                        )}
                        {vaccine.nextDate && (
                          <span className="text-xs text-muted-foreground">
                            Next: {vaccine.nextDate.toLocaleDateString()}
                          </span>
                        )}
                        {vaccine.location && (
                          <span className="text-xs text-muted-foreground">
                            @ {vaccine.location}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <Badge variant="secondary" className={config.color}>
                    {vaccine.status}
                  </Badge>
                </div>
              </div>
            );
          })}
        </div>

        {/* Calendar Heatmap Visualization */}
        <div className="p-4 bg-card-soft rounded-lg border border-border">
          <h4 className="font-semibold text-foreground mb-3">Vaccine Calendar</h4>
          <div className="grid grid-cols-12 gap-1">
            {Array.from({ length: 12 }, (_, i) => {
              const month = new Date(2024, i, 1);
              const hasVaccine = vaccines.some(v => 
                v.nextDate && v.nextDate.getMonth() === i
              );
              
              return (
                <div 
                  key={i}
                  className={`h-8 rounded flex items-center justify-center text-xs font-medium transition-colors ${
                    hasVaccine 
                      ? "bg-primary text-primary-foreground" 
                      : "bg-muted text-muted-foreground hover:bg-hover"
                  }`}
                >
                  {month.toLocaleDateString('en-US', { month: 'short' })}
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex gap-2">
          <Button size="sm" className="btn-healthcare-success flex-1">
            <Shield className="h-4 w-4 mr-2" />
            Schedule Vaccine
          </Button>
          <Button size="sm" variant="outline" className="flex-1">
            <Calendar className="h-4 w-4 mr-2" />
            View History
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};