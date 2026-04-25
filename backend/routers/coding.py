from fastapi import APIRouter, HTTPException
from services.groq_client import groq_client
from utils.groq_parser import safe_parse_groq_json
import json

router = APIRouter(prefix="/coding", tags=["coding"])

@router.post("/generate")
async def generate_challenge(data: dict):
    role = data.get("role", "Software Engineer")
    difficulty = data.get("difficulty", "Medium")
    
    system_prompt = """
    You are a Technical Interviewer. Generate a realistic coding challenge.
    Return ONLY a JSON object.
    
    Format:
    {
      "title": "Problem Title",
      "description": "Detailed problem description...",
      "constraints": ["constraint 1", "constraint 2"],
      "examples": [
        {"input": "...", "output": "...", "explanation": "..."}
      ],
      "starter_code": "function solution() {\n  // your code here\n}",
      "difficulty": "Easy/Medium/Hard"
    }
    """
    user_prompt = f"Role: {role}\nDifficulty: {difficulty}\nProvide a role-specific challenge."
    
    try:
        raw_json = await groq_client.get_json_completion(user_prompt, system_prompt)
        return safe_parse_groq_json(raw_json)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/evaluate")
async def evaluate_code(data: dict):
    problem = data.get("problem")
    code = data.get("code")
    role = data.get("role")
    
    system_prompt = """
    You are a Senior Architect. Evaluate the submitted code.
    Return ONLY a JSON object.
    
    Format:
    {
      "logic_score": <0-100>,
      "complexity_score": <0-100>,
      "style_score": <0-100>,
      "overall_score": <0-100>,
      "time_complexity": "O(...)",
      "space_complexity": "O(...)",
      "feedback": "...",
      "strengths": ["...", "..."],
      "improvements": ["...", "..."],
      "optimized_version": "Full optimized code here..."
    }
    """
    user_prompt = f"Problem: {json.dumps(problem)}\nRole: {role}\nCandidate Code:\n{code}"
    
    try:
        raw_json = await groq_client.get_json_completion(user_prompt, system_prompt)
        return safe_parse_groq_json(raw_json)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
