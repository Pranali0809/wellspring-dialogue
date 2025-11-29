import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { CalendarDays, Stethoscope, FileText, Paperclip, Search, X, Pill, StickyNote, TestTube, Upload } from "lucide-react";
import { useState, useEffect } from "react";
import { doctorVisitsApi } from "@/lib/api";
import { toast } from "sonner";

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
  const patientId = "patient_1";
  const [showBooking, setShowBooking] = useState(false);
  const [doctorSearch, setDoctorSearch] = useState("");
  const [selectedDoctor, setSelectedDoctor] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedVisit, setSelectedVisit] = useState<Visit | null>(null);
  const [visits, setVisits] = useState<Visit[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);

  useEffect(() => {
    fetchVisits();
  }, []);

  const fetchVisits = async () => {
    try {
      const data = await doctorVisitsApi.getVisits(patientId);
      setVisits(data.visits.map((v: any) => ({
        ...v,
        date: new Date(v.date)
      })));
      setDoctors(data.doctors || []);
    } catch (error) {
      console.error("Failed to fetch visits:", error);
      toast.error("Failed to load doctor visits");
    }
  };

  const filteredDoctors = doctors.filter(doctor =>
    doctor.name.toLowerCase().includes(doctorSearch.toLowerCase()) ||
    doctor.specialty.toLowerCase().includes(doctorSearch.toLowerCase())
  );

  const handleBookAppointment = async () => {
    if (!selectedDoctor || !selectedDate) return;
    
    try {
      await doctorVisitsApi.bookAppointment(patientId, selectedDoctor.id, selectedDate.toISOString());
      fetchVisits();
      setShowBooking(false);
      setSelectedDoctor(null);
      setSelectedDate(undefined);
      setDoctorSearch("");
      toast.success(`Appointment booked with ${selectedDoctor.name}`);
    } catch (error) {
      console.error("Failed to book appointment:", error);
      toast.error("Failed to book appointment");
    }
  };

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
          <Button 
            size="sm" 
            className="btn-healthcare-primary"
            onClick={() => setShowBooking(!showBooking)}
          >
            <CalendarDays className="h-4 w-4 mr-2" />
            Book Appointment
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Book Appointment Section */}
        {showBooking && (
          <div className="mb-6 p-4 bg-card-soft rounded-lg border border-border space-y-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
                Book New Appointment
              </h4>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowBooking(false)}
                className="h-6 w-6 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            {/* Doctor Search */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Search Doctors</label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or specialty..."
                  value={doctorSearch}
                  onChange={(e) => setDoctorSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              {doctorSearch && (
                <div className="max-h-48 overflow-y-auto space-y-2 border rounded-lg p-2 bg-background">
                  {filteredDoctors.map((doctor) => (
                    <div
                      key={doctor.id}
                      className={`p-2 rounded cursor-pointer hover:bg-hover ${
                        selectedDoctor?.id === doctor.id ? "bg-primary-soft" : ""
                      }`}
                      onClick={() => setSelectedDoctor(doctor)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{doctor.name}</p>
                          <p className="text-sm text-muted-foreground">{doctor.specialty}</p>
                        </div>
                        <Badge variant={doctor.available ? "secondary" : "destructive"}>
                          {doctor.available ? "Available" : "Busy"}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Calendar */}
            {selectedDoctor && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Select Date</label>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  className="rounded-md border p-3 pointer-events-auto"
                  disabled={(date) => date < new Date()}
                />
                {selectedDate && (
                  <Button 
                    className="w-full btn-healthcare-primary"
                    onClick={handleBookAppointment}
                  >
                    Book with {selectedDoctor.name} on {selectedDate.toLocaleDateString()}
                  </Button>
                )}
              </div>
            )}
          </div>
        )}
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
                  {/* <h4 className="font-semibold text-foreground">{visit.doctorName}</h4> */}
                  <h4 className="font-semibold text-foreground">Dr. Shirin Jejeebhoy</h4>
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
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-xs"
                  onClick={() => setSelectedVisit(visit)}
                >
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

        {/* Visit Details Dialog */}
        <Dialog open={!!selectedVisit} onOpenChange={() => setSelectedVisit(null)}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={selectedVisit?.avatar} alt={selectedVisit?.doctorName} />
                  <AvatarFallback className="bg-gradient-primary text-primary-foreground text-sm font-semibold">
                    {selectedVisit?.doctorName.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-lg font-semibold">{selectedVisit?.doctorName}</h3>
                  <p className="text-sm text-muted-foreground">{selectedVisit?.specialty}</p>
                </div>
              </DialogTitle>
            </DialogHeader>
            
            {selectedVisit && (
              <div className="space-y-6">
                {/* Visit Info */}
                <div className="grid grid-cols-2 gap-4 p-4 bg-card-soft rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Visit Date</p>
                    <p className="text-foreground">{selectedVisit.date.toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Chief Complaint</p>
                    <p className="text-foreground">{selectedVisit.chiefComplaint}</p>
                  </div>
                </div>

                {/* Symptoms */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <StickyNote className="h-5 w-5 text-primary" />
                    <h4 className="font-semibold">Symptoms Noted</h4>
                  </div>
                  <div className="p-4 bg-card-soft rounded-lg space-y-2">
                    <p className="text-sm">• Chest discomfort - mild, intermittent</p>
                    <p className="text-sm">• Shortness of breath during exercise</p>
                    <p className="text-sm">• Occasional palpitations</p>
                  </div>
                </div>

                <Separator />

                {/* Prescriptions */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Pill className="h-5 w-5 text-primary" />
                    <h4 className="font-semibold">Prescriptions</h4>
                  </div>
                  <div className="space-y-3">
                    <div className="p-3 bg-card-soft rounded-lg border border-border">
                      <div className="flex items-center justify-between">
                        <div>
                          <h5 className="font-medium">Lisinopril</h5>
                          <p className="text-sm text-muted-foreground">10mg • Once daily</p>
                        </div>
                        <Badge variant="secondary" className="bg-success-soft text-success">Active</Badge>
                      </div>
                    </div>
                    <div className="p-3 bg-card-soft rounded-lg border border-border">
                      <div className="flex items-center justify-between">
                        <div>
                          <h5 className="font-medium">Metoprolol</h5>
                          <p className="text-sm text-muted-foreground">25mg • Twice daily</p>
                        </div>
                        <Badge variant="secondary" className="bg-success-soft text-success">Active</Badge>
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Doctor's Notes */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <FileText className="h-5 w-5 text-primary" />
                    <h4 className="font-semibold">Doctor's Notes</h4>
                  </div>
                  <div className="p-4 bg-card-soft rounded-lg">
                    <p className="text-sm leading-relaxed">{selectedVisit.keyNotes}</p>
                    <p className="text-sm leading-relaxed mt-2">
                      Patient responded well to previous treatment. Blood pressure readings have improved significantly. 
                      Continue current medication regimen. Follow-up in 3 months or sooner if symptoms worsen.
                    </p>
                  </div>
                </div>

                <Separator />

                {/* Labs Assigned */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <TestTube className="h-5 w-5 text-primary" />
                    <h4 className="font-semibold">Labs Assigned</h4>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-3 bg-card-soft rounded-lg">
                      <span className="text-sm">Complete Blood Count (CBC)</span>
                      <Badge variant="secondary" className="bg-warning-soft text-warning">Pending</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-card-soft rounded-lg">
                      <span className="text-sm">Lipid Panel</span>
                      <Badge variant="secondary" className="bg-warning-soft text-warning">Pending</Badge>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Uploaded Labs */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Upload className="h-5 w-5 text-primary" />
                    <h4 className="font-semibold">Uploaded Labs</h4>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-3 bg-card-soft rounded-lg">
                      <div className="flex items-center gap-3">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">EKG Results - March 1, 2024</span>
                      </div>
                      <Badge variant="secondary" className="bg-success-soft text-success">Normal</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-card-soft rounded-lg">
                      <div className="flex items-center gap-3">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">Chest X-Ray - February 28, 2024</span>
                      </div>
                      <Badge variant="secondary" className="bg-success-soft text-success">Normal</Badge>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};