from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
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

app = FastAPI(title="Patient Dashboard API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8080", "http://localhost:3000"],
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

@app.get("/")
def root():
    return {"message": "Patient Dashboard API is running"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
