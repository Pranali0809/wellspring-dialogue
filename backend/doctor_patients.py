from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from personal_info import personal_info_db
from medical_history import medical_history_db
from prescriptions import prescriptions_db
from symptoms import symptoms_db

router = APIRouter()

# Doctor-patient mapping
doctor_patient_mapping = {
    "doctor_1": ["patient_1"]
}

# Patient status tracking (active/critical flags)
patient_status_db = {
    "patient_1": {
        "status": "active",
        "critical_flags": []
    }
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
        personal_info = personal_info_db.get(patient_id)
        if not personal_info:
            continue
        
        medical_history = medical_history_db.get(patient_id, {})
        patient_status = patient_status_db.get(patient_id, {"status": "active", "critical_flags": []})
        
        patients.append({
            "id": patient_id,
            "name": personal_info["name"],
            "age": personal_info["age"],
            "gender": personal_info["gender"],
            "blood_group": personal_info.get("bloodGroup", "N/A"),
            "allergies": personal_info.get("allergies", []),
            "chronic_conditions": medical_history.get("conditions", []),
            "last_visit": "2024-03-10",
            "next_appointment": "2024-03-15",
            "critical_flags": patient_status["critical_flags"],
            "avatar": personal_info.get("avatar", "/placeholder.svg"),
            "status": patient_status["status"]
        })
    
    return patients

@router.get("/doctor/{doctor_id}/patients/{patient_id}")
def get_patient_detail(doctor_id: str, patient_id: str):
    # Check if doctor has access to this patient
    patient_ids = doctor_patient_mapping.get(doctor_id, [])
    if patient_id not in patient_ids:
        raise HTTPException(status_code=403, detail="Access denied")
    
    personal_info = personal_info_db.get(patient_id)
    if not personal_info:
        raise HTTPException(status_code=404, detail="Patient not found")
    
    medical_history = medical_history_db.get(patient_id, {})
    prescriptions = prescriptions_db.get(patient_id, [])
    symptoms = symptoms_db.get(patient_id, [])
    
    # Build history timeline from symptoms and conditions
    history = []
    for symptom in symptoms:
        history.append({
            "date": symptom["date"],
            "type": "symptom",
            "description": symptom["symptom"]
        })
    
    for condition in medical_history.get("conditions", []):
        history.append({
            "date": condition.get("date", "2024-01-01"),
            "type": "condition",
            "description": condition["name"]
        })
    
    # Sort by date
    history.sort(key=lambda x: x["date"], reverse=True)
    
    return {
        "id": patient_id,
        "name": personal_info["name"],
        "age": personal_info["age"],
        "gender": personal_info["gender"],
        "blood_group": personal_info.get("bloodGroup", "N/A"),
        "allergies": personal_info.get("allergies", []),
        "chronic_conditions": [c["name"] for c in medical_history.get("conditions", [])],
        "history": history,
        "prescriptions": [
            {
                "name": p["medication"],
                "is_active": p["status"] == "active",
                "start_date": p.get("startDate", "2024-01-01"),
                "end_date": p.get("refillDate"),
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
    
    patient_status_db[patient_id] = status
    return {"message": "Patient status updated", "status": status}
