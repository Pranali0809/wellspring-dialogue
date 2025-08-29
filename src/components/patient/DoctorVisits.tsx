import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CalendarDays, Stethoscope, FileText, Paperclip } from "lucide-react";

interface Visit {
  id: string;
  doctorName: string;
  specialty: string;
  date: Date;
  chiefComplaint: string;
  keyNotes: string;
  hasAttachments: boolean;
  avatar?: string;
}

export const DoctorVisits = () => {
  const visits: Visit[] = [
    {
      id: "1",
      doctorName: "Dr. Sarah Mitchell",
      specialty: "Endocrinology",
      date: new Date("2024-03-01"),
      chiefComplaint: "Diabetes follow-up",
      keyNotes: "Blood sugar levels improved. Continue current medication.",
      hasAttachments: true,
      avatar: "/placeholder.svg"
    },
    {
      id: "2", 
      doctorName: "Dr. James Rodriguez",
      specialty: "Cardiology",
      date: new Date("2024-02-15"),
      chiefComplaint: "Chest pain evaluation",
      keyNotes: "EKG normal. Recommended stress test.",
      hasAttachments: false
    },
    {
      id: "3",
      doctorName: "Dr. Emily Chen",
      specialty: "Internal Medicine", 
      date: new Date("2024-01-20"),
      chiefComplaint: "Annual physical",
      keyNotes: "Overall health good. Updated vaccinations.",
      hasAttachments: true
    },
    {
      id: "4",
      doctorName: "Dr. Michael Thompson",
      specialty: "Orthopedics",
      date: new Date("2023-12-10"),
      chiefComplaint: "Knee pain",
      keyNotes: "Mild arthritis. Physical therapy recommended.",
      hasAttachments: false
    }
  ];

  const getSpecialtyColor = (specialty: string) => {
    const colors = {
      "Endocrinology": "bg-primary-soft text-primary",
      "Cardiology": "bg-destructive-soft text-destructive", 
      "Internal Medicine": "bg-success-soft text-success",
      "Orthopedics": "bg-warning-soft text-warning"
    };
    return colors[specialty as keyof typeof colors] || "bg-muted text-muted-foreground";
  };

  return (
    <Card className="card-healthcare">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Stethoscope className="h-5 w-5 text-primary" />
            Doctor Visits
          </div>
          <Button size="sm" className="btn-healthcare-primary">
            <CalendarDays className="h-4 w-4 mr-2" />
            Book Appointment
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Visits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-4">
          {visits.map((visit) => (
            <div 
              key={visit.id}
              className="card-healthcare-interactive p-4 space-y-3"
            >
              {/* Doctor Info */}
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={visit.avatar} alt={visit.doctorName} />
                  <AvatarFallback className="bg-gradient-primary text-primary-foreground text-sm font-semibold">
                    {visit.doctorName.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h4 className="font-semibold text-foreground">{visit.doctorName}</h4>
                  <Badge variant="secondary" className={`text-xs ${getSpecialtyColor(visit.specialty)}`}>
                    {visit.specialty}
                  </Badge>
                </div>
                {visit.hasAttachments && (
                  <Paperclip className="h-4 w-4 text-muted-foreground" />
                )}
              </div>

              {/* Visit Details */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Date:</span>
                  <span className="text-foreground font-medium">
                    {visit.date.toLocaleDateString()}
                  </span>
                </div>
                <div className="text-sm">
                  <span className="text-muted-foreground">Chief Complaint:</span>
                  <p className="text-foreground font-medium mt-1">{visit.chiefComplaint}</p>
                </div>
                <div className="text-sm">
                  <span className="text-muted-foreground">Key Notes:</span>
                  <p className="text-foreground mt-1">{visit.keyNotes}</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-2 border-t border-border">
                <Button variant="ghost" size="sm" className="text-xs">
                  <FileText className="h-3 w-3 mr-1" />
                  View Details
                </Button>
                {visit.hasAttachments && (
                  <Button variant="ghost" size="sm" className="text-xs">
                    <Paperclip className="h-3 w-3 mr-1" />
                    Attachments
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Summary Stats */}
        <div className="mt-6 p-4 bg-card-soft rounded-lg border border-border">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-lg font-bold text-primary">{visits.length}</div>
              <div className="text-xs text-muted-foreground">Total Visits</div>
            </div>
            <div>
              <div className="text-lg font-bold text-success">
                {new Set(visits.map(v => v.specialty)).size}
              </div>
              <div className="text-xs text-muted-foreground">Specialties</div>
            </div>
            <div>
              <div className="text-lg font-bold text-warning">
                {visits.filter(v => v.hasAttachments).length}
              </div>
              <div className="text-xs text-muted-foreground">With Reports</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};