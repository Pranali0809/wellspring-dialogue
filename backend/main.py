from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from firestore_client import db
from dotenv import load_dotenv
from datetime import datetime, date
load_dotenv()



from patients import router as patients_router
from doctor_visits import router as doctor_visits_router
from medical_history import router as medical_history_router
from patient_header import router as patient_header_router
from personal_info import router as personal_info_router
from prescriptions import router as prescriptions_router
from quick_actions import router as quick_actions_router
from symptoms import router as symptoms_router
from vaccines import router as vaccines_router
from doctor_info import router as doctor_info_router
from doctor_patients import router as doctor_patients_router
from doctor_notes import router as doctor_notes_router
from doctor_appointments import router as doctor_appointments_router
from agent_assessment import router as agent_assessment_router
from appointments import router as appointments_router
mock_appointments_db = [
    {
        "appointment_id": "apt_001",
        "doctor_id": "doctor_1",
        "patient_id": "patient_1",
        "date": str(date.today()),
        "time": "09:30",
        "status": "completed",
        "reason": "Routine checkup",
        "location": "Room 102"
    },
   
    
]


app = FastAPI(title="Patient Dashboard API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8080", "http://localhost:8000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register all routers
# Main Patient CRUD
app.include_router(patients_router, prefix="/api", tags=["Patients"])

# Patient APIs
app.include_router(doctor_visits_router, prefix="/api", tags=["Doctor Visits"])
app.include_router(medical_history_router, prefix="/api", tags=["Medical History"])
app.include_router(patient_header_router, prefix="/api", tags=["Patient Header"])
app.include_router(personal_info_router, prefix="/api", tags=["Personal Info"])
app.include_router(prescriptions_router, prefix="/api", tags=["Prescriptions"])
app.include_router(quick_actions_router, prefix="/api", tags=["Quick Actions"])
app.include_router(symptoms_router, prefix="/api", tags=["Symptoms"])
app.include_router(vaccines_router, prefix="/api", tags=["Vaccines"])

# Doctor APIs
app.include_router(doctor_info_router, prefix="/api", tags=["Doctor Info"])
app.include_router(doctor_patients_router, prefix="/api", tags=["Doctor Patients"])
app.include_router(doctor_notes_router, prefix="/api", tags=["Doctor Notes"])
app.include_router(doctor_appointments_router, prefix="/api", tags=["Doctor Appointments"])
app.include_router(agent_assessment_router, prefix="/api", tags=["Agent Assessment"])
app.include_router(appointments_router, prefix="/api", tags=["Appointments"])

@app.get("/")
def root():
    return {"message": "Patient Dashboard API is running"}

@app.get("/test-firestore")
def test_firestore():
    try:
        docs = db.collection("patients").limit(1).get()
        return {"status": "connected", "docs": [doc.id for doc in docs]}
    except Exception as e:
        return {"status": "failed", "error": str(e)}



@app.post("/api/seed-patient")
def seed_patient():
    print("🔥 Seeding patient data")
    """Insert a full mock patient object into Firestore."""
    patient_id = "patient_1"   # or any ID you want
    patient_data={
        "patient_id": "patient_1",
        "personal_info": {
            "name": "Sandnya Joshi",
            "age": 32,
            "gender": "Female",
            "blood_type": "O+",
            "phone": "+91 90123-24567",
            "email": "sandnya.joshi@email.com",
            "address": "123 Laxmi St, Mumbai, Maharashtra",
            "next_appointment_id": "apt_004",
            "active_prescription": "3 active"
        },
        "medical_info": {
            "conditions": [
                {
                    "condition": "Diabetes Type 2",
                    "diagnosed_date": "2020-01-15",
                    "diagnosed_by_doctor_id": "doctor_1"
                },
                {
                    "condition": "Hypertension",
                    "diagnosed_date": "2018-06-20",
                    "diagnosed_by_doctor_id": "doctor_3"
                },
                {
                    "condition": "Seasonal Asthma",
                    "diagnosed_date": "2015-09-10",
                    "diagnosed_by_doctor_id": "doctor_2"
                }
            ],
            "surgeries": [
                {
                    "name": "Appendectomy",
                    "date": "2019-02-11",
                    "hospital": "Mumbai General Hospital",
                    "doctor_id": "doctor_4"
                }
            ],
            "allergies": [
                {"name": "Peanuts", "severity": "Severe", "reaction": "Anaphylaxis"},
                {"name": "Penicillin", "severity": "Moderate", "reaction": "Rash"},
                {"name": "Dust Mites", "severity": "Mild", "reaction": "Sneezing"}
            ],
            "family_history": [
                {"condition": "Diabetes", "relative": "Father", "age": 62},
                {"condition": "Hypertension", "relative": "Mother", "age": 58},
                {"condition": "Asthma", "relative": "Sister", "age": 28}
            ]
        },
        "symptoms": [
            {
                "id": "sym_1",
                "name": "Headache",
                "date": "2024-03-10",
                "description": "Mild headache in the morning"
            },
            {
                "id": "sym_2",
                "name": "Fatigue",
                "date": "2024-03-14",
                "description": "Feeling tired throughout the day"
            },
            {
                "id": "sym_3",
                "name": "Shortness of breath",
                "date": "2024-03-18",
                "description": "Mild shortness of breath after climbing stairs"
            }
        ],
        "prescriptions": [
            {
                "id": "presc_1",
                "medication": "Metformin",
                "dosage": "500mg",
                "frequency": 2,
                "status": "active",
                "refill_date": "2024-04-01",
                "pills_daily_doses": 2,
                "adherence": {
                    "pills_remaining": 45,
                    "total_pills": 60
                }
            },
            {
                "id": "presc_2",
                "medication": "Amlodipine",
                "dosage": "5mg",
                "frequency": 1,
                "status": "active",
                "refill_date": "2024-04-10",
                "pills_daily_doses": 1,
                "adherence": {
                    "pills_remaining": 20,
                    "total_pills": 30
                }
            },
            {
                "id": "presc_3",
                "medication": "Albuterol Inhaler",
                "dosage": "2 puffs",
                "frequency": 1,
                "status": "active",
                "refill_date": "2024-04-20",
                "pills_daily_doses": 0,
                "adherence": {
                    "pills_remaining": 150,
                    "total_pills": 200
                }
            }
        ],
        "vaccines": [
            {
                "id": "vac_1",
                "name": "COVID-19 Booster",
                "status": "completed",
                "completed_on": "2024-01-15",
                "scheduled_for": ""
            },
            {
                "id": "vac_2",
                "name": "Influenza",
                "status": "completed",
                "completed_on": "2023-10-10",
                "scheduled_for": ""
            },
            {
                "id": "vac_3",
                "name": "Hepatitis B",
                "status": "scheduled",
                "completed_on": "",
                "scheduled_for": "2024-05-12"
            }
        ],
        "doctor_visits": [
            {
                "id": "visit_1",
                "visit_date": "2024-03-10",
                "doctor_id": "doctor_1",
                "chief_complaint": "Routine checkup",
                "symptoms_noted": [{"name": "Headache"}],
                "prescriptions_given": [
                    {
                        "medication": "Metformin",
                        "dosage": "500mg",
                        "frequency": 2,
                        "status": "active",
                        "refill_date": "2024-04-01"
                    }
                ],
                "doctor_notes": "Patient is doing well. Continue medication."
            },
            {
                "id": "visit_2",
                "visit_date": "2024-02-01",
                "doctor_id": "doctor_2",
                "chief_complaint": "Breathing discomfort",
                "symptoms_noted": [{"name": "Shortness of breath"}],
                "prescriptions_given": [
                    {
                        "medication": "Albuterol Inhaler",
                        "dosage": "2 puffs",
                        "frequency": 1,
                        "status": "active",
                        "refill_date": "2024-04-20"
                    }
                ],
                "doctor_notes": "Symptoms mild. Advised inhaler use and follow-up."
            }
        ],
        "recent_activity": [
            {
                "type": "prescription",
                "description": "Refilled Metformin",
                "date": "2024-03-01"
            },
            {
                "type": "doctor_visit",
                "description": "Consulted Dr. Smith for routine checkup",
                "date": "2024-03-10"
            },
            {
                "type": "symptom",
                "description": "Reported fatigue",
                "date": "2024-03-14"
            }
        ],
        "appointments": [
            {"appointment_id": "visit_1"},
        ],
        "status": {
            "patient_category": "active"
        }
    }
    try:
        db.collection("patients").document(patient_id).set(patient_data)
        return {"message": "Patient inserted successfully", "patient_id": patient_id}
    except Exception as e:
        return {"error": str(e)}


# Invoke-WebRequest -Uri "http://localhost:8000/api/seed-patient" -Method POST

@app.post("/api/seed-doctor")
def seed_doctor():
    print("🔥 Seeding doctor data")
    """Insert a full mock doctor object into Firestore."""
    doctor_id = "doctor_1"   # or any ID you want
    doctor_data={
        "doctor_id": "doctor_1",
        "name": "Dr. Nikhil Sharma",
        "certified_board": "Indian Board of Internal Medicine",
        "license_id": "MD-45892",
        "status": "active"
    }
     
    try:
        db.collection("doctor").document(doctor_id).set(doctor_data)
        return {"message": "doctor inserted successfully", "doctor": doctor_id}
    except Exception as e:
        return {"error": str(e)}

# Invoke-WebRequest -Uri "http://localhost:8000/api/seed-doctor" -Method POST

@app.post("/api/seed-appointments")
def seed_appointments():
    try:
        for appt in mock_appointments_db:
            db.collection("appointments")\
              .document(appt["appointment_id"])\
              .set(appt)

        return {"message": "Appointments seeded successfully!"}
    except Exception as e:
        return {"error": str(e)}

# Invoke-RestMethod -Uri "http://localhost:8000/api/seed-appointments" -Method POST

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
