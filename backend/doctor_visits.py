from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
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
doctor_visits_db = {
    "patient_1": [
        {
            "id": "1",
            "doctorName": "Dr. Michael Chen",
            "specialty": "Endocrinology",
            "date": "2024-02-15T10:00:00",
            "chiefComplaint": "Regular diabetes checkup",
            "notes": "Blood sugar levels stable. Continue current medication.",
            "hasAttachments": True,
            "symptoms": ["Fatigue", "Increased thirst"],
            "prescriptions": ["Metformin 500mg - Twice daily", "Regular exercise routine"],
            "doctorNotes": "Patient showing good adherence to medication. Blood glucose levels within target range. Continue monitoring and maintain healthy lifestyle.",
            "labsAssigned": ["HbA1c Test", "Fasting Blood Sugar", "Lipid Profile"],
            "uploadedLabs": ["Blood Test Results - Feb 2024.pdf", "HbA1c Report.pdf"]
        },
        {
            "id": "2",
            "doctorName": "Dr. Sarah Williams",
            "specialty": "Cardiology",
            "date": "2024-02-10T14:30:00",
            "chiefComplaint": "Blood pressure monitoring",
            "notes": "BP readings improved. Adjusting medication dosage.",
            "hasAttachments": False,
            "symptoms": ["Occasional headaches"],
            "prescriptions": ["Lisinopril 10mg - Once daily"],
            "doctorNotes": "Blood pressure showing improvement with current treatment. Patient compliant with medications.",
            "labsAssigned": ["ECG", "Blood Pressure Monitoring"],
            "uploadedLabs": []
        },
        {
            "id": "3",
            "doctorName": "Dr. James Rodriguez",
            "specialty": "General Medicine",
            "date": "2024-01-28T09:00:00",
            "chiefComplaint": "Annual physical examination",
            "notes": "Overall health good. Recommended lifestyle modifications.",
            "hasAttachments": True,
            "symptoms": ["None reported"],
            "prescriptions": ["Vitamin D supplement"],
            "doctorNotes": "Annual checkup completed. All vital signs normal. Recommended increased physical activity.",
            "labsAssigned": ["Complete Blood Count", "Metabolic Panel"],
            "uploadedLabs": ["Annual Physical Results.pdf"]
        }
    ]
}

doctors_db = [
    {"id": "1", "name": "Dr. Michael Chen", "specialty": "Endocrinology", "availability": "Mon, Wed, Fri"},
    {"id": "2", "name": "Dr. Sarah Williams", "specialty": "Cardiology", "availability": "Tue, Thu"},
    {"id": "3", "name": "Dr. James Rodriguez", "specialty": "General Medicine", "availability": "Mon-Fri"},
    {"id": "4", "name": "Dr. Emily Thompson", "specialty": "Dermatology", "availability": "Mon, Wed"},
    {"id": "5", "name": "Dr. David Lee", "specialty": "Orthopedics", "availability": "Tue, Thu, Fri"}
]

class Visit(BaseModel):
    id: Optional[str] = None
    doctorName: str
    specialty: str
    date: str
    chiefComplaint: str
    notes: str
    hasAttachments: bool = False
    symptoms: List[str] = []
    prescriptions: List[str] = []
    doctorNotes: str = ""
    labsAssigned: List[str] = []
    uploadedLabs: List[str] = []

class BookAppointment(BaseModel):
    doctorId: str
    date: str

@router.get("/doctor-visits/{patient_id}")
def get_doctor_visits(patient_id: str):
    patient = get_patient_data(patient_id)
    if not patient:
        # Fallback to mock data
        visits = doctor_visits_db.get(patient_id, [])
        return {"visits": visits, "doctors": doctors_db}
    
    # Return doctor visits from unified schema
    visits = patient.get("doctor_visits", [])
    # Map to expected format
    mapped_visits = [
        {
            "id": v.get("id", ""),
            "doctorName": v.get("doctor_id", ""),
            "specialty": "General Medicine",  # default
            "date": v.get("visit_date", ""),
            "chiefComplaint": v.get("chief_complaint", ""),
            "notes": v.get("doctor_notes", ""),
            "hasAttachments": False,
            "symptoms": [s.get("name", "") for s in v.get("symptoms_noted", [])],
            "prescriptions": [f"{p.get('medication', '')} {p.get('dosage', '')}" for p in v.get("prescriptions_given", [])],
            "doctorNotes": v.get("doctor_notes", ""),
            "labsAssigned": [],
            "uploadedLabs": []
        }
        for v in visits
    ]
    return {"visits": mapped_visits, "doctors": doctors_db}

@router.post("/doctor-visits/{patient_id}")
def create_doctor_visit(patient_id: str, visit: Visit):
    if patient_id not in doctor_visits_db:
        doctor_visits_db[patient_id] = []
    
    if not visit.id:
        visit.id = str(len(doctor_visits_db[patient_id]) + 1)
    
    doctor_visits_db[patient_id].append(visit.dict())
    return {"message": "Visit created successfully", "visit": visit}

@router.post("/doctor-visits/{patient_id}/book")
def book_appointment(patient_id: str, appointment: BookAppointment):
    if patient_id not in doctor_visits_db:
        doctor_visits_db[patient_id] = []
    
    doctor = next((d for d in doctors_db if d["id"] == appointment.doctorId), None)
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")
    
    new_visit = {
        "id": str(len(doctor_visits_db[patient_id]) + 1),
        "doctorName": doctor["name"],
        "specialty": doctor["specialty"],
        "date": appointment.date,
        "chiefComplaint": "Scheduled appointment",
        "notes": "Appointment booked",
        "hasAttachments": False,
        "symptoms": [],
        "prescriptions": [],
        "doctorNotes": "",
        "labsAssigned": [],
        "uploadedLabs": []
    }
    
    doctor_visits_db[patient_id].append(new_visit)
    return {"message": "Appointment booked successfully", "visit": new_visit}

@router.put("/doctor-visits/{patient_id}/{visit_id}")
def update_doctor_visit(patient_id: str, visit_id: str, visit: Visit):
    if patient_id not in doctor_visits_db:
        raise HTTPException(status_code=404, detail="Patient not found")
    
    visits = doctor_visits_db[patient_id]
    for i, v in enumerate(visits):
        if v["id"] == visit_id:
            visits[i] = visit.dict()
            return {"message": "Visit updated successfully", "visit": visit}
    
    raise HTTPException(status_code=404, detail="Visit not found")

@router.delete("/doctor-visits/{patient_id}/{visit_id}")
def delete_doctor_visit(patient_id: str, visit_id: str):
    if patient_id not in doctor_visits_db:
        raise HTTPException(status_code=404, detail="Patient not found")
    
    visits = doctor_visits_db[patient_id]
    doctor_visits_db[patient_id] = [v for v in visits if v["id"] != visit_id]
    
    return {"message": "Visit deleted successfully"}
