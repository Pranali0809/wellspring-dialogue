from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

router = APIRouter()

# In-memory storage for doctor notes
doctor_notes_db = {
    "doctor_1": {
        "patient_1": [
            {
                "note_id": "note_1",
                "date": "2024-03-10",
                "type": "initial",
                "note_text": "Patient presents with mild hypertension. Prescribed Lisinopril 10mg daily.",
                "labs": [
                    {
                        "lab_id": "lab_1",
                        "file_url": "/labs/blood_test_march.pdf",
                        "date": "2024-03-10"
                    }
                ]
            }
        ]
    }
}

class Lab(BaseModel):
    lab_id: Optional[str] = None
    file_url: str
    date: str

class ConsultationNote(BaseModel):
    note_id: Optional[str] = None
    date: str
    type: str  # "initial" or "follow_up"
    note_text: str
    labs: List[Lab] = []

@router.get("/doctor/{doctor_id}/patients/{patient_id}/notes")
def get_consultation_notes(doctor_id: str, patient_id: str):
    doctor_notes = doctor_notes_db.get(doctor_id, {})
    notes = doctor_notes.get(patient_id, [])
    return notes

@router.post("/doctor/{doctor_id}/patients/{patient_id}/notes")
def create_consultation_note(doctor_id: str, patient_id: str, note: ConsultationNote):
    if doctor_id not in doctor_notes_db:
        doctor_notes_db[doctor_id] = {}
    if patient_id not in doctor_notes_db[doctor_id]:
        doctor_notes_db[doctor_id][patient_id] = []
    
    # Generate note_id if not provided
    if not note.note_id:
        note.note_id = f"note_{len(doctor_notes_db[doctor_id][patient_id]) + 1}"
    
    # Generate lab_ids if not provided
    for lab in note.labs:
        if not lab.lab_id:
            lab.lab_id = f"lab_{datetime.now().timestamp()}"
    
    doctor_notes_db[doctor_id][patient_id].append(note.dict())
    return {"message": "Note created successfully", "note": note}

@router.put("/doctor/{doctor_id}/patients/{patient_id}/notes/{note_id}")
def update_consultation_note(doctor_id: str, patient_id: str, note_id: str, note: ConsultationNote):
    doctor_notes = doctor_notes_db.get(doctor_id, {})
    patient_notes = doctor_notes.get(patient_id, [])
    
    for i, n in enumerate(patient_notes):
        if n["note_id"] == note_id:
            note.note_id = note_id
            patient_notes[i] = note.dict()
            return {"message": "Note updated successfully", "note": note}
    
    raise HTTPException(status_code=404, detail="Note not found")

@router.delete("/doctor/{doctor_id}/patients/{patient_id}/notes/{note_id}")
def delete_consultation_note(doctor_id: str, patient_id: str, note_id: str):
    doctor_notes = doctor_notes_db.get(doctor_id, {})
    patient_notes = doctor_notes.get(patient_id, [])
    
    for i, n in enumerate(patient_notes):
        if n["note_id"] == note_id:
            patient_notes.pop(i)
            return {"message": "Note deleted successfully"}
    
    raise HTTPException(status_code=404, detail="Note not found")
