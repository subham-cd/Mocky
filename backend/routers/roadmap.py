from fastapi import APIRouter, HTTPException
from services.groq_client import groq_client
from utils.groq_parser import safe_parse_groq_json
import json

router = APIRouter(prefix="/roadmap", tags=["roadmap"])

@router.post("/generate")
async def generate_roadmap(data: dict):
    role = data.get("role", "Software Engineer")
    resume_text = data.get("resume_text", "Guest Profile")
    
    system_prompt = """
    You are a Strategic Career Architect. Generate a strictly ordered sequence of 10-12 granular milestones for a career path.
    Each milestone must represent a single, clear skill or concept.
    Order them logically: absolute basics -> core tools -> advanced concepts -> expert architecture.
    
    Return ONLY a JSON object:
    {
      "current_level": "Entry",
      "next_target": "Expert",
      "milestones": [
        {
          "title": "Skill Name", 
          "phase": "Foundational/Core/Expert", 
          "description": "1-sentence goal",
          "skills": ["related tool 1", "related tool 2"]
        }
      ]
    }
    """
    user_prompt = f"Role: {role}. Build a 12-step logical learning sequence from beginner to master."
    
    try:
        raw_json = await groq_client.get_json_completion(user_prompt, system_prompt)
        return safe_parse_groq_json(raw_json)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
