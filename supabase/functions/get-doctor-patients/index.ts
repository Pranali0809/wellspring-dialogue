import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.58.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const url = new URL(req.url);
    const doctorId = url.pathname.split('/').pop();

    console.log('Fetching patients for doctor ID:', doctorId);

    if (!doctorId) {
      return new Response(
        JSON.stringify({ error: 'Doctor ID is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get patient IDs linked to this doctor
    const { data: mappings, error: mappingError } = await supabase
      .from('doctor_patient_mapping')
      .select('patient_id')
      .eq('doctor_id', doctorId);

    if (mappingError) {
      console.error('Error fetching patient mappings:', mappingError);
      return new Response(
        JSON.stringify({ error: mappingError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!mappings || mappings.length === 0) {
      return new Response(
        JSON.stringify({ patients: [] }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const patientIds = mappings.map(m => m.patient_id);

    // Get patient details
    const { data: patients, error: patientsError } = await supabase
      .from('patients')
      .select('*')
      .in('id', patientIds);

    if (patientsError) {
      console.error('Error fetching patients:', patientsError);
      return new Response(
        JSON.stringify({ error: patientsError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Format patient data
    const formattedPatients = patients.map(patient => ({
      id: patient.id,
      name: patient.name,
      age: patient.age,
      gender: patient.gender,
      bloodGroup: patient.blood_group,
      allergies: patient.allergies || [],
      chronicConditions: patient.chronic_conditions || [],
      lastVisit: patient.doctor_visits && patient.doctor_visits.length > 0 
        ? patient.doctor_visits[patient.doctor_visits.length - 1].date 
        : null,
      nextAppointment: null, // This would come from an appointments table
      criticalFlags: [], // This would be computed based on recent vitals/alerts
      avatar: patient.avatar
    }));

    return new Response(
      JSON.stringify({ patients: formattedPatients }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
