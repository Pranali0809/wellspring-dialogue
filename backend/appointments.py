from fastapi import APIRouter, HTTPException, UploadFile, File
from pydantic import BaseModel
from typing import List, Optional
from firestore_client import db
from google.cloud import firestore
from transcripts import get_sample_transcript
import uuid
import os
import tempfile

router = APIRouter()

class DiagnosisAgentOutput(BaseModel):
    possible_diagnoses: List[dict]
    suggested_prescriptions: List[dict]
    recommended_tests: List[dict]
    doctor_action_items: List[dict]

class ManualEntries(BaseModel):
    diagnoses: List[str] = []
    prescriptions: List[dict] = []
    tests: List[str] = []

class FinalizeVisitRequest(BaseModel):
    selected_diagnoses: List[str]
    selected_prescriptions: List[dict]
    selected_tests: List[str]
    doctor_notes: str
    manual_entries: Optional[ManualEntries] = None

@router.post("/appointments/{appointment_id}/upload-audio")
async def upload_audio(appointment_id: str, file: UploadFile = File(...)):
    """
    Upload audio file for appointment and return hardcoded transcript.
    Stores file reference and transcript in Firestore.
    """
    try:
        if not file.filename.endswith(('.mp3', '.wav', '.m4a', '.ogg', '.flac')):
            raise HTTPException(status_code=400, detail="Only .mp3, .wav, .m4a, .ogg, and .flac files are supported")
        
        # Get sample transcript
        transcript = get_sample_transcript("default")
        
        # Read and discard file (in production, you'd upload to Cloud Storage)
        contents = await file.read()
        
        # Mock file URL for now (would upload to Cloud Storage in production)
        file_url = f"gs://appointments-audio/{appointment_id}/{file.filename}"
        
        # Save to Firestore
        if db:
            print("appointment",appointment_id)
            appointment_ref = db.collection("appointments").document(appointment_id)
            print("appointment",appointment_ref)
            appointment_ref.set({
                "doctor_audio": {
                    "file_url": file_url,
                    "transcript": transcript,
                    "uploaded_at": firestore.SERVER_TIMESTAMP,
                    "filename": file.filename
                }
            }, merge=True)
        
        return {
            "file_url": file_url,
            "transcript": transcript
        }
        
    except Exception as e:
        print(f"Error uploading audio: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/appointments/{appointment_id}/run-diagnosis-agent")
async def run_diagnosis_agent(appointment_id: str):
    """
    Run diagnosis agent on appointment data.
    Collects patient data, pre-assessment, and audio transcript.
    Returns structured diagnosis suggestions.
    """
    try:
        if not db:
            raise HTTPException(status_code=500, detail="Database not available")
        
        # Get appointment data
        appointment_ref = db.collection("appointments").document(appointment_id)
        appointment_doc = appointment_ref.get()
        
        if not appointment_doc.exists:
            raise HTTPException(status_code=404, detail="Appointment not found")
        
        appointment_data = appointment_doc.to_dict()
        # print("Appointment data:", appointment_data)
        
        # Get patient data
        patient_id = appointment_data.get("patient_id")
        if not patient_id:
            raise HTTPException(status_code=400, detail="Patient ID not found in appointment")
        
        patient_ref = db.collection("patients").document(patient_id)
        patient_doc = patient_ref.get()
        patient_data = patient_doc.to_dict() if patient_doc.exists else {}
        print("Patient data:", patient_data)
        # Get pre-assessment data
        pre_assessment = appointment_data.get("pre_assessment", {})
        structured_report = pre_assessment.get("structured_report", {})
        print("Pre-assessment report:", structured_report)
        
        # Get audio transcript
        doctor_audio = appointment_data.get("doctor_audio", {})
        transcript = doctor_audio.get("transcript", "")
        
        # TODO: Implement actual diagnosis agent
        # For now, return mock structured output
        diagnosis_output = {
            "possible_diagnoses": [
                {"name": "Costochondritis (inflammation of chest wall)", "selected": False},
                {"name": "Pleurisy (inflammation of lung lining)", "selected": False},
                {"name": "Gastroesophageal reflux disease (GERD)", "selected": False},
                {"name": "Musculoskeletal strain", "selected": False}
            ],
            "suggested_prescriptions": [
                {"name": "Ibuprofen", "dosage": "400mg TID", "selected": False},
                {"name": "Omeprazole", "dosage": "20mg once daily", "selected": False},
                {"name": "Acetaminophen", "dosage": "500mg as needed", "selected": False}
            ],
            "recommended_tests": [
                {"name": "Chest X-Ray", "selected": False},
                {"name": "EKG", "selected": False},
                {"name": "Complete Blood Count", "selected": False}
            ],
            "doctor_action_items": [
                {"text": "Follow-up in 1 week if symptoms persist"},
                {"text": "Avoid strenuous physical activity for 3-5 days"},
                {"text": "Monitor for fever or worsening symptoms"}
            ]
        }
        
        # Save to Firestore
        appointment_ref.update({
            "diagnosis_agent_output": diagnosis_output,
            "diagnosis_generated_at": firestore.SERVER_TIMESTAMP
        })
        
        return diagnosis_output
        
    except Exception as e:
        print(f"Error running diagnosis agent: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/appointments/{appointment_id}/finalize-visit")
async def finalize_visit(appointment_id: str, request: FinalizeVisitRequest):
    """
    Finalize appointment and convert to visit.
    Copies data to patient's doctor_visits, prescriptions, etc.
    Marks appointment as completed.
    """
    try:
        if not db:
            raise HTTPException(status_code=500, detail="Database not available")
        
        # Get appointment data
        appointment_ref = db.collection("appointments").document(appointment_id)
        appointment_doc = appointment_ref.get()
        
        if not appointment_doc.exists:
            raise HTTPException(status_code=404, detail="Appointment not found")
        
        appointment_data = appointment_doc.to_dict()
        patient_id = appointment_data.get("patient_id")
        doctor_id = appointment_data.get("doctor_id")
        
        # Get patient document
        patient_ref = db.collection("patients").document(patient_id)
        patient_doc = patient_ref.get()
        
        if not patient_doc.exists:
            raise HTTPException(status_code=404, detail="Patient not found")
        
        patient_data = patient_doc.to_dict()
        
        # Combine selected and manual entries
        all_diagnoses = request.selected_diagnoses.copy()
        all_prescriptions = request.selected_prescriptions.copy()
        all_tests = request.selected_tests.copy()
        
        if request.manual_entries:
            all_diagnoses.extend(request.manual_entries.diagnoses)
            all_prescriptions.extend(request.manual_entries.prescriptions)
            all_tests.extend(request.manual_entries.tests)
        
        # Create visit object
        visit_id = str(uuid.uuid4())
        visit = {
            "id": visit_id,
            "appointment_id": appointment_id,
            "doctorId": doctor_id,
            "doctorName": appointment_data.get("doctor_name", "Unknown Doctor"),
            "specialty": appointment_data.get("doctor_specialty", "General"),
            "date": appointment_data.get("date"),
            "chiefComplaint": appointment_data.get("chief_complaint", ""),
            "diagnoses": all_diagnoses,
            "prescriptions": all_prescriptions,
            "tests_ordered": all_tests,
            "keyNotes": request.doctor_notes,
            "hasAttachments": False,
            "pre_assessment": appointment_data.get("pre_assessment", {}),
            "audio_transcript": appointment_data.get("doctor_audio", {}).get("transcript", ""),
            "manual_entries": request.manual_entries.dict() if request.manual_entries else {}
        }
        
        # Get existing doctor_visits or initialize
        doctor_visits = patient_data.get("doctor_visits", [])
        if not isinstance(doctor_visits, list):
            doctor_visits = []
        
        # Add new visit
        doctor_visits.append(visit)
        
        # Update patient prescriptions (including manual entries)
        prescriptions = patient_data.get("prescriptions", [])
        if not isinstance(prescriptions, list):
            prescriptions = []
        
        for prescription in all_prescriptions:
            prescriptions.append({
                "id": str(uuid.uuid4()),
                "name": prescription.get("name"),
                "dosage": prescription.get("dosage"),
                "frequency": "As prescribed",
                "startDate": appointment_data.get("date"),
                "status": "active",
                "adherenceRate": 0,
                "lastTaken": None
            })
        
        # Update recent activity
        recent_activity = patient_data.get("recent_activity", [])
        if not isinstance(recent_activity, list):
            recent_activity = []
        
        recent_activity.extend([
            {
                "id": str(uuid.uuid4()),
                "text": "Doctor completed visit",
                "date": appointment_data.get("date"),
                "type": "visit"
            },
            {
                "id": str(uuid.uuid4()),
                "text": f"Prescriptions updated ({len(all_prescriptions)} medications)",
                "date": appointment_data.get("date"),
                "type": "prescription"
            },
            {
                "id": str(uuid.uuid4()),
                "text": f"Diagnosis: {', '.join(all_diagnoses[:2])}{'...' if len(all_diagnoses) > 2 else ''}",
                "date": appointment_data.get("date"),
                "type": "diagnosis"
            }
        ])
        
        # Update medical conditions
        medical_info = patient_data.get("medical_info", {})
        if not isinstance(medical_info, dict):
            medical_info = {}
        
        conditions = medical_info.get("conditions", [])
        if not isinstance(conditions, list):
            conditions = []
        
        for diagnosis in all_diagnoses:
            if not any(c.get("condition") == diagnosis for c in conditions):
                conditions.append({
                    "condition": diagnosis,
                    "diagnosed_date": appointment_data.get("date"),
                    "status": "active"
                })
        
        medical_info["conditions"] = conditions
        
        # Update patient document
        patient_ref.update({
            "doctor_visits": doctor_visits,
            "prescriptions": prescriptions,
            "medical_info": medical_info,
            "recent_activity": recent_activity[-10:],  # Keep last 10 activities
            "total_visits": len(doctor_visits),
            "updated_at": firestore.SERVER_TIMESTAMP
        })
        
        # Mark appointment as completed
        appointment_ref.update({
            "status": "completed",
            "converted_to_visit": True,
            "finalized_at": firestore.SERVER_TIMESTAMP,
            "doctor_selections": {
                "diagnoses": all_diagnoses,
                "prescriptions": all_prescriptions,
                "tests": all_tests,
                "notes": request.doctor_notes,
                "manual_entries": request.manual_entries.dict() if request.manual_entries else {}
            }
        })
        
        return {
            "message": "Visit finalized successfully",
            "visit_id": visit_id
        }
        
    except Exception as e:
        print(f"Error finalizing visit: {e}")
        raise HTTPException(status_code=500, detail=str(e))
