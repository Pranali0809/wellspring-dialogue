from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional, Dict
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

def update_patient_data(patient_id: str, patient_data: dict):
    try:
        response = requests.put(f"http://localhost:8000/api/patient/{patient_id}", json=patient_data)
        return response.status_code == 200
    except:
        return False

# Legacy in-memory storage for fallback
prescriptions_db = {
    "patient_1": [
        {
            "id": "1",
            "medication": "Metformin",
            "dosage": "500mg",
            "frequency": "Twice daily",
            "status": "active",
            "refillDate": "2024-03-20",
            "adherence": 85,
            "pillsRemaining": 15,
            "totalPills": 60,
            "dailyDoses": 2
        },
        {
            "id": "2",
            "medication": "Lisinopril",
            "dosage": "10mg",
            "frequency": "Once daily",
            "status": "active",
            "refillDate": "2024-03-25",
            "adherence": 92,
            "pillsRemaining": 8,
            "totalPills": 30,
            "dailyDoses": 1
        },
        {
            "id": "3",
            "medication": "Atorvastatin",
            "dosage": "20mg",
            "frequency": "Once daily",
            "status": "upcoming",
            "refillDate": "2024-03-15",
            "adherence": 90,
            "pillsRemaining": 0,
            "totalPills": 30,
            "dailyDoses": 1
        }
    ]
}

dose_tracking_db: Dict[str, Dict[str, Dict[str, List[bool]]]] = {}

class Prescription(BaseModel):
    id: Optional[str] = None
    medication: str
    dosage: str
    frequency: str
    status: str
    refillDate: str
    adherence: int
    pillsRemaining: int
    totalPills: int
    dailyDoses: int

@router.get("/prescriptions/{patient_id}")
def get_prescriptions(patient_id: str):
    patient = get_patient_data(patient_id)
    if not patient:
        # Fallback to mock data
        prescriptions = prescriptions_db.get(patient_id, [])
        return {"prescriptions": prescriptions}
    
    # Return prescriptions from unified schema
    prescriptions = patient.get("prescriptions", [])
    # Map to expected format
    mapped_prescriptions = [
        {
            "id": p.get("id", ""),
            "medication": p.get("medication", ""),
            "dosage": p.get("dosage", ""),
            "frequency": str(p.get("frequency", 1)) + " times daily",
            "status": p.get("status", "active"),
            "refillDate": p.get("refill_date", ""),
            "adherence": (p.get("adherence", {}).get("pills_remaining", 0) * 100 // p.get("adherence", {}).get("total_pills", 1)) if p.get("adherence") and p.get("adherence", {}).get("total_pills", 0) > 0 else 0,
            "pillsRemaining": p.get("adherence", {}).get("pills_remaining", 0),
            "totalPills": p.get("adherence", {}).get("total_pills", 0),
            "dailyDoses": p.get("pills_daily_doses", 1)
        }
        for p in prescriptions
    ]
    return {"prescriptions": mapped_prescriptions}

@router.post("/prescriptions/{patient_id}")
def create_prescription(patient_id: str, prescription: Prescription):
    if patient_id not in prescriptions_db:
        prescriptions_db[patient_id] = []
    
    if not prescription.id:
        prescription.id = str(len(prescriptions_db[patient_id]) + 1)
    
    prescriptions_db[patient_id].append(prescription.dict())
    return {"message": "Prescription created successfully", "prescription": prescription}

@router.put("/prescriptions/{patient_id}/{prescription_id}")
def update_prescription(patient_id: str, prescription_id: str, prescription: Prescription):
    if patient_id not in prescriptions_db:
        raise HTTPException(status_code=404, detail="Patient not found")
    
    prescriptions = prescriptions_db[patient_id]
    for i, p in enumerate(prescriptions):
        if p["id"] == prescription_id:
            prescriptions[i] = prescription.dict()
            return {"message": "Prescription updated successfully", "prescription": prescription}
    
    raise HTTPException(status_code=404, detail="Prescription not found")

@router.delete("/prescriptions/{patient_id}/{prescription_id}")
def delete_prescription(patient_id: str, prescription_id: str):
    if patient_id not in prescriptions_db:
        raise HTTPException(status_code=404, detail="Patient not found")
    
    prescriptions = prescriptions_db[patient_id]
    prescriptions_db[patient_id] = [p for p in prescriptions if p["id"] != prescription_id]
    
    return {"message": "Prescription deleted successfully"}

@router.post("/prescriptions/{patient_id}/reset-adherence")
def reset_adherence(patient_id: str):
    if patient_id not in prescriptions_db:
        raise HTTPException(status_code=404, detail="Patient not found")
    
    for prescription in prescriptions_db[patient_id]:
        prescription["adherence"] = 0
    
    # Clear dose tracking
    if patient_id in dose_tracking_db:
        dose_tracking_db[patient_id] = {}
    
    return {"message": "Adherence reset successfully"}
