# Firestore Integration Guide

## Overview

This backend uses Google Firestore as the database for patient, doctor, and appointment data. The system has been designed to work with or without Firestore - it will automatically fall back to in-memory mock data if Firestore is not configured.

## Firestore Collections

The application uses three collections:

1. **patients** - Stores all patient information with unified schema
2. **doctors** - Stores doctor profiles and schedules
3. **appointments** - Stores appointment scheduling data

## Patient Schema

Each patient document in the `patients` collection follows this exact structure:

```json
{
  "patient_id": "string",
  "personal_info": {
    "name": "string",
    "age": 0,
    "gender": "string",
    "blood_type": "string",
    "phone": "string",
    "email": "string",
    "address": "string",
    "next_appointment_id": "string",
    "active_prescription": "string"
  },
  "medical_info": {
    "conditions": [...],
    "surgeries": [...],
    "allergies": [...],
    "family_history": [...]
  },
  "symptoms": [...],
  "prescriptions": [...],
  "vaccines": [...],
  "doctor_visits": [...],
  "recent_activity": [...],
  "appointments": [...],
  "status": {
    "patient_category": "normal | active | critical-warning | critical-danger"
  }
}
```

## Setup Instructions

### Option 1: With Firestore (Production)

1. Create a Firebase project at https://console.firebase.google.com
2. Enable Firestore Database in your project
3. Generate a service account key:
   - Go to Project Settings > Service Accounts
   - Click "Generate New Private Key"
   - Save as `serviceAccountKey.json` in the `backend/` folder
4. Set environment variable (optional):
   ```bash
   export GOOGLE_APPLICATION_CREDENTIALS="path/to/serviceAccountKey.json"
   ```

### Option 2: Without Firestore (Development)

The backend will automatically use in-memory mock data if Firestore is not configured. This is perfect for:
- Local development
- Testing
- Demos without cloud dependencies

## Running the Backend

```bash
cd backend
pip install -r requirements.txt
python main.py
```

The API will be available at `http://localhost:8000`

## Main Endpoints

### Patient Data
- `GET /api/patients` - Get all patients
- `GET /api/patient/{patient_id}` - Get single patient (unified schema)
- `PUT /api/patient/{patient_id}` - Update patient (unified schema)

### Legacy Compatibility Endpoints
These endpoints fetch from the unified patient schema but return data in the format expected by the existing frontend:

- `GET /api/personal-info/{patient_id}`
- `GET /api/patient-header/{patient_id}`
- `GET /api/symptoms/{patient_id}`
- `GET /api/prescriptions/{patient_id}`
- `GET /api/vaccines/{patient_id}`
- `GET /api/medical-history/{patient_id}`
- `GET /api/doctor-visits/{patient_id}`

All other CRUD operations (POST, PUT, DELETE) are also supported.

## How It Works

1. **Unified Schema**: All patient data is stored in a single document with nested objects
2. **Backward Compatibility**: Legacy endpoints map the unified schema to their expected format
3. **Automatic Fallback**: If Firestore is unavailable, mock data is used automatically
4. **Single Source of Truth**: The `GET /api/patient/{patient_id}` endpoint is the primary data source

## Adding Sample Data

To populate Firestore with sample data, you can use the mock data as a template:

```python
from patients import mock_patients_db
from firestore_client import db

# Add sample patient
patient_data = mock_patients_db["patient_1"]
db.collection("patients").document("patient_1").set(patient_data)
```

## Architecture Notes

- All patient-related endpoints call the main patient endpoint internally
- Doctor endpoints share patient data (no duplication)
- The unified schema ensures data consistency across all features
- Frontend UI remains unchanged while backend uses single source of truth
