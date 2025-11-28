from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime, date
from firestore_client import db
from google.cloud.firestore import FieldFilter


router = APIRouter()


# Helper to get appointments from Firestore
def get_doctor_appointments_from_firestore(doctor_id: str, date_filter: str = None):
    """Get all appointments for a doctor, optionally filtered by date"""
    # if db is None:
    #     return mock_appointments_db.get(doctor_id, [])
    
    try:
        appointments_ref = db.collection("appointments").where(
    filter=FieldFilter("doctor_id", "==", doctor_id)
)

        if date_filter:
            appointments_ref = appointments_ref.where(
        filter=FieldFilter("date", "==", date_filter)
)

        
        appointments = []
        for appt_doc in appointments_ref.stream():
            appt_data = appt_doc.to_dict()
            appt_data["appointment_id"] = appt_doc.id
            appointments.append(appt_data)
        
        return appointments

    except Exception as e:
        print(f"Error getting appointments: {str(e)}")
        # return mock_appointments_db.get(doctor_id, [])

@router.get("/doctor/{doctor_id}/appointments/today")
def get_today_appointments(doctor_id: str):
    """Get all appointments for today for a doctor"""
    today = str(date.today())
    today_appointments = get_doctor_appointments_from_firestore(doctor_id, today)
    
    completed = len([apt for apt in today_appointments if apt.get("status") == "completed"])
    total = len(today_appointments)
    remaining = total - completed
    
    return {
        "total_appointments_today": total,
        "completed_appointments_today": completed,
        "remaining_appointments_today": remaining,
        "appointments": today_appointments
    }

# @router.get("/doctor/{doctor_id}/appointments")
# def get_all_appointments(doctor_id: str):
#     """Get all appointments for a doctor"""
#     appointments = get_doctor_appointments_from_firestore(doctor_id)
#     return appointments

# @router.get("/doctor/{doctor_id}/patients/active")
# def get_active_patients(doctor_id: str):
#     """Get active and critical patients for a doctor"""
#     if db is None:
#         return {
#             "active_patients": [],
#             "critical_patients": []
#         }
    
#     try:
#         # Get patient IDs for this doctor
#         from doctor_patients import get_doctor_patients_from_firestore, get_patient_data
#         patient_ids = get_doctor_patients_from_firestore(doctor_id)
        
#         active_patients = []
#         critical_patients = []
        
#         for patient_id in patient_ids:
#             patient = get_patient_data(patient_id)
#             if not patient:
#                 continue
            
#             personal_info = patient.get("personal_info", {})
#             status_info = patient.get("status", {})
#             category = status_info.get("patient_category", "normal")
            
#             patient_summary = {
#                 "patient_id": patient_id,
#                 "name": personal_info.get("name", ""),
#                 "status": category
#             }
            
#             if category == "active":
#                 active_patients.append(patient_summary)
#             elif category in ["critical-warning", "critical-danger"]:
#                 critical_patients.append(patient_summary)
        
#         return {
#             "active_patients": active_patients,
#             "critical_patients": critical_patients
#         }
#     except Exception as e:
#         print(f"Error getting active patients: {str(e)}")
#         return {
#             "active_patients": [],
#             "critical_patients": []
#         }
