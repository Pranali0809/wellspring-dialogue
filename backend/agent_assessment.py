from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from firestore_client import db
from google.cloud import firestore
import sys
import os
import json

# Add agents directory to path
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'agents'))
from s_agent import SubjectiveAssessmentAgent

router = APIRouter()

# Store active agent sessions in memory
active_sessions = {}

class StartAgentRequest(BaseModel):
    pass

class AgentMessageRequest(BaseModel):
    agent_session_id: str
    message: str

class DoctorReviewRequest(BaseModel):
    audio_transcript: str
    ai_output: dict
    doctor_selected: dict

@router.post("/appointment/{appointment_id}/start-agent")
async def start_agent(appointment_id: str):
    """
    Start a new assessment agent session for an appointment.
    """
    try:
        print("Starting agent for appointment:", appointment_id)
        # Create new agent instance
        agent = SubjectiveAssessmentAgent()
        
        # Start the assessment
        first_message = agent.start_assessment()
        print("First message from agent:", first_message)
        # Generate session ID
        agent_session_id = f"{appointment_id}_{len(active_sessions)}"
        
        # Store agent in memory
        active_sessions[agent_session_id] = agent
        
        # Store session info in Firestore
        if db:
            appointment_ref = db.collection("appointments").document(appointment_id)
            print("appointment",appointment_ref)
            appointment_ref.update({
                "agent_session_id": agent_session_id,
                "pre_assessment": {
                    "status": "in_progress",
                    "started_at": firestore.SERVER_TIMESTAMP
                }
            })
        
        return {
            "agent_session_id": agent_session_id,
            "message": first_message
        }
    except Exception as e:
        print(f"Error starting agent: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/appointment/{appointment_id}/agent-message")
async def agent_message(appointment_id: str, request: AgentMessageRequest):
    """
    Send a message to the assessment agent and get response.
    """
    try:
        agent_session_id = request.agent_session_id
        
        # Get agent from memory
        if agent_session_id not in active_sessions:
            raise HTTPException(status_code=404, detail="Agent session not found")
        
        agent = active_sessions[agent_session_id]
        
        # Send message and get response
        response = agent.next_turn(request.message)
        
        # Check if response is a JSON string (final report)
        finished = False
        structured_report = None
        
        if response.strip().startswith("{"):
            try:
                structured_report = json.loads(response)
                finished = True
                
                # Save final report to Firestore
                if db:
                    appointment_ref = db.collection("appointments").document(appointment_id)
                    appointment_ref.update({
                        "pre_assessment": {
                            "status": "completed",
                            "completed_at": firestore.SERVER_TIMESTAMP,
                            "structured_report": structured_report
                        }
                    })
                
                # Clean up session
                del active_sessions[agent_session_id]
                
            except json.JSONDecodeError:
                # Not a valid JSON, continue conversation
                pass
        
        return {
            "message": response if not finished else "Assessment complete!",
            "finished": finished,
            "structured_report": structured_report
        }
        
    except Exception as e:
        print(f"Error processing agent message: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/appointment/{appointment_id}/upload-audio")
async def upload_audio(appointment_id: str):
    """
    Process uploaded audio file and generate diagnostic suggestions.
    This endpoint would integrate with Whisper for transcription and
    a doctor-side agent for generating suggestions.
    """
    try:
        # TODO: Implement audio transcription with Whisper
        # TODO: Retrieve pre-assessment structured report from Firestore
        # TODO: Pass both to doctor-side agent
        
        # Mock response for now
        mock_response = {
            "transcript": "Patient reports chest pain that started 2 days ago, describes it as sharp and intermittent, worse with deep breathing...",
            "suggested_questions": [
                "Have you experienced any fever or chills?",
                "Does the pain radiate to your arm or jaw?",
                "Have you had any recent injuries or trauma?",
                "Are you taking any new medications?"
            ],
            "possible_diagnosis": [
                "Costochondritis (inflammation of chest wall)",
                "Pleurisy (inflammation of lung lining)",
                "Gastroesophageal reflux disease (GERD)",
                "Musculoskeletal strain"
            ],
            "possible_medications": [
                "NSAIDs (Ibuprofen 400mg TID)",
                "Muscle relaxants (if musculoskeletal)",
                "Proton pump inhibitors (if GERD suspected)",
                "Pain management as needed"
            ],
            "notes_suggestions": "Patient presents with chest pain of 2 days duration. Pain is sharp, intermittent, and pleuritic in nature. No fever, no radiation. Physical exam pending. Consider chest X-ray to rule out pleurisy. Recommend NSAIDs and follow-up in 3-5 days if symptoms persist."
        }
        
        return mock_response
        
    except Exception as e:
        print(f"Error processing audio: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/appointment/{appointment_id}/doctor-review")
async def save_doctor_review(appointment_id: str, request: DoctorReviewRequest):
    """
    Save doctor's selections from AI suggestions to Firestore.
    """
    try:
        if db:
            appointment_ref = db.collection("appointments").document(appointment_id)
            appointment_ref.update({
                "doctor_review": {
                    "audio_transcript": request.audio_transcript,
                    "ai_output": request.ai_output,
                    "doctor_selected": request.doctor_selected,
                    "reviewed_at": firestore.SERVER_TIMESTAMP
                }
            })
        
        return {"message": "Doctor review saved successfully"}
        
    except Exception as e:
        print(f"Error saving doctor review: {e}")
        raise HTTPException(status_code=500, detail=str(e))
