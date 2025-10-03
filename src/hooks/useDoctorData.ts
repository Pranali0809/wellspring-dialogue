import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface DoctorPatient {
  id: string;
  name: string;
  age: number;
  gender: string;
  blood_group: string | null;
  allergies: string[];
  chronic_conditions: string[];
  last_visit: string;
  next_appointment?: string;
  critical_flags: string[];
  avatar: string | null;
  symptoms_timeline: Array<{ date: string; symptom: string }>;
  prescriptions: Array<{
    id: string;
    medication: string;
    dosage: string;
    frequency: string;
    status: string;
  }>;
  doctor_visits: Array<{
    id: string;
    visit_date: string;
    chief_complaint: string;
    symptoms_noted: string[];
    prescriptions_given: string[];
    doctor_notes: string;
    labs_assigned: string[];
    labs_uploaded: string[];
  }>;
}

export const useDoctorData = () => {
  const [patients, setPatients] = useState<DoctorPatient[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchDoctorPatients = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setLoading(false);
        return;
      }

      // Get doctor's ID
      const { data: doctorData } = await supabase
        .from('doctors')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!doctorData) {
        setLoading(false);
        return;
      }

      // Get mapped patients
      const { data: mappings } = await supabase
        .from('doctor_patient_mapping')
        .select('patient_id')
        .eq('doctor_id', doctorData.id);

      if (!mappings || mappings.length === 0) {
        setPatients([]);
        setLoading(false);
        return;
      }

      const patientIds = mappings.map(m => m.patient_id);

      // Get patient details
      const { data: patientData, error } = await supabase
        .from('patients')
        .select('*')
        .in('id', patientIds);

      if (error) throw error;

      if (patientData) {
        const formattedPatients: DoctorPatient[] = patientData.map(p => {
          const visits = (p.doctor_visits as any[]) || [];
          const lastVisit = visits.length > 0 
            ? visits[visits.length - 1].visit_date 
            : new Date().toISOString();

          return {
            id: p.id,
            name: p.name,
            age: p.age,
            gender: p.gender,
            blood_group: p.blood_group,
            allergies: (p.allergies as string[]) || [],
            chronic_conditions: (p.chronic_conditions as string[]) || [],
            last_visit: lastVisit,
            critical_flags: [],
            avatar: p.avatar,
            symptoms_timeline: (p.symptoms_timeline as Array<{ date: string; symptom: string }>) || [],
            prescriptions: (p.prescriptions as Array<{
              id: string;
              medication: string;
              dosage: string;
              frequency: string;
              status: string;
            }>) || [],
            doctor_visits: (p.doctor_visits as Array<{
              id: string;
              visit_date: string;
              chief_complaint: string;
              symptoms_noted: string[];
              prescriptions_given: string[];
              doctor_notes: string;
              labs_assigned: string[];
              labs_uploaded: string[];
            }>) || [],
          };
        });

        setPatients(formattedPatients);
      }
    } catch (error: any) {
      console.error('Error fetching doctor patients:', error);
      toast({
        title: "Error",
        description: "Failed to load patient data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctorPatients();
  }, []);

  return { patients, loading, refetch: fetchDoctorPatients };
};
