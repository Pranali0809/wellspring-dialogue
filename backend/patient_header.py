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

class PatientHeader(BaseModel):
    id: str
    name: str
    patientId: str
    bloodGroup: str
    allergies: List[str]
    avatar: str
    nextAppointment: str
    activePrescriptions: int

@router.get("/patient-header/{patient_id}")
def get_patient_header(patient_id: str):
    patient = get_patient_data(patient_id)
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    
    # Map unified schema to expected format
    personal_info = patient.get("personal_info", {})
    medical_info = patient.get("medical_info", {})
    prescriptions = patient.get("prescriptions", [])
    
    active_prescriptions = len([p for p in prescriptions if p.get("status") == "active"])
    
    return {
        "id": patient_id,
        "name": personal_info.get("name", ""),
        "patientId": patient_id.upper(),
        "bloodGroup": personal_info.get("blood_type", ""),
        "allergies": [a["name"] for a in medical_info.get("allergies", [])],
        "avatar": "/placeholder.svg",
        "nextAppointment": personal_info.get("next_appointment_id", ""),
        "activePrescriptions": active_prescriptions
    }

@router.put("/patient-header/{patient_id}")
def update_patient_header(patient_id: str, header: PatientHeader):
    patient_header_db[patient_id] = header.dict()
    return {"message": "Patient header updated successfully", "header": header}
