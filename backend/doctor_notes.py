from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from firestore_client import db

router = APIRouter()

@router.get("/doctor/{doctor_id}/patients/{patient_id}/notes")
def get_notes(doctor_id: str, patient_id: str):
    """Get all doctor visits/notes for a patient from the patient's doctor_visits array"""
    if db is None:
        return []
    
    try:
        doc_ref = db.collection("patients").document(patient_id)
        doc = doc_ref.get()
        
        if not doc.exists:
            return []
        
        patient_data = doc.to_dict()
        doctor_visits = patient_data.get("doctor_visits", [])
        
        # Filter visits for this doctor and format as notes
        notes = []
        for visit in doctor_visits:
            if visit.get("doctor_id") == doctor_id:
                notes.append({
                    "note_id": visit.get("id", ""),
                    "date": visit.get("visit_date", ""),
                    "type": "follow_up",
                    "note_text": visit.get("doctor_notes", ""),
                    "labs": []  # Lab results would be stored separately
                })
        
        return notes
    except Exception as e:
        print(f"Error getting notes: {str(e)}")
        return []

@router.post("/doctor/{doctor_id}/patients/{patient_id}/notes")
def create_note(doctor_id: str, patient_id: str, note_data: dict):
    """Create a new doctor visit/note by updating patient's doctor_visits array"""
    if db is None:
        return {"message": "Note created successfully (mock)", "note": note_data}
    
    try:
        doc_ref = db.collection("patients").document(patient_id)
        doc = doc_ref.get()
        
        if not doc.exists:
            raise HTTPException(status_code=404, detail="Patient not found")
        
        patient_data = doc.to_dict()
        doctor_visits = patient_data.get("doctor_visits", [])
        
        # Create new visit entry
        new_visit = {
            "id": f"visit_{len(doctor_visits) + 1}",
            "visit_date": note_data.get("date", str(datetime.now().date())),
            "doctor_id": doctor_id,
            "chief_complaint": note_data.get("chief_complaint", ""),
            "symptoms_noted": note_data.get("symptoms_noted", []),
            "prescriptions_given": note_data.get("prescriptions_given", []),
            "doctor_notes": note_data.get("note_text", "")
        }
        
        doctor_visits.append(new_visit)
        patient_data["doctor_visits"] = doctor_visits
        
        doc_ref.set(patient_data)
        
        return {"message": "Note created successfully", "note": new_visit}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating note: {str(e)}")

@router.put("/doctor/{doctor_id}/patients/{patient_id}/notes/{note_id}")
def update_note(doctor_id: str, patient_id: str, note_id: str, note_data: dict):
    """Update an existing doctor visit/note in patient's doctor_visits array"""
    if db is None:
        return {"message": "Note updated successfully (mock)", "note": note_data}
    
    try:
        doc_ref = db.collection("patients").document(patient_id)
        doc = doc_ref.get()
        
        if not doc.exists:
            raise HTTPException(status_code=404, detail="Patient not found")
        
        patient_data = doc.to_dict()
        doctor_visits = patient_data.get("doctor_visits", [])
        
        # Find and update the visit
        for i, visit in enumerate(doctor_visits):
            if visit.get("id") == note_id and visit.get("doctor_id") == doctor_id:
                doctor_visits[i]["doctor_notes"] = note_data.get("note_text", visit.get("doctor_notes", ""))
                doctor_visits[i]["visit_date"] = note_data.get("date", visit.get("visit_date", ""))
                patient_data["doctor_visits"] = doctor_visits
                doc_ref.set(patient_data)
                return {"message": "Note updated successfully", "note": doctor_visits[i]}
        
        raise HTTPException(status_code=404, detail="Note not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating note: {str(e)}")

@router.delete("/doctor/{doctor_id}/patients/{patient_id}/notes/{note_id}")
def delete_note(doctor_id: str, patient_id: str, note_id: str):
    """Delete a doctor visit/note from patient's doctor_visits array"""
    if db is None:
        return {"message": "Note deleted successfully (mock)"}
    
    try:
        doc_ref = db.collection("patients").document(patient_id)
        doc = doc_ref.get()
        
        if not doc.exists:
            raise HTTPException(status_code=404, detail="Patient not found")
        
        patient_data = doc.to_dict()
        doctor_visits = patient_data.get("doctor_visits", [])
        
        # Find and remove the visit
        for i, visit in enumerate(doctor_visits):
            if visit.get("id") == note_id and visit.get("doctor_id") == doctor_id:
                doctor_visits.pop(i)
                patient_data["doctor_visits"] = doctor_visits
                doc_ref.set(patient_data)
                return {"message": "Note deleted successfully"}
        
        raise HTTPException(status_code=404, detail="Note not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error deleting note: {str(e)}")
