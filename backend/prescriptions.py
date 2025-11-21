from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional, Dict

router = APIRouter()

# In-memory storage
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
    prescriptions = prescriptions_db.get(patient_id, [])
    return {"prescriptions": prescriptions}

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
