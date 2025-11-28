import google.generativeai as genai
import os
import json
from typing import List, Dict

# Configure your API Key
# os.environ["GOOGLE_API_KEY"] = "<>"
#genai.configure(api_key=os.environ["GOOGLE_API_KEY"])
#Replace '' with your actual key inside the quotes

genai.configure(api_key="AIzaSyBuosi-eGjBTGqgtFJrd400OPCj9McGHyg")

class SubjectiveAssessmentAgent:
    def __init__(self):
        self.model = genai.GenerativeModel('gemini-2.5-flash')
        self.chat_session = None
        self.collected_data = {}
        
        # The 7-10 Fixed Frames (The "Skeleton" of the interview)
        self.frames = [
            "Chief Complaint (Primary reason for visit)",
            "Onset and Duration (When did it start? How long?)",
            "Symptom Description (Severity 1-10, nature of pain, location)",
            "Progression (Getting better, worse, or staying same?)",
            "Associated Symptoms (Any other symptoms?)",
            "Aggravating/Relieving Factors (What makes it worse/better?)",
            "Self-medication/Actions (Have you taken anything?)",
            "Impact on Daily Activities (Can you work/walk/eat?)",
            "Relevant Medical History (Allergies, chronic conditions)",
            "Final Confirmation (Anything else to add?)"
        ]

        self.system_instruction = f"""
        You are S-Agent, a professional, empathetic Medical Pre-diagnosis Assistant.
        Your goal is to collect a History of Present Illness (HPI) based on these required frames: {self.frames}.
        
        RULES:
        1. Ask ONE question at a time. Do not overwhelm the user.
        2. Be adaptive. If the user mentions "fever" in the chief complaint, immediately ask about temperature/duration in the next turn.
        3. Maintain a "SOAP Note S-Section" mindset.
        4. If the user answers a future frame (e.g., mentions severity while discussing onset), do not ask about it again later.
        5. If a Red Flag appears (e.g., crushing chest pain, difficulty breathing), flag it internally but finish the assessment quickly.
        6. Tone: Professional, clear, concise, and empathetic.
        """

    def start_assessment(self):
        """Initializes the chat session."""
        self.chat_session = self.model.start_chat(
            history=[
                {"role": "user", "parts": [self.system_instruction]},
                {"role": "model", "parts": ["Understood. I am ready to conduct the assessment. Please introduce the patient."]}
            ]
        )
        # Trigger the first question
        response = self.chat_session.send_message(
            "Begin the assessment. Ask the first question regarding the Chief Complaint."
        )
        return response.text

    def next_turn(self, user_input: str):
        """
        The main loop.
        1. Feeds user input to model.
        2. Model decides the next best question based on the Frames.
        3. Checks if we have reached the end.
        """
        # We inject a steering prompt to ensure the model adheres to the frames
        steering_prompt = (
            f"User answer: '{user_input}'. "
            "Analyze what frames have been covered. "
            "If all frames are covered, type 'ASSESSMENT_COMPLETE'. "
            "Otherwise, ask the next most relevant question from the list, adapting to previous answers."
        )
        
        response = self.chat_session.send_message(steering_prompt)
        
        if "ASSESSMENT_COMPLETE" in response.text:
            return self.generate_final_report()
        else:
            return response.text

    def generate_final_report(self):
        """
        Tool: AssessmentBuilder
        Generates the structured JSON output.
        """
        print("\n--- Generating Structured Report ---\n")
        
        report_prompt = """
        The interview is complete. act as the 'AssessmentBuilder Tool'.
        Review the entire conversation history.
        Output a valid JSON object (and nothing else) with this schema:
        {
            "summary_of_complaints": "String",
            "symptom_timeline": "String",
            "key_risk_factors": ["List", "of", "risks"],
            "clinical_patterns": "String (e.g., 'Viral respiratory pattern')",
            "red_flags": ["List", "of", "warnings"],
            "SOAP_S_Section": "A cohesive paragraph suitable for medical records."
        }
        """
        
        response = self.chat_session.send_message(report_prompt)
        
        # Clean up code blocks if the model adds them
        text = response.text.replace("```json", "").replace("```", "")
        return text

# --- Simulation of the Agent ---
if __name__ == "__main__":
    agent = SubjectiveAssessmentAgent()
    
    # 1. Agent starts
    ai_response = agent.start_assessment()
    print(f"S-Agent: {ai_response}")

    # 2. Loop until report is generated
    while True:
        user_in = input("Patient: ")
        ai_response = agent.next_turn(user_in)
        
        # check if response is the final JSON report
        if ai_response.strip().startswith("{"):
            print(f"\nFINAL REPORT:\n{ai_response}")
            break
        else:
            print(f"S-Agent: {ai_response}")
