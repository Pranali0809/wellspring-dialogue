import { PersonalInfoCard } from "@/components/patient/PersonalInfoCard";
import { SymptomsTimeline } from "@/components/patient/SymptomsTimeline";
import { PrescriptionTracking } from "@/components/patient/PrescriptionTracking";
import { VaccineTracking } from "@/components/patient/VaccineTracking";
import { MedicalHistoryOverview } from "@/components/patient/MedicalHistoryOverview";
import { DoctorVisits } from "@/components/patient/DoctorVisits";
import { PatientAppointments } from "@/components/patient/PatientAppointments";
import { QuickActions } from "@/components/patient/QuickActions";
import { PatientHeader } from "@/components/patient/PatientHeader";
import { useParams, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { ChatAssistant } from "@/components/chat/ChatAssistant";

const PatientDashboard = () => {
  const { patientId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (!patientId) {
      navigate('/patient/patient_1', { replace: true });
    }
  }, [patientId, navigate]);

  return (
    <div className="min-h-screen bg-background">
      <PatientHeader patientId={patientId || 'patient_1'} />
      
      <main className="healthcare-container py-6">
        {/* Dashboard Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6">
          {/* Row 1: Personal Info + Symptoms Timeline */}
          <div className="lg:col-span-4">
            <PersonalInfoCard />
          </div>
          <div className="lg:col-span-8">
            <SymptomsTimeline />
          </div>

          {/* Row 2: Prescription + Vaccine Tracking */}
          <div className="lg:col-span-6">
            <PrescriptionTracking />
          </div>
          <div className="lg:col-span-6">
            <VaccineTracking />
          </div>

          {/* Row 3: Appointments + Medical History */}
          <div className="lg:col-span-4">
            <PatientAppointments patientId={patientId || 'patient_1'} />
          </div>
          <div className="lg:col-span-4">
            <MedicalHistoryOverview />
          </div>
          <div className="lg:col-span-4">
            <DoctorVisits />
          </div>
        </div>

        {/* Quick Actions Panel */}
        <QuickActions />
      </main>

      {/* Chat Assistant */}
      <ChatAssistant />
    </div>
  );
};

export default PatientDashboard;