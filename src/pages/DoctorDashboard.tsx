import { DoctorHeader } from "@/components/doctor/DoctorHeader";
import { PatientList } from "@/components/doctor/PatientList";
import { PatientDetailSlideOver } from "@/components/doctor/PatientDetailSlideOver";
import { ChatAssistant } from "@/components/chat/ChatAssistant";
import { useState } from "react";

export interface Patient {
  id: string;
  name: string;
  age: number;
  gender: string;
  bloodGroup: string;
  allergies: string[];
  chronicConditions: string[];
  lastVisit: Date;
  nextAppointment?: Date;
  criticalFlags: string[];
  avatar: string;
}

const DoctorDashboard = () => {
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  return (
    <div className="min-h-screen bg-background">
      <DoctorHeader />
      
      <main className="healthcare-container py-6">
        {/* Dashboard Grid Layout */}
        <div className="grid grid-cols-1 gap-6">
          {/* Patient List */}
          <PatientList 
            onPatientSelect={setSelectedPatient} 
            selectedPatient={selectedPatient}
          />
        </div>
      </main>

      {/* Patient Detail Slide-Over */}
      <PatientDetailSlideOver 
        patient={selectedPatient}
        onClose={() => setSelectedPatient(null)}
      />

      {/* Chat Assistant */}
      <ChatAssistant isDoctor={true} />
    </div>
  );
};

export default DoctorDashboard;