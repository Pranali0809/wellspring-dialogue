from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional

router = APIRouter()

# In-memory storage
medical_history_db = {
    "patient_1": {
        "conditions": [
            {"id": "1", "name": "Type 2 Diabetes", "diagnosedDate": "2020-03-15"},
            {"id": "2", "name": "Hypertension", "diagnosedDate": "2019-08-22"},
            {"id": "3", "name": "High Cholesterol", "diagnosedDate": "2021-01-10"}
        ],
        "surgeries": [
            {"id": "1", "name": "Appendectomy", "date": "2015-06-20", "hospital": "City General Hospital"}
        ],
        "allergies": [
            {"id": "1", "name": "Peanuts", "severity": "Severe", "reaction": "Anaphylaxis"},
            {"id": "2", "name": "Penicillin", "severity": "Moderate", "reaction": "Rash"}
        ],
        "familyHistory": [
            {"id": "1", "condition": "Diabetes", "relative": "Father", "age": "Diagnosed at 55"},
            {"id": "2", "condition": "Heart Disease", "relative": "Mother", "age": "Diagnosed at 62"}
        ],
        "recentActivity": [
            {"id": "1", "type": "condition", "description": "Added Type 2 Diabetes", "date": "2024-02-15"},
            {"id": "2", "type": "allergy", "description": "Updated Peanuts allergy severity", "date": "2024-02-10"},
            {"id": "3", "type": "surgery", "description": "Added Appendectomy record", "date": "2024-01-28"}
        ]
    }
}

class HistoryItem(BaseModel):
    id: Optional[str] = None
    name: Optional[str] = None
    diagnosedDate: Optional[str] = None
    date: Optional[str] = None
    hospital: Optional[str] = None
    severity: Optional[str] = None
    reaction: Optional[str] = None
    condition: Optional[str] = None
    relative: Optional[str] = None
    age: Optional[str] = None

class MedicalHistory(BaseModel):
    conditions: List[HistoryItem] = []
    surgeries: List[HistoryItem] = []
    allergies: List[HistoryItem] = []
    familyHistory: List[HistoryItem] = []
    recentActivity: List[dict] = []

@router.get("/medical-history/{patient_id}")
def get_medical_history(patient_id: str):
    history = medical_history_db.get(patient_id, {
        "conditions": [],
        "surgeries": [],
        "allergies": [],
        "familyHistory": [],
        "recentActivity": []
    })
    return history

@router.put("/medical-history/{patient_id}")
def update_medical_history(patient_id: str, history: MedicalHistory):
    medical_history_db[patient_id] = history.dict()
    return {"message": "Medical history updated successfully", "history": history}

@router.post("/medical-history/{patient_id}/{category}")
def add_history_item(patient_id: str, category: str, item: HistoryItem):
    if patient_id not in medical_history_db:
        medical_history_db[patient_id] = {
            "conditions": [],
            "surgeries": [],
            "allergies": [],
            "familyHistory": [],
            "recentActivity": []
        }
    
    if category not in ["conditions", "surgeries", "allergies", "familyHistory"]:
        raise HTTPException(status_code=400, detail="Invalid category")
    
    if not item.id:
        item.id = str(len(medical_history_db[patient_id][category]) + 1)
    
    medical_history_db[patient_id][category].append(item.dict())
    return {"message": "Item added successfully", "item": item}

@router.delete("/medical-history/{patient_id}/{category}/{item_id}")
def delete_history_item(patient_id: str, category: str, item_id: str):
    if patient_id not in medical_history_db:
        raise HTTPException(status_code=404, detail="Patient not found")
    
    if category not in medical_history_db[patient_id]:
        raise HTTPException(status_code=404, detail="Category not found")
    
    items = medical_history_db[patient_id][category]
    medical_history_db[patient_id][category] = [item for item in items if item["id"] != item_id]
    
    return {"message": "Item deleted successfully"}
