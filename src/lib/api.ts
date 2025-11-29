const API_BASE_URL = 'http://localhost:8000/api';

// Generic API call function
async function apiCall<T>(
  endpoint: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
  body?: any
): Promise<T> {
  const options: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
  
  if (!response.ok) {
    throw new Error(`API call failed: ${response.statusText}`);
  }

  return response.json();
}

// Doctor Visits API
export const doctorVisitsApi = {
  getVisits: (patientId: string) => 
    apiCall<{ visits: any[], doctors: any[] }>(`/doctor-visits/${patientId}`),
  
  createVisit: (patientId: string, visit: any) =>
    apiCall(`/doctor-visits/${patientId}`, 'POST', visit),
  
  bookAppointment: (patientId: string, doctorId: string, date: string) =>
    apiCall(`/doctor-visits/${patientId}/book`, 'POST', { doctorId, date }),
  
  updateVisit: (patientId: string, visitId: string, visit: any) =>
    apiCall(`/doctor-visits/${patientId}/${visitId}`, 'PUT', visit),
  
  deleteVisit: (patientId: string, visitId: string) =>
    apiCall(`/doctor-visits/${patientId}/${visitId}`, 'DELETE'),
};

// Medical History API
export const medicalHistoryApi = {
  getHistory: (patientId: string) =>
    apiCall<any>(`/medical-history/${patientId}`),
  
  updateHistory: (patientId: string, history: any) =>
    apiCall(`/medical-history/${patientId}`, 'PUT', history),
  
  addItem: (patientId: string, category: string, item: any) =>
    apiCall(`/medical-history/${patientId}/${category}`, 'POST', item),
  
  deleteItem: (patientId: string, category: string, itemId: string) =>
    apiCall(`/medical-history/${patientId}/${category}/${itemId}`, 'DELETE'),
};

// Patient Header API
export const patientHeaderApi = {
  getHeader: (patientId: string) =>
    apiCall<any>(`/patient-header/${patientId}`),
  
  updateHeader: (patientId: string, header: any) =>
    apiCall(`/patient-header/${patientId}`, 'PUT', header),
};

// Personal Info API
export const personalInfoApi = {
  getInfo: (patientId: string) =>
    apiCall<any>(`/personal-info/${patientId}`),
  
  updateInfo: (patientId: string, info: any) =>
    apiCall(`/personal-info/${patientId}`, 'PUT', info),
};

// Prescriptions API
export const prescriptionsApi = {
  getPrescriptions: (patientId: string) =>
    apiCall<{ prescriptions: any[] }>(`/prescriptions/${patientId}`),
  
  createPrescription: (patientId: string, prescription: any) =>
    apiCall(`/prescriptions/${patientId}`, 'POST', prescription),
  
  updatePrescription: (patientId: string, prescriptionId: string, prescription: any) =>
    apiCall(`/prescriptions/${patientId}/${prescriptionId}`, 'PUT', prescription),
  
  deletePrescription: (patientId: string, prescriptionId: string) =>
    apiCall(`/prescriptions/${patientId}/${prescriptionId}`, 'DELETE'),
  
  resetAdherence: (patientId: string) =>
    apiCall(`/prescriptions/${patientId}/reset-adherence`, 'POST'),
};

// Symptoms API
export const symptomsApi = {
  getSymptoms: (patientId: string) =>
    apiCall<{ symptoms: any[] }>(`/symptoms/${patientId}`),
  
  createSymptom: (patientId: string, symptom: any) =>
    apiCall(`/symptoms/${patientId}`, 'POST', symptom),
  
  updateSymptom: (patientId: string, symptomId: string, symptom: any) =>
    apiCall(`/symptoms/${patientId}/${symptomId}`, 'PUT', symptom),
  
  deleteSymptom: (patientId: string, symptomId: string) =>
    apiCall(`/symptoms/${patientId}/${symptomId}`, 'DELETE'),
};

// Vaccines API
export const vaccinesApi = {
  getVaccines: (patientId: string) =>
    apiCall<{ vaccines: any[] }>(`/vaccines/${patientId}`),
  
  createVaccine: (patientId: string, vaccine: any) =>
    apiCall(`/vaccines/${patientId}`, 'POST', vaccine),
  
  updateVaccine: (patientId: string, vaccineId: string, vaccine: any) =>
    apiCall(`/vaccines/${patientId}/${vaccineId}`, 'PUT', vaccine),
  
  deleteVaccine: (patientId: string, vaccineId: string) =>
    apiCall(`/vaccines/${patientId}/${vaccineId}`, 'DELETE'),
};

// Quick Actions API
export const quickActionsApi = {
  executeAction: (action: string, payload?: any) =>
    apiCall(`/quick-actions/execute`, 'POST', { action, payload }),
};

// Doctor APIs
export const doctorApi = {
  getInfo: (doctorId: string) =>
    apiCall<any>(`/doctor/${doctorId}`),
  
  // updateInfo: (doctorId: string, data: any) =>
  //   apiCall(`/doctor/${doctorId}`, 'PUT', data),
  
  getPatients: (doctorId: string) =>
    apiCall<any[]>(`/doctor/${doctorId}/patients`),
  
  // getPatientDetail: (doctorId: string, patientId: string) =>
  //   apiCall<any>(`/doctor/${doctorId}/patients/${patientId}`),
  
  // updatePatientStatus: (doctorId: string, patientId: string, status: any) =>
  //   apiCall(`/doctor/${doctorId}/patients/${patientId}/status`, 'PUT', status),
  
  getNotes: (doctorId: string, patientId: string) =>
    apiCall<any[]>(`/doctor/${doctorId}/patients/${patientId}/notes`),
  
  // createNote: (doctorId: string, patientId: string, note: any) =>
  //   apiCall(`/doctor/${doctorId}/patients/${patientId}/notes`, 'POST', note),
  
  // updateNote: (doctorId: string, patientId: string, noteId: string, note: any) =>
  //   apiCall(`/doctor/${doctorId}/patients/${patientId}/notes/${noteId}`, 'PUT', note),
  
  // deleteNote: (doctorId: string, patientId: string, noteId: string) =>
  //   apiCall(`/doctor/${doctorId}/patients/${patientId}/notes/${noteId}`, 'DELETE'),
  
  getTodayAppointments: (doctorId: string) =>
    apiCall<any>(`/doctor/${doctorId}/appointments/today`),
  
  // updateTodaySchedule: (doctorId: string, schedule: any) =>
  //   apiCall(`/doctor/${doctorId}/appointments/today`, 'PUT', schedule),
  
  getActivePatients: (doctorId: string) =>
    apiCall<any>(`/doctor/${doctorId}/patients/active`),
};

// AI Assessment API
export const aiAssessmentApi = {
  startAgent: (appointmentId: string) =>
    apiCall<{ agent_session_id: string; message: string }>(`/appointment/${appointmentId}/start-agent`, 'POST'),
  
  sendMessage: (appointmentId: string, agentSessionId: string, message: string) =>
    apiCall<{ message: string; finished: boolean; structured_report?: any }>(
      `/appointment/${appointmentId}/agent-message`, 
      'POST', 
      { agent_session_id: agentSessionId, message }
    ),
  
  uploadAudio: (appointmentId: string, formData: FormData) =>
    fetch(`${API_BASE_URL}/appointments/${appointmentId}/upload-audio`, {
      method: 'POST',
      body: formData
    }).then(async (response) => {
      if (!response.ok) {
        throw new Error(`API call failed: ${response.statusText}`);
      }
      return response.json();
    }),
  
  runDiagnosisAgent: (appointmentId: string) =>
    apiCall<any>(`/appointments/${appointmentId}/run-diagnosis-agent`, 'POST'),
  
  finalizeVisit: (appointmentId: string, data: any) =>
    apiCall(`/appointments/${appointmentId}/finalize-visit`, 'POST', data),
  
  saveDoctorReview: (appointmentId: string, review: any) =>
    apiCall(`/appointment/${appointmentId}/doctor-review`, 'POST', review),
};
