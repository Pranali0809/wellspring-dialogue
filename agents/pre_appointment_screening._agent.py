import asyncio
import json
from typing import List, Optional

from google.adk.agents import LlmAgent, Agent
from google.adk.runners import Runner
from google.adk.tools import Tool, ToolParameter
from google.genai import types
from pydantic import BaseModel, Field

# --- 1. Define the Structured Data Schema (PatientData) ---
# We use Pydantic to strictly define the data we must collect and store.

class PatientData(BaseModel):
    """Schema for all pre-appointment data collected from the patient."""
    name: str = Field(..., description="The patient's full name.")
    age: int = Field(..., description="The patient's age in years.")
    gender: str = Field(..., description="The patient's gender/sex.")
    height_cm: Optional[int] = Field(None, description="The patient's height in centimeters.")
    weight_kg: Optional[int] = Field(None, description="The patient's weight in kilograms.")
    
    # Chief Complaint & Symptoms
    reason_for_visit: str = Field(..., description="The main reason for the visit (free text).")
    symptom_duration_days: Optional[int] = Field(None, description="How long the symptoms have persisted, in days.")
    severity_1_to_10: Optional[int] = Field(None, description="Severity of symptoms on a scale of 1 to 10.")
    symptom_status: Optional[str] = Field(None, description="Are symptoms getting better, worse, or staying the same?")

    # Medical History
    known_conditions: List[str] = Field(default_factory=list, description="A list of existing medical conditions.")
    current_medications: List[str] = Field(default_factory=list, description="A list of current medications being taken.")
    known_allergies: List[str] = Field(default_factory=list, description="A list of known allergies (medication, food, environmental).")
    major_surgeries: List[str] = Field(default_factory=list, description="A list of past major surgeries.")
    family_history: List[str] = Field(default_factory=list, description="A list of significant family medical history.")

    # Lifestyle
    smoking_status: Optional[str] = Field(None, description="Details on smoking status (e.g., 'non-smoker', '20 pack-years').")
    alcohol_frequency: Optional[str] = Field(None, description="Frequency of alcohol consumption.")
    activity_level: Optional[str] = Field(None, description="Patient's self-rated physical activity level.")


# --- 2. Create the Custom Tool (EHR_Connector) ---

class EHRConnector(Tool):
    """
    A custom tool that simulates saving the final, structured patient data to the 
    Electronic Health Record (EHR) system and generating the doctor's summary.
    
    The LLM MUST call this tool ONLY when all required patient information has been collected.
    """
    name = "EHR_Connector"
    description = "Saves the complete PatientData object to the EHR system and generates a concise summary for the treating doctor. Call this tool ONLY once the entire questionnaire is complete."
    parameters = [
        ToolParameter(
            name="patient_data",
            description="The complete PatientData object containing all collected information.",
            type=PatientData,
            required=True
        )
    ]

    async def execute(self, parameters: dict) -> str:
        # Extract the structured data provided by the LLM
        patient_data_model = parameters["patient_data"]
        
        # --- START: Simulate EHR Saving and Specialty Mapping ---
        print("\n\n--- TOOL EXECUTION: EHR_Connector ---")
        print("Received and validated data model:")
        print(json.dumps(patient_data_model.model_dump(), indent=2))
        
        # 1. Simulate data saving to the database
        # In a real application, you would make an API call here:
        # success = await self._post_to_ehr_api(patient_data_model)
        
        # 2. Simulate Specialty Identification (using a simple keyword match for demonstration)
        reason = patient_data_model.reason_for_visit.lower()
        if any(term in reason for term in ["chest", "heart", "pain"]):
            specialty = "Cardiology"
        elif any(term in reason for term in ["skin", "rash", "acne"]):
            specialty = "Dermatology"
        else:
            specialty = "General Practice"
        
        print(f"-> Detected Specialty: {specialty}")
        print("-> Data securely saved to EHR/database.")
        # --- END: Simulate EHR Saving and Specialty Mapping ---

        # 3. Use the LLM to generate the structured summary for the doctor.
        # We reuse the LLM capability to format the final output.
        summary_prompt = f"""
        Generate a concise, structured pre-consultation summary for the doctor based on the following patient data.
        The format should be: Chief Complaint, HPI (History of Present Illness - severity/duration/status), PMH/Allergies/Meds, and Lifestyle risk factors.
        
        Patient Data: {patient_data_model.model_dump_json()}
        Detected Specialty: {specialty}
        """
        
        # We use a system message for the summary generation task to enforce formatting
        summary_system_instruction = (
            "You are a Clinical Data Summarization Engine. Your task is to generate a brief, "
            "bulleted, and professional summary for a medical professional. Do not add conversational text."
        )

        response = await self.model.generate_content(
            contents=summary_prompt,
            system_instruction=summary_system_instruction,
            # We enforce a simple text response here
            config=types.GenerateContentConfig(response_mime_type="text/plain")
        )
        
        summary = response.text
        
        print("\n--- Summary Generated ---")
        return f"Pre-Consultation Data Saved.\n\nSummary for Doctor ({specialty} Focus):\n{summary}\n\nAgent session complete."


# --- 3. Configure the Agent ---

# The System Instruction defines the persona, goals, and multi-step process.
SYSTEM_INSTRUCTION = """
You are "Medi-Agent," a secure, HIPAA-compliant, and professional pre-appointment screening assistant for 'Starlight Health Clinic.'
Your primary goal is to collect ALL necessary patient information by following the steps below.

***STEP-BY-STEP DATA COLLECTION FLOW (Strictly adhere to this order):***
1.  **Patient Basics:** Start by requesting the patient's full name, age, gender, and the main reason for their visit. Use the 'reason for visit' to contextually drive subsequent questions (e.g., if they mention a headache, ask about head-specific symptoms).
2.  **Physical Stats:** Ask for their current height (in cm) and weight (in kg).
3.  **Symptom Details:** Ask for the duration of symptoms (in days), the severity (scale 1-10), and if the symptoms are getting better, worse, or staying the same.
4.  **Medical History:** Systematically collect information on known medical conditions, current medications, known allergies (medications/food/environmental), past major surgeries, and significant family history. Ask about these one by one or in related groups.
5.  **Lifestyle:** Conclude by asking about their smoking status, alcohol consumption frequency, and self-rated physical activity level.

***RULES:***
-   You MUST maintain an empathetic, supportive, and professional tone throughout.
-   Do NOT use technical jargon.
-   You MUST use the Session State (the PatientData object) to track collected values and avoid re-asking questions.
-   If the patient expresses severe distress (e.g., "I can't breathe," "severe chest pain"), immediately instruct them to seek emergency medical attention (call 911 or local emergency services) and end the session by stating the emergency action taken.
-   You MUST call the 'EHR_Connector' tool ONLY when the entire PatientData schema is filled with valid information.
-   If a value is unknown, record it as 'N/A' or an empty list, but do not stop the flow.
"""

def create_pre_appointment_agent() -> Agent:
    """Creates and configures the ADK LlmAgent."""
    
    # Instantiate the custom tool
    ehr_connector_tool = EHRConnector(model="gemini-2.5-flash-preview-09-2025") # The tool needs an LLM to generate the final summary
    
    # Create the main LLM Agent
    agent = LlmAgent(
        model="gemini-2.5-flash-preview-09-2025",
        name="PreAppointmentAgent",
        system_instruction=SYSTEM_INSTRUCTION,
        tools=[ehr_connector_tool],
        # The Pydantic model is used as the underlying state for structured data collection
        state_schema=PatientData
    )
    return agent

# --- 4. Runnable Demonstration ---

async def main():
    print("--- Starlight Health Clinic: Medi-Agent Pre-Appointment Screen ---")
    print("Agent is initializing...")
    
    agent = create_pre_appointment_agent()
    
    # Use the ADK Runner to simulate an interactive chat session
    runner = Runner(agent)
    
    print("\nMedi-Agent is ready. Start your conversation. Type 'exit' to quit.")
    
    session = await runner.async_create_session()

    while True:
        try:
            user_input = input("Patient: ")
            if user_input.lower() in ['exit', 'quit']:
                print("\nMedi-Agent: Thank you for your time. Your data will be reviewed.")
                break

            response_stream = runner.async_stream_query(
                user_id="PATIENT_123", # Placeholder User ID
                session_id=session.id,
                message=user_input
            )

            print("Medi-Agent: ", end="")
            async for event in response_stream:
                if event.content and event.content.parts and event.content.parts[0].text:
                    print(event.content.parts[0].text, end="", flush=True)
            print() # Newline after agent response
            
        except Exception as e:
            print(f"\nAn error occurred: {e}")
            break

if __name__ == "__main__":
    # The ADK is designed for asynchronous operations, so we run the main function
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\nProcess interrupted. Goodbye!")