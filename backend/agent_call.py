import vertexai
from vertexai import agent_engines

vertexai.init(project="stellar-chariot-477813-u9", location="us-central1")
# agent = agent_engines.get(
#     "projects/694567547027/locations/us-central1/reasoningEngines/843065933760036864"
# )

#fastapi to call the agent 
from fastapi import FastAPI
from pydantic import BaseModel
from typing import List

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

    session=agent.create_session(user_id="patient123")
    session_id=session["id"]

    response = agent.stream_query(
        user_id="patient123",
        session_id=session_id,
        message=request.question,
    )

    final_response = ""

    for event in response:
        if event.get("author") == "ClinicalSynthesizerAgent":
            final_response = event.get("content", {}).get("parts", [])
    
    return QueryResponse(answer=" ".join(final_response))
