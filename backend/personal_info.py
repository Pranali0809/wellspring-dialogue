from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional

router = APIRouter()

# In-memory storage
personal_info_db = {
    "patient_1": {
        "id": "patient_1",
        "name": "Sarah Johnson",
        "age": 32,
        "gender": "Female",
        "phone": "+1 (555) 123-4567",
        "email": "sarah.johnson@email.com",
        "address": "123 Maple St, Boston, MA",
        "avatar": "/placeholder.svg",
        "bloodGroup": "O+",
        "allergies": ["Peanuts"],
        "conditions": ["Diabetes Type 2"]
    }
}

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
    info = personal_info_db.get(patient_id)
    if not info:
        raise HTTPException(status_code=404, detail="Patient not found")
    return info

@router.put("/personal-info/{patient_id}")
def update_personal_info(patient_id: str, info: PersonalInfo):
    personal_info_db[patient_id] = info.dict()
    return {"message": "Personal info updated successfully", "info": info}
