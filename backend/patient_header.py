from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional

router = APIRouter()

# In-memory storage
patient_header_db = {
    "patient_1": {
        "id": "patient_1",
        "name": "Sarah Johnson",
        "patientId": "PT-2024-001",
        "bloodGroup": "O+",
        "allergies": ["Peanuts"],
        "avatar": "/placeholder.svg",
        "nextAppointment": "March 15, 2024",
        "activePrescriptions": 3
    }
}

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
    header = patient_header_db.get(patient_id)
    if not header:
        raise HTTPException(status_code=404, detail="Patient not found")
    return header

@router.put("/patient-header/{patient_id}")
def update_patient_header(patient_id: str, header: PatientHeader):
    patient_header_db[patient_id] = header.dict()
    return {"message": "Patient header updated successfully", "header": header}
