from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from firestore_client import db
from datetime import datetime

router = APIRouter()

# Mock data as fallback
mock_doctors_db = {
    "doctor_1": {
        "doctor_id": "doctor_1",
        "name": "Dr. Michael Chen",
        "certified_board": "American Board of Internal Medicine",
        "license_id": "MD-45892",
        "status": "active"
    }
}

class DoctorInfo(BaseModel):
    doctor_id: str
    name: str
    certified_board: str
    license_id: str
    status: str

@router.get("/doctor/{doctor_id}")
def get_doctor_info(doctor_id: str):
    """Fetch doctor info from Firestore doctors collection"""
    if db is None:
        doctor = mock_doctors_db.get(doctor_id)
        if not doctor:
            raise HTTPException(status_code=404, detail="Doctor not found")
        return doctor
    
    try:
        doc_ref = db.collection("doctors").document(doctor_id)
        doc = doc_ref.get()
        
        if not doc.exists:
            doctor = mock_doctors_db.get(doctor_id)
            if not doctor:
                raise HTTPException(status_code=404, detail="Doctor not found")
            return doctor
        
        doctor_data = doc.to_dict()
        doctor_data["doctor_id"] = doc.id
        return doctor_data
    except Exception as e:
        doctor = mock_doctors_db.get(doctor_id)
        if not doctor:
            raise HTTPException(status_code=404, detail=f"Doctor not found: {str(e)}")
        return doctor

@router.put("/doctor/{doctor_id}")
def update_doctor_info(doctor_id: str, doctor: DoctorInfo):
    """Update doctor info in Firestore"""
    if db is None:
        doctor_dict = doctor.dict()
        mock_doctors_db[doctor_id] = doctor_dict
        return {"message": "Doctor info updated successfully (mock)", "doctor": doctor_dict}
    
    try:
        doc_ref = db.collection("doctors").document(doctor_id)
        doctor_dict = doctor.dict()
        doc_ref.set(doctor_dict)
        return {"message": "Doctor info updated successfully", "doctor": doctor_dict}
    except Exception as e:
        doctor_dict = doctor.dict()
        mock_doctors_db[doctor_id] = doctor_dict
        return {"message": f"Doctor updated in mock storage: {str(e)}", "doctor": doctor_dict}
