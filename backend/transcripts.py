# Hardcoded sample transcripts for testing and development

SAMPLE_DOCTOR_PATIENT_TRANSCRIPT = """Doctor: Good morning, Sarah. What brings you in today?

Patient: Hi, doctor. I've been feeling feverish and really tired since yesterday.

Doctor: I see. When did the fever start exactly?

Patient: It began last night around 8 PM. I felt chills and my temperature was about 101°F.

Doctor: Have you noticed any other symptoms—cough, sore throat, body aches?

Patient: Yes, I have mild body aches and a slight headache. No cough or sore throat.

Doctor: Did you take any medication for the fever?

Patient: I took one dose of paracetamol 500 mg around 10 PM.

Doctor: Did the fever reduce after taking it?

Patient: It did go down a bit, but came back by morning.

Doctor: Any nausea, vomiting, stomach upset, or difficulty breathing?

Patient: No vomiting. Just low appetite. Breathing is normal.

Doctor: Have you been exposed to anyone sick recently? Any travel?

Patient: One of my coworkers had a viral fever last week. No travel.

Doctor: Understood. Do you have any chronic conditions?

Patient: Yes, diabetes and mild hypertension. Both under control with medication.

Doctor: Any chest pain, severe headache, or lightheadedness?

Patient: No, none of those.

Doctor: Alright. Based on your symptoms, it sounds like a viral febrile illness, likely self-limiting. We'll confirm with basic tests if needed, and you should continue fever management and hydration.

Patient: Okay, thank you doctor."""

# Additional sample transcripts can be added here
SAMPLE_TRANSCRIPTS = {
    "fever_cold": SAMPLE_DOCTOR_PATIENT_TRANSCRIPT,
    "default": SAMPLE_DOCTOR_PATIENT_TRANSCRIPT,
}

def get_sample_transcript(key: str = "default") -> str:
    """Get a sample transcript by key. Returns default if key not found."""
    return SAMPLE_TRANSCRIPTS.get(key, SAMPLE_DOCTOR_PATIENT_TRANSCRIPT)
