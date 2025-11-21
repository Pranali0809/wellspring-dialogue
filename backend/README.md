# Patient Dashboard Backend

FastAPI backend for the Patient Dashboard application.

## Installation

```bash
cd backend
pip install -r requirements.txt
```

## Running the Server

```bash
python main.py
```

Or with uvicorn directly:

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at `http://localhost:8000`

API documentation will be available at `http://localhost:8000/docs`

## API Endpoints

### Doctor Visits
- `GET /api/doctor-visits/{patient_id}` - Get all visits
- `POST /api/doctor-visits/{patient_id}` - Create new visit
- `POST /api/doctor-visits/{patient_id}/book` - Book appointment
- `PUT /api/doctor-visits/{patient_id}/{visit_id}` - Update visit
- `DELETE /api/doctor-visits/{patient_id}/{visit_id}` - Delete visit

### Medical History
- `GET /api/medical-history/{patient_id}` - Get medical history
- `PUT /api/medical-history/{patient_id}` - Update medical history
- `POST /api/medical-history/{patient_id}/{category}` - Add history item
- `DELETE /api/medical-history/{patient_id}/{category}/{item_id}` - Delete item

### Patient Header
- `GET /api/patient-header/{patient_id}` - Get patient header info
- `PUT /api/patient-header/{patient_id}` - Update patient header

### Personal Info
- `GET /api/personal-info/{patient_id}` - Get personal info
- `PUT /api/personal-info/{patient_id}` - Update personal info

### Prescriptions
- `GET /api/prescriptions/{patient_id}` - Get all prescriptions
- `POST /api/prescriptions/{patient_id}` - Create prescription
- `PUT /api/prescriptions/{patient_id}/{prescription_id}` - Update prescription
- `DELETE /api/prescriptions/{patient_id}/{prescription_id}` - Delete prescription
- `POST /api/prescriptions/{patient_id}/reset-adherence` - Reset adherence to 0%

### Symptoms
- `GET /api/symptoms/{patient_id}` - Get all symptoms
- `POST /api/symptoms/{patient_id}` - Create symptom
- `PUT /api/symptoms/{patient_id}/{symptom_id}` - Update symptom
- `DELETE /api/symptoms/{patient_id}/{symptom_id}` - Delete symptom

### Vaccines
- `GET /api/vaccines/{patient_id}` - Get all vaccines
- `POST /api/vaccines/{patient_id}` - Create vaccine record
- `PUT /api/vaccines/{patient_id}/{vaccine_id}` - Update vaccine
- `DELETE /api/vaccines/{patient_id}/{vaccine_id}` - Delete vaccine

### Quick Actions
- `POST /api/quick-actions/execute` - Execute a quick action

## Data Storage

Currently using in-memory storage. All data is stored in Python dictionaries within each module and will be reset when the server restarts.

For production, replace with a proper database (PostgreSQL, MongoDB, etc.).
