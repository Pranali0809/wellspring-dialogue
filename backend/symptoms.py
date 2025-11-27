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
symptoms_db = {
    "patient_1": [
        {
            "id": "1",
            "name": "Headache",
            "date": "2024-02-20T10:00:00",
            "severity": "moderate",
            "duration": "2 hours",
            "notes": "Mild throbbing pain"
        },
        {
            "id": "2",
            "name": "Fatigue",
            "date": "2024-02-18T14:30:00",
            "severity": "mild",
            "duration": "All day",
            "notes": "Feeling tired throughout the day"
        },
        {
            "id": "3",
            "name": "Nausea",
            "date": "2024-02-15T09:00:00",
            "severity": "severe",
            "duration": "3 hours",
            "notes": "Morning nausea, possibly related to medication"
        }
    ]
}

class Symptom(BaseModel):
    id: Optional[str] = None
    name: str
    date: str
    severity: str
    duration: str
    notes: Optional[str] = ""

@router.get("/symptoms/{patient_id}")
def get_symptoms(patient_id: str):
    patient = get_patient_data(patient_id)
    if not patient:
        # Fallback to mock data
        symptoms = symptoms_db.get(patient_id, [])
        return {"symptoms": symptoms}
    
    # Return symptoms from unified schema
    symptoms = patient.get("symptoms", [])
    # Map to expected format
    mapped_symptoms = [
        {
            "id": s.get("id", ""),
            "name": s.get("name", ""),
            "date": s.get("date", ""),
            "severity": "moderate",  # default
            "duration": "Unknown",  # default
            "notes": s.get("description", "")
        }
        for s in symptoms
    ]
    return {"symptoms": mapped_symptoms}

@router.post("/symptoms/{patient_id}")
def create_symptom(patient_id: str, symptom: Symptom):
    if patient_id not in symptoms_db:
        symptoms_db[patient_id] = []
    
    if not symptom.id:
        symptom.id = str(len(symptoms_db[patient_id]) + 1)
    
    symptoms_db[patient_id].append(symptom.dict())
    # Sort by date
    symptoms_db[patient_id].sort(key=lambda x: x["date"], reverse=True)
    
    return {"message": "Symptom created successfully", "symptom": symptom}

@router.put("/symptoms/{patient_id}/{symptom_id}")
def update_symptom(patient_id: str, symptom_id: str, symptom: Symptom):
    if patient_id not in symptoms_db:
        raise HTTPException(status_code=404, detail="Patient not found")
    
    symptoms = symptoms_db[patient_id]
    for i, s in enumerate(symptoms):
        if s["id"] == symptom_id:
            symptom.id = symptom_id
            symptoms[i] = symptom.dict()
            return {"message": "Symptom updated successfully", "symptom": symptom}
    
    raise HTTPException(status_code=404, detail="Symptom not found")

@router.delete("/symptoms/{patient_id}/{symptom_id}")
def delete_symptom(patient_id: str, symptom_id: str):
    if patient_id not in symptoms_db:
        raise HTTPException(status_code=404, detail="Patient not found")
    
    symptoms = symptoms_db[patient_id]
    symptoms_db[patient_id] = [s for s in symptoms if s["id"] != symptom_id]
    
    return {"message": "Symptom deleted successfully"}
