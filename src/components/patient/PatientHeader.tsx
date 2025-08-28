import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Bell, Calendar, MessageSquare, Settings } from "lucide-react";

export const PatientHeader = () => {
  return (
    <header className="bg-card border-b border-border shadow-healthcare-soft">
      <div className="healthcare-container py-4">
        <div className="flex items-center justify-between">
          {/* Patient Profile */}
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16 ring-4 ring-primary-soft">
              <AvatarImage src="/placeholder.svg" alt="Sarah Johnson" />
              <AvatarFallback className="bg-gradient-primary text-primary-foreground text-lg font-semibold">
                SJ
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Sarah Johnson</h1>
              <p className="text-muted-foreground">Patient ID: PT-2024-001</p>
              <div className="flex items-center gap-4 mt-1">
                <span className="status-indicator-info">Blood Group: O+</span>
                <span className="status-indicator-warning">Allergies: Peanuts</span>
              </div>
            </div>
          </div>

          {/* Quick Stats & Actions */}
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Next Appointment</p>
              <p className="font-semibold text-foreground">March 15, 2024</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Active Prescriptions</p>
              <p className="font-semibold text-primary">3 Medications</p>
            </div>
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