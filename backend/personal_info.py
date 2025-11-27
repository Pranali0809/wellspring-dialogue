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

class PersonalInfo(BaseModel):
    id: str
    name: str
    age: int
    gender: str
    phone: str
    email: str
    address: str
    avatar: str
    bloodGroup: str
    allergies: List[str]
    conditions: List[str]

@router.get("/personal-info/{patient_id}")
def get_personal_info(patient_id: str):
    patient = get_patient_data(patient_id)
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    
    # Map unified schema to expected format
    personal_info = patient.get("personal_info", {})
    medical_info = patient.get("medical_info", {})
    
    return {
        "id": patient_id,
        "name": personal_info.get("name", ""),
        "age": personal_info.get("age", 0),
        "gender": personal_info.get("gender", ""),
        "phone": personal_info.get("phone", ""),
        "email": personal_info.get("email", ""),
        "address": personal_info.get("address", ""),
        "avatar": "/placeholder.svg",
        "bloodGroup": personal_info.get("blood_type", ""),
        "allergies": [a["name"] for a in medical_info.get("allergies", [])],
        "conditions": [c["condition"] for c in medical_info.get("conditions", [])]
    }

@router.put("/personal-info/{patient_id}")
def update_personal_info(patient_id: str, info: PersonalInfo):
    personal_info_db[patient_id] = info.dict()
    return {"message": "Personal info updated successfully", "info": info}
