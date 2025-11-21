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
