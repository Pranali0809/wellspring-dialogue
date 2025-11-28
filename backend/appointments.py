from fastapi import APIRouter, HTTPException, UploadFile, File
from pydantic import BaseModel
from typing import List, Optional
from firestore_client import db
from google.cloud import firestore
import uuid

router = APIRouter()

class AudioUploadResponse(BaseModel):
    file_url: str
    transcript: str

class DiagnosisAgentOutput(BaseModel):
    possible_diagnoses: List[dict]
    suggested_prescriptions: List[dict]
    recommended_tests: List[dict]
    doctor_action_items: List[dict]

class FinalizeVisitRequest(BaseModel):
    selected_diagnoses: List[str]
    selected_prescriptions: List[dict]
    selected_tests: List[str]
    doctor_notes: str

@router.post("/appointments/{appointment_id}/upload-audio")
async def upload_audio(appointment_id: str, file: UploadFile = File(...)):
    """
    Upload audio file for appointment and generate transcript.
    Stores file in Firestore Storage and transcript in appointment document.
    """
    try:
        if not file.filename.endswith(('.mp3', '.wav', '.m4a')):
            raise HTTPException(status_code=400, detail="Only .mp3, .wav, and .m4a files are supported")
        
        # TODO: Implement actual file upload to Firestore Storage
        # TODO: Implement Whisper transcription
        
        # Mock response for now
        mock_transcript = "Patient reports chest pain that started 2 days ago, describes it as sharp and intermittent, worse with deep breathing. No fever, no radiation. History of hypertension."
        mock_file_url = f"gs://appointments-audio/{appointment_id}/{file.filename}"
        
        # Save to Firestore
        if db:
            appointment_ref = db.collection("appointments").document(appointment_id)
            appointment_ref.update({
                "doctor_audio": {
                    "file_url": mock_file_url,
                    "transcript": mock_transcript,
                    "uploaded_at": firestore.SERVER_TIMESTAMP
                }
            })
        
        return {
            "file_url": mock_file_url,
            "transcript": mock_transcript
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
        
        # Get patient data
        patient_id = appointment_data.get("patient_id")
        if not patient_id:
            raise HTTPException(status_code=400, detail="Patient ID not found in appointment")
        
        patient_ref = db.collection("patients").document(patient_id)
        patient_doc = patient_ref.get()
        patient_data = patient_doc.to_dict() if patient_doc.exists else {}
        
        # Get pre-assessment data
        pre_assessment = appointment_data.get("pre_assessment", {})
        structured_report = pre_assessment.get("structured_report", {})
        
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
            "diagnoses": request.selected_diagnoses,
            "prescriptions": request.selected_prescriptions,
            "tests_ordered": request.selected_tests,
            "keyNotes": request.doctor_notes,
            "hasAttachments": False,
            "pre_assessment": appointment_data.get("pre_assessment", {}),
            "audio_transcript": appointment_data.get("doctor_audio", {}).get("transcript", "")
        }
        
        # Get existing doctor_visits or initialize
        doctor_visits = patient_data.get("doctor_visits", [])
        if not isinstance(doctor_visits, list):
            doctor_visits = []
        
        # Add new visit
        doctor_visits.append(visit)
        
        # Update patient prescriptions
        prescriptions = patient_data.get("prescriptions", [])
        if not isinstance(prescriptions, list):
            prescriptions = []
        
        for prescription in request.selected_prescriptions:
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
        
        # Update patient document
        patient_ref.update({
            "doctor_visits": doctor_visits,
            "prescriptions": prescriptions,
            "total_visits": len(doctor_visits),
            "updated_at": firestore.SERVER_TIMESTAMP
        })
        
        # Mark appointment as completed
        appointment_ref.update({
            "status": "completed",
            "converted_to_visit": True,
            "finalized_at": firestore.SERVER_TIMESTAMP,
            "doctor_selections": {
                "diagnoses": request.selected_diagnoses,
                "prescriptions": request.selected_prescriptions,
                "tests": request.selected_tests,
                "notes": request.doctor_notes
            }
        })
        
        return {
            "message": "Visit finalized successfully",
            "visit_id": visit_id
        }
        
    except Exception as e:
        print(f"Error finalizing visit: {e}")
        raise HTTPException(status_code=500, detail=str(e))
