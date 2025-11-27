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

## Doctor Schema

Each doctor document in the `doctors` collection:

```json
{
  "doctor_id": "string",
  "name": "string",
  "certified_board": "string",
  "license_id": "string",
  "status": "active | inactive"
}
```

## Appointments Schema

Each appointment document in the `appointments` collection:

```json
{
  "appointment_id": "string",
  "patient_id": "string",
  "doctor_id": "string",
  "date": "string",
  "time": "string",
  "status": "completed | pending | cancelled",
  "type": "string"
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

### Doctor Data
- `GET /api/doctor/{doctor_id}` - Get doctor info
- `PUT /api/doctor/{doctor_id}` - Update doctor info
- `GET /api/doctor/{doctor_id}/patients` - Get all patients for a doctor
- `GET /api/doctor/{doctor_id}/patients/{patient_id}` - Get patient detail
- `GET /api/doctor/{doctor_id}/appointments` - Get all appointments
- `GET /api/doctor/{doctor_id}/appointments/today` - Get today's appointments
- `GET /api/doctor/{doctor_id}/patients/active` - Get active/critical patients

### Doctor Notes (uses patient.doctor_visits)
- `GET /api/doctor/{doctor_id}/patients/{patient_id}/notes` - Get notes
- `POST /api/doctor/{doctor_id}/patients/{patient_id}/notes` - Create note
- `PUT /api/doctor/{doctor_id}/patients/{patient_id}/notes/{note_id}` - Update note
- `DELETE /api/doctor/{doctor_id}/patients/{patient_id}/notes/{note_id}` - Delete note

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
5. **Doctor-Patient Linking**: Doctors access patients through appointments or doctor_visits in patient schema
6. **No Data Duplication**: Doctor notes are stored in patient.doctor_visits array

## Adding Sample Data

To populate Firestore with sample data, you can use the mock data as a template:

```python
from patients import mock_patients_db
from firestore_client import db

# Add sample patient
patient_data = mock_patients_db["patient_1"]
db.collection("patients").document("patient_1").set(patient_data)

# Add sample doctor
doctor_data = {
    "doctor_id": "doctor_1",
    "name": "Dr. Michael Chen",
    "certified_board": "American Board of Internal Medicine",
    "license_id": "MD-45892",
    "status": "active"
}
db.collection("doctors").document("doctor_1").set(doctor_data)

# Add sample appointment
appointment_data = {
    "appointment_id": "apt_001",
    "patient_id": "patient_1",
    "doctor_id": "doctor_1",
    "date": "2024-03-15",
    "time": "09:00",
    "status": "pending",
    "type": "checkup"
}
db.collection("appointments").document("apt_001").set(appointment_data)
```

## Architecture Notes

- All patient-related endpoints call the main patient endpoint internally
- Doctor endpoints query patients dynamically based on appointments and visits
- The unified schema ensures data consistency across all features
- Doctor notes are stored in patient.doctor_visits array (no separate collection)
- Frontend UI remains unchanged while backend uses single source of truth
- Three collections only: patients, doctors, appointments
