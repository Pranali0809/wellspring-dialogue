import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Bell, Calendar, MessageSquare, Settings } from "lucide-react";
import { useEffect, useState } from "react";
import { patientHeaderApi } from "@/lib/api";

interface PatientHeaderProps {
  patientId: string;
}

export const PatientHeader = ({ patientId }: PatientHeaderProps) => {
  const [headerData, setHeaderData] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await patientHeaderApi.getHeader(patientId);
        setHeaderData(data);
      } catch (error) {
        console.error("Failed to fetch header data:", error);
      }
    };
    fetchData();
  }, [patientId]);

  if (!headerData) {
    return <div>Loading...</div>;
  }

  return (
    <header className="bg-card border-b border-border shadow-healthcare-soft">
      <div className="healthcare-container py-4">
        <div className="flex items-center justify-between">
          {/* Patient Profile */}
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16 ring-4 ring-primary-soft">
              <AvatarImage src={headerData.avatar} alt={headerData.name} />
              <AvatarFallback className="bg-gradient-primary text-primary-foreground text-lg font-semibold">
                {headerData.name.split(' ').map((n: string) => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-bold text-foreground">{headerData.name}</h1>
              <p className="text-muted-foreground">Patient ID: {headerData.patientId}</p>
              <div className="flex items-center gap-4 mt-1">
                <span className="status-indicator-info">Blood Group: {headerData.bloodGroup}</span>
                <span className="status-indicator-warning">Allergies: {headerData.allergies.join(', ')}</span>
              </div>
            </div>
          </div>

          {/* Quick Stats & Actions */}
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Next Appointment</p>
              <p className="font-semibold text-foreground">{headerData.nextAppointment}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Active Prescriptions</p>
              <p className="font-semibold text-primary">{headerData.activePrescriptions} Medications</p>
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