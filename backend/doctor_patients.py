from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import requests

router = APIRouter()

# Helper to get patient from main endpoint
def get_patient_data(patient_id: str):
    try:
        response = requests.get(f"http://localhost:8000/api/patient/{patient_id}")
        if response.status_code == 200:
            return response.json()
        return None
    except:
        return None

# Doctor-patient mapping
doctor_patient_mapping = {
    "doctor_1": ["patient_1"]
}

class PatientListItem(BaseModel):
    id: str
    name: str
    age: int
    gender: str
    blood_group: str
    allergies: List[str]
    chronic_conditions: List[str]
    last_visit: Optional[str] = None
    next_appointment: Optional[str] = None
    critical_flags: List[str]
    avatar: str
    status: str

class PatientDetail(BaseModel):
    id: str
    name: str
    age: int
    gender: str
    blood_group: str
    allergies: List[str]
    chronic_conditions: List[str]
    history: List[dict]
    prescriptions: List[dict]

@router.get("/doctor/{doctor_id}/patients")
def get_doctor_patients(doctor_id: str):
    patient_ids = doctor_patient_mapping.get(doctor_id, [])
    if not patient_ids:
        return []
    
    patients = []
    for patient_id in patient_ids:
        patient = get_patient_data(patient_id)
        if not patient:
            continue
        
        personal_info = patient.get("personal_info", {})
        medical_info = patient.get("medical_info", {})
        status_info = patient.get("status", {})
        visits = patient.get("doctor_visits", [])
        
        last_visit = visits[-1]["visit_date"] if visits else "N/A"
        
        patients.append({
            "id": patient_id,
            "name": personal_info.get("name", ""),
            "age": personal_info.get("age", 0),
            "gender": personal_info.get("gender", ""),
            "blood_group": personal_info.get("blood_type", "N/A"),
            "allergies": [a["name"] for a in medical_info.get("allergies", [])],
            "chronic_conditions": [c["condition"] for c in medical_info.get("conditions", [])],
            "last_visit": last_visit,
            "next_appointment": personal_info.get("next_appointment_id", ""),
            "critical_flags": [],
            "avatar": "/placeholder.svg",
            "status": status_info.get("patient_category", "normal")
        })
    
    return patients

@router.get("/doctor/{doctor_id}/patients/{patient_id}")
def get_patient_detail(doctor_id: str, patient_id: str):
    # Check if doctor has access to this patient
    patient_ids = doctor_patient_mapping.get(doctor_id, [])
    if patient_id not in patient_ids:
        raise HTTPException(status_code=403, detail="Access denied")
    
    patient = get_patient_data(patient_id)
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    
    personal_info = patient.get("personal_info", {})
    medical_info = patient.get("medical_info", {})
    prescriptions = patient.get("prescriptions", [])
    symptoms = patient.get("symptoms", [])
    
    # Build history timeline from symptoms and conditions
    history = []
    for symptom in symptoms:
        history.append({
            "date": symptom.get("date", ""),
            "type": "symptom",
            "description": symptom.get("name", "")
        })
    
    for condition in medical_info.get("conditions", []):
        history.append({
            "date": condition.get("diagnosed_date", "2024-01-01"),
            "type": "condition",
            "description": condition.get("condition", "")
        })
    
    # Sort by date
    history.sort(key=lambda x: x["date"], reverse=True)
    
    return {
        "id": patient_id,
        "name": personal_info.get("name", ""),
        "age": personal_info.get("age", 0),
        "gender": personal_info.get("gender", ""),
        "blood_group": personal_info.get("blood_type", "N/A"),
        "allergies": [a["name"] for a in medical_info.get("allergies", [])],
        "chronic_conditions": [c["condition"] for c in medical_info.get("conditions", [])],
        "history": history,
        "prescriptions": [
            {
                "name": p.get("medication", ""),
                "is_active": p.get("status") == "active",
                "start_date": "2024-01-01",
                "end_date": p.get("refill_date", ""),
                "frequency": f"{p.get('dosage', 'N/A')}"
            }
            for p in prescriptions
        ]
    }

@router.put("/doctor/{doctor_id}/patients/{patient_id}/status")
def update_patient_status(doctor_id: str, patient_id: str, status: dict):
    patient_ids = doctor_patient_mapping.get(doctor_id, [])
    if patient_id not in patient_ids:
        raise HTTPException(status_code=403, detail="Access denied")
    
    # Update patient status in unified schema
    patient = get_patient_data(patient_id)
    if patient:
        patient["status"] = status
        try:
            requests.put(f"http://localhost:8000/api/patient/{patient_id}", json=patient)
        except:
            pass
    
    return {"message": "Patient status updated", "status": status}
