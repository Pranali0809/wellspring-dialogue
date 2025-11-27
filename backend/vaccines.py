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

def update_patient_data(patient_id: str, patient_data: dict):
    try:
        response = requests.put(f"http://localhost:8000/api/patient/{patient_id}", json=patient_data)
        return response.status_code == 200
    except:
        return False

# Legacy in-memory storage for fallback
vaccines_db = {
    "patient_1": [
        {
            "id": "1",
            "name": "COVID-19 Booster",
            "status": "due",
            "dueDate": "2024-03-15",
            "lastTaken": "2023-09-10",
            "location": "City Health Center",
            "canRetake": True
        },
        {
            "id": "2",
            "name": "Influenza",
            "status": "completed",
            "dueDate": "2025-02-01",
            "lastTaken": "2024-02-01",
            "location": "Community Clinic",
            "canRetake": True
        },
        {
            "id": "3",
            "name": "Tetanus",
            "status": "upcoming",
            "dueDate": "2024-06-20",
            "lastTaken": "2019-06-20",
            "location": "General Hospital",
            "canRetake": True
        },
        {
            "id": "4",
            "name": "Hepatitis B",
            "status": "completed",
            "dueDate": "2027-01-15",
            "lastTaken": "2022-01-15",
            "location": "Vaccination Center",
            "canRetake": True
        },
        {
            "id": "5",
            "name": "MMR (Measles, Mumps, Rubella)",
            "status": "completed",
            "dueDate": "N/A",
            "lastTaken": "1995-03-10",
            "location": "Pediatric Clinic",
            "canRetake": False
        }
    ]
}

class Vaccine(BaseModel):
    id: Optional[str] = None
    name: str
    status: str
    dueDate: str
    lastTaken: str
    location: str
    canRetake: bool

@router.get("/vaccines/{patient_id}")
def get_vaccines(patient_id: str):
    patient = get_patient_data(patient_id)
    if not patient:
        # Fallback to mock data
        vaccines = vaccines_db.get(patient_id, [])
        return {"vaccines": vaccines}
    
    # Return vaccines from unified schema
    vaccines = patient.get("vaccines", [])
    # Map to expected format
    mapped_vaccines = [
        {
            "id": v.get("id", ""),
            "name": v.get("name", ""),
            "status": v.get("status", "scheduled"),
            "dueDate": v.get("scheduled_for", ""),
            "lastTaken": v.get("completed_on", ""),
            "location": "Health Center",  # default
            "canRetake": v.get("status") != "completed"
        }
        for v in vaccines
    ]
    return {"vaccines": mapped_vaccines}

@router.post("/vaccines/{patient_id}")
def create_vaccine(patient_id: str, vaccine: Vaccine):
    if patient_id not in vaccines_db:
        vaccines_db[patient_id] = []
    
    if not vaccine.id:
        vaccine.id = str(len(vaccines_db[patient_id]) + 1)
    
    vaccines_db[patient_id].append(vaccine.dict())
    return {"message": "Vaccine created successfully", "vaccine": vaccine}

@router.put("/vaccines/{patient_id}/{vaccine_id}")
def update_vaccine(patient_id: str, vaccine_id: str, vaccine: Vaccine):
    if patient_id not in vaccines_db:
        raise HTTPException(status_code=404, detail="Patient not found")
    
    vaccines = vaccines_db[patient_id]
    for i, v in enumerate(vaccines):
        if v["id"] == vaccine_id:
            vaccine.id = vaccine_id
            vaccines[i] = vaccine.dict()
            return {"message": "Vaccine updated successfully", "vaccine": vaccine}
    
    raise HTTPException(status_code=404, detail="Vaccine not found")

@router.delete("/vaccines/{patient_id}/{vaccine_id}")
def delete_vaccine(patient_id: str, vaccine_id: str):
    if patient_id not in vaccines_db:
        raise HTTPException(status_code=404, detail="Patient not found")
    
    vaccines = vaccines_db[patient_id]
    vaccines_db[patient_id] = [v for v in vaccines if v["id"] != vaccine_id]
    
    return {"message": "Vaccine deleted successfully"}
