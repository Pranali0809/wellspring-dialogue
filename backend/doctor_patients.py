from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from firestore_client import db

router = APIRouter()

# Helper to get all patients for a doctor from Firestore
def get_doctor_patients_from_firestore(doctor_id: str):
    """Get all patients who have appointments or visits with this doctor"""

    try:
        patient_ids = set()
        
        # Get patient IDs from appointments
        # appointments_ref = db.collection("appointments").where("doctor_id", "==", doctor_id)
        # for appt in appointments_ref.stream():
        #     appt_data = appt.to_dict()
        #     if "patient_id" in appt_data:
        #         patient_ids.add(appt_data["patient_id"])
        
        # Get all patients and check for doctor_visits
        patients_ref = db.collection("patients")
        for patient_doc in patients_ref.stream():
            patient_data = patient_doc.to_dict()
            doctor_visits = patient_data.get("doctor_visits", [])
            for visit in doctor_visits:
                if visit.get("doctor_id") == doctor_id:
                    patient_ids.add(patient_doc.id)
                    break
        print("patient_ids in doc", patient_ids)
        return list(patient_ids)
    except Exception as e:
        print(f"Error getting doctor patients: {str(e)}")
        return []

# Helper to get patient from Firestore
def get_patient_data(patient_id: str):
    if db is None:
        return None
    
    try:
        doc_ref = db.collection("patients").document(patient_id)
        doc = doc_ref.get()
        
        if not doc.exists:
            return None
        
        patient_data = doc.to_dict()
        patient_data["patient_id"] = doc.id
        return patient_data
    except Exception as e:
        print(f"Error getting patient data: {str(e)}")
        return None

class PatientListItem(BaseModel):
    id: str
    name: str
    age: int
    gender: str
    blood_group: str
    allergies: List[str]
    chronic_conditions: List[str]
    last_visit: Optional[str] = None
    next_appointment: Optional[str] = None
    critical_flags: List[str]
    avatar: str
    status: str

class PatientDetail(BaseModel):
    id: str
    name: str
    age: int
    gender: str
    blood_group: str
    allergies: List[str]
    chronic_conditions: List[str]
    history: List[dict]
    prescriptions: List[dict]

@router.get("/doctor/{doctor_id}/patients")
def get_doctor_patients(doctor_id: str):
    """Get all patients for a doctor from appointments and visits"""
    patient_ids = get_doctor_patients_from_firestore(doctor_id)
    
    if not patient_ids:
        return []
    
    patients = []
    for patient_id in patient_ids:
        patient = get_patient_data(patient_id)
        if not patient:
            continue
        
        personal_info = patient.get("personal_info", {})
        medical_info = patient.get("medical_info", {})
        status_info = patient.get("status", {})
        visits = patient.get("doctor_visits", [])
        
        last_visit = visits[-1]["visit_date"] if visits else "N/A"
        
        patients.append({
            "id": patient_id,
            "name": personal_info.get("name", ""),
            "age": personal_info.get("age", 0),
            "gender": personal_info.get("gender", ""),
            "blood_group": personal_info.get("blood_type", "N/A"),
            "allergies": [a["name"] for a in medical_info.get("allergies", [])],
            "chronic_conditions": [c["condition"] for c in medical_info.get("conditions", [])],
            "last_visit": last_visit,
            "next_appointment": personal_info.get("next_appointment_id", ""),
            "critical_flags": [],
            "avatar": "/placeholder.svg",
            "status": status_info.get("patient_category", "normal")
        })
    
    return patients

# @router.get("/doctor/{doctor_id}/patients/{patient_id}")
# def get_patient_detail(doctor_id: str, patient_id: str):
#     """Get detailed patient view for doctor"""
#     # Check if doctor has access to this patient
#     patient_ids = get_doctor_patients_from_firestore(doctor_id)
#     if patient_id not in patient_ids:
#         raise HTTPException(status_code=403, detail="Access denied")
    
#     patient = get_patient_data(patient_id)
#     if not patient:
#         raise HTTPException(status_code=404, detail="Patient not found")
    
#     personal_info = patient.get("personal_info", {})
#     medical_info = patient.get("medical_info", {})
#     prescriptions = patient.get("prescriptions", [])
#     symptoms = patient.get("symptoms", [])
    
#     # Build history timeline from symptoms and conditions
#     history = []
#     for symptom in symptoms:
#         history.append({
#             "date": symptom.get("date", ""),
#             "type": "symptom",
#             "description": symptom.get("name", "")
#         })
    
#     for condition in medical_info.get("conditions", []):
#         history.append({
#             "date": condition.get("diagnosed_date", "2024-01-01"),
#             "type": "condition",
#             "description": condition.get("condition", "")
#         })
    
#     # Sort by date
#     history.sort(key=lambda x: x["date"], reverse=True)
    
#     return {
#         "id": patient_id,
#         "name": personal_info.get("name", ""),
#         "age": personal_info.get("age", 0),
#         "gender": personal_info.get("gender", ""),
#         "blood_group": personal_info.get("blood_type", "N/A"),
#         "allergies": [a["name"] for a in medical_info.get("allergies", [])],
#         "chronic_conditions": [c["condition"] for c in medical_info.get("conditions", [])],
#         "history": history,
#         "prescriptions": [
#             {
#                 "name": p.get("medication", ""),
#                 "is_active": p.get("status") == "active",
#                 "start_date": "2024-01-01",
#                 "end_date": p.get("refill_date", ""),
#                 "frequency": f"{p.get('dosage', 'N/A')}"
#             }
#             for p in prescriptions
#         ]
#     }

# @router.put("/doctor/{doctor_id}/patients/{patient_id}/status")
# def update_patient_status(doctor_id: str, patient_id: str, status: dict):
#     """Update patient status"""
#     patient_ids = get_doctor_patients_from_firestore(doctor_id)
#     if patient_id not in patient_ids:
#         raise HTTPException(status_code=403, detail="Access denied")
    
#     # Update patient status in Firestore
#     if db is None:
#         return {"message": "Patient status updated (mock)", "status": status}
    
#     try:
#         patient = get_patient_data(patient_id)
#         if patient:
#             patient["status"] = status
#             doc_ref = db.collection("patients").document(patient_id)
#             doc_ref.set(patient)
#         return {"message": "Patient status updated", "status": status}
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=f"Error updating status: {str(e)}")

@router.get("/doctor/{doctor_id}/patients/active")
def get_active_patients(doctor_id: str):
    """Return structured object with active + critical patients."""
    patient_ids = get_doctor_patients_from_firestore(doctor_id)
    
    active_list = []
    critical_list = []

    for patient_id in patient_ids:
        patient = get_patient_data(patient_id)
        if not patient:
            continue

        status_info = patient.get("status", {})
        category = status_info.get("patient_category", "normal")

        personal_info = patient.get("personal_info", {})
        medical_info = patient.get("medical_info", {})
        visits = patient.get("doctor_visits", [])
        last_visit = visits[-1]["visit_date"] if visits else "N/A"

        patient_obj = {
            "id": patient_id,
            "name": personal_info.get("name", ""),
            "age": personal_info.get("age", 0),
            "gender": personal_info.get("gender", ""),
            "blood_group": personal_info.get("blood_type", ""),
            "allergies": [a["name"] for a in medical_info.get("allergies", [])],
            "chronic_conditions": [c["condition"] for c in medical_info.get("conditions", [])],
            "last_visit": last_visit,
            "next_appointment": personal_info.get("next_appointment_id", ""),
            "avatar": "/placeholder.svg",
            "status": category
        }

        if category == "critical":
            critical_list.append(patient_obj)
        elif category == "active":
            active_list.append(patient_obj)

    return {
        "active_patients": active_list,
        "critical_patients": critical_list
    }
