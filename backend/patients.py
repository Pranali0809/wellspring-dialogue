from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from firestore_client import db

router = APIRouter()

# Mock data as fallback when Firestore is not available
mock_patients_db = {
    "patient_1": {
        "patient_id": "patient_1",
        "personal_info": {
            "name": "Sarah Johnson",
            "age": 32,
            "gender": "Female",
            "blood_type": "O+",
            "phone": "+1 (555) 123-4567",
            "email": "sarah.johnson@email.com",
            "address": "123 Maple St, Boston, MA",
            "next_appointment_id": "apt_001",
            "active_prescription": "3 active"
        },
        "medical_info": {
            "conditions": [
                {"condition": "Diabetes Type 2", "diagnosed_date": "2020-01-15", "diagnosed_by_doctor_id": "doctor_1"}
            ],
            "surgeries": [],
            "allergies": [
                {"name": "Peanuts", "severity": "Severe", "reaction": "Anaphylaxis"}
            ],
            "family_history": []
        },
        "symptoms": [
            {
                "id": "sym_1",
                "name": "Headache",
                "date": "2024-03-10",
                "description": "Mild headache in the morning"
            }
        ],
        "prescriptions": [
            {
                "id": "presc_1",
                "medication": "Metformin",
                "dosage": "500mg",
                "frequency": 2,
                "status": "active",
                "refill_date": "2024-04-01",
                "pills_daily_doses": 2,
                "adherence": {
                    "pills_remaining": 45,
                    "total_pills": 60
                }
            }
        ],
        "vaccines": [
            {
                "id": "vac_1",
                "name": "COVID-19 Booster",
                "status": "completed",
                "completed_on": "2024-01-15",
                "scheduled_for": ""
            }
        ],
        "doctor_visits": [
            {
                "id": "visit_1",
                "visit_date": "2024-03-10",
                "doctor_id": "doctor_1",
                "chief_complaint": "Routine checkup",
                "symptoms_noted": [{"name": "None"}],
                "prescriptions_given": [],
                "doctor_notes": "Patient is doing well"
            }
        ],
        "recent_activity": [
            {"type": "prescription", "description": "Refilled Metformin", "date": "2024-03-01"}
        ],
        "appointments": [
            {"appointment_id": "apt_001"}
        ],
        "status": {
            "patient_category": "active"
        }
    }
}

class Patient(BaseModel):
    patient_id: str
    personal_info: Dict[str, Any]
    medical_info: Dict[str, Any]
    symptoms: List[Dict[str, Any]]
    prescriptions: List[Dict[str, Any]]
    vaccines: List[Dict[str, Any]]
    doctor_visits: List[Dict[str, Any]]
    recent_activity: List[Dict[str, Any]]
    appointments: List[Dict[str, Any]]
    status: Dict[str, str]

@router.get("/patients")
def get_all_patients():
    """Fetch all patient documents from Firestore"""
    if db is None:
        # Use mock data when Firestore is not available
        return list(mock_patients_db.values())
    
    try:
        patients_ref = db.collection("patients")
        patients = []
        for doc in patients_ref.stream():
            patient_data = doc.to_dict()
            patient_data["patient_id"] = doc.id
            patients.append(patient_data)
        return patients
    except Exception as e:
        # Fallback to mock data on error
        return list(mock_patients_db.values())

@router.get("/patient/{patient_id}")
def get_patient(patient_id: str):
    """Read a single patient document from Firestore"""
    if db is None:
        # Use mock data when Firestore is not available
        patient = mock_patients_db.get(patient_id)
        if not patient:
            raise HTTPException(status_code=404, detail="Patient not found")
        return patient
    
    try:
        doc_ref = db.collection("patients").document(patient_id)
        doc = doc_ref.get()
        
        if not doc.exists:
            # Try mock data as fallback
            patient = mock_patients_db.get(patient_id)
            if not patient:
                raise HTTPException(status_code=404, detail="Patient not found")
            return patient
        
        patient_data = doc.to_dict()
        patient_data["patient_id"] = doc.id
        return patient_data
    except Exception as e:
        # Fallback to mock data on error
        patient = mock_patients_db.get(patient_id)
        if not patient:
            raise HTTPException(status_code=404, detail=f"Patient not found: {str(e)}")
        return patient

@router.put("/patient/{patient_id}")
def update_patient(patient_id: str, patient: Patient):
    """Update entire patient document in Firestore"""
    if db is None:
        # Update mock data when Firestore is not available
        patient_dict = patient.dict()
        mock_patients_db[patient_id] = patient_dict
        return {"message": "Patient updated successfully (mock)", "patient": patient_dict}
    
    try:
        doc_ref = db.collection("patients").document(patient_id)
        patient_dict = patient.dict()
        doc_ref.set(patient_dict)
        return {"message": "Patient updated successfully", "patient": patient_dict}
    except Exception as e:
        # Fallback to mock data on error
        patient_dict = patient.dict()
        mock_patients_db[patient_id] = patient_dict
        return {"message": f"Patient updated in mock storage: {str(e)}", "patient": patient_dict}
