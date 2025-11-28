import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Bell, Calendar, MessageSquare, Settings, Users, Clock } from "lucide-react";
import { useEffect, useState } from "react";
import { doctorApi } from "@/lib/api";

interface DoctorHeaderProps {
  doctorId: string;
}

export const DoctorHeader = ({ doctorId }: DoctorHeaderProps) => {
  const [doctorInfo, setDoctorInfo] = useState<any>(null);
  const [appointments, setAppointments] = useState<any>(null);
  const [activePatients, setActivePatients] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [info, appts, patients] = await Promise.all([
          
          doctorApi.getInfo(doctorId),
          doctorApi.getTodayAppointments(doctorId),
          doctorApi.getActivePatients(doctorId)
        ]);
        setDoctorInfo(info);
        console.log("info", info);
        console.log("appts", appts);
        console.log("patients", patients);
        setAppointments(appts);
        setActivePatients(patients);
        console.log("doctorInfo", doctorInfo);
        console.log("appointments", appointments);
        console.log("activePatients", activePatients);
      } catch (error) {
        console.error("Failed to fetch doctor data:", error);
      }
    };
    fetchData();
  }, [doctorId]);

  if (!doctorInfo || !appointments || !activePatients) {
    return null;
  }

  return (
    <header className="bg-card border-b border-border shadow-healthcare-soft">
      <div className="healthcare-container py-4">
        <div className="flex items-center justify-between">
          {/* Doctor Profile */}
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16 ring-4 ring-success-soft">
              <AvatarImage src="/placeholder.svg" alt={doctorInfo.name} />
              <AvatarFallback className="bg-gradient-success text-success-foreground text-lg font-semibold">
                {doctorInfo.name.split(' ').map((n: string) => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-bold text-foreground">{doctorInfo.name}</h1>
              <p className="text-muted-foreground">{doctorInfo.certified_board}</p>
              <div className="flex items-center gap-4 mt-1">
                <span className="status-indicator-success">{doctorInfo.status}</span>
                <span className="status-indicator-info">License: {doctorInfo.license_id}</span>
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
                  <p className="text-lg font-bold text-primary">{appointments.total_appointments_today}</p>
                  <p className="text-xs text-muted-foreground">Appointments</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-success">{appointments.completed_appointments_today}</p>
                  <p className="text-xs text-muted-foreground">Completed</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-warning">{appointments.remaining_appointments_today}</p>
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
                  <p className="text-lg font-bold text-primary">{activePatients.active_patients.length}</p>
                  <p className="text-xs text-muted-foreground">Active Patients</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-warning">{activePatients.critical_patients.length}</p>
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