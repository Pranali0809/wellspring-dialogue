from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from doctor_patients import doctor_patient_mapping, patient_status_db

router = APIRouter()

# In-memory storage for appointments
appointments_db = {
    "doctor_1": {
        "today": {
            "total": 12,
            "completed": 8,
            "remaining": 4,
            "appointments": [
                {
                    "appointment_id": "apt_1",
                    "patient_id": "patient_1",
                    "time": "09:00 AM",
                    "status": "completed"
                },
                {
                    "appointment_id": "apt_2",
                    "patient_id": "patient_1",
                    "time": "02:00 PM",
                    "status": "pending"
                }
            ]
        }
    }
}

class Appointment(BaseModel):
    appointment_id: str
    patient_id: str
    time: str
    status: str  # completed / pending / cancelled

class TodaySchedule(BaseModel):
    total_appointments_today: int
    completed_appointments_today: int
    remaining_appointments_today: int
    appointments: List[Appointment]

class ActivePatient(BaseModel):
    patient_id: str
    name: str
    status: str  # active / critical-warning / critical-danger

@router.get("/doctor/{doctor_id}/appointments/today")
def get_today_appointments(doctor_id: str):
    schedule = appointments_db.get(doctor_id, {}).get("today", {
        "total": 0,
        "completed": 0,
        "remaining": 0,
        "appointments": []
    })
    
    return {
        "total_appointments_today": schedule.get("total", 0),
        "completed_appointments_today": schedule.get("completed", 0),
        "remaining_appointments_today": schedule.get("remaining", 0),
        "appointments": schedule.get("appointments", [])
    }

@router.get("/doctor/{doctor_id}/patients/active")
def get_active_patients(doctor_id: str):
    patient_ids = doctor_patient_mapping.get(doctor_id, [])
    
    active_patients = []
    critical_patients = []
    
    for patient_id in patient_ids:
        status_info = patient_status_db.get(patient_id, {"status": "active", "critical_flags": []})
        
        patient_data = {
            "patient_id": patient_id,
            "name": f"Patient {patient_id}",
            "status": status_info["status"]
        }
        
        if status_info["status"] in ["critical-warning", "critical-danger"]:
            critical_patients.append(patient_data)
        else:
            active_patients.append(patient_data)
    
    return {
        "active_patients": active_patients,
        "critical_patients": critical_patients
    }

@router.put("/doctor/{doctor_id}/appointments/today")
def update_today_schedule(doctor_id: str, schedule: TodaySchedule):
    if doctor_id not in appointments_db:
        appointments_db[doctor_id] = {}
    
    appointments_db[doctor_id]["today"] = {
        "total": schedule.total_appointments_today,
        "completed": schedule.completed_appointments_today,
        "remaining": schedule.remaining_appointments_today,
        "appointments": [apt.dict() for apt in schedule.appointments]
    }
    
    return {"message": "Schedule updated successfully"}
