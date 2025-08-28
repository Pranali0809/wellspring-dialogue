import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Bell, Calendar, MessageSquare, Settings, Users, Clock } from "lucide-react";

export const DoctorHeader = () => {
  return (
    <header className="bg-card border-b border-border shadow-healthcare-soft">
      <div className="healthcare-container py-4">
        <div className="flex items-center justify-between">
          {/* Doctor Profile */}
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16 ring-4 ring-success-soft">
              <AvatarImage src="/placeholder.svg" alt="Dr. Emily Rodriguez" />
              <AvatarFallback className="bg-gradient-success text-success-foreground text-lg font-semibold">
                ER
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Dr. Emily Rodriguez</h1>
              <p className="text-muted-foreground">Internal Medicine • Board Certified</p>
              <div className="flex items-center gap-4 mt-1">
                <span className="status-indicator-success">Active</span>
                <span className="status-indicator-info">License: MD-2024-001</span>
              </div>
            </div>
          </div>

          {/* Today's Stats & Actions */}
          <div className="flex items-center gap-6">
            {/* Today's Appointments */}
            <div className="text-center">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="h-4 w-4 text-primary" />
                <span className="text-sm text-muted-foreground">Today's Schedule</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <p className="text-lg font-bold text-primary">12</p>
                  <p className="text-xs text-muted-foreground">Appointments</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-success">8</p>
                  <p className="text-xs text-muted-foreground">Completed</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-warning">4</p>
                  <p className="text-xs text-muted-foreground">Remaining</p>
                </div>
              </div>
            </div>

            {/* Patient Stats */}
            <div className="text-center border-l border-border pl-6">
              <div className="flex items-center gap-2 mb-1">
                <Users className="h-4 w-4 text-primary" />
                <span className="text-sm text-muted-foreground">Patient Overview</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <p className="text-lg font-bold text-primary">247</p>
                  <p className="text-xs text-muted-foreground">Active Patients</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-warning">3</p>
                  <p className="text-xs text-muted-foreground">Critical Flags</p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="healthcare-hover-glow">
                <Bell className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="healthcare-hover-glow">
                <Calendar className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="healthcare-hover-glow">
                <MessageSquare className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="healthcare-hover-glow">
                <Settings className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};