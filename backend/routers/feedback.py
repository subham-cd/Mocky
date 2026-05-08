from fastapi import APIRouter, HTTPException
import json
import os
from datetime import datetime

router = APIRouter(prefix="/feedback", tags=["feedback"])

FEEDBACK_FILE = "feedbacks.json"

def load_feedbacks():
    if not os.path.exists(FEEDBACK_FILE):
        return []
    try:
        with open(FEEDBACK_FILE, "r") as f:
            return json.load(f)
    except:
        return []

def save_feedbacks(feedbacks):
    with open(FEEDBACK_FILE, "w") as f:
        json.dump(feedbacks, f, indent=2)

@router.post("/")
async def submit_feedback(data: dict):
    module = data.get("module")
    rating = data.get("rating")
    comment = data.get("comment", "")
    session_id = data.get("session_id")
    
    if not module or not rating:
        raise HTTPException(status_code=400, detail="Module and rating are required")
        
    feedbacks = load_feedbacks()
    new_entry = {
        "id": len(feedbacks) + 1,
        "module": module,
        "rating": int(rating),
        "comment": comment,
        "session_id": session_id,
        "timestamp": datetime.now().isoformat()
    }
    feedbacks.append(new_entry)
    save_feedbacks(feedbacks)
    return {"success": True}

@router.get("/stats")
async def get_feedback_stats():
    feedbacks = load_feedbacks()
    if not feedbacks:
        return {"avg_ratings": {}}
        
    stats = {}
    modules = set(f["module"] for f in feedbacks)
    
    for mod in modules:
        mod_ratings = [f["rating"] for f in feedbacks if f["module"] == mod]
        stats[mod] = round(sum(mod_ratings) / len(mod_ratings), 1)
        
    return {"avg_ratings": stats}
