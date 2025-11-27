import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, Filter, Users, AlertTriangle, Calendar, Phone } from "lucide-react";
import { useState, useEffect } from "react";
import { Patient } from "@/pages/DoctorDashboard";
import { doctorApi } from "@/lib/api";

interface PatientListProps {
  onPatientSelect: (patient: Patient) => void;
  selectedPatient: Patient | null;
  doctorId: string;
}

export const PatientList = ({ onPatientSelect, selectedPatient, doctorId }: PatientListProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState<"all" | "new" | "followup" | "critical">("all");
  const [patients, setPatients] = useState<Patient[]>([]);

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const data = await doctorApi.getPatients(doctorId);
        setPatients(data.map((p: any) => ({
          id: p.id,
          name: p.name,
          age: p.age,
          gender: p.gender,
          bloodGroup: p.blood_group,
          allergies: p.allergies,
          chronicConditions: p.chronic_conditions.map((c: any) => typeof c === 'string' ? c : c.name),
          lastVisit: new Date(p.last_visit),
          nextAppointment: p.next_appointment ? new Date(p.next_appointment) : undefined,
          criticalFlags: p.critical_flags,
          avatar: p.avatar
        })));
      } catch (error) {
        console.error("Failed to fetch patients:", error);
      }
    };
    fetchPatients();
  }, [doctorId]);

  const filteredPatients = patients.filter(patient => {
    const matchesSearch = patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         patient.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         patient.chronicConditions.some(condition => 
                           condition.toLowerCase().includes(searchTerm.toLowerCase())
                         );
    
    const matchesFilter = filter === "all" || 
                         (filter === "critical" && patient.criticalFlags.length > 0) ||
                         (filter === "new" && !patient.nextAppointment) ||
                         (filter === "followup" && !!patient.nextAppointment);

    return matchesSearch && matchesFilter;
  });

  const getCriticalityLevel = (patient: Patient) => {
    if (patient.criticalFlags.length >= 2) return "high";
    if (patient.criticalFlags.length === 1) return "medium";
    return "low";
  };

  return (
    <Card className="card-healthcare">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Patient List
            <Badge variant="secondary" className="bg-primary-soft text-primary">
              {filteredPatients.length} patients
            </Badge>
          </div>
        </CardTitle>
        
        {/* Search and Filter */}
        <div className="flex items-center gap-4 mt-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, ID, or condition..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            {["all", "new", "followup", "critical"].map((filterType) => (
              <Button
                key={filterType}
                variant={filter === filterType ? "default" : "ghost"}
                size="sm"
                onClick={() => setFilter(filterType as typeof filter)}
                className={filter === filterType ? "btn-healthcare-primary" : ""}
              >
                {filterType === "all" ? "All" :
                 filterType === "new" ? "New" :
                 filterType === "followup" ? "Follow-ups" :
                 "Critical"}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {/* Patient Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPatients.map((patient) => {
            const criticalLevel = getCriticalityLevel(patient);
            const isSelected = selectedPatient?.id === patient.id;
            
            return (
              <div
                key={patient.id}
                onClick={() => onPatientSelect(patient)}
                className={`card-healthcare-interactive p-4 space-y-3 ${
                  isSelected ? 'ring-2 ring-primary bg-primary-soft' : ''
                } ${
                  criticalLevel === "high" ? 'border-destructive' :
                  criticalLevel === "medium" ? 'border-warning' : ''
                }`}
              >
                {/* Patient Header */}
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={patient.avatar} alt={patient.name} />
                    <AvatarFallback className="bg-gradient-primary text-primary-foreground font-semibold">
                      {patient.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h4 className="font-semibold text-foreground">{patient.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {patient.age} years • {patient.gender} • {patient.bloodGroup}
                    </p>
                    <p className="text-xs text-muted-foreground">ID: {patient.id}</p>
                  </div>
                  {patient.criticalFlags.length > 0 && (
                    <AlertTriangle className={`h-5 w-5 ${
                      criticalLevel === "high" ? "text-destructive" : "text-warning"
                    }`} />
                  )}
                </div>

                {/* Key Information */}
                <div className="space-y-2">
                  {/* Allergies */}
                  {patient.allergies.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      <span className="text-xs text-muted-foreground">Allergies:</span>
                      {patient.allergies.map((allergy, index) => (
                        <Badge key={index} variant="secondary" className="text-xs bg-warning-soft text-warning">
                          {allergy}
                        </Badge>
                      ))}
                    </div>
                  )}
                  
                  {/* Chronic Conditions */}
                  {patient.chronicConditions.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      <span className="text-xs text-muted-foreground">Conditions:</span>
                      {patient.chronicConditions.slice(0, 2).map((condition, index) => (
                        <Badge key={index} variant="secondary" className="text-xs bg-primary-soft text-primary">
                          {condition}
                        </Badge>
                      ))}
                      {patient.chronicConditions.length > 2 && (
                        <Badge variant="secondary" className="text-xs">
                          +{patient.chronicConditions.length - 2}
                        </Badge>
                      )}
                    </div>
                  )}

                  {/* Critical Flags */}
                  {patient.criticalFlags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      <span className="text-xs text-muted-foreground">Flags:</span>
                      {patient.criticalFlags.slice(0, 2).map((flag, index) => (
                        <Badge key={index} variant="secondary" className="text-xs bg-destructive-soft text-destructive">
                          {flag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                {/* Visit Information */}
                <div className="flex items-center justify-between text-xs text-muted-foreground border-t border-border pt-2">
                  <span>Last: {patient.lastVisit.toLocaleDateString()}</span>
                  {patient.nextAppointment && (
                    <div className="flex items-center gap-1 text-primary">
                      <Calendar className="h-3 w-3" />
                      <span>{patient.nextAppointment.toLocaleDateString()}</span>
                    </div>
                  )}
                </div>

                {/* Quick Actions */}
                <div className="flex gap-2">
                  <Button size="sm" variant="ghost" className="flex-1 text-xs">
                    <Phone className="h-3 w-3 mr-1" />
                    Call
                  </Button>
                  <Button size="sm" className="btn-healthcare-primary flex-1 text-xs">
                    View Details
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        {filteredPatients.length === 0 && (
          <div className="text-center py-8">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-semibold text-foreground mb-2">No patients found</h3>
            <p className="text-muted-foreground">Try adjusting your search or filter criteria.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};