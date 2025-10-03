import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface PatientData {
  id: string;
  user_id: string;
  name: string;
  age: number;
  gender: string;
  phone: string | null;
  email: string | null;
  blood_group: string | null;
  avatar: string | null;
  allergies: string[];
  chronic_conditions: string[];
  symptoms_timeline: Array<{ date: string; symptom: string }>;
  prescriptions: Array<{
    id: string;
    medication: string;
    dosage: string;
    frequency: string;
    status: string;
    refill_date: string;
    adherence: number;
    pills_remaining: number;
    total_pills: number;
    daily_doses: number;
  }>;
  vaccines: Array<{
    id: string;
    name: string;
    status: string;
    last_date?: string;
    next_date?: string;
    scheduled_date?: string;
    completed_date?: string;
    location?: string;
    age_required?: string;
    can_retake?: boolean;
  }>;
  medical_history: {
    conditions?: Array<{ name: string; date: string }>;
    surgeries?: Array<{ name: string; date: string }>;
    allergies?: Array<{ name: string }>;
    family_history?: Array<{ condition: string; relation: string }>;
  };
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
  total_visits: number;
  active_reports: number;
}

export const usePatientData = () => {
  const [patientData, setPatientData] = useState<PatientData | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchPatientData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;

      if (data) {
        setPatientData({
          ...data,
          allergies: (data.allergies as string[]) || [],
          chronic_conditions: (data.chronic_conditions as string[]) || [],
          symptoms_timeline: (data.symptoms_timeline as Array<{ date: string; symptom: string }>) || [],
          prescriptions: (data.prescriptions as Array<{
            id: string;
            medication: string;
            dosage: string;
            frequency: string;
            status: string;
            refill_date: string;
            adherence: number;
            pills_remaining: number;
            total_pills: number;
            daily_doses: number;
          }>) || [],
          vaccines: (data.vaccines as Array<{
            id: string;
            name: string;
            status: string;
            last_date?: string;
            next_date?: string;
            scheduled_date?: string;
            completed_date?: string;
            location?: string;
            age_required?: string;
            can_retake?: boolean;
          }>) || [],
          medical_history: (data.medical_history as {
            conditions?: Array<{ name: string; date: string }>;
            surgeries?: Array<{ name: string; date: string }>;
            allergies?: Array<{ name: string }>;
            family_history?: Array<{ condition: string; relation: string }>;
          }) || {},
          doctor_visits: (data.doctor_visits as Array<{
            id: string;
            visit_date: string;
            chief_complaint: string;
            symptoms_noted: string[];
            prescriptions_given: string[];
            doctor_notes: string;
            labs_assigned: string[];
            labs_uploaded: string[];
          }>) || [],
        });
      }
    } catch (error: any) {
      console.error('Error fetching patient data:', error);
      toast({
        title: "Error",
        description: "Failed to load patient data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updatePatientData = async (updates: Partial<PatientData>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('patients')
        .update(updates)
        .eq('user_id', user.id);

      if (error) throw error;

      await fetchPatientData();
      
      toast({
        title: "Success",
        description: "Patient data updated successfully",
      });
    } catch (error: any) {
      console.error('Error updating patient data:', error);
      toast({
        title: "Error",
        description: "Failed to update patient data",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchPatientData();
  }, []);

  return { patientData, loading, updatePatientData, refetch: fetchPatientData };
};
