#API_KEY = "AIzaSyBuosi-eGjBTGqgtFJrd400OPCj9McGHyg"
import google.generativeai as genai
import os
import json

# --- 1. Tool: NormalRangeChecker (Simulated Database) ---
def get_interpretation_and_risk(key, value):
    """Checks a single lab value against standard reference ranges."""
    ranges = {
        "HGB": (13.5, 17.5, "g/dL"),
        "WBC": (4.5, 11.0, "K/μL"),
        "GLUCOSE": (70, 100, "mg/dL"),
        "SYSTOLIC_BP": (90, 120, "mmHg")
    }
    
    key = key.upper()
    if key not in ranges:
        return "Not specified", "Neutral"
    
    min_val, max_val, unit = ranges[key]
    
    if value < min_val:
        risk = "Low"
    elif value > max_val:
        risk = "High"
    else:
        risk = "Normal"
        
    return f"{value} {unit} ({risk})", risk

# --- 2. O-Agent Implementation (Unchanged from last fix) ---
class ObjectiveAssessmentAgent:
    def __init__(self, api_key: str):
        genai.configure(api_key=api_key)
        self.model = genai.GenerativeModel('gemini-2.5-flash') 
        self.system_instruction = (
            "You are the O-Agent, a professional medical data extractor and synthesizer. "
            "Your core task is to take the attached lab report image and accompanying text vitals, "
            "extract the data, identify abnormal results, and synthesize a concise, structured "
            "Objective Assessment Report. Your final output MUST be only the JSON structure."
        )

    def process_objective_data(self, subjective_context: str, report_file_path: str, manual_vitals: dict):
        
        # 1. Upload the file (Tool: FileUploader)
        print(f"Uploading file: {report_file_path}...")
        uploaded_file = genai.upload_file(report_file_path) # NO 'file=' keyword

        # 2. Construct the single, unified prompt
        prompt_content = f"""
        {self.system_instruction}
        
        **Subjective Context (for Relevance):** {subjective_context}
        
        **Manual Vitals (for Integration):** {json.dumps(manual_vitals)}
        
        **Detailed Task:**
        1. From the attached lab report image, extract the numerical values for WBC, HGB, and Glucose.
        2. Combine these with the provided Manual Vitals (BP and Weight).
        3. Use clinical knowledge to classify each result (High/Low/Normal).
        4. Generate the final **OBJECTIVE ASSESSMENT REPORT** in the following JSON structure.
        
        **Final JSON Structure (ONLY output the JSON):**
        {{
            "vitals": {{ "BP": "{manual_vitals['BP']}", "Weight": "{manual_vitals['Weight']}" }},
            "lab_summary": [
                {{ "test": "WBC", "value": "15.5 K/μL (High)", "clinical_note": "Indicates acute inflammatory process." }},
                {{ "test": "HGB", "value": "11.2 g/dL (Low)", "clinical_note": "Consistent with mild anemia, correlates with reported fatigue." }},
                {{ "test": "GLUCOSE", "value": "98 mg/dL (Normal)", "clinical_note": "Within normal limits." }}
            ],
            "key_observations": ["Concise bulleted list of most critical objective findings."],
            "SOAP_O_Section": "A cohesive, professional narrative for the O-Section of a SOAP note, summarizing all data."
        }}
        """

        # 3. Call the model with the uploaded file object AND the text prompt
        response = self.model.generate_content(
            contents=[
                uploaded_file,
                prompt_content 
            ]
        )
        
        # 4. Clean up the uploaded file (Best Practice)
        genai.delete_file(uploaded_file.name)
        
        return response.text

# --- Simulation Execution (UPDATED) ---
if __name__ == "__main__":
    
    # 1. HARDCODED API KEY HERE for testing:
    API_KEY = "AIzaSyBuosi-eGjBTGqgtFJrd400OPCj9McGHyg" 
    
    # 2. Input from previous S-Agent run
    s_agent_context = "Patient reports persistent fatigue, increased thirst, and a recent fever that lasted two days."
    
    # 3. INTERACTIVE INPUT FOR VITALS (NEW)
    print("\n--- Requesting Manual Vitals ---")
    bp_input = input("Please enter Blood Pressure (e.g., 120/80 mmHg): ")
    weight_input = input("Please enter Weight (e.g., 75 kg): ")
    
    vitals_input = {
        "BP": bp_input,
        "Weight": weight_input
    }

    # 4. Initialize Agent
    o_agent = ObjectiveAssessmentAgent(api_key=API_KEY)

    try:
        print("\n--- Running O-Agent Process ---")
        
        # NOTE: Ensure 'blood_report.png' is in this directory!
        final_report_json = o_agent.process_objective_data(
            subjective_context=s_agent_context,
            report_file_path="blood_report.png",
            manual_vitals=vitals_input
        )

        print("\n" + "="*50)
        print("✅ OBJECTIVE ASSESSMENT (SOAP 'O' SECTION) GENERATED")
        print("="*50)
        
        # Attempt to pretty print the JSON output
        try:
            # Clean up the markdown wrapper from the model response
            report_data = json.loads(final_report_json.strip().replace("```json", "").replace("```", ""))
            print(json.dumps(report_data, indent=4))
        except json.JSONDecodeError:
            print("Failed to decode JSON. Raw Output (Check model output for formatting errors):")
            print(final_report_json)

    except FileNotFoundError:
        print("\n\n*** ERROR: 'blood_report.png' file not found. ***")
        print("Please create an image file of a sample blood report in this directory to run the test.")
    except Exception as e:
        print(f"\nAn error occurred during the API call: {e}")
