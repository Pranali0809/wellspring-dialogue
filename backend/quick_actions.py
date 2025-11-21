from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional

router = APIRouter()

class QuickAction(BaseModel):
    action: str
    payload: Optional[dict] = None

@router.post("/quick-actions/execute")
def execute_quick_action(action: QuickAction):
    # This endpoint can be used to log or track quick actions
    # For now, it just acknowledges the action
    return {
        "message": f"Quick action '{action.action}' executed successfully",
        "action": action.action,
        "payload": action.payload
    }
