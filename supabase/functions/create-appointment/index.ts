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

    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { doctorId, patientId, appointmentDate, specialty, notes } = await req.json();

    console.log('Creating appointment:', { doctorId, patientId, appointmentDate });

    if (!doctorId || !patientId || !appointmentDate) {
      return new Response(
        JSON.stringify({ error: 'Doctor ID, Patient ID, and appointment date are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // In a real system, you'd insert into an appointments table
    // For now, we'll return a success response with the appointment details
    const appointment = {
      id: crypto.randomUUID(),
      doctorId,
      patientId,
      appointmentDate,
      specialty,
      notes,
      status: 'scheduled',
      createdAt: new Date().toISOString()
    };

    return new Response(
      JSON.stringify({ 
        success: true,
        appointment
      }),
      { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
