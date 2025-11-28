import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PreAppointmentAssessment } from "@/components/patient/PreAppointmentAssessment";
import { CalendarDays, Clock, MapPin, Sparkles } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";

interface Appointment {
  id: string;
  doctor_id: string;
  patient_id: string;
  date: string;
  time?: string;
  location?: string;
  doctor_name?: string;
  doctor_specialty?: string;
  status: string;
  pre_assessment?: {
    status: string;
    completed_at?: any;
  };
}

interface PatientAppointmentsProps {
  patientId: string;
}

export const PatientAppointments = ({ patientId }: PatientAppointmentsProps) => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAppointments();
  }, [patientId]);

  const fetchAppointments = async () => {
    try {
      // TODO: Implement actual API call to fetch appointments for patient
      // For now, mock data
      setAppointments([
        {
          id: "apt_001",
          doctor_id: "doctor_1",
          patient_id: patientId,
          date: "2024-03-15",
          time: "10:00 AM",
          location: "Cardiology Clinic, Room 205",
          doctor_name: "Dr. Sarah Johnson",
          doctor_specialty: "Cardiology",
          status: "scheduled",
          pre_assessment: {
            status: "not_started"
          }
        }
      ]);
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch appointments:", error);
      toast.error("Failed to load appointments");
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      scheduled: "bg-primary-soft text-primary",
      completed: "bg-success-soft text-success",
      cancelled: "bg-destructive-soft text-destructive",
    };
    return colors[status as keyof typeof colors] || "bg-muted text-muted-foreground";
  };

  if (loading) {
    return (
      <Card className="card-healthcare">
        <CardContent className="py-8 text-center text-muted-foreground">
          Loading appointments...
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="card-healthcare">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarDays className="h-5 w-5 text-primary" />
          Upcoming Appointments
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {appointments.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No upcoming appointments
          </div>
        ) : (
          appointments.map((appointment) => (
            <div key={appointment.id} className="space-y-4">
              <div className="card-healthcare-interactive p-4 space-y-3">
                {/* Doctor Info */}
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-gradient-primary text-primary-foreground text-sm font-semibold">
                      {appointment.doctor_name?.split(' ').map(n => n[0]).join('') || 'DR'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h4 className="font-semibold text-foreground">{appointment.doctor_name}</h4>
                    <Badge variant="secondary" className="text-xs">
                      {appointment.doctor_specialty}
                    </Badge>
                  </div>
                  <Badge className={getStatusColor(appointment.status)}>
                    {appointment.status}
                  </Badge>
                </div>

                {/* Appointment Details */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <CalendarDays className="h-4 w-4 text-muted-foreground" />
                    <span className="text-foreground font-medium">
                      {new Date(appointment.date).toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </span>
                  </div>
                  {appointment.time && (
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-foreground">{appointment.time}</span>
                    </div>
                  )}
                  {appointment.location && (
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="text-foreground">{appointment.location}</span>
                    </div>
                  )}
                </div>

                {/* Pre-Assessment Status */}
                {appointment.pre_assessment && (
                  <div className="pt-2 border-t border-border">
                    <div className="flex items-center gap-2 text-sm">
                      <Sparkles className="h-4 w-4 text-primary" />
                      <span className="text-muted-foreground">Pre-Assessment:</span>
                      <Badge variant={
                        appointment.pre_assessment.status === "completed" ? "secondary" : "outline"
                      } className={
                        appointment.pre_assessment.status === "completed" 
                          ? "bg-success-soft text-success" 
                          : ""
                      }>
                        {appointment.pre_assessment.status === "completed" ? "Completed" : "Not Started"}
                      </Badge>
                    </div>
                  </div>
                )}
              </div>

              {/* Pre-Appointment Assessment Component */}
              {appointment.status === "scheduled" && (
                <PreAppointmentAssessment appointmentId={appointment.id} />
              )}
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
};
