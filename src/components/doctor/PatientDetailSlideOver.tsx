import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Patient } from "@/pages/DoctorDashboard";
import { AudioUploadDiagnosis } from "@/components/doctor/AudioUploadDiagnosis";
import { 
  X, 
  User, 
  FileText, 
  Pill, 
  Clock, 
  Upload, 
  Save, 
  AlertTriangle,
  Heart,
  Activity,
  Calendar
} from "lucide-react";

interface PatientDetailSlideOverProps {
  patient: Patient | null;
  onClose: () => void;
}

export const PatientDetailSlideOver = ({ patient, onClose }: PatientDetailSlideOverProps) => {
  if (!patient) return null;

  const mockPrescriptions = [
    {
      id: "1",
      drug: "Metformin",
      dose: "500mg",
      frequency: "Twice daily",
      startDate: "2024-01-15",
      endDate: "2024-07-15",
      adherence: 85
    },
    {
      id: "2", 
      drug: "Lisinopril",
      dose: "10mg",
      frequency: "Once daily",
      startDate: "2024-02-01", 
      endDate: "2024-08-01",
      adherence: 92
    }
  ];

  const mockNotes = [
    {
      id: "1",
      date: "2024-03-01",
      type: "Follow-up",
      content: "Patient reports improved energy levels. Blood sugar readings more stable. Continue current medications."
    },
    {
      id: "2",
      date: "2024-02-15", 
      type: "Initial Consultation",
      content: "New patient presenting with diabetes management concerns. Discussed lifestyle modifications and medication adherence."
    }
  ];

  const mockLabs = [
    {
      id: "1",
      name: "Complete Blood Count",
      date: "2024-02-28",
      status: "Normal",
      file: "cbc_results.pdf"
    },
    {
      id: "2",
      name: "HbA1c Test", 
      date: "2024-02-20",
      status: "Elevated",
      file: "hba1c_results.pdf"
    }
  ];

  return (
    <Sheet open={!!patient} onOpenChange={onClose}>
      <SheetContent side="right" className="w-[700px] sm:w-[900px] overflow-y-auto healthcare-scrollbar">
        <SheetHeader>
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={patient.avatar} alt={patient.name} />
              <AvatarFallback className="bg-gradient-primary text-primary-foreground text-lg font-semibold">
                {patient.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <SheetTitle className="text-xl">{patient.name}</SheetTitle>
              <p className="text-muted-foreground">
                {patient.age} years • {patient.gender} • Blood Type: {patient.bloodGroup}
              </p>
              <div className="flex flex-wrap gap-2 mt-2">
                {patient.criticalFlags.map((flag, index) => (
                  <Badge key={index} variant="secondary" className="bg-destructive-soft text-destructive">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    {flag}
                  </Badge>
                ))}
                {patient.allergies.map((allergy, index) => (
                  <Badge key={index} variant="secondary" className="bg-warning-soft text-warning">
                    {allergy}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </SheetHeader>

        <Tabs defaultValue="overview" className="mt-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview" className="text-xs">
              <User className="h-4 w-4 mr-1" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="history" className="text-xs">
              <Clock className="h-4 w-4 mr-1" />
              History
            </TabsTrigger>
            <TabsTrigger value="prescriptions" className="text-xs">
              <Pill className="h-4 w-4 mr-1" />
              Prescriptions
            </TabsTrigger>
            <TabsTrigger value="notes" className="text-xs">
              <FileText className="h-4 w-4 mr-1" />
              Notes
            </TabsTrigger>
            <TabsTrigger value="labs" className="text-xs">
              <Upload className="h-4 w-4 mr-1" />
              Labs
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            <Card className="card-healthcare">
              <CardHeader>
                <CardTitle className="text-lg">Patient Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Basic Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Last Visit</Label>
                    <p className="text-foreground">{patient.lastVisit.toLocaleDateString()}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Next Appointment</Label>
                    <p className="text-foreground">
                      {patient.nextAppointment?.toLocaleDateString() || "Not scheduled"}
                    </p>
                  </div>
                </div>

                {/* Chronic Conditions */}
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Chronic Conditions</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {patient.chronicConditions.map((condition, index) => (
                      <Badge key={index} variant="secondary" className="bg-primary-soft text-primary">
                        {condition}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Recent Activity */}
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Recent Activity</Label>
                  <div className="space-y-2 mt-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Activity className="h-4 w-4 text-success" />
                      <span>Blood pressure reading: 120/80 (March 10)</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Heart className="h-4 w-4 text-primary" />
                      <span>Medication adherence: 85% this week</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-warning" />
                      <span>Lab results pending review</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history" className="space-y-4">
            <Card className="card-healthcare">
              <CardHeader>
                <CardTitle className="text-lg">Medical Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Vertical Timeline */}
                  <div className="relative">
                    <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border"></div>
                    
                    {/* Timeline Items */}
                    <div className="space-y-6">
                      <div className="flex items-start gap-4">
                        <div className="w-8 h-8 rounded-full bg-destructive flex items-center justify-center flex-shrink-0">
                          <div className="w-3 h-3 rounded-full bg-destructive-foreground"></div>
                        </div>
                        <div className="flex-1 pt-1">
                          <p className="font-semibold text-destructive">Blood sugar spike</p>
                          <p className="text-sm text-muted-foreground">March 3, 2024 - High severity</p>
                          <p className="text-sm mt-1">Patient reported glucose reading of 240 mg/dL after meal.</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-4">
                        <div className="w-8 h-8 rounded-full bg-warning flex items-center justify-center flex-shrink-0">
                          <div className="w-3 h-3 rounded-full bg-warning-foreground"></div>
                        </div>
                        <div className="flex-1 pt-1">
                          <p className="font-semibold text-warning">Headache</p>
                          <p className="text-sm text-muted-foreground">March 5, 2024 - Medium severity</p>
                          <p className="text-sm mt-1">Tension headache lasting 2 hours, possibly stress-related.</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-4">
                        <div className="w-8 h-8 rounded-full bg-success flex items-center justify-center flex-shrink-0">
                          <div className="w-3 h-3 rounded-full bg-success-foreground"></div>
                        </div>
                        <div className="flex-1 pt-1">
                          <p className="font-semibold text-success">Fatigue</p>
                          <p className="text-sm text-muted-foreground">March 8, 2024 - Low severity</p>
                          <p className="text-sm mt-1">General tiredness throughout the day, improved with rest.</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-4">
                        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                          <div className="w-3 h-3 rounded-full bg-primary-foreground"></div>
                        </div>
                        <div className="flex-1 pt-1">
                          <p className="font-semibold text-primary">Medication Review</p>
                          <p className="text-sm text-muted-foreground">March 10, 2024</p>
                          <p className="text-sm mt-1">Regular medication adherence check and dosage adjustment.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* View More Button */}
                  <div className="text-center">
                    <Button variant="outline" size="sm" className="btn-healthcare-secondary">
                      View More History
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Prescriptions Tab */}
          <TabsContent value="prescriptions" className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Button variant="outline" size="sm" className="bg-primary text-primary-foreground">
                    Active Prescriptions
                  </Button>
                  <Button variant="outline" size="sm">
                    Regular Medication
                  </Button>
                </div>
                <Button size="sm" className="btn-healthcare-primary">
                  Add Prescription
                </Button>
              </div>
              
              <Card className="card-healthcare">
                <CardContent className="space-y-4 pt-6">
                  {mockPrescriptions.map((prescription) => (
                    <div key={prescription.id} className="p-4 border border-border rounded-lg space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold">{prescription.drug}</h4>
                          <p className="text-sm text-muted-foreground">
                            {prescription.dose} • {prescription.frequency}
                          </p>
                        </div>
                        <Badge variant="secondary" className="bg-success-soft text-success">
                          Active
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <Label className="text-muted-foreground">Start Date</Label>
                          <p>{prescription.startDate}</p>
                        </div>
                        <div>
                          <Label className="text-muted-foreground">End Date</Label>
                          <p>{prescription.endDate}</p>
                        </div>
                      </div>
                      <div>
                        <Label className="text-muted-foreground text-sm">Adherence: {prescription.adherence}%</Label>
                        <Progress value={prescription.adherence} className="mt-1" />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Notes Tab */}
          <TabsContent value="notes" className="space-y-4">
            <Card className="card-healthcare">
              <CardHeader>
                <CardTitle className="text-lg">Consultation Notes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* New Note */}
                <div className="p-4 border border-border rounded-lg">
                  <Label htmlFor="newNote" className="text-sm font-medium">Add New Note</Label>
                  <Textarea 
                    id="newNote"
                    placeholder="Enter consultation notes..."
                    className="mt-2"
                    rows={4}
                  />
                  <div className="flex justify-end mt-3">
                    <Button size="sm" className="btn-healthcare-primary">
                      <Save className="h-4 w-4 mr-2" />
                      Save Note
                    </Button>
                  </div>
                </div>

                {/* Existing Notes */}
                {mockNotes.map((note) => (
                  <div key={note.id} className="p-4 bg-card-soft border border-border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="secondary" className="bg-primary-soft text-primary">
                        {note.type}
                      </Badge>
                      <span className="text-sm text-muted-foreground">{note.date}</span>
                    </div>
                    <p className="text-sm text-foreground">{note.content}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Labs Tab */}
          <TabsContent value="labs" className="space-y-4">
            {/* Audio Upload & Diagnosis */}
            <AudioUploadDiagnosis 
              appointmentId={"apt_001"} 
              hasPreAssessment={true} 
            />

            <Card className="card-healthcare">
              <CardHeader>
                <CardTitle className="text-lg flex items-center justify-between">
                  Lab Results & Files
                  <Button size="sm" className="btn-healthcare-primary">
                    <Upload className="h-4 w-4 mr-2" />
                    Upload File
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {mockLabs.map((lab) => (
                  <div key={lab.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileText className="h-8 w-8 text-muted-foreground" />
                      <div>
                        <h4 className="font-semibold">{lab.name}</h4>
                        <p className="text-sm text-muted-foreground">{lab.date} • {lab.file}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge 
                        variant="secondary" 
                        className={lab.status === "Normal" ? "bg-success-soft text-success" : "bg-warning-soft text-warning"}
                      >
                        {lab.status}
                      </Badge>
                      <Button variant="ghost" size="sm">
                        View
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
};
