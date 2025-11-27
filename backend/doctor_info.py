from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional

router = APIRouter()

# In-memory storage for doctor profiles
doctors_db = {
    "doctor_1": {
        "id": "doctor_1",
        "name": "Dr. Michael Chen",
        "certified_board": "American Board of Internal Medicine",
        "license_id": "MD-45892",
        "status": "active"
    }
}

class DoctorInfo(BaseModel):
    id: str
    name: str
    certified_board: str
    license_id: str
    status: str

@router.get("/doctor/{doctor_id}")
def get_doctor_info(doctor_id: str):
    doctor = doctors_db.get(doctor_id)
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")
    return doctor

@router.put("/doctor/{doctor_id}")
def update_doctor_info(doctor_id: str, doctor: DoctorInfo):
    doctors_db[doctor_id] = doctor.dict()
    return {"message": "Doctor info updated successfully", "doctor": doctor}
