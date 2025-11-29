import vertexai
from vertexai import agent_engines
import json
import re

service_account = "serviceAccountKey.json"
vertexai.init(project="stellar-chariot-477813-u9", location="us-central1")

from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

class QueryRequest(BaseModel):
    question: str

class QueryResponse(BaseModel):
    answer: str

@app.post("/query", response_model=QueryResponse)
def query_agent(request: QueryRequest):
    agent = agent_engines.get(
        "projects/694567547027/locations/us-central1/reasoningEngines/843065933760036864"
    )

    session = agent.create_session(user_id="patient123")
    session_id = session["id"]

    response = agent.stream_query(
        user_id="patient123",
        session_id=session_id,
        message=request.question,
    )

    final_report = None

    # Iterate through events until we find ClinicalSynthesizerAgent
    for event in response:
        author = event.get("author")
        print(f"Event author: {author}")
        
        if author == "ClinicalSynthesizerAgent":
            # Try to get final_report from state_delta first
            actions = event.get("actions", {})
            state_delta = actions.get("state_delta", {})
            final_report = state_delta.get("final_report")
            
            # If not in state_delta, extract from content.parts
            if not final_report:
                content = event.get("content", {})
                parts = content.get("parts", [])
                for part in parts:
                    text = part.get("text", "")
                    if "```json" in text or "{" in text:
                        # Extract JSON from markdown code block
                        match = re.search(r'```json\n(.*?)\n```', text, re.DOTALL)
                        if match:
                            final_report = match.group(1)
                            break
            
            # Found what we need, exit loop
            if final_report:
                break

    # Parse and return
    if final_report:
        try:
            parsed_report = json.loads(final_report)
            return QueryResponse(answer=json.dumps(parsed_report, indent=2))
        except json.JSONDecodeError:
            return QueryResponse(answer=final_report)
    
    return QueryResponse(answer="No response found from ClinicalSynthesizerAgent")